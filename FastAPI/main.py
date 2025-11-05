import os
import json
import base64
from io import BytesIO
from tempfile import NamedTemporaryFile
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from gtts import gTTS
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# Allow local dev clients
origins = [
    os.getenv("FRONTEND_URL", "http://localhost:5173"),
    "http://localhost:3000",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure Groq (LLM + STT via Whisper)
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
groq_client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None

# LLM model choices (fast, free tier friendly)
GROQ_LLM_MODEL = os.getenv("GROQ_LLM_MODEL", "llama-3.1-8b-instant")
# STT model (Whisper)
GROQ_STT_MODEL = os.getenv("GROQ_STT_MODEL", "whisper-large-v3")

@app.websocket("/ws/interview")
async def interview_socket(websocket: WebSocket):
    await websocket.accept()
    print("✅ Client connected")

    # Buffer audio until client signals end of segment
    audio_buffer = bytearray()

    try:
        while True:
            message = await websocket.receive()
            if "bytes" in message and message["bytes"] is not None:
                chunk = message["bytes"]
                audio_buffer.extend(chunk)
                continue

            if "text" in message and message["text"] is not None:
                txt = message["text"]
                try:
                    obj = json.loads(txt)
                    msg_type = obj.get("type", "")
                except Exception:
                    msg_type = txt.strip().lower()

                if msg_type in ("segment_end", "flush"):
                    # Process current buffered audio with Groq STT
                    transcript = ""
                    if groq_client and len(audio_buffer) > 0:
                        try:
                            # Write to a real temp file for maximal compatibility
                            with NamedTemporaryFile(delete=False, suffix=".webm") as tmp:
                                tmp.write(bytes(audio_buffer))
                                tmp_path = tmp.name

                            # Pass a real file handle to Groq STT
                            with open(tmp_path, "rb") as f:
                                stt = groq_client.audio.transcriptions.create(
                                    model=GROQ_STT_MODEL,
                                    file=f,
                                    # language="en"  # optional
                                )
                            # Clean up temp file
                            try:
                                os.remove(tmp_path)
                            except Exception:
                                pass
                            # SDK returns object with 'text'
                            transcript = (getattr(stt, "text", None) or "").strip()
                        except Exception as e:
                            print("[Groq STT] error:", e)
                            transcript = ""

                    if not transcript:
                        transcript = "(couldn't transcribe)"

                    # Groq LLM for interviewer reply
                    reply_text = ""
                    try:
                        if groq_client:
                            messages = [
                                {"role": "system", "content": (
                                    "You are a concise technical interviewer. Ask one follow-up question "
                                    "or provide brief feedback in under 2 sentences."
                                )},
                                {"role": "user", "content": transcript},
                            ]
                            llm = groq_client.chat.completions.create(
                                model=GROQ_LLM_MODEL,
                                messages=messages,
                                temperature=0.6,
                                max_tokens=120,
                            )
                            reply_text = (llm.choices[0].message.content or "").strip()
                        else:
                            reply_text = "Please configure GROQ_API_KEY on the server."
                    except Exception as e:
                        print("[Groq LLM] error:", e)
                        reply_text = "Can you elaborate more on your approach?"

                    # TTS reply using gTTS (free)
                    audio_bytes = b""
                    try:
                        tts = gTTS(reply_text, lang="en")
                        buf = BytesIO()
                        tts.write_to_fp(buf)
                        buf.seek(0)
                        audio_bytes = buf.read()
                    except Exception as e:
                        print("[TTS] error:", e)
                        audio_bytes = b""

                    # Send JSON then audio
                    await websocket.send_text(json.dumps({
                        "type": "response",
                        "transcript": transcript,
                        "text": reply_text,
                        "audio_format": "audio/mpeg"
                    }))
                    if audio_bytes:
                        await websocket.send_bytes(audio_bytes)

                    # Clear buffer for next turn
                    audio_buffer.clear()
                else:
                    # Ignore other text messages
                    continue
    except Exception as e:
        print("WebSocket closed/error:", e)
    finally:
        await websocket.close()
        print("👋 Client disconnected")

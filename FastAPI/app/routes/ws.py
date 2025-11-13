import json
import os
from io import BytesIO
from tempfile import NamedTemporaryFile
from typing import List, Dict, Any

from fastapi import APIRouter, WebSocket

from ..services.groq_client import get_groq_client, GROQ_LLM_MODEL, GROQ_STT_MODEL, DEFAULT_TTS_MODEL, DEFAULT_TTS_VOICE
from ..services.stt import transcribe_webm_bytes
from ..services.llm import generate_reply
from ..services.tts import synthesize_tts
from ..services.scoring import evaluate_conversation

router = APIRouter()


@router.websocket("/ws/interview")
async def interview_socket(websocket: WebSocket):
    await websocket.accept()
    print("✅ Client connected")

    audio_buffer = bytearray()
    history: List[Dict[str, Any]] = []  # [{role: user|assistant, content: str}]
    interview_context: Dict[str, Any] = {}  # Store interview details
    groq_client = get_groq_client()

    try:
        while True:
            message = await websocket.receive()

            # Binary = candidate audio bytes
            if "bytes" in message and message["bytes"] is not None:
                audio_buffer.extend(message["bytes"])
                continue

            # Text = control
            if "text" in message and message["text"] is not None:
                txt = message["text"]
                try:
                    obj = json.loads(txt)
                    msg_type = obj.get("type", "")
                except Exception:
                    msg_type = txt.strip().lower()

                if msg_type == "interview_context":
                    # Store interview context for AI to use
                    interview_context = obj.get("data", {})
                    print(f"📋 Interview context received: {interview_context}")
                    
                    # Send initial greeting based on interview context
                    role = interview_context.get("role", "candidate")
                    greeting = f"Hello! I'll be conducting your {role} interview today. Let's begin. Tell me about yourself and your experience."
                    
                    history.append({"role": "assistant", "content": greeting})
                    
                    await websocket.send_text(json.dumps({
                        "type": "assistant_text",
                        "transcript": "",
                        "text": greeting,
                    }))
                    
                    # Generate TTS for greeting
                    try:
                        audio_bytes, mime = await synthesize_tts(
                            groq_client,
                            greeting,
                            model=os.getenv("GROQ_TTS_MODEL", DEFAULT_TTS_MODEL),
                            voice=os.getenv("GROQ_TTS_VOICE", DEFAULT_TTS_VOICE),
                            response_format=os.getenv("GROQ_TTS_FORMAT", "wav"),
                        )
                        await websocket.send_text(json.dumps({
                            "type": "assistant_audio",
                            "audio_format": mime,
                        }))
                        if audio_bytes:
                            await websocket.send_bytes(audio_bytes)
                    except Exception as e:
                        print("[Groq TTS] error:", e)
                    
                    continue

                if msg_type in ("segment_end", "flush"):
                    # 1) STT
                    transcript = ""
                    if groq_client and len(audio_buffer) > 0:
                        transcript = await transcribe_webm_bytes(groq_client, bytes(audio_buffer), GROQ_STT_MODEL)
                    if not transcript:
                        transcript = "(couldn't transcribe)"

                    history.append({"role": "user", "content": transcript})

                    # 2) LLM reply (non-streaming for now) - pass interview context
                    reply_text = await generate_reply(groq_client, history, GROQ_LLM_MODEL, interview_context)
                    history.append({"role": "assistant", "content": reply_text})

                    # Send assistant text first so UI can show live transcript under interviewer circle
                    await websocket.send_text(json.dumps({
                        "type": "assistant_text",
                        "transcript": transcript,
                        "text": reply_text,
                    }))

                    # 3) TTS using Groq
                    try:
                        audio_bytes, mime = await synthesize_tts(
                            groq_client,
                            reply_text,
                            model=os.getenv("GROQ_TTS_MODEL", DEFAULT_TTS_MODEL),
                            voice=os.getenv("GROQ_TTS_VOICE", DEFAULT_TTS_VOICE),
                            response_format=os.getenv("GROQ_TTS_FORMAT", "wav"),
                        )
                    except Exception as e:
                        print("[Groq TTS] error:", e)
                        audio_bytes, mime = b"", "audio/wav"

                    await websocket.send_text(json.dumps({
                        "type": "assistant_audio",
                        "audio_format": mime,
                    }))
                    if audio_bytes:
                        await websocket.send_bytes(audio_bytes)

                    audio_buffer.clear()

                elif msg_type == "end_call":
                    # Evaluate the conversation and send results
                    evaluation = await evaluate_conversation(get_groq_client(), history, GROQ_LLM_MODEL)
                    await websocket.send_text(json.dumps({
                        "type": "evaluation",
                        "result": evaluation,
                    }))
                    # Then close cleanly
                    await websocket.close()
                    print("👋 Client disconnected (end call)")
                    return
                else:
                    continue
    except Exception as e:
        print("WebSocket closed/error:", e)
    finally:
        try:
            await websocket.close()
        except Exception:
            pass
        print("👋 Client disconnected")

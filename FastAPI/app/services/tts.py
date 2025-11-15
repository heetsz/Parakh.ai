from tempfile import NamedTemporaryFile
import os


async def synthesize_tts(groq_client, text: str, model: str = "playai-tts", voice: str = "Fritz-PlayAI", response_format: str = "wav"):
    if not groq_client or not text:
        return b"", f"audio/{response_format}"
    tmp_path = None
    try:
        # Create TTS via Groq API
        resp = groq_client.audio.speech.create(
            model=model,
            voice=voice,
            input=text,
            response_format=response_format,
        )

        # Write to a temp file, then read bytes
        with NamedTemporaryFile(delete=False, suffix=f".{response_format}") as tmp:
            tmp_path = tmp.name
        resp.write_to_file(tmp_path)
        with open(tmp_path, "rb") as f:
            audio_bytes = f.read()
        return audio_bytes, f"audio/{response_format}"
    except Exception as e:
        # Check if it's a rate limit error
        error_str = str(e).lower()
        if "rate" in error_str and "limit" in error_str:
            print("[TTS] Rate limit reached:", e)
            raise Exception("RATE_LIMIT_EXCEEDED")
        # Let callers handle fallback (e.g., switch to DEFAULT_TTS_VOICE)
        print("[TTS] error:", e)
        raise
    finally:
        if tmp_path:
            try:
                os.remove(tmp_path)
            except Exception:
                pass

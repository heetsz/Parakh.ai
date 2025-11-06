import os
from tempfile import NamedTemporaryFile


async def transcribe_webm_bytes(groq_client, data: bytes, model: str) -> str:
    if not groq_client or not data:
        return ""
    tmp_path = None
    try:
        with NamedTemporaryFile(delete=False, suffix=".webm") as tmp:
            tmp.write(data)
            tmp_path = tmp.name
        with open(tmp_path, "rb") as f:
            stt = groq_client.audio.transcriptions.create(
                model=model,
                file=f,
            )
        return (getattr(stt, "text", None) or "").strip()
    except Exception as e:
        print("[STT] error:", e)
        return ""
    finally:
        if tmp_path:
            try:
                os.remove(tmp_path)
            except Exception:
                pass

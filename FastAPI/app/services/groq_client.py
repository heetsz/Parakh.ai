import os
from groq import Groq

_client = None

GROQ_LLM_MODEL = os.getenv("GROQ_LLM_MODEL", "llama-3.1-8b-instant")
GROQ_STT_MODEL = os.getenv("GROQ_STT_MODEL", "whisper-large-v3")

# Groq TTS defaults (from docs)
DEFAULT_TTS_MODEL = os.getenv("GROQ_TTS_MODEL", "playai-tts")
DEFAULT_TTS_VOICE = os.getenv("GROQ_TTS_VOICE", "Fritz-PlayAI")


def get_groq_client():
    global _client
    if _client is None:
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            return None
        _client = Groq(api_key=api_key)
    return _client

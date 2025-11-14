import os
from groq import Groq

_client = None
_tts_clients = None  # list[Groq] built from multiple API keys
_tts_index = 0       # round-robin index for alternating interviews

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


def get_groq_tts_client():
    """
    Returns a Groq client for TTS, alternating between GROQ_API_KEY and GROQ_API_KEY_H
    across sessions (e.g., per-interview) to spread TTS limits.
    """
    global _tts_clients, _tts_index
    if _tts_clients is None:
        keys = []
        k1 = os.getenv("GROQ_API_KEY")
        k2 = os.getenv("GROQ_API_KEY_H")
        if k1:
            keys.append(k1)
        if k2 and k2 != k1:
            keys.append(k2)
        # Build client list from available keys
        _tts_clients = [Groq(api_key=k) for k in keys]

    if not _tts_clients:
        # Fallback to default single client if no keys available
        return get_groq_client()

    client = _tts_clients[_tts_index % len(_tts_clients)]
    _tts_index = (_tts_index + 1) % (10**9)
    return client

from typing import List, Dict, Any


async def generate_reply(groq_client, history: List[Dict[str, Any]], model: str) -> str:
    if not groq_client:
        return "Please configure GROQ_API_KEY on the server."
    try:
        messages = [
            {"role": "system", "content": (
                "You are a concise technical interviewer. Ask one follow-up question "
                "or provide brief feedback in under 2 sentences."
            )}
        ]
        for h in history[-10:]:
            messages.append({"role": h["role"], "content": h["content"]})

        llm = groq_client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=0.6,
            max_tokens=160,
        )
        return (llm.choices[0].message.content or "").strip()
    except Exception as e:
        print("[LLM] error:", e)
        return "Can you elaborate more on your approach?"

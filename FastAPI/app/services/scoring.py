from typing import List, Dict, Any


EVALUATION_PROMPT = (
    "You are a senior interviewer. Evaluate the candidate's performance based on the conversation. "
    "Consider: clarity of communication, correctness, problem-solving, depth, and technical accuracy. "
    "Return a concise JSON with fields: overall_score (0-100), strengths (list), areas_for_improvement (list), "
    "and brief_summary (string). Keep it short and actionable."
)


async def evaluate_conversation(groq_client, history: List[Dict[str, Any]], model: str) -> Dict[str, Any]:
    if not groq_client:
        return {
            "overall_score": 0,
            "strengths": [],
            "areas_for_improvement": ["Server missing GROQ_API_KEY"],
            "brief_summary": "Configuration error prevented evaluation.",
        }
    try:
        # Build a compact transcript
        joined = []
        for h in history[-50:]:
            joined.append(f"{h['role']}: {h['content']}")
        transcript = "\n".join(joined)

        messages = [
            {"role": "system", "content": EVALUATION_PROMPT},
            {"role": "user", "content": transcript},
        ]
        comp = groq_client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=0.3,
            max_tokens=400,
        )
        text = (comp.choices[0].message.content or "{}").strip()
        # Try to parse JSON; if not, return text in a wrapper
        import json
        try:
            data = json.loads(text)
            return data
        except Exception:
            return {
                "overall_score": None,
                "strengths": [],
                "areas_for_improvement": [],
                "brief_summary": text,
            }
    except Exception as e:
        print("[Evaluate] error:", e)
        return {
            "overall_score": None,
            "strengths": [],
            "areas_for_improvement": [],
            "brief_summary": "Evaluation failed due to an internal error.",
        }

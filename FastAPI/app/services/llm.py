from typing import List, Dict, Any


async def generate_reply(groq_client, history: List[Dict[str, Any]], model: str, interview_context: Dict[str, Any] = None) -> str:
    if not groq_client:
        return "Please configure GROQ_API_KEY on the server."
    try:
        # Build system prompt with interview context
        system_prompt = (
            "You are a professional technical interviewer conducting an English-language interview. "
            "Always respond in English only, regardless of the candidate's language. "
            "Ask one relevant follow-up question or provide brief feedback in under 2 sentences. "
            "Keep responses professional, clear, and focused on technical skills assessment."
        )
        
        # Add interview-specific context if available
        if interview_context:
            role = interview_context.get("role", "")
            experience = interview_context.get("experience", "")
            interview_type = interview_context.get("type", "")
            difficulty = interview_context.get("difficulty", "")
            notes = interview_context.get("notes", "")
            
            print(f"🎯 Using interview context in LLM: Role={role}, Experience={experience}, Type={interview_type}, Difficulty={difficulty}")
            
            context_details = f"\n\n🎯 CRITICAL INTERVIEW CONTEXT - YOU MUST FOLLOW THIS:"
            
            if role:
                context_details += f"\n- SPECIFIC POSITION: {role}"
                context_details += f"\n- Your questions MUST be directly relevant to {role} role"
                context_details += f"\n- Focus on skills, technologies, and scenarios specific to {role}"
            
            if experience:
                context_details += f"\n- CANDIDATE EXPERIENCE LEVEL: {experience}"
                context_details += f"\n- Adjust question difficulty for {experience} experience level"
            
            if interview_type:
                context_details += f"\n- INTERVIEW TYPE: {interview_type}"
                context_details += f"\n- Ask {interview_type} questions only"
            
            if difficulty:
                context_details += f"\n- DIFFICULTY LEVEL: {difficulty}"
                context_details += f"\n- Questions should be {difficulty} difficulty"
            
            if notes:
                context_details += f"\n- SPECIAL INSTRUCTIONS: {notes}"
            
            context_details += f"\n\n⚠️ IMPORTANT: You are interviewing for {role} position. Do NOT ask generic software engineering questions."
            context_details += f"\nAsk ONLY questions specific to {role} responsibilities, technologies, and best practices."
            
            system_prompt += context_details
        
        messages = [
            {"role": "system", "content": system_prompt}
        ]
        for h in history[-10:]:
            messages.append({"role": h["role"], "content": h["content"]})

        llm = groq_client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=0.6,
            max_tokens=160,
        )
        
        response = (llm.choices[0].message.content or "").strip()
        print(f"💬 AI Response: {response}")
        return response
    except Exception as e:
        print("[LLM] error:", e)
        return "Can you elaborate more on your approach?"

"""
Service for evaluating interview performance and generating detailed feedback
"""
import os
import json
from groq import Groq

def evaluate_interview(conversation_history, interview_context):
    """
    Evaluate the interview and generate detailed scores and feedback
    
    Args:
        conversation_history: List of conversation turns
        interview_context: Dict with role, difficulty, notes
        
    Returns:
        Dict with scores and feedback
    """
    # Initialize Groq client with API key
    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY environment variable not set")
    
    client = Groq(api_key=api_key)
    
    # Format conversation for analysis
    conversation_text = "\n".join([
        f"{'Candidate' if turn['role'] == 'user' else 'Interviewer'}: {turn['content']}"
        for turn in conversation_history
    ])
    
    role = interview_context.get('role', 'Software Engineer')
    difficulty = interview_context.get('difficulty', 'Medium')
    
    prompt = f"""You are an expert interview evaluator. Analyze this {role} interview at {difficulty} difficulty level.

CONVERSATION:
{conversation_text}

Provide a comprehensive evaluation in the following JSON format (must be valid JSON):
{{
  "scores": {{
    "communication": <0-100>,
    "technicalSkills": <0-100>,
    "problemSolving": <0-100>,
    "confidence": <0-100>,
    "clarity": <0-100>,
    "overall": <0-100>
  }},
  "feedback": {{
    "strengths": ["strength1", "strength2", "strength3"],
    "weaknesses": ["weakness1", "weakness2"],
    "improvements": ["improvement1", "improvement2", "improvement3"],
    "nextFocusAreas": ["focus1", "focus2", "focus3"],
    "detailedFeedback": "A detailed paragraph explaining the overall performance"
  }}
}}

SCORING GUIDELINES:
- Communication (0-100): Clarity, articulation, professionalism
- Technical Skills (0-100): Knowledge depth, accuracy, terminology
- Problem Solving (0-100): Approach, logic, creativity
- Confidence (0-100): Self-assurance, decisiveness
- Clarity (0-100): Clear explanations, structure
- Overall (0-100): Weighted average of all categories

Provide honest, constructive feedback. Be specific with examples from the conversation.
Return ONLY valid JSON, no markdown formatting or extra text."""

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert interview evaluator. Always respond with valid JSON only."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.7,
            max_tokens=2000,
        )
        
        result_text = response.choices[0].message.content.strip()
        
        # Clean up response - remove markdown code blocks if present
        if result_text.startswith("```json"):
            result_text = result_text[7:]
        if result_text.startswith("```"):
            result_text = result_text[3:]
        if result_text.endswith("```"):
            result_text = result_text[:-3]
        result_text = result_text.strip()
        
        # Parse JSON
        evaluation = json.loads(result_text)
        
        print("✅ Interview evaluation generated successfully")
        return evaluation
        
    except json.JSONDecodeError as e:
        print(f"❌ Failed to parse evaluation JSON: {e}")
        print(f"Raw response: {result_text}")
        
        # Return default scores
        return {
            "scores": {
                "communication": 70,
                "technicalSkills": 65,
                "problemSolving": 70,
                "confidence": 68,
                "clarity": 72,
                "overall": 69
            },
            "feedback": {
                "strengths": ["Engaged in conversation", "Attempted to answer questions"],
                "weaknesses": ["More practice needed", "Could improve technical depth"],
                "improvements": ["Practice more interviews", "Study core concepts", "Work on communication"],
                "nextFocusAreas": ["Technical fundamentals", "Problem-solving practice", "Communication skills"],
                "detailedFeedback": "Good effort in the interview. Continue practicing to improve your skills."
            }
        }
    except Exception as e:
        print(f"❌ Error generating evaluation: {e}")
        raise

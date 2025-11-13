import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const generateQuiz = async (req, res) => {
  try {
    const { jobDescription, quizType, numberOfQuestions, concepts, difficulty } = req.body;

    // Validation
    if (!numberOfQuestions || numberOfQuestions < 1 || numberOfQuestions > 50) {
      return res.status(400).json({
        success: false,
        message: "Number of questions must be between 1 and 50"
      });
    }

    // Check if Gemini API key is available
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        success: false,
        message: "Gemini API key not configured. Please add GEMINI_API_KEY to your .env file."
      });
    }

    const difficultyLevel = difficulty || "easy-to-medium";

    // Build comprehensive prompt for Gemini
    const prompt = `You are an expert technical interviewer creating an Online Assessment quiz. Generate ${numberOfQuestions} high-quality multiple choice questions (MCQs) based on the following specifications:

${jobDescription ? `JOB DESCRIPTION/ROLE:\n${jobDescription}\n` : ''}
${quizType ? `TOPIC/DOMAIN: ${quizType}\n` : ''}
${concepts ? `SPECIFIC CONCEPTS TO COVER: ${concepts}\n` : ''}

DIFFICULTY LEVEL: ${difficultyLevel}
- For "easy": Focus on fundamental concepts, definitions, and basic problem-solving
- For "medium": Include scenario-based questions, code analysis, and application of concepts
- Mix both easy and medium difficulty across the questions

REQUIREMENTS:
1. Each question must be clear, unambiguous, and professionally written
2. Questions should test practical knowledge, not just memorization
3. Include a mix of:
   - Conceptual understanding
   - Code snippet analysis (when applicable)
   - Problem-solving scenarios
   - Best practices and common patterns
4. Each question must have exactly 4 options (A, B, C, D)
5. Only ONE option should be correct
6. Incorrect options should be plausible but clearly wrong to someone who knows the concept
7. Provide a detailed, educational explanation for the correct answer
8. Explanations should help the user learn, not just state the answer

CONTENT GUIDELINES:
- Avoid trick questions or ambiguous wording
- Use real-world scenarios when possible
- For coding questions, use proper syntax and formatting
- Questions should be relevant to actual interview scenarios
- Ensure diversity in question types and concepts covered

Return ONLY valid JSON in this exact format (no markdown, no code blocks):
{
  "questions": [
    {
      "id": 1,
      "question": "Clear and concise question text?",
      "options": {
        "A": "First option text",
        "B": "Second option text",
        "C": "Third option text",
        "D": "Fourth option text"
      },
      "correctAnswer": "A",
      "explanation": "Detailed explanation of why this answer is correct and why others are wrong. Include additional context to help learning.",
      "difficulty": "easy",
      "topic": "Specific topic/concept"
    }
  ]
}

Generate exactly ${numberOfQuestions} questions following these guidelines strictly.`;

    // Use Google GenAI SDK
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
// gemini-2.5-pro
// gemini-2.5-flash
// gemini-2.5-flash-lite
      contents: prompt,
    });

    let text = response.text;

    // Clean up the response
    text = text.trim();
    
    // Remove markdown code blocks if present
    text = text.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    
    // Find JSON content
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No valid JSON found in response");
    }
    
    text = jsonMatch[0];

    // Parse JSON from response
    let quizData;
    try {
      quizData = JSON.parse(text);
      
      // Validate the structure
      if (!quizData.questions || !Array.isArray(quizData.questions)) {
        throw new Error("Invalid quiz structure");
      }

      // Validate each question
      quizData.questions.forEach((q, idx) => {
        if (!q.question || !q.options || !q.correctAnswer || !q.explanation) {
          throw new Error(`Question ${idx + 1} is missing required fields`);
        }
        
        if (Object.keys(q.options).length !== 4) {
          throw new Error(`Question ${idx + 1} must have exactly 4 options`);
        }

        if (!['A', 'B', 'C', 'D'].includes(q.correctAnswer)) {
          throw new Error(`Question ${idx + 1} has invalid correct answer`);
        }
      });

    } catch (parseError) {
      console.error("Parse error:", parseError);
      console.error("Received text:", text);
      return res.status(500).json({
        success: false,
        message: "Failed to parse generated quiz. Please try again.",
        error: parseError.message
      });
    }

    res.status(200).json({
      success: true,
      quiz: quizData,
      metadata: {
        jobDescription,
        quizType,
        numberOfQuestions,
        concepts,
        difficulty: difficultyLevel,
        generatedAt: new Date()
      }
    });

  } catch (error) {
    console.error("Error generating quiz:", error);
    res.status(500).json({
      success: false,
      message: error.message || "An error occurred while generating the quiz"
    });
  }
};

export const submitQuizResults = async (req, res) => {
  try {
    const { answers, quizMetadata } = req.body;
    const userId = req.user._id;

    // Calculate score
    let correctAnswers = 0;
    let easyCorrect = 0;
    let mediumCorrect = 0;
    let easyTotal = 0;
    let mediumTotal = 0;

    const totalQuestions = answers.length;

    const detailedResults = answers.map(answer => {
      const isCorrect = answer.selectedAnswer === answer.correctAnswer;
      
      if (isCorrect) {
        correctAnswers++;
        if (answer.difficulty === 'easy') easyCorrect++;
        if (answer.difficulty === 'medium') mediumCorrect++;
      }

      if (answer.difficulty === 'easy') easyTotal++;
      if (answer.difficulty === 'medium') mediumTotal++;

      return {
        questionId: answer.questionId,
        selectedAnswer: answer.selectedAnswer,
        correctAnswer: answer.correctAnswer,
        isCorrect,
        difficulty: answer.difficulty,
        topic: answer.topic
      };
    });

    const score = Math.round((correctAnswers / totalQuestions) * 100);

    // Performance breakdown
    const breakdown = {
      easy: easyTotal > 0 ? Math.round((easyCorrect / easyTotal) * 100) : 0,
      medium: mediumTotal > 0 ? Math.round((mediumCorrect / mediumTotal) * 100) : 0
    };

    // Generate performance message
    let performanceMessage = "";
    if (score >= 90) {
      performanceMessage = "Outstanding! You have excellent mastery of these concepts.";
    } else if (score >= 75) {
      performanceMessage = "Great job! You have a strong understanding of the material.";
    } else if (score >= 60) {
      performanceMessage = "Good effort! Review the explanations to strengthen your knowledge.";
    } else {
      performanceMessage = "Keep practicing! Focus on the fundamentals and try again.";
    }

    res.status(200).json({
      success: true,
      results: {
        score,
        correctAnswers,
        totalQuestions,
        percentage: score,
        passed: score >= 60,
        breakdown,
        performanceMessage,
        detailedResults,
        timestamp: new Date()
      }
    });

  } catch (error) {
    console.error("Error submitting quiz:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

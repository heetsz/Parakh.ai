import { GoogleGenAI } from "@google/genai";
import OATest from "../models/OATest.js";

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
      "topic": "Specific topic/concept",
      "timeInSeconds": 60
    }
  ],
  "totalTimeInSeconds": 600
}

IMPORTANT: Calculate appropriate time for each question:
- Simple concept/definition questions: 45-60 seconds
- Moderate complexity/code reading: 75-90 seconds
- Complex problem-solving/analysis: 90-120 seconds
- Set totalTimeInSeconds as sum of all individual question times (this should be somewhat more than ideal/best case scenario)

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

        // Set default time if not provided
        if (!q.timeInSeconds) {
          q.timeInSeconds = 75; // default 75 seconds
        }
      });

      // Calculate total time if not provided
      if (!quizData.totalTimeInSeconds) {
        quizData.totalTimeInSeconds = quizData.questions.reduce((sum, q) => sum + (q.timeInSeconds || 75), 0);
      }

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
    const { answers, quizMetadata, questions, timeTaken, quizDuration } = req.body;
    const userId = req.user._id;

    console.log('Submit Quiz - User ID:', userId);
    console.log('Submit Quiz - Answers count:', answers?.length);
    console.log('Submit Quiz - Questions count:', questions?.length);

    if (!answers || answers.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No answers provided"
      });
    }

    // Calculate score
    let correctAnswers = 0;
    let easyCorrect = 0, easyTotal = 0;
    let mediumCorrect = 0, mediumTotal = 0;
    let hardCorrect = 0, hardTotal = 0;
    
    const topicMap = {};
    const totalQuestions = answers.length;

    const detailedResults = answers.map(answer => {
      const isCorrect = answer.selectedAnswer === answer.correctAnswer;
      
      if (isCorrect) {
        correctAnswers++;
        if (answer.difficulty === 'easy') easyCorrect++;
        else if (answer.difficulty === 'medium') mediumCorrect++;
        else if (answer.difficulty === 'hard') hardCorrect++;
      }

      if (answer.difficulty === 'easy') easyTotal++;
      else if (answer.difficulty === 'medium') mediumTotal++;
      else if (answer.difficulty === 'hard') hardTotal++;

      // Track topic performance
      const topic = answer.topic || 'General';
      if (!topicMap[topic]) {
        topicMap[topic] = { correct: 0, total: 0 };
      }
      topicMap[topic].total++;
      if (isCorrect) topicMap[topic].correct++;

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
      easyCorrect,
      easyTotal,
      mediumCorrect,
      mediumTotal,
      hardCorrect,
      hardTotal
    };

    // Topic performance
    const topicPerformance = Object.entries(topicMap).map(([topic, data]) => ({
      topic,
      correct: data.correct,
      total: data.total,
      percentage: Math.round((data.correct / data.total) * 100)
    }));

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

    // Save to database
    const oaTestData = {
      user: userId,
      quizConfig: {
        jobDescription: quizMetadata?.jobDescription || '',
        quizType: quizMetadata?.quizType || '',
        numberOfQuestions: quizMetadata?.numberOfQuestions || totalQuestions,
        concepts: quizMetadata?.concepts || '',
        difficulty: quizMetadata?.difficulty || 'easy-to-medium'
      },
      questions: questions || [],
      answers: detailedResults,
      results: {
        score,
        totalQuestions,
        correctAnswers,
        incorrectAnswers: totalQuestions - correctAnswers,
        percentage: score,
        passed: score >= 60,
        timeTaken: timeTaken || 0,
        breakdown,
        topicPerformance
      },
      duration: quizDuration || 0,
      completedAt: new Date()
    };

    console.log('Creating OATest document...');
    const oaTest = new OATest(oaTestData);
    
    console.log('Saving to database...');
    await oaTest.save();
    console.log('OATest saved successfully with ID:', oaTest._id);

    res.status(200).json({
      success: true,
      results: {
        score,
        correctAnswers,
        totalQuestions,
        percentage: score,
        passed: score >= 60,
        breakdown,
        topicPerformance,
        performanceMessage,
        detailedResults,
        timestamp: new Date(),
        testId: oaTest._id
      }
    });

  } catch (error) {
    console.error("Error submitting quiz:", error);
    console.error("Error stack:", error.stack);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: validationErrors
      });
    }
    
    res.status(500).json({
      success: false,
      message: error.message || "Failed to submit quiz",
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Get user's OA test history
export const getOAHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { limit = 10, page = 1 } = req.query;

    const tests = await OATest.find({ user: userId })
      .sort({ completedAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
      // Include all data including questions and answers for detailed view

    const totalTests = await OATest.countDocuments({ user: userId });

    res.status(200).json({
      success: true,
      tests,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalTests / parseInt(limit)),
        totalTests,
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    console.error("Error fetching OA history:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get specific OA test details
export const getOATestDetails = async (req, res) => {
  try {
    const userId = req.user._id;
    const { testId } = req.params;

    const test = await OATest.findOne({ _id: testId, user: userId });

    if (!test) {
      return res.status(404).json({
        success: false,
        message: "Test not found"
      });
    }

    res.status(200).json({
      success: true,
      test
    });

  } catch (error) {
    console.error("Error fetching test details:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get OA statistics for user
export const getOAStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const tests = await OATest.find({ user: userId }).select('results completedAt quizConfig');

    if (tests.length === 0) {
      return res.status(200).json({
        success: true,
        stats: {
          totalTests: 0,
          averageScore: 0,
          highestScore: 0,
          passRate: 0,
          totalQuestions: 0,
          recentTests: []
        }
      });
    }

    const totalTests = tests.length;
    const totalScore = tests.reduce((sum, test) => sum + test.results.percentage, 0);
    const averageScore = Math.round(totalScore / totalTests);
    const highestScore = Math.max(...tests.map(test => test.results.percentage));
    const passedTests = tests.filter(test => test.results.passed).length;
    const passRate = Math.round((passedTests / totalTests) * 100);
    const totalQuestions = tests.reduce((sum, test) => sum + test.results.totalQuestions, 0);

    // Recent tests (last 5)
    const recentTests = tests
      .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
      .slice(0, 5)
      .map(test => ({
        id: test._id,
        score: test.results.percentage,
        passed: test.results.passed,
        quizType: test.quizConfig.quizType,
        completedAt: test.completedAt
      }));

    res.status(200).json({
      success: true,
      stats: {
        totalTests,
        averageScore,
        highestScore,
        passRate,
        totalQuestions,
        recentTests
      }
    });

  } catch (error) {
    console.error("Error fetching OA stats:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

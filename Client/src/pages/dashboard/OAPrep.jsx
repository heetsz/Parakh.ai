import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, XCircle, Trophy, Clock, Brain, AlertCircle, TrendingUp } from "lucide-react";
import axios from "axios";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api";

// Helper functions to persist state in sessionStorage
const saveToSession = (key, value) => {
  try {
    sessionStorage.setItem(`oa_prep_${key}`, JSON.stringify(value));
  } catch (error) {
    console.error("Error saving to session:", error);
  }
};

const loadFromSession = (key, defaultValue) => {
  try {
    const item = sessionStorage.getItem(`oa_prep_${key}`);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error("Error loading from session:", error);
    return defaultValue;
  }
};

const clearSession = () => {
  try {
    const keys = ['step', 'formData', 'quiz', 'currentQuestion', 'selectedAnswers', 'timeRemaining', 'quizStartTime', 'results'];
    keys.forEach(key => sessionStorage.removeItem(`oa_prep_${key}`));
  } catch (error) {
    console.error("Error clearing session:", error);
  }
};

export default function OAPrep() {
  const [step, setStep] = useState(() => loadFromSession('step', 'setup'));
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  
  // Setup form state
  const [formData, setFormData] = useState(() => loadFromSession('formData', {
    jobDescription: "",
    quizType: "",
    numberOfQuestions: 10,
    concepts: "",
    difficulty: "easy-to-medium"
  }));
  
  // Quiz state
  const [quiz, setQuiz] = useState(() => loadFromSession('quiz', null));
  const [currentQuestion, setCurrentQuestion] = useState(() => loadFromSession('currentQuestion', 0));
  const [selectedAnswers, setSelectedAnswers] = useState(() => loadFromSession('selectedAnswers', {}));
  const [timeRemaining, setTimeRemaining] = useState(() => loadFromSession('timeRemaining', null));
  const [quizStartTime, setQuizStartTime] = useState(() => loadFromSession('quizStartTime', null));
  
  // Results state
  const [results, setResults] = useState(() => loadFromSession('results', null));

  // Persist state changes to sessionStorage
  useEffect(() => {
    saveToSession('step', step);
  }, [step]);

  useEffect(() => {
    saveToSession('formData', formData);
  }, [formData]);

  useEffect(() => {
    saveToSession('quiz', quiz);
  }, [quiz]);

  useEffect(() => {
    saveToSession('currentQuestion', currentQuestion);
  }, [currentQuestion]);

  useEffect(() => {
    saveToSession('selectedAnswers', selectedAnswers);
  }, [selectedAnswers]);

  useEffect(() => {
    saveToSession('timeRemaining', timeRemaining);
  }, [timeRemaining]);

  useEffect(() => {
    saveToSession('quizStartTime', quizStartTime);
  }, [quizStartTime]);

  useEffect(() => {
    saveToSession('results', results);
  }, [results]);

  // Clear initial load after session restoration
  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialLoad(false);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Timer effect
  useEffect(() => {
    if (step === "quiz" && timeRemaining !== null && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            handleSubmitQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [step, timeRemaining]);

  const handleGenerateQuiz = async () => {
    if (!formData.numberOfQuestions || formData.numberOfQuestions < 1) {
      alert("Please enter a valid number of questions");
      return;
    }

    if (!formData.quizType) {
      alert("Please select a quiz type");
      return;
    }

    setLoading(true);
    setLoadingProgress(0);
    
    // Calculate estimated time based on number of questions
    const estimatedTime = formData.numberOfQuestions <= 5 ? 17500 :
                         formData.numberOfQuestions <= 10 ? 25000 :
                         formData.numberOfQuestions <= 20 ? 37500 : 52500;
    
    // Update progress bar smoothly
    const progressInterval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 95) return prev;
        return prev + (100 / (estimatedTime / 100));
      });
    }, 100);
    
    try {
      const response = await axios.post(
        `${API_URL}/oa/generate`,
        formData,
        { withCredentials: true }
      );
      
      clearInterval(progressInterval);
      setLoadingProgress(100);
      
      // Small delay to show 100% completion
      setTimeout(() => {
        setQuiz(response.data.quiz);
        setStep("quiz");
        setQuizStartTime(Date.now());
        // Use AI-calculated time duration from response
        setTimeRemaining(response.data.quiz.totalTimeInSeconds || formData.numberOfQuestions * 75);
        setLoadingProgress(0);
      }, 500);
    } catch (error) {
      clearInterval(progressInterval);
      setLoadingProgress(0);
      console.error("Error generating quiz:", error);
      alert(error.response?.data?.message || "Failed to generate quiz. Please try again.");
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  };

  const handleAnswerSelect = (questionId, answer) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: answer
    });
  };

  const handleSubmitQuiz = async () => {
    if (loading) return;

    const answersArray = quiz.questions.map(q => ({
      questionId: q.id,
      selectedAnswer: selectedAnswers[q.id] || null,
      correctAnswer: q.correctAnswer,
      difficulty: q.difficulty,
      topic: q.topic
    }));

    // Calculate time taken
    const timeTaken = quizStartTime ? Math.floor((Date.now() - quizStartTime) / 1000) : 0;

    setLoading(true);
    try {
      console.log('Submitting quiz with data:', {
        answersCount: answersArray.length,
        questionsCount: quiz.questions.length,
        timeTaken,
        quizDuration: quiz.totalTimeInSeconds
      });

      const response = await axios.post(
        `${API_URL}/oa/submit`,
        {
          answers: answersArray,
          quizMetadata: formData,
          questions: quiz.questions,
          timeTaken,
          quizDuration: quiz.totalTimeInSeconds
        },
        { withCredentials: true }
      );
      
      console.log('Quiz submitted successfully:', response.data);
      setResults(response.data.results);
      setStep("results");
    } catch (error) {
      console.error("Error submitting quiz:", error);
      console.error("Error response:", error.response?.data);
      
      const errorMessage = error.response?.data?.message || error.message || "Failed to submit quiz";
      
      // Handle authentication errors
      if (error.response?.status === 401) {
        alert(`Session expired: ${errorMessage}\n\nYou will be redirected to login.`);
        // Clear session storage
        clearSession();
        // Redirect to login
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
        alert(`Failed to submit quiz: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const resetQuiz = () => {
    clearSession(); // Clear all persisted data
    setStep("setup");
    setQuiz(null);
    setCurrentQuestion(0);
    setSelectedAnswers({});
    setResults(null);
    setTimeRemaining(null);
    setQuizStartTime(null);
    setFormData({
      jobDescription: "",
      quizType: "",
      numberOfQuestions: 10,
      concepts: "",
      difficulty: "easy-to-medium"
    });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Helper function to render text with code formatting
  const renderTextWithCode = (text) => {
    if (!text) return null;
    
    // Check if text contains code blocks
    const hasCodeBlock = /```[\s\S]*?```|`[^`]+`/.test(text);
    
    if (!hasCodeBlock) {
      return <span className="whitespace-pre-wrap">{text}</span>;
    }
    
    // Split by code blocks (text between backticks or marked with ```)
    const parts = [];
    let currentIndex = 0;
    
    // Match code blocks with triple backticks or single backticks
    const codeBlockRegex = /```([\s\S]*?)```|`([^`]+)`/g;
    let match;
    
    while ((match = codeBlockRegex.exec(text)) !== null) {
      // Add text before code block
      if (match.index > currentIndex) {
        parts.push({
          type: 'text',
          content: text.substring(currentIndex, match.index)
        });
      }
      
      // Add code block
      parts.push({
        type: 'code',
        content: match[1] || match[2], // match[1] for ```, match[2] for `
        isBlock: !!match[1] // true for ```, false for `
      });
      
      currentIndex = match.index + match[0].length;
    }
    
    // Add remaining text
    if (currentIndex < text.length) {
      parts.push({
        type: 'text',
        content: text.substring(currentIndex)
      });
    }
    
    return (
      <div>
        {parts.map((part, idx) => (
          part.type === 'code' ? (
            part.isBlock ? (
              <pre key={idx} className="bg-muted p-3 rounded-md overflow-x-auto text-sm font-mono border my-2">
                <code className="whitespace-pre">{part.content}</code>
              </pre>
            ) : (
              <code key={idx} className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">
                {part.content}
              </code>
            )
          ) : (
            <span key={idx} className="whitespace-pre-wrap">{part.content}</span>
          )
        ))}
      </div>
    );
  };

  // Show loading state during initial load
  if (initialLoad) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <p className="text-center text-muted-foreground">Loading...</p>
      </div>
    );
  }

  // Setup Step
  if (step === "setup") {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-4xl ml-5 font-bold tracking-tight bg-linear-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">OA Preparation</h1>
          <p className="text-muted-foreground ml-5 mt-1">Generate AI-powered quiz questions tailored to your interview preparation needs</p>
        </div>

        <Card className="border-0 shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              Quiz Configuration
            </CardTitle>
            <CardDescription>Customize your practice quiz based on job requirements and topics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="jobDescription">Job Description / Role Requirements (Optional)</Label>
              <Textarea
                id="jobDescription"
                placeholder="Paste the job description or describe the role you're preparing for. This helps generate more relevant questions..."
                value={formData.jobDescription}
                onChange={(e) => {
                  const jd = e.target.value;
                  setFormData({ 
                    ...formData, 
                    jobDescription: jd,
                    quizType: jd.trim() ? "mixed" : formData.quizType
                  });
                }}
                className="min-h-[120px]"
              />
              <p className="text-xs text-muted-foreground">
                {formData.jobDescription.trim() ? "Quiz type automatically set to Mixed based on JD" : "The more context you provide, the better tailored the questions will be"}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quizType">Quiz Type *</Label>
                <Select
                  value={formData.quizType}
                  onValueChange={(value) => setFormData({ ...formData, quizType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select quiz type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="data-structures">Data Structures</SelectItem>
                    <SelectItem value="algorithms">Algorithms</SelectItem>
                    <SelectItem value="system-design">System Design</SelectItem>
                    <SelectItem value="databases">Databases & SQL</SelectItem>
                    <SelectItem value="operating-systems">Operating Systems</SelectItem>
                    <SelectItem value="networks">Computer Networks</SelectItem>
                    <SelectItem value="oops">Object-Oriented Programming</SelectItem>
                    <SelectItem value="javascript">JavaScript</SelectItem>
                    <SelectItem value="react">React & Frontend</SelectItem>
                    <SelectItem value="node">Node.js & Backend</SelectItem>
                    <SelectItem value="python">Python</SelectItem>
                    <SelectItem value="java">Java</SelectItem>
                    <SelectItem value="mixed">Mixed Topics</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="numberOfQuestions">Number of Questions *</Label>
                <Input
                  id="numberOfQuestions"
                  type="number"
                  min="1"
                  max="50"
                  value={formData.numberOfQuestions}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 1;
                    const clampedValue = Math.max(1, Math.min(50, value));
                    setFormData({ ...formData, numberOfQuestions: clampedValue });
                  }}
                  onBlur={(e) => {
                    const value = parseInt(e.target.value) || 1;
                    const clampedValue = Math.max(1, Math.min(50, value));
                    setFormData({ ...formData, numberOfQuestions: clampedValue });
                  }}
                />
                <p className="text-xs text-muted-foreground">Choose between 1 and 50 questions</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="concepts">Specific Concepts / Topics (Optional)</Label>
              <Textarea
                id="concepts"
                placeholder="e.g., Binary Trees, Dynamic Programming, REST APIs, Event Loop, Closures, etc."
                value={formData.concepts}
                onChange={(e) => setFormData({ ...formData, concepts: e.target.value })}
                className="min-h-[80px]"
              />
              <p className="text-xs text-muted-foreground">
                Specify particular concepts you want to focus on
              </p>
            </div>

            <div className="space-y-2">
              <Label>Difficulty Level *</Label>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant={formData.difficulty === "easy-to-medium" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setFormData({ ...formData, difficulty: "easy-to-medium" })}
                >
                  Easy to Medium
                </Button>
                <Button
                  type="button"
                  variant={formData.difficulty === "medium-to-hard" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setFormData({ ...formData, difficulty: "medium-to-hard" })}
                >
                  Medium to Hard
                </Button>
                <Button
                  type="button"
                  variant={formData.difficulty === "easy-to-hard" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setFormData({ ...formData, difficulty: "easy-to-hard" })}
                >
                  Easy to Hard
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                {formData.difficulty === "easy-to-medium" && "Questions will range from fundamental concepts to moderate problem-solving"}
                {formData.difficulty === "medium-to-hard" && "Questions will range from moderate to advanced problem-solving"}
                {formData.difficulty === "easy-to-hard" && "Questions will range across all difficulty levels"}
              </p>
            </div>

            <Separator />

            <div className="bg-white dark:bg-slate-800/50 rounded-lg p-4 relative" style={{ border: '2px solid transparent', backgroundImage: 'linear-gradient(white, white), linear-gradient(to right, #a855f7, #ec4899, #a855f7)', backgroundOrigin: 'border-box', backgroundClip: 'padding-box, border-box' }}>
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                <div className="text-sm space-y-1">
                  <p className="font-semibold dark:text-purple-300" style={{ color: '#000000' }}>Quiz Guidelines</p>
                  <ul className="dark:text-purple-200 space-y-1 list-disc list-inside font-medium" style={{ color: '#000000' }}>
                    <li>Time duration is calculated by AI based on question complexity</li>
                    <li>Questions are generated fresh each time</li>
                    <li>Review detailed explanations after submission</li>
                    <li>Aim for 60% or higher to pass</li>
                  </ul>
                </div>
              </div>
            </div>

            <Button
              onClick={handleGenerateQuiz}
              disabled={loading || !formData.quizType}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Brain className="mr-2 h-5 w-5 animate-pulse" />
                  Generating Quiz with AI...
                </>
              ) : (
                <>
                  <Brain className="mr-2 h-5 w-5" />
                  Generate Quiz
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Loading Progress Bar */}
        {loading && (
          <Card className="mt-6 bg-white dark:bg-[#1e293b] border-slate-200 dark:border-slate-700 shadow-xl">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src="/ai-loading.gif" alt="AI Loading" className="h-16 w-16 object-contain" />
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">
                        Generating Your Quiz...
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {formData.numberOfQuestions <= 5 && "Estimated time: 15-20 seconds"}
                        {formData.numberOfQuestions > 5 && formData.numberOfQuestions <= 10 && "Estimated time: 20-30 seconds"}
                        {formData.numberOfQuestions > 10 && formData.numberOfQuestions <= 20 && "Estimated time: 30-45 seconds"}
                        {formData.numberOfQuestions > 20 && "Estimated time: 45-60 seconds"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {Math.round(loadingProgress)}%
                    </p>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="relative h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden shadow-inner">
                  <div 
                    className="absolute top-0 left-0 h-full bg-linear-to-r from-purple-500 to-blue-500 dark:from-purple-600 dark:to-blue-600 transition-all duration-300 ease-out rounded-full wave-glow shadow-lg"
                    style={{ width: `${loadingProgress}%` }}
                  >
                    {/* Traveling white wave glow */}
                    <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/40 to-transparent animate-wave-travel" />
                    {/* Shimmer overlay */}
                    <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                  </div>
                </div>
                
                <p className="text-xs text-slate-600 dark:text-slate-400 text-center">
                  AI is analyzing your requirements and generating customized questions...
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Quiz Step
  if (step === "quiz" && quiz) {
    const question = quiz.questions[currentQuestion];
    const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;
    const answeredCount = Object.keys(selectedAnswers).length;
    const isLowTime = timeRemaining < 60;

    return (
      <div className="p-6">
        {/* Header Stats */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">
              Question {currentQuestion + 1} of {quiz.questions.length}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {answeredCount} answered • {quiz.questions.length - answeredCount} remaining
            </p>
          </div>
          <Badge 
            variant={isLowTime ? "destructive" : "outline"} 
            className={`gap-2 text-base px-4 py-2 ${isLowTime ? 'animate-pulse' : ''}`}
          >
            <Clock className="h-4 w-4" />
            {formatTime(timeRemaining)}
          </Badge>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <Card className="mb-6 border-0 shadow-none">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <CardTitle className="text-lg leading-relaxed flex-1">
                {renderTextWithCode(question.question)}
              </CardTitle>
              {question.difficulty && (
                <Badge variant="secondary" className="flex-shrink-0">
                  {question.difficulty}
                </Badge>
              )}
            </div>
            {question.topic && (
              <CardDescription className="mt-2">
                Topic: {question.topic}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(question.options).map(([key, value]) => {
              const isSelected = selectedAnswers[question.id] === key;
              
              return (
                <button
                  key={key}
                  onClick={() => handleAnswerSelect(question.id, key)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    isSelected
                      ? "border-primary bg-primary/10 shadow-sm"
                      : "border-border hover:border-primary/50 hover:bg-accent"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className={`font-bold ${isSelected ? 'text-primary' : 'text-muted-foreground'}`}>
                      {key}.
                    </span>
                    <div className="flex-1">{renderTextWithCode(value)}</div>
                    {isSelected && (
                      <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                    )}
                  </div>
                </button>
              );
            })}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-4">
          <Button
            variant="outline"
            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
            disabled={currentQuestion === 0}
          >
            Previous
          </Button>

          <div className="flex gap-2">
            {quiz.questions.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentQuestion(idx)}
                className={`h-2 rounded-full transition-all ${
                  idx === currentQuestion 
                    ? 'w-8 bg-primary' 
                    : selectedAnswers[quiz.questions[idx].id]
                    ? 'w-2 bg-primary/50'
                    : 'w-2 bg-border'
                }`}
              />
            ))}
          </div>

          {currentQuestion === quiz.questions.length - 1 ? (
            <Button
              onClick={handleSubmitQuiz}
              disabled={loading}
              size="lg"
              className="min-w-[120px]"
            >
              {loading ? "Submitting..." : "Submit Quiz"}
            </Button>
          ) : (
            <Button
              onClick={() => setCurrentQuestion(currentQuestion + 1)}
            >
              Next
            </Button>
          )}
        </div>

        {/* Submit Warning */}
        {answeredCount < quiz.questions.length && (
          <div className="mt-6 bg-orange-100  border-2 border-orange-400 dark:border-orange-600 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400 shrink-0" />
              <p className="text-sm font-medium text-black ">
                You have {quiz.questions.length - answeredCount} unanswered question(s). 
                Make sure to answer all questions before submitting.
              </p>
            </div>
          </div>
        )}

        {/* Quit Quiz Button */}
        <div className="mt-6 flex justify-center">
          <Button
            onClick={() => {
              if (window.confirm("Are you sure you want to quit? Your progress will be lost.")) {
                resetQuiz();
              }
            }}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Quit Quiz
          </Button>
        </div>
      </div>
    );
  }

  // Results Step
  if (step === "results" && results) {
    const timeTaken = quizStartTime ? Math.floor((Date.now() - quizStartTime) / 1000) : 0;
    
    return (
      <div className="p-6">
        <Card className="border-0 shadow-none">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto mb-4">
              {results.passed ? (
                <div className="h-20 w-20 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mx-auto">
                  <Trophy className="h-10 w-10 text-green-600 dark:text-green-400" />
                </div>
              ) : (
                <div className="h-20 w-20 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto">
                  <XCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
                </div>
              )}
            </div>
            <CardTitle className="text-3xl mb-2">
              {results.passed ? "Great Job! 🎉" : "Keep Practicing! 💪"}
            </CardTitle>
            <CardDescription className="text-lg">
              {results.performanceMessage}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Score Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-4 rounded-lg bg-primary/10">
                <p className="text-3xl font-bold text-primary">{results.score}%</p>
                <p className="text-sm text-muted-foreground mt-1">Overall Score</p>
              </div>
              <div className="p-4 rounded-lg bg-green-100 dark:bg-green-900/20">
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">{results.correctAnswers}</p>
                <p className="text-sm text-muted-foreground mt-1">Correct</p>
              </div>
              <div className="p-4 rounded-lg bg-muted">
                <p className="text-3xl font-bold">{results.totalQuestions}</p>
                <p className="text-sm text-muted-foreground mt-1">Total</p>
              </div>
              <div className="p-4 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{formatTime(timeTaken)}</p>
                <p className="text-sm text-muted-foreground mt-1">Time Taken</p>
              </div>
            </div>

            {/* Performance Breakdown */}
            {results.breakdown && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-lg">Performance Breakdown</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {results.breakdown.easy > 0 && (
                    <div className="p-4 rounded-lg border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Easy Questions</span>
                        <Badge variant="secondary">{results.breakdown.easy}%</Badge>
                      </div>
                      <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 transition-all"
                          style={{ width: `${results.breakdown.easy}%` }}
                        />
                      </div>
                    </div>
                  )}
                  {results.breakdown.medium > 0 && (
                    <div className="p-4 rounded-lg border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Medium Questions</span>
                        <Badge variant="secondary">{results.breakdown.medium}%</Badge>
                      </div>
                      <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-yellow-500 transition-all"
                          style={{ width: `${results.breakdown.medium}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <Separator />

            {/* Detailed Review */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Detailed Review</h3>
              {quiz.questions.map((question, idx) => {
                const userAnswer = selectedAnswers[question.id];
                const isCorrect = userAnswer === question.correctAnswer;

                return (
                  <Card 
                    key={question.id} 
                    className={`border-l-4 ${
                      isCorrect ? "border-l-green-500" : "border-l-red-500"
                    }`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start gap-3">
                        {isCorrect ? (
                          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-1" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-1" />
                        )}
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <CardTitle className="text-base leading-relaxed">
                              Q{idx + 1}. {question.question}
                            </CardTitle>
                            {question.difficulty && (
                              <Badge variant="outline" className="flex-shrink-0">
                                {question.difficulty}
                              </Badge>
                            )}
                          </div>
                          {question.topic && (
                            <p className="text-xs text-muted-foreground">Topic: {question.topic}</p>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      <div>
                        <span className="font-semibold">Your Answer: </span>
                        <span className={isCorrect ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
                          {userAnswer ? `${userAnswer}. ${question.options[userAnswer]}` : "Not answered"}
                        </span>
                      </div>
                      {!isCorrect && (
                        <div>
                          <span className="font-semibold">Correct Answer: </span>
                          <span className="text-green-600 dark:text-green-400">
                            {question.correctAnswer}. {question.options[question.correctAnswer]}
                          </span>
                        </div>
                      )}
                      <div className="pt-2 border-t">
                        <p className="font-semibold mb-1">Explanation:</p>
                        <p className="text-muted-foreground leading-relaxed">
                          {question.explanation}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button onClick={resetQuiz} variant="outline" className="flex-1">
                <Brain className="mr-2 h-4 w-4" />
                Take Another Quiz
              </Button>
              <Button onClick={() => window.location.href = '/dashboard/interviews'} className="flex-1">
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}

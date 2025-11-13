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

export default function OAPrep() {
  const [step, setStep] = useState("setup"); // setup, quiz, results
  const [loading, setLoading] = useState(false);
  
  // Setup form state
  const [formData, setFormData] = useState({
    jobDescription: "",
    quizType: "",
    numberOfQuestions: 10,
    concepts: "",
    difficulty: "easy-to-medium"
  });
  
  // Quiz state
  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [quizStartTime, setQuizStartTime] = useState(null);
  
  // Results state
  const [results, setResults] = useState(null);

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
    try {
      const response = await axios.post(
        `${API_URL}/oa/generate`,
        formData,
        { withCredentials: true }
      );
      
      setQuiz(response.data.quiz);
      setStep("quiz");
      setQuizStartTime(Date.now());
      // Set timer: 1.5 minutes per question
      setTimeRemaining(formData.numberOfQuestions * 90);
    } catch (error) {
      console.error("Error generating quiz:", error);
      alert(error.response?.data?.message || "Failed to generate quiz. Please try again.");
    } finally {
      setLoading(false);
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

    setLoading(true);
    try {
      const response = await axios.post(
        `${API_URL}/oa/submit`,
        {
          answers: answersArray,
          quizMetadata: formData
        },
        { withCredentials: true }
      );
      
      setResults(response.data.results);
      setStep("results");
    } catch (error) {
      console.error("Error submitting quiz:", error);
      alert("Failed to submit quiz");
    } finally {
      setLoading(false);
    }
  };

  const resetQuiz = () => {
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

  // Setup Step
  if (step === "setup") {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">OA Preparation</h1>
          <p className="text-muted-foreground mt-1">Generate AI-powered quiz questions tailored to your interview prep needs</p>
        </div>

        <Card>
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
                onChange={(e) => setFormData({ ...formData, jobDescription: e.target.value })}
                className="min-h-[120px]"
              />
              <p className="text-xs text-muted-foreground">
                The more context you provide, the better tailored the questions will be
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
                  onChange={(e) => setFormData({ ...formData, numberOfQuestions: parseInt(e.target.value) || 0 })}
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
              <Label>Difficulty Level</Label>
              <div className="flex gap-2">
                <Badge 
                  variant={formData.difficulty === "easy-to-medium" ? "default" : "outline"}
                  className="cursor-pointer px-4 py-2"
                  onClick={() => setFormData({ ...formData, difficulty: "easy-to-medium" })}
                >
                  Easy to Medium
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Questions will range from fundamental concepts to moderate problem-solving
              </p>
            </div>

            <Separator />

            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm space-y-1">
                  <p className="font-medium text-blue-900 dark:text-blue-100">Quiz Guidelines</p>
                  <ul className="text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
                    <li>You'll have 1.5 minutes per question</li>
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
      <div className="p-6 max-w-4xl mx-auto">
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
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <CardTitle className="text-lg leading-relaxed flex-1">
                {question.question}
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
                    <span className="flex-1">{value}</span>
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
          <div className="mt-6 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                You have {quiz.questions.length - answeredCount} unanswered question(s). 
                Make sure to answer all questions before submitting.
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Results Step
  if (step === "results" && results) {
    const timeTaken = quizStartTime ? Math.floor((Date.now() - quizStartTime) / 1000) : 0;
    
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Card>
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

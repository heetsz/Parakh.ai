import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Brain, 
  Trophy, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  XCircle,
  Calendar,
  Target,
  BarChart3,
  ChevronDown,
  FileText,
  ChevronUp
} from "lucide-react";
import axios from "axios";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api";

export default function OAProgress() {
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedTests, setExpandedTests] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, historyRes] = await Promise.all([
        axios.get(`${API_URL}/oa/stats`, { withCredentials: true }),
        axios.get(`${API_URL}/oa/history?limit=20`, { withCredentials: true })
      ]);

      setStats(statsRes.data.stats);
      setHistory(historyRes.data.tests);
    } catch (error) {
      console.error("Error fetching OA data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Brain className="w-12 h-12 mx-auto mb-4 text-primary animate-pulse" />
            <p className="text-muted-foreground">Loading your progress...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!stats || stats.totalTests === 0) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="w-full max-w-md text-center">
            <CardHeader>
              <Brain className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <CardTitle>No Tests Yet</CardTitle>
              <CardDescription>
                You haven't completed any OA tests yet. Start your first quiz to see your progress here!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => window.location.href = '/dashboard/oa-prep'}>
                <Brain className="mr-2 h-4 w-4" />
                Start Your First Quiz
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">OA Progress</h1>
        <p className="text-muted-foreground mt-1">Track your Online Assessment performance and improvement</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTests}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.totalQuestions} questions answered
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageScore}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all tests
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Highest Score</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.highestScore}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Personal best
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pass Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.passRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Tests passed (≥60%)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Test History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Test History
          </CardTitle>
          <CardDescription>Click on any test to view detailed results</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {history.map((test) => (
              <Card key={test._id} className="border-2">
                <div 
                  className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => setExpandedTests(prev => ({ ...prev, [test._id]: !prev[test._id] }))}
                >
                  <div className="flex items-center gap-4 flex-1">
                        <div className={`p-2 rounded-lg ${test.results.passed ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'}`}>
                          {test.results.passed ? (
                            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                          )}
                        </div>
                        
                        <div className="flex-1 text-left">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium">{test.quizConfig.quizType || 'Mixed Topics'}</p>
                            <Badge variant={test.results.passed ? "default" : "destructive"} className="text-xs">
                              {test.results.percentage}%
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDate(test.completedAt)}
                            </span>
                            <span>{test.results.correctAnswers}/{test.results.totalQuestions} correct</span>
                            {test.results.timeTaken && (
                              <span>⏱️ {formatDuration(test.results.timeTaken)}</span>
                            )}
                          </div>
                        </div>
                      </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize">
                      {test.quizConfig.difficulty?.replace('-', ' ') || 'Mixed'}
                    </Badge>
                    {expandedTests[test._id] ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </div>

                {/* Expandable Content */}
                {expandedTests[test._id] && (
                  <div className="px-4 pb-4 space-y-4 border-t pt-4">
                      {/* Test Details */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Test Type:</span>
                          <span className="font-medium">{test.quizConfig.quizType || 'Mixed Topics'}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Difficulty:</span>
                          <span className="font-medium capitalize">{test.quizConfig.difficulty?.replace('-', ' ') || 'Mixed'}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Total Questions:</span>
                          <span className="font-medium">{test.results.totalQuestions}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Score:</span>
                          <span className="font-medium">{test.results.correctAnswers}/{test.results.totalQuestions}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Percentage:</span>
                          <span className={`font-medium ${test.results.passed ? 'text-green-600' : 'text-red-600'}`}>
                            {test.results.percentage}%
                          </span>
                        </div>
                        {test.results.timeTaken && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Time Taken:</span>
                            <span className="font-medium">{formatDuration(test.results.timeTaken)}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Completed:</span>
                          <span className="font-medium">{formatDate(test.completedAt)}</span>
                        </div>
                      </div>

                      {/* Performance Breakdown */}
                      {test.results.breakdown && (
                        <div>
                          <h5 className="font-semibold mb-2 text-sm">Performance by Difficulty</h5>
                          <div className="grid grid-cols-3 gap-3">
                            {test.results.breakdown.easyTotal > 0 && (
                              <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                                <p className="text-xs text-muted-foreground mb-1">Easy</p>
                                <p className="text-lg font-bold text-green-700 dark:text-green-400">
                                  {test.results.breakdown.easyCorrect}/{test.results.breakdown.easyTotal}
                                </p>
                              </div>
                            )}
                            {test.results.breakdown.mediumTotal > 0 && (
                              <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                                <p className="text-xs text-muted-foreground mb-1">Medium</p>
                                <p className="text-lg font-bold text-yellow-700 dark:text-yellow-400">
                                  {test.results.breakdown.mediumCorrect}/{test.results.breakdown.mediumTotal}
                                </p>
                              </div>
                            )}
                            {test.results.breakdown.hardTotal > 0 && (
                              <div className="text-center p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                                <p className="text-xs text-muted-foreground mb-1">Hard</p>
                                <p className="text-lg font-bold text-red-700 dark:text-red-400">
                                  {test.results.breakdown.hardCorrect}/{test.results.breakdown.hardTotal}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* View Paper Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // TODO: Navigate to detailed paper view or open modal
                          alert('View Paper feature coming soon!');
                        }}
                        className="w-full py-2.5 px-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium flex items-center justify-center gap-2"
                      >
                        <FileText className="h-4 w-4" />
                        View Paper
                      </button>
                    </div>
                )}
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

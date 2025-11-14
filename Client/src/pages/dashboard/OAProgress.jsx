import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
  PieChart,
  Pie,
  Cell,
  ComposedChart
} from "recharts";
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
  ChevronUp,
  Activity,
  Award,
  Percent,
  Download
} from "lucide-react";
import axios from "axios";
import jsPDF from "jspdf";

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

  const generatePDF = async (test) => {
    try {
      console.log('Fetching test details for:', test._id);
      
      // Fetch full test details including questions and answers
      const response = await axios.get(`${API_URL}/oa/test/${test._id}`, { 
        withCredentials: true 
      });
      
      console.log('Test details received:', response.data);
      const fullTest = response.data.test;

      if (!fullTest) {
        alert('Test data not found.');
        return;
      }

      if (!fullTest.questions || fullTest.questions.length === 0) {
        alert('No questions found in this test.');
        return;
      }

      if (!fullTest.answers || fullTest.answers.length === 0) {
        alert('No answers found for this test.');
        return;
      }

      console.log('Questions:', fullTest.questions.length);
      console.log('Answers:', fullTest.answers.length);

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      const margin = 20;
      let yPosition = 20;

      // Helper function to add new page if needed
      const checkPageBreak = (neededSpace) => {
        if (yPosition + neededSpace > pageHeight - margin) {
          doc.addPage();
          yPosition = 20;
          return true;
        }
        return false;
      };

      // Helper function to wrap text
      const wrapText = (text, maxWidth) => {
        const cleanText = String(text || '').replace(/[^\x20-\x7E\n]/g, '');
        return doc.splitTextToSize(cleanText, maxWidth);
      };

      // Helper function to check if text contains code
      const isCodeText = (text) => {
        const codeIndicators = ['```', 'class ', 'function ', 'def ', 'public ', 'private ', 'void ', 'return ', '{', '}', 'import ', 'package '];
        return codeIndicators.some(indicator => text.includes(indicator));
      };

      // Helper function to wrap code with preserved formatting
      const wrapCode = (text, maxWidth) => {
        const lines = text.split('\n');
        const wrappedLines = [];
        
        lines.forEach(line => {
          // Preserve leading whitespace for indentation
          const leadingSpaces = line.match(/^(\s*)/)[0];
          const trimmedLine = line.trim();
          
          if (trimmedLine.length === 0) {
            wrappedLines.push('');
            return;
          }
          
          if (doc.getTextWidth(line) <= maxWidth) {
            wrappedLines.push(line);
          } else {
            // Split long lines but keep indentation
            const words = trimmedLine.split(' ');
            let currentLine = leadingSpaces;
            
            words.forEach((word) => {
              const testLine = currentLine + (currentLine === leadingSpaces ? '' : ' ') + word;
              if (doc.getTextWidth(testLine) <= maxWidth) {
                currentLine = testLine;
              } else {
                if (currentLine !== leadingSpaces) {
                  wrappedLines.push(currentLine);
                }
                currentLine = leadingSpaces + '  ' + word; // Add extra indent for continuation
              }
            });
            
            if (currentLine !== leadingSpaces) {
              wrappedLines.push(currentLine);
            }
          }
        });
        
        return wrappedLines;
      };

      // Header - Title
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(37, 99, 235); // Blue color
      doc.text('Online Assessment Report', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 15;

      // Test Info Box
      doc.setFillColor(59, 130, 246);
      doc.rect(margin, yPosition, pageWidth - 2 * margin, 45, 'F');
      
      doc.setFontSize(12);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      yPosition += 10;
      doc.text(`Test Type: ${fullTest.quizConfig.quizType || 'Mixed Topics'}`, margin + 5, yPosition);
      yPosition += 8;
      doc.text(`Difficulty: ${(fullTest.quizConfig.difficulty || 'Mixed').replace('-', ' ').toUpperCase()}`, margin + 5, yPosition);
      yPosition += 8;
      doc.text(`Date: ${formatDate(fullTest.completedAt)}`, margin + 5, yPosition);
      yPosition += 8;
      doc.text(`Time Taken: ${formatDuration(fullTest.results.timeTaken || 0)}`, margin + 5, yPosition);
      yPosition += 15;

      // Score Section
      doc.setFillColor(240, 253, 244);
      doc.rect(margin, yPosition, pageWidth - 2 * margin, 35, 'F');
      
      doc.setFontSize(16);
      doc.setTextColor(22, 163, 74);
      doc.setFont('helvetica', 'bold');
      yPosition += 12;
      doc.text(`Score: ${fullTest.results.correctAnswers}/${fullTest.results.totalQuestions}`, margin + 5, yPosition);
      
      doc.setFontSize(14);
      yPosition += 10;
      doc.text(`Percentage: ${fullTest.results.percentage}%`, margin + 5, yPosition);
      doc.text(`Status: ${fullTest.results.passed ? 'PASSED' : 'FAILED'}`, pageWidth - margin - 60, yPosition);
      yPosition += 20;

      // Questions and Answers
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      checkPageBreak(15);
      doc.text('Questions & Answers', margin, yPosition);
      yPosition += 12;

      fullTest.questions.forEach((q, index) => {
        checkPageBreak(80);

        // Get the answer object for this question
        const answerObj = fullTest.answers[index] || {};
        const userAnswer = answerObj.selectedAnswer || '';
        const correctAnswer = answerObj.correctAnswer || q.correctAnswer || '';

        // Question number and text
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        const questionHeader = `Q${index + 1}. [${(q.difficulty || 'medium').toUpperCase()}]`;
        doc.text(questionHeader, margin, yPosition);
        yPosition += 7;

        doc.setFont('helvetica', 'normal');
        const questionText = q.question || '';
        const hasCode = questionText.includes('```') || questionText.includes('class ') || 
                        questionText.includes('function ') || questionText.includes('def ') ||
                        questionText.includes('{') || questionText.includes('public ');
        
        let questionLines;
        if (hasCode) {
          // Use monospace font and preserve formatting for code
          doc.setFont('courier', 'normal');
          questionLines = wrapCode(questionText, pageWidth - 2 * margin);
        } else {
          questionLines = wrapText(questionText, pageWidth - 2 * margin);
        }
        
        questionLines.forEach(line => {
          checkPageBreak(7);
          doc.text(line, margin, yPosition);
          yPosition += 6;
        });
        
        // Reset to normal font
        doc.setFont('helvetica', 'normal');
        yPosition += 3;

        // Options
        const options = q.options || [];
        
        ['A', 'B', 'C', 'D'].forEach((option, optIndex) => {
          if (optIndex >= options.length) return; // Skip if option doesn't exist
          
          checkPageBreak(7);
          const optionText = options[optIndex] || '';
          const isCorrect = correctAnswer === option;
          const isUserAnswer = userAnswer === option;

          doc.setFontSize(11);
          
          if (isCorrect) {
            doc.setTextColor(22, 163, 74); // Green for correct
            doc.setFont('helvetica', 'bold');
          } else if (isUserAnswer && !isCorrect) {
            doc.setTextColor(220, 38, 38); // Red for wrong user answer
            doc.setFont('helvetica', 'bold');
          } else {
            doc.setTextColor(100, 100, 100);
            doc.setFont('helvetica', 'normal');
          }

          const prefix = isCorrect ? `${option}) [CORRECT] ` : isUserAnswer ? `${option}) [SELECTED] ` : `${option}) `;
          
          // Check if option contains code
          const optionHasCode = optionText.includes('```') || optionText.includes('class ') || 
                                optionText.includes('function ') || optionText.includes('{') ||
                                optionText.includes('public ') || optionText.includes('def ');
          
          let optionLines;
          if (optionHasCode) {
            // Use monospace font for code options
            const currentFont = doc.getFont();
            doc.setFont('courier', currentFont.fontStyle);
            optionLines = wrapCode(prefix + optionText, pageWidth - 2 * margin - 5);
          } else {
            optionLines = wrapText(prefix + optionText, pageWidth - 2 * margin - 5);
          }
          
          optionLines.forEach((line) => {
            checkPageBreak(6);
            doc.text(line, margin + 5, yPosition);
            yPosition += 6;
          });
          
          // Reset font
          if (optionHasCode) {
            doc.setFont('helvetica', 'normal');
          }
        });

        // Result indicator
        yPosition += 2;
        checkPageBreak(10);
        doc.setFontSize(10);
        const isCorrectAnswer = userAnswer === correctAnswer;
        if (isCorrectAnswer) {
          doc.setTextColor(22, 163, 74);
          doc.setFont('helvetica', 'bold');
          doc.text('CORRECT', margin + 5, yPosition);
        } else {
          doc.setTextColor(220, 38, 38);
          doc.setFont('helvetica', 'bold');
          doc.text(`INCORRECT - Correct Answer: ${correctAnswer}`, margin + 5, yPosition);
        }
        yPosition += 10;

        // Divider line
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 10;
      });

      // Summary at the end
      checkPageBreak(40);
      doc.setFillColor(249, 250, 251);
      doc.rect(margin, yPosition, pageWidth - 2 * margin, 35, 'F');
      
      yPosition += 10;
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      doc.text('Performance Summary:', margin + 5, yPosition);
      yPosition += 8;
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      if (fullTest.results.breakdown) {
        const b = fullTest.results.breakdown;
        if (b.easyTotal > 0) {
          doc.text(`Easy Questions: ${b.easyCorrect}/${b.easyTotal}`, margin + 5, yPosition);
          yPosition += 6;
        }
        if (b.mediumTotal > 0) {
          doc.text(`Medium Questions: ${b.mediumCorrect}/${b.mediumTotal}`, margin + 5, yPosition);
          yPosition += 6;
        }
        if (b.hardTotal > 0) {
          doc.text(`Hard Questions: ${b.hardCorrect}/${b.hardTotal}`, margin + 5, yPosition);
        }
      }

      // Save PDF
      const testType = (fullTest.quizConfig.quizType || 'Mixed').replace(/[^a-zA-Z0-9]/g, '_');
      const dateStr = new Date(fullTest.completedAt).toISOString().split('T')[0];
      const fileName = `OA_Test_${testType}_${dateStr}.pdf`;
      
      console.log('Saving PDF as:', fileName);
      doc.save(fileName);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      console.error('Error details:', error.message);
      alert(`Failed to generate PDF: ${error.message || 'Please try again.'}`);
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

  // Prepare chart data
  const scoreHistory = history.slice(0, 10).reverse().map((test, idx) => ({
    test: `#${idx + 1}`,
    score: test.results.percentage,
    date: new Date(test.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }));

  const passFailData = [
    { name: 'Passed', value: Math.round((stats.passRate / 100) * stats.totalTests), color: '#10b981' },
    { name: 'Failed', value: stats.totalTests - Math.round((stats.passRate / 100) * stats.totalTests), color: '#ef4444' }
  ];

  return (
    <div className="p-6 space-y-6 max-w-[100vw] overflow-x-hidden">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">OA Performance Dashboard</h1>
        <p className="text-muted-foreground">Track your Online Assessment performance and improvement</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 shadow-lg bg-linear-to-br from-indigo-500 to-purple-600 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-white/90">Total Tests</CardTitle>
            <BarChart3 className="h-5 w-5 text-white/80" />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold">{stats.totalTests}</div>
            <p className="text-xs text-white/70 mt-1 flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              {stats.totalQuestions} questions answered
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-linear-to-br from-cyan-500 to-blue-600 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-white/90">Average Score</CardTitle>
            <Target className="h-5 w-5 text-white/80" />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold">{stats.averageScore}%</div>
            <p className="text-xs text-white/70 mt-1">
              Across all tests
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-linear-to-br from-amber-500 to-yellow-600 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-white/90">Highest Score</CardTitle>
            <Trophy className="h-5 w-5 text-white/80" />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold">{stats.highestScore}%</div>
            <p className="text-xs text-white/70 mt-1">
              Personal best
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-linear-to-br from-green-500 to-emerald-600 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-white/90">Pass Rate</CardTitle>
            <Percent className="h-5 w-5 text-white/80" />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold">{stats.passRate}%</div>
            <p className="text-xs text-white/70 mt-1">
              Tests passed (≥60%)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Score Progression Chart */}
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  Score Progression
                </CardTitle>
                <CardDescription>Your recent test scores</CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <ResponsiveContainer width="100%" height={320}>
                  <ComposedChart data={scoreHistory}>
                    <defs>
                      <linearGradient id="colorOAScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                      stroke="#6b7280"
                    />
                    <YAxis 
                      domain={[0, 100]} 
                      tick={{ fontSize: 12 }}
                      stroke="#6b7280"
                      label={{ value: 'Score (%)', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="score"
                      stroke="#06b6d4"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorOAScore)"
                    />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#0891b2"
                      strokeWidth={2}
                      dot={{ fill: '#06b6d4', r: 5 }}
                      activeDot={{ r: 7 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Pass/Fail Distribution */}
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary" />
                  Pass/Fail Distribution
                </CardTitle>
                <CardDescription>Overall success rate</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Pie
                      data={passFailData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {passFailData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Test Performance Analysis
              </CardTitle>
              <CardDescription>Detailed score breakdown</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={scoreHistory}>
                  <defs>
                    <linearGradient id="colorOABar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={1} />
                      <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.8} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 11, fill: '#6b7280' }}
                  />
                  <YAxis 
                    domain={[0, 100]} 
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    label={{ value: 'Score (%)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar 
                    dataKey="score" 
                    fill="url(#colorOABar)" 
                    radius={[8, 8, 0, 0]}
                    maxBarSize={60}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Test History
              </CardTitle>
              <CardDescription>Click on any test to view detailed results</CardDescription>
            </CardHeader>
            <CardContent className="max-h-[600px] overflow-y-auto">
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

                      {/* Download Paper Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          generatePDF(test);
                        }}
                        className="w-full py-2.5 px-4 bg-linear-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 font-medium flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                      >
                        <Download className="h-4 w-4" />
                        Download Paper (PDF)
                      </button>
                    </div>
                )}
              </Card>
            ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

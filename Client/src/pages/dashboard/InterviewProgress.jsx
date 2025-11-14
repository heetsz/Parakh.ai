import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
  ComposedChart
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Award,
  Target,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  BarChart3,
  Activity,
  Users,
  Clock
} from "lucide-react";

export default function InterviewProgress() {
  const base_url = import.meta.env.VITE_BACKEND_URL;
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${base_url}/interviews/progress`, {
        withCredentials: true,
      });
      console.log("📊 Progress Analytics Response:", res.data);
      setAnalytics(res.data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
      setError("Failed to load progress data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Activity className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading your progress...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle />
              Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!analytics || analytics.totalInterviews === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <Sparkles className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <CardTitle>Start Your Journey!</CardTitle>
            <CardDescription>
              Complete your first interview to see your progress analytics and insights.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => (window.location.href = "/dashboard/interviews")}>
              Take Your First Interview
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Prepare data for category radar chart
  const radarData = analytics.categoryScores && typeof analytics.categoryScores === 'object'
    ? Object.entries(analytics.categoryScores).map(([key, value]) => ({
        category: key.replace(/([A-Z])/g, " $1").trim(),
        score: value || 0,
        fullMark: 100,
      }))
    : [];

  // Format timeline data for area chart
  const timelineData = Array.isArray(analytics.timeline)
    ? analytics.timeline.map((item) => ({
        date: new Date(item.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        score: item.overallScore || 0,
        role: item.role || "N/A",
      }))
    : [];

  // Category data for bar chart
  const categoryBarData = analytics.categoryScores && typeof analytics.categoryScores === 'object'
    ? Object.entries(analytics.categoryScores).map(([key, value]) => ({
        category: key
          .replace(/([A-Z])/g, " $1")
          .trim()
          .split(" ")
          .map((w) => w[0].toUpperCase() + w.slice(1))
          .join(" "),
        score: value || 0,
      }))
    : [];

  return (
    <div className="p-6 space-y-6 max-w-[100vw] overflow-x-hidden">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Interview Performance Dashboard</h1>
        <p className="text-muted-foreground">Track your progress and identify areas for improvement</p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-lg bg-linear-to-br from-blue-500 to-blue-600 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-white/90">
              Total Interviews
            </CardTitle>
            <Users className="h-5 w-5 text-white/80" />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold">{analytics.totalInterviews}</div>
            <p className="text-xs text-white/70 mt-1 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Completed successfully
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-linear-to-br from-green-500 to-emerald-600 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-white/90">
              Average Score
            </CardTitle>
            <Target className="h-5 w-5 text-white/80" />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold">{analytics.averageScore}%</div>
            <p className="text-xs text-white/70 mt-1">Recent performance</p>
          </CardContent>
        </Card>

        <Card className={`border-0 shadow-lg text-white overflow-hidden relative ${
          analytics.improvement >= 0
            ? "bg-linear-to-br from-purple-500 to-pink-600"
            : "bg-linear-to-br from-orange-500 to-red-600"
        }`}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-white/90">
              Improvement
            </CardTitle>
            {analytics.improvement >= 0 ? (
              <TrendingUp className="h-5 w-5 text-white/80" />
            ) : (
              <TrendingDown className="h-5 w-5 text-white/80" />
            )}
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold">
              {analytics.improvement > 0 ? "+" : ""}
              {analytics.improvement}%
            </div>
            <p className="text-xs text-white/70 mt-1">Since first interview</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-linear-to-br from-amber-500 to-orange-600 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-white/90">
              Focus Areas
            </CardTitle>
            <Sparkles className="h-5 w-5 text-white/80" />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold">{analytics.nextFocusAreas.length}</div>
            <p className="text-xs text-white/70 mt-1">Areas to improve</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="skills">Skills Analysis</TabsTrigger>
          <TabsTrigger value="timeline">History</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Progress Trend Chart */}
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  Performance Trend
                </CardTitle>
                <CardDescription>Your score progression over time</CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <ResponsiveContainer width="100%" height={320}>
                  <ComposedChart data={timelineData}>
                    <defs>
                      <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
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
                      stroke="#3b82f6"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorScore)"
                    />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#2563eb"
                      strokeWidth={2}
                      dot={{ fill: '#3b82f6', r: 5 }}
                      activeDot={{ r: 7 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Skills Radar Chart */}
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Skills Breakdown
                </CardTitle>
                <CardDescription>Performance across different categories</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={320}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#e5e7eb" />
                    <PolarAngleAxis 
                      dataKey="category" 
                      tick={{ fontSize: 11, fill: '#6b7280' }}
                    />
                    <PolarRadiusAxis 
                      angle={90} 
                      domain={[0, 100]} 
                      tick={{ fontSize: 10, fill: '#6b7280' }}
                    />
                    <Radar
                      name="Your Score"
                      dataKey="score"
                      stroke="#8b5cf6"
                      fill="#8b5cf6"
                      fillOpacity={0.6}
                      strokeWidth={2}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px'
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Skills Analysis Tab */}
        <TabsContent value="skills" className="space-y-4">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Category Performance Analysis
              </CardTitle>
              <CardDescription>
                Detailed breakdown of your skills across different categories
              </CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={categoryBarData}>
                  <defs>
                    <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
                      <stop offset="100%" stopColor="#059669" stopOpacity={0.8} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                  <XAxis 
                    dataKey="category" 
                    tick={{ fontSize: 11, fill: '#6b7280' }}
                    angle={-15}
                    textAnchor="end"
                    height={80}
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
                    fill="url(#colorBar)" 
                    radius={[8, 8, 0, 0]}
                    maxBarSize={60}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Strengths and Weaknesses */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
                  <CheckCircle2 className="w-5 h-5" />
                  Your Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Array.isArray(analytics.strengths) && analytics.strengths.map((strength, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg"
                    >
                      <span className="text-sm">{strength.text}</span>
                      <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                        {strength.count}x
                      </Badge>
                    </div>
                  ))}
                  {(!Array.isArray(analytics.strengths) || analytics.strengths.length === 0) && (
                    <p className="text-sm text-muted-foreground">
                      Complete more interviews to identify patterns
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-orange-200 bg-orange-50/50 dark:bg-orange-950/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-400">
                  <AlertCircle className="w-5 h-5" />
                  Areas to Improve
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Array.isArray(analytics.weaknesses) && analytics.weaknesses.map((weakness, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg"
                    >
                      <span className="text-sm">{weakness.text}</span>
                      <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-300">
                        {weakness.count}x
                      </Badge>
                    </div>
                  ))}
                  {(!Array.isArray(analytics.weaknesses) || analytics.weaknesses.length === 0) && (
                    <p className="text-sm text-muted-foreground">
                      Great! No consistent weaknesses identified yet.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Interview History
              </CardTitle>
              <CardDescription>Complete timeline of all your interviews</CardDescription>
            </CardHeader>
            <CardContent className="max-h-[600px] overflow-y-auto">
              <div className="space-y-4">
                {Array.isArray(analytics.timeline) && analytics.timeline.map((interview, index) => (
                  <div
                    key={interview.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 border rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="flex-0">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                        #{index + 1}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{interview.role}</h4>
                        <Badge variant="outline">{interview.difficulty}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(interview.date).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{interview.overallScore}%</div>
                      <p className="text-xs text-muted-foreground">Score</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          <Card className="border-purple-200 bg-linear-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-400">
                <Target className="w-5 h-5" />
                Next Focus Areas
              </CardTitle>
              <CardDescription className="text-purple-600 dark:text-purple-300">
                AI-generated recommendations for your next steps
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {Array.isArray(analytics.nextFocusAreas) && analytics.nextFocusAreas.map((area, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg border-l-4 border-purple-500"
                  >
                    <div className="flex-0 w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-purple-700 dark:text-purple-300 font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{area.text}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Mentioned in {area.count} interview{area.count > 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                ))}
                {(!Array.isArray(analytics.nextFocusAreas) || analytics.nextFocusAreas.length === 0) && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Complete more interviews to get personalized recommendations</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Motivational Card */}
          <Card className="bg-linear-to-r from-blue-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <Award className="w-16 h-16" />
                <div>
                  <h3 className="text-2xl font-bold mb-2">Keep Going! 🚀</h3>
                  <p className="opacity-90">
                    You've completed {analytics.totalInterviews} interview
                    {analytics.totalInterviews > 1 ? "s" : ""}. Every interview makes you
                    stronger. Your improvement of {analytics.improvement > 0 ? "+" : ""}
                    {analytics.improvement}% shows your dedication!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

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
  AreaChart
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
  Activity
} from "lucide-react";

export default function InterviewProgress() {
  const base_url = import.meta.env.VITE_BACKEND_URL;
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalytics();
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
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="bg-linear-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-600 dark:text-blue-400">
              Total Interviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analytics.totalInterviews}</div>
            <p className="text-xs text-muted-foreground mt-1">Completed successfully</p>
          </CardContent>
        </Card>

        <Card className="bg-linear-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600 dark:text-green-400">
              Current Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analytics.averageScore}%</div>
            <p className="text-xs text-muted-foreground mt-1">Recent average</p>
          </CardContent>
        </Card>

        <Card className={`bg-linear-to-br ${
          analytics.improvement >= 0
            ? "from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200"
            : "from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200"
        }`}>
          <CardHeader className="pb-2">
            <CardTitle className={`text-sm font-medium ${
              analytics.improvement >= 0 ? "text-purple-600 dark:text-purple-400" : "text-orange-600 dark:text-orange-400"
            }`}>
              Improvement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-3xl font-bold">
                {analytics.improvement > 0 ? "+" : ""}
                {analytics.improvement}%
              </div>
              {analytics.improvement >= 0 ? (
                <TrendingUp className="w-6 h-6 text-green-500" />
              ) : (
                <TrendingDown className="w-6 h-6 text-red-500" />
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Since first interview</p>
          </CardContent>
        </Card>

        <Card className="bg-linear-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900 border-yellow-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
              Focus Areas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analytics.nextFocusAreas.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Areas to improve</p>
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
          <div className="grid md:grid-cols-2 gap-6">
            {/* Progress Trend Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Overall Progress Trend
                </CardTitle>
                <CardDescription>Your performance over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={timelineData}>
                    <defs>
                      <linearlinear id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                      </linearlinear>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="score"
                      stroke="#8884d8"
                      fillOpacity={1}
                      fill="url(#colorScore)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Skills Radar Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Skills Overview
                </CardTitle>
                <CardDescription>Average scores by category</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="category" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar
                      name="Your Score"
                      dataKey="score"
                      stroke="#8884d8"
                      fill="#8884d8"
                      fillOpacity={0.6}
                    />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Skills Analysis Tab */}
        <TabsContent value="skills" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Category-Wise Performance</CardTitle>
              <CardDescription>
                Detailed breakdown of your skills across different categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={categoryBarData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="score" fill="#8884d8" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Strengths and Weaknesses */}
          <div className="grid md:grid-cols-2 gap-4">
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
            <CardContent>
              <div className="space-y-4">
                {Array.isArray(analytics.timeline) && analytics.timeline.map((interview, index) => (
                  <div
                    key={interview.id}
                    className="flex items-center gap-4 p-4 border rounded-lg hover:bg-accent transition-colors"
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
              <div className="flex items-center gap-4">
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

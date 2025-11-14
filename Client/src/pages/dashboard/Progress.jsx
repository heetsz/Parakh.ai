import React from "react";
import {
  Award,
  TrendingUp,
  TrendingDown,
  BarChart3,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Target,
  Sparkles,
} from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
} from "recharts";

import InterviewProgress from "./InterviewProgress";
import OAProgress from "./OAProgress";

export default function Progress({
  analytics,
  timelineData,
  radarData,
  categoryBarData,
}) {
  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Your Progress Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Monitor your performance and growth across interviews and assessments
          </p>
        </div>
        <Award className="w-16 h-16 text-yellow-500" />
      </div>

      {/* ----------------------- MAIN TABS ----------------------- */}
      <Tabs defaultValue="interview" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="interview">Interview Progress</TabsTrigger>
          <TabsTrigger value="oa">OA Progress</TabsTrigger>
        </TabsList>

        {/* INTERVIEW PROGRESS */}
        <TabsContent value="interview" className="mt-6">
          <InterviewProgress />
        </TabsContent>

        {/* OA PROGRESS */}
        <TabsContent value="oa" className="mt-6">
          <OAProgress />
        </TabsContent>
      </Tabs>

      {/* ----------------------- ANALYTICS CARDS ----------------------- */}
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

        <Card
          className={`bg-linear-to-br ${analytics.improvement >= 0
              ? "from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200"
              : "from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200"
            }`}
        >
          <CardHeader className="pb-2">
            <CardTitle
              className={`text-sm font-medium ${analytics.improvement >= 0
                  ? "text-purple-600 dark:text-purple-400"
                  : "text-orange-600 dark:text-orange-400"
                }`}
            >
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

      {/* ----------------------- CHARTS & TABS ----------------------- */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="skills">Skills Analysis</TabsTrigger>
          <TabsTrigger value="timeline">History</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        {/* ----------------------- OVERVIEW TAB ----------------------- */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            {/* AREA CHART */}
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
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />

                    <defs>
                      <linearlinear id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                      </linearlinear>
                    </defs>

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

            {/* RADAR CHART */}
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

        {/* ----------------------- SKILLS TAB ----------------------- */}
        <TabsContent value="skills" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Category-Wise Performance</CardTitle>
              <CardDescription>Detailed breakdown of your skills</CardDescription>
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

          {/* STRENGTHS & WEAKNESSES */}
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
                  {analytics.strengths.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      Complete more interviews to identify patterns
                    </p>
                  )}

                  {analytics.strengths.map((strength, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg"
                    >
                      <span className="text-sm">{strength.text}</span>
                      <Badge variant="outline" className="bg-green-100 text-green-700">
                        {strength.count}x
                      </Badge>
                    </div>
                  ))}
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
                  {analytics.weaknesses.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      Great! No consistent weaknesses identified yet.
                    </p>
                  )}

                  {analytics.weaknesses.map((weakness, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg"
                    >
                      <span className="text-sm">{weakness.text}</span>
                      <Badge variant="outline" className="bg-orange-100 text-orange-700">
                        {weakness.count}x
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ----------------------- TIMELINE TAB ----------------------- */}
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
                {analytics.timeline.map((interview, index) => (
                  <div
                    key={interview.id}
                    className="flex items-center gap-4 p-4 border rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="shrink-0">
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

        {/* ----------------------- INSIGHTS TAB ----------------------- */}
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
                {analytics.nextFocusAreas.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Complete more interviews to get personalized recommendations</p>
                  </div>
                )}

                {analytics.nextFocusAreas.map((area, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg border-l-4 border-purple-500"
                  >
                    <div className="shrink-0 w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-purple-700 dark:text-purple-300 font-bold">
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
              </div>
            </CardContent>
          </Card>

          {/* MOTIVATIONAL CARD */}
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

import React from "react";
import { Award } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import InterviewProgress from "./InterviewProgress";
import OAProgress from "./OAProgress";

export default function Progress() {
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
    </div>
  );
}

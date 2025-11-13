import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Construction } from "lucide-react";

export default function OAProgress() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <Construction className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <CardTitle className="flex items-center justify-center gap-2">
            <Brain className="w-6 h-6" />
            OA Progress Coming Soon
          </CardTitle>
          <CardDescription>
            Track your Online Assessment performance and analytics here. This feature is currently under development.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Check back soon to see detailed insights about your OA preparation journey!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/dashboard/Navbar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("interviews");
  const base_url = import.meta.env.VITE_BACKEND_URL;
  const email = localStorage.getItem("email");
  
  return (
    <div className="h-screen flex flex-col">
      <Navbar email={email} />

      <div className="flex flex-1 pt-16">
        {/* Sidebar */}
        <aside className="w-64 border-r bg-background flex flex-col">
          {/* Top Navigation Items */}
          <nav className="flex-1 p-4 space-y-1">
            <Button
              variant={activeTab === "interviews" ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("interviews")}
            >
              Interviews
            </Button>
            <Button
              variant={activeTab === "progress" ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("progress")}
            >
              Progress
            </Button>
            <Button
              variant={activeTab === "community" ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("community")}
            >
              Community
            </Button>
            <Button
              variant={activeTab === "gamification" ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("gamification")}
            >
              Gamification
            </Button>
            <Button
              variant={activeTab === "study" ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("study")}
            >
              Study Material
            </Button>
          </nav>

          {/* Bottom Settings */}
          <div className="p-4">
            <Separator className="mb-4" />
            <Button
              variant={activeTab === "settings" ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("settings")}
            >
              Settings
            </Button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-8 overflow-auto">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-semibold mb-8">Dashboard</h1>

            {activeTab === "interviews" && (
              <div className="grid grid-cols-2 gap-6">
                {/* Create Interview Card */}
                <div className="border rounded-lg p-8 flex flex-col items-center justify-center hover:border-primary transition-colors cursor-pointer">
                  <div className="text-5xl mb-4">+</div>
                  <h3 className="text-lg font-medium">Create Interview</h3>
                </div>

                {/* Past Interviews Card */}
                <div className="border rounded-lg p-8 flex flex-col items-center justify-center hover:border-primary transition-colors cursor-pointer">
                  <h3 className="text-lg font-medium">Past Interviews</h3>
                </div>
              </div>
            )}

            {activeTab === "progress" && (
              <div className="border rounded-lg p-8">
                <h2 className="text-xl font-semibold mb-4">Your Progress</h2>
                <p className="text-muted-foreground">Track your interview performance and improvement over time.</p>
              </div>
            )}

            {activeTab === "community" && (
              <div className="border rounded-lg p-8">
                <h2 className="text-xl font-semibold mb-4">Community</h2>
                <p className="text-muted-foreground">Connect with other users and share experiences.</p>
              </div>
            )}

            {activeTab === "gamification" && (
              <div className="border rounded-lg p-8">
                <h2 className="text-xl font-semibold mb-4">Gamification</h2>
                <p className="text-muted-foreground">Earn badges and rewards for completing interviews.</p>
              </div>
            )}

            {activeTab === "study" && (
              <div className="border rounded-lg p-8">
                <h2 className="text-xl font-semibold mb-4">Study Material</h2>
                <p className="text-muted-foreground">Access resources to prepare for your interviews.</p>
              </div>
            )}

            {activeTab === "settings" && (
              <div className="border rounded-lg p-8">
                <h2 className="text-xl font-semibold mb-4">Settings</h2>
                <p className="text-muted-foreground">Manage your account preferences and configurations.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
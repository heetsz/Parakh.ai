import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";

export default function Sidebar() {
      const [collapsed, setCollapsed] = useState(false);
      const location = useLocation();
      const activeTab = location.pathname.split("/").pop();

      return (
            <aside className={`border-r bg-background flex flex-col transition-width duration-300 ${collapsed ? "w-16" : "w-64"}`}>
                  {/* Collapse button */}
                  <div className="p-2 flex justify-end">
                        <Button size="sm" onClick={() => setCollapsed(!collapsed)}>
                              {collapsed ? "→" : "←"}
                        </Button>
                  </div>

                  {/* Navigation */}
                  <nav className="flex-1 p-4 space-y-1">
                        <Link
                              to="interviews"
                              className={`block p-2 rounded ${activeTab === "interviews" ? "bg-primary text-white" : ""}`}
                        >
                              {collapsed ? "I" : "Interviews"}
                        </Link>
                        <Link
                              to="progress"
                              className={`block p-2 rounded ${activeTab === "progress" ? "bg-primary text-white" : ""}`}
                        >
                              {collapsed ? "P" : "Progress"}
                        </Link>
                  </nav>
            </aside>
      );
}

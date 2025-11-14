import { AppSidebar } from "@/components/app-sidebar";
import {
      Breadcrumb,
      BreadcrumbItem,
      BreadcrumbLink,
      BreadcrumbList,
      BreadcrumbPage,
      BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import React from 'react'

import { Separator } from "@/components/ui/separator";
import {
      SidebarInset,
      SidebarProvider,
      SidebarTrigger,
} from "@/components/ui/sidebar";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

// Map route segments to readable labels
const segmentLabels = {
      dashboard: "Dashboard",
      interviews: "Interviews",
      progress: "Progress",
      community: "Community",
      gamification: "Gamification",
      settings: "Settings",
      "create-interview": "Create Interview",
      "interview-live": "Live Interview",
      "study-material-leetcode": "LeetCode Study",
      "study-material-strivers": "Striver's Study",
};

function getBreadcrumbs(pathname) {
      // Split path and filter empty segments
      const segments = pathname.split("/").filter(Boolean);
      
      // Build breadcrumb data with proper labels
      return segments.map((segment, idx) => {
            const url = "/" + segments.slice(0, idx + 1).join("/");
            const name = segmentLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
            return { name, url };
      });
}

export default function Page() {
      const location = useLocation();
      const navigate = useNavigate();
      const breadcrumbs = getBreadcrumbs(location.pathname);

      return (
            <SidebarProvider>
                  <AppSidebar />
                  <SidebarInset>
                        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-11">
                              <div className="flex items-center gap-2 px-6">
                                    <SidebarTrigger className="-ml-1 text-foreground hover:bg-accent hover:text-foreground" />
                                    <Separator
                                          orientation="vertical"
                                          className="mr-3 data-[orientation=vertical]:h-5 bg-border"
                                    />
                                    <Breadcrumb>
                                          <BreadcrumbList>
                                                {breadcrumbs.map((crumb, idx) => (
                                                      <React.Fragment key={crumb.url}>
                                                            {idx > 0 && <BreadcrumbSeparator className="text-muted-foreground" />}
                                                            <BreadcrumbItem>
                                                                  {idx === breadcrumbs.length - 1 ? (
                                                                        <BreadcrumbPage className="font-semibold text-lg">
                                                                              {crumb.name}
                                                                        </BreadcrumbPage>
                                                                  ) : (
                                                                        <BreadcrumbLink 
                                                                              onClick={() => navigate(crumb.url)}
                                                                              className="cursor-pointer text-muted-foreground hover:text-foreground font-medium text-base transition-colors duration-200"
                                                                        >
                                                                              {crumb.name}
                                                                        </BreadcrumbLink>
                                                                  )}
                                                            </BreadcrumbItem>
                                                      </React.Fragment>
                                                ))}
                                          </BreadcrumbList>
                                    </Breadcrumb>
                              </div>
                        </header>
                        <div className="min-h-screen">
                              <Outlet />
                        </div>
                  </SidebarInset>
            </SidebarProvider>
      );
}

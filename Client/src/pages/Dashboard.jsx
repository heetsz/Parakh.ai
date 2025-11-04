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
import { Outlet, useLocation, Link } from "react-router-dom";

function getBreadcrumbs(pathname) {
      // Split path and filter empty segments
      const segments = pathname.split("/").filter(Boolean);
      // Build breadcrumb data
      return segments.map((segment, idx) => {
            const url = "/" + segments.slice(0, idx + 1).join("/");
            return { name: segment.charAt(0).toUpperCase() + segment.slice(1), url };
      });
}

export default function Page() {
      const location = useLocation();
      const breadcrumbs = getBreadcrumbs(location.pathname);

      return (
            <SidebarProvider>
                  <AppSidebar />
                  <SidebarInset>
                        <header className="flex h-14 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-11">
                              <div className="flex items-center gap-2 px-4">
                                    <SidebarTrigger className="-ml-1" />
                                    <Separator
                                          orientation="vertical"
                                          className="mr-2 data-[orientation=vertical]:h-4"
                                    />
                                    <Breadcrumb>
                                          <BreadcrumbList>
                                                <BreadcrumbItem>
                                                      <BreadcrumbLink as={Link} to="/">
                                                            Home
                                                      </BreadcrumbLink>
                                                </BreadcrumbItem>
                                                {breadcrumbs.map((crumb, idx) => (
                                                      <React.Fragment key={crumb.url}>
                                                            <BreadcrumbSeparator />
                                                            <BreadcrumbItem>
                                                                  {idx === breadcrumbs.length - 1 ? (
                                                                        <BreadcrumbPage>{crumb.name}</BreadcrumbPage>
                                                                  ) : (
                                                                        <BreadcrumbLink as={Link} to={crumb.url}>
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
                        <Outlet />
                  </SidebarInset>
            </SidebarProvider>
      );
}

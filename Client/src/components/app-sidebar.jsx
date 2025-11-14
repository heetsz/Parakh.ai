"use client"

import * as React from "react"
import {
  BookOpen,
  GalleryVerticalEnd,
  Settings,
  Users,
  Trophy,
  TrendingUp,
  MessageSquare,
  Code,
  ListChecks,
  Brain,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"

import { useState, useEffect } from "react"
import axios from "axios"

export function AppSidebar(props) {
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    const base_url = import.meta.env.VITE_BACKEND_URL
    const fetchProtectedData = async () => {
      try {
        const response = await axios.get(`${base_url}/me`, {
          withCredentials: true,
        })
        setProfile(response.data)
      } catch (err) {
        console.error("Error fetching profile:", err)
      }
    }

    fetchProtectedData()
  }, [])

  if (!profile) return null

  const data = {
    user: {
      name: profile.name,
      email: profile.email,
      avatar: profile.image || `https://avatar.iran.liara.run/username?username=${profile.name}&background=0A74DA&color=FFFFFF&length=2`,
    },
    teams: [
      {
        name: "Parakh.ai",
        logo: "/logo.png",
        plan: `"Assess. Improve. Ace"`
      },
    ],
    navMain: [
      // Single-tab sections
      { title: "Interviews", url: "/dashboard/interviews", icon: Users, isActive: true },
      { title: "OA Preparation", url: "/dashboard/oa-prep", icon: Brain },
      {
        title: "Track Progress",
        url: "/dashboard/progress",
        icon: TrendingUp,
        items: [
          { title: "Interview Progress", url: "/dashboard/progress/interview", icon: Users },
          { title: "OA Progress", url: "/dashboard/progress/oa", icon: Brain },
        ],
      },
      { title: "Community", url: "/dashboard/community", icon: MessageSquare },
      { title: "System Design Board", url: "/dashboard/system-design", icon: GalleryVerticalEnd },
    ],
  }

  return (
    <Sidebar collapsible="icon" {...props} className="bg-sidebar border-sidebar-border">
      <SidebarHeader className="bg-sidebar border-b border-sidebar-border">
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent className="bg-sidebar">
        <NavMain items={data.navMain} />
        {/* Bottom Settings button aligned with other menu items */}
        <SidebarGroup className="mt-auto">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton 
                asChild 
                tooltip="Settings"
                className="text-sidebar-foreground border border-gray-700/50 bg-gray-800/40 hover:bg-[#DFFF00] hover:text-black hover:border-[#DFFF00]/50 transition-all duration-200 font-medium text-sm rounded-md"
              >
                <a href="/dashboard/settings">
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="bg-sidebar border-t border-sidebar-border">
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail className="bg-sidebar-border" />
    </Sidebar>
  )
}

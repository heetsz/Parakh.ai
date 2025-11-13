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
      avatar: `https://avatar.iran.liara.run/username?username=${profile.name}&background=0A74DA&color=FFFFFF&length=2`,
    },
    teams: [
      {
        name: "Parakh.ai",
        logo: GalleryVerticalEnd,
        plan: "Enterprise",
      },
    ],
    navMain: [
      // Single-tab sections
      { title: "Interviews", url: "/dashboard/interviews", icon: Users, isActive: true },
      { title: "OA Prep", url: "/dashboard/oa-prep", icon: Brain },
      { title: "Progress", url: "/dashboard/progress", icon: TrendingUp },
      { title: "Community", url: "/dashboard/community", icon: MessageSquare },
      { title: "Gamification", url: "/dashboard/gamification", icon: Trophy },
      { title: "System Design Board", url: "/dashboard/system-design", icon: GalleryVerticalEnd },   
      {
        title: "Study Material",
        url: "/dashboard/study-material",
        icon: BookOpen,
        items: [
          { title: "Leetcode Questions", url: "/dashboard/study-material/leetcode", icon: Code },
          { title: "Striver's Sheet", url: "/dashboard/study-material/strivers-sheet", icon: ListChecks },
        ],
      },
    ],
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* Bottom Settings button aligned with other menu items */}
        <SidebarGroup className="mt-auto">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Settings">
                <a href="/dashboard/settings">
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

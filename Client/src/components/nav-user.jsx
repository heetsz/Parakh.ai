import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Sparkles,
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import React, { useState } from "react";
import axios from "axios";
import { useNotification } from "@/components/ui/notification";
import { Link } from "react-router-dom";

export function NavUser({
  user
}) {
  const base_url = import.meta.env.VITE_BACKEND_URL;
  const [loading, setLoading] = useState(false);
  const { unread } = useNotification();

  const { isMobile } = useSidebar()
  const handleLogout = async () => {
    setLoading(true);
    try {
      await axios.post(`${base_url}/logout`, {}, { withCredentials: true });
    } catch (err) {
      console.error("Logout failed:", err.response || err.message);
    } finally {
      localStorage.clear();
      sessionStorage.clear();
      window.location.reload();
      setLoading(false);
    }
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200">
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-lg bg-sidebar-primary text-sidebar-primary-foreground font-semibold">
                  {user.name?.charAt(0)?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium text-sidebar-foreground">{user.name}</span>
                <span className="truncate text-xs text-sidebar-foreground/70">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4 text-sidebar-foreground/70" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg bg-sidebar border-sidebar-border shadow-xl"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}>
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm bg-sidebar">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg bg-sidebar-primary text-sidebar-primary-foreground font-semibold">
                    {user.name?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium text-sidebar-foreground">{user.name}</span>
                  <span className="truncate text-xs text-sidebar-foreground/70">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-sidebar-border" />
            <DropdownMenuGroup className="bg-sidebar">
              <DropdownMenuItem asChild className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200">
                <Link to="/dashboard/notifications" className="flex items-center gap-2 w-full">
                  <Bell />
                  <span>Notifications</span>
                  {unread > 0 && (
                    <span className="ml-auto inline-flex h-2 w-2 rounded-full bg-red-500" aria-label={`${unread} unread notifications`} />
                  )}
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="bg-sidebar-border" />
            <DropdownMenuItem 
              onClick={handleLogout}
              className="text-sidebar-foreground hover:bg-red-900/20 hover:text-red-400 transition-all duration-200 cursor-pointer"
            >
              <LogOut className="mr-2" />
              Log Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

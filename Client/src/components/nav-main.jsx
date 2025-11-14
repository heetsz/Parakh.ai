import { ChevronRight } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

import { useLocation, useNavigate } from "react-router-dom";

export function NavMain({ items }) {
  const navigate = useNavigate();
  const location = useLocation();

  const singles = items.filter((i) => !i.items || i.items.length === 0);
  const dropdowns = items.filter((i) => i.items && i.items.length > 0);

  return (
    <>
      {/* Sections group: single tabs */}
      <SidebarGroup>
        <SidebarGroupLabel className="text-xs font-semibold text-sidebar-foreground/60 mb-2">Dashboard</SidebarGroupLabel>
        <SidebarMenu className="gap-1.5">
          {singles.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                tooltip={item.title}
                onClick={() => navigate(item.url)}
                isActive={
                  location.pathname === item.url ||
                  (item.isActive && location.pathname === "/dashboard")
                }
                className="cursor-pointer text-sidebar-foreground border border-gray-700/50 bg-gray-800/40 hover:bg-[#DFFF00] hover:text-black hover:border-[#DFFF00]/50 data-[state=active]:bg-[#DFFF00] data-[state=active]:text-black data-[state=active]:border-[#DFFF00] transition-all duration-200 font-medium text-sm rounded-md"
              >
                {item.icon && <item.icon className="h-4 w-4 text-current transition-colors duration-200" />}
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroup>

      {/* Study Material group: dropdowns */}
      {dropdowns.length > 0 && (
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-sidebar-foreground/60 mb-2">Progress</SidebarGroupLabel>
          <SidebarMenu className="gap-1.5">
            {dropdowns.map((item) => (
              <Collapsible
                key={item.title}
                asChild
                defaultOpen={location.pathname.startsWith(item.url)}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton 
                      tooltip={item.title}
                      className="cursor-pointer text-sidebar-foreground border border-gray-700/50 bg-gray-800/40 hover:bg-[#DFFF00] hover:text-black hover:border-[#DFFF00]/50 transition-all duration-200 font-medium text-sm rounded-md group"
                    >
                      {item.icon && <item.icon className="h-4 w-4 text-sidebar-foreground group-hover:text-black transition-colors duration-200" />}
                      <span className="text-sidebar-foreground group-hover:text-black transition-colors duration-200">{item.title}</span>
                      <ChevronRight className="chevron-right ml-auto h-4 w-4 transition-all duration-200 group-data-[state=open]/collapsible:rotate-90 text-sidebar-foreground/80 group-hover:text-black/80" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub className="ml-4 mt-2 space-y-1">
                      {item.items.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton
                            asChild
                            onClick={() => navigate(subItem.url)}
                            isActive={location.pathname === subItem.url}
                            className="cursor-pointer text-sidebar-foreground/80 border border-gray-700/40 bg-gray-800/30 hover:bg-[#DFFF00] hover:text-black hover:border-[#DFFF00]/40 data-[state=active]:bg-[#DFFF00] data-[state=active]:text-black data-[state=active]:border-[#DFFF00] transition-all duration-200 font-medium text-xs rounded-sm group"
                          >
                            <span className="cursor-pointer flex items-center gap-2">
                              {subItem.icon && (
                                <subItem.icon 
                                  className={`h-3 w-3 transition-colors duration-200 ${
                                    location.pathname === subItem.url 
                                      ? 'text-black' 
                                      : 'text-sidebar-foreground/80 group-hover:text-black'
                                  }`} 
                                />
                              )}
                              <span>{subItem.title}</span>
                            </span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      )}
    </>
  );
}

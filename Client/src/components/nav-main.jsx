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
        <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
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
              >
                {item.icon && <item.icon className="h-4 w-4" />}
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroup>

      {/* Study Material group: dropdowns */}
      {dropdowns.length > 0 && (
        <SidebarGroup>
          <SidebarGroupLabel>Study Material</SidebarGroupLabel>
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
                    <SidebarMenuButton tooltip={item.title}>
                      {item.icon && <item.icon className="h-4 w-4" />}
                      <span>{item.title}</span>
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton
                            asChild
                            onClick={() => navigate(subItem.url)}
                            isActive={location.pathname === subItem.url}
                          >
                            <span className="cursor-pointer flex items-center gap-2">
                              {subItem.icon && (
                                <subItem.icon className="h-4 w-4" />
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

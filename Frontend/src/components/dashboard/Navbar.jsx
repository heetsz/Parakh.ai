import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
      DropdownMenu,
      DropdownMenuContent,
      DropdownMenuItem,
      DropdownMenuLabel,
      DropdownMenuSeparator,
      DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
      NavigationMenu,
      NavigationMenuItem,
      NavigationMenuLink,
      NavigationMenuList
} from "@/components/ui/navigation-menu";
import LogoutButton from "@/components/dashboard/LogoutButton";

const Navbar = ({ email }) => {
      const avatarUrl = `https://avatar.iran.liara.run/username?username=${email}`;

      return (
<nav className="w-full h-16 border-b bg-background/95 backdrop-blur-[10px] flex justify-between items-center px-8 fixed top-0 z-50 supports-backdrop-blur:bg-background/60">
                  {/* Left: Logo */}
                  <div className="flex items-center gap-8">
                        <div className="text-2xl font-semibold tracking-tight">Parakh.AI</div>

                        {/* Navigation Links */}
                        <NavigationMenu className="hidden md:flex">
                              <NavigationMenuList className="gap-2">
                                    <NavigationMenuItem>
                                          <NavigationMenuLink asChild>
                                                <Button variant="ghost">Dashboard</Button>
                                          </NavigationMenuLink>
                                    </NavigationMenuItem>
                                    <NavigationMenuItem>
                                          <NavigationMenuLink asChild>
                                                <Button variant="ghost">Projects</Button>
                                          </NavigationMenuLink>
                                    </NavigationMenuItem>
                                    <NavigationMenuItem>
                                          <NavigationMenuLink asChild>
                                                <Button variant="ghost">Analytics</Button>
                                          </NavigationMenuLink>
                                    </NavigationMenuItem>
                                    <NavigationMenuItem>
                                          <NavigationMenuLink asChild>
                                                <Button variant="ghost">Settings</Button>
                                          </NavigationMenuLink>
                                    </NavigationMenuItem>
                              </NavigationMenuList>
                        </NavigationMenu>
                  </div>

                  {/* Right: Profile avatar with dropdown */}
                  <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                                    <Avatar className="h-10 w-10">
                                          <AvatarImage src={avatarUrl} alt="Profile" />
                                          <AvatarFallback>{email?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                                    </Avatar>
                              </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                              <DropdownMenuLabel>
                                    <div className="flex flex-col space-y-1">
                                          <p className="text-sm font-medium leading-none">My Account</p>
                                          <p className="text-xs leading-none text-muted-foreground">{email}</p>
                                    </div>
                              </DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>Profile</DropdownMenuItem>
                              <DropdownMenuItem>Settings</DropdownMenuItem>
                              <DropdownMenuItem>Billing</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="p-0">
                                    <LogoutButton />
                              </DropdownMenuItem>
                        </DropdownMenuContent>
                  </DropdownMenu>
            </nav>
      );
};

export default Navbar;
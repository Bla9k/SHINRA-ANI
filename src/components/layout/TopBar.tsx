'use client';

import Link from 'next/link';
import { Search, User, Sparkles, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarTrigger } from '@/components/ui/sidebar'; // Use the sidebar trigger

export default function TopBar() {
  // TODO: Replace with actual user data and authentication state
  const isAuthenticated = true; // Placeholder
  const user = {
    username: 'ShinraUser',
    avatarUrl: 'https://picsum.photos/40/40?random=1', // Placeholder avatar
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-md md:px-6 glass">
       {/* Sidebar Trigger for mobile */}
      <div className="md:hidden">
        <SidebarTrigger />
      </div>

      {/* Spacer for Desktop */}
      <div className="hidden md:block w-[var(--sidebar-width-icon)]"></div>

      {/* Search Bar */}
      <div className="flex flex-1 items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
        <form className="ml-auto flex-1 sm:flex-initial">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search anime, manga..."
              className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px] bg-transparent focus:bg-card neon-glow-focus"
            />
          </div>
        </form>

        {/* AI Recommendations Button */}
        <Button variant="ghost" size="icon" className="rounded-full neon-glow-hover">
          <Sparkles className="h-5 w-5 text-primary" />
          <span className="sr-only">AI Recommendations</span>
        </Button>

        {/* Profile Dropdown */}
        {isAuthenticated ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatarUrl} alt={user.username} />
                  <AvatarFallback>{user.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                 <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass">
              <DropdownMenuLabel>{user.username}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                 <Link href="/settings">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Logout</DropdownMenuItem> {/* TODO: Add logout functionality */}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Link href="/login" passHref legacyBehavior>
            <Button variant="outline" className="neon-glow-hover">Login</Button>
          </Link>
        )}
      </div>
    </header>
  );
}

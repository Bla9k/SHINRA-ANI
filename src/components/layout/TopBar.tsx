
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
// SidebarTrigger is removed as we are using a bottom bar now.


export default function TopBar() {
  // TODO: Replace with actual user data and authentication state
  const isAuthenticated = true; // Placeholder
  const user = {
    username: 'ShinraUser',
    avatarUrl: 'https://picsum.photos/40/40?random=1', // Placeholder avatar
  };

  const handleSurpriseMe = () => {
    // TODO: Implement surprise me logic using surpriseMeRecommendation flow
    console.log('Surprise Me clicked!');
    // Example: Call surpriseMeRecommendation({ userProfile: '...', mood: '...', recentInteractions: '...' })
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-md md:px-6 glass">

      {/* Logo/Brand - Keep or adjust as needed */}
      <Link href="/" className="flex items-center gap-2 mr-4">
         <svg width="24" height="24" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
            <path d="M50 0L61.226 30.9017H95.1056L69.9398 50L81.1658 80.9017H50L18.8342 80.9017L30.0602 50L4.89435 30.9017H38.774L50 0Z" fill="currentColor"/>
         </svg>
        <span className="font-bold text-lg hidden sm:inline">AniManga</span>
      </Link>

      {/* Search Bar and Right Aligned Items */}
      <div className="flex flex-1 items-center justify-end gap-4">
        <form className="flex-1 sm:flex-initial max-w-xs sm:max-w-sm md:max-w-md">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search anime, manga..."
              className="pl-8 w-full bg-transparent focus:bg-card neon-glow-focus"
            />
          </div>
        </form>

        {/* AI Recommendations Button - Visible on Desktop */}
        <Button variant="ghost" size="icon" className="rounded-full neon-glow-hover hidden md:inline-flex" onClick={handleSurpriseMe}>
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

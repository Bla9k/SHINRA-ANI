
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { User, Sparkles, Search as SearchIcon } from 'lucide-react'; // Added SearchIcon
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input'; // Added Input
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils'; // Import cn

// Interface for props including search and AI handlers
interface TopBarProps {
  onSearchIconClick: () => void; // For clicking the icon itself
  onSearchSubmit: (term: string) => void; // For submitting search term
  onAiToggle: () => void;
  isAiSearchActive: boolean;
}

export default function TopBar({ onSearchIconClick, onSearchSubmit, onAiToggle, isAiSearchActive }: TopBarProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // TODO: Replace with actual user data and authentication state
  const isAuthenticated = true; // Placeholder
  const user = {
    username: 'ShinraUser',
    avatarUrl: 'https://picsum.photos/40/40?random=1', // Placeholder avatar
  };

  const handleSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (searchTerm.trim()) {
      onSearchSubmit(searchTerm.trim());
    } else {
        onSearchIconClick(); // Open empty search if submitted blank
    }
    // Optional: Clear input after submit? setSearchTerm('');
  };


  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-2 md:gap-4 border-b bg-background/80 px-4 backdrop-blur-md glass">
      {/* Logo/Brand */}
      <Link href="/" className="flex items-center gap-2 mr-auto">
         <svg width="24" height="24" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
            <path d="M50 0L61.226 30.9017H95.1056L69.9398 50L81.1658 80.9017H50L18.8342 80.9017L30.0602 50L4.89435 30.9017H38.774L50 0Z" fill="currentColor"/>
         </svg>
        <span className="font-bold text-lg hidden sm:inline">AniManga</span>
      </Link>

      {/* Search Input Area */}
       <form onSubmit={handleSearchFormSubmit} className="relative hidden md:flex items-center w-full max-w-xs lg:max-w-sm">
         <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
         <Input
           type="search"
           placeholder="Search anime, manga..."
           className="pl-9 pr-4 py-2 h-9 w-full glass border-primary/20 rounded-full" // Adjusted padding and height
           value={searchTerm}
           onChange={handleSearchInputChange}
           aria-label="Search"
         />
         {/* Submit button is implicit via form onSubmit */}
       </form>

      {/* Right Aligned Items */}
      <div className="flex items-center gap-2">

         {/* Search Icon Button (Visible on mobile, potentially redundant on desktop) */}
         <Button variant="ghost" size="icon" className="rounded-full md:hidden" onClick={onSearchIconClick}>
           <SearchIcon className="h-5 w-5" />
           <span className="sr-only">Open Search</span>
         </Button>

        {/* AI Toggle Button */}
        <Button
           variant="ghost" // Keep ghost style for less prominence
           size="icon"
           className={cn(
             "rounded-full neon-glow-hover",
             isAiSearchActive && "bg-primary/20 text-primary neon-glow" // Highlight if active
           )}
           onClick={onAiToggle}
           aria-pressed={isAiSearchActive}
           aria-label={isAiSearchActive ? "Deactivate AI Search" : "Activate AI Search"}
        >
          <Sparkles className="h-5 w-5" />
          <span className="sr-only">{isAiSearchActive ? "Deactivate AI Search" : "Activate AI Search"}</span>
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

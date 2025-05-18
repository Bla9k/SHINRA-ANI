// src/components/layout/TopBar.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
    Search as SearchIcon, Settings as SettingsIconOriginal, X, Menu as MenuIcon, LogOut, User as UserIconLucide,
    Home as HomeIcon, Tv, BookText, Users as UsersIcon, Palette, Star, PlusCircle, ShieldCheck, Flame, Zap, Rocket, Moon, Sun
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuPortal
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { useTheme } from 'next-themes'; // Import useTheme

interface TopBarProps {
  onSearchIconClick: () => void;
  isAiSearchActive: boolean;
  onAiToggle: () => void;
  onOpenSubscriptionModal: () => void;
  onOpenCreateCommunityModal: () => void;
  handleLogout: () => void;
  className?: string;
}

const ShinraAniLogo = () => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="text-primary transition-transform duration-300 hover:scale-110 group-hover:rotate-[15deg]"
  >
    <path
      d="M50 0 L65 20 L85 15 L75 40 L95 50 L75 60 L85 85 L65 80 L50 100 L35 80 L15 85 L25 60 L5 50 L25 40 L15 15 L35 20 Z"
      fill="currentColor"
      stroke="hsl(var(--card-foreground))"
      strokeWidth="2.5"
      transform="rotate(15 50 50)"
      className="group-hover:filter group-hover:drop-shadow-[0_0_3px_hsl(var(--primary))]"
    />
    <circle cx="50" cy="50" r="12" fill="hsl(var(--background))" />
    <path d="M50 40 L55 50 L50 60 L45 50 Z" fill="currentColor"/>
  </svg>
);


export default function TopBar({
  onSearchIconClick,
  isAiSearchActive, // Kept for potential future use within TopBar itself
  onAiToggle,       // Kept for potential future use
  onOpenSubscriptionModal,
  onOpenCreateCommunityModal,
  handleLogout,
  className,
}: TopBarProps) {
  const { user, loading: authLoading, userProfile } = useAuth();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  const themeOptions = [
    { name: 'Light', value: 'light', icon: Sun },
    { name: 'Dark', value: 'dark', icon: Moon },
    { name: 'Shinra Fire', value: 'shinra-fire', icon: Flame },
    { name: 'Modern Shinra', value: 'modern-shinra', icon: Zap },
    { name: 'Hypercharge (Netflix)', value: 'hypercharge-netflix', icon: Tv },
  ];

  const NetflixThemeMenuContent = () => (
    <>
      <DropdownMenuItem asChild><Link href="/" className="flex items-center gap-2"><HomeIcon size={16}/>Home</Link></DropdownMenuItem>
      <DropdownMenuItem asChild><Link href="/anime" className="flex items-center gap-2"><Tv size={16}/>Anime</Link></DropdownMenuItem>
      <DropdownMenuItem asChild><Link href="/manga" className="flex items-center gap-2"><BookText size={16}/>Manga</Link></DropdownMenuItem>
      <DropdownMenuItem asChild><Link href="/community" className="flex items-center gap-2"><UsersIcon size={16}/>Community</Link></DropdownMenuItem>
      <DropdownMenuItem asChild><Link href="/system" className="flex items-center gap-2"><ShieldCheck size={16}/>System</Link></DropdownMenuItem>
      <DropdownMenuSeparator />
      {user && (
        <>
          <DropdownMenuItem asChild><Link href="/profile" className="flex items-center gap-2"><UserIconLucide size={16}/>Profile</Link></DropdownMenuItem>
          <DropdownMenuItem asChild><Link href="/settings" className="flex items-center gap-2"><SettingsIconOriginal size={16}/>Settings</Link></DropdownMenuItem>
        </>
      )}
      <DropdownMenuSub>
        <DropdownMenuSubTrigger className="flex items-center gap-2"><Palette size={16}/>Theme</DropdownMenuSubTrigger>
        <DropdownMenuPortal>
          <DropdownMenuSubContent className="glass-deep">
            {themeOptions.map(opt => (
              <DropdownMenuItem key={opt.value} onClick={() => setTheme(opt.value)} className="flex items-center gap-2">
                <opt.icon size={16} className={theme === opt.value ? 'text-primary' : ''}/> {opt.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuPortal>
      </DropdownMenuSub>
      <DropdownMenuItem onClick={onOpenSubscriptionModal} className="flex items-center gap-2"><Star size={16}/>Subscription Tiers</DropdownMenuItem>
      {user && (userProfile?.subscriptionTier === 'ignition' || userProfile?.subscriptionTier === 'hellfire' || userProfile?.subscriptionTier === 'burstdrive') && (
          <DropdownMenuItem onClick={onOpenCreateCommunityModal} className="flex items-center gap-2"><PlusCircle size={16}/>Create Community</DropdownMenuItem>
      )}
      <DropdownMenuSeparator />
      {user ? (
        <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 text-destructive focus:text-destructive-foreground focus:bg-destructive/90">
          <LogOut size={16}/> Logout
        </DropdownMenuItem>
      ) : (
        <DropdownMenuItem asChild><Link href="/login" className="flex items-center gap-2">Login / Sign Up</Link></DropdownMenuItem>
      )}
    </>
  );

  if (theme === 'hypercharge-netflix') {
    return (
      <header className={cn(
        'sticky top-0 z-30 flex h-16 items-center justify-between gap-2 md:gap-4 border-b px-4 transition-smooth shadow-md',
        'bg-card text-card-foreground border-border/50', // Netflix theme specific background
        className
      )}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 p-2 -ml-2 group">
              <ShinraAniLogo />
              <span className="font-bold text-lg text-primary group-hover:text-primary/80 transition-colors">Shinra-Ani</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="glass-deep w-56">
            <NetflixThemeMenuContent />
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="ghost" size="icon" className="rounded-full" onClick={onSearchIconClick}>
          <SearchIcon className="h-5 w-5 text-foreground/80 hover:text-foreground" />
          <span className="sr-only">Search</span>
        </Button>
      </header>
    );
  }

  // Default TopBar for other themes (mobile-only)
  return (
    <header
      className={cn(
        'sticky top-0 z-30 flex h-16 items-center gap-2 md:gap-4 border-b px-4 backdrop-blur-lg transition-smooth shadow-md',
        'bg-background/80 border-border/50 glass-deep',
        'md:hidden', // Hide on medium screens and up for non-Netflix themes
        className
      )}
    >
      <Link href="/" className="flex items-center gap-2 mr-auto transition-smooth group">
        <ShinraAniLogo />
        <span className="font-bold text-lg hidden sm:inline text-foreground group-hover:text-primary transition-colors">Shinra-Ani</span>
      </Link>

      <Button variant="ghost" size="icon" className="rounded-full transition-smooth neon-glow-hover" onClick={onSearchIconClick}>
        <SearchIcon className="h-5 w-5" />
        <span className="sr-only">Open Search</span>
      </Button>

      {authLoading ? (
        <Skeleton className="h-8 w-8 rounded-full" />
      ) : user ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full transition-smooth neon-glow-hover">
              <Avatar className="h-8 w-8 border border-primary/50">
                 <AvatarImage src={user.photoURL || undefined} alt={user.displayName || user.email || 'User'} />
                 <AvatarFallback>{(user.displayName || user.email || 'U').slice(0, 1).toUpperCase()}</AvatarFallback>
              </Avatar>
              <span className="sr-only">Toggle user menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="glass-deep animate-fade-in w-48">
            <DropdownMenuLabel className="truncate">{user.displayName || user.email}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild><Link href="/profile" className="flex items-center gap-2"><UserIconLucide size={14}/> Profile</Link></DropdownMenuItem>
            <DropdownMenuItem asChild><Link href="/settings" className="flex items-center gap-2"><SettingsIconOriginal size={14}/> Settings</Link></DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 text-destructive focus:text-destructive-foreground focus:bg-destructive/90">
                <LogOut size={14}/> Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Link href="/login" passHref legacyBehavior>
           <a><Button variant="outline" className="neon-glow-hover transition-smooth text-sm h-9 px-3">Login</Button></a>
        </Link>
      )}
    </header>
  );
}

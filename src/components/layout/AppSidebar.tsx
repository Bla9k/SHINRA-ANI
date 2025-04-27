'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Search,
  ListVideo,
  BookOpen,
  Heart,
  User,
  Upload,
  Settings,
  Sparkles,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent // Import SidebarGroupContent
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';

interface NavItemProps {
  href: string;
  icon: React.ElementType;
  label: string;
  tooltip: string;
}

const NavItem = ({ href, icon: Icon, label, tooltip }: NavItemProps) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <SidebarMenuItem>
      <Link href={href} passHref legacyBehavior>
        <SidebarMenuButton
          asChild
          isActive={isActive}
          tooltip={tooltip}
          className={isActive ? 'neon-glow' : 'hover:bg-sidebar-accent'}
        >
          <a>
            <Icon />
            <span>{label}</span>
          </a>
        </SidebarMenuButton>
      </Link>
    </SidebarMenuItem>
  );
};

export default function AppSidebar() {

  const handleSurpriseMe = () => {
    // TODO: Implement surprise me logic using surpriseMeRecommendation flow
    console.log('Surprise Me clicked!');
    // Example: Call surpriseMeRecommendation({ userProfile: '...', mood: '...', recentInteractions: '...' })
  };


  return (
    <Sidebar side="left" variant="sidebar" collapsible="icon" className="glass">
      <SidebarHeader className="items-center justify-center p-4">
        <Link href="/" className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
           <svg width="24" height="24" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
              <path d="M50 0L61.226 30.9017H95.1056L69.9398 50L81.1658 80.9017H50L18.8342 80.9017L30.0602 50L4.89435 30.9017H38.774L50 0Z" fill="currentColor"/>
           </svg>
          <span className="font-bold text-lg group-data-[collapsible=icon]:hidden">AniManga</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
           <NavItem href="/" icon={Home} label="Home" tooltip="Home" />
           <NavItem href="/search" icon={Search} label="Search" tooltip="Search" />
           <NavItem href="/watchlist" icon={ListVideo} label="Watchlist" tooltip="Watchlist" />
           <NavItem href="/readlist" icon={BookOpen} label="Readlist" tooltip="Readlist" />
           <NavItem href="/favorites" icon={Heart} label="Favorites" tooltip="Favorites" />
            <NavItem href="/upload" icon={Upload} label="Upload Manga" tooltip="Upload Manga" />
        </SidebarMenu>
        <SidebarSeparator />
         <SidebarGroup>
            <SidebarGroupLabel>Nami AI</SidebarGroupLabel>
            <SidebarGroupContent>
               <Button onClick={handleSurpriseMe} variant="outline" size="sm" className="w-full neon-glow-hover">
                 <Sparkles className="mr-2 h-4 w-4" />
                 Surprise Me!
               </Button>
            </SidebarGroupContent>
         </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <NavItem href="/profile" icon={User} label="Profile" tooltip="Profile" />
          <NavItem href="/settings" icon={Settings} label="Settings" tooltip="Settings" />
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

'use client';

import type { ReactNode } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import AppSidebar from './AppSidebar';
import TopBar from './TopBar';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider defaultOpen={true} >
      <AppSidebar />
      <SidebarInset>
        <TopBar />
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
           {/* Add subtle animation */}
          <div className="animate-in fade-in duration-500">
             {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
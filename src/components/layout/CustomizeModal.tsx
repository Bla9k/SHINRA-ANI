
// src/components/layout/CustomizeModal.tsx
'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sun, Moon, Flame, Tv as NetflixIcon, Star, Palette, XCircle } from 'lucide-react'; // Using Tv as Netflix for now
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes'; // Ensure this is imported

interface CustomizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme?: string; // Current theme
  setTheme: (theme: string) => void; // Function to set theme
  onOpenSubscriptionModal: () => void;
}

const CustomizeModal: React.FC<CustomizeModalProps> = ({
  isOpen,
  onClose,
  theme,
  setTheme,
  onOpenSubscriptionModal,
}) => {
  const themeOptions = [
    { name: 'Light', value: 'light', icon: Sun },
    { name: 'Dark (Default)', value: 'dark', icon: Moon },
    { name: 'Shinra Fire', value: 'shinra-fire', icon: Flame },
    { name: 'Hypercharge (Netflix)', value: 'hypercharge-netflix', icon: NetflixIcon },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="glass-deep sm:max-w-md shadow-2xl border-primary/30">
        <DialogHeader className="pb-3 border-b border-border/50">
          <DialogTitle className="text-xl font-semibold text-primary flex items-center gap-2">
            <Palette size={22} /> Customize Shinra-Ani
          </DialogTitle>
          <DialogDescription>
            Personalize your viewing experience.
          </DialogDescription>
           <DialogClose asChild>
                <Button variant="ghost" size="icon" className="absolute top-3 right-3 text-muted-foreground hover:text-foreground h-7 w-7">
                    <XCircle /> <span className="sr-only">Close</span>
                </Button>
            </DialogClose>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] py-4 px-1 -mx-1">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2 px-2">Appearance Themes</h4>
              <div className="grid grid-cols-2 gap-3">
                {themeOptions.map((opt) => (
                  <Button
                    key={opt.value}
                    variant={theme === opt.value ? 'default' : 'outline'}
                    onClick={() => setTheme(opt.value)}
                    className={cn(
                      "w-full justify-start h-auto py-2.5 px-3 text-sm glass",
                      theme === opt.value ? (opt.value === 'shinra-fire' || opt.value === 'hypercharge-netflix' ? 'fiery-glow' : 'neon-glow') : 'neon-glow-hover',
                      opt.value === 'shinra-fire' && theme !== opt.value && "border-accent/50 text-accent hover:bg-accent/10",
                      opt.value === 'hypercharge-netflix' && theme !== opt.value && "border-red-500/50 text-red-500 hover:bg-red-500/10"

                    )}
                  >
                    <opt.icon size={16} className="mr-2" />
                    {opt.name}
                  </Button>
                ))}
              </div>
            </div>

            <div className="border-t border-border/30 pt-4">
              <h4 className="text-sm font-medium text-muted-foreground mb-2 px-2">Account</h4>
              <Button
                variant="outline"
                onClick={() => {
                  onOpenSubscriptionModal();
                  onClose(); // Close this modal when opening another
                }}
                className="w-full justify-start h-auto py-2.5 px-3 text-sm glass neon-glow-hover"
              >
                <Star size={16} className="mr-2 text-yellow-400" />
                Subscription Tiers
              </Button>
            </div>
          </div>
        </ScrollArea>
        {/* Footer might not be needed if all actions are in content or header close
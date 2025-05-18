// src/components/layout/RadialMenu.tsx
'use client';

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { NextRouter } from 'next/router'; // Assuming NextRouter type if needed for router prop
import type { NavSection } from './AppLayout'; // Import NavSection from AppLayout
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import Link from 'next/link'; // Import Link

interface RadialMenuProps {
  isOpen: boolean;
  onClose: () => void;
  navSections: NavSection[];
  router: any; // Use 'any' or a more specific NextRouter type
  theme: string;
  openCustomizeModal: () => void; // New prop
}

const RadialMenu: React.FC<RadialMenuProps> = ({
  isOpen,
  onClose,
  navSections,
  router,
  theme,
  openCustomizeModal,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleItemClick = (section: NavSection) => {
    if (section.isDirectAction && section.directAction) {
      if (section.id === 'customize') { // Specific check for customize
        openCustomizeModal();
      } else {
        section.directAction();
      }
    } else if (section.mainHref) {
      router.push(section.mainHref);
    }
    onClose();
  };

  const itemsToShow = navSections.filter(section => theme === 'hypercharge-netflix' ? section.id !== 'search' : true); // Exclude search if Netflix theme for radial
  const itemCount = itemsToShow.length;
  const angleStep = 120 / (itemCount > 1 ? itemCount -1 : 1); // Distribute over a 120-degree arc
  const radius = 100; // pixels
  const startAngle = -150; // Start from bottom-left-ish

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={onClose} // Close on backdrop click
          />
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, scale: 0.8, x: '-50%', y: '-50%' }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed bottom-20 right-1/2 translate-x-1/2 sm:right-20 sm:translate-x-0 z-50 flex items-center justify-center"
            style={{
                // Positioning relative to FAB might need adjustment based on FAB's exact placement
                // This positions it above a bottom-right FAB
                // transformOrigin: 'bottom right', // If animating from FAB
            }}
          >
            <div className="relative flex items-center justify-center w-64 h-32"> {/* Container for arc */}
              {itemsToShow.map((section, index) => {
                const angle = startAngle + index * angleStep;
                const x = radius * Math.cos(angle * Math.PI / 180);
                const y = radius * Math.sin(angle * Math.PI / 180);
                const Icon = section.icon;

                const itemContent = (
                  <TooltipProvider key={section.id} delayDuration={100}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <motion.button
                          initial={{ opacity: 0, scale: 0.5, x:0, y:0 }}
                          animate={{
                            opacity: 1,
                            scale: 1,
                            x: x,
                            y: y,
                          }}
                          exit={{ opacity: 0, scale: 0.5, x:0, y:0, transition: { duration: 0.15 } }}
                          transition={{
                            type: 'spring',
                            stiffness: 400,
                            damping: 15 + index * 2,
                            delay: index * 0.03,
                          }}
                          onClick={() => handleItemClick(section)}
                          className={cn(
                            "absolute w-12 h-12 rounded-full flex flex-col items-center justify-center cursor-pointer",
                            "glass-deep border border-border/50 shadow-lg text-foreground",
                            "hover:bg-primary/20 hover:text-primary hover:border-primary/70",
                            theme === 'shinra-fire' && 'sf-bansho-button'
                          )}
                          aria-label={section.label}
                        >
                          <Icon size={20} />
                          <span className="mt-0.5 text-[8px] opacity-0 group-hover:opacity-100 transition-opacity absolute -bottom-3.5 bg-popover px-1 rounded-sm shadow">
                            {section.label}
                          </span>
                        </motion.button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs glass-deep">
                        <p>{section.label}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                );
                return itemContent; // Directly return for now without conditional Link
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default RadialMenu;
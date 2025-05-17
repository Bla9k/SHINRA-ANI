
'use client';

import React, { useState, useRef, useCallback, type ReactElement, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ExternalLink } from 'lucide-react'; // Default icon

export interface AlternativeOption {
  label: string;
  icon?: React.ElementType;
  action?: () => void;
  href?: string;
}

interface LongHoverButtonWrapperProps {
  children: ReactElement;
  onPrimaryAction: () => void;
  alternativeOptions: AlternativeOption[];
  hoverOpenDelay?: number;
  buttonLabel?: string;
}

function isReactElement(node: React.ReactNode): node is React.ReactElement {
  return React.isValidElement(node);
}

const LongHoverButtonWrapper: React.FC<LongHoverButtonWrapperProps> = ({
  children,
  onPrimaryAction,
  alternativeOptions,
  hoverOpenDelay = 700, // Default delay for hover to open popover
  buttonLabel = "More options"
}) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);

  const clearHoverTimer = () => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
  };

  const handleMouseEnter = useCallback(() => {
    clearHoverTimer();
    hoverTimerRef.current = setTimeout(() => {
      setIsPopoverOpen(true);
    }, hoverOpenDelay);
  }, [hoverOpenDelay]);

  const handleMouseLeave = useCallback(() => {
    clearHoverTimer();
    // Popover's own onOpenChange will handle closing if mouse leaves trigger & content
  }, []);

  const handlePrimaryClick = (e: React.MouseEvent) => {
    // Prevent popover from opening on a quick click if hover timer is running
    clearHoverTimer(); 
    if (isPopoverOpen) {
        // If popover is already open due to hover, a click on trigger might be intended to close it.
        // However, PopoverTrigger default behavior might handle this.
        // For now, let primary action still fire.
    }
    onPrimaryAction();
    // We don't close the popover here, to allow interaction with it if it was opened by hover.
    // If the popover was *not* open, and this is just a quick click, it shouldn't open.
    if (children.props.onClick) children.props.onClick(e);
  };
  
  useEffect(() => {
    // Cleanup timer on unmount
    return () => clearHoverTimer();
  }, []);


  if (!isReactElement(children)) {
    console.error("LongHoverButtonWrapper expects a single ReactElement child.");
    return <>{children}</>;
  }

  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <PopoverTrigger asChild>
        {React.cloneElement(children, {
          onMouseEnter: handleMouseEnter,
          onMouseLeave: handleMouseLeave,
          onClick: handlePrimaryClick, 
          // Remove touch handlers as this is for hover
        })}
      </PopoverTrigger>
      {alternativeOptions && alternativeOptions.length > 0 && (
        <PopoverContent className="w-56 glass-deep p-2" align="end" sideOffset={5}>
          <div className="space-y-1">
            {alternativeOptions.map((option, index) => {
              const IconComponent = option.icon || ExternalLink;
              if (option.href) {
                return (
                  <a
                    key={index}
                    href={option.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2 rounded-md text-sm text-popover-foreground hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
                    onClick={() => setIsPopoverOpen(false)} // Close popover on link click
                  >
                    <IconComponent size={16} />
                    <span>{option.label}</span>
                  </a>
                );
              }
              return (
                <Button
                  key={index}
                  variant="ghost"
                  className="w-full justify-start text-sm h-auto py-2 px-2"
                  onClick={() => {
                    if (option.action) option.action();
                    setIsPopoverOpen(false);
                  }}
                >
                  <IconComponent size={16} className="mr-2" />
                  {option.label}
                </Button>
              );
            })}
          </div>
        </PopoverContent>
      )}
    </Popover>
  );
};

export default LongHoverButtonWrapper;

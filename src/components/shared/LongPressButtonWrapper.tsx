
'use client';

import React, { useState, useRef, useCallback, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { MoreHorizontal, ExternalLink } from 'lucide-react'; // Import ExternalLink

export interface AlternativeOption {
  label: string;
  icon?: React.ElementType;
  action?: () => void;
  href?: string; // For external links
}

interface LongPressButtonWrapperProps {
  children: ReactElement; // Expect a single Button or similar component
  onPrimaryAction: () => void;
  alternativeOptions: AlternativeOption[];
  longPressDuration?: number;
  buttonLabel?: string; // For accessibility of the popover trigger
}

// Type guard for ReactElement
function isReactElement(node: ReactNode): node is React.ReactElement {
  return React.isValidElement(node);
}

const LongPressButtonWrapper: React.FC<LongPressButtonWrapperProps> = ({
  children,
  onPrimaryAction,
  alternativeOptions,
  longPressDuration = 700, // Default to 700ms for long press
  buttonLabel = "More options"
}) => {
  const [isLongPress, setIsLongPress] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const pressStartTimeRef = useRef<number>(0);

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const handlePressStart = useCallback(() => {
    pressStartTimeRef.current = Date.now();
    setIsLongPress(false); // Reset long press state
    clearTimer();
    timerRef.current = setTimeout(() => {
      setIsLongPress(true);
      setIsPopoverOpen(true); // Open popover on long press
    }, longPressDuration);
  }, [longPressDuration]);

  const handlePressEnd = useCallback(() => {
    clearTimer();
    const pressDuration = Date.now() - pressStartTimeRef.current;
    if (!isLongPress && pressDuration < longPressDuration) {
      onPrimaryAction();
    }
    // Reset isLongPress, Popover will be controlled by its own open state
    setIsLongPress(false);
  }, [isLongPress, onPrimaryAction, longPressDuration]);

  if (!isReactElement(children)) {
    console.error("LongPressButtonWrapper expects a single ReactElement child.");
    return <>{children}</>; // Or some fallback UI
  }

  // The child button itself will trigger onPrimaryAction on short click
  // The PopoverTrigger will be a separate small button for long-press options.
  // For this iteration, we'll make the main button itself the trigger for both.

  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <PopoverTrigger asChild>
        {React.cloneElement(children, {
          onMouseDown: (e: React.MouseEvent) => {
            handlePressStart();
            if (children.props.onMouseDown) children.props.onMouseDown(e);
          },
          onMouseUp: (e: React.MouseEvent) => {
            handlePressEnd();
            if (children.props.onMouseUp) children.props.onMouseUp(e);
          },
          onMouseLeave: (e: React.MouseEvent) => { // Clear timer if mouse leaves
            clearTimer();
            if (children.props.onMouseLeave) children.props.onMouseLeave(e);
          },
          onTouchStart: (e: React.TouchEvent) => {
            handlePressStart();
            if (children.props.onTouchStart) children.props.onTouchStart(e);
          },
          onTouchEnd: (e: React.TouchEvent) => {
            handlePressEnd();
            if (children.props.onTouchEnd) children.props.onTouchEnd(e);
          },
        })}
      </PopoverTrigger>
      {alternativeOptions && alternativeOptions.length > 0 && (
        <PopoverContent className="w-56 glass-deep p-2" align="end" sideOffset={5}>
          <div className="space-y-1">
            {alternativeOptions.map((option, index) => {
              const IconComponent = option.icon || ExternalLink; // Default to ExternalLink if no icon
              if (option.href) {
                return (
                  <a
                    key={index}
                    href={option.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2 rounded-md text-sm text-popover-foreground hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
                    onClick={() => setIsPopoverOpen(false)}
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

export default LongPressButtonWrapper;

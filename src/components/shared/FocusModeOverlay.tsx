
'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, Star, CalendarDays, Tv, BookText, Film, Layers, ArrowRight } from 'lucide-react';
import type { DisplayItem } from '@/app/page'; // Assuming DisplayItem is exported from homepage
import { cn } from '@/lib/utils';

interface FocusModeOverlayProps {
  item: DisplayItem | null;
  isOpen: boolean; // Controlled by parent
  onClose: () => void;
}

const FocusModeOverlay: React.FC<FocusModeOverlayProps> = ({ item, isOpen, onClose }) => {
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden'; // Prevent background scroll
      document.addEventListener('keydown', handleEscapeKey);
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !item) {
    return null;
  }

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 30, delay: 0.1 } },
    exit: { opacity: 0, scale: 0.9, y: 20, transition: { duration: 0.2 } },
  };

  const detailPageUrl = `/${item.type}/${item.id}`;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="focus-backdrop"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
          onClick={onClose} // Close on backdrop click
        >
          <motion.div
            key="focus-card"
            variants={cardVariants}
            className="relative glass-deep w-full max-w-xl md:max-w-2xl lg:max-w-3xl max-h-[90vh] rounded-xl shadow-2xl border border-primary/30 flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the card
          >
            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-3 right-3 z-10 text-muted-foreground hover:text-primary h-8 w-8 rounded-full bg-card/70 hover:bg-card/90"
              onClick={onClose}
              aria-label="Close focus mode"
            >
              <X size={20} />
            </Button>

            <ScrollArea className="flex-1">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 p-4 sm:p-6">
                {/* Image Column */}
                <div className="md:col-span-1 relative aspect-[2/3] rounded-lg overflow-hidden shadow-lg border border-border/20 self-start">
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
                      className="object-cover"
                      priority
                    />
                  ) : (
                    <div className="bg-muted h-full flex items-center justify-center">
                      {item.type === 'anime' ? <Tv size={48} className="text-muted-foreground" /> : <BookText size={48} className="text-muted-foreground" />}
                    </div>
                  )}
                </div>

                {/* Details Column */}
                <div className="md:col-span-2 space-y-3 md:space-y-4">
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary sf-text-glow leading-tight line-clamp-3">
                    {item.title}
                  </h2>

                  <div className="flex flex-wrap items-center gap-2">
                    {item.status && <Badge variant="secondary" className="capitalize text-xs">{item.status.replace("Currently Airing", "Airing")}</Badge>}
                    {item.year && <Badge variant="outline" className="flex items-center gap-1 text-xs"><CalendarDays size={12}/> {item.year}</Badge>}
                    {item.score && <Badge variant="outline" className="flex items-center gap-1 text-xs border-yellow-400/70 text-yellow-300"><Star size={12} className="fill-current"/> {item.score.toFixed(1)}</Badge>}
                    {item.type === 'anime' && item.episodes && <Badge variant="outline" className="text-xs"><Film size={12} className="inline mr-1"/> {item.episodes} Episodes</Badge>}
                    {item.type === 'manga' && item.chapters && <Badge variant="outline" className="text-xs"><Layers size={12} className="inline mr-1"/> {item.chapters ?? 'N/A'} Ch</Badge>}
                  </div>

                  {item.genres && item.genres.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {item.genres.slice(0, 5).map(g => <Badge key={g.mal_id} variant="default" className="bg-accent/80 text-accent-foreground hover:bg-accent text-xs">{g.name}</Badge>)}
                    </div>
                  )}

                  {item.synopsis && (
                    <div className="max-h-32 overflow-y-auto scrollbar-thin pr-1">
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {item.synopsis}
                      </p>
                    </div>
                  )}

                  <div className="pt-3 border-t border-border/30">
                    <Link href={detailPageUrl} passHref legacyBehavior>
                      <a onClick={onClose}>
                        <Button className="w-full sm:w-auto fiery-glow-hover">
                          View Full Details <ArrowRight size={16} className="ml-2" />
                        </Button>
                      </a>
                    </Link>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FocusModeOverlay;

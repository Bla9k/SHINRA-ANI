
'use client';

import React, { useState, useEffect, useCallback, ChangeEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { CommunityTheme, CommunityThemeColors, CommunityThemeBackground, CommunityCustomTexts, defaultCommunityTheme, FirebaseTimestamp } from '@/types/theme';
import { saveCommunityTheme, getCommunityTheme } from '@/services/community';
import { Loader2, Palette, Save, ArrowLeft, Info, Image as ImageIcon, Type, MessageSquare, Droplets } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth'; // For checking if user is community creator
import { ScrollArea } from '@/components/ui/scroll-area';

// Helper to convert Firestore Timestamp to Date if needed
const toDate = (timestamp: Date | FirebaseTimestamp | undefined): Date | undefined => {
  if (!timestamp) return undefined;
  if (timestamp instanceof Date) return timestamp;
  if (timestamp && typeof (timestamp as FirebaseTimestamp).toDate === 'function') {
    return (timestamp as FirebaseTimestamp).toDate();
  }
  return new Date(timestamp as any); // Fallback, might be risky
};


export default function CommunityThemeSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const communityId = params.communityId as string;
  const { toast } = useToast();
  const { user } = useAuth(); // Get current user for creator check

  const [themeName, setThemeName] = useState(defaultCommunityTheme.themeName);
  const [colors, setColors] = useState<CommunityThemeColors>(defaultCommunityTheme.colors);
  const [background, setBackground] = useState<CommunityThemeBackground>(defaultCommunityTheme.background);
  const [customTexts, setCustomTexts] = useState<CommunityCustomTexts>(defaultCommunityTheme.customTexts || {});

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isCreator, setIsCreator] = useState(false); // Placeholder for creator check

  const [backgroundFile, setBackgroundFile] = useState<File | null>(null); // For file object

  const fetchTheme = useCallback(async () => {
    if (!communityId) return;
    setIsLoading(true);
    try {
      const existingTheme = await getCommunityTheme(communityId);
      if (existingTheme) {
        setThemeName(existingTheme.themeName || defaultCommunityTheme.themeName);
        setColors(existingTheme.colors || defaultCommunityTheme.colors);
        setBackground(existingTheme.background || defaultCommunityTheme.background);
        setCustomTexts(existingTheme.customTexts || defaultCommunityTheme.customTexts || {});
      } else {
        setThemeName(defaultCommunityTheme.themeName);
        setColors(defaultCommunityTheme.colors);
        setBackground(defaultCommunityTheme.background);
        setCustomTexts(defaultCommunityTheme.customTexts || {});
      }
      // TODO: Fetch community data and check if user is creator
      // For now, assume user is creator for testing
      // const communityData = await getCommunityDetails(communityId);
      // if (user && communityData && communityData.creatorId === user.uid) setIsCreator(true);
      setIsCreator(true); // Placeholder
    } catch (error) {
      console.error("Failed to fetch theme:", error);
      toast({ title: "Error", description: "Could not load theme settings.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [communityId, toast]);

  useEffect(() => {
    fetchTheme();
  }, [fetchTheme]);

  const handleColorChange = (colorName: keyof CommunityThemeColors, value: string) => {
    setColors(prev => ({ ...prev, [colorName]: value.trim() }));
  };

  const handleBackgroundValueChange = (value: string) => {
    setBackground(prev => ({ ...prev, value: value.trim() }));
  };

  const handleBackgroundTypeChange = (type: CommunityThemeBackground['type']) => {
    setBackground(prev => ({ ...prev, type, value: type === 'color' ? (prev.type === 'color' ? prev.value : defaultCommunityTheme.background.value) : '', filePreviewUrl: null }));
    setBackgroundFile(null); // Clear file when type changes away from file-based
    const fileInput = document.getElementById('bgFileValue') as HTMLInputElement;
    if(fileInput) fileInput.value = ''; // Reset file input
  };

  const handleCustomTextChange = (key: keyof CommunityCustomTexts, value: string) => {
    setCustomTexts(prev => ({ ...prev, [key]: value }));
  };

  const handleBackgroundFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setBackgroundFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setBackground(prev => ({...prev, type: 'image_url', value: reader.result as string, filePreviewUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    } else {
      setBackgroundFile(null);
      // If type was image/gif, and file is cleared, revert to color or clear value
      if (background.type === 'image_url' || background.type === 'gif_url') {
          setBackground(prev => ({ ...prev, value: '', filePreviewUrl: null }));
      }
    }
  };

  const handleSaveTheme = async () => {
    if (!communityId) {
      toast({ title: "Error", description: "Community ID is missing.", variant: "destructive" });
      return;
    }
    if (!isCreator) {
        toast({ title: "Unauthorized", description: "Only community creators can edit themes.", variant: "destructive" });
        return;
    }

    setIsSaving(true);
    // TODO: Actual file upload to Firebase Storage if backgroundFile is set
    // For now, we'll save the filePreviewUrl (Data URL) or the manually entered URL
    let finalBackgroundValue = background.value;
    if (backgroundFile && background.filePreviewUrl) {
        console.log("Simulating background file upload. In a real app, upload to Firebase Storage here and use the returned URL.");
        // finalBackgroundValue = await uploadCommunityBackground(communityId, backgroundFile); // Placeholder for actual upload
        finalBackgroundValue = background.filePreviewUrl; // Use data URL for now
    }


    const themeToSave: CommunityTheme = {
      communityId,
      themeName,
      colors,
      background: {
          type: background.type,
          value: finalBackgroundValue, // This would be the storage URL in a real scenario
          filePreviewUrl: background.filePreviewUrl, // Keep preview URL if needed, or clear after upload
      },
      customTexts,
      updatedAt: new Date(), // Firestore will use serverTimestamp
    };

    try {
      await saveCommunityTheme(communityId, themeToSave);
      toast({ title: "Theme Saved!", description: "Your community theme has been updated.", variant: "default" });
    } catch (error) {
      console.error("Failed to save theme:", error);
      toast({ title: "Error Saving Theme", description: "Could not save theme settings. Please try again.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  // Live preview style updates
  useEffect(() => {
    const previewArea = document.getElementById('theme-preview-area');
    if (previewArea) {
      Object.entries(colors).forEach(([key, value]) => {
        const cssVarName = `--preview-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
        previewArea.style.setProperty(cssVarName, `hsl(${value})`);
      });

      if (background.type === 'color') {
        previewArea.style.backgroundImage = 'none';
        previewArea.style.backgroundColor = `hsl(${background.value})`;
      } else if (background.value) { // image_url, gif_url, or filePreviewUrl
        previewArea.style.backgroundImage = `url("${background.value}")`;
        previewArea.style.backgroundColor = 'transparent'; // Or a fallback color
        previewArea.style.backgroundSize = 'cover';
        previewArea.style.backgroundPosition = 'center';
      } else {
        previewArea.style.backgroundImage = 'none';
        previewArea.style.backgroundColor = `hsl(${defaultCommunityTheme.colors.background})`; // Fallback to default bg
      }
    }
  }, [colors, background]);


  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-2 sm:px-4 py-8 max-w-4xl">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4 text-sm">
        <ArrowLeft size={16} className="mr-2" /> Back to Community Page
      </Button>
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Settings Panel */}
        <ScrollArea className="lg:col-span-2 h-auto lg:max-h-[calc(100vh-12rem)]"> {/* Scrollable settings */}
          <Card className="glass-deep shadow-xl border-primary/30 h-full">
            <CardHeader className="border-b border-border/50">
              <CardTitle className="text-2xl font-bold flex items-center gap-2 text-primary">
                <Palette size={24} /> Community Theme Customizer
              </CardTitle>
              <CardDescription>Personalize the look and feel of your community: {themeName}</CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-8">
              <div className="space-y-2">
                <Label htmlFor="themeName" className="text-lg font-semibold flex items-center gap-1.5"><Type size={18}/> Theme Name</Label>
                <Input id="themeName" value={themeName} onChange={(e) => setThemeName(e.target.value)} placeholder="e.g., Dark Knights, Sakura Dreams" className="glass" disabled={isSaving}/>
              </div>

              <section>
                <h3 className="text-xl font-semibold mb-4 border-b pb-2 border-border/30 text-primary flex items-center gap-1.5"><Droplets size={20}/> Color Palette</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                  {(Object.keys(colors) as Array<keyof CommunityThemeColors>).map((colorKey) => (
                    <div key={colorKey} className="space-y-1.5">
                      <Label htmlFor={colorKey} className="capitalize text-sm font-medium text-muted-foreground">{colorKey.replace(/([A-Z])/g, ' $1').trim()}</Label>
                      <div className="flex items-center gap-2">
                        <Input id={colorKey} value={colors[colorKey]} onChange={(e) => handleColorChange(colorKey, e.target.value)} placeholder="e.g., 220 20% 5%" className="glass flex-1" disabled={isSaving}/>
                        <div className="w-8 h-8 rounded border border-border/50 flex-shrink-0" style={{ backgroundColor: `hsl(${colors[colorKey]})` }} />
                      </div>
                      {colorKey === 'background' && <p className="text-xs text-muted-foreground">Enter HSL values (Hue Sat% Light%). E.g., 210 40% 96%</p>}
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-4 border-b pb-2 border-border/30 text-primary flex items-center gap-1.5"><ImageIcon size={20}/> Background</h3>
                <RadioGroup value={background.type} onValueChange={(value) => handleBackgroundTypeChange(value as CommunityThemeBackground['type'])} className="mb-3 space-y-1" disabled={isSaving}>
                  {['color', 'image_url', 'gif_url'].map(type => (
                    <div key={type} className="flex items-center space-x-2">
                      <RadioGroupItem value={type} id={`bg-${type}`} />
                      <Label htmlFor={`bg-${type}`} className="text-sm font-medium capitalize">{type.replace('_', ' ')}</Label>
                    </div>
                  ))}
                </RadioGroup>
                {background.type === 'color' ? (
                  <div className="space-y-1.5">
                    <Label htmlFor="bgColorValue" className="text-sm font-medium text-muted-foreground">Background Color (HSL)</Label>
                    <div className="flex items-center gap-2">
                      <Input id="bgColorValue" value={background.value} onChange={(e) => handleBackgroundValueChange(e.target.value)} placeholder="e.g., 0 0% 10%" className="glass flex-1" disabled={isSaving}/>
                      <div className="w-8 h-8 rounded border border-border/50 flex-shrink-0" style={{ backgroundColor: `hsl(${background.value})` }} />
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="space-y-1.5 mb-2">
                      <Label htmlFor="bgUrlValue" className="text-sm font-medium text-muted-foreground">Background URL (Direct link to Image/GIF)</Label>
                      <Input id="bgUrlValue" type="url" value={background.value} onChange={(e) => handleBackgroundValueChange(e.target.value)} placeholder="https://example.com/image.jpg" className="glass" disabled={isSaving || !!backgroundFile}/>
                    </div>
                    <div className="text-sm text-muted-foreground text-center my-1">OR</div>
                    <div className="space-y-1.5">
                       <Label htmlFor="bgFileValue" className="text-sm font-medium text-muted-foreground">Upload Background Image/GIF</Label>
                       <Input id="bgFileValue" type="file" accept="image/png, image/jpeg, image/gif, image/webp" onChange={handleBackgroundFileChange} className="glass file:text-primary file:font-semibold hover:file:bg-primary/10" disabled={isSaving}/>
                       <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><Info size={12}/> Max 5MB. Uploading will override URL if both are set.</p>
                    </div>
                  </>
                )}
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-4 border-b pb-2 border-border/30 text-primary flex items-center gap-1.5"><MessageSquare size={20}/> Custom Texts</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="welcomeMessage" className="text-sm font-medium text-muted-foreground">Welcome Message</Label>
                    <Textarea id="welcomeMessage" value={customTexts.welcomeMessage || ''} onChange={(e) => handleCustomTextChange('welcomeMessage', e.target.value)} placeholder="e.g., Welcome to the official community for..." className="glass min-h-[60px]" disabled={isSaving}/>
                  </div>
                  <div>
                    <Label htmlFor="communityTagline" className="text-sm font-medium text-muted-foreground">Community Tagline/Slogan</Label>
                    <Input id="communityTagline" value={customTexts.communityTagline || ''} onChange={(e) => handleCustomTextChange('communityTagline', e.target.value)} placeholder="e.g., Where fans unite!" className="glass" disabled={isSaving}/>
                  </div>
                </div>
              </section>

              <Button onClick={handleSaveTheme} disabled={isSaving || isLoading} className="w-full neon-glow-hover fiery-glow-hover mt-6">
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save size={16} className="mr-2" />} Save Theme
              </Button>
            </CardContent>
          </Card>
        </ScrollArea>

        {/* Live Preview Panel */}
        <div className="lg:col-span-1 sticky top-20 h-fit"> {/* Sticky preview for desktop */}
          <Card className="glass-deep shadow-lg border-border/50">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-primary">Live Theme Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                id="theme-preview-area"
                className="p-4 rounded-md border transition-all duration-300 min-h-[300px] flex flex-col justify-between"
                style={{
                  // Initial styles set by CSS variables from default theme
                  backgroundColor: `hsl(${defaultCommunityTheme.colors.background})`,
                  color: `hsl(${defaultCommunityTheme.colors.foreground})`,
                  borderColor: `hsl(${defaultCommunityTheme.colors.border})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                <div className="p-3 rounded mb-2" style={{ backgroundColor: `var(--preview-card, hsl(${defaultCommunityTheme.colors.card}))`, color: `var(--preview-card-foreground, hsl(${defaultCommunityTheme.colors.cardForeground}))`, border: `1px solid var(--preview-border, hsl(${defaultCommunityTheme.colors.border}))` }}>
                  <h4 className="font-semibold text-md mb-1" style={{ color: `var(--preview-primary, hsl(${defaultCommunityTheme.colors.primary}))` }}>
                    {customTexts.communityTagline || themeName || 'Sample Card Title'}
                  </h4>
                  <p className="text-xs">This is a sample card content. {customTexts.welcomeMessage}</p>
                </div>
                <button
                  className="w-full text-xs py-1.5 px-3 rounded"
                  style={{
                    backgroundColor: `var(--preview-primary, hsl(${defaultCommunityTheme.colors.primary}))`,
                    color: `var(--preview-primary-foreground, hsl(${defaultCommunityTheme.colors.primaryForeground}))`,
                    border: `1px solid var(--preview-ring, hsl(${defaultCommunityTheme.colors.ring}))`
                  }}
                >
                  Sample Button
                </button>
                 <input type="text" placeholder="Sample Input" className="w-full text-xs p-1.5 rounded mt-2" style={{
                     backgroundColor: `var(--preview-input, hsl(${defaultCommunityTheme.colors.input}))`,
                     color: `var(--preview-foreground, hsl(${defaultCommunityTheme.colors.foreground}))`,
                     borderColor: `var(--preview-border, hsl(${defaultCommunityTheme.colors.border}))`
                 }}/>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

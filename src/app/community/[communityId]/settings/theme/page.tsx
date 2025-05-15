
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { CommunityTheme, CommunityThemeColors, CommunityThemeBackground, CommunityCustomTexts, defaultCommunityTheme } from '@/types/theme';
import { saveCommunityTheme, getCommunityTheme } from '@/services/community';
import { Loader2, Palette, Save, ArrowLeft, Info } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth'; // For checking if user is community creator

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
        // Initialize with defaults if no theme exists
        setThemeName(defaultCommunityTheme.themeName);
        setColors(defaultCommunityTheme.colors);
        setBackground(defaultCommunityTheme.background);
        setCustomTexts(defaultCommunityTheme.customTexts || {});
      }
      // TODO: Fetch community data and check if user is creator
      // For now, assume user is creator for testing
      // const communityData = await getCommunityDetails(communityId);
      // if (user && communityData && communityData.creatorId === user.uid) setIsCreator(true);
      setIsCreator(true); // Placeholder for creator check
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

  const handleBackgroundTypeChange = (type: 'color' | 'image_url' | 'gif_url') => {
    setBackground(prev => ({ ...prev, type, value: type === 'color' ? prev.value : '' }));
  };

  const handleCustomTextChange = (key: string, value: string) => {
    setCustomTexts(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveTheme = async () => {
    if (!communityId) {
      toast({ title: "Error", description: "Community ID is missing.", variant: "destructive" });
      return;
    }
    if (!isCreator) { // TODO: Implement actual creator check
        toast({ title: "Unauthorized", description: "Only community creators can edit themes.", variant: "destructive" });
        return;
    }

    setIsSaving(true);
    const themeToSave: CommunityTheme = {
      communityId,
      themeName,
      colors,
      background,
      customTexts,
      updatedAt: new Date(), // Client-side timestamp, Firestore will use serverTimestamp
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  // TODO: Add actual check if user is community creator/admin
  // if (!isCreator) {
  //    return (
  //        <div className="container mx-auto px-4 py-8 text-center">
  //            <Alert variant="destructive">
  //                <AlertCircle className="h-4 w-4" />
  //                <AlertTitle>Access Denied</AlertTitle>
  //                <AlertDescription>You do not have permission to edit this community's theme.</AlertDescription>
  //            </Alert>
  //            <Button onClick={() => router.back()} className="mt-4">Go Back</Button>
  //        </div>
  //    );
  // }


  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4 text-sm">
        <ArrowLeft size={16} className="mr-2" /> Back to Community Settings
      </Button>
      <Card className="glass-deep shadow-xl border-primary/30">
        <CardHeader className="border-b border-border/50">
          <CardTitle className="text-2xl font-bold flex items-center gap-2 text-primary">
            <Palette size={24} /> Community Theme Customizer
          </CardTitle>
          <CardDescription>Personalize the look and feel of your community.</CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-8">
          {/* Theme Name */}
          <div className="space-y-2">
            <Label htmlFor="themeName" className="text-lg font-semibold">Theme Name</Label>
            <Input
              id="themeName"
              value={themeName}
              onChange={(e) => setThemeName(e.target.value)}
              placeholder="e.g., Dark Knights, Sakura Dreams"
              className="glass"
              disabled={isSaving}
            />
          </div>

          {/* Colors Section */}
          <section>
            <h3 className="text-xl font-semibold mb-4 border-b pb-2 border-border/30 text-primary">Color Palette</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              {(Object.keys(colors) as Array<keyof CommunityThemeColors>).map((colorKey) => (
                <div key={colorKey} className="space-y-1.5">
                  <Label htmlFor={colorKey} className="capitalize text-sm">{colorKey.replace(/([A-Z])/g, ' $1')}</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id={colorKey}
                      value={colors[colorKey]}
                      onChange={(e) => handleColorChange(colorKey, e.target.value)}
                      placeholder="e.g., 220 20% 5% (HSL)"
                      className="glass flex-1"
                      disabled={isSaving}
                    />
                    <div className="w-8 h-8 rounded border border-border/50" style={{ backgroundColor: `hsl(${colors[colorKey]})` }} />
                  </div>
                  <p className="text-xs text-muted-foreground">Enter HSL values: Hue (0-360) Saturation (0-100%) Lightness (0-100%). Example: 210 40% 96%</p>
                </div>
              ))}
            </div>
          </section>

          {/* Background Section */}
          <section>
            <h3 className="text-xl font-semibold mb-4 border-b pb-2 border-border/30 text-primary">Background</h3>
            <RadioGroup value={background.type} onValueChange={(value) => handleBackgroundTypeChange(value as 'color' | 'image_url' | 'gif_url')} className="mb-3" disabled={isSaving}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="color" id="bg-color" />
                <Label htmlFor="bg-color" className="text-sm">Solid Color</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="image_url" id="bg-image" />
                <Label htmlFor="bg-image" className="text-sm">Image URL</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="gif_url" id="bg-gif" />
                <Label htmlFor="bg-gif" className="text-sm">GIF URL</Label>
              </div>
            </RadioGroup>
            {background.type === 'color' ? (
              <div className="space-y-1.5">
                <Label htmlFor="bgColorValue" className="text-sm">Background Color (HSL)</Label>
                <div className="flex items-center gap-2">
                <Input
                  id="bgColorValue"
                  value={background.value}
                  onChange={(e) => handleBackgroundValueChange(e.target.value)}
                  placeholder="e.g., 0 0% 10%"
                  className="glass flex-1"
                  disabled={isSaving}
                />
                <div className="w-8 h-8 rounded border border-border/50" style={{ backgroundColor: `hsl(${background.value})` }} />
                </div>
              </div>
            ) : (
              <div className="space-y-1.5">
                <Label htmlFor="bgUrlValue" className="text-sm">Background URL (Image/GIF)</Label>
                <Input
                  id="bgUrlValue"
                  type="url"
                  value={background.value}
                  onChange={(e) => handleBackgroundValueChange(e.target.value)}
                  placeholder="https://example.com/background.jpg"
                  className="glass"
                  disabled={isSaving}
                />
              </div>
            )}
             <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><Info size={12}/> Ensure URLs are direct links to images/GIFs and are publicly accessible.</p>
          </section>

          {/* Custom Texts Section */}
          <section>
            <h3 className="text-xl font-semibold mb-4 border-b pb-2 border-border/30 text-primary">Custom Text Snippets</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="welcomeMessage" className="text-sm">Welcome Message</Label>
                <Textarea
                  id="welcomeMessage"
                  value={customTexts.welcomeMessage || ''}
                  onChange={(e) => handleCustomTextChange('welcomeMessage', e.target.value)}
                  placeholder="e.g., Welcome to the official community for..."
                  className="glass min-h-[60px]"
                  disabled={isSaving}
                />
              </div>
              <div>
                <Label htmlFor="communityTagline" className="text-sm">Community Tagline/Slogan</Label>
                <Input
                  id="communityTagline"
                  value={customTexts.communityTagline || ''}
                  onChange={(e) => handleCustomTextChange('communityTagline', e.target.value)}
                  placeholder="e.g., Where fans unite!"
                  className="glass"
                  disabled={isSaving}
                />
              </div>
              {/* Add more custom text inputs here as needed */}
            </div>
          </section>

          <Button onClick={handleSaveTheme} disabled={isSaving || isLoading} className="w-full neon-glow-hover fiery-glow-hover">
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save size={16} className="mr-2" />}
            Save Theme
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

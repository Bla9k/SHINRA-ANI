
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea'; // Import Textarea
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Settings as SettingsIcon, User, Lock, Bell, ShieldCheck, Palette, Image as ImageIcon, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast'; // Import useToast
import Image from 'next/image'; // Import Image for previews
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'; // Import Avatar components

// Define types for settings state
interface ProfileSettings {
    username: string;
    bio: string;
    status: string;
    avatarFile: File | null;
    bannerFile: File | null;
}

interface SecuritySettings {
    twoFactorEnabled: boolean;
    // Add other security settings if needed
}

interface NotificationSettings {
    enabled: boolean;
    // Add granular settings like commentNotifications, dmNotifications, etc.
}

export default function SettingsPage() {
    const { toast } = useToast();

    // --- State Management ---
    // TODO: Fetch initial settings from user data source (e.g., Firestore)
    const [profileSettings, setProfileSettings] = useState<ProfileSettings>({
        username: 'ShinraFanatic', // Placeholder
        bio: 'Just a guy who loves intense action and deep stories.', // Placeholder
        status: 'Watching Jujutsu Kaisen S2', // Placeholder
        avatarFile: null,
        bannerFile: null,
    });
    const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
        twoFactorEnabled: false, // Placeholder
    });
    const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
        enabled: true, // Placeholder
    });

    // Previews for image uploads
    const [avatarPreview, setAvatarPreview] = useState<string | null>('https://picsum.photos/seed/avatar1/150/150'); // Placeholder preview
    const [bannerPreview, setBannerPreview] = useState<string | null>('https://picsum.photos/seed/banner1/1000/300'); // Placeholder preview

    // --- Handlers ---

    // Profile Settings Handlers
    const handleProfileChange = (field: keyof ProfileSettings, value: string) => {
        setProfileSettings(prev => ({ ...prev, [field]: value }));
    };

    const handleFileChange = (type: 'avatar' | 'banner', event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const fieldKey = type === 'avatar' ? 'avatarFile' : 'bannerFile';
            setProfileSettings(prev => ({ ...prev, [fieldKey]: file }));

            // Generate preview
            const reader = new FileReader();
            reader.onloadend = () => {
                if (type === 'avatar') setAvatarPreview(reader.result as string);
                else setBannerPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            // Clear file and preview if deselected
            const fieldKey = type === 'avatar' ? 'avatarFile' : 'bannerFile';
            setProfileSettings(prev => ({ ...prev, [fieldKey]: null }));
            if (type === 'avatar') setAvatarPreview(null); // Or reset to default?
            else setBannerPreview(null); // Or reset to default?
        }
    };


    // Generic Save Handler (Simulated)
    const handleSaveChanges = async (section: string, settingsData: any) => {
        console.log(`Saving ${section} settings...`, settingsData);
        // TODO: Implement actual API call to save settings
        // If uploading files, handle Firebase Storage upload here
        // Example:
        // if (settingsData.avatarFile) { await uploadAvatar(settingsData.avatarFile); }
        // if (settingsData.bannerFile) { await uploadBanner(settingsData.bannerFile); }
        // await saveUserSettings(section, settingsData); // Save text data

        // Simulate delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        toast({
            title: `${section} Settings Updated`,
            description: `Your ${section.toLowerCase()} settings have been saved.`,
            variant: "default",
        });

         // Clear file inputs after successful upload simulation (optional)
         if ('avatarFile' in settingsData) setProfileSettings(prev => ({ ...prev, avatarFile: null }));
         if ('bannerFile' in settingsData) setProfileSettings(prev => ({ ...prev, bannerFile: null }));
    };

    // Password Change Placeholder
    const handlePasswordChange = () => {
        console.log("Initiating password change...");
        toast({
            title: "Password Change",
            description: "Password change functionality is not yet implemented.",
            variant: "destructive",
        });
    };

    // 2FA Toggle Placeholder
    const handleToggle2FA = (checked: boolean) => {
        console.log(`Toggling 2FA to ${checked}...`);
        setSecuritySettings(prev => ({ ...prev, twoFactorEnabled: checked }));
        // TODO: Implement actual 2FA setup/disable logic
        toast({
            title: "Two-Factor Authentication",
            description: `Simulating 2FA ${checked ? 'enable' : 'disable'}. Real implementation needed.`,
            variant: checked ? 'default' : 'destructive',
        });
    };

    // --- JSX ---
    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl"> {/* Constrain width */}
            <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
                <SettingsIcon className="h-7 w-7 text-primary" /> Settings
            </h1>

            <div className="space-y-10">

                {/* Profile Customization Settings */}
                <Card className="glass shadow-lg border-border/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl"><Palette size={20} className="text-primary"/> Profile Customization</CardTitle>
                        <CardDescription>Make your profile uniquely yours. Changes reflect across the platform.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Username (Display Only or Editable with validation) */}
                        <div className="space-y-2">
                             <Label htmlFor="username">Username</Label>
                             <Input id="username" value={profileSettings.username} onChange={(e) => handleProfileChange('username', e.target.value)} className="glass" placeholder="Your public display name"/>
                             <p className="text-xs text-muted-foreground">Your unique username.</p>
                        </div>

                        {/* Bio */}
                        <div className="space-y-2">
                            <Label htmlFor="bio">Bio</Label>
                            <Textarea
                                id="bio"
                                value={profileSettings.bio}
                                onChange={(e) => handleProfileChange('bio', e.target.value)}
                                placeholder="Tell everyone a little about yourself..."
                                className="glass min-h-[80px]"
                                maxLength={190} // Discord bio limit example
                            />
                             <p className="text-xs text-muted-foreground">Max 190 characters.</p>
                        </div>

                        {/* Custom Status */}
                        <div className="space-y-2">
                            <Label htmlFor="status">Custom Status</Label>
                             <Input id="status" value={profileSettings.status} onChange={(e) => handleProfileChange('status', e.target.value)} className="glass" placeholder="What are you up to?"/>
                              <p className="text-xs text-muted-foreground">Set a custom status to show others.</p>
                        </div>

                        {/* Avatar Upload */}
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                            <div className="space-y-2">
                                <Label htmlFor="avatar-upload" className="flex items-center gap-1"><ImageIcon size={14}/> Avatar</Label>
                                <Input id="avatar-upload" type="file" accept="image/png, image/jpeg, image/gif" onChange={(e) => handleFileChange('avatar', e)} className="glass file:text-primary file:font-semibold hover:file:bg-primary/10" />
                                <p className="text-xs text-muted-foreground">Recommended: Square image (PNG, JPG, GIF). Max 2MB.</p>
                            </div>
                            {avatarPreview && (
                                <div className="flex justify-center md:justify-start">
                                    <Avatar className="h-24 w-24 border-2 border-primary shadow-md">
                                        <AvatarImage src={avatarPreview} alt="Avatar Preview"/>
                                        <AvatarFallback>{profileSettings.username.slice(0,2).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                </div>
                            )}
                        </div>

                        {/* Banner Upload */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                             <div className="space-y-2">
                                 <Label htmlFor="banner-upload" className="flex items-center gap-1"><ImageIcon size={14}/> Profile Banner</Label>
                                <Input id="banner-upload" type="file" accept="image/png, image/jpeg, image/gif" onChange={(e) => handleFileChange('banner', e)} className="glass file:text-primary file:font-semibold hover:file:bg-primary/10" />
                                 <p className="text-xs text-muted-foreground">Recommended: 1000x300px (PNG, JPG, GIF). Max 5MB.</p>
                            </div>
                             {bannerPreview && (
                                <div className="relative h-24 w-full md:w-auto rounded-md overflow-hidden border border-border glass">
                                    <Image src={bannerPreview} alt="Banner Preview" layout="fill" objectFit="cover" />
                                </div>
                             )}
                        </div>

                        <Button onClick={() => handleSaveChanges('Profile', profileSettings)} className="neon-glow-hover w-full sm:w-auto">Save Profile Changes</Button>
                    </CardContent>
                </Card>

                <Separator className="bg-border/30"/>

                {/* Account Settings */}
                <Card className="glass shadow-lg border-border/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl"><User size={20} className="text-primary"/> Account</CardTitle>
                        <CardDescription>Manage your account details.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="current-email">Email</Label>
                            <Input id="current-email" type="email" value="shinra@example.com" disabled className="glass text-muted-foreground" />
                            {/* TODO: Add change email functionality */}
                            <Button variant="link" size="sm" className="text-xs p-0 h-auto">Change Email (Not Implemented)</Button>
                        </div>
                        <Button onClick={() => handleSaveChanges('Account', {})} className="neon-glow-hover w-full sm:w-auto" disabled>Save Account Changes (Disabled)</Button>
                    </CardContent>
                </Card>

                <Separator className="bg-border/30"/>

                {/* Security Settings */}
                <Card className="glass shadow-lg border-border/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl"><Lock size={20} className="text-primary"/> Security</CardTitle>
                        <CardDescription>Update your password and security settings.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Button variant="outline" onClick={handlePasswordChange} className="neon-glow-hover w-full sm:w-auto">Change Password</Button>
                        <div className="flex items-center justify-between rounded-lg border p-4 glass border-border/50">
                            <div className="space-y-0.5">
                                <Label htmlFor="two-factor-switch" className="text-base flex items-center gap-1"><ShieldCheck size={16}/> Two-Factor Authentication (2FA)</Label>
                                <p className="text-sm text-muted-foreground">Add an extra layer of security to your account.</p>
                            </div>
                            <Switch
                                id="two-factor-switch"
                                checked={securitySettings.twoFactorEnabled}
                                onCheckedChange={handleToggle2FA}
                                aria-label="Toggle Two-Factor Authentication"
                            />
                        </div>
                         {/* Add button to save security settings if needed, or handle immediately */}
                    </CardContent>
                </Card>

                <Separator className="bg-border/30"/>

                {/* Notification Settings */}
                <Card className="glass shadow-lg border-border/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl"><Bell size={20} className="text-primary"/> Notifications</CardTitle>
                        <CardDescription>Manage how you receive notifications.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between rounded-lg border p-4 glass border-border/50">
                            <div className="space-y-0.5">
                                <Label htmlFor="notifications-switch" className="text-base">Enable All Notifications</Label>
                                <p className="text-sm text-muted-foreground">Receive updates about new releases, comments, DMs, and more.</p>
                            </div>
                            <Switch
                                id="notifications-switch"
                                checked={notificationSettings.enabled}
                                onCheckedChange={(checked) => setNotificationSettings(prev => ({...prev, enabled: checked }))}
                                aria-label="Toggle all notifications"
                            />
                        </div>
                         {/* TODO: Add more granular notification controls here if needed */}
                         {/* Example:
                         <div className="flex items-center justify-between rounded-lg border p-4 glass border-border/50">
                              <Label htmlFor="dm-notifications">Direct Message Notifications</Label>
                              <Switch id="dm-notifications" checked={...} onCheckedChange={...} disabled={!notificationSettings.enabled} />
                         </div> */}
                        <Button onClick={() => handleSaveChanges('Notifications', notificationSettings)} className="neon-glow-hover w-full sm:w-auto">Save Notification Settings</Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

    
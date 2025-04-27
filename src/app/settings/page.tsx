
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Settings as SettingsIcon, User, Lock, Bell, ShieldCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast'; // Import useToast

export default function SettingsPage() {
  const { toast } = useToast(); // Initialize toast hook

  // Dummy state - replace with actual user settings state management
  const [username, setUsername] = useState('ShinraFanatic');
  const [email, setEmail] = useState('shinra@example.com');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  const handleSaveChanges = (section: string) => {
    // TODO: Implement actual save logic for each section
    console.log(`Saving changes for ${section}...`);
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Settings Updated",
        description: `${section} settings have been saved successfully.`,
        variant: "default", // Or "success" if you add that variant
      });
    }, 500);
  };

  const handlePasswordChange = () => {
     // TODO: Implement password change logic (likely involving modals or separate flow)
     console.log("Initiating password change...");
      toast({
        title: "Password Change",
        description: "Password change functionality not yet implemented.",
        variant: "destructive",
      });
  };

  const handleToggle2FA = (checked: boolean) => {
     // TODO: Implement 2FA toggle logic (requires secure flow)
     console.log(`Toggling 2FA to ${checked}...`);
     setTwoFactorEnabled(checked);
      toast({
        title: "Two-Factor Authentication",
        description: `2FA ${checked ? 'enabled' : 'disabled'}. Further steps may be required.`,
         variant: checked ? 'default' : 'destructive',
      });
  };


  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <SettingsIcon className="h-7 w-7" /> Settings
      </h1>

      <div className="space-y-8">
        {/* Account Settings */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><User size={20} /> Account</CardTitle>
            <CardDescription>Manage your account details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} className="glass" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="glass" />
            </div>
            <Button onClick={() => handleSaveChanges('Account')} className="neon-glow-hover">Save Account Changes</Button>
          </CardContent>
        </Card>

        <Separator />

        {/* Security Settings */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Lock size={20} /> Security</CardTitle>
            <CardDescription>Update your password and security settings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" onClick={handlePasswordChange} className="neon-glow-hover">Change Password</Button>
             <div className="flex items-center justify-between rounded-lg border p-4 glass">
                 <div className="space-y-0.5">
                    <Label className="text-base flex items-center gap-1"><ShieldCheck size={16}/> Two-Factor Authentication (2FA)</Label>
                    <p className="text-sm text-muted-foreground">
                        Add an extra layer of security to your account.
                    </p>
                </div>
                <Switch
                    checked={twoFactorEnabled}
                    onCheckedChange={handleToggle2FA}
                />
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Notification Settings */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Bell size={20} /> Notifications</CardTitle>
            <CardDescription>Manage how you receive notifications.</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="flex items-center justify-between rounded-lg border p-4 glass">
                <div className="space-y-0.5">
                    <Label className="text-base">Enable Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                        Receive updates about new releases, comments, and more.
                    </p>
                </div>
                 <Switch
                   checked={notificationsEnabled}
                   onCheckedChange={setNotificationsEnabled}
                 />
             </div>
             {/* Add more granular notification controls here if needed */}
             <Button onClick={() => handleSaveChanges('Notifications')} className="mt-4 neon-glow-hover">Save Notification Settings</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


'use client';

import React, { useState, useEffect, useCallback, ChangeEvent } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, ShieldCheck, Zap, Award, Edit2, BookOpen, ListVideo, Heart, Settings, Star, Loader2, Save, Image as ImageIcon, Camera, X, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { getAnimeById, Anime } from '@/services/anime';
import { getMangaById, Manga } from '@/services/manga';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth'; // Import useAuth
import { getUserProfileDocument, updateUserProfileDocument, UserProfileData, UserListItemData, defaultUserProfileData, createUserProfileDocument } from '@/services/profile.ts'; // Import profile services with .ts extension
import { Alert, AlertTitle, AlertDescription as AlertDescriptionUI } from "@/components/ui/alert"; // Renamed to avoid conflict


// Combine fetched item details with user data
type FetchedListItemDetails = (Anime | Manga) & UserListItemData;

// --- ListItemCard (Accepts full fetched details) ---
const ListItemCard = ({ item }: { item: FetchedListItemDetails }) => {
  if (!item || !item.mal_id) return null;
  const linkHref = `/${item.type}/${item.mal_id}`;

  return (
      <Link href={linkHref} passHref legacyBehavior>
          <a className="block group">
              <Card className="overflow-hidden glass neon-glow-hover transition-all duration-300 group-hover:scale-105 flex h-full">
                  <div className="p-0 relative h-28 w-20 flex-shrink-0 overflow-hidden rounded-l-md">
                      {item.imageUrl ? (
                          <Image
                              src={item.imageUrl}
                              alt={item.title}
                              fill
                              sizes="80px"
                              className="object-cover transition-transform duration-300 group-hover:scale-105"
                              onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/80x120.png?text=N/A&font=poppins'; }}
                              data-ai-hint={`${item.type} cover`}
                          />
                      ) : (
                          <div className="h-full w-full bg-muted flex items-center justify-center">
                              {item.type === 'anime' ? <ListVideo className="w-8 h-8 text-muted-foreground" /> : <BookOpen className="w-8 h-8 text-muted-foreground" />}
                          </div>
                      )}
                  </div>
                  <CardContent className="p-3 flex-grow flex flex-col justify-between">
                      <div>
                          <CardTitle className="text-sm font-semibold mb-1 line-clamp-1 group-hover:text-primary transition-colors">
                              {item.title}
                          </CardTitle>
                          {item.userScore !== undefined && item.userScore !== null && (
                              <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                                  My Score: <Star size={12} className="text-yellow-400 inline-block"/> {item.userScore}/10
                              </p>
                          )}
                          {item.userProgress && item.userStatus !== 'Favorited' && (
                              <p className="text-xs text-muted-foreground mb-1">Progress: {item.userProgress}</p>
                          )}
                           {(item.userScore === undefined || item.userScore === null) && item.score && (
                              <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                                  MAL Score: <Star size={12} className="text-yellow-400 inline-block"/> {item.score.toFixed(1)}
                              </p>
                          )}
                          {item.userStatus === 'Favorited' && item.synopsis && (
                              <p className="text-xs text-muted-foreground line-clamp-1 mb-1">{item.synopsis}</p>
                          )}
                      </div>
                      <div className="flex justify-between items-center mt-auto pt-1 border-t border-border/50">
                          <Badge
                              variant={
                                  item.userStatus === 'Watching' || item.userStatus === 'Reading' ? 'default' :
                                  item.userStatus === 'Completed' ? 'secondary' :
                                  item.userStatus === 'Dropped' ? 'destructive' :
                                  item.userStatus === 'Favorited' ? 'outline' :
                                  'outline'
                              }
                              className="text-xs px-1.5 py-0.5 capitalize"
                          >
                              {item.userStatus}
                          </Badge>
                           <span className="text-xs text-primary font-medium group-hover:underline">View Details</span>
                      </div>
                  </CardContent>
              </Card>
          </a>
      </Link>
  );
};

const ListItemSkeletonCard = () => (
     <Card className="overflow-hidden glass flex h-28 animate-pulse">
        <div className="p-0 relative h-28 w-20 flex-shrink-0">
            <Skeleton className="h-full w-full" />
        </div>
        <CardContent className="p-3 flex-grow flex flex-col justify-between">
            <div>
                <Skeleton className="h-4 w-3/4 mb-1" />
                <Skeleton className="h-3 w-1/2 mb-1" />
                <Skeleton className="h-3 w-1/3 mb-2" />
                 <Skeleton className="h-4 w-10 mb-2" />
            </div>
            <div className="flex justify-between items-center mt-auto pt-1 border-t border-border/50">
                 <Skeleton className="h-4 w-16" />
                 <Skeleton className="h-3 w-12" />
            </div>
        </CardContent>
    </Card>
);

const UserListItemFetcher: React.FC<UserListItemData> = ({ id, type, userStatus, userScore, userProgress }) => {
  const [itemDetails, setItemDetails] = useState<FetchedListItemDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    const fetchData = async () => {
      try {
        let data: Anime | Manga | null = null;
        if (type === 'anime') {
          data = await getAnimeById(id);
        } else {
          data = await getMangaById(id);
        }

        if (isMounted) {
          if (data) {
            setItemDetails({
              ...data,
              userStatus,
              userScore,
              userProgress,
            });
          } else {
             setError(`Could not load ${type} details.`);
             console.warn(`[UserListItemFetcher] Failed to fetch details for ${type} ID ${id}`);
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error(`[UserListItemFetcher] Error fetching ${type} ID ${id}:`, err);
           setError(`Error loading ${type}.`);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [id, type, userStatus, userScore, userProgress, toast]);

  if (loading) {
    return <ListItemSkeletonCard />;
  }

  if (error || !itemDetails) {
     return (
        <Card className="overflow-hidden glass flex h-28 border-destructive/50">
             <div className="p-0 relative h-28 w-20 flex-shrink-0 bg-muted/50 flex items-center justify-center">
                 {type === 'anime' ? <ListVideo className="w-8 h-8 text-destructive" /> : <BookOpen className="w-8 h-8 text-destructive" />}
             </div>
             <CardContent className="p-3 flex-grow flex flex-col justify-center items-center">
                 <p className="text-xs text-destructive text-center">{error || `Could not load ${type}`}</p>
                 <p className="text-[10px] text-muted-foreground">ID: {id}</p>
             </CardContent>
        </Card>
    );
  }

  return <ListItemCard item={itemDetails} />;
};

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth(); // Get user from AuthContext
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('activity');
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  const [editData, setEditData] = useState<{
      username: string;
      bio: string;
      status: string;
      avatarFile: File | null;
      bannerFile: File | null;
      avatarPreview: string | null;
      bannerPreview: string | null;
  }>({
      username: '', bio: '', status: '',
      avatarFile: null, bannerFile: null,
      avatarPreview: null, bannerPreview: null,
  });

  const fetchAndSetUserProfile = useCallback(async (uid: string, email?: string, displayName?: string, photoURL?: string) => {
    setLoadingProfile(true);
    setProfileError(null);
    console.log("Fetching user profile for UID:", uid);
    try {
      let fetchedProfile = await getUserProfileDocument(uid);
      if (fetchedProfile) {
        console.log("Profile data fetched:", fetchedProfile);
      } else {
        console.warn("No profile document found for UID:", uid, "Creating a new one.");
        const newProfileInitialData: Partial<UserProfileData> = {
            email: email || '',
            username: displayName || email?.split('@')[0] || `User${uid.substring(0,5)}`,
            avatarUrl: photoURL || null,
        };
        fetchedProfile = await createUserProfileDocument(uid, newProfileInitialData);
        if (fetchedProfile) {
            console.log("New profile created and fetched:", fetchedProfile);
            setProfileError("New profile created. Please review and save any initial changes.");
            setIsEditing(true); // Force edit mode for a new profile
        } else {
            throw new Error("Failed to create new profile document.");
        }
      }

      setUserProfile(fetchedProfile);
      setEditData({
          username: fetchedProfile.username || '',
          bio: fetchedProfile.bio || '',
          status: fetchedProfile.status || '',
          avatarFile: null,
          bannerFile: null,
          avatarPreview: fetchedProfile.avatarUrl,
          bannerPreview: fetchedProfile.bannerUrl,
      });

    } catch (error: any) {
      console.error("Failed to fetch or create user profile:", error);
      setProfileError(error.message || "Could not load or initialize profile. Please try again later.");
      toast({ title: "Profile Error", description: "Failed to load or initialize profile.", variant: "destructive" });
    } finally {
      setLoadingProfile(false);
    }
  }, [toast]); // Removed `user` from dependencies as it might cause loop with createUserProfileDocument

  useEffect(() => {
    if (user && !authLoading && !userProfile) { // Fetch only if user exists, auth not loading, and profile not yet loaded
      fetchAndSetUserProfile(user.uid, user.email ?? undefined, user.displayName ?? undefined, user.photoURL ?? undefined);
    } else if (!authLoading && !user) {
      setLoadingProfile(false);
      setProfileError("Please log in to view your profile.");
      setUserProfile(null);
      setIsEditing(false);
    }
    // This effect should run when user or authLoading changes, to initiate fetch or clear profile.
  }, [user, authLoading, fetchAndSetUserProfile, userProfile]);


  const handleEditToggle = () => {
      if (isEditing && userProfile) { // Reset editData to current profile if cancelling edit
          setEditData({
             username: userProfile.username || '', bio: userProfile.bio || '', status: userProfile.status || '',
             avatarFile: null, bannerFile: null,
             avatarPreview: userProfile.avatarUrl, bannerPreview: userProfile.bannerUrl,
          });
      }
      setIsEditing(!isEditing);
  };

  const handleEditChange = (field: keyof Omit<typeof editData, 'avatarFile' | 'bannerFile' | 'avatarPreview' | 'bannerPreview'>, value: string) => {
     setEditData(prev => ({ ...prev, [field]: value }));
  };

 const handleFileChange = (type: 'avatar' | 'banner', event: ChangeEvent<HTMLInputElement>) => {
     const file = event.target.files?.[0];
     if (file) {
         const fieldKey = type === 'avatar' ? 'avatarFile' : 'bannerFile';
         const previewKey = type === 'avatar' ? 'avatarPreview' : 'bannerPreview';
         setEditData(prev => ({ ...prev, [fieldKey]: file }));
         const reader = new FileReader();
         reader.onloadend = () => {
             setEditData(prev => ({ ...prev, [previewKey]: reader.result as string }));
         };
         reader.readAsDataURL(file);
     }
 };

 const handleSaveChanges = async () => {
     if (!user || !userProfile) {
         toast({ title: "Error", description: "User not logged in or profile data missing.", variant: "destructive" });
         return;
     }
     setLoadingProfile(true); // Use loadingProfile to indicate save operation
     console.log("Saving profile changes for UID:", user.uid, "Data:", editData);

     try {
         let newAvatarUrl = userProfile.avatarUrl; // Keep existing if no new file
         if (editData.avatarFile) {
             // TODO: Implement actual file upload to Firebase Storage
             // newAvatarUrl = await uploadFileToStorage(editData.avatarFile, `avatars/${user.uid}`);
             await new Promise(resolve => setTimeout(resolve, 500)); // Simulate
             newAvatarUrl = editData.avatarPreview; // Use preview for simulation
             console.log("Simulated avatar upload complete.");
         }

         let newBannerUrl = userProfile.bannerUrl; // Keep existing if no new file
         if (editData.bannerFile) {
             // newBannerUrl = await uploadFileToStorage(editData.bannerFile, `banners/${user.uid}`);
             await new Promise(resolve => setTimeout(resolve, 500)); // Simulate
             newBannerUrl = editData.bannerPreview; // Use preview for simulation
             console.log("Simulated banner upload complete.");
         }

         const updatedProfileData: Partial<UserProfileData> = {
             username: editData.username,
             bio: editData.bio,
             status: editData.status,
             avatarUrl: newAvatarUrl,
             bannerUrl: newBannerUrl,
             // updatedAt will be handled by service
         };

         await updateUserProfileDocument(user.uid, updatedProfileData);
         console.log("Firestore profile update complete.");

         // Refetch profile to get server-generated timestamps and ensure consistency
         await fetchAndSetUserProfile(user.uid);
         setIsEditing(false);
         toast({ title: "Profile Updated", description: "Your profile has been successfully updated.", variant: "default" });
     } catch (error: any) {
         console.error("Failed to save profile changes:", error);
         toast({ title: "Save Error", description: error.message || "Could not save profile changes.", variant: "destructive" });
     } finally {
         setLoadingProfile(false);
     }
 };

 const handleCreateNewProfile = async () => {
    if (!user) {
        toast({ title: "Error", description: "You must be logged in to create a profile.", variant: "destructive" });
        return;
    }
    await fetchAndSetUserProfile(user.uid, user.email ?? undefined, user.displayName ?? undefined, user.photoURL ?? undefined);
 };


  const renderList = (items: UserListItemData[] | undefined, emptyMessage: string) => {
    if (!items || items.length === 0) {
      return <p className="text-center text-muted-foreground mt-8 py-6">{emptyMessage}</p>;
    }
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {items.map((item) => (
          <UserListItemFetcher
             key={`${item.type}-${item.id}`}
             id={item.id} type={item.type} userStatus={item.userStatus}
             userScore={item.userScore} userProgress={item.userProgress}
           />
        ))}
      </div>
    );
  };

  if (authLoading || (loadingProfile && !userProfile && !profileError)) {
    return (
      <div className="container mx-auto px-4 py-8 animate-pulse">
        <Card className="mb-8 glass overflow-hidden border-primary/20 shadow-lg">
           <Skeleton className="h-36 md:h-48 w-full"/>
            <CardContent className="p-4 md:p-6 pt-10 md:pt-12">
                 <div className="flex items-end gap-4 mb-6" style={{ marginTop: '-60px' }}>
                     <Skeleton className="h-24 w-24 md:h-32 md:w-32 rounded-full border-4 border-background" />
                     <div className="pb-8 md:pb-10 space-y-2">
                         <Skeleton className="h-7 w-48" />
                         <Skeleton className="h-5 w-32" />
                     </div>
                 </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 text-center">
                    {Array.from({length: 4}).map((_, i) => <Skeleton key={i} className="h-16 glass" />)}
                </div>
                <div className="mb-4">
                    <div className="flex justify-between mb-1"> <Skeleton className="h-3 w-16" /> <Skeleton className="h-3 w-20" /> </div>
                    <Skeleton className="h-1.5 w-full rounded-full" />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Skeleton className="h-5 w-20" /> <Skeleton className="h-5 w-24 rounded-full" /> <Skeleton className="h-5 w-16 rounded-full" />
                </div>
            </CardContent>
        </Card>
         <Skeleton className="h-10 w-full glass mb-6"/>
         <Card className="glass"><CardHeader><Skeleton className="h-6 w-40" /></CardHeader><CardContent><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">{Array.from({length: 3}).map((_, i) => <ListItemSkeletonCard key={i}/>)}</div></CardContent></Card>
      </div>
    );
  }

  if (profileError && !userProfile) { // Error and no profile to display
    return (
      <div className="container mx-auto px-4 py-8 text-center flex flex-col items-center justify-center min-h-[70vh]">
        <Alert variant="destructive" className="max-w-md glass">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Profile Error</AlertTitle>
            <AlertDescriptionUI>{profileError}</AlertDescriptionUI>
        </Alert>
        {!user && <Link href="/login" className="mt-4"><Button variant="outline">Go to Login</Button></Link>}
        {user && (
             <Button onClick={handleCreateNewProfile} variant="outline" className="mt-4" disabled={loadingProfile}>
                 {loadingProfile ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                 Initialize My Profile
             </Button>
        )}
      </div>
    );
  }

  if (!userProfile) { // Should be caught by above, but as a fallback
      return (
        <div className="container mx-auto px-4 py-8 text-center">
            <p>Loading profile or user not logged in...</p>
             {!user && !authLoading && <Link href="/login" className="mt-4"><Button variant="outline">Go to Login</Button></Link>}
        </div>
      );
  }


  const xpPercentage = userProfile.xpToNextLevel > 0 ? (userProfile.xp / userProfile.xpToNextLevel) * 100 : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="mb-8 glass overflow-hidden border-primary/20 shadow-xl">
        <div className="relative h-36 md:h-48 bg-gradient-to-br from-primary/80 via-purple-600/70 to-pink-600/70">
          {editData.bannerPreview ? (
             <Image src={editData.bannerPreview} alt={`${editData.username || userProfile.username}'s banner`} fill objectFit="cover" className="opacity-70" data-ai-hint="user banner abstract"/>
          ) : ( <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-purple-600/70 to-pink-600/70"></div> )}
          {isEditing && (
              <div className="absolute bottom-2 right-2 z-20">
                 <Input id="banner-upload" type="file" accept="image/*" onChange={(e) => handleFileChange('banner', e)} className="hidden"/>
                 <Label htmlFor="banner-upload"><Button size="icon" variant="outline" className="glass w-8 h-8 backdrop-blur-md bg-black/30 border-white/30 hover:bg-black/50 cursor-pointer" asChild><span><Camera className="h-4 w-4 text-white"/></span></Button></Label>
              </div>
          )}
           <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
          <div className="absolute bottom-[-50px] left-4 md:left-6 flex items-end gap-4 z-10">
             <div className="relative group">
                <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-background shadow-xl transition-transform hover:scale-105">
                   {editData.avatarPreview || userProfile.avatarUrl ? ( <AvatarImage src={editData.avatarPreview || userProfile.avatarUrl!} alt={editData.username || userProfile.username!} /> ) : ( <AvatarFallback className="text-2xl md:text-3xl">{(editData.username || userProfile.username || 'U').slice(0, 2).toUpperCase()}</AvatarFallback> )}
                </Avatar>
                {isEditing && (
                     <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 rounded-full transition-opacity duration-300 cursor-pointer">
                         <Input id="avatar-upload" type="file" accept="image/*" onChange={(e) => handleFileChange('avatar', e)} className="hidden"/>
                         <Label htmlFor="avatar-upload" className="cursor-pointer"><Camera className="h-6 w-6 text-white"/></Label>
                     </div>
                 )}
             </div>
             <div className="pb-2 md:pb-3">
                 {isEditing ? ( <Input value={editData.username} onChange={(e) => handleEditChange('username', e.target.value)} className="text-xl md:text-2xl font-bold text-white bg-transparent border-none p-0 h-auto focus:ring-0 placeholder-gray-300" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.6)' }} placeholder="Username"/>
                 ) : ( <h1 className="text-xl md:text-2xl font-bold text-white" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.6)' }}>{userProfile.username}</h1> )}
                  {isEditing ? ( <Input value={editData.status} onChange={(e) => handleEditChange('status', e.target.value)} className="text-xs md:text-sm text-gray-300 bg-transparent border-none p-0 h-auto focus:ring-0 placeholder-gray-400 mt-1" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }} placeholder="Set your status..." maxLength={60}/>
                  ) : ( <p className="text-xs md:text-sm text-gray-300" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>{userProfile.status || 'No status set'}</p> )}
             </div>
          </div>
           <div className="absolute top-3 right-3 flex gap-2 z-10">
                {!isEditing ? ( <Button size="icon" variant="outline" className="glass w-8 h-8 backdrop-blur-md bg-black/30 border-white/30 hover:bg-black/50" onClick={handleEditToggle}><Edit2 className="h-4 w-4 text-white"/><span className="sr-only">Edit Profile</span></Button>
                ) : ( <>
                        <Button size="icon" variant="outline" className="glass w-8 h-8 backdrop-blur-md bg-green-600/70 border-white/30 hover:bg-green-500/70" onClick={handleSaveChanges} disabled={loadingProfile || authLoading}> {loadingProfile ? <Loader2 className="h-4 w-4 text-white animate-spin"/> : <Save className="h-4 w-4 text-white"/>} <span className="sr-only">Save Changes</span></Button>
                        <Button size="icon" variant="outline" className="glass w-8 h-8 backdrop-blur-md bg-red-600/70 border-white/30 hover:bg-red-500/70" onClick={handleEditToggle} disabled={loadingProfile || authLoading}><X size={16} className="text-white"/><span className="sr-only">Cancel Edit</span></Button>
                    </> )}
                <Link href="/settings" passHref legacyBehavior><Button asChild size="icon" variant="outline" className="glass w-8 h-8 backdrop-blur-md bg-black/30 border-white/30 hover:bg-black/50"><a><Settings className="h-4 w-4 text-white"/><span className="sr-only">Settings</span></a></Button></Link>
           </div>
        </div>
        <CardContent className="p-4 md:p-6 pt-16 md:pt-20">
           {isEditing ? ( <Textarea value={editData.bio} onChange={(e) => handleEditChange('bio', e.target.value)} placeholder="Tell everyone a little about yourself..." className="text-sm text-muted-foreground mb-4 border-l-2 border-primary pl-3 italic glass" maxLength={190}/>
            ) : ( userProfile.bio && <p className="text-sm text-muted-foreground mb-4 border-l-2 border-primary pl-3 italic">{userProfile.bio}</p> )}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4 mb-6 text-center">
             <div className="glass p-2 rounded-md border border-border/50"><p className="text-xs text-muted-foreground uppercase tracking-wider">Level</p><p className="text-lg font-semibold text-primary">{userProfile.level}</p></div>
             <div className="glass p-2 rounded-md border border-border/50"><p className="text-xs text-muted-foreground uppercase tracking-wider">Anime</p><p className="text-lg font-semibold">{userProfile.stats.animeWatched}</p></div>
             <div className="glass p-2 rounded-md border border-border/50"><p className="text-xs text-muted-foreground uppercase tracking-wider">Manga</p><p className="text-lg font-semibold">{userProfile.stats.mangaRead}</p></div>
             <div className="glass p-2 rounded-md border border-border/50"><p className="text-xs text-muted-foreground uppercase tracking-wider">Uploads</p><p className="text-lg font-semibold">{userProfile.stats.uploads}</p></div>
          </div>
          <div className="mb-4">
            <div className="flex justify-between text-xs text-muted-foreground mb-1"><span>Level {userProfile.level} XP</span><span>{userProfile.xp} / {userProfile.xpToNextLevel}</span></div>
             <Progress value={xpPercentage} className="w-full h-1.5 [&>div]:bg-gradient-to-r [&>div]:from-primary [&>div]:to-purple-500" />
          </div>
           <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-medium mr-2 text-muted-foreground">Badges:</p>
                {(userProfile.badges || []).map(badge => ( <Badge key={badge} variant="default" className="neon-glow-hover text-xs backdrop-blur-sm bg-primary/80 border border-primary/50 shadow-sm"><Award className="w-3 h-3 mr-1"/> {badge}</Badge> ))}
                 {(userProfile.badges || []).length === 0 && <span className="text-xs text-muted-foreground italic">No badges earned yet.</span>}
            </div>
        </CardContent>
      </Card>

       <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
         <TabsList className="glass mb-6 grid w-full grid-cols-2 md:grid-cols-4">
           <TabsTrigger value="activity" className="data-[state=active]:neon-glow">Activity</TabsTrigger>
           <TabsTrigger value="watchlist" className="data-[state=active]:neon-glow flex items-center gap-1"><ListVideo size={16}/> Watchlist</TabsTrigger>
           <TabsTrigger value="readlist" className="data-[state=active]:neon-glow flex items-center gap-1"><BookOpen size={16}/> Readlist</TabsTrigger>
           <TabsTrigger value="favorites" className="data-[state=active]:neon-glow flex items-center gap-1"><Heart size={16}/> Favorites</TabsTrigger>
         </TabsList>
          <TabsContent value="activity"><Card className="glass"><CardHeader><CardTitle className="text-xl">Recent Activity</CardTitle><CardDescription>Your latest interactions and updates.</CardDescription></CardHeader><CardContent><p className="text-center text-muted-foreground mt-8 py-6">Activity feed coming soon!</p></CardContent></Card></TabsContent>
         <TabsContent value="watchlist"><Card className="glass"><CardHeader><CardTitle className="text-xl">My Watchlist ({(userProfile.watchlistIds || []).length})</CardTitle><CardDescription>Anime you're watching, completed, or plan to watch.</CardDescription></CardHeader><CardContent>{renderList(userProfile.watchlistIds, "Your watchlist is empty. Add some anime!")}</CardContent></Card></TabsContent>
         <TabsContent value="readlist"><Card className="glass"><CardHeader><CardTitle className="text-xl">My Readlist ({(userProfile.readlistIds || []).length})</CardTitle><CardDescription>Manga you're reading, completed, or plan to read.</CardDescription></CardHeader><CardContent>{renderList(userProfile.readlistIds, "Your readlist is empty. Add some manga!")}</CardContent></Card></TabsContent>
         <TabsContent value="favorites"><Card className="glass"><CardHeader><CardTitle className="text-xl">My Favorites ({(userProfile.favoriteIds || []).length})</CardTitle><CardDescription>Your most cherished anime and manga.</CardDescription></CardHeader><CardContent>{renderList(userProfile.favoriteIds, "You haven't added any favorites yet.")}</CardContent></Card></TabsContent>
       </Tabs>
    </div>
  );
}

const styles = ` .shadow-text { text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.7); } `;
if (typeof window !== 'undefined') {
  const styleId = 'profile-page-styles';
  if(!document.getElementById(styleId)) {
     const styleSheet = document.createElement("style");
     styleSheet.id = styleId; styleSheet.type = "text/css"; styleSheet.innerText = styles;
     document.head.appendChild(styleSheet);
  }
}

    
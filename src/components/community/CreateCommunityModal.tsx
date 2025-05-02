// src/components/community/CreateCommunityModal.tsx
'use client';

import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Image as ImageIcon, Upload, Info, Users } from 'lucide-react'; // Added Users icon
import { useToast } from '@/hooks/use-toast';
import { createCommunity, Community } from '@/services/community'; // Import service
import { useAuth } from '@/context/AuthContext'; // Corrected import path for useAuth
import Image from 'next/image'; // Import Next Image for preview

interface CreateCommunityModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (newCommunity: Community) => void; // Callback when community is created
}

const CreateCommunityModal: React.FC<CreateCommunityModalProps> = ({ isOpen, onClose, onCreate }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [imageUrl, setImageUrl] = useState<string | null>(null); // Optional Image URL
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const { user } = useAuth();

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
                setImageUrl(null); // Clear manual URL if file is chosen
            };
            reader.readAsDataURL(file);
        } else {
             setImageFile(null);
             setImagePreview(null);
        }
    };

    const handleCreate = async () => {
        if (!name.trim() || !description.trim()) {
            toast({ title: "Missing Information", description: "Please enter a name and description.", variant: "destructive" });
            return;
        }
        if (!user) {
            toast({ title: "Authentication Error", description: "You must be logged in to create a community.", variant: "destructive" });
            return;
        }

        setIsLoading(true);
        try {
            // Upload image first if selected (use your storage function)
             let uploadedImageUrl: string | null = imageUrl; // Start with manual URL or null
             if (imageFile) {
                 // TODO: Replace with your actual Firebase Storage upload function
                 // Example: uploadedImageUrl = await uploadCommunityIcon(imageFile, user.uid);
                 await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate upload
                 uploadedImageUrl = imagePreview; // Use preview as placeholder in simulation
                 console.log("Simulated image upload, URL:", uploadedImageUrl);
             }


            const newCommunityData = {
                name: name.trim(),
                description: description.trim(),
                imageUrl: uploadedImageUrl, // Use the potentially uploaded URL
                creatorId: user.uid,
                creatorName: user.displayName || user.email || 'Anonymous', // Use display name or email
                memberCount: 1, // Creator is the first member
                createdAt: new Date(),
                 // Add other initial fields like default channels if needed
                 channels: [{ id: 'general', name: 'general', type: 'text' }], // Add a default general channel
                 members: [user.uid] // Add creator to members list
            };

            const createdDoc = await createCommunity(newCommunityData);
            // Assuming createCommunity returns the full Community object with ID
             const createdCommunityWithId: Community = {
                ...newCommunityData,
                 id: createdDoc.id, // Add the Firestore document ID
                 icon: Users, // Default icon, can be set later
                 onlineCount: 1, // Creator is online
             };


            toast({ title: "Community Created!", description: `Successfully created "${createdCommunityWithId.name}".` });
            onCreate(createdCommunityWithId); // Pass the new community data back
            // Reset form
            setName('');
            setDescription('');
            setImageUrl(null);
            setImageFile(null);
            setImagePreview(null);
            onClose(); // Close the modal

        } catch (error) {
            console.error("Error creating community:", error);
            toast({ title: "Creation Failed", description: "Could not create the community. Please try again.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="glass sm:max-w-[480px]">
                <DialogHeader>
                    <DialogTitle>Create a New Community</DialogTitle>
                    <DialogDescription>
                        Start a new space for discussion, sharing, or collaboration.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                     {/* Community Name */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="community-name" className="text-right">
                            Name
                        </Label>
                        <Input
                            id="community-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., Shonen Showdown"
                            className="col-span-3 glass"
                            required
                            disabled={isLoading}
                        />
                    </div>
                     {/* Community Description */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="community-description" className="text-right">
                            Description
                        </Label>
                        <Textarea
                            id="community-description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="What is this community about?"
                            className="col-span-3 glass min-h-[60px]"
                            required
                            disabled={isLoading}
                        />
                    </div>
                     {/* Community Image Upload or URL */}
                     <div className="grid grid-cols-4 items-center gap-4">
                         <Label htmlFor="community-image-upload" className="text-right">
                            Icon
                         </Label>
                         <div className="col-span-3 space-y-2">
                             <Input
                                 id="community-image-upload"
                                 type="file"
                                 accept="image/png, image/jpeg, image/gif, image/webp"
                                 onChange={handleImageChange}
                                 className="glass file:text-primary file:font-semibold hover:file:bg-primary/10"
                                 disabled={isLoading}
                             />
                              <p className="text-xs text-muted-foreground flex items-center gap-1"><Info size={12}/> Optional. Upload an icon or provide a URL below.</p>
                             {/* OR Image URL */}
                              {/* <div className="flex items-center gap-2">
                                  <span className="text-xs text-muted-foreground">OR</span>
                                  <Input
                                      id="community-image-url"
                                      type="url"
                                      value={imageUrl || ''}
                                      onChange={(e) => {
                                          setImageUrl(e.target.value);
                                          setImageFile(null); // Clear file if URL is typed
                                          setImagePreview(e.target.value); // Use URL as preview
                                      }}
                                      placeholder="Paste Image URL"
                                      className="glass text-xs"
                                      disabled={isLoading}
                                  />
                              </div> */}
                             {imagePreview && (
                                 <div className="mt-2 rounded-md overflow-hidden border border-border w-20 h-20 relative glass">
                                     <Image src={imagePreview} alt="Community Icon Preview" layout="fill" objectFit="cover" />
                                 </div>
                             )}
                         </div>
                     </div>

                </div>
                <DialogFooter>
                     <DialogClose asChild>
                         <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                            Cancel
                         </Button>
                    </DialogClose>
                    <Button type="button" onClick={handleCreate} disabled={isLoading || !name.trim() || !description.trim()}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Create Community
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default CreateCommunityModal;

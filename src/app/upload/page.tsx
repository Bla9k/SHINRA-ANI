
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Upload as UploadIcon, FileImage, Book, Tag, PlusCircle, X, Loader2 } from 'lucide-react'; // Added Loader2
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

interface ChapterFile {
  name: string;
  file: File;
}

export default function UploadPage() {
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [chapters, setChapters] = useState<ChapterFile[]>([]);
  const [isUploading, setIsUploading] = useState(false); // Loading state

  const handleCoverImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCoverImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
        setCoverImage(null);
        setCoverPreview(null);
    }
  };

  const handleChapterFilesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newChapters = Array.from(files).map(file => ({ name: `Chapter ${chapters.length + 1 + Array.from(files).indexOf(file)}`, file })); // Basic naming
      setChapters(prev => [...prev, ...newChapters]);
       // Clear the input value to allow uploading the same file again if needed
       event.target.value = '';
    }
  };

  const handleRemoveChapter = (index: number) => {
    setChapters(prev => prev.filter((_, i) => i !== index));
  };

    const handleAddTag = () => {
      if (currentTag.trim() && !tags.includes(currentTag.trim()) && tags.length < 10) { // Limit tags
        setTags([...tags, currentTag.trim().toLowerCase()]); // Store lowercase tags
        setCurrentTag('');
      } else if (tags.length >= 10) {
          toast({ title: "Tag Limit Reached", description: "You can add a maximum of 10 tags.", variant: "destructive"});
      }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

  const handleUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Basic validation
    if (!title || !description || !coverImage || chapters.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please provide a title, description, cover image, and at least one chapter file.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true); // Set loading state
    toast({
      title: "Upload Started",
      description: `Uploading "${title}"... Please wait.`,
    });

    try {
      // --- TODO: Implement Real Upload Logic ---
      console.log('Starting upload process...');
      console.log({ title, description, tags, coverImage, chapters });

      // 1. Upload Cover Image to Firebase Storage
      //    - Generate a unique path (e.g., `manga/${mangaId}/cover.${extension}`)
      //    - Call your Firebase Storage upload function: `const coverUrl = await uploadFile(coverImage, path);`
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
      const coverUrl = coverPreview; // Placeholder URL

      // 2. Upload Chapter Files to Firebase Storage
      //    - Loop through `chapters` array
      //    - Upload each `chapter.file` to a path like `manga/${mangaId}/chapters/${chapterIndex}.${extension}`
      //    - Store the resulting URLs along with chapter names/order
      const chapterUploadPromises = chapters.map(async (chapter, index) => {
          // const chapterPath = `manga/${mangaId}/chapters/${index + 1}.${chapter.file.name.split('.').pop()}`;
          // const chapterUrl = await uploadFile(chapter.file, chapterPath);
          await new Promise(resolve => setTimeout(resolve, 300 * (index + 1))); // Simulate delay per chapter
          return { name: chapter.name, url: `placeholder/chapter${index + 1}.pdf`, order: index + 1 }; // Placeholder
      });
      const uploadedChaptersData = await Promise.all(chapterUploadPromises);

      // 3. Save Manga Metadata to Firestore
      //    - Create a new document in a 'mangaUploads' collection (or similar)
      //    - Include: title, description, tags, coverUrl, uploadedChaptersData (array of {name, url, order}), authorId, authorUsername, timestamp, etc.
      const mangaMetadata = {
          title,
          description,
          tags,
          coverUrl,
          chapters: uploadedChaptersData,
          authorId: "USER_ID_PLACEHOLDER", // TODO: Get actual user ID from auth state
          authorUsername: "ShinraFanatic", // TODO: Get actual username
          createdAt: new Date(),
          updatedAt: new Date(),
          // Add other fields like view count, rating average etc. initialized to 0
      };
      console.log("Saving metadata to Firestore:", mangaMetadata);
      // await db.collection('mangaUploads').add(mangaMetadata);
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate DB save delay
      // --- End TODO ---

       toast({
         title: "Upload Successful!",
         description: `Your manga "${title}" has been uploaded and is now available in the community section.`,
         variant: "default",
       });

       // Reset form fields after successful upload
      setTitle('');
      setDescription('');
      setTags([]);
      setCurrentTag('');
      setCoverImage(null);
      setCoverPreview(null);
      setChapters([]);

    } catch (error) {
       console.error("Manga upload failed:", error);
       toast({
         title: "Upload Failed",
         description: "Something went wrong during the upload. Please check the console and try again.",
         variant: "destructive",
       });
    } finally {
       setIsUploading(false); // Reset loading state
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl"> {/* Constrain width */}
      <div className="text-center mb-8">
          <UploadIcon className="h-12 w-12 mx-auto text-primary mb-2" />
          <h1 className="text-3xl font-bold">Upload Your Manga</h1>
          <p className="text-muted-foreground">Share your creation with the Shinra-Ani community!</p>
      </div>

      <form onSubmit={handleUpload}>
        <Card className="glass shadow-lg border-border/50">
          <CardHeader>
            <CardTitle className="text-xl">Manga Details</CardTitle>
            <CardDescription>Provide information about the manga you are uploading.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="font-semibold">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter the title of your manga"
                required
                className="glass"
                disabled={isUploading}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="font-semibold">Description / Synopsis</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide a brief summary of your manga..."
                required
                className="glass min-h-[100px]"
                disabled={isUploading}
              />
            </div>

            {/* Tags */}
             <div className="space-y-2">
               <Label htmlFor="tags" className="font-semibold">Tags / Genres</Label>
                <div className="flex items-center gap-2">
                    <Input
                        id="tags"
                        value={currentTag}
                        onChange={(e) => setCurrentTag(e.target.value)}
                        placeholder="Add relevant tags (e.g., Action, Fantasy)"
                         className="glass flex-grow"
                         onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); }}}
                         disabled={isUploading || tags.length >= 10}
                    />
                    <Button type="button" variant="outline" onClick={handleAddTag} className="neon-glow-hover" disabled={isUploading || tags.length >= 10}>Add</Button>
                </div>
                <p className="text-xs text-muted-foreground">Press Enter or click Add. Max 10 tags.</p>
                {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2 border border-dashed border-border/50 p-2 rounded-md min-h-[40px]">
                        {tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="flex items-center gap-1 capitalize">
                               {tag}
                               <button type="button" onClick={() => handleRemoveTag(tag)} className="ml-1 rounded-full hover:bg-destructive/80 p-0.5 disabled:opacity-50" disabled={isUploading}>
                                   <X size={12} />
                               </button>
                           </Badge>
                        ))}
                    </div>
                )}
             </div>

            {/* Cover Image */}
            <div className="space-y-2">
              <Label htmlFor="cover-image" className="font-semibold flex items-center gap-2"><FileImage size={16}/> Cover Image (Required)</Label>
              <Input
                id="cover-image"
                type="file"
                accept="image/png, image/jpeg, image/gif, image/webp" // Specify accepted types
                onChange={handleCoverImageChange}
                required
                className="glass file:text-primary file:font-semibold hover:file:bg-primary/10"
                disabled={isUploading}
              />
              {coverPreview && (
                 <div className="mt-2 rounded-md overflow-hidden border border-border w-32 h-48 relative glass group"> {/* Adjusted for aspect ratio */}
                    <Image
                        src={coverPreview}
                        alt="Cover preview"
                        layout="fill" // Use layout fill for responsiveness within container
                        objectFit="cover" // Ensure image covers the area
                        className="transition-opacity duration-300"
                    />
                     {/* Remove button overlay */}
                     <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                         <Button
                             type="button"
                             size="icon"
                             variant="destructive"
                             className="h-8 w-8 z-10"
                             onClick={() => {
                                 setCoverImage(null);
                                 setCoverPreview(null);
                                 // Reset file input visually
                                 const input = document.getElementById('cover-image') as HTMLInputElement;
                                 if (input) input.value = '';
                             }}
                             disabled={isUploading}
                         >
                             <X size={16} />
                         </Button>
                     </div>
                 </div>
               )}
            </div>

            {/* Chapters */}
            <div className="space-y-2">
              <Label htmlFor="chapters" className="font-semibold flex items-center gap-2"><Book size={16}/> Chapters (Required)</Label>
              <Input
                id="chapters"
                type="file"
                accept=".pdf, image/png, image/jpeg, image/webp" // Accept PDF and common image types
                multiple
                onChange={handleChapterFilesChange}
                className="glass file:text-primary file:font-semibold hover:file:bg-primary/10"
                disabled={isUploading}
              />
              {chapters.length > 0 && (
                <div className="mt-2 space-y-2">
                  <p className="text-sm font-medium">Queued Chapters ({chapters.length}):</p>
                  <ScrollArea className="h-48 rounded-md border glass p-2"> {/* Scrollable area */}
                      <ul className="space-y-1">
                        {chapters.map((chapter, index) => (
                          <li key={`${chapter.file.name}-${index}`} className="text-sm text-muted-foreground flex justify-between items-center hover:bg-muted/50 px-1 py-0.5 rounded">
                            <span className="truncate flex-1 mr-2">{chapter.file.name}</span>
                            <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6 text-destructive hover:bg-destructive/10 flex-shrink-0 disabled:opacity-50"
                                onClick={() => handleRemoveChapter(index)}
                                disabled={isUploading}
                             >
                               <X size={14} />
                            </Button>
                          </li>
                        ))}
                      </ul>
                  </ScrollArea>
                </div>
              )}
              <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => document.getElementById('chapters')?.click()} // Trigger file input click
                  disabled={isUploading}
               >
                <PlusCircle size={16} className="mr-1" /> Add Chapters
              </Button>
            </div>

            <Button type="submit" className="w-full neon-glow neon-glow-hover" disabled={isUploading}>
              {isUploading ? (
                 <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...
                 </>
              ) : (
                  <>
                    <UploadIcon className="mr-2 h-4 w-4" /> Publish Manga
                  </>
               )}
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}

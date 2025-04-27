
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Upload as UploadIcon, FileImage, Book, Tag, PlusCircle, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image'; // Import Image

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
    }
  };

  const handleRemoveChapter = (index: number) => {
    setChapters(prev => prev.filter((_, i) => i !== index));
  };

    const handleAddTag = () => {
      if (currentTag.trim() && !tags.includes(currentTag.trim())) {
        setTags([...tags, currentTag.trim()]);
        setCurrentTag('');
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
        description: "Please fill in all fields, upload a cover image, and add at least one chapter.",
        variant: "destructive",
      });
      return;
    }

    // TODO: Implement actual upload logic using Firebase Storage
    console.log('Uploading manga...');
    console.log({ title, description, tags, coverImage, chapters });

    // Simulate upload process
    toast({
      title: "Upload Started",
      description: `Uploading "${title}"...`,
    });

    try {
        // Simulate API call / Firebase upload
        await new Promise(resolve => setTimeout(resolve, 2000));

         toast({
           title: "Upload Successful",
           description: `"${title}" has been uploaded successfully!`,
           variant: "default", // Success variant
         });
         // Reset form
        setTitle('');
        setDescription('');
        setTags([]);
        setCoverImage(null);
        setCoverPreview(null);
        setChapters([]);

    } catch (error) {
         console.error("Upload failed:", error);
         toast({
           title: "Upload Failed",
           description: "Something went wrong during the upload. Please try again.",
           variant: "destructive",
         });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <UploadIcon className="h-7 w-7" /> Upload Your Manga
      </h1>

      <form onSubmit={handleUpload}>
        <Card className="glass">
          <CardHeader>
            <CardTitle>Manga Details</CardTitle>
            <CardDescription>Provide information about the manga you are uploading. It will appear in the Community section.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter manga title"
                required
                className="glass"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your manga..."
                required
                className="glass min-h-[100px]"
              />
            </div>

            {/* Tags */}
             <div className="space-y-2">
               <Label htmlFor="tags">Tags</Label>
                <div className="flex items-center gap-2">
                    <Input
                        id="tags"
                        value={currentTag}
                        onChange={(e) => setCurrentTag(e.target.value)}
                        placeholder="Add tags (e.g., Action, Fantasy)"
                         className="glass flex-grow"
                         onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); }}}
                    />
                    <Button type="button" variant="outline" onClick={handleAddTag} className="neon-glow-hover">Add Tag</Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                           {tag}
                           <button type="button" onClick={() => handleRemoveTag(tag)} className="ml-1 rounded-full hover:bg-destructive/80 p-0.5">
                               <X size={12} />
                           </button>
                       </Badge>
                    ))}
                </div>
             </div>


            {/* Cover Image */}
            <div className="space-y-2">
              <Label htmlFor="cover-image" className="flex items-center gap-2"><FileImage size={16}/> Cover Image</Label>
              <Input
                id="cover-image"
                type="file"
                accept="image/*"
                onChange={handleCoverImageChange}
                required
                className="glass file:text-primary file:font-semibold hover:file:bg-primary/10"
              />
              {coverPreview && (
                 <div className="mt-2 rounded-md overflow-hidden border border-border w-32 h-48 relative glass"> {/* Adjusted for aspect ratio */}
                    <Image
                        src={coverPreview}
                        alt="Cover preview"
                        width={128} // 32 * 4
                        height={192} // 48 * 4 (maintain aspect ratio roughly)
                        className="object-cover w-full h-full" // Use object-cover
                    />
                     <Button type="button" size="icon" variant="destructive" className="absolute top-1 right-1 h-6 w-6 z-10" onClick={() => {setCoverImage(null); setCoverPreview(null); (document.getElementById('cover-image') as HTMLInputElement).value = ''; }}>
                         <X size={14} />
                    </Button>
                 </div>
               )}
            </div>

            {/* Chapters */}
            <div className="space-y-2">
              <Label htmlFor="chapters" className="flex items-center gap-2"><Book size={16}/> Chapters</Label>
              <Input
                id="chapters"
                type="file"
                accept=".pdf, image/*" // Accept PDF and images for chapters
                multiple
                onChange={handleChapterFilesChange}
                 className="glass file:text-primary file:font-semibold hover:file:bg-primary/10"
              />
              {chapters.length > 0 && (
                <div className="mt-2 space-y-2">
                  <p className="text-sm font-medium">Uploaded Chapters:</p>
                  <ul className="list-disc list-inside space-y-1 pl-2 max-h-48 overflow-y-auto glass p-2 rounded">
                    {chapters.map((chapter, index) => (
                      <li key={index} className="text-sm text-muted-foreground flex justify-between items-center">
                        <span>{chapter.file.name}</span>
                        <Button type="button" size="icon" variant="ghost" className="h-6 w-6 text-destructive hover:bg-destructive/10" onClick={() => handleRemoveChapter(index)}>
                           <X size={14} />
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => document.getElementById('chapters')?.click()}>
                <PlusCircle size={16} className="mr-1" /> Add More Chapters
              </Button>
            </div>

            <Button type="submit" className="w-full neon-glow neon-glow-hover">
              <UploadIcon className="mr-2 h-4 w-4" /> Upload Manga
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}


// src/services/community.ts
'use server';

import { db } from '@/lib/firebase';
import {
    collection,
    addDoc,
    getDocs,
    query,
    orderBy,
    limit,
    serverTimestamp,
    doc,
    setDoc,
    getDoc,
    Timestamp, // Ensure Timestamp is imported for type checks
    // arrayUnion, // Not used in current lite version
    // Update with actual FirebaseError import if needed for more specific error handling
} from 'firebase/firestore';
import type { CommunityTheme, FirebaseTimestamp } from '@/types/theme';
import type { LucideIcon } from 'lucide-react';


// Interface for Firestore Community Document
export interface Community {
    id: string;
    name: string;
    description: string;
    imageUrl: string | null;
    creatorId: string;
    creatorName: string;
    memberCount: number;
    onlineCount?: number;
    createdAt: Date | Timestamp; // Changed to allow Firestore Timestamp directly
    channels?: Array<{ id: string; name: string; type: 'text' | 'voice' }>;
    members?: string[];
    icon?: LucideIcon; // Keep if used, or remove if icons are dynamic
}

interface CreateCommunityData {
    name: string;
    description: string;
    imageUrl: string | null;
    creatorId: string;
    creatorName: string;
    memberCount: number;
    createdAt?: Date; // Make createdAt optional, serverTimestamp will be used
    channels?: Array<{ id: string; name: string; type: 'text' | 'voice' }>;
    members?: string[];
}


export async function createCommunity(communityData: CreateCommunityData) {
  if (!db) {
    console.error("Firestore instance (db) is not available in createCommunity.");
    throw new Error("Database connection not established.");
  }
  try {
    const communitiesCol = collection(db, 'communities');
    const docRef = await addDoc(communitiesCol, {
         ...communityData,
         createdAt: serverTimestamp(), // Use server timestamp for creation
         updatedAt: serverTimestamp(), // Add updatedAt as well
    });
    console.log("Community created with ID: ", docRef.id);
    // Return the created document with its ID, assuming all fields are present
    // For a more complete object, you might fetch the doc again or construct it
    return { id: docRef.id, ...communityData, createdAt: new Date(), updatedAt: new Date() } as Community; // Cast for now
  } catch (error) {
    console.error("Error creating community in Firestore:", error);
    throw new Error("Failed to create community.");
  }
}

// Helper to convert Firestore Timestamp or Date to Date
const toDateSafe = (timestamp: Date | Timestamp | FirebaseTimestamp | undefined): Date => {
  if (!timestamp) return new Date();
  if (timestamp instanceof Date) return timestamp;
  if (timestamp instanceof Timestamp) return timestamp.toDate(); // Firestore Web SDK Timestamp
  if (typeof (timestamp as FirebaseTimestamp).toDate === 'function') { // Admin SDK or similar
    return (timestamp as FirebaseTimestamp).toDate();
  }
  // Fallback for potentially already serialized data
  return new Date((timestamp as any).seconds ? (timestamp as any).seconds * 1000 : timestamp as any);
};


export async function getCommunities(count: number = 20): Promise<Community[]> {
  if (!db) {
    console.error("Firestore instance (db) is not available in getCommunities.");
    throw new Error("Database connection not established.");
  }
  try {
    const communitiesCol = collection(db, 'communities');
    const q = query(communitiesCol, orderBy('createdAt', 'desc'), limit(count));
    const communitySnapshot = await getDocs(q);

    const communitiesList = communitySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
             id: doc.id,
             name: data.name || 'Unnamed Community',
             description: data.description || '',
             imageUrl: data.imageUrl || null,
             creatorId: data.creatorId || '',
             creatorName: data.creatorName || 'Unknown Creator',
             memberCount: data.memberCount || 0,
             onlineCount: data.onlineCount || 0,
             createdAt: toDateSafe(data.createdAt),
             updatedAt: toDateSafe(data.updatedAt), // Assuming you add updatedAt
             channels: data.channels || [],
             members: data.members || [],
        } as Community;
    });

    console.log(`Fetched ${communitiesList.length} communities.`);
    return communitiesList;
  } catch (error) {
    console.error("Error fetching communities from Firestore:", error);
    throw new Error("Failed to fetch communities.");
  }
}

export async function saveCommunityTheme(communityId: string, themeData: CommunityTheme): Promise<void> {
  if (!db) {
    console.error("Firestore instance (db) is not available in saveCommunityTheme.");
    throw new Error("Database connection not established.");
  }
  if (!communityId) {
    console.error("Community ID is missing in saveCommunityTheme.");
    throw new Error("Community ID is required to save a theme.");
  }
  try {
    const themeDocRef = doc(db, 'communityThemes', communityId);
    // Ensure all parts of themeData are defined to avoid Firestore errors with undefined fields
    const dataToSave = {
        communityId,
        themeName: themeData.themeName || defaultCommunityTheme.themeName,
        colors: themeData.colors || { ...defaultCommunityTheme.colors },
        background: themeData.background || { ...defaultCommunityTheme.background },
        customTexts: themeData.customTexts || { ...defaultCommunityTheme.customTexts },
        updatedAt: serverTimestamp(), // Use server timestamp
    };
    await setDoc(themeDocRef, dataToSave, { merge: true });
    console.log(`Theme saved for community ${communityId}`);
  } catch (error) {
    console.error(`Error saving theme for community ${communityId}:`, error);
    throw new Error('Failed to save community theme.');
  }
}

export async function getCommunityTheme(communityId: string): Promise<CommunityTheme | null> {
  if (!db) {
    console.error("Firestore instance (db) is not available in getCommunityTheme.");
    throw new Error("Database connection not established.");
  }
  if (!communityId) {
    console.warn("Community ID is missing in getCommunityTheme. Returning null.");
    return null;
  }
  try {
    const themeDocRef = doc(db, 'communityThemes', communityId);
    const docSnap = await getDoc(themeDocRef);

    if (docSnap.exists()) {
      const data = docSnap.data() as Omit<CommunityTheme, 'updatedAt'> & { updatedAt?: Timestamp | FirebaseTimestamp }; // Expect Firestore Timestamp
      console.log(`Theme fetched for community ${communityId}`);
      return {
        ...defaultCommunityTheme, // Start with defaults to ensure all fields
        ...data,                   // Override with fetched data
        communityId,
        updatedAt: data.updatedAt ? toDateSafe(data.updatedAt) : new Date(), // Convert to JS Date
      } as CommunityTheme;
    } else {
      console.log(`No theme found for community ${communityId}, returning null.`);
      return null;
    }
  } catch (error) {
    console.error(`Error fetching theme for community ${communityId}:`, error);
    throw new Error('Failed to fetch community theme.');
  }
}

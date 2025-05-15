
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
    getDoc, // Added getDoc
    // arrayUnion, // Not used in current lite version
    Timestamp
} from 'firebase/firestore';
import type { CommunityTheme, FirebaseTimestamp } from '@/types/theme'; // Import CommunityTheme
import type { LucideIcon } from 'lucide-react';


// Interface for Firestore Community Document (adjust fields as needed)
export interface Community {
    id: string; // Firestore document ID
    name: string;
    description: string;
    imageUrl: string | null;
    creatorId: string;
    creatorName: string;
    memberCount: number;
    onlineCount?: number; // Optional online count
    createdAt: Date | Timestamp; // Use Firestore Timestamp or Date
    channels?: Array<{ id: string; name: string; type: 'text' | 'voice' }>;
    members?: string[]; // Array of user UIDs
    icon?: LucideIcon;
}

interface CreateCommunityData {
    name: string;
    description: string;
    imageUrl: string | null;
    creatorId: string;
    creatorName: string;
    memberCount: number;
    createdAt: Date; // Client-side creation for initial object
    channels?: Array<{ id: string; name: string; type: 'text' | 'voice' }>;
    members?: string[];
}


export async function createCommunity(communityData: CreateCommunityData) {
    try {
        const communitiesCol = collection(db, 'communities');
        const docRef = await addDoc(communitiesCol, {
             ...communityData,
             createdAt: serverTimestamp(), // Overwrite with server timestamp
        });
        console.log("Community created with ID: ", docRef.id);
        return docRef;
    } catch (error) {
        console.error("Error creating community in Firestore:", error);
        throw new Error("Failed to create community.");
    }
}

export async function getCommunities(count: number = 20): Promise<Community[]> {
    try {
        const communitiesCol = collection(db, 'communities');
        const q = query(communitiesCol, orderBy('createdAt', 'desc'), limit(count));
        const communitySnapshot = await getDocs(q);

        const communitiesList = communitySnapshot.docs.map(doc => {
            const data = doc.data();
            const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate() : (data.createdAt ? new Date(data.createdAt.seconds * 1000) : new Date());
            return {
                 id: doc.id,
                 ...data,
                 createdAt: createdAt,
            } as Community;
        });

        console.log(`Fetched ${communitiesList.length} communities.`);
        return communitiesList;
    } catch (error) {
        console.error("Error fetching communities from Firestore:", error);
        throw new Error("Failed to fetch communities.");
    }
}

/**
 * Saves or updates a community theme in Firestore.
 * @param communityId The ID of the community.
 * @param themeData The theme data to save.
 */
export async function saveCommunityTheme(communityId: string, themeData: CommunityTheme): Promise<void> {
  if (!db) {
    console.error("Firestore instance (db) is not available in saveCommunityTheme.");
    throw new Error("Database connection not established.");
  }
  try {
    const themeDocRef = doc(db, 'communityThemes', communityId);
    await setDoc(themeDocRef, { ...themeData, communityId, updatedAt: serverTimestamp() }, { merge: true });
    console.log(`Theme saved for community ${communityId}`);
  } catch (error) {
    console.error(`Error saving theme for community ${communityId}:`, error);
    throw new Error('Failed to save community theme.');
  }
}

/**
 * Fetches a community theme from Firestore.
 * @param communityId The ID of the community.
 * @returns The theme data or null if not found.
 */
export async function getCommunityTheme(communityId: string): Promise<CommunityTheme | null> {
  if (!db) {
    console.error("Firestore instance (db) is not available in getCommunityTheme.");
    throw new Error("Database connection not established.");
  }
  try {
    const themeDocRef = doc(db, 'communityThemes', communityId);
    const docSnap = await getDoc(themeDocRef);

    if (docSnap.exists()) {
      const data = docSnap.data() as Omit<CommunityTheme, 'updatedAt'> & { updatedAt?: FirebaseTimestamp };
      // Convert Firestore Timestamp to JS Date for client-side consistency
      const updatedAtDate = data.updatedAt ? toDate(data.updatedAt) : new Date();
      console.log(`Theme fetched for community ${communityId}`);
      return { ...data, communityId, updatedAt: updatedAtDate } as CommunityTheme;
    } else {
      console.log(`No theme found for community ${communityId}`);
      return null;
    }
  } catch (error) {
    console.error(`Error fetching theme for community ${communityId}:`, error);
    throw new Error('Failed to fetch community theme.');
  }
}

// Helper to convert Firestore Timestamp to Date
const toDate = (timestamp: Date | FirebaseTimestamp | undefined): Date => {
  if (!timestamp) return new Date(); // Should ideally not happen if data is consistent
  if (timestamp instanceof Date) return timestamp;
  if (typeof (timestamp as FirebaseTimestamp).toDate === 'function') {
    return (timestamp as FirebaseTimestamp).toDate();
  }
  // Fallback for potentially already serialized data (e.g., from client directly without serverTimestamp)
  return new Date((timestamp as any).seconds ? (timestamp as any).seconds * 1000 : timestamp as any);
};

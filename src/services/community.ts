// src/services/community.ts
'use server';

import { db } from '@/lib/firebase'; // Assuming db is initialized in firebase.ts
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
    arrayUnion,
    Timestamp // Import Timestamp
} from 'firebase/firestore';
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
    // Add other relevant fields: rules, defaultChannelId, etc.
    channels?: Array<{ id: string; name: string; type: 'text' | 'voice' }>; // Example channels structure
    members?: string[]; // Array of user UIDs
    icon?: LucideIcon; // Only used on client-side, not stored in Firestore
}

interface CreateCommunityData {
    name: string;
    description: string;
    imageUrl: string | null;
    creatorId: string;
    creatorName: string;
    memberCount: number;
    createdAt: Date;
    channels?: Array<{ id: string; name: string; type: 'text' | 'voice' }>;
    members?: string[];
}


/**
 * Creates a new community document in Firestore.
 * @param communityData - The data for the new community.
 * @returns The newly created document reference.
 */
export async function createCommunity(communityData: CreateCommunityData) {
    try {
        const communitiesCol = collection(db, 'communities');
        // Add server timestamp for creation
        const docRef = await addDoc(communitiesCol, {
             ...communityData,
             createdAt: serverTimestamp(), // Use server timestamp
        });
        console.log("Community created with ID: ", docRef.id);

         // Add creator to the members subcollection immediately if needed,
         // or just keep the members array in the main doc for simplicity initially.

        return docRef; // Return the document reference
    } catch (error) {
        console.error("Error creating community in Firestore:", error);
        throw new Error("Failed to create community."); // Re-throw for handling in the modal
    }
}

/**
 * Fetches a list of communities from Firestore.
 * @param count - The maximum number of communities to fetch.
 * @returns An array of Community objects.
 */
export async function getCommunities(count: number = 20): Promise<Community[]> {
    try {
        const communitiesCol = collection(db, 'communities');
        // Order by creation date (descending) and limit results
        const q = query(communitiesCol, orderBy('createdAt', 'desc'), limit(count));
        const communitySnapshot = await getDocs(q);

        const communitiesList = communitySnapshot.docs.map(doc => {
            const data = doc.data();
            // Convert Firestore Timestamp to JS Date if necessary for client-side usage
            const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date();
            return {
                 id: doc.id,
                 ...data,
                 createdAt: createdAt, // Use the converted date
            } as Community; // Type assertion
        });

        console.log(`Fetched ${communitiesList.length} communities.`);
        return communitiesList;
    } catch (error) {
        console.error("Error fetching communities from Firestore:", error);
        throw new Error("Failed to fetch communities."); // Re-throw for handling in the UI
    }
}

// --- Potentially add more functions ---
// - getCommunityById(id: string)
// - addCommunityMember(userId: string, communityId: string)
// - removeCommunityMember(userId: string, communityId: string)
// - updateCommunityDetails(communityId: string, updates: Partial<Community>)
// - fetchCommunityMembers(communityId: string)
// - fetchCommunityChannels(communityId: string)

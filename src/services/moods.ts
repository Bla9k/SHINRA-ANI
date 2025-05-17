// src/services/moods.ts
import { db } from '@/lib/firebase';
import {
    doc,
    updateDoc,
    getDoc,
    arrayUnion,
    arrayRemove,
    collection,
    query,
    where,
    getDocs,
    setDoc,
    serverTimestamp,
    Timestamp
} from 'firebase/firestore';
import type { Mood } from '@/config/moods'; // Assuming Mood type is needed for context

// Helper to convert Firestore Timestamp or Date to Date safely
const toDateSafe = (timestamp: Date | Timestamp | undefined): Date => {
  if (!timestamp) return new Date(); // Or throw error if timestamp is critical
  if (timestamp instanceof Date) return timestamp;
  if (timestamp instanceof Timestamp) return timestamp.toDate();
  // Fallback for potentially already serialized data (less common in direct Firestore reads)
  return new Date((timestamp as any).seconds ? (timestamp as any).seconds * 1000 : timestamp as any);
};

/**
 * Assigns an anime to a specific mood.
 * Creates the mood document if it doesn't exist.
 * @param animeMalId - The MAL ID of the anime.
 * @param moodId - The ID of the mood (e.g., 'heartwarming').
 */
export async function assignAnimeToMood(animeMalId: number, moodId: string): Promise<void> {
    if (!db) {
        console.error("Firestore instance (db) is not available in assignAnimeToMood.");
        throw new Error("Database connection not established.");
    }
    if (!animeMalId || !moodId) {
        console.error("Invalid input: animeMalId and moodId are required.");
        throw new Error("Anime ID and Mood ID are required.");
    }

    const moodDocRef = doc(db, 'moodPlaylists', moodId);
    try {
        // Use setDoc with merge:true to create or update the mood document,
        // and arrayUnion to add the animeId if it's not already present.
        await setDoc(moodDocRef, {
            animeIds: arrayUnion(animeMalId),
            name: moodId, // Optionally store the mood name/id for easier querying
            updatedAt: serverTimestamp() // Keep track of when the mood was last updated
        }, { merge: true });
        console.log(`Anime ${animeMalId} assigned to mood ${moodId}.`);
    } catch (error) {
        console.error(`Error assigning anime ${animeMalId} to mood ${moodId}:`, error);
        throw new Error(`Failed to assign anime to mood: ${(error as Error).message}`);
    }
}

/**
 * Removes an anime from a specific mood.
 * @param animeMalId - The MAL ID of the anime.
 * @param moodId - The ID of the mood.
 */
export async function removeAnimeFromMood(animeMalId: number, moodId: string): Promise<void> {
    if (!db) {
        console.error("Firestore instance (db) is not available in removeAnimeFromMood.");
        throw new Error("Database connection not established.");
    }
     if (!animeMalId || !moodId) {
        console.error("Invalid input: animeMalId and moodId are required for removal.");
        throw new Error("Anime ID and Mood ID are required for removal.");
    }
    const moodDocRef = doc(db, 'moodPlaylists', moodId);
    try {
        await updateDoc(moodDocRef, {
            animeIds: arrayRemove(animeMalId),
            updatedAt: serverTimestamp()
        });
        console.log(`Anime ${animeMalId} removed from mood ${moodId}.`);
    } catch (error) {
        console.error(`Error removing anime ${animeMalId} from mood ${moodId}:`, error);
        throw new Error(`Failed to remove anime from mood: ${(error as Error).message}`);
    }
}

/**
 * Gets all anime IDs associated with a specific mood.
 * @param moodId - The ID of the mood.
 * @returns A promise that resolves to an array of anime MAL IDs.
 */
export async function getAnimeIdsForMood(moodId: string): Promise<number[]> {
    if (!db) {
        console.error("Firestore instance (db) is not available in getAnimeIdsForMood.");
        throw new Error("Database connection not established.");
    }
    if (!moodId) {
        console.warn("[getAnimeIdsForMood] moodId is undefined. Returning empty array.");
        return [];
    }
    const moodDocRef = doc(db, 'moodPlaylists', moodId);
    try {
        const docSnap = await getDoc(moodDocRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            return (data.animeIds || []) as number[];
        }
        return [];
    } catch (error) {
        console.error(`Error fetching anime IDs for mood ${moodId}:`, error);
        throw new Error(`Failed to fetch anime for mood: ${(error as Error).message}`);
    }
}

/**
 * Gets all mood IDs an anime is tagged with.
 * @param animeMalId - The MAL ID of the anime.
 * @returns A promise that resolves to an array of mood IDs.
 */
export async function getMoodsForAnime(animeMalId: number): Promise<string[]> {
    if (!db) {
        console.error("Firestore instance (db) is not available in getMoodsForAnime.");
        throw new Error("Database connection not established.");
    }
    if (!animeMalId) {
        console.warn("[getMoodsForAnime] animeMalId is undefined. Returning empty array.");
        return [];
    }
    const moodsColRef = collection(db, 'moodPlaylists');
    const q = query(moodsColRef, where('animeIds', 'array-contains', animeMalId));
    try {
        const querySnapshot = await getDocs(q);
        const moodIds: string[] = [];
        querySnapshot.forEach((doc) => {
            moodIds.push(doc.id);
        });
        return moodIds;
    } catch (error) {
        console.error(`Error fetching moods for anime ${animeMalId}:`, error);
        throw new Error(`Failed to fetch moods for anime: ${(error as Error).message}`);
    }
}

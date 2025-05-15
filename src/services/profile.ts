// src/services/profile.ts

import { db } from '@/lib/firebase'; // Assuming db is initialized in firebase.ts
import {
    collection,
    doc,
    setDoc,
    getDoc,
    updateDoc,
    serverTimestamp,
    Timestamp,
    arrayUnion,
    arrayRemove,
    writeBatch,
    FirebaseError // Import FirebaseError
} from 'firebase/firestore';

// --- Interfaces ---
export interface UserListItemData {
    id: number; // MAL ID
    type: 'anime' | 'manga';
    userStatus: 'Watching' | 'Reading' | 'Completed' | 'On-Hold' | 'Dropped' | 'Plan to Watch' | 'Plan to Read' | 'Favorited'; // Added 'Favorited'
    userScore?: number | null; // User's score for the item (0-10)
    userProgress?: string | null; // e.g., "12/24 episodes" or "50/100 chapters"
}

export interface UserProfileData {
    uid: string;
    email: string;
    username: string;
    avatarUrl: string | null;
    bannerUrl: string | null;
    bio: string;
    status: string; // Custom user status message
    level: number;
    xp: number;
    xpToNextLevel: number;
    badges: string[];
    stats: {
        animeWatched: number;
        episodesWatched: number;
        mangaRead: number;
        chaptersRead: number;
        uploads: number; // For indie manga
        commentsMade: number;
        // Add more stats as needed
    };
    watchlistIds: UserListItemData[]; // Array of MAL IDs for anime
    readlistIds: UserListItemData[];  // Array of MAL IDs for manga
    favoriteIds: UserListItemData[]; // Combined list of favorite anime/manga
    genrePreferences: Record<string, number>; // e.g., { "Action": 10, "Comedy": 5 }
    joinedCommunities: string[]; // Array of community IDs
    createdAt: Date | Timestamp;
    updatedAt: Date | Timestamp;
}

// Default data for a new user profile
export const defaultUserProfileData: Omit<UserProfileData, 'uid' | 'email' | 'createdAt' | 'updatedAt' | 'username' | 'avatarUrl'> = {
    bannerUrl: null,
    bio: '',
    status: 'Exploring Shinra-Ani!',
    level: 1,
    xp: 0,
    xpToNextLevel: 100,
    badges: ['Newbie'],
    stats: {
        animeWatched: 0,
        episodesWatched: 0,
        mangaRead: 0,
        chaptersRead: 0,
        uploads: 0,
        commentsMade: 0,
    },
    watchlistIds: [],
    readlistIds: [],
    favoriteIds: [],
    genrePreferences: {},
    joinedCommunities: [],
};


/**
 * Creates a new user profile document in Firestore or updates it if it exists.
 * This function is called on user signup or first login.
 * @param uid - The user's Firebase Authentication UID.
 * @param initialData - Initial data like email, displayName, photoURL.
 * @returns The user's profile data.
 */
export async function createUserProfileDocument(
    uid: string,
    initialData: Partial<Pick<UserProfileData, 'email' | 'username' | 'avatarUrl'>>
): Promise<UserProfileData> {
    const userDocRef = doc(db, 'users', uid);
    console.log(`[createUserProfileDocument] Checking for profile for UID: ${uid}`);
    try {
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
            console.log(`[createUserProfileDocument] Profile already exists for UID: ${uid}. Updating last login/details.`);
            const existingData = docSnap.data();
            const updatePayload: Partial<UserProfileData> = {
                updatedAt: serverTimestamp() as Timestamp,
                email: initialData.email || existingData.email, // Prefer new initial data if available
                username: initialData.username || existingData.username || `User-${uid.substring(0,5)}`,
            };
            // Only update avatarUrl if explicitly provided (even if it's null to clear it)
            if (initialData.avatarUrl !== undefined) {
                updatePayload.avatarUrl = initialData.avatarUrl;
            } else if (existingData.avatarUrl === undefined) { // If existing doesn't have it, and new doesn't provide it, set to null
                updatePayload.avatarUrl = null;
            }


            await updateDoc(userDocRef, updatePayload as any); // Cast to any to handle serverTimestamp

            const mergedData = {
                uid,
                ...defaultUserProfileData,
                ...existingData,
                ...updatePayload, // Apply new email/username/avatar if they changed
                createdAt: (existingData.createdAt as Timestamp)?.toDate() || new Date(),
                updatedAt: new Date(), // Reflect update time for immediate use
            } as UserProfileData;
            // Clean up any undefined fields that might have come from partial initialData
            Object.keys(mergedData).forEach(key => {
                if (mergedData[key as keyof UserProfileData] === undefined) {
                    delete mergedData[key as keyof UserProfileData];
                }
            });
            return mergedData;

        } else {
            console.log(`[createUserProfileDocument] No profile found for UID: ${uid}. Creating new profile.`);
            const newProfileData: UserProfileData = {
                uid,
                email: initialData.email || '',
                username: initialData.username || initialData.email?.split('@')[0] || `User-${uid.substring(0,5)}`,
                avatarUrl: initialData.avatarUrl === undefined ? null : initialData.avatarUrl,
                ...defaultUserProfileData,
                createdAt: serverTimestamp() as Timestamp,
                updatedAt: serverTimestamp() as Timestamp,
            };
            await setDoc(userDocRef, newProfileData);
            console.log(`[createUserProfileDocument] New profile created for UID: ${uid}`);
            return {
                ...newProfileData,
                createdAt: new Date(), // Convert to Date for immediate use
                updatedAt: new Date(),
            };
        }
    } catch (error) {
        const firebaseError = error as FirebaseError;
        console.error("[createUserProfileDocument] Error creating/updating user profile:", firebaseError.code, firebaseError.message);
        if (firebaseError.code === 'unavailable') {
            throw new Error("Failed to create/update profile: The app is offline or cannot connect to the database. Please check your internet connection.");
        } else if (firebaseError.code === 'permission-denied') {
            throw new Error("Failed to create/update profile: Permission denied. Please check Firestore security rules.");
        }
        throw new Error("Failed to create or update user profile.");
    }
}


/**
 * Fetches a user's profile document from Firestore.
 * @param uid - The user's Firebase Authentication UID.
 * @returns The user's profile data, or null if not found.
 */
export async function getUserProfileDocument(uid: string): Promise<UserProfileData | null> {
  if (!uid) {
    console.error("[getUserProfileDocument] UID is undefined or null.");
    return null;
  }
  const userDocRef = doc(db, 'users', uid);
  console.log(`[getUserProfileDocument] Fetching profile for UID: ${uid}`);
  try {
    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      console.log(`[getUserProfileDocument] Profile data found for UID ${uid}.`);
      const createdAt = (data.createdAt as Timestamp)?.toDate() || new Date();
      const updatedAt = (data.updatedAt as Timestamp)?.toDate() || new Date();

      // Ensure all fields from UserProfileData are present, falling back to defaults
      const profile: UserProfileData = {
        uid,
        email: data.email || '',
        username: data.username || `User-${uid.substring(0,5)}`,
        avatarUrl: data.avatarUrl === undefined ? null : data.avatarUrl,
        bannerUrl: data.bannerUrl === undefined ? null : data.bannerUrl,
        bio: data.bio || '',
        status: data.status || defaultUserProfileData.status,
        level: data.level || defaultUserProfileData.level,
        xp: data.xp || defaultUserProfileData.xp,
        xpToNextLevel: data.xpToNextLevel || defaultUserProfileData.xpToNextLevel,
        badges: data.badges || defaultUserProfileData.badges,
        stats: { ...defaultUserProfileData.stats, ...(data.stats || {}) },
        watchlistIds: data.watchlistIds || defaultUserProfileData.watchlistIds,
        readlistIds: data.readlistIds || defaultUserProfileData.readlistIds,
        favoriteIds: data.favoriteIds || defaultUserProfileData.favoriteIds,
        genrePreferences: data.genrePreferences || defaultUserProfileData.genrePreferences,
        joinedCommunities: data.joinedCommunities || defaultUserProfileData.joinedCommunities,
        createdAt,
        updatedAt,
      };
      return profile;
    } else {
      console.warn(`[getUserProfileDocument] No profile document found for UID: ${uid}. This is expected for new users.`);
      return null; // Return null if document doesn't exist
    }
  } catch (error) {
    const firebaseError = error as FirebaseError;
    console.error("[getUserProfileDocument] Error fetching user profile:", firebaseError.code, firebaseError.message);
    if (firebaseError.code === 'unavailable') {
        throw new Error("Failed to fetch profile: The app is offline or cannot connect to the database. Please check your internet connection.");
    } else if (firebaseError.code === 'permission-denied') {
        throw new Error("Failed to fetch profile: Permission denied. Please check Firestore security rules.");
    }
    throw new Error("Failed to fetch user profile.");
  }
}

/**
 * Updates a user's profile document in Firestore.
 * @param uid - The user's Firebase Authentication UID.
 * @param data - An object containing the fields to update.
 */
export async function updateUserProfileDocument(uid: string, data: Partial<UserProfileData>): Promise<void> {
  const userDocRef = doc(db, 'users', uid);
  console.log(`[updateUserProfileDocument] Updating profile for UID: ${uid} with data:`, data);
  try {
    await updateDoc(userDocRef, {
      ...data,
      updatedAt: serverTimestamp(), // Always update the timestamp
    });
    console.log(`[updateUserProfileDocument] Profile updated successfully for UID: ${uid}`);
  } catch (error) {
    const firebaseError = error as FirebaseError;
    console.error("[updateUserProfileDocument] Error updating user profile:", firebaseError.code, firebaseError.message);
    if (firebaseError.code === 'unavailable') {
        throw new Error("Failed to update profile: The app is offline or cannot connect to the database. Please check your internet connection.");
    } else if (firebaseError.code === 'permission-denied') {
        throw new Error("Failed to update profile: Permission denied. Please check Firestore security rules.");
    }
    throw new Error("Failed to update user profile.");
  }
}

// --- Functions to manage watchlist, readlist, favorites ---

/**
 * Adds an item to a user's list (watchlist, readlist, or favorites).
 * @param uid User's UID.
 * @param listName The name of the list ('watchlistIds', 'readlistIds', 'favoriteIds').
 * @param item The item to add.
 */
export async function addItemToList(
    uid: string,
    listName: 'watchlistIds' | 'readlistIds' | 'favoriteIds',
    item: UserListItemData
): Promise<void> {
    const userDocRef = doc(db, 'users', uid);
    try {
        await updateDoc(userDocRef, {
            [listName]: arrayUnion(item), // arrayUnion adds if not present
            updatedAt: serverTimestamp()
        });
        console.log(`Item ${item.id} added to ${listName} for user ${uid}`);
    } catch (error) {
        const firebaseError = error as FirebaseError;
        console.error(`Error adding item to ${listName}:`, firebaseError.code, firebaseError.message);
        if (firebaseError.code === 'unavailable') {
            throw new Error(`Failed to add item: App offline or cannot connect.`);
        } else if (firebaseError.code === 'permission-denied') {
            throw new Error(`Failed to add item: Permission denied.`);
        }
        throw new Error(`Failed to add item to ${listName}.`);
    }
}

/**
 * Removes an item from a user's list.
 * @param uid User's UID.
 * @param listName The name of the list.
 * @param itemId The MAL ID of the item to remove.
 * @param itemType The type of the item ('anime' | 'manga') to ensure correct removal.
 */
export async function removeItemFromList(
    uid: string,
    listName: 'watchlistIds' | 'readlistIds' | 'favoriteIds',
    itemId: number,
    itemType: 'anime' | 'manga'
): Promise<void> {
    const userDocRef = doc(db, 'users', uid);
    try {
        // Firestore's arrayRemove requires the exact object to remove.
        // So, we need to construct it or fetch the current list and filter.
        // For simplicity and to ensure we remove the correct item if duplicates exist with different user data,
        // it's often better to fetch, filter, and then set the array.
        const userProfile = await getUserProfileDocument(uid);
        if (userProfile && userProfile[listName]) {
            const updatedList = userProfile[listName].filter(item => !(item.id === itemId && item.type === itemType));
            await updateDoc(userDocRef, {
                [listName]: updatedList,
                updatedAt: serverTimestamp()
            });
            console.log(`Item ${itemId} (type: ${itemType}) removed from ${listName} for user ${uid}`);
        }
    } catch (error) {
        const firebaseError = error as FirebaseError;
        console.error(`Error removing item from ${listName}:`, firebaseError.code, firebaseError.message);
         if (firebaseError.code === 'unavailable') {
            throw new Error(`Failed to remove item: App offline or cannot connect.`);
        } else if (firebaseError.code === 'permission-denied') {
            throw new Error(`Failed to remove item: Permission denied.`);
        }
        throw new Error(`Failed to remove item from ${listName}.`);
    }
}

/**
 * Updates an existing item in a user's list (e.g., userScore, userProgress, userStatus).
 * @param uid User's UID.
 * @param listName The name of the list.
 * @param updatedItem The item with updated details.
 */
export async function updateItemInList(
    uid: string,
    listName: 'watchlistIds' | 'readlistIds' | 'favoriteIds',
    updatedItem: UserListItemData
): Promise<void> {
    const userDocRef = doc(db, 'users', uid);
    try {
        const userProfile = await getUserProfileDocument(uid);
        if (userProfile && userProfile[listName]) {
            const list = userProfile[listName];
            const itemIndex = list.findIndex(item => item.id === updatedItem.id && item.type === updatedItem.type);
            if (itemIndex > -1) {
                list[itemIndex] = updatedItem; // Update the item in the array
                await updateDoc(userDocRef, { 
                    [listName]: list,
                    updatedAt: serverTimestamp()
                });
                console.log(`Item ${updatedItem.id} updated in ${listName} for user ${uid}`);
            } else {
                // If item not found, add it instead (optional behavior, or throw error)
                console.warn(`Item ${updatedItem.id} (type: ${updatedItem.type}) not found in ${listName} for user ${uid} to update. Adding it.`);
                await addItemToList(uid, listName, updatedItem);
            }
        } else {
             // If the list doesn't exist, create it with the item
             console.warn(`List ${listName} does not exist for user ${uid}. Creating list and adding item.`);
             await updateDoc(userDocRef, { 
                [listName]: [updatedItem],
                updatedAt: serverTimestamp()
            });
        }
    } catch (error) {
        const firebaseError = error as FirebaseError;
        console.error(`Error updating item in ${listName}:`, firebaseError.code, firebaseError.message);
        if (firebaseError.code === 'unavailable') {
            throw new Error(`Failed to update item: App offline or cannot connect.`);
        } else if (firebaseError.code === 'permission-denied') {
            throw new Error(`Failed to update item: Permission denied.`);
        }
        throw new Error(`Failed to update item in ${listName}.`);
    }
}

/**
 * Retrieves a specific list (watchlist, readlist, favorites) for a user.
 * @param uid User's UID.
 * @param listName The name of the list.
 * @returns An array of UserListItemData or an empty array.
 */
export async function getUserList(
    uid: string,
    listName: 'watchlistIds' | 'readlistIds' | 'favoriteIds'
): Promise<UserListItemData[]> {
    try {
        const userProfile = await getUserProfileDocument(uid);
        return userProfile && userProfile[listName] ? userProfile[listName] : [];
    } catch (error) {
        console.error(`Error fetching ${listName} for user ${uid}:`, error);
        return []; // Return empty list on error
    }
}

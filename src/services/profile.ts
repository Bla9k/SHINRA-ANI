
// src/services/profile.ts
'use client';

import { db } from '@/lib/firebase';
import {
    doc,
    setDoc,
    getDoc,
    updateDoc,
    serverTimestamp,
    Timestamp,
    FirebaseError
} from 'firebase/firestore';

// --- Interfaces ---
export interface UserListItemData {
    id: number; // MAL ID
    type: 'anime' | 'manga';
    userStatus: 'Watching' | 'Reading' | 'Completed' | 'On-Hold' | 'Dropped' | 'Plan to Watch' | 'Plan to Read' | 'Favorited';
    userScore?: number | null;
    userProgress?: string | null;
}

export interface UserProfileData {
    uid: string;
    email: string;
    username: string;
    avatarUrl: string | null;
    bannerUrl: string | null;
    bio: string;
    status: string;
    level: number;
    xp: number;
    xpToNextLevel: number;
    badges: string[];
    stats: {
        animeWatched: number;
        episodesWatched: number;
        mangaRead: number;
        chaptersRead: number;
        uploads: number;
        commentsMade: number;
    };
    watchlistIds: UserListItemData[];
    readlistIds: UserListItemData[];
    favoriteIds: UserListItemData[];
    genrePreferences: Record<string, number>; // Genre ID -> interaction count/score
    joinedCommunities: string[];
    subscriptionTier: 'spark' | 'ignition' | 'hellfire' | 'burstdrive' | null; // Added subscription tier
    createdAt: Date | Timestamp;
    updatedAt: Date | Timestamp;
}

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
    subscriptionTier: null, // Default to null
};

const MAX_RETRIES = 1;
const RETRY_DELAY_MS = 2000;

async function executeWithRetry<T>(action: () => Promise<T>, operationName: string): Promise<T> {
    let retries = 0;
    while (true) {
        try {
            return await action();
        } catch (error) {
            const firebaseError = error as FirebaseError;
            if (firebaseError.code === 'unavailable' && retries < MAX_RETRIES) {
                retries++;
                console.warn(`[${operationName}] Firebase unavailable (attempt ${retries}/${MAX_RETRIES}). Retrying in ${RETRY_DELAY_MS / 1000}s...`);
                await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
            } else {
                console.error(`[${operationName}] Firebase error after ${retries} retries:`, firebaseError.code, firebaseError.message);
                if (firebaseError.code === 'unavailable') {
                    throw new Error(`Failed to ${operationName.toLowerCase()}: The app is offline or cannot connect. Please check your internet connection.`);
                } else if (firebaseError.code === 'permission-denied') {
                    throw new Error(`Failed to ${operationName.toLowerCase()}: Permission denied. Check Firestore rules.`);
                }
                throw new Error(`Failed to ${operationName.toLowerCase()}: ${firebaseError.message}`);
            }
        }
    }
}


export async function createUserProfileDocument(
    uid: string,
    initialData: Partial<Pick<UserProfileData, 'email' | 'username' | 'avatarUrl'>>
): Promise<UserProfileData> {
    return executeWithRetry(async () => {
        const userDocRef = doc(db, 'users', uid);
        console.log(`[createUserProfileDocument] Attempting to create/update profile for UID: ${uid}`);
        const docSnap = await getDoc(userDocRef);
        const now = serverTimestamp();

        if (docSnap.exists()) {
            console.log(`[createUserProfileDocument] Profile for UID: ${uid} already exists. Ensuring core details are up-to-date.`);
            const existingData = docSnap.data() as UserProfileData;
            const updatePayload: Partial<UserProfileData> = {
                updatedAt: now as Timestamp, // Firestore server timestamp
                email: initialData.email || existingData.email || '',
                username: initialData.username || existingData.username || `User-${uid.substring(0, 5)}`,
                avatarUrl: initialData.avatarUrl !== undefined ? initialData.avatarUrl : (existingData.avatarUrl !== undefined ? existingData.avatarUrl : null),
                // Ensure subscriptionTier is not accidentally overwritten if already set
                subscriptionTier: existingData.subscriptionTier || null,
            };
            await updateDoc(userDocRef, updatePayload as any); // Use any for serverTimestamp compatibility
            const updatedData = { ...existingData, ...updatePayload, uid };
            updatedData.createdAt = (updatedData.createdAt instanceof Timestamp ? updatedData.createdAt.toDate() : new Date(updatedData.createdAt as any)) || new Date();
            updatedData.updatedAt = new Date(); // Use current date for immediate feedback
            return updatedData;
        } else {
            console.log(`[createUserProfileDocument] No profile found for UID: ${uid}. Creating new profile.`);
            const newProfileData: UserProfileData = {
                uid,
                email: initialData.email || '',
                username: initialData.username || initialData.email?.split('@')[0] || `User-${uid.substring(0, 5)}`,
                avatarUrl: initialData.avatarUrl === undefined ? null : initialData.avatarUrl,
                ...defaultUserProfileData, // This will set subscriptionTier to null
                createdAt: now as Timestamp, // Firestore server timestamp
                updatedAt: now as Timestamp, // Firestore server timestamp
            };
            await setDoc(userDocRef, newProfileData);
            console.log(`[createUserProfileDocument] New profile created for UID: ${uid}`);
            return {
                ...newProfileData,
                createdAt: new Date(), // For client-side immediate use
                updatedAt: new Date(), // For client-side immediate use
            };
        }
    }, "Create/Update User Profile");
}

export async function getUserProfileDocument(uid: string): Promise<UserProfileData | null> {
    if (!uid) {
        console.error("[getUserProfileDocument] UID is undefined or null.");
        throw new Error("User ID is required to fetch profile.");
    }
    return executeWithRetry(async () => {
        const userDocRef = doc(db, 'users', uid);
        console.log(`[getUserProfileDocument] Fetching profile for UID: ${uid}`);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            console.log(`[getUserProfileDocument] Profile data found for UID ${uid}.`);
            const createdAt = (data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt) || new Date();
            const updatedAt = (data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data.updatedAt) || new Date();

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
                subscriptionTier: data.subscriptionTier || null, // Ensure subscriptionTier is loaded
                createdAt,
                updatedAt,
            };
            return profile;
        } else {
            console.warn(`[getUserProfileDocument] No profile document found for UID: ${uid}.`);
            return null;
        }
    }, "Get User Profile");
}

export async function updateUserProfileDocument(uid: string, data: Partial<UserProfileData>): Promise<void> {
     return executeWithRetry(async () => {
        const userDocRef = doc(db, 'users', uid);
        console.log(`[updateUserProfileDocument] Updating profile for UID: ${uid} with data:`, data);
        await updateDoc(userDocRef, {
            ...data,
            updatedAt: serverTimestamp(),
        });
        console.log(`[updateUserProfileDocument] Profile updated successfully for UID: ${uid}`);
    }, "Update User Profile");
}

// New function to update subscription tier
export async function updateUserSubscriptionTier(uid: string, tier: 'spark' | 'ignition' | 'hellfire' | 'burstdrive'): Promise<void> {
    if (!uid) {
        console.error("[updateUserSubscriptionTier] UID is undefined or null.");
        throw new Error("User ID is required to update subscription tier.");
    }
    return executeWithRetry(async () => {
        const userDocRef = doc(db, 'users', uid);
        console.log(`[updateUserSubscriptionTier] Updating subscription tier for UID: ${uid} to ${tier}`);
        await updateDoc(userDocRef, {
            subscriptionTier: tier,
            updatedAt: serverTimestamp(),
        });
        console.log(`[updateUserSubscriptionTier] Subscription tier updated successfully for UID: ${uid} to ${tier}`);
    }, "Update User Subscription Tier");
}

// ... (addItemToList, removeItemFromList, updateItemInList, getUserList remain the same)
export async function addItemToList(
    uid: string,
    listName: 'watchlistIds' | 'readlistIds' | 'favoriteIds',
    item: UserListItemData
): Promise<void> {
    const userDocRef = doc(db, 'users', uid);
    try {
        await updateDoc(userDocRef, {
            [listName]: arrayUnion(item), // arrayUnion is not available in Firebase Lite
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
        throw new Error(`Failed to add item to ${listName}: ${firebaseError.message}`);
    }
}

export async function removeItemFromList(
    uid: string,
    listName: 'watchlistIds' | 'readlistIds' | 'favoriteIds',
    itemId: number,
    itemType: 'anime' | 'manga'
): Promise<void> {
    const userDocRef = doc(db, 'users', uid);
    try {
        const userProfile = await getUserProfileDocument(uid);
        if (userProfile && userProfile[listName]) {
            const updatedList = userProfile[listName].filter(item => !(item.id === itemId && item.type === itemType));
            await updateDoc(userDocRef, {
                [listName]: updatedList, // arrayRemove is not available in Firebase Lite
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
        throw new Error(`Failed to remove item from ${listName}: ${firebaseError.message}`);
    }
}

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
                list[itemIndex] = updatedItem;
                await updateDoc(userDocRef, {
                    [listName]: list,
                    updatedAt: serverTimestamp()
                });
                console.log(`Item ${updatedItem.id} updated in ${listName} for user ${uid}`);
            } else {
                console.warn(`Item ${updatedItem.id} (type: ${updatedItem.type}) not found in ${listName} for user ${uid} to update. Adding it.`);
                // To add, we need to use arrayUnion or reconstruct the array if arrayUnion is not available/desired
                // For simplicity here, assuming it should exist or we could call addItemToList
                await addItemToList(uid, listName, updatedItem); // Or handle differently
            }
        } else {
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
        throw new Error(`Failed to update item in ${listName}: ${firebaseError.message}`);
    }
}

export async function getUserList(
    uid: string,
    listName: 'watchlistIds' | 'readlistIds' | 'favoriteIds'
): Promise<UserListItemData[]> {
    try {
        const userProfile = await getUserProfileDocument(uid);
        return userProfile && userProfile[listName] ? userProfile[listName] : [];
    } catch (error) {
        const firebaseError = error as FirebaseError;
        console.error(`Error fetching ${listName} for user ${uid}:`, firebaseError.message);
        return [];
    }
}

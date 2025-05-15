
// src/services/profile.ts
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
    subscriptionTier: 'spark' | 'ignition' | 'hellfire' | 'burstdrive' | null;
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
    subscriptionTier: null,
};

const MAX_RETRIES = 2; // Increased max retries
const RETRY_DELAY_MS = 2500; // Increased retry delay

async function executeWithRetry<T>(action: () => Promise<T>, operationName: string): Promise<T> {
    let retries = 0;
    while (true) {
        try {
            return await action();
        } catch (error) {
            const firebaseError = error as FirebaseError;
            if (firebaseError.code === 'unavailable' && retries < MAX_RETRIES) {
                retries++;
                console.warn(`[${operationName}] Firebase unavailable (attempt ${retries}/${MAX_RETRIES}). Retrying in ${RETRY_DELAY_MS / 1000}s... Error: ${firebaseError.message}`);
                await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * retries)); // Exponential backoff might be too much here, just increasing delay
            } else {
                console.error(`[${operationName}] Firebase error after ${retries} retries:`, firebaseError.code, firebaseError.message);
                if (firebaseError.code === 'unavailable') {
                    throw new Error(`Failed to ${operationName.toLowerCase()}: The app is offline or cannot connect. Please check your internet connection and Firebase setup.`);
                } else if (firebaseError.code === 'permission-denied') {
                    throw new Error(`Failed to ${operationName.toLowerCase()}: Permission denied. Check Firestore rules for the '${operationName.includes("User Profile") ? "users" : "unknown"}' collection.`);
                }
                throw new Error(`Failed to ${operationName.toLowerCase()}: ${firebaseError.message} (Code: ${firebaseError.code})`);
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
        const docSnap = await getDoc(userDocRef); // This getDoc can also fail with "unavailable"
        const now = serverTimestamp(); // Get serverTimestamp once

        let finalProfileData: UserProfileData;

        if (docSnap.exists()) {
            console.log(`[createUserProfileDocument] Profile for UID: ${uid} already exists. Ensuring core details are up-to-date.`);
            const existingData = docSnap.data() as UserProfileData;
            const updatePayload: Partial<UserProfileData> = {
                updatedAt: now as Timestamp, // Firestore server timestamp
                email: initialData.email || existingData.email || '', // Prioritize new data from auth provider
                // Only update username from auth provider if current Firestore username is default or empty
                username: initialData.username && (existingData.username === `User-${uid.substring(0,5)}` || !existingData.username)
                    ? initialData.username
                    : existingData.username || initialData.username || `User-${uid.substring(0,5)}`,
                // Only update avatar from auth provider if current Firestore avatar is null or empty
                avatarUrl: initialData.avatarUrl !== undefined && (existingData.avatarUrl === null || existingData.avatarUrl === '')
                    ? initialData.avatarUrl
                    : existingData.avatarUrl !== undefined ? existingData.avatarUrl : null,
                subscriptionTier: existingData.subscriptionTier || null, // Preserve existing tier
            };
            await updateDoc(userDocRef, updatePayload as any); // Use any for serverTimestamp compatibility
            finalProfileData = {
                ...existingData, // Start with existing data
                ...updatePayload, // Override with updates
                uid,
                createdAt: (existingData.createdAt instanceof Timestamp ? existingData.createdAt.toDate() : new Date(existingData.createdAt as any)) || new Date(), // Ensure createdAt is a Date
                updatedAt: new Date(), // For immediate client-side use
            };
        } else {
            console.log(`[createUserProfileDocument] No profile found for UID: ${uid}. Creating new profile.`);
            const newProfileData = { // Explicitly type to ensure all fields from default are considered
                uid,
                email: initialData.email || '',
                username: initialData.username || initialData.email?.split('@')[0] || `User-${uid.substring(0, 5)}`,
                avatarUrl: initialData.avatarUrl === undefined ? null : initialData.avatarUrl,
                ...defaultUserProfileData, // Spread defaults
                createdAt: now as Timestamp, // Firestore server timestamp
                updatedAt: now as Timestamp, // Firestore server timestamp
            };
            await setDoc(userDocRef, newProfileData as any); // Use any for serverTimestamp compatibility
            console.log(`[createUserProfileDocument] New profile created for UID: ${uid}`);
            finalProfileData = {
                ...newProfileData,
                createdAt: new Date(), // For client-side immediate use
                updatedAt: new Date(), // For client-side immediate use
            };
        }
        return finalProfileData;
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
            // Convert Firestore Timestamps to JS Date objects for client-side consistency
            const createdAtDate = data.createdAt instanceof Timestamp ? data.createdAt.toDate() : (data.createdAt ? new Date(data.createdAt) : new Date());
            const updatedAtDate = data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : (data.updatedAt ? new Date(data.updatedAt) : new Date());

            const profile: UserProfileData = {
                uid,
                email: data.email || '',
                username: data.username || `User-${uid.substring(0,5)}`,
                avatarUrl: data.avatarUrl === undefined ? null : data.avatarUrl, // Handle undefined
                bannerUrl: data.bannerUrl === undefined ? null : data.bannerUrl, // Handle undefined
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
                subscriptionTier: data.subscriptionTier || null,
                createdAt: createdAtDate,
                updatedAt: updatedAtDate,
            };
            return profile;
        } else {
            console.warn(`[getUserProfileDocument] No profile document found for UID: ${uid}. Returning null.`);
            return null; // Explicitly return null if not found, to trigger creation logic
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

export async function addItemToList(
    uid: string,
    listName: 'watchlistIds' | 'readlistIds' | 'favoriteIds',
    item: UserListItemData
): Promise<void> {
    return executeWithRetry(async () => {
        const userDocRef = doc(db, 'users', uid);
        // Firestore Lite does not support arrayUnion. Fetch, modify, then set.
        const userProfile = await getUserProfileDocument(uid);
        const currentList = userProfile?.[listName] || [];
        // Avoid duplicates
        if (!currentList.some(existingItem => existingItem.id === item.id && existingItem.type === item.type)) {
            const updatedList = [...currentList, item];
            await updateDoc(userDocRef, {
                [listName]: updatedList,
                updatedAt: serverTimestamp()
            });
            console.log(`Item ${item.id} added to ${listName} for user ${uid}`);
        } else {
            console.log(`Item ${item.id} already in ${listName} for user ${uid}`);
        }
    }, `Add item to ${listName}`);
}

export async function removeItemFromList(
    uid: string,
    listName: 'watchlistIds' | 'readlistIds' | 'favoriteIds',
    itemId: number,
    itemType: 'anime' | 'manga'
): Promise<void> {
    return executeWithRetry(async () => {
        const userDocRef = doc(db, 'users', uid);
        const userProfile = await getUserProfileDocument(uid);
        if (userProfile && userProfile[listName]) {
            const updatedList = userProfile[listName].filter(item => !(item.id === itemId && item.type === itemType));
            await updateDoc(userDocRef, {
                [listName]: updatedList,
                updatedAt: serverTimestamp()
            });
            console.log(`Item ${itemId} (type: ${itemType}) removed from ${listName} for user ${uid}`);
        }
    }, `Remove item from ${listName}`);
}

export async function updateItemInList(
    uid: string,
    listName: 'watchlistIds' | 'readlistIds' | 'favoriteIds',
    updatedItem: UserListItemData
): Promise<void> {
     return executeWithRetry(async () => {
        const userDocRef = doc(db, 'users', uid);
        const userProfile = await getUserProfileDocument(uid);
        if (userProfile && userProfile[listName]) {
            let list = userProfile[listName];
            const itemIndex = list.findIndex(item => item.id === updatedItem.id && item.type === updatedItem.type);
            if (itemIndex > -1) {
                list[itemIndex] = updatedItem;
            } else {
                // If item not found for update, add it instead.
                console.warn(`Item ${updatedItem.id} (type: ${updatedItem.type}) not found in ${listName} for user ${uid} to update. Adding it.`);
                list = [...list, updatedItem];
            }
            await updateDoc(userDocRef, {
                [listName]: list,
                updatedAt: serverTimestamp()
            });
            console.log(`Item ${updatedItem.id} processed in ${listName} for user ${uid}`);

        } else {
             console.warn(`List ${listName} does not exist for user ${uid}. Creating list and adding item.`);
             await updateDoc(userDocRef, {
                [listName]: [updatedItem],
                updatedAt: serverTimestamp()
            });
        }
    }, `Update item in ${listName}`);
}

export async function getUserList(
    uid: string,
    listName: 'watchlistIds' | 'readlistIds' | 'favoriteIds'
): Promise<UserListItemData[]> {
    return executeWithRetry(async () => {
        const userProfile = await getUserProfileDocument(uid);
        return userProfile?.[listName] || [];
    }, `Get user ${listName}`);
}

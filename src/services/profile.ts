
// src/services/profile.ts
import { db } from '@/lib/firebase';
import {
    doc,
    setDoc,
    getDoc,
    updateDoc,
    serverTimestamp,
    Timestamp,
    FirebaseError,
    arrayUnion // Keep for potential future list additions
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
    // Removed: coins: number;
    // Removed: ownedCollectibleIds: string[];
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

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 3000;

async function executeWithRetry<T>(action: () => Promise<T>, operationName: string): Promise<T> {
    let retries = 0;
    while (true) {
        try {
            return await action();
        } catch (error) {
            const firebaseError = error as FirebaseError;
            if (firebaseError.code === 'unavailable' && retries < MAX_RETRIES) {
                retries++;
                console.warn(`[${operationName}] Firebase unavailable (attempt ${retries}/${MAX_RETRIES}). Retrying in ${RETRY_DELAY_MS / 1000 * retries}s... Error: ${firebaseError.message}`);
                await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * retries));
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
        if (!db) throw new Error("Firestore (db) is not initialized in createUserProfileDocument.");
        const userDocRef = doc(db, 'users', uid);
        console.log(`[createUserProfileDocument] Attempting to create/update profile for UID: ${uid}`);
        const docSnap = await getDoc(userDocRef);
        const now = serverTimestamp();

        let finalProfileData: UserProfileData;

        if (docSnap.exists()) {
            console.log(`[createUserProfileDocument] Profile for UID: ${uid} already exists. Ensuring core details are up-to-date.`);
            const existingData = docSnap.data() as UserProfileData; // Assume data conforms to UserProfileData
            const updatePayload: Partial<UserProfileData> = {
                updatedAt: now as Timestamp,
                email: initialData.email || existingData.email || '',
                username: initialData.username && (existingData.username === `User-${uid.substring(0,5)}` || !existingData.username)
                    ? initialData.username
                    : existingData.username || initialData.username || `User-${uid.substring(0,5)}`,
                avatarUrl: initialData.avatarUrl !== undefined && (existingData.avatarUrl === null || existingData.avatarUrl === '')
                    ? initialData.avatarUrl
                    : existingData.avatarUrl !== undefined ? existingData.avatarUrl : null,
                subscriptionTier: existingData.subscriptionTier || null,
            };
            await updateDoc(userDocRef, updatePayload as any);
            finalProfileData = {
                ...existingData,
                ...updatePayload,
                uid,
                createdAt: (existingData.createdAt instanceof Timestamp ? existingData.createdAt.toDate() : new Date(existingData.createdAt as any)) || new Date(),
                updatedAt: new Date(),
            };
        } else {
            console.log(`[createUserProfileDocument] No profile found for UID: ${uid}. Creating new profile.`);
            const newProfileData: Omit<UserProfileData, 'createdAt' | 'updatedAt'> & { createdAt: Timestamp, updatedAt: Timestamp } = {
                uid,
                email: initialData.email || '',
                username: initialData.username || initialData.email?.split('@')[0] || `User-${uid.substring(0, 5)}`,
                avatarUrl: initialData.avatarUrl === undefined ? null : initialData.avatarUrl,
                bannerUrl: defaultUserProfileData.bannerUrl,
                bio: defaultUserProfileData.bio,
                status: defaultUserProfileData.status,
                level: defaultUserProfileData.level,
                xp: defaultUserProfileData.xp,
                xpToNextLevel: defaultUserProfileData.xpToNextLevel,
                badges: defaultUserProfileData.badges,
                stats: { ...defaultUserProfileData.stats },
                watchlistIds: [],
                readlistIds: [],
                favoriteIds: [],
                genrePreferences: {},
                joinedCommunities: [],
                subscriptionTier: null,
                createdAt: now as Timestamp,
                updatedAt: now as Timestamp,
            };
            await setDoc(userDocRef, newProfileData as any);
            console.log(`[createUserProfileDocument] New profile created for UID: ${uid}`);
            finalProfileData = {
                ...newProfileData,
                createdAt: new Date(),
                updatedAt: new Date(),
            } as UserProfileData;
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
        if (!db) throw new Error("Firestore (db) is not initialized in getUserProfileDocument.");
        const userDocRef = doc(db, 'users', uid);
        console.log(`[getUserProfileDocument] Fetching profile for UID: ${uid}`);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            console.log(`[getUserProfileDocument] Profile data found for UID ${uid}.`);
            const createdAtDate = data.createdAt instanceof Timestamp ? data.createdAt.toDate() : (data.createdAt ? new Date(data.createdAt) : new Date());
            const updatedAtDate = data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : (data.updatedAt ? new Date(data.updatedAt) : new Date());

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
                subscriptionTier: data.subscriptionTier || null,
                createdAt: createdAtDate,
                updatedAt: updatedAtDate,
            };
            return profile;
        } else {
            console.warn(`[getUserProfileDocument] No profile document found for UID: ${uid}. Returning null.`);
            return null;
        }
    }, "Get User Profile");
}

export async function updateUserProfileDocument(uid: string, data: Partial<UserProfileData>): Promise<void> {
     return executeWithRetry(async () => {
        if (!db) throw new Error("Firestore (db) is not initialized in updateUserProfileDocument.");
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
        if (!db) throw new Error("Firestore (db) is not initialized in updateUserSubscriptionTier.");
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
        if (!db) throw new Error(`Firestore (db) is not initialized in addItemToList (${listName}).`);
        const userDocRef = doc(db, 'users', uid);
        await updateDoc(userDocRef, {
            [listName]: arrayUnion(item),
            updatedAt: serverTimestamp()
        });
        console.log(`Item ${item.id} added to ${listName} for user ${uid}`);
    }, `Add item to ${listName}`);
}

export async function removeItemFromList(
    uid: string,
    listName: 'watchlistIds' | 'readlistIds' | 'favoriteIds',
    itemToRemove: UserListItemData // Pass the whole item to remove by exact match
): Promise<void> {
    return executeWithRetry(async () => {
        if (!db) throw new Error(`Firestore (db) is not initialized in removeItemFromList (${listName}).`);
        const userDocRef = doc(db, 'users', uid);
        // Firestore arrayRemove requires the exact object to remove.
        // This means the object passed must match one in the array precisely.
        // If only ID and type are used for matching, you need to fetch, filter, and set.
        // For simplicity and common use with arrayRemove, we assume the object matches.
        // If more complex removal logic is needed (e.g., by ID only), fetch-filter-set is required.
        const userProfile = await getUserProfileDocument(uid);
        if (userProfile && userProfile[listName]) {
            const updatedList = userProfile[listName].filter(
                item => !(item.id === itemToRemove.id && item.type === itemToRemove.type)
            );
            await updateDoc(userDocRef, {
                [listName]: updatedList,
                updatedAt: serverTimestamp()
            });
            console.log(`Item ${itemToRemove.id} (type: ${itemToRemove.type}) removed from ${listName} for user ${uid}`);
        }
    }, `Remove item from ${listName}`);
}


export async function updateItemInList(
    uid: string,
    listName: 'watchlistIds' | 'readlistIds' | 'favoriteIds',
    updatedItem: UserListItemData
): Promise<void> {
     return executeWithRetry(async () => {
        if (!db) throw new Error(`Firestore (db) is not initialized in updateItemInList (${listName}).`);
        const userDocRef = doc(db, 'users', uid);
        const userProfile = await getUserProfileDocument(uid);
        if (userProfile && userProfile[listName]) {
            let list = userProfile[listName];
            const itemIndex = list.findIndex(item => item.id === updatedItem.id && item.type === updatedItem.type);
            if (itemIndex > -1) {
                list[itemIndex] = updatedItem;
            } else {
                console.warn(`Item ${updatedItem.id} (type: ${updatedItem.type}) not found in ${listName} for user ${uid} to update. Adding it instead.`);
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
        if (!db) throw new Error(`Firestore (db) is not initialized in getUserList (${listName}).`);
        const userProfile = await getUserProfileDocument(uid);
        return userProfile?.[listName] || [];
    }, `Get user ${listName}`);
}

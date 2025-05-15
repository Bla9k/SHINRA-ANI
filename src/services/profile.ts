// src/services/profile.ts
'use client'; // Ensure this module can be used in client components

import { db } from '@/lib/firebase';
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
    FirebaseError
} from 'firebase/firestore';
import type { LucideIcon } from 'lucide-react';

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
    genrePreferences: Record<string, number>;
    joinedCommunities: string[];
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
};

export async function createUserProfileDocument(
    uid: string,
    initialData: Partial<Pick<UserProfileData, 'email' | 'username' | 'avatarUrl'>>
): Promise<UserProfileData> {
    const userDocRef = doc(db, 'users', uid);
    console.log(`[createUserProfileDocument] Attempting to create/update profile for UID: ${uid}`);
    try {
        const docSnap = await getDoc(userDocRef);
        const now = serverTimestamp(); // Use server timestamp for consistency

        if (docSnap.exists()) {
            console.log(`[createUserProfileDocument] Profile for UID: ${uid} already exists. Ensuring core details are up-to-date.`);
            const existingData = docSnap.data() as UserProfileData; // Assume data conforms to UserProfileData
            const updatePayload: Partial<UserProfileData> = {
                updatedAt: now as Timestamp,
                email: initialData.email || existingData.email || '',
                username: initialData.username || existingData.username || `User-${uid.substring(0,5)}`,
                // Only update avatar if provided, otherwise keep existing or default to null
                avatarUrl: initialData.avatarUrl !== undefined ? initialData.avatarUrl : (existingData.avatarUrl !== undefined ? existingData.avatarUrl : null),
            };
            await updateDoc(userDocRef, updatePayload as any); // Cast to any for serverTimestamp
            const updatedData = { ...existingData, ...updatePayload, uid };
            // Convert Timestamps to Dates for client-side usage
            updatedData.createdAt = (updatedData.createdAt as Timestamp)?.toDate() || new Date();
            updatedData.updatedAt = new Date(); // Use current date for immediate feedback
            return updatedData;
        } else {
            console.log(`[createUserProfileDocument] No profile found for UID: ${uid}. Creating new profile.`);
            const newProfileData: UserProfileData = {
                uid,
                email: initialData.email || '',
                username: initialData.username || initialData.email?.split('@')[0] || `User-${uid.substring(0,5)}`,
                avatarUrl: initialData.avatarUrl === undefined ? null : initialData.avatarUrl,
                ...defaultUserProfileData,
                createdAt: now as Timestamp,
                updatedAt: now as Timestamp,
            };
            await setDoc(userDocRef, newProfileData);
            console.log(`[createUserProfileDocument] New profile created for UID: ${uid}`);
            return {
                ...newProfileData,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
        }
    } catch (error) {
        const firebaseError = error as FirebaseError;
        console.error("[createUserProfileDocument] Error creating/updating user profile:", firebaseError.code, firebaseError.message, firebaseError.stack);
        if (firebaseError.code === 'unavailable') {
            throw new Error("Failed to create/update profile: The app appears to be offline or cannot connect to the database. Please check your internet connection.");
        } else if (firebaseError.code === 'permission-denied') {
            throw new Error("Failed to create/update profile: Permission denied. Please check Firestore security rules.");
        }
        throw new Error(`Failed to create or update user profile: ${firebaseError.message}`);
    }
}

export async function getUserProfileDocument(uid: string): Promise<UserProfileData | null> {
    if (!uid) {
        console.error("[getUserProfileDocument] UID is undefined or null.");
        throw new Error("User ID is required to fetch profile.");
    }
    const userDocRef = doc(db, 'users', uid);
    console.log(`[getUserProfileDocument] Fetching profile for UID: ${uid}`);
    try {
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
                createdAt,
                updatedAt,
            };
            return profile;
        } else {
            console.warn(`[getUserProfileDocument] No profile document found for UID: ${uid}. This is expected for new users if creation hasn't happened yet.`);
            return null; // Return null if document doesn't exist
        }
    } catch (error) {
        const firebaseError = error as FirebaseError;
        console.error("[getUserProfileDocument] Error fetching user profile:", firebaseError.code, firebaseError.message, firebaseError.stack);
        if (firebaseError.code === 'unavailable') {
            throw new Error("Failed to fetch profile: The app appears to be offline or cannot connect to the database. Please check your internet connection.");
        } else if (firebaseError.code === 'permission-denied') {
            throw new Error("Failed to fetch profile: Permission denied. Please check Firestore security rules.");
        }
        throw new Error(`Failed to fetch user profile: ${firebaseError.message}`);
    }
}

export async function updateUserProfileDocument(uid: string, data: Partial<UserProfileData>): Promise<void> {
    const userDocRef = doc(db, 'users', uid);
    console.log(`[updateUserProfileDocument] Updating profile for UID: ${uid} with data:`, data);
    try {
        await updateDoc(userDocRef, {
            ...data,
            updatedAt: serverTimestamp(),
        });
        console.log(`[updateUserProfileDocument] Profile updated successfully for UID: ${uid}`);
    } catch (error) {
        const firebaseError = error as FirebaseError;
        console.error("[updateUserProfileDocument] Error updating user profile:", firebaseError.code, firebaseError.message, firebaseError.stack);
        if (firebaseError.code === 'unavailable') {
            throw new Error("Failed to update profile: The app appears to be offline or cannot connect to the database. Please check your internet connection.");
        } else if (firebaseError.code === 'permission-denied') {
            throw new Error("Failed to update profile: Permission denied. Please check Firestore security rules.");
        }
        throw new Error(`Failed to update user profile: ${firebaseError.message}`);
    }
}

export async function addItemToList(
    uid: string,
    listName: 'watchlistIds' | 'readlistIds' | 'favoriteIds',
    item: UserListItemData
): Promise<void> {
    const userDocRef = doc(db, 'users', uid);
    try {
        await updateDoc(userDocRef, {
            [listName]: arrayUnion(item),
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
                await addItemToList(uid, listName, updatedItem);
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

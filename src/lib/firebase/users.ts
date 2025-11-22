import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    query,
    where,
    serverTimestamp,
    Timestamp,
} from 'firebase/firestore';
import { User } from 'firebase/auth';
import { db } from './index';

// User Profile Interface
export interface UserProfile {
    uid: string;
    email: string;
    displayName: string | null;
    role: 'admin' | 'technician' | 'viewer';
    phone?: string;
    firstName?: string;
    lastName?: string;
    isActive: boolean;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

// User Preferences Interface
export interface UserPreferences {
    userId: string;
    notifications: {
        email: boolean;
        push: boolean;
        sms: boolean;
        weekly: boolean;
    };
    theme?: 'light' | 'dark' | 'system';
    updatedAt?: Timestamp;
}

export const userService = {
    /**
     * Create or update user profile in Firestore
     * Called when user logs in or registers
     */
    async createOrUpdateUser(user: User): Promise<void> {
        try {
            const userRef = doc(db, 'users', user.uid);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
                // Update existing user
                await updateDoc(userRef, {
                    email: user.email,
                    displayName: user.displayName,
                    updatedAt: serverTimestamp(),
                });
            } else {
                // Create new user profile
                await setDoc(userRef, {
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName,
                    role: 'technician', // Default role
                    isActive: true,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp(),
                });

                // Create default preferences
                await this.createDefaultPreferences(user.uid);
            }
        } catch (error) {
            console.error('Error creating/updating user:', error);
            throw error;
        }
    },

    /**
     * Create default user preferences
     */
    async createDefaultPreferences(userId: string): Promise<void> {
        try {
            const prefsRef = doc(db, 'userPreferences', userId);
            await setDoc(prefsRef, {
                userId,
                notifications: {
                    email: true,
                    push: true,
                    sms: false,
                    weekly: true,
                },
                theme: 'system',
                updatedAt: serverTimestamp(),
            });
        } catch (error) {
            console.error('Error creating default preferences:', error);
            throw error;
        }
    },

    /**
     * Get user profile by ID
     */
    async getUserById(uid: string): Promise<UserProfile | null> {
        try {
            const userRef = doc(db, 'users', uid);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
                return userSnap.data() as UserProfile;
            }
            return null;
        } catch (error) {
            console.error('Error getting user by ID:', error);
            throw error;
        }
    },

    /**
     * Get all users
     */
    async getAllUsers(): Promise<UserProfile[]> {
        try {
            const usersSnapshot = await getDocs(collection(db, 'users'));
            return usersSnapshot.docs.map(doc => doc.data() as UserProfile);
        } catch (error) {
            console.error('Error getting all users:', error);
            throw error;
        }
    },

    /**
     * Get active users only
     */
    async getActiveUsers(): Promise<UserProfile[]> {
        try {
            const q = query(
                collection(db, 'users'),
                where('isActive', '==', true)
            );
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => doc.data() as UserProfile);
        } catch (error) {
            console.error('Error getting active users:', error);
            throw error;
        }
    },

    /**
     * Update user profile
     */
    async updateUserProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
        try {
            const userRef = doc(db, 'users', uid);
            await updateDoc(userRef, {
                ...data,
                updatedAt: serverTimestamp(),
            });
        } catch (error) {
            console.error('Error updating user profile:', error);
            throw error;
        }
    },

    /**
     * Get user preferences
     */
    async getUserPreferences(uid: string): Promise<UserPreferences | null> {
        try {
            const prefsRef = doc(db, 'userPreferences', uid);
            const prefsSnap = await getDoc(prefsRef);

            if (prefsSnap.exists()) {
                return prefsSnap.data() as UserPreferences;
            }
            return null;
        } catch (error) {
            console.error('Error getting user preferences:', error);
            throw error;
        }
    },

    /**
     * Update user preferences
     */
    async updateUserPreferences(
        uid: string,
        prefs: Partial<UserPreferences>
    ): Promise<void> {
        try {
            const prefsRef = doc(db, 'userPreferences', uid);
            await updateDoc(prefsRef, {
                ...prefs,
                updatedAt: serverTimestamp(),
            });
        } catch (error) {
            console.error('Error updating user preferences:', error);
            throw error;
        }
    },
};

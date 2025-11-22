import {
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    User,
    createUserWithEmailAndPassword,
    updatePassword,
    reauthenticateWithCredential,
    EmailAuthProvider,
} from 'firebase/auth';
import { auth } from './index';

// Sign in with email and password
export const loginWithEmail = async (email: string, password: string) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return { user: userCredential.user, error: null };
    } catch (error: any) {
        return { user: null, error: error.message };
    }
};

// Sign up new user
export const signUpWithEmail = async (email: string, password: string) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        return { user: userCredential.user, error: null };
    } catch (error: any) {
        return { user: null, error: error.message };
    }
};

// Sign out
export const logout = async () => {
    try {
        await signOut(auth);
        return { error: null };
    } catch (error: any) {
        return { error: error.message };
    }
};

// Get current user
export const getCurrentUser = (): User | null => {
    return auth.currentUser;
};

// Listen to auth state changes
export const onAuthChange = (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, callback);
};

// Update user password
export const updateUserPassword = async (currentPassword: string, newPassword: string) => {
    try {
        const user = auth.currentUser;
        
        if (!user || !user.email) {
            return { error: 'No user is currently signed in' };
        }

        // Reauthenticate user before password change
        const credential = EmailAuthProvider.credential(user.email, currentPassword);
        await reauthenticateWithCredential(user, credential);

        // Update password
        await updatePassword(user, newPassword);
        
        return { error: null };
    } catch (error: any) {
        // Handle specific error codes
        if (error.code === 'auth/wrong-password') {
            return { error: 'Current password is incorrect' };
        } else if (error.code === 'auth/weak-password') {
            return { error: 'New password is too weak' };
        } else if (error.code === 'auth/requires-recent-login') {
            return { error: 'Please log out and log in again before changing your password' };
        }
        return { error: error.message || 'Failed to update password' };
    }
};

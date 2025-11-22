import {
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    User,
    createUserWithEmailAndPassword,
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

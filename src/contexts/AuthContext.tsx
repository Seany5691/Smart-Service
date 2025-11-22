"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { onAuthChange } from '@/lib/firebase/auth';
import { userService } from '@/lib/firebase/users';

interface AuthContextType {
    user: User | null;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthChange(async (user) => {
            setUser(user);
            
            // Create or update user profile in Firestore when user logs in
            if (user) {
                try {
                    await userService.createOrUpdateUser(user);
                } catch (error) {
                    console.error('Failed to create/update user profile:', error);
                }
            }
            
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

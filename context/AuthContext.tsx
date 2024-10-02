import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '@/firebaseConfig';

const AuthContext = createContext<{
    isLoggedIn: boolean;
    setIsLoggedIn: (value: boolean) => void;
    userEmail: string | null;
    setUserEmail: (email: string | null) => void;
}>({ 
    isLoggedIn: false,
    setIsLoggedIn: () => {},
    userEmail: null,
    setUserEmail: () => {},
  });

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userEmail, setUserEmail] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            setIsLoggedIn(!!user);
            setUserEmail(user ? user.email : null);
        });

        return () => unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn, userEmail, setUserEmail }}>
  {children}
</AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
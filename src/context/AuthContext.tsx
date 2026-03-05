import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { auth } from '../firebase';
import { onAuthStateChanged, signInAnonymously, signOut, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Employee } from './EmployeeContext';

interface User {
  id: string;
  name: string;
  email?: string;
  role: 'admin' | 'employee' | 'superadmin';
  employeeId?: string; // For employees
  companyId?: string; // For admins
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  signInWithGoogle: () => Promise<void>;
  isFirebaseReady: boolean;
  impersonateCompany: (companyId: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('currentUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [isFirebaseReady, setIsFirebaseReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setIsFirebaseReady(true);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [user]);

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = async () => {
    setUser(null);
    await signOut(auth);
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;
      
      // If the email matches superadmin, log them in as superadmin
      if (firebaseUser.email === 'bilal.izhar@algorepublic.com') {
        const userData: User = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || 'Super Admin',
          email: firebaseUser.email || '',
          role: 'superadmin',
          avatar: firebaseUser.photoURL || undefined
        };

        try {
          // Create/Update user document in Firestore
          await setDoc(doc(db, 'users', firebaseUser.uid), {
            ...userData,
            lastLogin: new Date().toISOString()
          }, { merge: true });
        } catch (error) {
          console.error("Error saving user to Firestore:", error);
        }

        login(userData);
      }
    } catch (error) {
      console.error("Google Sign In Error:", error);
    }
  };

  const impersonateCompany = (companyId: string | null) => {
    if (user?.role === 'superadmin') {
      setUser(prev => prev ? { ...prev, companyId: companyId || undefined } : null);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isAuthenticated: !!user,
      signInWithGoogle,
      isFirebaseReady,
      impersonateCompany
    }}>
      {children}
    </AuthContext.Provider>
  );
};

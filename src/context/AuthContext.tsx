import React, { createContext, useContext, useState, ReactNode, useEffect} from 'react';
import { auth} from '../firebase';
import { onAuthStateChanged, signInAnonymously, signOut, GoogleAuthProvider, signInWithPopup} from 'firebase/auth';
import { api} from '../services/api';
import { logAuditAction} from '../services/auditService';

interface User {
 id: string;
 name: string;
 email?: string;
 role: 'admin' | 'employee' | 'superadmin';
 employeeId?: string; // For employees
 companyId?: string; // For admins (primary company)
 currentCompanyId?: string; // Currently active company
 avatar?: string;
}

interface AuthContextType {
 user: User | null;
 login: (user: User) => Promise<void>;
 logout: () => void;
 isAuthenticated: boolean;
 signInWithGoogle: () => Promise<void>;
 isFirebaseReady: boolean;
 impersonateCompany: (companyId: string | null) => void;
 switchCompany: (companyId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
 const context = useContext(AuthContext);
 if (!context) {
 throw new Error('useAuth must be used within an AuthProvider');
}
 return context;
};

export const AuthProvider = ({ children}: { children: ReactNode}) => {
 const [user, setUser] = useState<User | null>(() => {
 const savedUser = localStorage.getItem('currentUser');
 if (!savedUser) return null;
 try {
 return JSON.parse(savedUser);
} catch (e) {
 console.error("Error parsing user from localStorage:", e);
 return null;
}
});
 const [isFirebaseReady, setIsFirebaseReady] = useState(false);

 useEffect(() => {
 const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
 if (!firebaseUser) {
 setUser(null);
 localStorage.removeItem('currentUser');
 }
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

 const login = async (userData: User) => {
 try {
 let firebaseUser = auth.currentUser;
 if (!firebaseUser) {
 const userCredential = await signInAnonymously(auth);
 firebaseUser = userCredential.user;
 }
 userData.id = firebaseUser.uid;
 
    // Save/Update user in MongoDB
    const response = await api.put<any>('users', userData.id, {
      ...userData,
      lastLogin: new Date().toISOString()
    });
    if (response && response.token) {
      localStorage.setItem('auth_token', response.token);
    }
 } catch (error) {
 console.error("Error signing in anonymously:", error);
 }

 setUser(userData);
 logAuditAction({
 companyId: userData.companyId || 'system',
 userId: userData.id,
 userName: userData.name,
 action: 'Login',
 module: 'Auth',
 description:`User ${userData.name} logged in`
});
};

 const logout = async () => {
 if (user) {
 logAuditAction({
 companyId: user.companyId || 'system',
 userId: user.id,
 userName: user.name,
 action: 'Logout',
 module: 'Auth',
 description:`User ${user.name} logged out`
});
}
  localStorage.removeItem('auth_token');
  setUser(null);
  await signOut(auth);
};

 const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const firebaseUser = result.user;
    
    let userData: User;

    // If the email matches superadmin, log them in as superadmin
    if (firebaseUser.email === 'bilal.izhar@algorepublic.com') {
      userData = {
        id: firebaseUser.uid,
        name: firebaseUser.displayName || 'Super Admin',
        email: firebaseUser.email || '',
        role: 'superadmin',
        avatar: firebaseUser.photoURL || undefined
      };
    } else {
      // Default to admin for now
      userData = {
        id: firebaseUser.uid,
        name: firebaseUser.displayName || 'User',
        email: firebaseUser.email || '',
        role: 'admin',
        avatar: firebaseUser.photoURL || undefined
      };
    }

    try {
      // Create/Update user in MongoDB
      const response = await api.put<any>('users', firebaseUser.uid, {
        ...userData,
        lastLogin: new Date().toISOString()
      });
      if (response && response.token) {
        localStorage.setItem('auth_token', response.token);
      }
    } catch (error) {
      console.error("Error saving user to MongoDB:", error);
    }

    await login(userData);
  } catch (error: any) {
 if (error.code === 'auth/popup-closed-by-user') {
 // User intentionally closed the popup, ignore the error
 console.log('Sign-in popup was closed by the user.');
 return;
}
 console.error("Google Sign In Error:", error);
 throw error;
}
};

 const impersonateCompany = (companyId: string | null) => {
 if (user?.role === 'superadmin') {
 setUser(prev => prev ? { ...prev, companyId: companyId || undefined, currentCompanyId: companyId || undefined} : null);
}
};

 const switchCompany = (companyId: string) => {
 setUser(prev => prev ? { ...prev, currentCompanyId: companyId} : null);
};

 return (
 <AuthContext.Provider value={{ 
 user, 
 login, 
 logout, 
 isAuthenticated: !!user,
 signInWithGoogle,
 isFirebaseReady,
 impersonateCompany,
 switchCompany
}}>
 {children}
 </AuthContext.Provider>
 );
};

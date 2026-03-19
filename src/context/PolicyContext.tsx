import React, { createContext, useContext, useState, ReactNode, useEffect} from 'react';
import { 
 collection, 
 onSnapshot, 
 doc, 
 setDoc, 
 deleteDoc,
 query
} from 'firebase/firestore';
import { db} from '../firebase';
import { handleFirestoreError, OperationType} from '../utils/firestoreErrorHandler';

export interface CompanyPolicy {
 id: string;
 location: string;
 title: string;
 description: string;
 methodType: 'upload' | 'create';
 content?: string; // For created text or base64 uploaded file
 fileName?: string;
 dateAdded: string;
}

interface PolicyContextType {
 policies: CompanyPolicy[];
 addPolicy: (policy: Omit<CompanyPolicy, 'id' | 'dateAdded'>) => void;
 deletePolicy: (id: string) => void;
}

const PolicyContext = createContext<PolicyContextType | undefined>(undefined);

export const usePolicies = () => {
 const context = useContext(PolicyContext);
 if (!context) {
 throw new Error('usePolicies must be used within a PolicyProvider');
}
 return context;
};

import { useAuth} from './AuthContext';

// ... imports

export const PolicyProvider = ({ children }: { children: ReactNode }) => {
  const { user, isFirebaseReady } = useAuth();
  const [policies, setPolicies] = useState<CompanyPolicy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseReady || !user) {
      setPolicies([]);
      setLoading(false);
      return;
    }

 const q = query(collection(db, 'policies'));
 const unsubscribe = onSnapshot(q, (snapshot) => {
 const policiesData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id} as CompanyPolicy));
 setPolicies(policiesData);
 setLoading(false);
}, (error) => {
 handleFirestoreError(error, OperationType.LIST, 'policies');
});

  return () => unsubscribe();
}, [user?.id, isFirebaseReady]);

 const addPolicy = async (policy: Omit<CompanyPolicy, 'id' | 'dateAdded'>) => {
 const id = Math.random().toString(36).substr(2, 9);
 const newPolicy: CompanyPolicy = {
 ...policy,
 id,
 dateAdded: new Date().toISOString().split('T')[0]
};
 
 try {
 await setDoc(doc(db, 'policies', id), newPolicy);
} catch (error) {
 console.error("Error adding policy:", error);
}
};

 const deletePolicy = async (id: string) => {
 try {
 await deleteDoc(doc(db, 'policies', id));
} catch (error) {
 console.error("Error deleting policy:", error);
}
};

 return (
 <PolicyContext.Provider value={{ policies, addPolicy, deletePolicy}}>
 {children}
 </PolicyContext.Provider>
 );
};

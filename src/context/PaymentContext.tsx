import React, { createContext, useContext, useState, useEffect} from 'react';
import { collection, query, where, onSnapshot, doc, setDoc, updateDoc, deleteDoc} from 'firebase/firestore';
import { db} from '../firebase';
import { useAuth} from './AuthContext';

export interface Payment {
 id: string;
 companyId: string;
 customerId: string;
 amount: number;
 paymentMethod: string;
 date: string;
 reference?: string;
 journalEntryId?: string;
 createdAt: string;
 updatedAt: string;
}

interface PaymentContextType {
 payments: Payment[];
 loading: boolean;
 error: string | null;
 addPayment: (data: Omit<Payment, 'id' | 'companyId' | 'createdAt' | 'updatedAt'>) => Promise<string>;
 updatePayment: (id: string, data: Partial<Payment>) => Promise<void>;
 deletePayment: (id: string) => Promise<void>;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export function PaymentProvider({ children}: { children: React.ReactNode}) {
 const [payments, setPayments] = useState<Payment[]>([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);
  const { user, isFirebaseReady } = useAuth();
  const activeCompanyId = user?.currentCompanyId || user?.companyId;

  useEffect(() => {
    if (!isFirebaseReady || !activeCompanyId) {
      setPayments([]);
      setLoading(false);
      return;
    }

 const q = query(
 collection(db, 'payments'),
 where('companyId', '==', activeCompanyId)
 );

 const unsubscribe = onSnapshot(q, (snapshot) => {
 const paymentsData = snapshot.docs.map(doc => ({
 ...doc.data(),
 id: doc.id
})) as Payment[];
 
 // Sort by date descending
 paymentsData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
 
 setPayments(paymentsData);
 setLoading(false);
}, (err) => {
 console.error('Error fetching payments:', err);
 setError(err.message);
 setLoading(false);
});

  return () => unsubscribe();
}, [activeCompanyId, isFirebaseReady]);

 const addPayment = async (data: Omit<Payment, 'id' | 'companyId' | 'createdAt' | 'updatedAt'>) => {
 if (!activeCompanyId) throw new Error('No company ID found');

 const id = Math.random().toString(36).substr(2, 9);
 const now = new Date().toISOString();
 
 const newPayment: Payment = {
 ...data,
 id,
 companyId: activeCompanyId,
 createdAt: now,
 updatedAt: now,
};

 await setDoc(doc(db, 'payments', id), newPayment);
 return id;
};

 const updatePayment = async (id: string, data: Partial<Payment>) => {
 if (!activeCompanyId) throw new Error('No company ID found');
 
 const updateData = {
 ...data,
 updatedAt: new Date().toISOString(),
};

 await updateDoc(doc(db, 'payments', id), updateData);
};

 const deletePayment = async (id: string) => {
 if (!activeCompanyId) throw new Error('No company ID found');
 
 await deleteDoc(doc(db, 'payments', id));
};

 return (
 <PaymentContext.Provider value={{
 payments,
 loading,
 error,
 addPayment,
 updatePayment,
 deletePayment
}}>
 {children}
 </PaymentContext.Provider>
 );
}

export function usePayment() {
 const context = useContext(PaymentContext);
 if (context === undefined) {
 throw new Error('usePayment must be used within a PaymentProvider');
}
 return context;
}

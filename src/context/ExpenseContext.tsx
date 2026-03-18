import React, { createContext, useContext, useState, useEffect} from 'react';
import { collection, query, where, onSnapshot, doc, setDoc, updateDoc, deleteDoc} from 'firebase/firestore';
import { db} from '../firebase';
import { useAuth} from './AuthContext';
import { logAuditAction} from '../services/auditService';

export interface Expense {
 id: string;
 companyId: string;
 vendorId?: string;
 accountId: string;
 amount: number;
 date: string;
 reference?: string;
 description: string;
 category: string;
 department?: string;
 paymentMethod: string;
 journalEntryId?: string;
 createdAt: string;
 updatedAt: string;
}

interface ExpenseContextType {
 expenses: Expense[];
 loading: boolean;
 error: string | null;
 addExpense: (data: Omit<Expense, 'id' | 'companyId' | 'createdAt' | 'updatedAt'>) => Promise<string>;
 updateExpense: (id: string, data: Partial<Expense>) => Promise<void>;
 deleteExpense: (id: string) => Promise<void>;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export function ExpenseProvider({ children}: { children: React.ReactNode}) {
 const [expenses, setExpenses] = useState<Expense[]>([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);
 const { user} = useAuth();
 const activeCompanyId = user?.currentCompanyId || user?.companyId;

 useEffect(() => {
 if (!activeCompanyId) {
 setExpenses([]);
 setLoading(false);
 return;
}

 const q = query(
 collection(db, 'expenses'),
 where('companyId', '==', activeCompanyId)
 );

 const unsubscribe = onSnapshot(q, (snapshot) => {
 const expensesData = snapshot.docs.map(doc => ({
 ...doc.data(),
 id: doc.id
})) as Expense[];
 
 expensesData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
 
 setExpenses(expensesData);
 setLoading(false);
}, (err) => {
 console.error('Error fetching expenses:', err);
 setError(err.message);
 setLoading(false);
});

 return () => unsubscribe();
}, [activeCompanyId]);

 const addExpense = async (data: Omit<Expense, 'id' | 'companyId' | 'createdAt' | 'updatedAt'>) => {
 if (!activeCompanyId) throw new Error('No company ID found');

 const id = Math.random().toString(36).substr(2, 9);
 const now = new Date().toISOString();
 
 const newExpense: Expense = {
 ...data,
 id,
 companyId: activeCompanyId,
 createdAt: now,
 updatedAt: now,
};

 await setDoc(doc(db, 'expenses', id), newExpense);

 logAuditAction({
 companyId: activeCompanyId,
 userId: user.id,
 userName: user.name,
 action: 'Create Expense',
 module: 'Expenses',
 recordId: id,
 description:`Created expense: ${data.description} for amount: ${data.amount}`
});

 return id;
};

 const updateExpense = async (id: string, data: Partial<Expense>) => {
 if (!activeCompanyId) throw new Error('No company ID found');
 
 const updateData = {
 ...data,
 updatedAt: new Date().toISOString(),
};

 await updateDoc(doc(db, 'expenses', id), updateData);

 logAuditAction({
 companyId: activeCompanyId,
 userId: user.id,
 userName: user.name,
 action: 'Update Expense',
 module: 'Expenses',
 recordId: id,
 description:`Updated expense ID: ${id}`
});
};

 const deleteExpense = async (id: string) => {
 if (!activeCompanyId) throw new Error('No company ID found');
 
 await deleteDoc(doc(db, 'expenses', id));

 logAuditAction({
 companyId: activeCompanyId,
 userId: user.id,
 userName: user.name,
 action: 'Delete Expense',
 module: 'Expenses',
 recordId: id,
 description:`Deleted expense ID: ${id}`
});
};

 return (
 <ExpenseContext.Provider value={{
 expenses,
 loading,
 error,
 addExpense,
 updateExpense,
 deleteExpense
}}>
 {children}
 </ExpenseContext.Provider>
 );
}

export function useExpense() {
 const context = useContext(ExpenseContext);
 if (context === undefined) {
 throw new Error('useExpense must be used within a ExpenseProvider');
}
 return context;
}

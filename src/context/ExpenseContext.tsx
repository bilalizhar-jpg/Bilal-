import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';

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

export function ExpenseProvider({ children }: { children: React.ReactNode }) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.companyId) {
      setExpenses([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'expenses'),
      where('companyId', '==', user.companyId)
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
  }, [user?.companyId]);

  const addExpense = async (data: Omit<Expense, 'id' | 'companyId' | 'createdAt' | 'updatedAt'>) => {
    if (!user?.companyId) throw new Error('No company ID found');

    const id = Math.random().toString(36).substr(2, 9);
    const now = new Date().toISOString();
    
    const newExpense: Expense = {
      ...data,
      id,
      companyId: user.companyId,
      createdAt: now,
      updatedAt: now,
    };

    await setDoc(doc(db, 'expenses', id), newExpense);
    return id;
  };

  const updateExpense = async (id: string, data: Partial<Expense>) => {
    if (!user?.companyId) throw new Error('No company ID found');
    
    const updateData = {
      ...data,
      updatedAt: new Date().toISOString(),
    };

    await updateDoc(doc(db, 'expenses', id), updateData);
  };

  const deleteExpense = async (id: string) => {
    if (!user?.companyId) throw new Error('No company ID found');
    
    await deleteDoc(doc(db, 'expenses', id));
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

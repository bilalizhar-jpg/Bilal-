import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, setDoc, updateDoc, deleteDoc, writeBatch, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';
import { useAccounting } from './AccountingContext';

export interface BankAccount {
  id: string;
  companyId: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  currency: string;
  openingBalance: number;
  currentBalance: number;
  accountId: string; // Linked to Chart of Accounts
  createdAt: string;
  updatedAt: string;
}

export interface BankTransaction {
  id: string;
  companyId: string;
  bankAccountId: string;
  date: string;
  reference: string;
  amount: number;
  type: 'Debit' | 'Credit';
  description: string;
  linkedJournalEntryId?: string;
  isReconciled: boolean;
  createdAt: string;
  updatedAt: string;
}

interface BankContextType {
  bankAccounts: BankAccount[];
  bankTransactions: BankTransaction[];
  loading: boolean;
  error: string | null;
  addBankAccount: (data: Omit<BankAccount, 'id' | 'companyId' | 'currentBalance' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateBankAccount: (id: string, data: Partial<BankAccount>) => Promise<void>;
  deleteBankAccount: (id: string) => Promise<void>;
  addBankTransaction: (data: Omit<BankTransaction, 'id' | 'companyId' | 'isReconciled' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  reconcileTransaction: (transactionId: string, journalEntryId: string) => Promise<void>;
  unreconcileTransaction: (transactionId: string) => Promise<void>;
}

const BankContext = createContext<BankContextType | undefined>(undefined);

export function BankProvider({ children }: { children: React.ReactNode }) {
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [bankTransactions, setBankTransactions] = useState<BankTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { addJournalEntry, accounts } = useAccounting();

  useEffect(() => {
    if (!user?.companyId) {
      setBankAccounts([]);
      setBankTransactions([]);
      setLoading(false);
      return;
    }

    const qAccounts = query(
      collection(db, 'bankAccounts'),
      where('companyId', '==', user.companyId)
    );

    const qTransactions = query(
      collection(db, 'transactions'),
      where('companyId', '==', user.companyId)
    );

    const unsubscribeAccounts = onSnapshot(qAccounts, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as BankAccount[];
      setBankAccounts(data);
    });

    const unsubscribeTransactions = onSnapshot(qTransactions, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as BankTransaction[];
      data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setBankTransactions(data);
      setLoading(false);
    });

    return () => {
      unsubscribeAccounts();
      unsubscribeTransactions();
    };
  }, [user?.companyId]);

  const addBankAccount = async (data: Omit<BankAccount, 'id' | 'companyId' | 'currentBalance' | 'createdAt' | 'updatedAt'>) => {
    if (!user?.companyId) throw new Error('No company ID found');

    const id = Math.random().toString(36).substr(2, 9);
    const now = new Date().toISOString();
    
    const newAccount: BankAccount = {
      ...data,
      id,
      companyId: user.companyId,
      currentBalance: data.openingBalance,
      createdAt: now,
      updatedAt: now,
    };

    await setDoc(doc(db, 'bankAccounts', id), newAccount);
  };

  const updateBankAccount = async (id: string, data: Partial<BankAccount>) => {
    if (!user?.companyId) throw new Error('No company ID found');
    await updateDoc(doc(db, 'bankAccounts', id), { ...data, updatedAt: new Date().toISOString() });
  };

  const deleteBankAccount = async (id: string) => {
    if (!user?.companyId) throw new Error('No company ID found');
    await deleteDoc(doc(db, 'bankAccounts', id));
  };

  const addBankTransaction = async (data: Omit<BankTransaction, 'id' | 'companyId' | 'isReconciled' | 'createdAt' | 'updatedAt'>) => {
    if (!user?.companyId) throw new Error('No company ID found');

    const id = Math.random().toString(36).substr(2, 9);
    const now = new Date().toISOString();
    
    const newTransaction: BankTransaction = {
      ...data,
      id,
      companyId: user.companyId,
      isReconciled: false,
      createdAt: now,
      updatedAt: now,
    };

    const batch = writeBatch(db);
    batch.set(doc(db, 'transactions', id), newTransaction);

    // Update bank account balance
    const bankAccount = bankAccounts.find(a => a.id === data.bankAccountId);
    if (bankAccount) {
      const balanceChange = data.type === 'Credit' ? data.amount : -data.amount;
      batch.update(doc(db, 'bankAccounts', bankAccount.id), {
        currentBalance: bankAccount.currentBalance + balanceChange,
        updatedAt: now
      });
    }

    await batch.commit();
  };

  const reconcileTransaction = async (transactionId: string, journalEntryId: string) => {
    if (!user?.companyId) throw new Error('No company ID found');
    await updateDoc(doc(db, 'transactions', transactionId), {
      linkedJournalEntryId: journalEntryId,
      isReconciled: true,
      updatedAt: new Date().toISOString()
    });
  };

  const unreconcileTransaction = async (transactionId: string) => {
    if (!user?.companyId) throw new Error('No company ID found');
    await updateDoc(doc(db, 'transactions', transactionId), {
      linkedJournalEntryId: null,
      isReconciled: false,
      updatedAt: new Date().toISOString()
    });
  };

  return (
    <BankContext.Provider value={{
      bankAccounts,
      bankTransactions,
      loading,
      error,
      addBankAccount,
      updateBankAccount,
      deleteBankAccount,
      addBankTransaction,
      reconcileTransaction,
      unreconcileTransaction
    }}>
      {children}
    </BankContext.Provider>
  );
}

export function useBank() {
  const context = useContext(BankContext);
  if (context === undefined) {
    throw new Error('useBank must be used within a BankProvider');
  }
  return context;
}

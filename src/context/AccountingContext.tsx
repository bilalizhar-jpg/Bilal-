import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, setDoc, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';

export type AccountType = 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense';

export interface Account {
  id: string;
  companyId: string;
  code: string;
  name: string;
  type: AccountType;
  parentAccountId?: string;
  openingBalance: number;
  currentBalance: number;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface JournalEntry {
  id: string;
  companyId: string;
  date: string;
  reference: string;
  description: string;
  totalDebit: number;
  totalCredit: number;
  createdAt: string;
  createdBy: string;
}

export interface JournalLine {
  id: string;
  companyId: string;
  journalEntryId: string;
  accountId: string;
  description: string;
  debit: number;
  credit: number;
}

interface AccountingContextType {
  accounts: Account[];
  journalEntries: JournalEntry[];
  journalLines: JournalLine[];
  loading: boolean;
  error: string | null;
  addAccount: (data: Omit<Account, 'id' | 'companyId' | 'currentBalance' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateAccount: (id: string, data: Partial<Account>) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
  addJournalEntry: (entry: Omit<JournalEntry, 'id' | 'companyId' | 'createdAt' | 'createdBy'>, lines: Omit<JournalLine, 'id' | 'companyId' | 'journalEntryId'>[]) => Promise<string>;
}

const AccountingContext = createContext<AccountingContextType | undefined>(undefined);

export function AccountingProvider({ children }: { children: React.ReactNode }) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [journalLines, setJournalLines] = useState<JournalLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.companyId) {
      setAccounts([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'accounting_accounts'),
      where('companyId', '==', user.companyId)
    );

    const qEntries = query(
      collection(db, 'journalEntries'),
      where('companyId', '==', user.companyId)
    );

    const qLines = query(
      collection(db, 'journalLines'),
      where('companyId', '==', user.companyId)
    );

    const unsubscribeAccounts = onSnapshot(q, (snapshot) => {
      const accountsData = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as Account[];
      
      // Sort by code
      accountsData.sort((a, b) => a.code.localeCompare(b.code));
      
      setAccounts(accountsData);
    }, (err) => {
      console.error('Error fetching accounts:', err);
      setError(err.message);
    });

    const unsubscribeEntries = onSnapshot(qEntries, (snapshot) => {
      const entriesData = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as JournalEntry[];
      
      entriesData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setJournalEntries(entriesData);
    }, (err) => {
      console.error('Error fetching journal entries:', err);
      setError(err.message);
    });

    const unsubscribeLines = onSnapshot(qLines, (snapshot) => {
      const linesData = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as JournalLine[];
      
      setJournalLines(linesData);
      setLoading(false);
    }, (err) => {
      console.error('Error fetching journal lines:', err);
      setError(err.message);
      setLoading(false);
    });

    return () => {
      unsubscribeAccounts();
      unsubscribeEntries();
      unsubscribeLines();
    };
  }, [user?.companyId]);

  const addAccount = async (data: Omit<Account, 'id' | 'companyId' | 'currentBalance' | 'createdAt' | 'updatedAt'>) => {
    if (!user?.companyId) throw new Error('No company ID found');

    const id = Math.random().toString(36).substr(2, 9);
    const now = new Date().toISOString();
    
    const newAccount: Account = {
      ...data,
      id,
      companyId: user.companyId,
      currentBalance: data.openingBalance, // Initial balance is opening balance
      createdAt: now,
      updatedAt: now,
    };

    await setDoc(doc(db, 'accounting_accounts', id), newAccount);
  };

  const updateAccount = async (id: string, data: Partial<Account>) => {
    if (!user?.companyId) throw new Error('No company ID found');
    
    const updateData = {
      ...data,
      updatedAt: new Date().toISOString(),
    };

    await updateDoc(doc(db, 'accounting_accounts', id), updateData);
  };

  const deleteAccount = async (id: string) => {
    if (!user?.companyId) throw new Error('No company ID found');
    
    // In a real system, we should check if there are transactions linked to this account before deleting
    await deleteDoc(doc(db, 'accounting_accounts', id));
  };

  const addJournalEntry = async (
    entryData: Omit<JournalEntry, 'id' | 'companyId' | 'createdAt' | 'createdBy'>, 
    linesData: Omit<JournalLine, 'id' | 'companyId' | 'journalEntryId'>[]
  ) => {
    if (!user?.companyId) throw new Error('No company ID found');

    const batch = writeBatch(db);
    const entryId = Math.random().toString(36).substr(2, 9);
    const now = new Date().toISOString();

    const newEntry: JournalEntry = {
      ...entryData,
      id: entryId,
      companyId: user.companyId,
      createdAt: now,
      createdBy: user.id
    };

    batch.set(doc(db, 'journalEntries', entryId), newEntry);

    // Process lines and update account balances
    for (const line of linesData) {
      const lineId = Math.random().toString(36).substr(2, 9);
      const newLine: JournalLine = {
        ...line,
        id: lineId,
        companyId: user.companyId,
        journalEntryId: entryId
      };
      
      batch.set(doc(db, 'journalLines', lineId), newLine);

      // Update account balance
      const account = accounts.find(a => a.id === line.accountId);
      if (account) {
        let balanceChange = 0;
        // Normal balances:
        // Assets & Expenses: Debit increases, Credit decreases
        // Liabilities, Equity, Revenue: Credit increases, Debit decreases
        if (account.type === 'Asset' || account.type === 'Expense') {
          balanceChange = line.debit - line.credit;
        } else {
          balanceChange = line.credit - line.debit;
        }

        const newBalance = account.currentBalance + balanceChange;
        batch.update(doc(db, 'accounting_accounts', account.id), {
          currentBalance: newBalance,
          updatedAt: now
        });
      }
    }

    await batch.commit();
    return entryId;
  };

  return (
    <AccountingContext.Provider value={{
      accounts,
      journalEntries,
      journalLines,
      loading,
      error,
      addAccount,
      updateAccount,
      deleteAccount,
      addJournalEntry
    }}>
      {children}
    </AccountingContext.Provider>
  );
}

export function useAccounting() {
  const context = useContext(AccountingContext);
  if (context === undefined) {
    throw new Error('useAccounting must be used within an AccountingProvider');
  }
  return context;
}

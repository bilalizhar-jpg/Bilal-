import React, { createContext, useContext, useState, useEffect} from 'react';
import { useAuth} from './AuthContext';
import { useAccounting} from './AccountingContext';
import { api } from '../services/api';

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
  const activeCompanyId = user?.currentCompanyId || user?.companyId;

  const fetchData = async () => {
    if (!activeCompanyId) {
      setBankAccounts([]);
      setBankTransactions([]);
      setLoading(false);
      return;
    }

    try {
      const [accountsData, transactionsData] = await Promise.all([
        api.get<BankAccount[]>(`/api/bankAccounts?companyId=${activeCompanyId}`),
        api.get<BankTransaction[]>(`/api/bankTransactions?companyId=${activeCompanyId}`)
      ]);

      transactionsData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setBankAccounts(accountsData);
      setBankTransactions(transactionsData);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching bank data:', err);
      setError(err.message || 'Failed to fetch bank data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [activeCompanyId]);

 const addBankAccount = async (data: Omit<BankAccount, 'id' | 'companyId' | 'currentBalance' | 'createdAt' | 'updatedAt'>) => {
 if (!activeCompanyId) throw new Error('No company ID found');

 const id = Math.random().toString(36).substr(2, 9);
 const now = new Date().toISOString();
 
 const newAccount: BankAccount = {
 ...data,
 id,
 companyId: activeCompanyId,
 currentBalance: data.openingBalance,
 createdAt: now,
 updatedAt: now,
};

 await api.post('/api/bankAccounts', newAccount);
 await fetchData();
};

 const updateBankAccount = async (id: string, data: Partial<BankAccount>) => {
 if (!activeCompanyId) throw new Error('No company ID found');
 await api.put(`/api/bankAccounts/${id}`, { ...data, updatedAt: new Date().toISOString()});
 await fetchData();
};

 const deleteBankAccount = async (id: string) => {
 if (!activeCompanyId) throw new Error('No company ID found');
 await api.delete(`/api/bankAccounts/${id}`);
 await fetchData();
};

 const addBankTransaction = async (data: Omit<BankTransaction, 'id' | 'companyId' | 'isReconciled' | 'createdAt' | 'updatedAt'>) => {
 if (!activeCompanyId) throw new Error('No company ID found');

 const id = Math.random().toString(36).substr(2, 9);
 const now = new Date().toISOString();
 
 const newTransaction: BankTransaction = {
 ...data,
 id,
 companyId: activeCompanyId,
 isReconciled: false,
 createdAt: now,
 updatedAt: now,
};

 await api.post('/api/bankTransactions', newTransaction);

 // Update bank account balance
 const bankAccount = bankAccounts.find(a => a.id === data.bankAccountId);
 if (bankAccount) {
 const balanceChange = data.type === 'Credit' ? data.amount : -data.amount;
 await api.put(`/api/bankAccounts/${bankAccount.id}`, {
 currentBalance: bankAccount.currentBalance + balanceChange,
 updatedAt: now
});
}

 await fetchData();
};

 const reconcileTransaction = async (transactionId: string, journalEntryId: string) => {
 if (!activeCompanyId) throw new Error('No company ID found');
 await api.put(`/api/bankTransactions/${transactionId}`, {
 linkedJournalEntryId: journalEntryId,
 isReconciled: true,
 updatedAt: new Date().toISOString()
});
 await fetchData();
};

 const unreconcileTransaction = async (transactionId: string) => {
 if (!activeCompanyId) throw new Error('No company ID found');
 await api.put(`/api/bankTransactions/${transactionId}`, {
 linkedJournalEntryId: null,
 isReconciled: false,
 updatedAt: new Date().toISOString()
});
 await fetchData();
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

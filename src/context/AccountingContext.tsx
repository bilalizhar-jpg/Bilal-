import React, { createContext, useContext, useState, useEffect} from 'react';
import { useAuth} from './AuthContext';
import { logAuditAction} from '../services/auditService';
import { api } from '../services/api';

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

export interface FiscalYear {
 id: string;
 companyId: string;
 name: string;
 startDate: string;
 endDate: string;
 status: 'Open' | 'Closed';
 createdAt: string;
 updatedAt: string;
}

interface AccountingContextType {
 accounts: Account[];
 journalEntries: JournalEntry[];
 journalLines: JournalLine[];
 fiscalYears: FiscalYear[];
 loading: boolean;
 error: string | null;
 addAccount: (data: Omit<Account, 'id' | 'companyId' | 'currentBalance' | 'createdAt' | 'updatedAt'>) => Promise<void>;
 updateAccount: (id: string, data: Partial<Account>) => Promise<void>;
 deleteAccount: (id: string) => Promise<void>;
 addJournalEntry: (entry: Omit<JournalEntry, 'id' | 'companyId' | 'createdAt' | 'createdBy'>, lines: Omit<JournalLine, 'id' | 'companyId' | 'journalEntryId'>[]) => Promise<string>;
 addFiscalYear: (data: Omit<FiscalYear, 'id' | 'companyId' | 'status' | 'createdAt' | 'updatedAt'>) => Promise<void>;
 updateFiscalYear: (id: string, data: Partial<FiscalYear>) => Promise<void>;
 closeFiscalYear: (id: string, retainedEarningsAccountId: string) => Promise<void>;
 isPeriodClosed: (date: string) => boolean;
}

const AccountingContext = createContext<AccountingContextType | undefined>(undefined);

export function AccountingProvider({ children}: { children: React.ReactNode}) {
 const [accounts, setAccounts] = useState<Account[]>([]);
 const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
 const [journalLines, setJournalLines] = useState<JournalLine[]>([]);
 const [fiscalYears, setFiscalYears] = useState<FiscalYear[]>([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const activeCompanyId = user?.currentCompanyId || user?.companyId;

  const fetchData = async () => {
    if (!activeCompanyId) {
      setAccounts([]);
      setJournalEntries([]);
      setJournalLines([]);
      setFiscalYears([]);
      setLoading(false);
      return;
    }

    try {
      const [accountsData, entriesData, linesData, fiscalData] = await Promise.all([
        api.get<Account[]>(`/api/accounting_accounts?companyId=${activeCompanyId}`),
        api.get<JournalEntry[]>(`/api/journalEntries?companyId=${activeCompanyId}`),
        api.get<JournalLine[]>(`/api/journalLines?companyId=${activeCompanyId}`),
        api.get<FiscalYear[]>(`/api/fiscalYears?companyId=${activeCompanyId}`)
      ]);

      accountsData.sort((a, b) => a.code.localeCompare(b.code));
      entriesData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      fiscalData.sort((a, b) => b.startDate.localeCompare(a.startDate));

      setAccounts(accountsData);
      setJournalEntries(entriesData);
      setJournalLines(linesData);
      setFiscalYears(fiscalData);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching accounting data:', err);
      setError(err.message || 'Failed to fetch accounting data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [activeCompanyId]);

 const isPeriodClosed = (date: string) => {
 return fiscalYears.some(fy => 
 fy.status === 'Closed' && 
 date >= fy.startDate && 
 date <= fy.endDate
 );
};

 const addFiscalYear = async (data: Omit<FiscalYear, 'id' | 'companyId' | 'status' | 'createdAt' | 'updatedAt'>) => {
 if (!activeCompanyId) throw new Error('No company ID found');
 const id = Math.random().toString(36).substr(2, 9);
 const now = new Date().toISOString();
 const newFY: FiscalYear = {
 ...data,
 id,
 companyId: activeCompanyId,
 status: 'Open',
 createdAt: now,
 updatedAt: now,
};
 await api.post('/api/fiscalYears', newFY);
 await fetchData();
};

 const updateFiscalYear = async (id: string, data: Partial<FiscalYear>) => {
 if (!activeCompanyId) throw new Error('No company ID found');
 await api.put(`/api/fiscalYears/${id}`, {
 ...data,
 updatedAt: new Date().toISOString(),
});
 await fetchData();
};

 const closeFiscalYear = async (id: string, retainedEarningsAccountId: string) => {
 if (!activeCompanyId) throw new Error('No company ID found');
 const fy = fiscalYears.find(f => f.id === id);
 if (!fy) throw new Error('Fiscal year not found');

 const now = new Date().toISOString();

 // 1. Calculate Net Profit for the period
 const periodEntries = journalEntries.filter(e => e.date >= fy.startDate && e.date <= fy.endDate);
 const periodEntryIds = new Set(periodEntries.map(e => e.id));
 const periodLines = journalLines.filter(l => periodEntryIds.has(l.journalEntryId));

 const pnlBalances: Record<string, number> = {};
 accounts.forEach(a => {
 if (a.type === 'Revenue' || a.type === 'Expense') {
 pnlBalances[a.id] = 0;
}
});

 periodLines.forEach(l => {
 if (pnlBalances[l.accountId] !== undefined) {
 const account = accounts.find(a => a.id === l.accountId);
 if (account?.type === 'Revenue') {
 pnlBalances[l.accountId] += (l.credit - l.debit);
} else {
 pnlBalances[l.accountId] += (l.debit - l.credit);
}
}
});

 const totalRevenue = Object.entries(pnlBalances)
 .filter(([id]) => accounts.find(a => a.id === id)?.type === 'Revenue')
 .reduce((sum, [, bal]) => sum + bal, 0);
 
 const totalExpense = Object.entries(pnlBalances)
 .filter(([id]) => accounts.find(a => a.id === id)?.type === 'Expense')
 .reduce((sum, [, bal]) => sum + bal, 0);

 const netProfit = totalRevenue - totalExpense;

 // 2. Create Closing Journal Entry
 const closingEntryId = Math.random().toString(36).substr(2, 9);
 const closingLines: Omit<JournalLine, 'id' | 'companyId' | 'journalEntryId'>[] = [];

 // Zero out Revenue & Expense accounts
 Object.entries(pnlBalances).forEach(([accountId, balance]) => {
 if (balance === 0) return;
 const account = accounts.find(a => a.id === accountId);
 if (account?.type === 'Revenue') {
 // Revenue has credit balance, so debit to zero out
 closingLines.push({ accountId, description:`Closing ${account.name}`, debit: balance, credit: 0});
} else {
 // Expense has debit balance, so credit to zero out
 closingLines.push({ accountId, description:`Closing ${account.name}`, debit: 0, credit: balance});
}
});

 // Transfer to Retained Earnings
 if (netProfit !== 0) {
 closingLines.push({
 accountId: retainedEarningsAccountId,
 description:`Transfer Net Profit to Retained Earnings for ${fy.name}`,
 debit: netProfit < 0 ? Math.abs(netProfit) : 0,
 credit: netProfit > 0 ? netProfit : 0
});
}

 const totalDebit = closingLines.reduce((sum, l) => sum + l.debit, 0);
 const totalCredit = closingLines.reduce((sum, l) => sum + l.credit, 0);

 const closingEntry: JournalEntry = {
 id: closingEntryId,
 companyId: activeCompanyId,
 date: fy.endDate,
 reference:`CLOSE-${fy.name}`,
 description:`Year-end closing entry for ${fy.name}`,
 totalDebit,
 totalCredit,
 createdAt: now,
 createdBy: user.id
};

 await api.post('/api/journalEntries', closingEntry);
 for (const line of closingLines) {
 const lineId = Math.random().toString(36).substr(2, 9);
 await api.post('/api/journalLines', { ...line, id: lineId, companyId: activeCompanyId, journalEntryId: closingEntryId});
}

 // 3. Update Fiscal Year Status
 await api.put(`/api/fiscalYears/${id}`, { status: 'Closed', updatedAt: now});
 await fetchData();
};

 const addAccount = async (data: Omit<Account, 'id' | 'companyId' | 'currentBalance' | 'createdAt' | 'updatedAt'>) => {
 if (!activeCompanyId) throw new Error('No company ID found');

 const id = Math.random().toString(36).substr(2, 9);
 const now = new Date().toISOString();
 
 const newAccount: Account = {
 ...data,
 id,
 companyId: activeCompanyId,
 currentBalance: data.openingBalance, // Initial balance is opening balance
 createdAt: now,
 updatedAt: now,
};

 await api.post('/api/accounting_accounts', newAccount);
 await fetchData();

 logAuditAction({
 companyId: activeCompanyId,
 userId: user.id,
 userName: user.name,
 action: 'Create Account',
 module: 'Accounting',
 recordId: id,
 description:`Created account: ${data.name} (${data.code})`
});
};

 const updateAccount = async (id: string, data: Partial<Account>) => {
 if (!activeCompanyId) throw new Error('No company ID found');
 
 const updateData = {
 ...data,
 updatedAt: new Date().toISOString(),
};

 await api.put(`/api/accounting_accounts/${id}`, updateData);
 await fetchData();

 logAuditAction({
 companyId: activeCompanyId,
 userId: user.id,
 userName: user.name,
 action: 'Update Account',
 module: 'Accounting',
 recordId: id,
 description:`Updated account ID: ${id}`
});
};

 const deleteAccount = async (id: string) => {
 if (!activeCompanyId) throw new Error('No company ID found');
 
 // In a real system, we should check if there are transactions linked to this account before deleting
 await api.delete(`/api/accounting_accounts/${id}`);
 await fetchData();

 logAuditAction({
 companyId: activeCompanyId,
 userId: user.id,
 userName: user.name,
 action: 'Delete Account',
 module: 'Accounting',
 recordId: id,
 description:`Deleted account ID: ${id}`
});
};

 const addJournalEntry = async (
 entryData: Omit<JournalEntry, 'id' | 'companyId' | 'createdAt' | 'createdBy'>, 
 linesData: Omit<JournalLine, 'id' | 'companyId' | 'journalEntryId'>[]
 ) => {
 if (!activeCompanyId) throw new Error('No company ID found');

 if (isPeriodClosed(entryData.date)) {
 throw new Error('Cannot add transaction to a closed fiscal period.');
}

 const entryId = Math.random().toString(36).substr(2, 9);
 const now = new Date().toISOString();

 const newEntry: JournalEntry = {
 ...entryData,
 id: entryId,
 companyId: activeCompanyId,
 createdAt: now,
 createdBy: user.id
};

 await api.post('/api/journalEntries', newEntry);

 // Process lines and update account balances
 for (const line of linesData) {
 const lineId = Math.random().toString(36).substr(2, 9);
 const newLine: JournalLine = {
 ...line,
 id: lineId,
 companyId: activeCompanyId,
 journalEntryId: entryId
};
 
 await api.post('/api/journalLines', newLine);

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
 await api.put(`/api/accounting_accounts/${account.id}`, {
 currentBalance: newBalance,
 updatedAt: now
});
}
}

 await fetchData();

 logAuditAction({
 companyId: activeCompanyId,
 userId: user.id,
 userName: user.name,
 action: 'Create Journal Entry',
 module: 'Accounting',
 recordId: entryId,
 description:`Created journal entry: ${entryData.reference} - ${entryData.description}`
});

 return entryId;
};

 return (
 <AccountingContext.Provider value={{
 accounts,
 journalEntries,
 journalLines,
 fiscalYears,
 loading,
 error,
 addAccount,
 updateAccount,
 deleteAccount,
 addJournalEntry,
 addFiscalYear,
 updateFiscalYear,
 closeFiscalYear,
 isPeriodClosed
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

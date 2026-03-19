import React, { createContext, useContext, useState, useEffect} from 'react';
import { api} from '../services/api';
import { useAuth} from './AuthContext';

export interface Bill {
  id: string;
  companyId: string;
  vendorId: string;
  billNumber?: string;
  date: string;
  dueDate: string;
  totalAmount: number;
  taxAmount: number;
  status: 'draft' | 'open' | 'paid' | 'overdue';
  journalEntryId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BillItem {
  id: string;
  companyId: string;
  billId: string;
  item: string;
  quantity: number;
  price: number;
  tax: number;
  total: number;
}

interface BillContextType {
  bills: Bill[];
  billItems: BillItem[];
  loading: boolean;
  error: string | null;
  addBill: (billData: Omit<Bill, 'id' | 'companyId' | 'createdAt' | 'updatedAt'>, items: Omit<BillItem, 'id' | 'companyId' | 'billId'>[]) => Promise<string>;
  updateBillStatus: (id: string, status: Bill['status']) => Promise<void>;
  deleteBill: (id: string) => Promise<void>;
}

const BillContext = createContext<BillContextType | undefined>(undefined);

export function BillProvider({ children}: { children: React.ReactNode}) {
  const [bills, setBills] = useState<Bill[]>([]);
  const [billItems, setBillItems] = useState<BillItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const activeCompanyId = user?.currentCompanyId || user?.companyId;

  const fetchData = async () => {
    if (!activeCompanyId) {
      setBills([]);
      setBillItems([]);
      setLoading(false);
      return;
    }

    try {
      const [billsData, itemsData] = await Promise.all([
        api.get('bills', { companyId: activeCompanyId }),
        api.get('billItems', { companyId: activeCompanyId })
      ]);

      const sortedBills = (billsData as Bill[]).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setBills(sortedBills);
      setBillItems(itemsData as BillItem[]);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching bill data:", err);
      setError("Failed to fetch bill data");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, [activeCompanyId]);

  const addBill = async (billData: Omit<Bill, 'id' | 'companyId' | 'createdAt' | 'updatedAt'>, items: Omit<BillItem, 'id' | 'companyId' | 'billId'>[]) => {
    if (!activeCompanyId) throw new Error('No company ID found');

    const billId = Math.random().toString(36).substr(2, 9);
    const now = new Date().toISOString();

    const newBill: Bill = {
      ...billData,
      id: billId,
      companyId: activeCompanyId,
      createdAt: now,
      updatedAt: now,
    };

    await api.post('bills', newBill);

    for (const item of items) {
      const itemId = Math.random().toString(36).substr(2, 9);
      const newItem: BillItem = {
        ...item,
        id: itemId,
        companyId: activeCompanyId,
        billId: billId,
      };
      await api.post('billItems', newItem);
    }

    fetchData();
    return billId;
  };

  const updateBillStatus = async (id: string, status: Bill['status']) => {
    await api.put('bills', id, { 
      status,
      updatedAt: new Date().toISOString()
    });
    fetchData();
  };

  const deleteBill = async (id: string) => {
    await api.delete('bills', id);
    
    const itemsToDelete = billItems.filter(item => item.billId === id);
    for (const item of itemsToDelete) {
      await api.delete('billItems', item.id);
    }
    fetchData();
  };

  return (
    <BillContext.Provider value={{ bills, billItems, loading, error, addBill, updateBillStatus, deleteBill}}>
      {children}
    </BillContext.Provider>
  );
}

export function useBill() {
  const context = useContext(BillContext);
  if (context === undefined) {
    throw new Error('useBill must be used within a BillProvider');
  }
  return context;
}

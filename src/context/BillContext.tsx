import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, setDoc, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';

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

export function BillProvider({ children }: { children: React.ReactNode }) {
  const [bills, setBills] = useState<Bill[]>([]);
  const [billItems, setBillItems] = useState<BillItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const activeCompanyId = user?.currentCompanyId || user?.companyId;

  useEffect(() => {
    if (!activeCompanyId) {
      setBills([]);
      setBillItems([]);
      setLoading(false);
      return;
    }

    const billsQuery = query(collection(db, 'bills'), where('companyId', '==', activeCompanyId));
    const itemsQuery = query(collection(db, 'billItems'), where('companyId', '==', activeCompanyId));

    const unsubscribeBills = onSnapshot(billsQuery, (snapshot) => {
      const billsData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Bill[];
      billsData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setBills(billsData);
    });

    const unsubscribeItems = onSnapshot(itemsQuery, (snapshot) => {
      const itemsData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as BillItem[];
      setBillItems(itemsData);
      setLoading(false);
    });

    return () => {
      unsubscribeBills();
      unsubscribeItems();
    };
  }, [activeCompanyId]);

  const addBill = async (billData: Omit<Bill, 'id' | 'companyId' | 'createdAt' | 'updatedAt'>, items: Omit<BillItem, 'id' | 'companyId' | 'billId'>[]) => {
    if (!activeCompanyId) throw new Error('No company ID found');

    const billId = Math.random().toString(36).substr(2, 9);
    const now = new Date().toISOString();
    const batch = writeBatch(db);

    const newBill: Bill = {
      ...billData,
      id: billId,
      companyId: activeCompanyId,
      createdAt: now,
      updatedAt: now,
    };

    batch.set(doc(db, 'bills', billId), newBill);

    items.forEach(item => {
      const itemId = Math.random().toString(36).substr(2, 9);
      const newItem: BillItem = {
        ...item,
        id: itemId,
        companyId: activeCompanyId,
        billId: billId,
      };
      batch.set(doc(db, 'billItems', itemId), newItem);
    });

    await batch.commit();
    return billId;
  };

  const updateBillStatus = async (id: string, status: Bill['status']) => {
    await updateDoc(doc(db, 'bills', id), { 
      status,
      updatedAt: new Date().toISOString()
    });
  };

  const deleteBill = async (id: string) => {
    const batch = writeBatch(db);
    batch.delete(doc(db, 'bills', id));
    
    const itemsToDelete = billItems.filter(item => item.billId === id);
    itemsToDelete.forEach(item => {
      batch.delete(doc(db, 'billItems', item.id));
    });

    await batch.commit();
  };

  return (
    <BillContext.Provider value={{ bills, billItems, loading, error, addBill, updateBillStatus, deleteBill }}>
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

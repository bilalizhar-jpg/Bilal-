import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, setDoc, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';

export interface Invoice {
  id: string;
  companyId: string;
  customerId: string;
  date: string;
  dueDate: string;
  totalAmount: number;
  status: 'Draft' | 'Sent' | 'Paid' | 'Cancelled';
  journalEntryId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceItem {
  id: string;
  companyId: string;
  invoiceId: string;
  product: string;
  quantity: number;
  price: number;
  tax: number;
  total: number;
}

interface InvoiceContextType {
  invoices: Invoice[];
  invoiceItems: InvoiceItem[];
  loading: boolean;
  error: string | null;
  addInvoice: (invoice: Omit<Invoice, 'id' | 'companyId' | 'createdAt' | 'updatedAt'>, items: Omit<InvoiceItem, 'id' | 'companyId' | 'invoiceId'>[]) => Promise<string>;
  updateInvoice: (id: string, data: Partial<Invoice>) => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;
}

const InvoiceContext = createContext<InvoiceContextType | undefined>(undefined);

export function InvoiceProvider({ children }: { children: React.ReactNode }) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.companyId) {
      setInvoices([]);
      setInvoiceItems([]);
      setLoading(false);
      return;
    }

    const qInvoices = query(
      collection(db, 'invoices'),
      where('companyId', '==', user.companyId)
    );

    const qItems = query(
      collection(db, 'invoiceItems'),
      where('companyId', '==', user.companyId)
    );

    const unsubscribeInvoices = onSnapshot(qInvoices, (snapshot) => {
      const invoicesData = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as Invoice[];
      
      invoicesData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setInvoices(invoicesData);
    }, (err) => {
      console.error('Error fetching invoices:', err);
      setError(err.message);
    });

    const unsubscribeItems = onSnapshot(qItems, (snapshot) => {
      const itemsData = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as InvoiceItem[];
      
      setInvoiceItems(itemsData);
      setLoading(false);
    }, (err) => {
      console.error('Error fetching invoice items:', err);
      setError(err.message);
      setLoading(false);
    });

    return () => {
      unsubscribeInvoices();
      unsubscribeItems();
    };
  }, [user?.companyId]);

  const addInvoice = async (
    invoiceData: Omit<Invoice, 'id' | 'companyId' | 'createdAt' | 'updatedAt'>,
    itemsData: Omit<InvoiceItem, 'id' | 'companyId' | 'invoiceId'>[]
  ) => {
    if (!user?.companyId) throw new Error('No company ID found');

    const batch = writeBatch(db);
    const invoiceId = Math.random().toString(36).substr(2, 9);
    const now = new Date().toISOString();
    
    const newInvoice: Invoice = {
      ...invoiceData,
      id: invoiceId,
      companyId: user.companyId,
      createdAt: now,
      updatedAt: now,
    };

    batch.set(doc(db, 'invoices', invoiceId), newInvoice);

    itemsData.forEach(item => {
      const itemId = Math.random().toString(36).substr(2, 9);
      const newItem: InvoiceItem = {
        ...item,
        id: itemId,
        companyId: user.companyId,
        invoiceId: invoiceId
      };
      batch.set(doc(db, 'invoiceItems', itemId), newItem);
    });

    await batch.commit();
    return invoiceId;
  };

  const updateInvoice = async (id: string, data: Partial<Invoice>) => {
    if (!user?.companyId) throw new Error('No company ID found');
    
    const updateData = {
      ...data,
      updatedAt: new Date().toISOString(),
    };

    await updateDoc(doc(db, 'invoices', id), updateData);
  };

  const deleteInvoice = async (id: string) => {
    if (!user?.companyId) throw new Error('No company ID found');
    
    // In a real system, you might want to delete associated items and reverse journal entries
    await deleteDoc(doc(db, 'invoices', id));
  };

  return (
    <InvoiceContext.Provider value={{
      invoices,
      invoiceItems,
      loading,
      error,
      addInvoice,
      updateInvoice,
      deleteInvoice
    }}>
      {children}
    </InvoiceContext.Provider>
  );
}

export function useInvoice() {
  const context = useContext(InvoiceContext);
  if (context === undefined) {
    throw new Error('useInvoice must be used within an InvoiceProvider');
  }
  return context;
}

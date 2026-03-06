import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  addDoc,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrorHandler';

export interface Invoice {
  id: string;
  companyId: string;
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  logo: string | null;
  billToName: string;
  billToCompany: string;
  billToAddress: string;
  billToPhone: string;
  shipToName: string;
  shipToCompany: string;
  shipToAddress: string;
  shipToPhone: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  poNumber: string;
  items: any[];
  notes: string;
  terms: string;
  customFields: any[];
  taxRate: number;
  shipping: number;
  discount: number;
  createdAt: any;
}

interface InvoiceContextType {
  invoices: Invoice[];
  loading: boolean;
  addInvoice: (invoice: Omit<Invoice, 'id' | 'companyId' | 'createdAt'>) => Promise<string>;
  updateInvoice: (id: string, invoice: Partial<Invoice>) => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;
}

const InvoiceContext = createContext<InvoiceContextType | undefined>(undefined);

export const useInvoices = () => {
  const context = useContext(InvoiceContext);
  if (!context) {
    throw new Error('useInvoices must be used within an InvoiceProvider');
  }
  return context;
};

export const InvoiceProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.companyId) {
      setInvoices([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'company_invoices'),
      where('companyId', '==', user.companyId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const invoicesData = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as Invoice[];
      setInvoices(invoicesData.sort((a, b) => {
        const dateA = a.createdAt?.seconds || 0;
        const dateB = b.createdAt?.seconds || 0;
        return dateB - dateA;
      }));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'company_invoices');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.companyId]);

  const addInvoice = async (invoice: Omit<Invoice, 'id' | 'companyId' | 'createdAt'>) => {
    if (!user?.companyId) throw new Error('User not authenticated');

    try {
      const docRef = await addDoc(collection(db, 'company_invoices'), {
        ...invoice,
        companyId: user.companyId,
        createdAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'company_invoices');
      throw error;
    }
  };

  const updateInvoice = async (id: string, invoice: Partial<Invoice>) => {
    try {
      const { id: _, ...updateData } = invoice;
      await updateDoc(doc(db, 'company_invoices', id), updateData);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `company_invoices/${id}`);
      throw error;
    }
  };

  const deleteInvoice = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'company_invoices', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `company_invoices/${id}`);
      throw error;
    }
  };

  return (
    <InvoiceContext.Provider value={{ invoices, loading, addInvoice, updateInvoice, deleteInvoice }}>
      {children}
    </InvoiceContext.Provider>
  );
};

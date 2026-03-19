import React, { createContext, useContext, useState, useEffect} from 'react';
import { api} from '../services/api';
import { useAuth} from './AuthContext';

export interface Payment {
  id: string;
  companyId: string;
  customerId: string;
  amount: number;
  paymentMethod: string;
  date: string;
  reference?: string;
  journalEntryId?: string;
  createdAt: string;
  updatedAt: string;
}

interface PaymentContextType {
  payments: Payment[];
  loading: boolean;
  error: string | null;
  addPayment: (data: Omit<Payment, 'id' | 'companyId' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updatePayment: (id: string, data: Partial<Payment>) => Promise<void>;
  deletePayment: (id: string) => Promise<void>;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export function PaymentProvider({ children}: { children: React.ReactNode}) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const activeCompanyId = user?.currentCompanyId || user?.companyId;

  const fetchPayments = async () => {
    if (!activeCompanyId) {
      setPayments([]);
      setLoading(false);
      return;
    }

    try {
      const data = await api.get('payments', { companyId: activeCompanyId });
      const paymentsData = data as Payment[];
      
      // Sort by date descending
      paymentsData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      setPayments(paymentsData);
      setLoading(false);
    } catch (err: any) {
      console.error('Error fetching payments:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
    const interval = setInterval(fetchPayments, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, [activeCompanyId]);

  const addPayment = async (data: Omit<Payment, 'id' | 'companyId' | 'createdAt' | 'updatedAt'>) => {
    if (!activeCompanyId) throw new Error('No company ID found');

    const id = Math.random().toString(36).substr(2, 9);
    const now = new Date().toISOString();
    
    const newPayment: Payment = {
      ...data,
      id,
      companyId: activeCompanyId,
      createdAt: now,
      updatedAt: now,
    };

    await api.post('payments', newPayment);
    fetchPayments();
    return id;
  };

  const updatePayment = async (id: string, data: Partial<Payment>) => {
    if (!activeCompanyId) throw new Error('No company ID found');
    
    const updateData = {
      ...data,
      updatedAt: new Date().toISOString(),
    };

    await api.put('payments', id, updateData);
    fetchPayments();
  };

  const deletePayment = async (id: string) => {
    if (!activeCompanyId) throw new Error('No company ID found');
    
    await api.delete('payments', id);
    fetchPayments();
  };

  return (
    <PaymentContext.Provider value={{
      payments,
      loading,
      error,
      addPayment,
      updatePayment,
      deletePayment
    }}>
      {children}
    </PaymentContext.Provider>
  );
}

export function usePayment() {
  const context = useContext(PaymentContext);
  if (context === undefined) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
}

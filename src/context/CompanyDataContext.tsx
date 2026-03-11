import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query,
  where
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrorHandler';

interface DataEntity {
  id: string;
  companyId: string;
  [key: string]: any;
}

interface CompanyDataContextType {
  awards: DataEntity[];
  departments: DataEntity[];
  designations: DataEntity[];
  subDepartments: DataEntity[];
  notices: DataEntity[];
  projects: DataEntity[];
  assets: DataEntity[];
  tasks: DataEntity[];
  sales: DataEntity[];
  milestones: DataEntity[];
  loans: DataEntity[];
  payrolls: DataEntity[];
  payrollBatches: DataEntity[];
  salaryRecords: DataEntity[];
  orgChartTemplates: DataEntity[];
  procurementRequests: DataEntity[];
  procurementSettings: DataEntity[];
  bankAccounts: DataEntity[];
  bankTransfers: DataEntity[];
  accountPayments: DataEntity[];
  vouchers: DataEntity[];
  ledgerGroups: DataEntity[];
  ledgers: DataEntity[];
  accountBills: DataEntity[];
  accountPeople: DataEntity[];
  accountInvoices: DataEntity[];
  journalEntries: DataEntity[];
  companies: DataEntity[];
  products: DataEntity[];
  loading: boolean;
  addEntity: (collectionName: string, data: any) => Promise<void>;
  updateEntity: (collectionName: string, id: string, data: any) => Promise<void>;
  deleteEntity: (collectionName: string, id: string) => Promise<void>;
}

const CompanyDataContext = createContext<CompanyDataContextType | undefined>(undefined);

export const useCompanyData = () => {
  const context = useContext(CompanyDataContext);
  if (!context) {
    throw new Error('useCompanyData must be used within a CompanyDataProvider');
  }
  return context;
};

export const CompanyDataProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [awards, setAwards] = useState<DataEntity[]>([]);
  const [departments, setDepartments] = useState<DataEntity[]>([]);
  const [designations, setDesignations] = useState<DataEntity[]>([]);
  const [subDepartments, setSubDepartments] = useState<DataEntity[]>([]);
  const [notices, setNotices] = useState<DataEntity[]>([]);
  const [projects, setProjects] = useState<DataEntity[]>([]);
  const [assets, setAssets] = useState<DataEntity[]>([]);
  const [tasks, setTasks] = useState<DataEntity[]>([]);
  const [sales, setSales] = useState<DataEntity[]>([]);
  const [milestones, setMilestones] = useState<DataEntity[]>([]);
  const [loans, setLoans] = useState<DataEntity[]>([]);
  const [payrolls, setPayrolls] = useState<DataEntity[]>([]);
  const [payrollBatches, setPayrollBatches] = useState<DataEntity[]>([]);
  const [salaryRecords, setSalaryRecords] = useState<DataEntity[]>([]);
  const [orgChartTemplates, setOrgChartTemplates] = useState<DataEntity[]>([]);
  const [procurementRequests, setProcurementRequests] = useState<DataEntity[]>([]);
  const [procurementSettings, setProcurementSettings] = useState<DataEntity[]>([]);
  const [bankAccounts, setBankAccounts] = useState<DataEntity[]>([]);
  const [bankTransfers, setBankTransfers] = useState<DataEntity[]>([]);
  const [accountPayments, setAccountPayments] = useState<DataEntity[]>([]);
  const [vouchers, setVouchers] = useState<DataEntity[]>([]);
  const [ledgerGroups, setLedgerGroups] = useState<DataEntity[]>([]);
  const [ledgers, setLedgers] = useState<DataEntity[]>([]);
  const [accountBills, setAccountBills] = useState<DataEntity[]>([]);
  const [accountPeople, setAccountPeople] = useState<DataEntity[]>([]);
  const [accountInvoices, setAccountInvoices] = useState<DataEntity[]>([]);
  const [journalEntries, setJournalEntries] = useState<DataEntity[]>([]);
  const [companies, setCompanies] = useState<DataEntity[]>([]);
  const [products, setProducts] = useState<DataEntity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.companyId) {
      setLoading(false);
      return;
    }

    const collections = [
      { name: 'awards', setter: setAwards },
      { name: 'departments', setter: setDepartments },
      { name: 'designations', setter: setDesignations },
      { name: 'subDepartments', setter: setSubDepartments },
      { name: 'notices', setter: setNotices },
      { name: 'projects', setter: setProjects },
      { name: 'assets', setter: setAssets },
      { name: 'tasks', setter: setTasks },
      { name: 'sales', setter: setSales },
      { name: 'milestones', setter: setMilestones },
      { name: 'loans', setter: setLoans },
      { name: 'payrolls', setter: setPayrolls },
      { name: 'payrollBatches', setter: setPayrollBatches },
      { name: 'salaryRecords', setter: setSalaryRecords },
      { name: 'orgChartTemplates', setter: setOrgChartTemplates },
      { name: 'procurementRequests', setter: setProcurementRequests },
      { name: 'procurementSettings', setter: setProcurementSettings },
      { name: 'bankAccounts', setter: setBankAccounts },
      { name: 'bankTransfers', setter: setBankTransfers },
      { name: 'accountPayments', setter: setAccountPayments },
      { name: 'vouchers', setter: setVouchers },
      { name: 'ledgerGroups', setter: setLedgerGroups },
      { name: 'ledgers', setter: setLedgers },
      { name: 'accountBills', setter: setAccountBills },
      { name: 'accountPeople', setter: setAccountPeople },
      { name: 'accountInvoices', setter: setAccountInvoices },
      { name: 'journalEntries', setter: setJournalEntries },
      { name: 'companies', setter: setCompanies },
      { name: 'products', setter: setProducts }
    ];

    const unsubscribes = collections.map(({ name, setter }) => {
      const q = query(collection(db, name), where('companyId', '==', user.companyId));
      return onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as DataEntity));
        setter(data);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, name);
      });
    });

    setLoading(false);
    return () => unsubscribes.forEach(unsub => unsub());
  }, [user?.companyId]);

  const addEntity = async (collectionName: string, data: any) => {
    if (!user?.companyId) return;
    const id = data.id || Math.random().toString(36).substr(2, 9);
    const entityData = { ...data, id, companyId: user.companyId };
    try {
      await setDoc(doc(db, collectionName, id), entityData);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, collectionName);
    }
  };

  const updateEntity = async (collectionName: string, id: string, data: any) => {
    try {
      await updateDoc(doc(db, collectionName, id), data);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, collectionName);
    }
  };

  const deleteEntity = async (collectionName: string, id: string) => {
    try {
      await deleteDoc(doc(db, collectionName, id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, collectionName);
    }
  };

  return (
    <CompanyDataContext.Provider value={{ 
      awards, 
      departments, 
      designations,
      subDepartments,
      notices, 
      projects, 
      assets, 
      tasks,
      sales,
      milestones,
      loans,
      payrolls,
      payrollBatches,
      salaryRecords,
      orgChartTemplates,
      procurementRequests,
      procurementSettings,
      bankAccounts,
      bankTransfers,
      accountPayments,
      vouchers,
      ledgerGroups,
      ledgers,
      accountBills,
      accountPeople,
      accountInvoices,
      journalEntries,
      companies,
      products,
      loading,
      addEntity,
      updateEntity,
      deleteEntity
    }}>
      {children}
    </CompanyDataContext.Provider>
  );
};

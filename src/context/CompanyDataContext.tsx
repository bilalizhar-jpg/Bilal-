import React, { createContext, useContext, useState, useEffect, ReactNode} from 'react';
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
import { db} from '../firebase';
import { useAuth} from './AuthContext';
import { handleFirestoreError, OperationType} from '../utils/firestoreErrorHandler';

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
 companies: DataEntity[];
 products: DataEntity[];
 salesOrders: DataEntity[];
 quotations: DataEntity[];
 bids: DataEntity[];
 callLogs: DataEntity[];
 tickets: DataEntity[];
 loading: boolean;
 addEntity: (collectionName: string, data: any) => Promise<void>;
 updateEntity: (collectionName: string, id: string, data: any) => Promise<void>;
 deleteEntity: (collectionName: string, id: string) => Promise<void>;
 clearNotices: () => Promise<void>;
}

const CompanyDataContext = createContext<CompanyDataContextType | undefined>(undefined);

export const useCompanyData = () => {
 const context = useContext(CompanyDataContext);
 if (!context) {
 throw new Error('useCompanyData must be used within a CompanyDataProvider');
}
 return context;
};

export const CompanyDataProvider = ({ children}: { children: ReactNode}) => {
  const { user, isFirebaseReady } = useAuth();
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
  const [companies, setCompanies] = useState<DataEntity[]>([]);
  const [products, setProducts] = useState<DataEntity[]>([]);
  const [salesOrders, setSalesOrders] = useState<DataEntity[]>([]);
  const [quotations, setQuotations] = useState<DataEntity[]>([]);
  const [bids, setBids] = useState<DataEntity[]>([]);
  const [callLogs, setCallLogs] = useState<DataEntity[]>([]);
  const [tickets, setTickets] = useState<DataEntity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseReady || !user?.companyId) {
      setLoading(false);
      return;
    }

 const collections = [
 { name: 'awards', setter: setAwards},
 { name: 'departments', setter: setDepartments},
 { name: 'designations', setter: setDesignations},
 { name: 'subDepartments', setter: setSubDepartments},
 { name: 'notices', setter: setNotices},
 { name: 'projects', setter: setProjects},
 { name: 'assets', setter: setAssets},
 { name: 'tasks', setter: setTasks},
 { name: 'sales', setter: setSales},
 { name: 'milestones', setter: setMilestones},
 { name: 'loans', setter: setLoans},
 { name: 'payrolls', setter: setPayrolls},
 { name: 'payrollBatches', setter: setPayrollBatches},
 { name: 'salaryRecords', setter: setSalaryRecords},
 { name: 'orgChartTemplates', setter: setOrgChartTemplates},
 { name: 'procurementRequests', setter: setProcurementRequests},
 { name: 'procurementSettings', setter: setProcurementSettings},
 { name: 'crm_companies', setter: setCompanies},
 { name: 'products', setter: setProducts},
 { name: 'salesOrders', setter: setSalesOrders},
 { name: 'quotations', setter: setQuotations},
 { name: 'bids', setter: setBids},
 { name: 'callLogs', setter: setCallLogs},
 { name: 'tickets', setter: setTickets}
 ];

 const unsubscribes = collections.map(({ name, setter}) => {
 let q;
 if (name === 'crm_companies' && user.role === 'superadmin') {
 q = query(collection(db, name));
} else {
 q = query(collection(db, name), where('companyId', '==', user?.currentCompanyId || user?.companyId || 'nonexistent'));
}
 return onSnapshot(q, (snapshot) => {
 const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id} as DataEntity));
 setter(data);
}, (error) => {
 handleFirestoreError(error, OperationType.LIST, name);
});
});

  setLoading(false);
  return () => unsubscribes.forEach(unsub => unsub());
}, [user?.companyId, user?.currentCompanyId, isFirebaseReady]);

 const addEntity = async (collectionName: string, data: any) => {
 const activeCompanyId = user?.currentCompanyId || user?.companyId;
 if (!activeCompanyId) return;
 const id = data.id || Math.random().toString(36).substr(2, 9);
 const entityData = { ...data, id, companyId: activeCompanyId};
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
 console.log("Attempting to delete entity:", collectionName, id);
 try {
 await deleteDoc(doc(db, collectionName, id));
 console.log("Entity deleted successfully");
} catch (error) {
 console.error("Error deleting entity:", error);
 handleFirestoreError(error, OperationType.DELETE, collectionName);
}
};

 const clearNotices = async () => {
 if (!user?.companyId) return;
 try {
 const batch = notices.map(notice => deleteDoc(doc(db, 'notices', notice.id)));
 await Promise.all(batch);
} catch (error) {
 handleFirestoreError(error, OperationType.DELETE, 'notices');
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
 companies,
 products,
 salesOrders,
 quotations,
 bids,
 callLogs,
 tickets,
 loading,
 addEntity,
 updateEntity,
 deleteEntity,
 clearNotices
}}>
 {children}
 </CompanyDataContext.Provider>
 );
};

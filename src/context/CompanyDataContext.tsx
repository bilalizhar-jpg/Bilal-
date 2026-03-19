import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback} from 'react';
import { useAuth} from './AuthContext';
import { api} from '../services/api';

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

  const fetchAllData = useCallback(async () => {
    if (!user?.companyId) return;

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

    try {
      const promises = collections.map(async ({ name, setter }) => {
        const params: any = {};
        if (!(name === 'crm_companies' && user.role === 'superadmin')) {
          params.companyId = user.currentCompanyId || user.companyId;
        }
        const data = await api.get<any[]>(name, params);
        setter(data);
      });
      await Promise.all(promises);
    } catch (error) {
      console.error("Error fetching company data:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.companyId, user?.currentCompanyId, user?.role]);

  useEffect(() => {
    if (!isFirebaseReady || !user?.companyId) {
      setLoading(false);
      return;
    }

    fetchAllData();
    
    // Optional: Poll for updates every 60 seconds
    const interval = setInterval(fetchAllData, 60000);
    return () => clearInterval(interval);
  }, [fetchAllData, isFirebaseReady]);

  const addEntity = async (collectionName: string, data: any) => {
  const activeCompanyId = user?.currentCompanyId || user?.companyId;
  if (!activeCompanyId) return;
  const id = data.id || Math.random().toString(36).substr(2, 9);
  const entityData = { ...data, id, companyId: activeCompanyId};
  try {
  await api.post(collectionName, entityData);
  await fetchAllData();
} catch (error) {
  console.error(`Error adding entity to ${collectionName}:`, error);
}
};

 const updateEntity = async (collectionName: string, id: string, data: any) => {
 try {
 await api.put(collectionName, id, data);
 await fetchAllData();
} catch (error) {
 console.error(`Error updating entity in ${collectionName}:`, error);
}
};

 const deleteEntity = async (collectionName: string, id: string) => {
 try {
 await api.delete(collectionName, id);
 await fetchAllData();
} catch (error) {
 console.error(`Error deleting entity from ${collectionName}:`, error);
}
};

 const clearNotices = async () => {
 if (!user?.companyId) return;
 try {
 const promises = notices.map(notice => api.delete('notices', notice.id));
 await Promise.all(promises);
 await fetchAllData();
} catch (error) {
 console.error("Error clearing notices:", error);
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

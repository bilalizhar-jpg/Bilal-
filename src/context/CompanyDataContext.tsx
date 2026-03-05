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
  subDepartments: DataEntity[];
  notices: DataEntity[];
  projects: DataEntity[];
  assets: DataEntity[];
  tasks: DataEntity[];
  sales: DataEntity[];
  loans: DataEntity[];
  orgChartTemplates: DataEntity[];
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
  const [subDepartments, setSubDepartments] = useState<DataEntity[]>([]);
  const [notices, setNotices] = useState<DataEntity[]>([]);
  const [projects, setProjects] = useState<DataEntity[]>([]);
  const [assets, setAssets] = useState<DataEntity[]>([]);
  const [tasks, setTasks] = useState<DataEntity[]>([]);
  const [sales, setSales] = useState<DataEntity[]>([]);
  const [loans, setLoans] = useState<DataEntity[]>([]);
  const [orgChartTemplates, setOrgChartTemplates] = useState<DataEntity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.companyId) {
      setLoading(false);
      return;
    }

    const collections = [
      { name: 'awards', setter: setAwards },
      { name: 'departments', setter: setDepartments },
      { name: 'subDepartments', setter: setSubDepartments },
      { name: 'notices', setter: setNotices },
      { name: 'projects', setter: setProjects },
      { name: 'assets', setter: setAssets },
      { name: 'tasks', setter: setTasks },
      { name: 'sales', setter: setSales },
      { name: 'loans', setter: setLoans },
      { name: 'orgChartTemplates', setter: setOrgChartTemplates }
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
      subDepartments,
      notices, 
      projects, 
      assets, 
      tasks,
      sales,
      loans,
      orgChartTemplates,
      loading,
      addEntity,
      updateEntity,
      deleteEntity
    }}>
      {children}
    </CompanyDataContext.Provider>
  );
};

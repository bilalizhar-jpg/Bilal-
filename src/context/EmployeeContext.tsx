import React, { createContext, useContext, useState, ReactNode, useEffect} from 'react';
import { useAuth} from './AuthContext';
import { 
 collection, 
 onSnapshot, 
 doc, 
 setDoc, 
 updateDoc, 
 deleteDoc, 
 query,
 where,
 writeBatch
} from 'firebase/firestore';
import { db} from '../firebase';
import { handleFirestoreError, OperationType} from '../utils/firestoreErrorHandler';

export interface CustomField {
 key: string;
 value: string;
}

export interface Employee {
 id: string;
 companyId: string;
 employeeId: string;
 name: string;
 email: string;
 mobile: string;
 dob: string;
 designation: string;
 joiningDate: string;
 status: 'Active' | 'Inactive' | 'Terminated' | 'Resigned';
 bloodGroup: string;
 nationalId: string;
 department: string;
 employeeType: string;
 location: string;
 city: string;
 customFields?: CustomField[];
 avatar?: string;
 salary?: number;
 taxDeduction?: number;
 bankName?: string;
 bankAccountNo?: string;
 modeOfPayment?: string;
 username?: string;
 password?: string;
 rewardPoints?: number;
 isTracked?: boolean;
 allowedMenus?: string[];
 notifications?: string[];
}

interface EmployeeContextType {
 employees: Employee[];
 allEmployees: Employee[];
 addEmployee: (employee: Omit<Employee, 'companyId'>) => void;
 addEmployees: (employees: Omit<Employee, 'companyId'>[]) => void;
 updateEmployee: (id: string, employee: Partial<Employee>) => void;
 deleteEmployee: (id: string) => void;
 regenerateCredentials: (id: string) => void;
 validateEmployee: (username: string, password: string) => Employee | undefined;
 loading: boolean;
}

const EmployeeContext = createContext<EmployeeContextType | undefined>(undefined);

export const useEmployees = () => {
 const context = useContext(EmployeeContext);
 if (!context) {
 throw new Error('useEmployees must be used within an EmployeeProvider');
}
 return context;
};

const generateCredentials = (name: string, employeeId: string) => {
 const username =`${name.split(' ')[0].toLowerCase()}${employeeId}`;
 const password = Math.random().toString(36).slice(-8);
 return { username, password};
};

export const EmployeeProvider = ({ children}: { children: ReactNode}) => {
  const { user, isFirebaseReady } = useAuth();
  const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseReady || !user) {
      setLoading(false);
      return;
    }

    let q;
    if (user.role === 'superadmin') {
      q = query(collection(db, 'employees'));
    } else {
      q = query(collection(db, 'employees'), where('companyId', '==', user.companyId));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const employeesData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Employee));
      setAllEmployees(employeesData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'employees');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.id, user?.companyId, isFirebaseReady]);

 // Filter employees by companyId
 const employees = allEmployees.filter(emp => emp.companyId === user?.companyId);

 const addEmployee = async (employee: Omit<Employee, 'companyId'>) => {
 if (!user?.companyId) return;
 const { username, password} = generateCredentials(employee.name, employee.employeeId);
 const id = employee.id || Date.now().toString();
 const newEmployee: Employee = {
 ...employee,
 id,
 companyId: user.companyId,
 username: employee.username || username,
 password: employee.password || password
};
 
 try {
 await setDoc(doc(db, 'employees', id), newEmployee);
 
 // Trigger welcome message
 fetch(`/api/welcome-messages/${user.companyId}/trigger`, {
 method: 'POST',
 headers: { 'Content-Type': 'application/json'},
 body: JSON.stringify({ employee: newEmployee})
}).catch(err => console.error('Error triggering welcome message:', err));

} catch (error) {
 console.error("Error adding employee:", error);
}
};

 const addEmployees = async (newEmployees: Omit<Employee, 'companyId'>[]) => {
 if (!user?.companyId) return;
 const batch = writeBatch(db);
 const addedEmployees: Employee[] = [];
 
 newEmployees.forEach(emp => {
 const { username, password} = generateCredentials(emp.name, emp.employeeId);
 const id = emp.id || Math.random().toString(36).substr(2, 9);
 const employeeData: Employee = {
 ...emp,
 id,
 companyId: user.companyId!,
 username: emp.username || username,
 password: emp.password || password
};
 addedEmployees.push(employeeData);
 const ref = doc(db, 'employees', id);
 batch.set(ref, employeeData);
});

 try {
 await batch.commit();
 
 // Trigger welcome messages for all new employees
 addedEmployees.forEach(emp => {
 fetch(`/api/welcome-messages/${user.companyId}/trigger`, {
 method: 'POST',
 headers: { 'Content-Type': 'application/json'},
 body: JSON.stringify({ employee: emp})
}).catch(err => console.error('Error triggering welcome message:', err));
});

} catch (error) {
 console.error("Error adding multiple employees:", error);
}
};

 const updateEmployee = async (id: string, updatedFields: Partial<Employee>) => {
 try {
 await updateDoc(doc(db, 'employees', id), updatedFields as any);
} catch (error) {
 console.error("Error updating employee:", error);
}
};

 const deleteEmployee = async (id: string) => {
 try {
 await deleteDoc(doc(db, 'employees', id));
} catch (error) {
 console.error("Error deleting employee:", error);
}
};

 const regenerateCredentials = async (id: string) => {
 const emp = allEmployees.find(e => e.id === id);
 if (!emp) return;

 const { username, password} = generateCredentials(emp.name, emp.employeeId);
 try {
 await updateDoc(doc(db, 'employees', id), { username, password});
} catch (error) {
 console.error("Error regenerating credentials:", error);
}
};

 const validateEmployee = (username: string, password: string) => {
 return allEmployees.find(emp => 
 (emp.username === username || emp.email === username) && emp.password === password
 );
};

 return (
 <EmployeeContext.Provider value={{ employees, allEmployees, addEmployee, addEmployees, updateEmployee, deleteEmployee, regenerateCredentials, validateEmployee, loading}}>
 {children}
 </EmployeeContext.Provider>
 );
};

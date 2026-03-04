import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';

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
  country: string;
  gender: string;
  maritalStatus: string;
  customFields?: CustomField[];
  avatar?: string;
  salary?: number;
  taxDeduction?: number;
  bankName?: string;
  bankAccountNo?: string;
  modeOfPayment?: string;
  username?: string;
  password?: string;
}

interface EmployeeContextType {
  employees: Employee[];
  addEmployee: (employee: Omit<Employee, 'companyId'>) => void;
  addEmployees: (employees: Omit<Employee, 'companyId'>[]) => void;
  updateEmployee: (id: string, employee: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;
  regenerateCredentials: (id: string) => void;
  validateEmployee: (username: string, password: string) => Employee | undefined;
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
  const username = `${name.split(' ')[0].toLowerCase()}${employeeId}`;
  const password = Math.random().toString(36).slice(-8);
  return { username, password };
};

export const EmployeeProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [allEmployees, setAllEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem('employees');
    if (saved) {
      return JSON.parse(saved);
    }
    return [];
  });

  // Filter employees by companyId
  const employees = allEmployees.filter(emp => emp.companyId === user?.companyId);

  // Save to localStorage whenever allEmployees change
  React.useEffect(() => {
    localStorage.setItem('employees', JSON.stringify(allEmployees));
  }, [allEmployees]);

  const addEmployee = (employee: Omit<Employee, 'companyId'>) => {
    if (!user?.companyId) return;
    const { username, password } = generateCredentials(employee.name, employee.employeeId);
    const newEmployee: Employee = {
      ...employee,
      companyId: user.companyId,
      username: employee.username || username,
      password: employee.password || password
    };
    setAllEmployees((prev) => [...prev, newEmployee]);
  };

  const addEmployees = (newEmployees: Omit<Employee, 'companyId'>[]) => {
    if (!user?.companyId) return;
    const employeesWithCredentials = newEmployees.map(emp => {
      const { username, password } = generateCredentials(emp.name, emp.employeeId);
      return {
        ...emp,
        companyId: user.companyId!,
        username: emp.username || username,
        password: emp.password || password
      };
    });
    setAllEmployees((prev) => [...prev, ...employeesWithCredentials]);
  };

  const updateEmployee = (id: string, updatedFields: Partial<Employee>) => {
    setAllEmployees((prev) =>
      prev.map((emp) => (emp.id === id ? { ...emp, ...updatedFields } : emp))
    );
  };

  const deleteEmployee = (id: string) => {
    setAllEmployees((prev) => prev.filter((emp) => emp.id !== id));
  };

  const regenerateCredentials = (id: string) => {
    setAllEmployees((prev) => prev.map(emp => {
      if (emp.id === id) {
        const { username, password } = generateCredentials(emp.name, emp.employeeId);
        return { ...emp, username, password };
      }
      return emp;
    }));
  };

  const validateEmployee = (username: string, password: string) => {
    return allEmployees.find(emp => 
      (emp.username === username || emp.email === username) && emp.password === password
    );
  };

  return (
    <EmployeeContext.Provider value={{ employees, addEmployee, addEmployees, updateEmployee, deleteEmployee, regenerateCredentials, validateEmployee }}>
      {children}
    </EmployeeContext.Provider>
  );
};

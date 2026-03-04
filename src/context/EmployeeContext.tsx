import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface CustomField {
  key: string;
  value: string;
}

export interface Employee {
  id: string;
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
  addEmployee: (employee: Employee) => void;
  addEmployees: (employees: Employee[]) => void;
  updateEmployee: (id: string, employee: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;
  regenerateCredentials: (id: string) => void;
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
  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem('employees');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Cleanup: Remove "Test Candidate" if it exists in saved data
      return parsed.filter((emp: Employee) => emp.name !== 'Test Candidate');
    }
    return [
    { 
      id: '1', 
      employeeId: '000031', 
      name: 'Babara Patel', 
      email: 'babara@gmail.com', 
      mobile: '+25670268239', 
      dob: '1990-05-15', 
      designation: 'Manager', 
      joiningDate: '2023-01-10', 
      status: 'Active', 
      bloodGroup: 'A+', 
      nationalId: '123456789', 
      department: 'Electrical', 
      employeeType: 'Full Time', 
      country: 'USA', 
      gender: 'Female', 
      maritalStatus: 'Single', 
      customFields: [], 
      avatar: 'https://picsum.photos/seed/babara/40/40',
      salary: 5000,
      taxDeduction: 10,
      bankName: 'Chase Bank',
      bankAccountNo: '1234567890',
      modeOfPayment: 'Bank Transfer',
      username: 'babara000031',
      password: 'password123'
    },
    { 
      id: '3', 
      employeeId: '000029', 
      name: 'Ch. Monalisa Subudhi', 
      email: 'monalisasubudhi091@gmail.com', 
      mobile: '7787890451', 
      dob: '1992-11-30', 
      designation: 'Designer', 
      joiningDate: '2023-03-01', 
      status: 'Active', 
      bloodGroup: 'O+', 
      nationalId: '456789123', 
      department: 'Electrical', 
      employeeType: 'Full Time', 
      country: 'India', 
      gender: 'Female', 
      maritalStatus: 'Single', 
      customFields: [], 
      avatar: 'https://picsum.photos/seed/monalisa/40/40',
      salary: 3500,
      taxDeduction: 5,
      bankName: 'HDFC Bank',
      bankAccountNo: '1122334455',
      modeOfPayment: 'Bank Transfer',
      username: 'monalisa000029',
      password: 'password123'
    },
    { 
      id: '4', 
      employeeId: '000028', 
      name: 'Mohmed Afif Akram', 
      email: 'mohaafif@gmail.com', 
      mobile: '26523333', 
      dob: '1988-03-12', 
      designation: 'Lead', 
      joiningDate: '2023-01-05', 
      status: 'Active', 
      bloodGroup: 'AB+', 
      nationalId: '789123456', 
      department: 'Production', 
      employeeType: 'Full Time', 
      country: 'UAE', 
      gender: 'Male', 
      maritalStatus: 'Married', 
      customFields: [], 
      avatar: 'https://picsum.photos/seed/mohmed/40/40',
      salary: 6000,
      taxDeduction: 0,
      bankName: 'Emirates NBD',
      bankAccountNo: '9988776655',
      modeOfPayment: 'Bank Transfer',
      username: 'mohmed000028',
      password: 'password123'
    },
    { 
      id: '5', 
      employeeId: '000027', 
      name: 'Uma Stafford', 
      email: 'nocunocu@mailinator.com', 
      mobile: '+1(617)434-2319', 
      dob: '1993-07-25', 
      designation: 'Analyst', 
      joiningDate: '2023-04-10', 
      status: 'Active', 
      bloodGroup: 'A-', 
      nationalId: '321654987', 
      department: 'Electrical', 
      employeeType: 'Part Time', 
      country: 'Canada', 
      gender: 'Female', 
      maritalStatus: 'Single', 
      customFields: [], 
      avatar: 'https://picsum.photos/seed/uma/40/40',
      salary: 2500,
      taxDeduction: 15,
      bankName: 'RBC',
      bankAccountNo: '5544332211',
      modeOfPayment: 'Cheque',
      username: 'uma000027',
      password: 'password123'
    },
    { 
      id: '6', 
      employeeId: '000026', 
      name: 'Khubaib Ahmed', 
      email: 'khubaib@gmail.com', 
      mobile: '0300-1234567', 
      dob: '1991-09-18', 
      designation: 'Engineer', 
      joiningDate: '2023-05-20', 
      status: 'Inactive', 
      bloodGroup: 'B-', 
      nationalId: '654987321', 
      department: 'Electrical', 
      employeeType: 'Full Time', 
      country: 'Pakistan', 
      gender: 'Male', 
      maritalStatus: 'Married', 
      customFields: [], 
      avatar: 'https://picsum.photos/seed/khubaib/40/40',
      salary: 1500,
      taxDeduction: 2,
      bankName: 'HBL',
      bankAccountNo: '6677889900',
      modeOfPayment: 'Cash',
      username: 'khubaib000026',
      password: 'password123'
    },
  ];
  });

  // Save to localStorage whenever employees change
  React.useEffect(() => {
    localStorage.setItem('employees', JSON.stringify(employees));
  }, [employees]);

  const addEmployee = (employee: Employee) => {
    const { username, password } = generateCredentials(employee.name, employee.employeeId);
    const newEmployee = {
      ...employee,
      username: employee.username || username,
      password: employee.password || password
    };
    setEmployees((prev) => [...prev, newEmployee]);
  };

  const addEmployees = (newEmployees: Employee[]) => {
    const employeesWithCredentials = newEmployees.map(emp => {
      const { username, password } = generateCredentials(emp.name, emp.employeeId);
      return {
        ...emp,
        username: emp.username || username,
        password: emp.password || password
      };
    });
    setEmployees((prev) => [...prev, ...employeesWithCredentials]);
  };

  const updateEmployee = (id: string, updatedFields: Partial<Employee>) => {
    setEmployees((prev) =>
      prev.map((emp) => (emp.id === id ? { ...emp, ...updatedFields } : emp))
    );
  };

  const deleteEmployee = (id: string) => {
    console.log("Deleting employee with id:", id);
    setEmployees((prev) => {
      const newEmployees = prev.filter((emp) => emp.id !== id);
      console.log("New employees list:", newEmployees);
      return newEmployees;
    });
  };

  const regenerateCredentials = (id: string) => {
    setEmployees((prev) => prev.map(emp => {
      if (emp.id === id) {
        const { username, password } = generateCredentials(emp.name, emp.employeeId);
        return { ...emp, username, password };
      }
      return emp;
    }));
  };

  return (
    <EmployeeContext.Provider value={{ employees, addEmployee, addEmployees, updateEmployee, deleteEmployee, regenerateCredentials }}>
      {children}
    </EmployeeContext.Provider>
  );
};

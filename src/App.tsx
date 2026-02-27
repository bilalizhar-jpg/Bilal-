/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import Attendance from './pages/Attendance';
import AwardList from './pages/AwardList';
import DepartmentList from './pages/DepartmentList';
import SubDepartmentList from './pages/SubDepartmentList';
import EmployeeList from './pages/EmployeeList';
import LeaveManagement from './pages/LeaveManagement';
import LoanManagement from './pages/LoanManagement';
import ManageSalary from './pages/payroll/ManageSalary';
import SalaryAdvance from './pages/payroll/SalaryAdvance';
import SalaryGenerate from './pages/payroll/SalaryGenerate';
import SalesTaxFormat from './pages/payroll/SalesTaxFormat';
import { AnimatePresence } from 'motion/react';

function AppContent() {
  const location = useLocation();
  const isAuthPage = [
    '/login', 
    '/register', 
    '/dashboard', 
    '/attendance', 
    '/award', 
    '/department', 
    '/sub-department', 
    '/employee', 
    '/leave', 
    '/loan', 
    '/notice',
    '/payroll/salary-advance',
    '/payroll/salary-generate',
    '/payroll/manage-salary',
    '/payroll/sales-tax'
  ].includes(location.pathname);

  return (
    <>
      {!isAuthPage && <Navbar />}
      <AnimatePresence mode="wait">
        <div key={location.pathname}>
          <Routes location={location}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/award" element={<AwardList />} />
            <Route path="/department" element={<DepartmentList />} />
            <Route path="/sub-department" element={<SubDepartmentList />} />
            <Route path="/employee" element={<EmployeeList />} />
            <Route path="/leave" element={<LeaveManagement />} />
            <Route path="/loan" element={<LoanManagement />} />
            <Route path="/notice" element={<NoticeBoard />} />
            <Route path="/payroll/salary-advance" element={<SalaryAdvance />} />
            <Route path="/payroll/salary-generate" element={<SalaryGenerate />} />
            <Route path="/payroll/manage-salary" element={<ManageSalary />} />
            <Route path="/payroll/sales-tax" element={<SalesTaxFormat />} />
          </Routes>
        </div>
      </AnimatePresence>
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}


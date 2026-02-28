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
import NoticeBoard from './pages/NoticeBoard';
import ManageSalary from './pages/payroll/ManageSalary';
import SalaryAdvance from './pages/payroll/SalaryAdvance';
import SalaryGenerate from './pages/payroll/SalaryGenerate';
import SalesTaxFormat from './pages/payroll/SalesTaxFormat';
import CompanyPayroll from './pages/payroll/CompanyPayroll';
import PerformanceAppraisalList from './pages/performance/PerformanceAppraisalList';
import PerformanceAppraisalReport from './pages/performance/PerformanceAppraisalReport';
import ProcurementRequest from './pages/procurement/ProcurementRequest';
import AssetManagement from './pages/assets/AssetManagement';
import ProjectManagement from './pages/project-management/ProjectManagement';
import CareerPage from './pages/CareerPage';
import CareerPageSettings from './pages/recruitment/CareerPageSettings';
import JobPosting from './pages/recruitment/JobPosting';
import JobsList from './pages/recruitment/JobsList';
import JobCandidates from './pages/recruitment/JobCandidates';
import SearchCandidate from './pages/recruitment/SearchCandidate';
import BulkCVUpload from './pages/recruitment/BulkCVUpload';
import OfferLetters from './pages/recruitment/OfferLetters';
import Agreements from './pages/recruitment/Agreements';
import CustomDesign from './pages/recruitment/CustomDesign';
import Messages from './pages/messages/Messages';
import { AnimatePresence } from 'motion/react';

function AppContent() {
  const location = useLocation();
  const isAuthPage = location.pathname !== '/' && location.pathname !== '/careers';

  return (
    <>
      {!isAuthPage && <Navbar />}
      <AnimatePresence mode="wait">
        <div key={location.pathname}>
          <Routes location={location}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/careers" element={<CareerPage />} />
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
            <Route path="/payroll/company-payroll" element={<CompanyPayroll />} />
            <Route path="/performance/appraisal-list" element={<PerformanceAppraisalList />} />
            <Route path="/performance/appraisal-report" element={<PerformanceAppraisalReport />} />
            <Route path="/procurement/request" element={<ProcurementRequest />} />
            <Route path="/assets/management" element={<AssetManagement />} />
            <Route path="/project-management" element={<ProjectManagement />} />
            <Route path="/recruitment/career-page-settings" element={<CareerPageSettings />} />
            <Route path="/recruitment/job-posting" element={<JobPosting />} />
            <Route path="/recruitment/jobs-list" element={<JobsList />} />
            <Route path="/recruitment/jobs/:jobId/candidates" element={<JobCandidates />} />
            <Route path="/recruitment/search-candidates" element={<SearchCandidate />} />
            <Route path="/recruitment/bulk-cv-upload" element={<BulkCVUpload />} />
            <Route path="/recruitment/offer-letters" element={<OfferLetters />} />
            <Route path="/recruitment/agreements" element={<Agreements />} />
            <Route path="/recruitment/custom-design" element={<CustomDesign />} />
            <Route path="/message" element={<Messages />} />
            <Route path="*" element={<Dashboard />} />
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


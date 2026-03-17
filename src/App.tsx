/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import EmployeeLoginPage from './pages/EmployeeLoginPage';
import Dashboard from './pages/Dashboard';
import Attendance from './pages/Attendance';
import AwardList from './pages/AwardList';
import DepartmentList from './pages/DepartmentList';
import DesignationList from './pages/DesignationList';
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
import KPIs from './pages/performance/KPIs';
import Training from './pages/performance/Training';
import ProcurementRequest from './pages/procurement/ProcurementRequest';
import ProcurementReceived from './pages/procurement/ProcurementReceived';
import ProcurementHistory from './pages/procurement/ProcurementHistory';
import ProcurementSettings from './pages/procurement/ProcurementSettings';
import AssetManagement from './pages/assets/AssetManagement';
import ProjectManagement from './pages/project-management/ProjectManagement';
import Milestones from './pages/project-management/Milestones';
import ProjectReports from './pages/project-management/ProjectReports';
import BidderDetails from './pages/project-management/BidderDetails';
import CareerPage from './pages/CareerPage';
import ApplyPage from './pages/ApplyPage';
import Reports from './pages/Reports';
import RewardPoints from './pages/RewardPoints';
import CareerPageSettings from './pages/recruitment/CareerPageSettings';
import JobPosting from './pages/recruitment/JobPosting';
import JobsList from './pages/recruitment/JobsList';
import ViewPostedJobs from './pages/recruitment/ViewPostedJobs';
import JobCandidates from './pages/recruitment/JobCandidates';
import SearchCandidate from './pages/recruitment/SearchCandidate';
import BulkCVUpload from './pages/recruitment/BulkCVUpload';
import OfferLetters from './pages/recruitment/OfferLetters';
import Agreements from './pages/recruitment/Agreements';
import CustomDesign from './pages/recruitment/CustomDesign';
import Messages from './pages/messages/Messages';
import EmailLists from './pages/marketing/EmailLists';
import Campaigns from './pages/marketing/Campaigns';
import CreateTemplate from './pages/marketing/CreateTemplate';
import SendCampaign from './pages/marketing/SendCampaign';
import CampaignLogs from './pages/marketing/CampaignLogs';
import RoleManagement from './pages/settings/RoleManagement';
import Permissions from './pages/settings/Permissions';
import SetupRules from './pages/settings/SetupRules';
import GeneralSettings from './pages/settings/GeneralSettings';
import GmailIntegration from './pages/settings/GmailIntegration';
import WhatsAppIntegration from './pages/settings/WhatsAppIntegration';
import OAuthCallback from './pages/OAuthCallback';
import Companies from './pages/crm/Companies';
import AddCompany from './pages/crm/AddCompany';
import Products from './pages/crm/Products';
import AddProduct from './pages/crm/AddProduct';
import ProductDetails from './pages/crm/ProductDetails';
import Opportunities from './pages/crm/Opportunities';
import AddOpportunity from './pages/crm/AddOpportunity';
import SalesTarget from './pages/crm/SalesTarget';
import Quotations from './pages/crm/Quotations';
import SalesOrders from './pages/crm/SalesOrders';
import CallLogs from './pages/crm/CallLogs';
import Ticketing from './pages/crm/Ticketing';
import TicketingHistoryReport from './pages/crm/TicketingHistoryReport';
import TimeTracker from './pages/TimeTracker';
import OrgChart from './pages/OrgChart';
import CompanyPolicies from './pages/CompanyPolicies';
import LetterManagement from './pages/letters/LetterManagement';
import SuperAdminDashboard from './pages/super-admin/Dashboard';
import CompanyManagement from './pages/super-admin/CompanyManagement';
import SubscriptionPlans from './pages/super-admin/SubscriptionPlans';
import EmployeePermissions from './pages/super-admin/EmployeePermissions';
import SuperAdminInvoiceGenerator from './pages/super-admin/InvoiceGenerator';
import { SuperAdminProvider } from './context/SuperAdminContext';
import AccountingDashboard from './pages/accounting/Dashboard';
import ChartOfAccounts from './pages/accounting/ChartOfAccounts';
import JournalEntries from './pages/accounting/JournalEntries';
import FiscalYears from './pages/accounting/FiscalYears';
import Customers from './pages/accounting/Customers';
import Invoices from './pages/accounting/Invoices';
import Payments from './pages/accounting/Payments';
import Vendors from './pages/accounting/Vendors';
import Expenses from './pages/accounting/Expenses';
import Bills from './pages/accounting/Bills';
import BankAccounts from './pages/accounting/BankAccounts';
import BankTransactions from './pages/accounting/BankTransactions';
import BankReconciliation from './pages/accounting/BankReconciliation';
import FinancialSettings from './pages/accounting/settings/FinancialSettings';
import TaxSettings from './pages/accounting/settings/TaxSettings';
import NumberSequences from './pages/accounting/settings/NumberSequences';
import GeneralLedger from './pages/accounting/reports/GeneralLedger';
import TrialBalance from './pages/accounting/reports/TrialBalance';
import IncomeStatement from './pages/accounting/reports/IncomeStatement';
import BalanceSheet from './pages/accounting/reports/BalanceSheet';
import CashFlow from './pages/accounting/reports/CashFlow';
import EmployeeDashboard from './pages/employee-portal/Dashboard';
import EmployeeAttendance from './pages/employee-portal/Attendance';
import EmployeeLeaves from './pages/employee-portal/Leaves';
import EmployeePayroll from './pages/employee-portal/Payroll';
import EmployeeNotices from './pages/employee-portal/Notices';
import EmployeeProjects from './pages/employee-portal/Projects';
import EmployeeProcurement from './pages/employee-portal/Procurement';
import EmployeeProcurementHistory from './pages/employee-portal/ProcurementHistory';
import EmployeeRecruitment from './pages/employee-portal/Recruitment';
import EmployeeMarketing from './pages/employee-portal/Marketing';
import EmployeeMessages from './pages/employee-portal/Messages';
import EmployeeTraining from './pages/employee-portal/EmployeeTraining';
import EmployeeCompanyPolicies from './pages/employee-portal/CompanyPolicies';
import { AnimatePresence, motion } from 'motion/react';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { db } from './firebase';
import { doc, getDocFromServer } from 'firebase/firestore';
import { EmployeeProvider } from './context/EmployeeContext';
import { AttendanceProvider } from './context/AttendanceContext';
import { TimeTrackingProvider } from './context/TimeTrackingContext';
import { LeaveProvider } from './context/LeaveContext';
import { PolicyProvider } from './context/PolicyContext';
import { LetterProvider } from './context/LetterContext';
import { CompanyDataProvider } from './context/CompanyDataContext';
import { ChatProvider } from './context/ChatContext';
import { MarketingProvider } from './context/MarketingContext';
import { TrainingProvider } from './context/TrainingContext';
import { SettingsProvider } from './context/SettingsContext';
import { AccountingProvider } from './context/AccountingContext';
import { CustomerProvider } from './context/CustomerContext';
import { InvoiceProvider } from './context/InvoiceContext';
import { PaymentProvider } from './context/PaymentContext';
import { VendorProvider } from './context/VendorContext';
import { ExpenseProvider } from './context/ExpenseContext';
import { BillProvider } from './context/BillContext';
import { BankProvider } from './context/BankContext';
import { AuditProvider } from './context/AuditContext';
import AuditLogs from './pages/settings/AuditLogs';

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Firestore connection successful");
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration. The client is offline.");
    }
  }
}

testConnection();

function AppContent() {
  const location = useLocation();
  const { isFirebaseReady } = useAuth();
  const isAuthPage = location.pathname !== '/' && location.pathname !== '/careers';

  if (!isFirebaseReady) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#020203] relative overflow-hidden">
        {/* Atmospheric Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] animate-pulse delay-700" />
        </div>

        <div className="relative z-10 flex flex-col items-center">
          <motion.div 
            animate={{ 
              rotate: 360,
              scale: [1, 1.1, 1],
            }}
            transition={{ 
              rotate: { duration: 2, repeat: Infinity, ease: "linear" },
              scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
            }}
            className="w-16 h-16 border-t-2 border-r-2 border-indigo-500 rounded-full shadow-[0_0_20px_rgba(99,102,241,0.3)]"
          />
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8 text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400/60"
          >
            Initializing Systems
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <>
      {!isAuthPage && <Navbar />}
      <AnimatePresence mode="wait">
        <div key={location.pathname}>
          <Routes location={location}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/careers" element={<CareerPage />} />
            <Route path="/careers/:companyId" element={<CareerPage />} />
            <Route path="/careers/:companyId/apply/:jobId" element={<ApplyPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/auth/callback" element={<OAuthCallback />} />
            <Route path="/employee-login" element={<EmployeeLoginPage />} />
            
            {/* Admin Routes */}
            <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><Dashboard /></ProtectedRoute>} />
            <Route path="/time-tracker" element={<ProtectedRoute allowedRoles={['admin']}><TimeTracker /></ProtectedRoute>} />
            <Route path="/org-chart" element={<ProtectedRoute allowedRoles={['admin']}><OrgChart /></ProtectedRoute>} />
            <Route path="/org-chart/policies" element={<ProtectedRoute allowedRoles={['admin']}><CompanyPolicies /></ProtectedRoute>} />
            
            {/* Onboarding Routes */}
            <Route path="/onboarding/offer-letter" element={<ProtectedRoute allowedRoles={['admin']}><LetterManagement /></ProtectedRoute>} />
            <Route path="/onboarding/contact-letter" element={<ProtectedRoute allowedRoles={['admin']}><LetterManagement /></ProtectedRoute>} />
            <Route path="/onboarding/warning-letter" element={<ProtectedRoute allowedRoles={['admin']}><LetterManagement /></ProtectedRoute>} />
            <Route path="/onboarding/termination-letter" element={<ProtectedRoute allowedRoles={['admin']}><LetterManagement /></ProtectedRoute>} />
            <Route path="/onboarding/complaint-letter" element={<ProtectedRoute allowedRoles={['admin']}><LetterManagement /></ProtectedRoute>} />
            <Route path="/onboarding/custom-letter" element={<ProtectedRoute allowedRoles={['admin']}><LetterManagement /></ProtectedRoute>} />

            {/* Offboarding Routes */}
            <Route path="/offboarding/warning-letter" element={<ProtectedRoute allowedRoles={['admin']}><LetterManagement /></ProtectedRoute>} />
            <Route path="/offboarding/resignation-letter" element={<ProtectedRoute allowedRoles={['admin']}><LetterManagement /></ProtectedRoute>} />
            <Route path="/offboarding/termination-letter" element={<ProtectedRoute allowedRoles={['admin']}><LetterManagement /></ProtectedRoute>} />
            <Route path="/offboarding/complaint-letter" element={<ProtectedRoute allowedRoles={['admin']}><LetterManagement /></ProtectedRoute>} />
            <Route path="/offboarding/custom-letter" element={<ProtectedRoute allowedRoles={['admin']}><LetterManagement /></ProtectedRoute>} />

            <Route path="/attendance" element={<ProtectedRoute allowedRoles={['admin']}><Attendance /></ProtectedRoute>} />
            <Route path="/award" element={<ProtectedRoute allowedRoles={['admin']}><AwardList /></ProtectedRoute>} />
            <Route path="/department" element={<ProtectedRoute allowedRoles={['admin']}><DepartmentList /></ProtectedRoute>} />
            <Route path="/designation" element={<ProtectedRoute allowedRoles={['admin']}><DesignationList /></ProtectedRoute>} />
            <Route path="/sub-department" element={<ProtectedRoute allowedRoles={['admin']}><SubDepartmentList /></ProtectedRoute>} />
            <Route path="/employee" element={<ProtectedRoute allowedRoles={['admin']}><EmployeeList /></ProtectedRoute>} />
            <Route path="/leave" element={<ProtectedRoute allowedRoles={['admin']}><LeaveManagement /></ProtectedRoute>} />
            <Route path="/loan" element={<ProtectedRoute allowedRoles={['admin']}><LoanManagement /></ProtectedRoute>} />
            <Route path="/notice" element={<ProtectedRoute allowedRoles={['admin']}><NoticeBoard /></ProtectedRoute>} />
            <Route path="/payroll/salary-advance" element={<ProtectedRoute allowedRoles={['admin']}><SalaryAdvance /></ProtectedRoute>} />
            <Route path="/payroll/salary-generate" element={<ProtectedRoute allowedRoles={['admin']}><SalaryGenerate /></ProtectedRoute>} />
            <Route path="/payroll/manage-salary" element={<ProtectedRoute allowedRoles={['admin']}><ManageSalary /></ProtectedRoute>} />
            <Route path="/payroll/sales-tax" element={<ProtectedRoute allowedRoles={['admin']}><SalesTaxFormat /></ProtectedRoute>} />
            <Route path="/payroll/company-payroll" element={<ProtectedRoute allowedRoles={['admin']}><CompanyPayroll /></ProtectedRoute>} />
            <Route path="/performance/kpis" element={<ProtectedRoute allowedRoles={['admin']}><KPIs /></ProtectedRoute>} />
            <Route path="/performance/appraisal-list" element={<ProtectedRoute allowedRoles={['admin']}><PerformanceAppraisalList /></ProtectedRoute>} />
            <Route path="/performance/appraisal-report" element={<ProtectedRoute allowedRoles={['admin']}><PerformanceAppraisalReport /></ProtectedRoute>} />
            <Route path="/performance/training" element={<ProtectedRoute allowedRoles={['admin']}><Training /></ProtectedRoute>} />
            <Route path="/procurement/request" element={<ProtectedRoute allowedRoles={['admin']}><ProcurementRequest /></ProtectedRoute>} />
            <Route path="/procurement/received" element={<ProtectedRoute allowedRoles={['admin']}><ProcurementReceived /></ProtectedRoute>} />
            <Route path="/procurement/history" element={<ProtectedRoute allowedRoles={['admin']}><ProcurementHistory /></ProtectedRoute>} />
            <Route path="/procurement/settings" element={<ProtectedRoute allowedRoles={['admin']}><ProcurementSettings /></ProtectedRoute>} />
            <Route path="/assets/management" element={<ProtectedRoute allowedRoles={['admin']}><AssetManagement /></ProtectedRoute>} />
            <Route path="/project-management" element={<ProtectedRoute allowedRoles={['admin']}><ProjectManagement /></ProtectedRoute>} />
            <Route path="/project-management/milestones" element={<ProtectedRoute allowedRoles={['admin']}><Milestones /></ProtectedRoute>} />
            <Route path="/project-management/reports" element={<ProtectedRoute allowedRoles={['admin']}><ProjectReports /></ProtectedRoute>} />
            <Route path="/project-management/bidder-details" element={<ProtectedRoute allowedRoles={['admin']}><BidderDetails /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute allowedRoles={['admin']}><Reports /></ProtectedRoute>} />
            <Route path="/reward-points" element={<ProtectedRoute allowedRoles={['admin']}><RewardPoints /></ProtectedRoute>} />
            <Route path="/recruitment/career-page-settings" element={<ProtectedRoute allowedRoles={['admin']}><CareerPageSettings /></ProtectedRoute>} />
            <Route path="/recruitment/job-posting" element={<ProtectedRoute allowedRoles={['admin']}><JobPosting /></ProtectedRoute>} />
            <Route path="/recruitment/jobs-list" element={<ProtectedRoute allowedRoles={['admin']}><JobsList /></ProtectedRoute>} />
            <Route path="/recruitment/view-posted-jobs" element={<ProtectedRoute allowedRoles={['admin']}><ViewPostedJobs /></ProtectedRoute>} />
            <Route path="/recruitment/jobs/:jobId/candidates" element={<ProtectedRoute allowedRoles={['admin']}><JobCandidates /></ProtectedRoute>} />
            <Route path="/recruitment/search-candidates" element={<ProtectedRoute allowedRoles={['admin']}><SearchCandidate /></ProtectedRoute>} />
            <Route path="/recruitment/bulk-cv-upload" element={<ProtectedRoute allowedRoles={['admin']}><BulkCVUpload /></ProtectedRoute>} />
            <Route path="/recruitment/offer-letters" element={<ProtectedRoute allowedRoles={['admin']}><OfferLetters /></ProtectedRoute>} />
            <Route path="/recruitment/agreements" element={<ProtectedRoute allowedRoles={['admin']}><Agreements /></ProtectedRoute>} />
            <Route path="/recruitment/custom-design" element={<ProtectedRoute allowedRoles={['admin']}><CustomDesign /></ProtectedRoute>} />
            <Route path="/message" element={<ProtectedRoute allowedRoles={['admin']}><Messages /></ProtectedRoute>} />
            <Route path="/marketing/lists" element={<ProtectedRoute allowedRoles={['admin']}><EmailLists /></ProtectedRoute>} />
            <Route path="/marketing/campaigns" element={<ProtectedRoute allowedRoles={['admin']}><Campaigns /></ProtectedRoute>} />
            <Route path="/marketing/templates" element={<ProtectedRoute allowedRoles={['admin']}><CreateTemplate /></ProtectedRoute>} />
            <Route path="/marketing/send-campaign" element={<ProtectedRoute allowedRoles={['admin']}><SendCampaign /></ProtectedRoute>} />
            <Route path="/marketing/logs" element={<ProtectedRoute allowedRoles={['admin']}><CampaignLogs /></ProtectedRoute>} />
            <Route path="/role-management" element={<ProtectedRoute allowedRoles={['admin']}><RoleManagement /></ProtectedRoute>} />
            <Route path="/permissions" element={<ProtectedRoute allowedRoles={['admin']}><Permissions /></ProtectedRoute>} />
            <Route path="/setup-rules" element={<ProtectedRoute allowedRoles={['admin']}><SetupRules /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute allowedRoles={['admin']}><GeneralSettings /></ProtectedRoute>} />
            <Route path="/settings/audit-logs" element={<ProtectedRoute allowedRoles={['admin']}><AuditLogs /></ProtectedRoute>} />
            <Route path="/settings/gmail-integration" element={<ProtectedRoute allowedRoles={['admin']}><GmailIntegration /></ProtectedRoute>} />
            <Route path="/settings/whatsapp-integration" element={<ProtectedRoute allowedRoles={['admin']}><WhatsAppIntegration /></ProtectedRoute>} />
            <Route path="/crm/companies" element={<ProtectedRoute allowedRoles={['admin']}><Companies /></ProtectedRoute>} />
            <Route path="/crm/companies/add" element={<ProtectedRoute allowedRoles={['admin']}><AddCompany /></ProtectedRoute>} />
            <Route path="/crm/companies/edit/:id" element={<ProtectedRoute allowedRoles={['admin']}><AddCompany /></ProtectedRoute>} />
            <Route path="/crm/products" element={<ProtectedRoute allowedRoles={['admin']}><Products /></ProtectedRoute>} />
            <Route path="/crm/products/add" element={<ProtectedRoute allowedRoles={['admin']}><AddProduct /></ProtectedRoute>} />
            <Route path="/crm/products/:id" element={<ProtectedRoute allowedRoles={['admin']}><ProductDetails /></ProtectedRoute>} />
            <Route path="/crm/opportunities" element={<ProtectedRoute allowedRoles={['admin']}><Opportunities /></ProtectedRoute>} />
            <Route path="/crm/opportunities/add" element={<ProtectedRoute allowedRoles={['admin']}><AddOpportunity /></ProtectedRoute>} />
            <Route path="/crm/opportunities/edit/:id" element={<ProtectedRoute allowedRoles={['admin']}><AddOpportunity /></ProtectedRoute>} />
            <Route path="/crm/sales-target" element={<ProtectedRoute allowedRoles={['admin']}><SalesTarget /></ProtectedRoute>} />
            <Route path="/crm/quotations" element={<ProtectedRoute allowedRoles={['admin']}><Quotations /></ProtectedRoute>} />
            <Route path="/crm/sales-orders" element={<ProtectedRoute allowedRoles={['admin']}><SalesOrders /></ProtectedRoute>} />
            <Route path="/crm/call-logs" element={<ProtectedRoute allowedRoles={['admin']}><CallLogs /></ProtectedRoute>} />
            <Route path="/crm/ticketing" element={<ProtectedRoute allowedRoles={['admin']}><Ticketing /></ProtectedRoute>} />
            <Route path="/crm/ticketing-history-report" element={<ProtectedRoute allowedRoles={['admin']}><TicketingHistoryReport /></ProtectedRoute>} />
            
            <Route path="/super-admin/dashboard" element={<ProtectedRoute allowedRoles={['superadmin']}><SuperAdminDashboard /></ProtectedRoute>} />
            <Route path="/super-admin/companies" element={<ProtectedRoute allowedRoles={['superadmin']}><CompanyManagement /></ProtectedRoute>} />
            <Route path="/super-admin/subscription-plans" element={<ProtectedRoute allowedRoles={['superadmin']}><SubscriptionPlans /></ProtectedRoute>} />
            <Route path="/super-admin/employee-permissions" element={<ProtectedRoute allowedRoles={['superadmin']}><EmployeePermissions /></ProtectedRoute>} />
            <Route path="/super-admin/invoice/:companyId" element={<ProtectedRoute allowedRoles={['superadmin']}><SuperAdminInvoiceGenerator /></ProtectedRoute>} />

            {/* Accounting Routes */}
            <Route path="/accounting/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AccountingDashboard /></ProtectedRoute>} />
            <Route path="/accounting/chart-of-accounts" element={<ProtectedRoute allowedRoles={['admin']}><ChartOfAccounts /></ProtectedRoute>} />
            <Route path="/accounting/journal-entries" element={<ProtectedRoute allowedRoles={['admin']}><JournalEntries /></ProtectedRoute>} />
            <Route path="/accounting/fiscal-years" element={<ProtectedRoute allowedRoles={['admin']}><FiscalYears /></ProtectedRoute>} />
            <Route path="/accounting/customers" element={<ProtectedRoute allowedRoles={['admin']}><Customers /></ProtectedRoute>} />
            <Route path="/accounting/invoices" element={<ProtectedRoute allowedRoles={['admin']}><Invoices /></ProtectedRoute>} />
            <Route path="/accounting/payments" element={<ProtectedRoute allowedRoles={['admin']}><Payments /></ProtectedRoute>} />
            <Route path="/accounting/vendors" element={<ProtectedRoute allowedRoles={['admin']}><Vendors /></ProtectedRoute>} />
            <Route path="/accounting/expenses" element={<ProtectedRoute allowedRoles={['admin']}><Expenses /></ProtectedRoute>} />
            <Route path="/accounting/bills" element={<ProtectedRoute allowedRoles={['admin']}><Bills /></ProtectedRoute>} />
            <Route path="/accounting/bank/accounts" element={<ProtectedRoute allowedRoles={['admin']}><BankAccounts /></ProtectedRoute>} />
            <Route path="/accounting/bank/transactions" element={<ProtectedRoute allowedRoles={['admin']}><BankTransactions /></ProtectedRoute>} />
            <Route path="/accounting/bank/reconcile" element={<ProtectedRoute allowedRoles={['admin']}><BankReconciliation /></ProtectedRoute>} />
            
            {/* Accounting Settings */}
            <Route path="/accounting/settings" element={<ProtectedRoute allowedRoles={['admin']}><FinancialSettings /></ProtectedRoute>} />
            <Route path="/accounting/settings/taxes" element={<ProtectedRoute allowedRoles={['admin']}><TaxSettings /></ProtectedRoute>} />
            <Route path="/accounting/settings/sequences" element={<ProtectedRoute allowedRoles={['admin']}><NumberSequences /></ProtectedRoute>} />

            {/* Financial Reports */}
            <Route path="/accounting/reports/general-ledger" element={<ProtectedRoute allowedRoles={['admin']}><GeneralLedger /></ProtectedRoute>} />
            <Route path="/accounting/reports/trial-balance" element={<ProtectedRoute allowedRoles={['admin']}><TrialBalance /></ProtectedRoute>} />
            <Route path="/accounting/reports/income-statement" element={<ProtectedRoute allowedRoles={['admin']}><IncomeStatement /></ProtectedRoute>} />
            <Route path="/accounting/reports/balance-sheet" element={<ProtectedRoute allowedRoles={['admin']}><BalanceSheet /></ProtectedRoute>} />
            <Route path="/accounting/reports/cash-flow" element={<ProtectedRoute allowedRoles={['admin']}><CashFlow /></ProtectedRoute>} />

            {/* Employee Portal Routes */}
            <Route path="/employee-portal/dashboard" element={<ProtectedRoute allowedRoles={['employee']}><EmployeeDashboard /></ProtectedRoute>} />
            <Route path="/employee-portal/attendance" element={<ProtectedRoute allowedRoles={['employee']}><EmployeeAttendance /></ProtectedRoute>} />
            <Route path="/employee-portal/leaves" element={<ProtectedRoute allowedRoles={['employee']}><EmployeeLeaves /></ProtectedRoute>} />
            <Route path="/employee-portal/payroll/*" element={<ProtectedRoute allowedRoles={['employee']}><EmployeePayroll /></ProtectedRoute>} />
            <Route path="/employee-portal/notices" element={<ProtectedRoute allowedRoles={['employee']}><EmployeeNotices /></ProtectedRoute>} />
            <Route path="/employee-portal/projects" element={<ProtectedRoute allowedRoles={['employee']}><EmployeeProjects /></ProtectedRoute>} />
            <Route path="/employee-portal/procurement" element={<ProtectedRoute allowedRoles={['employee']}><EmployeeProcurement /></ProtectedRoute>} />
            <Route path="/employee-portal/procurement/history" element={<ProtectedRoute allowedRoles={['employee']}><EmployeeProcurementHistory /></ProtectedRoute>} />
            <Route path="/employee-portal/recruitment" element={<ProtectedRoute allowedRoles={['employee']}><EmployeeRecruitment /></ProtectedRoute>} />
            <Route path="/employee-portal/marketing" element={<ProtectedRoute allowedRoles={['employee']}><EmployeeMarketing /></ProtectedRoute>} />
            <Route path="/employee-portal/messages" element={<ProtectedRoute allowedRoles={['employee']}><EmployeeMessages /></ProtectedRoute>} />
            <Route path="/employee-portal/training" element={<ProtectedRoute allowedRoles={['employee']}><EmployeeTraining /></ProtectedRoute>} />
            <Route path="/employee-portal/policies" element={<ProtectedRoute allowedRoles={['employee']}><EmployeeCompanyPolicies /></ProtectedRoute>} />

            <Route path="/contact" element={<LandingPage />} />
            <Route path="*" element={<ProtectedRoute allowedRoles={['admin']}><Dashboard /></ProtectedRoute>} />
          </Routes>
        </div>
      </AnimatePresence>
    </>
  );
}


export default function App() {
  return (
    <AuthProvider>
      <AuditProvider>
        <SettingsProvider>
          <SuperAdminProvider>
          <EmployeeProvider>
            <TrainingProvider>
              <AttendanceProvider>
                <TimeTrackingProvider>
                  <LeaveProvider>
                    <PolicyProvider>
                      <LetterProvider>
                        <CompanyDataProvider>
                          <ChatProvider>
                            <MarketingProvider>
                              <AccountingProvider>
                                <CustomerProvider>
                                  <InvoiceProvider>
                                    <PaymentProvider>
                                      <VendorProvider>
                                        <ExpenseProvider>
                                          <BillProvider>
                                            <BankProvider>
                                              <Router>
                                                <AppContent />
                                              </Router>
                                            </BankProvider>
                                          </BillProvider>
                                        </ExpenseProvider>
                                      </VendorProvider>
                                    </PaymentProvider>
                                  </InvoiceProvider>
                                </CustomerProvider>
                              </AccountingProvider>
                            </MarketingProvider>
                          </ChatProvider>
                        </CompanyDataProvider>
                      </LetterProvider>
                    </PolicyProvider>
                  </LeaveProvider>
                </TimeTrackingProvider>
              </AttendanceProvider>
            </TrainingProvider>
          </EmployeeProvider>
        </SuperAdminProvider>
      </SettingsProvider>
    </AuditProvider>
  </AuthProvider>
);
}

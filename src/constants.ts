import { 
  LayoutDashboard, 
  Clock, 
  GitGraph, 
  Calendar, 
  Award, 
  Building2, 
  Users, 
  UserCheck, 
  UserMinus, 
  Bell, 
  DollarSign, 
  Receipt, 
  Target, 
  Laptop, 
  ClipboardList, 
  MessageSquare, 
  FileText, 
  Settings, 
  Briefcase,
  UserPlus,
  Landmark,
  CreditCard
} from 'lucide-react';

export const ADMIN_MENU_ITEMS = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { name: 'Time Track', icon: Clock, path: '/time-tracker' },
  { 
    name: 'Org Chart', 
    icon: GitGraph, 
    hasSub: true,
    subItems: [
      { name: 'Organization Chart', path: '/org-chart' },
      { name: 'Company Policy', path: '/org-chart/policies' },
      { name: 'Designation', path: '/designation' }
    ]
  },
  { name: 'Attendance', icon: Calendar, path: '/attendance' },
  { name: 'Award', icon: Award, path: '/award' },
  { name: 'Department', icon: Building2, path: '/department' },
  { name: 'Employee', icon: Users, path: '/employee' },
  {
    name: 'Recruitment',
    icon: UserPlus,
    hasSub: true,
    subItems: [
      { name: 'Jobs List', path: '/recruitment/jobs-list' },
      { name: 'Job Posting', path: '/recruitment/job-posting' },
      { name: 'View Posted Jobs', path: '/recruitment/view-posted-jobs' },
      { name: 'Search Candidates', path: '/recruitment/search-candidates' },
      { name: 'Bulk CV Upload', path: '/recruitment/bulk-cv-upload' },
      { name: 'Offer Letters', path: '/recruitment/offer-letters' },
      { name: 'Agreements', path: '/recruitment/agreements' },
      { name: 'Career Page', path: '/recruitment/career-page-settings' },
      { name: 'View Live Page', path: '/careers' },
      { name: 'Custom Design', path: '/recruitment/custom-design' }
    ]
  },
  {
    name: 'Onboarding',
    icon: UserCheck,
    hasSub: true,
    subItems: [
      { name: 'Offer Letter', path: '/onboarding/offer-letter' },
      { name: 'Contact Letter', path: '/onboarding/contact-letter' },
      { name: 'Warning Letter', path: '/onboarding/warning-letter' },
      { name: 'Termination Letter', path: '/onboarding/termination-letter' },
      { name: 'Complaint Letter', path: '/onboarding/complaint-letter' },
      { name: 'Custom Letter', path: '/onboarding/custom-letter' },
    ]
  },
  {
    name: 'Offboarding',
    icon: UserMinus,
    hasSub: true,
    subItems: [
      { name: 'Warning Letter', path: '/offboarding/warning-letter' },
      { name: 'Resignation Letter', path: '/offboarding/resignation-letter' },
      { name: 'Termination Letter', path: '/offboarding/termination-letter' },
      { name: 'Complaint Letter', path: '/offboarding/complaint-letter' },
      { name: 'Custom Letter', path: '/offboarding/custom-letter' },
    ]
  },
  { name: 'Leaves', icon: UserMinus, path: '/leave' },
  { name: 'Notice Board', icon: Bell, path: '/notice' },
  { name: 'Payroll', icon: DollarSign, hasSub: true, subItems: [
      { name: 'Company Payroll', path: '/payroll/company-payroll' },
      { name: 'Salary advance', path: '/payroll/salary-advance' },
      { name: 'Salary generate', path: '/payroll/salary-generate' },
      { name: 'Manage employee salary', path: '/payroll/manage-salary' },
      { name: 'Sales tax format', path: '/payroll/sales-tax' }
    ]
  },
  { name: 'Performance', icon: Target, hasSub: true, subItems: [
      { name: 'KPI Templates', path: '/performance/kpis' },
      { name: 'Appraisal List', path: '/performance/appraisal-list' },
      { name: 'Appraisal Report', path: '/performance/appraisal-report' },
      { name: 'Training', path: '/performance/training' }
    ]
  },
  { name: 'Assets', icon: Laptop, path: '/assets/management' },
  { 
    name: 'Project Management', 
    icon: ClipboardList, 
    hasSub: true,
    subItems: [
      { name: 'Projects', path: '/project-management' },
      { name: 'Milestone', path: '/project-management/milestones' },
      { name: 'Reports', path: '/project-management/reports' }
    ]
  },
  { name: 'Marketing', icon: MessageSquare, hasSub: true, subItems: [
      { name: 'Email Database', path: '/marketing/lists' },
      { name: 'Campaigns', path: '/marketing/campaigns' },
      { name: 'Templates', path: '/marketing/templates' },
      { name: 'Campaign Logs', path: '/marketing/logs' }
    ]
  },
  { name: 'Reports', icon: FileText, path: '/reports' },
  { name: 'Reward Points', icon: Target, path: '/reward-points' },
  { name: 'Message', icon: MessageSquare, path: '/message' },
  { name: 'Supply Chain Management', icon: Briefcase, path: '#' },
  { name: 'Procurement', icon: Briefcase, hasSub: true, subItems: [
      { name: 'New Request', path: '/procurement/request' },
      { name: 'Item Request Received', path: '/procurement/received' },
      { name: 'Request History', path: '/procurement/history' },
      { name: 'Procurement Settings', path: '/procurement/settings' }
    ]
  },
  { 
    name: 'Accounting', 
    icon: FileText, 
    hasSub: true,
    subItems: [
      {
        name: 'Dashboard',
        path: '/accounts/dashboard'
      },
      {
        name: 'Customers',
        hasSub: true,
        subItems: [
          { name: 'Invoices', path: '/accounts/customers/invoices' },
          { name: 'Credit Notes', path: '/accounts/customers/credit-notes' },
          { name: 'Payments', path: '/accounts/customers/payments' },
          { name: 'Customers', path: '/accounts/customers/list' }
        ]
      },
      {
        name: 'Vendors',
        hasSub: true,
        subItems: [
          { name: 'Bills', path: '/accounts/vendors/bills' },
          { name: 'Refunds', path: '/accounts/vendors/refunds' },
          { name: 'Payments', path: '/accounts/vendors/payments' },
          { name: 'Vendors', path: '/accounts/vendors/list' }
        ]
      },
      {
        name: 'Accounting',
        hasSub: true,
        subItems: [
          { name: 'Journal Entries', path: '/accounts/accounting/journal-entries' },
          { name: 'General Ledger', path: '/accounts/accounting/general-ledger' },
          { name: 'Vouchers', path: '/accounts/voucher/list' }
        ]
      },
      {
        name: 'Reporting',
        hasSub: true,
        subItems: [
          { name: 'Profit and Loss', path: '/accounts/reporting/profit-and-loss' },
          { name: 'Balance Sheet', path: '/accounts/reporting/balance-sheet' },
          { name: 'Executive Summary', path: '/accounts/reporting/executive-summary' },
          { name: 'Cash Flow', path: '/accounts/reporting/cash-flow' }
        ]
      },
      {
        name: 'Configuration',
        hasSub: true,
        subItems: [
          { name: 'Chart of Accounts', path: '/accounts/configuration/chart-of-accounts' },
          { name: 'Taxes', path: '/accounts/configuration/taxes' },
          { name: 'Journals', path: '/accounts/configuration/journals' },
          { name: 'Accounting Periods', path: '/accounts/configuration/accounting-periods' }
        ]
      }
    ]
  },
  { 
    name: 'CRM', 
    icon: Users, 
    hasSub: true,
    subItems: [
      { name: 'Companies', path: '/crm/companies' },
      { name: 'Products', path: '/crm/products' },
      { name: 'Opportunities', path: '/crm/opportunities' },
      { name: 'Quotations', path: '/crm/quotations' },
      { name: 'Sales Orders', path: '/crm/sales-orders' },
      { name: 'Sales Target', path: '/crm/sales-target' }
    ]
  },
  { name: 'Purchase Dep', icon: Briefcase, path: '#' },
  { name: 'Settings', icon: Settings, hasSub: true, subItems: [
      { name: 'General Settings', path: '/settings' },
      { name: 'Setup Rules', path: '/setup-rules' },
      { name: 'Roles & Permissions', path: '/role-management' },
      { name: 'Menu Permissions', path: '/permissions' }
    ]
  }
];

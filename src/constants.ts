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
  Briefcase
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
      { name: 'Company Policy', path: '/org-chart/policies' }
    ]
  },
  { name: 'Attendance', icon: Calendar, path: '/attendance' },
  { name: 'Award', icon: Award, path: '/award' },
  { name: 'Department', icon: Building2, path: '/department' },
  { name: 'Employee', icon: Users, path: '/employee' },
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
  { name: 'Invoice', icon: Receipt, path: '/invoice' },
  { name: 'Performance', icon: Target, hasSub: true, subItems: [
      { name: 'KPI Templates', path: '/performance/kpis' },
      { name: 'Appraisal List', path: '/performance/appraisal-list' },
      { name: 'Appraisal Report', path: '/performance/appraisal-report' }
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
      { name: 'Item Request', path: '/procurement/request' },
      { name: 'Request History', path: '/procurement/history' },
      { name: 'Procurement Settings', path: '/procurement/settings' }
    ]
  },
  { name: 'Accounts', icon: FileText, path: '#' },
  { name: 'CRM', icon: Users, path: '#' },
  { name: 'Purchase Dep', icon: Briefcase, path: '#' },
  { name: 'Settings', icon: Settings, hasSub: true, subItems: [
      { name: 'General Settings', path: '/settings' },
      { name: 'Setup Rules', path: '/setup-rules' },
      { name: 'Roles & Permissions', path: '/role-management' },
      { name: 'Menu Permissions', path: '/permissions' }
    ]
  }
];

export interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  candidateName: string;
  email: string;
  phone: string;
  cvFileName: string;
  stage: 'New Candidates' | 'Interested' | 'Shortlisted' | 'Client Submission' | 'Client Interview' | 'Offered' | 'Hired' | 'Dropped';
  appliedAt: string;
  matchPercentage?: number;
  skills?: string[];
  education?: string;
  expectedSalary?: string;
  location?: string;
  cvText?: string;
}

const STORAGE_KEY = 'hr_applications';

export const getApplications = (): Application[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveApplication = (application: Omit<Application, 'id' | 'stage' | 'appliedAt'>) => {
  const applications = getApplications();
  const newApplication: Application = {
    ...application,
    id: Math.random().toString(36).substr(2, 9),
    stage: 'New Candidates',
    appliedAt: new Date().toISOString(),
    matchPercentage: application.matchPercentage || Math.floor(Math.random() * 60) + 40, // Mock 40-100%
  };
  applications.push(newApplication);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(applications));
  return newApplication;
};

export const updateApplicationStage = (id: string, stage: Application['stage']) => {
  const applications = getApplications();
  const index = applications.findIndex(app => app.id === id);
  if (index !== -1) {
    applications[index].stage = stage;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(applications));
  }
};

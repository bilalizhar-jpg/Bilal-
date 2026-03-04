import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Printer, 
  Download, 
  Save, 
  Edit3, 
  PlusCircle,
  MinusCircle,
  FileText,
  List,
  Target
} from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { useTheme } from '../../context/ThemeContext';
import { Link } from 'react-router-dom';
import { KPITemplate, KPIIndicator } from './KPIs';

interface RatingItem {
  id: string;
  criteria: string;
  rating: number;
  score: number;
  comments: string;
  maxScore?: number;
}

interface DevelopmentPlan {
  id: string;
  improvement: string;
  outcome: string;
  responsible: string;
  startDate: string;
  endDate: string;
}

interface KeyGoal {
  id: string;
  goal: string;
  period: string;
}

export default function PerformanceAppraisalReport() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isEditing, setIsEditing] = useState(true);

  const [formData, setFormData] = useState({
    employeeName: '',
    reviewPeriod: '',
    supervisorName: '',
    overallComments: '',
    reviewerName: '',
    reviewerSignature: '',
    reviewDate: '',
    nextReviewPeriod: '',
    employeeComments: '',
    kpiTemplateId: '',
  });

  const [kpiTemplates, setKpiTemplates] = useState<KPITemplate[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('kpi_templates');
    if (saved) {
      setKpiTemplates(JSON.parse(saved));
    }
  }, []);

  const [sectionA, setSectionA] = useState<RatingItem[]>([
    { id: 'a1', criteria: 'Demonstrated Knowledge of duties & Quality of Work', rating: 0, score: 0, comments: '', maxScore: 12 },
    { id: 'a2', criteria: 'Timeliness of Delivery', rating: 0, score: 0, comments: '', maxScore: 12 },
    { id: 'a3', criteria: 'Impact of Achievement', rating: 0, score: 0, comments: '', maxScore: 12 },
    { id: 'a4', criteria: 'Overall Achievement of Goals/Objectives', rating: 0, score: 0, comments: '', maxScore: 12 },
    { id: 'a5', criteria: 'Going beyond the call of Duty', rating: 0, score: 0, comments: '', maxScore: 12 },
  ]);

  const handleKpiTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const templateId = e.target.value;
    setFormData(prev => ({ ...prev, kpiTemplateId: templateId }));

    if (templateId) {
      const template = kpiTemplates.find(t => t.id === templateId);
      if (template) {
        const newSectionA = template.indicators.map(ind => ({
          id: ind.id,
          criteria: ind.name,
          rating: 0,
          score: 0,
          comments: '',
          maxScore: ind.maxScore
        }));
        setSectionA(newSectionA);
      }
    } else {
      // Reset to default
      setSectionA([
        { id: 'a1', criteria: 'Demonstrated Knowledge of duties & Quality of Work', rating: 0, score: 0, comments: '', maxScore: 12 },
        { id: 'a2', criteria: 'Timeliness of Delivery', rating: 0, score: 0, comments: '', maxScore: 12 },
        { id: 'a3', criteria: 'Impact of Achievement', rating: 0, score: 0, comments: '', maxScore: 12 },
        { id: 'a4', criteria: 'Overall Achievement of Goals/Objectives', rating: 0, score: 0, comments: '', maxScore: 12 },
        { id: 'a5', criteria: 'Going beyond the call of Duty', rating: 0, score: 0, comments: '', maxScore: 12 },
      ]);
    }
  };

  const [sectionB, setSectionB] = useState<RatingItem[]>([
    { id: 'b1', criteria: 'Interpersonal skills & ability to work in a team environment', rating: 2, score: 2, comments: '' },
    { id: 'b2', criteria: 'Attendance and Punctuality', rating: 2, score: 2, comments: '' },
    { id: 'b3', criteria: 'Communication Skills', rating: 2, score: 2, comments: '' },
    { id: 'b4', criteria: 'Contributing to company mission', rating: 2, score: 2, comments: '' },
  ]);

  const [developmentPlans, setDevelopmentPlans] = useState<DevelopmentPlan[]>([
    { id: 'e1', improvement: '', outcome: '', responsible: '', startDate: '', endDate: '' }
  ]);

  const [keyGoals, setKeyGoals] = useState<KeyGoal[]>([
    { id: 'f1', goal: '', period: '' }
  ]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const updateSectionA = (id: string, rating: number, comments?: string) => {
    setSectionA(prev => prev.map(item => {
      if (item.id === id) {
        const score = rating; 
        return { ...item, rating, score, comments: comments !== undefined ? comments : item.comments };
      }
      return item;
    }));
  };

  const updateSectionAField = (id: string, field: keyof RatingItem, value: any) => {
    setSectionA(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const removeSectionA = (id: string) => {
    setSectionA(prev => prev.filter(item => item.id !== id));
  };

  const addSectionA = () => {
    setSectionA(prev => [
      ...prev,
      { id: Math.random().toString(36).substr(2, 9), criteria: '', rating: 0, score: 0, comments: '', maxScore: 12 }
    ]);
  };

  const updateSectionB = (id: string, rating: number, comments?: string) => {
    setSectionB(prev => prev.map(item => {
      if (item.id === id) {
        const score = rating; // In section B, rating is the score (2, 4, 6, 9, 10)
        return { ...item, rating, score, comments: comments !== undefined ? comments : item.comments };
      }
      return item;
    }));
  };

  const totalA = sectionA.reduce((sum, item) => sum + item.score, 0);
  const totalB = sectionB.reduce((sum, item) => sum + item.score, 0);
  const grandTotal = totalA + totalB;

  const getClassification = (score: number) => {
    if (score >= 80) return 'EE (Exceeds Expectations)';
    if (score >= 75) return 'AE (Achieves Expectations)';
    return 'UE (Under Expectations)';
  };

  const addDevPlan = () => {
    setDevelopmentPlans([...developmentPlans, { id: Math.random().toString(36).substr(2, 9), improvement: '', outcome: '', responsible: '', startDate: '', endDate: '' }]);
  };

  const removeDevPlan = (id: string) => {
    setDevelopmentPlans(developmentPlans.filter(p => p.id !== id));
  };

  const addKeyGoal = () => {
    setKeyGoals([...keyGoals, { id: Math.random().toString(36).substr(2, 9), goal: '', period: '' }]);
  };

  const removeKeyGoal = (id: string) => {
    setKeyGoals(keyGoals.filter(g => g.id !== id));
  };

  return (
    <AdminLayout>
      <div className="space-y-6 pb-12">
        <div className="flex justify-between items-center no-print">
          <div className="flex items-center gap-2">
            <button 
              onClick={addSectionA}
              className="bg-emerald-600 text-white px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-700"
            >
              <Plus className="w-3.5 h-3.5" />
              Add new action
            </button>
          </div>
          <div className="flex gap-2">
            <Link to="/performance/appraisal-list" className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-emerald-700">
              <List className="w-4 h-4" />
              Employee performance list
            </Link>
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                isEditing ? 'bg-amber-500 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              {isEditing ? <Save className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
              {isEditing ? 'Save Changes' : 'Edit Report'}
            </button>
            <button onClick={() => window.print()} className="bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-700 flex items-center gap-2">
              <Printer className="w-4 h-4" />
              Print
            </button>
          </div>
        </div>

        <div className={`max-w-6xl mx-auto p-8 md:p-12 shadow-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} rounded-xl space-y-8 print:shadow-none print:border-none print:p-0`}>
          
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-wider">2026 PERFORMANCE APPRAISAL INTERVIEW FORM</h1>
            <p className="text-red-500 text-sm italic">All field are required except comments</p>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">Name of employee :</label>
              <input 
                type="text" 
                name="employeeName"
                value={formData.employeeName}
                onChange={handleFormChange}
                placeholder="Select employee"
                className={`flex-1 border rounded px-3 py-1.5 text-sm ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'}`}
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">Review period :</label>
              <input 
                type="text" 
                name="reviewPeriod"
                value={formData.reviewPeriod}
                onChange={handleFormChange}
                placeholder="Review Period In Months"
                className={`flex-1 border rounded px-3 py-1.5 text-sm ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'}`}
              />
            </div>
            <div className="flex items-center gap-4 md:col-span-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">Name and position of supervisor head of department :</label>
              <input 
                type="text" 
                name="supervisorName"
                value={formData.supervisorName}
                onChange={handleFormChange}
                placeholder="Name and Position of Supervisor/Head of Department"
                className={`flex-1 border rounded px-3 py-1.5 text-sm ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'}`}
              />
            </div>
            <div className="flex items-center gap-4 md:col-span-2 bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg border border-indigo-100 dark:border-indigo-800">
              <Target className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <label className="text-sm font-bold text-indigo-900 dark:text-indigo-300 whitespace-nowrap">Link KPI Template :</label>
              <select 
                name="kpiTemplateId"
                value={formData.kpiTemplateId}
                onChange={handleKpiTemplateChange}
                className={`flex-1 border rounded px-3 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'}`}
              >
                <option value="">-- Default Appraisal Criteria --</option>
                {kpiTemplates.map(template => (
                  <option key={template.id} value={template.id}>{template.title}</option>
                ))}
              </select>
            </div>
          </div>

          <p className="text-sm text-slate-600 dark:text-slate-400 italic">
            Please provide a critical assessment of the performance of the employee within the review period using the following rating scale provide examples where applicable please use a separate sheet if required
          </p>

          {/* Rating Scale Legend */}
          <div className="grid grid-cols-5 border border-slate-200 dark:border-slate-800 rounded text-xs">
            <div className="p-2 border-r border-slate-200 dark:border-slate-800">
              <p className="font-bold">P</p>
              <p>Poor</p>
            </div>
            <div className="p-2 border-r border-slate-200 dark:border-slate-800">
              <p className="font-bold">NI</p>
              <p>Need Improvement</p>
            </div>
            <div className="p-2 border-r border-slate-200 dark:border-slate-800">
              <p className="font-bold">G</p>
              <p>Good</p>
            </div>
            <div className="p-2 border-r border-slate-200 dark:border-slate-800">
              <p className="font-bold">VG</p>
              <p>Very Good</p>
            </div>
            <div className="p-2">
              <p className="font-bold">E</p>
              <p>Excellent</p>
            </div>
          </div>

          {/* Section A */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white uppercase">A ASSESSMENT OF GOALS OBJECTIVES SET DURING THE REVIEW PERIOD</h2>
              <button 
                onClick={addSectionA}
                className="no-print bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-3 py-1.5 rounded text-sm font-bold flex items-center gap-1.5 hover:bg-indigo-100 dark:hover:bg-indigo-900/50"
              >
                <Plus className="w-4 h-4" />
                Add KPI
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse border border-slate-200 dark:border-slate-800">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 text-xs font-bold uppercase">
                    <th className="p-2 border border-slate-200 dark:border-slate-800">Criteria</th>
                    <th className="p-2 border border-slate-200 dark:border-slate-800 text-center">Score Input</th>
                    <th className="p-2 border border-slate-200 dark:border-slate-800 text-center">Max Score</th>
                    <th className="p-2 border border-slate-200 dark:border-slate-800">Comments and examples</th>
                    <th className="p-2 border border-slate-200 dark:border-slate-800 w-10 text-center no-print">Act</th>
                  </tr>
                </thead>
                <tbody>
                  {sectionA.map((item) => (
                    <tr key={item.id} className="text-sm">
                      <td className="p-2 border border-slate-200 dark:border-slate-800 font-medium">
                        <input 
                          type="text"
                          value={item.criteria}
                          onChange={(e) => updateSectionAField(item.id, 'criteria', e.target.value)}
                          className={`w-full bg-transparent border-none outline-none ${isDark ? 'text-white' : 'text-slate-800'}`}
                          placeholder="Enter KPI criteria"
                        />
                      </td>
                      <td className="p-2 border border-slate-200 dark:border-slate-800 text-center">
                        <input 
                          type="number" 
                          value={item.score}
                          onChange={(e) => {
                            let val = parseInt(e.target.value) || 0;
                            if (item.maxScore && val > item.maxScore) val = item.maxScore;
                            if (val < 0) val = 0;
                            updateSectionA(item.id, val);
                          }}
                          className={`w-20 text-center border rounded px-2 py-1 outline-none focus:ring-1 focus:ring-indigo-500 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300'}`}
                        />
                      </td>
                      <td className="p-2 border border-slate-200 dark:border-slate-800 text-center text-slate-500 font-bold">
                        <input 
                          type="number"
                          value={item.maxScore || 12}
                          onChange={(e) => updateSectionAField(item.id, 'maxScore', parseInt(e.target.value) || 0)}
                          className={`w-16 text-center bg-transparent border-none outline-none ${isDark ? 'text-slate-400' : 'text-slate-600'}`}
                        />
                      </td>
                      <td className="p-2 border border-slate-200 dark:border-slate-800">
                        <textarea 
                          value={item.comments}
                          onChange={(e) => updateSectionA(item.id, item.rating, e.target.value)}
                          className={`w-full border-none outline-none bg-transparent resize-none min-h-[40px] ${isDark ? 'text-white' : 'text-slate-800'}`}
                        />
                      </td>
                      <td className="p-2 border border-slate-200 dark:border-slate-800 text-center no-print">
                        <button 
                          onClick={() => removeSectionA(item.id)}
                          className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50 dark:bg-slate-800/50 font-bold">
                    <td colSpan={1} className="p-2 border border-slate-200 dark:border-slate-800 text-right">Total score</td>
                    <td className="p-2 border border-slate-200 dark:border-slate-800 text-center bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600">{totalA}</td>
                    <td className="p-2 border border-slate-200 dark:border-slate-800 text-center text-slate-500">
                      {sectionA.reduce((sum, item) => sum + (item.maxScore || 12), 0)}
                    </td>
                    <td className="p-2 border border-slate-200 dark:border-slate-800"></td>
                    <td className="p-2 border border-slate-200 dark:border-slate-800 no-print"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section B */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white uppercase">B ASSESSMENT OF OTHER PERFORMANCE STANDARDS AND INDICATORS</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse border border-slate-200 dark:border-slate-800">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 text-xs font-bold uppercase">
                    <th className="p-2 border border-slate-200 dark:border-slate-800">Criteria</th>
                    <th className="p-2 border border-slate-200 dark:border-slate-800 text-center">P (2)</th>
                    <th className="p-2 border border-slate-200 dark:border-slate-800 text-center">NI (4)</th>
                    <th className="p-2 border border-slate-200 dark:border-slate-800 text-center">G (6)</th>
                    <th className="p-2 border border-slate-200 dark:border-slate-800 text-center">VG (9)</th>
                    <th className="p-2 border border-slate-200 dark:border-slate-800 text-center">E (10)</th>
                    <th className="p-2 border border-slate-200 dark:border-slate-800 text-center">Score</th>
                    <th className="p-2 border border-slate-200 dark:border-slate-800">Comments and examples</th>
                  </tr>
                </thead>
                <tbody>
                  {sectionB.map((item) => (
                    <tr key={item.id} className="text-sm">
                      <td className="p-2 border border-slate-200 dark:border-slate-800 font-medium">{item.criteria}</td>
                      {[2, 4, 6, 9, 10].map(val => (
                        <td key={val} className="p-2 border border-slate-200 dark:border-slate-800 text-center">
                          <input 
                            type="radio" 
                            name={`sectionB-${item.id}`} 
                            checked={item.rating === val}
                            onChange={() => updateSectionB(item.id, val)}
                            className="w-4 h-4 text-indigo-600"
                          />
                        </td>
                      ))}
                      <td className="p-2 border border-slate-200 dark:border-slate-800">
                        <input 
                          type="number" 
                          value={item.score}
                          readOnly
                          className={`w-full text-center bg-slate-50 dark:bg-slate-800/50 border-none outline-none ${isDark ? 'text-white' : 'text-slate-800'}`}
                        />
                      </td>
                      <td className="p-2 border border-slate-200 dark:border-slate-800">
                        <textarea 
                          value={item.comments}
                          onChange={(e) => updateSectionB(item.id, item.rating, e.target.value)}
                          className={`w-full border-none outline-none bg-transparent resize-none min-h-[40px] ${isDark ? 'text-white' : 'text-slate-800'}`}
                        />
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50 dark:bg-slate-800/50 font-bold">
                    <td colSpan={6} className="p-2 border border-slate-200 dark:border-slate-800 text-right">Total score (maximum = 40)</td>
                    <td className="p-2 border border-slate-200 dark:border-slate-800 text-center bg-indigo-50 dark:bg-indigo-900/30">{totalB}</td>
                    <td className="p-2 border border-slate-200 dark:border-slate-800"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section C */}
          <div className="grid grid-cols-1 md:grid-cols-2 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
            <div className="p-6 space-y-6 border-r border-slate-200 dark:border-slate-800">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white uppercase">C TOTAL SCORE</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase">Total score (score a + score b)</p>
                  <p className="text-2xl font-bold text-indigo-600">{totalA} + {totalB} = {grandTotal}</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase">Classification of employee:</p>
                  <p className="text-lg font-bold text-slate-800 dark:text-white">{getClassification(grandTotal)}</p>
                  <p className="text-xs text-slate-500 mt-1">EE (80-100) | AE (75-85) | UE (0-70)</p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <h2 className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase">Overall comments recommendations by reviewer</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Name:</span>
                  <input type="text" name="reviewerName" value={formData.reviewerName} onChange={handleFormChange} className="flex-1 border-b border-slate-200 dark:border-slate-700 bg-transparent outline-none text-sm" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Signature:</span>
                  <input type="text" name="reviewerSignature" value={formData.reviewerSignature} onChange={handleFormChange} className="flex-1 border-b border-slate-200 dark:border-slate-700 bg-transparent outline-none text-sm" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Date:</span>
                  <input type="date" name="reviewDate" value={formData.reviewDate} onChange={handleFormChange} className="flex-1 border-b border-slate-200 dark:border-slate-700 bg-transparent outline-none text-sm" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Next review period:</span>
                  <input type="text" name="nextReviewPeriod" value={formData.nextReviewPeriod} onChange={handleFormChange} className="flex-1 border-b border-slate-200 dark:border-slate-700 bg-transparent outline-none text-sm" />
                </div>
              </div>
            </div>
          </div>

          {/* Section D */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white uppercase">D COMMENTS BY EMPLOYEE</h2>
            <textarea 
              name="employeeComments"
              value={formData.employeeComments}
              onChange={handleFormChange}
              placeholder="Maximum 500 words"
              className={`w-full border rounded p-4 text-sm min-h-[100px] ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'}`}
            />
          </div>

          {/* Section E */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white uppercase">E DEVELOPMENT PLAN</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse border border-slate-200 dark:border-slate-800">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 text-[10px] font-bold uppercase">
                    <th className="p-2 border border-slate-200 dark:border-slate-800 w-1/4">Recommended areas for improvement development</th>
                    <th className="p-2 border border-slate-200 dark:border-slate-800 w-1/5">Expected outcome(s)</th>
                    <th className="p-2 border border-slate-200 dark:border-slate-800 w-1/5">Responsible person(s) to assist in the achievement of the plan</th>
                    <th className="p-2 border border-slate-200 dark:border-slate-800">Start date</th>
                    <th className="p-2 border border-slate-200 dark:border-slate-800">End date</th>
                    <th className="p-2 border border-slate-200 dark:border-slate-800 w-20 no-print">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {developmentPlans.map((plan) => (
                    <tr key={plan.id}>
                      <td className="p-2 border border-slate-200 dark:border-slate-800">
                        <textarea 
                          value={plan.improvement}
                          onChange={(e) => setDevelopmentPlans(developmentPlans.map(p => p.id === plan.id ? { ...p, improvement: e.target.value } : p))}
                          className="w-full bg-transparent border-none outline-none text-xs resize-none min-h-[60px]"
                        />
                      </td>
                      <td className="p-2 border border-slate-200 dark:border-slate-800">
                        <textarea 
                          value={plan.outcome}
                          onChange={(e) => setDevelopmentPlans(developmentPlans.map(p => p.id === plan.id ? { ...p, outcome: e.target.value } : p))}
                          className="w-full bg-transparent border-none outline-none text-xs resize-none min-h-[60px]"
                        />
                      </td>
                      <td className="p-2 border border-slate-200 dark:border-slate-800">
                        <input 
                          type="text"
                          value={plan.responsible}
                          onChange={(e) => setDevelopmentPlans(developmentPlans.map(p => p.id === plan.id ? { ...p, responsible: e.target.value } : p))}
                          className="w-full bg-transparent border-none outline-none text-xs"
                        />
                      </td>
                      <td className="p-2 border border-slate-200 dark:border-slate-800">
                        <input 
                          type="date"
                          value={plan.startDate}
                          onChange={(e) => setDevelopmentPlans(developmentPlans.map(p => p.id === plan.id ? { ...p, startDate: e.target.value } : p))}
                          className="w-full bg-transparent border-none outline-none text-xs"
                        />
                      </td>
                      <td className="p-2 border border-slate-200 dark:border-slate-800">
                        <input 
                          type="date"
                          value={plan.endDate}
                          onChange={(e) => setDevelopmentPlans(developmentPlans.map(p => p.id === plan.id ? { ...p, endDate: e.target.value } : p))}
                          className="w-full bg-transparent border-none outline-none text-xs"
                        />
                      </td>
                      <td className="p-2 border border-slate-200 dark:border-slate-800 text-center no-print">
                        <div className="flex justify-center gap-1">
                          <button onClick={addDevPlan} className="p-1 bg-cyan-500 text-white rounded"><Plus className="w-3 h-3" /></button>
                          <button onClick={() => removeDevPlan(plan.id)} className="p-1 bg-red-500 text-white rounded"><Trash2 className="w-3 h-3" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section F */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white uppercase">F KEY GOALS FOR NEXT REVIEW PERIOD</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse border border-slate-200 dark:border-slate-800">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 text-xs font-bold uppercase">
                    <th className="p-2 border border-slate-200 dark:border-slate-800">Goal (s) set and agreed on with employee</th>
                    <th className="p-2 border border-slate-200 dark:border-slate-800 w-1/3">Proposed completion period</th>
                    <th className="p-2 border border-slate-200 dark:border-slate-800 w-20 no-print">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {keyGoals.map((goal) => (
                    <tr key={goal.id}>
                      <td className="p-2 border border-slate-200 dark:border-slate-800">
                        <textarea 
                          value={goal.goal}
                          onChange={(e) => setKeyGoals(keyGoals.map(g => g.id === goal.id ? { ...g, goal: e.target.value } : g))}
                          className="w-full bg-transparent border-none outline-none text-sm resize-none min-h-[80px]"
                        />
                      </td>
                      <td className="p-2 border border-slate-200 dark:border-slate-800">
                        <input 
                          type="date"
                          value={goal.period}
                          onChange={(e) => setKeyGoals(keyGoals.map(g => g.id === goal.id ? { ...g, period: e.target.value } : g))}
                          className="w-full bg-transparent border-none outline-none text-sm"
                        />
                      </td>
                      <td className="p-2 border border-slate-200 dark:border-slate-800 text-center no-print">
                        <div className="flex justify-center gap-1">
                          <button onClick={addKeyGoal} className="p-1 bg-cyan-500 text-white rounded"><Plus className="w-3 h-3" /></button>
                          <button onClick={() => removeKeyGoal(goal.id)} className="p-1 bg-red-500 text-white rounded"><Trash2 className="w-3 h-3" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-8 no-print">
            <button className="bg-emerald-600 text-white px-8 py-2 rounded font-bold hover:bg-emerald-700 transition-colors">
              Save
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .print\:shadow-none { box-shadow: none !important; }
          .print\:border-none { border: none !important; }
          .print\:p-0 { padding: 0 !important; }
          input[type="radio"] { appearance: none; border: 1px solid #000; width: 12px; height: 12px; border-radius: 50%; position: relative; }
          input[type="radio"]:checked::after { content: ""; position: absolute; top: 2px; left: 2px; width: 6px; height: 6px; background: #000; border-radius: 50%; }
        }
      `}</style>
    </AdminLayout>
  );
}

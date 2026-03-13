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
  Target,
  Loader2
} from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { useTheme } from '../../context/ThemeContext';
import { Link, useNavigate } from 'react-router-dom';
import { KPITemplate, KPIIndicator } from './KPIs';
import { saveAppraisal } from '../../utils/appraisalStore';

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
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    employeeName: '',
    employeeId: '',
    department: '',
    reviewPeriod: '',
    supervisorName: '',
    overallComments: '',
    reviewerName: '',
    reviewerSignature: '',
    reviewDate: new Date().toISOString().split('T')[0],
    nextReviewPeriod: '',
    employeeComments: '',
    kpiTemplateId: '',
  });

  const [kpiTemplates, setKpiTemplates] = useState<KPITemplate[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('kpi_templates');
    if (saved) {
      try {
        setKpiTemplates(JSON.parse(saved));
      } catch (e) {
        console.error("Error parsing kpi_templates:", e);
      }
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

  const handleSave = async () => {
    if (!formData.employeeName) {
      alert("Please enter employee name");
      return;
    }

    setIsSaving(true);
    try {
      await saveAppraisal({
        employeeName: formData.employeeName,
        employeeId: formData.employeeId || 'EMP-' + Math.floor(Math.random() * 1000),
        department: formData.department || 'General',
        appraisalDate: formData.reviewDate,
        period: formData.reviewPeriod || 'Annual 2026',
        score: grandTotal,
        status: 'Completed'
      });
      alert("Appraisal saved successfully!");
      navigate('/performance/appraisal-list');
    } catch (error) {
      console.error("Error saving appraisal:", error);
      alert("Failed to save appraisal");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 pb-12">
        <div className="flex justify-between items-center no-print">
          <div className="flex items-center gap-2">
            <button 
              onClick={addSectionA}
              className="bg-[#2A2A3D] text-[#00FFCC] px-3 py-1.5 rounded text-xs font-black uppercase hover:bg-[#3A3A5D] border border-[#00FFCC]/20 flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Add new action
            </button>
          </div>
          <div className="flex gap-2">
            <Link to="/performance/appraisal-list" className="bg-[#2A2A3D] text-[#00FFCC] px-4 py-2 rounded-lg text-sm font-black uppercase hover:bg-[#3A3A5D] border border-[#00FFCC]/20 flex items-center gap-2">
              <List className="w-4 h-4" />
              Employee performance list
            </Link>
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-black uppercase transition-all ${
                isEditing ? 'bg-[#00FFCC] text-[#1E1E2F] shadow-[0_0_8px_rgba(0,255,204,0.4)]' : 'bg-[#2A2A3D] text-[#00FFCC] border border-[#00FFCC]/20'
              }`}
            >
              {isEditing ? <Save className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
              {isEditing ? 'Save Changes' : 'Edit Report'}
            </button>
            <button onClick={() => window.print()} className="bg-[#2A2A3D] text-[#B0B0C3] px-4 py-2 rounded-lg text-sm font-black uppercase hover:bg-[#3A3A5D] border border-white/10 flex items-center gap-2">
              <Printer className="w-4 h-4" />
              Print
            </button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto p-8 md:p-12 shadow-[0_4px_20px_rgba(0,255,204,0.05)] border border-white/5 bg-[#2A2A3D] rounded-2xl space-y-8 print:shadow-none print:border-none print:p-0">
          
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-black text-white uppercase tracking-tight">2026 PERFORMANCE APPRAISAL INTERVIEW FORM</h1>
            <p className="text-red-400 text-sm italic">All field are required except comments</p>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center gap-4">
              <label className="text-sm font-black text-[#B0B0C3] uppercase tracking-wider whitespace-nowrap">Name of employee :</label>
              <input 
                type="text" 
                name="employeeName"
                value={formData.employeeName}
                onChange={handleFormChange}
                placeholder="Select employee"
                className="flex-1 border border-white/10 bg-[#1E1E2F] text-white rounded px-3 py-1.5 text-sm outline-none focus:border-[#00FFCC]"
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="text-sm font-black text-[#B0B0C3] uppercase tracking-wider whitespace-nowrap">Employee ID :</label>
              <input 
                type="text" 
                name="employeeId"
                value={formData.employeeId}
                onChange={handleFormChange}
                placeholder="Employee ID"
                className="flex-1 border border-white/10 bg-[#1E1E2F] text-white rounded px-3 py-1.5 text-sm outline-none focus:border-[#00FFCC]"
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="text-sm font-black text-[#B0B0C3] uppercase tracking-wider whitespace-nowrap">Department :</label>
              <input 
                type="text" 
                name="department"
                value={formData.department}
                onChange={handleFormChange}
                placeholder="Department"
                className="flex-1 border border-white/10 bg-[#1E1E2F] text-white rounded px-3 py-1.5 text-sm outline-none focus:border-[#00FFCC]"
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="text-sm font-black text-[#B0B0C3] uppercase tracking-wider whitespace-nowrap">Review period :</label>
              <input 
                type="text" 
                name="reviewPeriod"
                value={formData.reviewPeriod}
                onChange={handleFormChange}
                placeholder="Review Period In Months"
                className="flex-1 border border-white/10 bg-[#1E1E2F] text-white rounded px-3 py-1.5 text-sm outline-none focus:border-[#00FFCC]"
              />
            </div>
            <div className="flex items-center gap-4 md:col-span-2">
              <label className="text-sm font-black text-[#B0B0C3] uppercase tracking-wider whitespace-nowrap">Name and position of supervisor head of department :</label>
              <input 
                type="text" 
                name="supervisorName"
                value={formData.supervisorName}
                onChange={handleFormChange}
                placeholder="Name and Position of Supervisor/Head of Department"
                className="flex-1 border border-white/10 bg-[#1E1E2F] text-white rounded px-3 py-1.5 text-sm outline-none focus:border-[#00FFCC]"
              />
            </div>
            <div className="flex items-center gap-4 md:col-span-2 bg-[#1E1E2F]/50 p-4 rounded-lg border border-[#00FFCC]/20">
              <Target className="w-5 h-5 text-[#00FFCC]" />
              <label className="text-sm font-black text-[#00FFCC] uppercase tracking-wider whitespace-nowrap">Link KPI Template :</label>
              <select 
                name="kpiTemplateId"
                value={formData.kpiTemplateId}
                onChange={handleKpiTemplateChange}
                className="flex-1 border border-white/10 bg-[#2A2A3D] text-white rounded px-3 py-2 text-sm font-black outline-none focus:border-[#00FFCC]"
              >
                <option value="">-- Default Appraisal Criteria --</option>
                {kpiTemplates.map(template => (
                  <option key={template.id} value={template.id}>{template.title}</option>
                ))}
              </select>
            </div>
          </div>

          <p className="text-sm text-[#B0B0C3] italic">
            Please provide a critical assessment of the performance of the employee within the review period using the following rating scale provide examples where applicable please use a separate sheet if required
          </p>

          {/* Rating Scale Legend */}
          <div className="grid grid-cols-5 border border-white/10 rounded text-[10px] font-black uppercase tracking-wider text-[#B0B0C3]">
            <div className="p-2 border-r border-white/10">
              <p className="font-black text-white">P</p>
              <p>Poor</p>
            </div>
            <div className="p-2 border-r border-white/10">
              <p className="font-black text-white">NI</p>
              <p>Need Improvement</p>
            </div>
            <div className="p-2 border-r border-white/10">
              <p className="font-black text-white">G</p>
              <p>Good</p>
            </div>
            <div className="p-2 border-r border-white/10">
              <p className="font-black text-white">VG</p>
              <p>Very Good</p>
            </div>
            <div className="p-2">
              <p className="font-black text-white">E</p>
              <p>Excellent</p>
            </div>
          </div>

          {/* Section A */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-black text-white uppercase tracking-tight">A ASSESSMENT OF GOALS OBJECTIVES SET DURING THE REVIEW PERIOD</h2>
              <button 
                onClick={addSectionA}
                className="no-print bg-[#2A2A3D] text-[#00FFCC] px-3 py-1.5 rounded text-sm font-black uppercase hover:bg-[#3A3A5D] border border-[#00FFCC]/20 flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Add KPI
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse border border-white/10">
                <thead>
                  <tr className="bg-[#1E1E2F] text-[10px] font-black uppercase tracking-wider text-[#B0B0C3]">
                    <th className="p-2 border border-white/10">Criteria</th>
                    <th className="p-2 border border-white/10 text-center">Score Input</th>
                    <th className="p-2 border border-white/10 text-center">Max Score</th>
                    <th className="p-2 border border-white/10">Comments and examples</th>
                    <th className="p-2 border border-white/10 w-10 text-center no-print">Act</th>
                  </tr>
                </thead>
                <tbody>
                  {sectionA.map((item) => (
                    <tr key={item.id} className="text-sm">
                      <td className="p-2 border border-white/10 font-black text-white">
                        <input 
                          type="text"
                          value={item.criteria}
                          onChange={(e) => updateSectionAField(item.id, 'criteria', e.target.value)}
                          className="w-full bg-transparent border-none outline-none text-white"
                          placeholder="Enter KPI criteria"
                        />
                      </td>
                      <td className="p-2 border border-white/10 text-center">
                        <input 
                          type="number" 
                          value={item.score}
                          onChange={(e) => {
                            let val = parseInt(e.target.value) || 0;
                            if (item.maxScore && val > item.maxScore) val = item.maxScore;
                            if (val < 0) val = 0;
                            updateSectionA(item.id, val);
                          }}
                          className="w-20 text-center border border-white/10 bg-[#1E1E2F] text-white rounded px-2 py-1 outline-none focus:border-[#00FFCC]"
                        />
                      </td>
                      <td className="p-2 border border-white/10 text-center text-[#B0B0C3] font-black">
                        <input 
                          type="number"
                          value={item.maxScore || 12}
                          onChange={(e) => updateSectionAField(item.id, 'maxScore', parseInt(e.target.value) || 0)}
                          className="w-16 text-center bg-transparent border-none outline-none text-[#B0B0C3]"
                        />
                      </td>
                      <td className="p-2 border border-white/10">
                        <textarea 
                          value={item.comments}
                          onChange={(e) => updateSectionA(item.id, item.rating, e.target.value)}
                          className="w-full border-none outline-none bg-transparent resize-none min-h-[40px] text-white"
                        />
                      </td>
                      <td className="p-2 border border-white/10 text-center no-print">
                        <button 
                          onClick={() => removeSectionA(item.id)}
                          className="p-1.5 text-red-400 hover:bg-[#3A3A5D] rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-[#1E1E2F] font-black text-white">
                    <td colSpan={1} className="p-2 border border-white/10 text-right">Total score</td>
                    <td className="p-2 border border-white/10 text-center bg-[#00FFCC]/20 text-[#00FFCC]">{totalA}</td>
                    <td className="p-2 border border-white/10 text-center text-[#B0B0C3]">
                      {sectionA.reduce((sum, item) => sum + (item.maxScore || 12), 0)}
                    </td>
                    <td className="p-2 border border-white/10"></td>
                    <td className="p-2 border border-white/10 no-print"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section B */}
          <div className="space-y-4">
            <h2 className="text-lg font-black text-white uppercase tracking-tight">B ASSESSMENT OF OTHER PERFORMANCE STANDARDS AND INDICATORS</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse border border-white/10">
                <thead>
                  <tr className="bg-[#1E1E2F] text-[10px] font-black uppercase tracking-wider text-[#B0B0C3]">
                    <th className="p-2 border border-white/10">Criteria</th>
                    <th className="p-2 border border-white/10 text-center">P (2)</th>
                    <th className="p-2 border border-white/10 text-center">NI (4)</th>
                    <th className="p-2 border border-white/10 text-center">G (6)</th>
                    <th className="p-2 border border-white/10 text-center">VG (9)</th>
                    <th className="p-2 border border-white/10 text-center">E (10)</th>
                    <th className="p-2 border border-white/10 text-center">Score</th>
                    <th className="p-2 border border-white/10">Comments and examples</th>
                  </tr>
                </thead>
                <tbody>
                  {sectionB.map((item) => (
                    <tr key={item.id} className="text-sm">
                      <td className="p-2 border border-white/10 font-black text-white">{item.criteria}</td>
                      {[2, 4, 6, 9, 10].map(val => (
                        <td key={val} className="p-2 border border-white/10 text-center">
                          <input 
                            type="radio" 
                            name={`sectionB-${item.id}`} 
                            checked={item.rating === val}
                            onChange={() => updateSectionB(item.id, val)}
                            className="w-4 h-4 text-[#00FFCC] accent-[#00FFCC]"
                          />
                        </td>
                      ))}
                      <td className="p-2 border border-white/10">
                        <input 
                          type="number" 
                          value={item.score}
                          readOnly
                          className="w-full text-center bg-[#1E1E2F]/50 border-none outline-none text-white"
                        />
                      </td>
                      <td className="p-2 border border-white/10">
                        <textarea 
                          value={item.comments}
                          onChange={(e) => updateSectionB(item.id, item.rating, e.target.value)}
                          className="w-full border-none outline-none bg-transparent resize-none min-h-[40px] text-white"
                        />
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-[#1E1E2F] font-black text-white">
                    <td colSpan={6} className="p-2 border border-white/10 text-right">Total score (maximum = 40)</td>
                    <td className="p-2 border border-white/10 text-center bg-[#00FFCC]/20 text-[#00FFCC]">{totalB}</td>
                    <td className="p-2 border border-white/10"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section C */}
          <div className="grid grid-cols-1 md:grid-cols-2 border border-white/10 rounded-2xl overflow-hidden">
            <div className="p-6 space-y-6 border-r border-white/10 bg-[#1E1E2F]/50">
              <h2 className="text-lg font-black text-white uppercase tracking-tight">C TOTAL SCORE</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] font-black text-[#B0B0C3] uppercase tracking-wider">Total score (score a + score b)</p>
                  <p className="text-2xl font-black text-[#00FFCC]">{totalA} + {totalB} = {grandTotal}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-[#B0B0C3] uppercase tracking-wider">Classification of employee:</p>
                  <p className="text-lg font-black text-white uppercase tracking-tight">{getClassification(grandTotal)}</p>
                  <p className="text-[10px] text-[#B0B0C3] mt-1">EE (80-100) | AE (75-85) | UE (0-70)</p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <h2 className="text-[10px] font-black text-[#B0B0C3] uppercase tracking-wider">Overall comments recommendations by reviewer</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-white">Name:</span>
                  <input type="text" name="reviewerName" value={formData.reviewerName} onChange={handleFormChange} className="flex-1 border-b border-white/10 bg-transparent outline-none text-sm text-white" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-white">Signature:</span>
                  <input type="text" name="reviewerSignature" value={formData.reviewerSignature} onChange={handleFormChange} className="flex-1 border-b border-white/10 bg-transparent outline-none text-sm text-white" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-white">Date:</span>
                  <input type="date" name="reviewDate" value={formData.reviewDate} onChange={handleFormChange} className="flex-1 border-b border-white/10 bg-transparent outline-none text-sm text-white" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-white">Next review period:</span>
                  <input type="text" name="nextReviewPeriod" value={formData.nextReviewPeriod} onChange={handleFormChange} className="flex-1 border-b border-white/10 bg-transparent outline-none text-sm text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Section D */}
          <div className="space-y-4">
            <h2 className="text-lg font-black text-white uppercase tracking-tight">D COMMENTS BY EMPLOYEE</h2>
            <textarea 
              name="employeeComments"
              value={formData.employeeComments}
              onChange={handleFormChange}
              placeholder="Maximum 500 words"
              className="w-full border border-white/10 bg-[#1E1E2F] text-white rounded-lg p-4 text-sm min-h-[100px] outline-none focus:border-[#00FFCC]"
            />
          </div>

          {/* Section E */}
          <div className="space-y-4">
            <h2 className="text-lg font-black text-white uppercase tracking-tight">E DEVELOPMENT PLAN</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse border border-white/10">
                <thead>
                  <tr className="bg-[#1E1E2F] text-[10px] font-black uppercase tracking-wider text-[#B0B0C3]">
                    <th className="p-2 border border-white/10 w-1/4">Recommended areas for improvement development</th>
                    <th className="p-2 border border-white/10 w-1/5">Expected outcome(s)</th>
                    <th className="p-2 border border-white/10 w-1/5">Responsible person(s) to assist in the achievement of the plan</th>
                    <th className="p-2 border border-white/10">Start date</th>
                    <th className="p-2 border border-white/10">End date</th>
                    <th className="p-2 border border-white/10 w-20 no-print">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {developmentPlans.map((plan) => (
                    <tr key={plan.id}>
                      <td className="p-2 border border-white/10">
                        <textarea 
                          value={plan.improvement}
                          onChange={(e) => setDevelopmentPlans(developmentPlans.map(p => p.id === plan.id ? { ...p, improvement: e.target.value } : p))}
                          className="w-full bg-transparent border-none outline-none text-xs resize-none min-h-[60px] text-white"
                        />
                      </td>
                      <td className="p-2 border border-white/10">
                        <textarea 
                          value={plan.outcome}
                          onChange={(e) => setDevelopmentPlans(developmentPlans.map(p => p.id === plan.id ? { ...p, outcome: e.target.value } : p))}
                          className="w-full bg-transparent border-none outline-none text-xs resize-none min-h-[60px] text-white"
                        />
                      </td>
                      <td className="p-2 border border-white/10">
                        <input 
                          type="text"
                          value={plan.responsible}
                          onChange={(e) => setDevelopmentPlans(developmentPlans.map(p => p.id === plan.id ? { ...p, responsible: e.target.value } : p))}
                          className="w-full bg-transparent border-none outline-none text-xs text-white"
                        />
                      </td>
                      <td className="p-2 border border-white/10">
                        <input 
                          type="date"
                          value={plan.startDate}
                          onChange={(e) => setDevelopmentPlans(developmentPlans.map(p => p.id === plan.id ? { ...p, startDate: e.target.value } : p))}
                          className="w-full bg-transparent border-none outline-none text-xs text-white"
                        />
                      </td>
                      <td className="p-2 border border-white/10">
                        <input 
                          type="date"
                          value={plan.endDate}
                          onChange={(e) => setDevelopmentPlans(developmentPlans.map(p => p.id === plan.id ? { ...p, endDate: e.target.value } : p))}
                          className="w-full bg-transparent border-none outline-none text-xs text-white"
                        />
                      </td>
                      <td className="p-2 border border-white/10 text-center no-print">
                        <div className="flex justify-center gap-1">
                          <button onClick={addDevPlan} className="p-1 bg-[#2A2A3D] text-[#00FFCC] rounded border border-[#00FFCC]/20"><Plus className="w-3 h-3" /></button>
                          <button onClick={() => removeDevPlan(plan.id)} className="p-1 bg-[#2A2A3D] text-red-400 rounded border border-red-400/20"><Trash2 className="w-3 h-3" /></button>
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
            <h2 className="text-lg font-black text-white uppercase tracking-tight">F KEY GOALS FOR NEXT REVIEW PERIOD</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse border border-white/10">
                <thead>
                  <tr className="bg-[#1E1E2F] text-[10px] font-black uppercase tracking-wider text-[#B0B0C3]">
                    <th className="p-2 border border-white/10">Goal (s) set and agreed on with employee</th>
                    <th className="p-2 border border-white/10 w-1/3">Proposed completion period</th>
                    <th className="p-2 border border-white/10 w-20 no-print">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {keyGoals.map((goal) => (
                    <tr key={goal.id}>
                      <td className="p-2 border border-white/10">
                        <textarea 
                          value={goal.goal}
                          onChange={(e) => setKeyGoals(keyGoals.map(g => g.id === goal.id ? { ...g, goal: e.target.value } : g))}
                          className="w-full bg-transparent border-none outline-none text-sm resize-none min-h-[80px] text-white"
                        />
                      </td>
                      <td className="p-2 border border-white/10">
                        <input 
                          type="date"
                          value={goal.period}
                          onChange={(e) => setKeyGoals(keyGoals.map(g => g.id === goal.id ? { ...g, period: e.target.value } : g))}
                          className="w-full bg-transparent border-none outline-none text-sm text-white"
                        />
                      </td>
                      <td className="p-2 border border-white/10 text-center no-print">
                        <div className="flex justify-center gap-1">
                          <button onClick={addKeyGoal} className="p-1 bg-[#2A2A3D] text-[#00FFCC] rounded border border-[#00FFCC]/20"><Plus className="w-3 h-3" /></button>
                          <button onClick={() => removeKeyGoal(goal.id)} className="p-1 bg-[#2A2A3D] text-red-400 rounded border border-red-400/20"><Trash2 className="w-3 h-3" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-8 no-print">
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="bg-[#00FFCC] text-[#1E1E2F] px-8 py-2 rounded-lg font-black uppercase hover:bg-[#00D1FF] transition-colors flex items-center gap-2 disabled:opacity-50 shadow-[0_0_8px_rgba(0,255,204,0.4)]"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isSaving ? 'Saving...' : 'Save Appraisal'}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: #1E1E2F !important; color: #FFFFFF !important; }
          .print\:shadow-none { box-shadow: none !important; }
          .print\:border-none { border: none !important; }
          .print\:p-0 { padding: 0 !important; }
          input[type="radio"] { appearance: none; border: 1px solid #FFFFFF; width: 12px; height: 12px; border-radius: 50%; position: relative; }
          input[type="radio"]:checked::after { content: ""; position: absolute; top: 2px; left: 2px; width: 6px; height: 6px; background: #FFFFFF; border-radius: 50%; }
        }
      `}</style>
    </AdminLayout>
  );
}

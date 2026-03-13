import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, Save, X, Target } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { useTheme } from '../../context/ThemeContext';

export interface KPIIndicator {
  id: string;
  name: string;
  description: string;
  maxScore: number;
}

export interface KPITemplate {
  id: string;
  title: string;
  indicators: KPIIndicator[];
}

export default function KPIs() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const [templates, setTemplates] = useState<KPITemplate[]>(() => {
    const saved = localStorage.getItem('kpi_templates');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error parsing kpi_templates:", e);
      }
    }
    return [
      {
        id: '1',
        title: 'General Employee Performance',
        indicators: [
          { id: 'i1', name: 'Quality of Work', description: 'Accuracy and thoroughness of work', maxScore: 10 },
          { id: 'i2', name: 'Timeliness', description: 'Meeting deadlines', maxScore: 10 },
          { id: 'i3', name: 'Communication', description: 'Effectiveness of communication', maxScore: 10 }
        ]
      }
    ];
  });

  const [editingTemplate, setEditingTemplate] = useState<KPITemplate | null>(null);

  useEffect(() => {
    localStorage.setItem('kpi_templates', JSON.stringify(templates));
  }, [templates]);

  const handleCreate = () => {
    setEditingTemplate({
      id: Math.random().toString(36).substr(2, 9),
      title: 'New KPI Template',
      indicators: []
    });
  };

  const handleSave = () => {
    if (editingTemplate) {
      setTemplates(prev => {
        const exists = prev.find(t => t.id === editingTemplate.id);
        if (exists) {
          return prev.map(t => t.id === editingTemplate.id ? editingTemplate : t);
        }
        return [...prev, editingTemplate];
      });
      setEditingTemplate(null);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this KPI template?')) {
      setTemplates(prev => prev.filter(t => t.id !== id));
    }
  };

  const addIndicator = () => {
    if (editingTemplate) {
      setEditingTemplate({
        ...editingTemplate,
        indicators: [
          ...editingTemplate.indicators,
          { id: Math.random().toString(36).substr(2, 9), name: '', description: '', maxScore: 10 }
        ]
      });
    }
  };

  const updateIndicator = (id: string, field: keyof KPIIndicator, value: any) => {
    if (editingTemplate) {
      setEditingTemplate({
        ...editingTemplate,
        indicators: editingTemplate.indicators.map(ind => 
          ind.id === id ? { ...ind, [field]: value } : ind
        )
      });
    }
  };

  const removeIndicator = (id: string) => {
    if (editingTemplate) {
      setEditingTemplate({
        ...editingTemplate,
        indicators: editingTemplate.indicators.filter(ind => ind.id !== id)
      });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
            <Target className="w-6 h-6 text-[#00FFCC]" />
            KPI Management
          </h2>
          {!editingTemplate && (
            <button 
              onClick={handleCreate}
              className="bg-[#00FFCC] text-[#1E1E2F] px-4 py-2 rounded-lg text-sm font-black uppercase hover:bg-[#00D1FF] flex items-center gap-2 shadow-[0_0_8px_rgba(0,255,204,0.4)]"
            >
              <Plus className="w-4 h-4" />
              Create KPI Template
            </button>
          )}
        </div>

        {editingTemplate ? (
          <div className="bg-[#2A2A3D] rounded-2xl border border-white/5 shadow-[0_4px_20px_rgba(0,255,204,0.05)] p-6 space-y-6">
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <h3 className="text-lg font-black text-white uppercase tracking-tight">Edit KPI Template</h3>
              <div className="flex gap-2">
                <button 
                  onClick={() => setEditingTemplate(null)}
                  className="px-4 py-2 rounded-lg text-sm font-black text-[#B0B0C3] hover:bg-[#3A3A5D] transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSave}
                  className="bg-[#00FFCC] text-[#1E1E2F] px-4 py-2 rounded-lg text-sm font-black uppercase hover:bg-[#00D1FF] shadow-[0_0_8px_rgba(0,255,204,0.4)] flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Template
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-[#B0B0C3] uppercase tracking-wider mb-1">Template Title</label>
                <input 
                  type="text" 
                  value={editingTemplate.title}
                  onChange={(e) => setEditingTemplate({...editingTemplate, title: e.target.value})}
                  className="w-full border border-white/10 bg-[#1E1E2F] text-white rounded-lg px-4 py-2 text-sm outline-none focus:border-[#00FFCC] transition-all"
                  placeholder="e.g., Software Engineer Performance"
                />
              </div>

              <div className="pt-4">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-black text-white uppercase tracking-tight">KPI Indicators (Custom Fields)</h4>
                  <button 
                    onClick={addIndicator}
                    className="bg-[#2A2A3D] text-[#00FFCC] px-3 py-1.5 rounded text-sm font-black uppercase hover:bg-[#3A3A5D] flex items-center gap-1.5 border border-[#00FFCC]/20"
                  >
                    <Plus className="w-4 h-4" />
                    Add Indicator
                  </button>
                </div>

                <div className="space-y-3">
                  {editingTemplate.indicators.map((ind, index) => (
                    <div key={ind.id} className="p-4 rounded-lg border border-white/5 bg-[#1E1E2F]/50 flex gap-4 items-start">
                      <div className="flex-1 space-y-3">
                        <div className="flex gap-4">
                          <div className="flex-1">
                            <label className="block text-[10px] font-black text-[#B0B0C3] uppercase tracking-wider mb-1">Indicator Name</label>
                            <input 
                              type="text" 
                              value={ind.name}
                              onChange={(e) => updateIndicator(ind.id, 'name', e.target.value)}
                              className="w-full border border-white/10 bg-[#2A2A3D] text-white rounded px-3 py-1.5 text-sm outline-none focus:border-[#00FFCC]"
                              placeholder="e.g., Code Quality"
                            />
                          </div>
                          <div className="w-32">
                            <label className="block text-[10px] font-black text-[#B0B0C3] uppercase tracking-wider mb-1">Max Score</label>
                            <input 
                              type="number" 
                              value={ind.maxScore}
                              onChange={(e) => updateIndicator(ind.id, 'maxScore', parseInt(e.target.value) || 0)}
                              className="w-full border border-white/10 bg-[#2A2A3D] text-white rounded px-3 py-1.5 text-sm outline-none focus:border-[#00FFCC]"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-[#B0B0C3] uppercase tracking-wider mb-1">Description / Target</label>
                          <input 
                            type="text" 
                            value={ind.description}
                            onChange={(e) => updateIndicator(ind.id, 'description', e.target.value)}
                            className="w-full border border-white/10 bg-[#2A2A3D] text-white rounded px-3 py-1.5 text-sm outline-none focus:border-[#00FFCC]"
                            placeholder="e.g., Maintain less than 5 bugs per release"
                          />
                        </div>
                      </div>
                      <button 
                        onClick={() => removeIndicator(ind.id)}
                        className="p-2 text-red-400 hover:bg-[#3A3A5D] rounded mt-6"
                        title="Remove Indicator"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                  {editingTemplate.indicators.length === 0 && (
                    <div className="text-center py-8 text-[#B0B0C3] text-sm border-2 border-dashed rounded-lg border-white/10">
                      No indicators added yet. Click "Add Indicator" to create custom fields.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map(template => (
              <div key={template.id} className="bg-[#2A2A3D] rounded-2xl border border-white/5 shadow-[0_4px_20px_rgba(0,255,204,0.05)] overflow-hidden flex flex-col">
                <div className="p-5 border-b border-white/5 flex justify-between items-start">
                  <div>
                    <h3 className="font-black text-white uppercase tracking-tight text-lg">{template.title}</h3>
                    <p className="text-sm text-[#B0B0C3] mt-1">{template.indicators.length} Indicators</p>
                  </div>
                  <div className="flex gap-1">
                    <button 
                      onClick={() => setEditingTemplate(template)}
                      className="p-1.5 text-[#B0B0C3] hover:text-[#00FFCC] hover:bg-[#3A3A5D] rounded transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(template.id)}
                      className="p-1.5 text-[#B0B0C3] hover:text-red-400 hover:bg-[#3A3A5D] rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="p-5 flex-1 bg-[#1E1E2F]/50">
                  <ul className="space-y-2">
                    {template.indicators.slice(0, 4).map(ind => (
                      <li key={ind.id} className="text-sm flex justify-between items-center">
                        <span className="text-[#B0B0C3] truncate pr-4">{ind.name}</span>
                        <span className="text-[10px] font-black text-[#00FFCC] bg-[#2A2A3D] px-2 py-0.5 rounded">Max: {ind.maxScore}</span>
                      </li>
                    ))}
                    {template.indicators.length > 4 && (
                      <li className="text-xs text-[#B0B0C3] italic pt-2">
                        + {template.indicators.length - 4} more indicators
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            ))}
            {templates.length === 0 && (
              <div className="col-span-full text-center py-12 text-[#B0B0C3] border-2 border-dashed rounded-2xl border-white/10">
                <Target className="w-12 h-12 mx-auto text-[#B0B0C3] mb-3" />
                <p className="text-lg font-black uppercase tracking-tight">No KPI Templates Found</p>
                <p className="text-sm mt-1">Create your first KPI template to start evaluating employees.</p>
                <button 
                  onClick={handleCreate}
                  className="mt-4 bg-[#00FFCC] text-[#1E1E2F] px-4 py-2 rounded-lg text-sm font-black uppercase hover:bg-[#00D1FF] shadow-[0_0_8px_rgba(0,255,204,0.4)] inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create KPI Template
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

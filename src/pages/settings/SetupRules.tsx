import React, { useState, useEffect} from 'react';
import AdminLayout from '../../components/AdminLayout';
import { useSettings, Language, Currency} from '../../context/SettingsContext';
import { useAuth} from '../../context/AuthContext';
import { useTheme} from '../../context/ThemeContext';
import { 
 Plus, 
 Trash2, 
 Edit2, 
 Save, 
 X, 
 Bell, 
 Clock, 
 MessageSquare, 
 AlertCircle, 
 CheckCircle2, 
 RefreshCw,
 ToggleLeft,
 ToggleRight
} from 'lucide-react';
import { motion} from 'motion/react';

interface AlertSettings {
 company_id: string;
 office_time: string;
 grace_time: string;
 trigger_time: string;
 message_template: string;
 is_active: boolean;
}

interface IdleAlertSettings {
 company_id: string;
 idle_minutes: number;
 message_template: string;
 is_active: boolean;
}

interface WelcomeMessageSettings {
 company_id: string;
 is_active: boolean;
 message_template: string;
}

export default function SetupRules() {
 const {
 language, setLanguage, languages, addLanguage, updateLanguage, deleteLanguage,
 currency, setCurrency, currencies, addCurrency, updateCurrency, deleteCurrency,
 tax, setTax,
 timeZone, setTimeZone
} = useSettings();

 const { user} = useAuth();
 const { colorPalette, setColorPalette, palettes, portalDesign, setPortalDesign} = useTheme();

 const [editingLang, setEditingLang] = useState<string | null>(null);
 const [editLangData, setEditLangData] = useState<Language>({ code: '', name: ''});
 const [newLang, setNewLang] = useState<Language>({ code: '', name: ''});
 const [showAddLang, setShowAddLang] = useState(false);

 const [editingCurr, setEditingCurr] = useState<string | null>(null);
 const [editCurrData, setEditCurrData] = useState<Currency>({ code: '', symbol: '', name: ''});
 const [newCurr, setNewCurr] = useState<Currency>({ code: '', symbol: '', name: ''});
 const [showAddCurr, setShowAddCurr] = useState(false);

 // Attendance Alert Settings
 const [alertSettings, setAlertSettings] = useState<AlertSettings>({
 company_id: user?.companyId || '',
 office_time: '09:00 AM',
 grace_time: '09:15 AM',
 trigger_time: '09:16 AM',
 message_template: 'Dear {{employee_name}}, you have not marked your attendance. Please mark it immediately.',
 is_active: false
});

 // Idle Alert Settings
 const [idleSettings, setIdleSettings] = useState<IdleAlertSettings>({
 company_id: user?.companyId || '',
 idle_minutes: 5,
 message_template: 'Dear {{employee_name}}, you have been inactive for {{idle_minutes}} minutes. Please resume your tasks.',
 is_active: false
});

 // Welcome Message Settings
 const [welcomeSettings, setWelcomeSettings] = useState<WelcomeMessageSettings>({
 company_id: user?.companyId || '',
 is_active: false,
 message_template:"Dear {{employee_name}},\n\nWelcome to our company! 🎉\nWe’re excited to have you join our winning team.\n\nYour login details are:\nUsername: {{username}}\nPassword: {{password}}\n\nPlease log in and update your password.\n\nLet’s achieve great things together!"
});

 const [loadingAlerts, setLoadingAlerts] = useState(true);
 const [savingAlerts, setSavingAlerts] = useState(false);
 const [alertMessage, setAlertMessage] = useState<{ type: 'success' | 'error', text: string} | null>(null);

 useEffect(() => {
 console.log(`[SetupRules] useEffect triggered. companyId: ${user?.companyId}, user exists: ${!!user}`);
 if (user?.companyId) {
 fetchAllAlertSettings();
} else if (user) {
 setLoadingAlerts(false);
}
}, [user?.companyId, user]);

 const fetchAllAlertSettings = async () => {
 console.log(`[SetupRules] Fetching all alert settings for company: ${user?.companyId}`);
 try {
 const [attendanceRes, idleRes, welcomeRes] = await Promise.all([
 fetch(`/api/attendance-alerts/${user?.companyId}`),
 fetch(`/api/idle-alerts/${user?.companyId}`),
 fetch(`/api/welcome-messages/${user?.companyId}`)
 ]);

 if (attendanceRes.ok) {
 const data = await attendanceRes.json();
 console.log(`[SetupRules] Attendance settings fetched:`, data);
 setAlertSettings({
 ...data,
 is_active: data.is_active === 1
});
}

 if (idleRes.ok) {
 const data = await idleRes.json();
 console.log(`[SetupRules] Idle settings fetched:`, data);
 setIdleSettings({
 ...data,
 is_active: data.is_active === 1
});
}

 if (welcomeRes.ok) {
 const data = await welcomeRes.json();
 console.log(`[SetupRules] Welcome settings fetched:`, data);
 setWelcomeSettings({
 ...data,
 is_active: data.is_active === 1
});
}
} catch (error) {
 console.error('[SetupRules] Error fetching alert settings:', error);
} finally {
 setLoadingAlerts(false);
}
};

 const handleToggleWelcome = async () => {
 const newStatus = !welcomeSettings.is_active;
 console.log(`[WelcomeMessage] Toggling status to: ${newStatus}`);
 
 // Optimistically update UI
 setWelcomeSettings(prev => ({ ...prev, is_active: newStatus}));

 if (!user?.companyId) {
 console.error('[WelcomeMessage] No company ID found');
 return;
}

 try {
 console.log(`[WelcomeMessage] Sending API request to save status...`);
 const response = await fetch(`/api/welcome-messages/${user.companyId}`, {
 method: 'POST',
 headers: { 'Content-Type': 'application/json'},
 body: JSON.stringify({
 ...welcomeSettings,
 is_active: newStatus,
 company_id: user.companyId
})
});

 const data = await response.json();
 console.log(`[WelcomeMessage] API Response:`, data);

 if (!response.ok) {
 throw new Error(data.error || 'Failed to update setting');
}

 // Ensure state is synced with what backend returned
 if (data.settings) {
 setWelcomeSettings({
 ...data.settings,
 is_active: data.settings.is_active === 1
});
 console.log(`[WelcomeMessage] State synced with DB:`, data.settings.is_active === 1);
}
} catch (error) {
 console.error('[WelcomeMessage] Error saving toggle:', error);
 // Revert UI on error
 setWelcomeSettings(prev => ({ ...prev, is_active: !newStatus}));
 setAlertMessage({ type: 'error', text: 'Failed to update toggle. Please try again.'});
}
};

 const handleSaveAlerts = async () => {
 setSavingAlerts(true);
 setAlertMessage(null);
 try {
 const [attendanceRes, idleRes, welcomeRes] = await Promise.all([
 fetch('/api/attendance-alerts', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json'},
 body: JSON.stringify({
 ...alertSettings,
 company_id: user?.companyId
})
}),
 fetch(`/api/idle-alerts/${user?.companyId}`, {
 method: 'POST',
 headers: { 'Content-Type': 'application/json'},
 body: JSON.stringify({
 ...idleSettings,
 company_id: user?.companyId
})
}),
 fetch(`/api/welcome-messages/${user?.companyId}`, {
 method: 'POST',
 headers: { 'Content-Type': 'application/json'},
 body: JSON.stringify({
 ...welcomeSettings,
 company_id: user?.companyId
})
})
 ]);

 if (attendanceRes.ok && idleRes.ok && welcomeRes.ok) {
 setAlertMessage({ type: 'success', text: 'All alert rules saved successfully!'});
} else {
 throw new Error('Failed to save settings');
}
} catch (error) {
 setAlertMessage({ type: 'error', text: 'Error saving settings. Please try again.'});
} finally {
 setSavingAlerts(false);
}
};

 const handleSaveLang = () => {
 if (editingLang) {
 updateLanguage(editingLang, editLangData);
 setEditingLang(null);
}
};

 const handleAddLang = () => {
 if (newLang.code && newLang.name) {
 addLanguage(newLang);
 setNewLang({ code: '', name: ''});
 setShowAddLang(false);
}
};

 const handleSaveCurr = () => {
 if (editingCurr) {
 updateCurrency(editingCurr, editCurrData);
 setEditingCurr(null);
}
};

 const handleAddCurr = () => {
 if (newCurr.code && newCurr.symbol && newCurr.name) {
 addCurrency(newCurr);
 setNewCurr({ code: '', symbol: '', name: ''});
 setShowAddCurr(false);
}
};

 return (
 <AdminLayout>
 <div className="p-6 max-w-6xl mx-auto space-y-8">
 <div>
 <h1 className="text-2xl font-bold text-gray-900">Rules</h1>
 <p className="text-gray-500 mt-1">Configure global application settings and business rules.</p>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
 {/* Languages Section */}
 <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
 <div className="flex justify-between items-center mb-4">
 <h2 className="text-lg font-semibold text-gray-900">Languages</h2>
 <button
 onClick={() => setShowAddLang(true)}
 className="text-sm flex items-center text-indigo-600 hover:text-indigo-700"
 >
 <Plus className="w-4 h-4 mr-1"/> Add Language
 </button>
 </div>

 <div className="space-y-4">
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-1">Active Language</label>
 <select
 value={language.code}
 onChange={(e) => {
 const selected = languages.find(l => l.code === e.target.value);
 if (selected) setLanguage(selected);
}}
 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
 >
 {languages.map(lang => (
 <option key={lang.code} value={lang.code}>{lang.name} ({lang.code})</option>
 ))}
 </select>
 </div>

 <div className="border-t border-gray-200 pt-4">
 <h3 className="text-sm font-medium text-gray-700 mb-2">Manage Languages</h3>
 <ul className="space-y-2">
 {languages.map(lang => (
 <li key={lang.code} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
 {editingLang === lang.code ? (
 <div className="flex items-center space-x-2 w-full">
 <input
 type="text"
 value={editLangData.code}
 onChange={e => setEditLangData({ ...editLangData, code: e.target.value})}
 className="w-20 px-2 py-1 text-sm border rounded"
 placeholder="Code"
 />
 <input
 type="text"
 value={editLangData.name}
 onChange={e => setEditLangData({ ...editLangData, name: e.target.value})}
 className="flex-1 px-2 py-1 text-sm border rounded"
 placeholder="Name"
 />
 <button onClick={handleSaveLang} className="p-1 text-green-600 hover:text-green-700"><Save className="w-4 h-4"/></button>
 <button onClick={() => setEditingLang(null)} className="p-1 text-gray-400 hover:text-gray-500"><X className="w-4 h-4"/></button>
 </div>
 ) : (
 <>
 <span className="text-sm text-gray-900">{lang.name} <span className="text-gray-500">({lang.code})</span></span>
 <div className="flex items-center space-x-2">
 <button
 onClick={() => { setEditingLang(lang.code); setEditLangData(lang);}}
 className="p-1 text-gray-400 hover:text-indigo-600"
 >
 <Edit2 className="w-4 h-4"/>
 </button>
 <button
 onClick={() => deleteLanguage(lang.code)}
 className="p-1 text-gray-400 hover:text-red-600"
 disabled={languages.length === 1}
 >
 <Trash2 className="w-4 h-4"/>
 </button>
 </div>
 </>
 )}
 </li>
 ))}
 </ul>

 {showAddLang && (
 <div className="mt-3 flex items-center space-x-2 bg-indigo-50 p-3 rounded-lg border border-indigo-100">
 <input
 type="text"
 value={newLang.code}
 onChange={e => setNewLang({ ...newLang, code: e.target.value})}
 className="w-20 px-2 py-1 text-sm border rounded"
 placeholder="Code (e.g. de)"
 />
 <input
 type="text"
 value={newLang.name}
 onChange={e => setNewLang({ ...newLang, name: e.target.value})}
 className="flex-1 px-2 py-1 text-sm border rounded"
 placeholder="Name (e.g. German)"
 />
 <button onClick={handleAddLang} className="p-1 text-green-600 hover:text-green-700"><Save className="w-4 h-4"/></button>
 <button onClick={() => setShowAddLang(false)} className="p-1 text-gray-400 hover:text-gray-500"><X className="w-4 h-4"/></button>
 </div>
 )}
 </div>
 </div>
 </div>

 {/* Currencies Section */}
 <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
 <div className="flex justify-between items-center mb-4">
 <h2 className="text-lg font-semibold text-gray-900">Currencies</h2>
 <button
 onClick={() => setShowAddCurr(true)}
 className="text-sm flex items-center text-indigo-600 hover:text-indigo-700"
 >
 <Plus className="w-4 h-4 mr-1"/> Add Currency
 </button>
 </div>

 <div className="space-y-4">
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-1">Active Currency</label>
 <select
 value={currency.code}
 onChange={(e) => {
 const selected = currencies.find(c => c.code === e.target.value);
 if (selected) setCurrency(selected);
}}
 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
 >
 {currencies.map(curr => (
 <option key={curr.code} value={curr.code}>{curr.name} ({curr.symbol})</option>
 ))}
 </select>
 </div>

 <div className="border-t border-gray-200 pt-4">
 <h3 className="text-sm font-medium text-gray-700 mb-2">Manage Currencies</h3>
 <ul className="space-y-2">
 {currencies.map(curr => (
 <li key={curr.code} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
 {editingCurr === curr.code ? (
 <div className="flex items-center space-x-2 w-full">
 <input
 type="text"
 value={editCurrData.code}
 onChange={e => setEditCurrData({ ...editCurrData, code: e.target.value})}
 className="w-16 px-2 py-1 text-sm border rounded"
 placeholder="Code"
 />
 <input
 type="text"
 value={editCurrData.symbol}
 onChange={e => setEditCurrData({ ...editCurrData, symbol: e.target.value})}
 className="w-12 px-2 py-1 text-sm border rounded"
 placeholder="Sym"
 />
 <input
 type="text"
 value={editCurrData.name}
 onChange={e => setEditCurrData({ ...editCurrData, name: e.target.value})}
 className="flex-1 px-2 py-1 text-sm border rounded"
 placeholder="Name"
 />
 <button onClick={handleSaveCurr} className="p-1 text-green-600 hover:text-green-700"><Save className="w-4 h-4"/></button>
 <button onClick={() => setEditingCurr(null)} className="p-1 text-gray-400 hover:text-gray-500"><X className="w-4 h-4"/></button>
 </div>
 ) : (
 <>
 <span className="text-sm text-gray-900">{curr.name} <span className="text-gray-500">({curr.code} - {curr.symbol})</span></span>
 <div className="flex items-center space-x-2">
 <button
 onClick={() => { setEditingCurr(curr.code); setEditCurrData(curr);}}
 className="p-1 text-gray-400 hover:text-indigo-600"
 >
 <Edit2 className="w-4 h-4"/>
 </button>
 <button
 onClick={() => deleteCurrency(curr.code)}
 className="p-1 text-gray-400 hover:text-red-600"
 disabled={currencies.length === 1}
 >
 <Trash2 className="w-4 h-4"/>
 </button>
 </div>
 </>
 )}
 </li>
 ))}
 </ul>

 {showAddCurr && (
 <div className="mt-3 flex items-center space-x-2 bg-indigo-50 p-3 rounded-lg border border-indigo-100">
 <input
 type="text"
 value={newCurr.code}
 onChange={e => setNewCurr({ ...newCurr, code: e.target.value})}
 className="w-16 px-2 py-1 text-sm border rounded"
 placeholder="Code"
 />
 <input
 type="text"
 value={newCurr.symbol}
 onChange={e => setNewCurr({ ...newCurr, symbol: e.target.value})}
 className="w-12 px-2 py-1 text-sm border rounded"
 placeholder="Sym"
 />
 <input
 type="text"
 value={newCurr.name}
 onChange={e => setNewCurr({ ...newCurr, name: e.target.value})}
 className="flex-1 px-2 py-1 text-sm border rounded"
 placeholder="Name"
 />
 <button onClick={handleAddCurr} className="p-1 text-green-600 hover:text-green-700"><Save className="w-4 h-4"/></button>
 <button onClick={() => setShowAddCurr(false)} className="p-1 text-gray-400 hover:text-gray-500"><X className="w-4 h-4"/></button>
 </div>
 )}
 </div>
 </div>
 </div>

 {/* Tax & Time Section */}
 <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
 <h2 className="text-lg font-semibold text-gray-900 mb-4">Tax & Time Settings</h2>
 
 <div className="space-y-6">
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-1">Global Tax Rate (%)</label>
 <input
 type="number"
 value={tax || ''}
 onChange={(e) => setTax(e.target.value ? parseFloat(e.target.value) : 0)}
 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
 />
 </div>

 <div>
 <label className="block text-sm font-medium text-gray-700 mb-1">Time Zone</label>
 <select
 value={timeZone}
 onChange={(e) => setTimeZone(e.target.value)}
 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
 >
 {Intl.supportedValuesOf('timeZone').map(tz => (
 <option key={tz} value={tz}>{tz}</option>
 ))}
 </select>
 </div>
 </div>
 </div>

 {/* Appearance Section */}
 <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
 <h2 className="text-lg font-semibold text-gray-900 mb-4">Appearance</h2>
 
 <div className="space-y-6">
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-2">Color Palette</label>
 <div className="flex flex-wrap gap-3">
 {palettes.map(palette => (
 <button
 key={palette.id}
 onClick={() => setColorPalette(palette.id)}
 className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${colorPalette === palette.id ? 'border-gray-900 ' : 'border-transparent'}`}
 style={{ backgroundColor: palette.primary}}
 title={palette.name}
 >
 {colorPalette === palette.id && <div className="w-3 h-3 bg-white rounded-full mix-blend-difference"/>}
 </button>
 ))}
 </div>
 </div>

 <div>
 <label className="block text-sm font-medium text-gray-700 mb-2">Portal Design</label>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 {[
 { id: 'cosmic', name: 'Cosmic', desc: 'Deep space atmosphere with soft glows'},
 { id: 'aurora', name: 'Aurora', desc: 'Vibrant northern lights gradients'},
 { id: 'cyber', name: 'Cyber', desc: 'High-tech neon grid aesthetic'}
 ].map((design) => (
 <button
 key={design.id}
 onClick={() => setPortalDesign(design.id as any)}
 className={`relative overflow-hidden rounded-xl p-4 border-2 text-left transition-all ${
 portalDesign === design.id 
 ? 'border-indigo-500 bg-indigo-50 ' 
 : 'border-gray-200 hover:border-gray-300 '
}`}
 >
 <div className={`absolute inset-0 opacity-10 ${
 design.id === 'cosmic' ? 'bg-gradient-to-br from-indigo-500 to-purple-500' :
 design.id === 'aurora' ? 'bg-gradient-to-tr from-emerald-400 to-cyan-500' :
 'bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:16px_16px]'
}`} />
 <div className="relative z-10">
 <h3 className={`font-semibold ${portalDesign === design.id ? 'text-indigo-700 ' : 'text-gray-900 '}`}>
 {design.name}
 </h3>
 <p className="text-xs text-gray-500 mt-1">{design.desc}</p>
 </div>
 {portalDesign === design.id && (
 <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-indigo-500"/>
 )}
 </button>
 ))}
 </div>
 </div>
 </div>
 </div>
 </div>

 {/* WhatsApp Rules Section */}
 <div id="whatsapp-rules"className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
 <div className="flex items-center gap-3 mb-6">
 <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
 <Bell className="w-6 h-6 text-emerald-500"/>
 </div>
 <div>
 <h2 className="text-xl font-bold text-gray-900">WhatsApp Rules</h2>
 <p className="text-sm text-gray-500">Configure automated WhatsApp alerts and business rules.</p>
 </div>
 </div>

 {loadingAlerts ? (
 <div className="flex items-center justify-center py-12">
 <RefreshCw className="w-8 h-8 animate-spin text-indigo-500"/>
 </div>
 ) : (
 <div className="space-y-8">
 {/* Attendance Alert Settings */}
 <div className="border-t border-gray-100 pt-6">
 <div className="flex items-center justify-between mb-6">
 <div className="flex items-center gap-2">
 <Clock className="w-5 h-5 text-indigo-500"/>
 <h3 className="text-lg font-bold">Attendance Alerts</h3>
 </div>
 <div className="flex items-center gap-3">
 <span className="text-sm font-medium text-gray-500">
 {alertSettings.is_active ? 'Active' : 'Disabled'}
 </span>
 <button 
 onClick={() => setAlertSettings({ ...alertSettings, is_active: !alertSettings.is_active})}
 className="transition-colors"
 >
 {alertSettings.is_active ? (
 <ToggleRight className="w-8 h-8 text-emerald-500"/>
 ) : (
 <ToggleLeft className="w-8 h-8 text-gray-300"/>
 )}
 </button>
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
 <div>
 <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Office Time</label>
 <input
 type="text"
 value={alertSettings.office_time}
 onChange={(e) => setAlertSettings({ ...alertSettings, office_time: e.target.value})}
 placeholder="09:00 AM"
 className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
 />
 </div>
 <div>
 <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Grace Time</label>
 <input
 type="text"
 value={alertSettings.grace_time}
 onChange={(e) => setAlertSettings({ ...alertSettings, grace_time: e.target.value})}
 placeholder="09:15 AM"
 className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
 />
 </div>
 <div>
 <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Trigger Time</label>
 <input
 type="text"
 value={alertSettings.trigger_time}
 onChange={(e) => setAlertSettings({ ...alertSettings, trigger_time: e.target.value})}
 placeholder="09:16 AM"
 className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
 />
 </div>
 </div>

 <div className="space-y-4 mb-6">
 <div>
 <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Message Template</label>
 <textarea
 value={alertSettings.message_template}
 onChange={(e) => setAlertSettings({ ...alertSettings, message_template: e.target.value})}
 rows={3}
 className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
 />
 <p className="text-[10px] text-gray-400 mt-2">
 Available variables: <code className="bg-gray-100 px-1 rounded">{"{{employee_name}}"}</code>
 </p>
 </div>
 </div>

 <div className="flex items-center justify-between pt-4 border-t border-gray-100">
 <div className="flex items-center gap-3">
 <button
 onClick={handleSaveAlerts}
 disabled={savingAlerts}
 className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-bold rounded-lg shadow-sm transition-all"
 >
 {savingAlerts ? <RefreshCw className="w-4 h-4 animate-spin"/> : <Save className="w-4 h-4"/>}
 Save Alert Rules
 </button>
 {alertMessage && (
 <motion.div
 initial={{ opacity: 0, x: -10}}
 animate={{ opacity: 1, x: 0}}
 className={`flex items-center gap-2 text-xs font-medium ${
 alertMessage.type === 'success' ? 'text-emerald-600' : 'text-red-600'
}`}
 >
 {alertMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4"/> : <AlertCircle className="w-4 h-4"/>}
 {alertMessage.text}
 </motion.div>
 )}
 </div>
 <div className="p-3 bg-amber-50 rounded-lg border border-amber-100 flex items-start gap-3 max-w-md">
 <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5"/>
 <p className="text-[10px] text-amber-800 leading-relaxed">
 <strong>Logic:</strong> If an employee has not checked in by <strong>{alertSettings.grace_time}</strong>, 
 an automated alert will be sent at <strong>{alertSettings.trigger_time}</strong>.
 </p>
 </div>
 </div>
 </div>

 {/* Idle Detection Alert Settings */}
 <div className="border-t border-gray-100 pt-8">
 <div className="flex items-center justify-between mb-6">
 <div className="flex items-center gap-2">
 <AlertCircle className="w-5 h-5 text-amber-500"/>
 <h3 className="text-lg font-bold">Idle Detection Alerts</h3>
 </div>
 <div className="flex items-center gap-3">
 <span className="text-sm font-medium text-gray-500">
 {idleSettings.is_active ? 'Active' : 'Disabled'}
 </span>
 <button 
 onClick={() => setIdleSettings({ ...idleSettings, is_active: !idleSettings.is_active})}
 className="transition-colors"
 >
 {idleSettings.is_active ? (
 <ToggleRight className="w-8 h-8 text-emerald-500"/>
 ) : (
 <ToggleLeft className="w-8 h-8 text-gray-300"/>
 )}
 </button>
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
 <div>
 <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Idle Threshold (Minutes)</label>
 <select
 value={idleSettings.idle_minutes}
 onChange={(e) => setIdleSettings({ ...idleSettings, idle_minutes: parseInt(e.target.value)})}
 className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
 >
 <option value={5}>5 Minutes</option>
 <option value={10}>10 Minutes</option>
 <option value={15}>15 Minutes</option>
 <option value={30}>30 Minutes</option>
 <option value={60}>60 Minutes</option>
 </select>
 </div>
 </div>

 <div className="space-y-4 mb-6">
 <div>
 <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Message Template</label>
 <textarea
 value={idleSettings.message_template}
 onChange={(e) => setIdleSettings({ ...idleSettings, message_template: e.target.value})}
 rows={3}
 className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
 />
 <p className="text-[10px] text-gray-400 mt-2">
 Available variables: <code className="bg-gray-100 px-1 rounded">{"{{employee_name}}"}</code>, <code className="bg-gray-100 px-1 rounded">{"{{idle_minutes}}"}</code>
 </p>
 </div>
 </div>

 <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 flex items-start gap-3 max-w-md">
 <MessageSquare className="w-4 h-4 text-blue-600 shrink-0 mt-0.5"/>
 <p className="text-[10px] text-blue-800 leading-relaxed">
 <strong>Logic:</strong> If an employee is inactive for more than <strong>{idleSettings.idle_minutes} minutes</strong>, 
 a WhatsApp alert will be sent automatically. Alerts are sent once per idle session.
 </p>
 </div>
 </div>

 {/* Employee Welcome Message Settings */}
 <div className="border-t border-gray-100 pt-8">
 <div className="flex items-center justify-between mb-6">
 <div className="flex items-center gap-2">
 <Plus className="w-5 h-5 text-emerald-500"/>
 <h3 className="text-lg font-bold">New Employee Welcome Message</h3>
 </div>
 <div className="flex items-center gap-3">
 <span className="text-sm font-medium text-gray-500">
 {welcomeSettings.is_active ? 'Active' : 'Disabled'}
 </span>
 <button 
 onClick={handleToggleWelcome}
 className="transition-colors"
 >
 {welcomeSettings.is_active ? (
 <ToggleRight className="w-8 h-8 text-emerald-500"/>
 ) : (
 <ToggleLeft className="w-8 h-8 text-gray-300"/>
 )}
 </button>
 </div>
 </div>

 <div className="space-y-4 mb-6">
 <div>
 <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Welcome Message Template</label>
 <textarea
 value={welcomeSettings.message_template}
 onChange={(e) => setWelcomeSettings({ ...welcomeSettings, message_template: e.target.value})}
 rows={8}
 className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none font-mono text-sm"
 />
 <p className="text-[10px] text-gray-400 mt-2">
 Available variables: <code className="bg-gray-100 px-1 rounded">{"{{employee_name}}"}</code>, <code className="bg-gray-100 px-1 rounded">{"{{username}}"}</code>, <code className="bg-gray-100 px-1 rounded">{"{{password}}"}</code>
 </p>
 </div>
 </div>

 <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100 flex items-start gap-3 max-w-md">
 <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5"/>
 <p className="text-[10px] text-emerald-800 leading-relaxed">
 <strong>Logic:</strong> When a new employee is created, an automated WhatsApp welcome message will be sent with their login credentials.
 </p>
 </div>
 </div>
 </div>
 )}
 </div>
 </div>
 </AdminLayout>
 );
}

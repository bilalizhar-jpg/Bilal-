import React, { useMemo, useState} from 'react';
import AdminLayout from '../../components/AdminLayout';
import { useCompanyData} from '../../context/CompanyDataContext';
import { 
 BarChart, 
 Bar, 
 XAxis, 
 YAxis, 
 CartesianGrid, 
 Tooltip, 
 Legend, 
 ResponsiveContainer, 
 PieChart, 
 Pie, 
 Cell,
 LineChart,
 Line
} from 'recharts';
import { Download, Filter, Calendar} from 'lucide-react';

export default function ProjectReports() {
 const { projects, milestones, tasks, bids} = useCompanyData();
  const [activeTab, setActiveTab] = useState<'projects' | 'bidders'>('projects');

 // --- Data Processing for Charts ---

 // 1. Project Status Distribution
 const projectStatusData = useMemo(() => {
 const statusCounts: Record<string, number> = {};
 projects.forEach((p: any) => {
 const status = p.status || 'Unknown';
 statusCounts[status] = (statusCounts[status] || 0) + 1;
});
 return Object.keys(statusCounts).map(status => ({
 name: status,
 value: statusCounts[status]
}));
}, [projects]);

 // 2. Milestone Completion Status
 const milestoneStatusData = useMemo(() => {
 const statusCounts: Record<string, number> = {};
 milestones.forEach((m: any) => {
 const status = m.status || 'Pending';
 statusCounts[status] = (statusCounts[status] || 0) + 1;
});
 return Object.keys(statusCounts).map(status => ({
 name: status,
 value: statusCounts[status]
}));
}, [milestones]);

 // 3. Projects by Priority
 const projectPriorityData = useMemo(() => {
 const priorityCounts: Record<string, number> = {};
 projects.forEach((p: any) => {
 const priority = p.priority || 'Medium'; 
 priorityCounts[priority] = (priorityCounts[priority] || 0) + 1;
});
 return Object.keys(priorityCounts).map(priority => ({
 name: priority,
 value: priorityCounts[priority]
}));
}, [projects]);

 // 4. Task Completion by Project (Top 5 Projects)
 const taskCompletionByProject = useMemo(() => {
 const projectTaskStats: Record<string, { total: number, completed: number}> = {};
 
 tasks.forEach((t: any) => {
 if (!t.projectId) return;
 if (!projectTaskStats[t.projectId]) {
 const project = projects.find(p => p.id === t.projectId);
 projectTaskStats[t.projectId] = { total: 0, completed: 0};
}
 
 projectTaskStats[t.projectId].total += 1;
 if (t.status === 'Completed') {
 projectTaskStats[t.projectId].completed += 1;
}
});

 return Object.keys(projectTaskStats).map(projectId => {
 const project = projects.find(p => p.id === projectId);
 const stats = projectTaskStats[projectId];
 return {
 name: project ? project.companyName : 'Unknown', // Using companyName as project name based on previous context
 completed: stats.completed,
 remaining: stats.total - stats.completed
};
}).slice(0, 5); // Top 5
}, [tasks, projects]);


 const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

 // --- Bidder Data Processing ---
 const totalBids = bids?.length || 0;
 const totalConnects = bids?.reduce((sum, bid: any) => sum + (Number(bid.connectsToBid) || 0), 0) || 0;
 const totalBoosted = bids?.reduce((sum, bid: any) => sum + (Number(bid.boostedConnects) || 0), 0) || 0;
 const totalHired = bids?.filter((bid: any) => bid.isHired).length || 0;

 const bidsBySourceData = useMemo(() => {
 const sourceCounts: Record<string, number> = {};
 (bids || []).forEach((b: any) => {
 const source = b.source || 'Unknown';
 sourceCounts[source] = (sourceCounts[source] || 0) + 1;
});
 return Object.keys(sourceCounts).map(source => ({
 name: source,
 value: sourceCounts[source]
}));
}, [bids]);

 const bidsByEmployeeData = useMemo(() => {
 const empCounts: Record<string, number> = {};
 (bids || []).forEach((b: any) => {
 const emp = b.employeeName || 'Unknown';
 empCounts[emp] = (empCounts[emp] || 0) + 1;
});
 return Object.keys(empCounts).map(emp => ({
 name: emp,
 value: empCounts[emp]
}));
}, [bids]);

 const bidsByProfileData = useMemo(() => {
 const profileCounts: Record<string, number> = {};
 (bids || []).forEach((b: any) => {
 const profile = b.profile || 'Unknown';
 profileCounts[profile] = (profileCounts[profile] || 0) + 1;
});
 return Object.keys(profileCounts).map(profile => ({
 name: profile,
 value: profileCounts[profile]
}));
}, [bids]);

 return (
 <AdminLayout>
 <div className="space-y-6">
 {/* Header */}
 <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
 <div>
 <h2 className="text-2xl font-bold text-slate-800">Reports</h2>
 <p className="text-xs text-slate-500 mt-1">Home &gt; Project Management &gt; Reports</p>
 </div>
 <div className="flex gap-2">
 <button className={`px-4 py-2 rounded-lg text-sm font-medium border flex items-center gap-2 bg-white border-slate-200 text-slate-700`}>
 <Calendar className="w-4 h-4"/>
 Last 30 Days
 </button>
 <button className={`px-4 py-2 rounded-lg text-sm font-medium border flex items-center gap-2 bg-white border-slate-200 text-slate-700`}>
 <Filter className="w-4 h-4"/>
 Filter
 </button>
 <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-indigo-700">
 <Download className="w-4 h-4"/>
 Export PDF
 </button>
 </div>
 </div>

 {/* Tabs */}
 <div className="flex gap-4 border-b border-slate-200">
 <button
 onClick={() => setActiveTab('projects')}
 className={`pb-3 text-sm font-medium transition-colors relative ${
 activeTab === 'projects' 
 ? 'text-indigo-600 ' 
 : 'text-slate-500 hover:text-slate-700 '
}`}
 >
 Project Reports
 {activeTab === 'projects' && (
 <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-full"/>
 )}
 </button>
 <button
 onClick={() => setActiveTab('bidders')}
 className={`pb-3 text-sm font-medium transition-colors relative ${
 activeTab === 'bidders' 
 ? 'text-indigo-600 ' 
 : 'text-slate-500 hover:text-slate-700 '
}`}
 >
 Bidder Reports
 {activeTab === 'bidders' && (
 <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-full"/>
 )}
 </button>
 </div>

 {activeTab === 'projects' ? (
 <>
 {/* Key Metrics Cards */}
 <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
 <div className={`p-4 rounded-xl border bg-white border-slate-200 shadow-sm`}>
 <h3 className="text-slate-500 text-xs font-bold uppercase mb-2">Total Projects</h3>
 <p className={`text-2xl font-bold text-slate-800`}>{projects.length}</p>
 </div>
 <div className={`p-4 rounded-xl border bg-white border-slate-200 shadow-sm`}>
 <h3 className="text-slate-500 text-xs font-bold uppercase mb-2">Active Milestones</h3>
 <p className={`text-2xl font-bold text-slate-800`}>
 {milestones.filter((m: any) => m.status === 'In Progress').length}
 </p>
 </div>
 <div className={`p-4 rounded-xl border bg-white border-slate-200 shadow-sm`}>
 <h3 className="text-slate-500 text-xs font-bold uppercase mb-2">Completed Tasks</h3>
 <p className={`text-2xl font-bold text-slate-800`}>
 {tasks.filter((t: any) => t.status === 'Completed').length}
 </p>
 </div>
 <div className={`p-4 rounded-xl border bg-white border-slate-200 shadow-sm`}>
 <h3 className="text-slate-500 text-xs font-bold uppercase mb-2">Pending Tasks</h3>
 <p className={`text-2xl font-bold text-slate-800`}>
 {tasks.filter((t: any) => t.status !== 'Completed').length}
 </p>
 </div>
 </div>

 {/* Charts Section */}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
 
 {/* Project Status Distribution */}
 <div className={`p-6 rounded-xl border bg-white border-slate-200 shadow-sm`}>
 <h3 className={`text-lg font-bold mb-6 text-slate-800`}>Project Status Distribution</h3>
 <div className="h-80">
 <ResponsiveContainer width="100%"height="100%">
 <PieChart>
 <Pie
 data={projectStatusData}
 cx="50%"
 cy="50%"
 labelLine={false}
 label={({ name, percent}) =>`${name} ${(percent * 100).toFixed(0)}%`}
 outerRadius={80}
 fill="#8884d8"
 dataKey="value"
 >
 {projectStatusData.map((entry, index) => (
 <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
 ))}
 </Pie>
 <Tooltip contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', color: '#000'}} />
 <Legend />
 </PieChart>
 </ResponsiveContainer>
 </div>
 </div>

 {/* Milestone Status */}
 <div className={`p-6 rounded-xl border bg-white border-slate-200 shadow-sm`}>
 <h3 className={`text-lg font-bold mb-6 text-slate-800`}>Milestone Status</h3>
 <div className="h-80">
 <ResponsiveContainer width="100%"height="100%">
 <BarChart data={milestoneStatusData}>
 <CartesianGrid strokeDasharray="3 3"stroke={'#e2e8f0'} />
 <XAxis dataKey="name"stroke={'#64748b'} />
 <YAxis stroke={'#64748b'} />
 <Tooltip contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', color: '#000'}} />
 <Legend />
 <Bar dataKey="value"fill="#82ca9d"name="Milestones"radius={[4, 4, 0, 0]} />
 </BarChart>
 </ResponsiveContainer>
 </div>
 </div>

 {/* Task Completion by Project */}
 <div className={`p-6 rounded-xl border bg-white border-slate-200 shadow-sm lg:col-span-2`}>
 <h3 className={`text-lg font-bold mb-6 text-slate-800`}>Task Completion by Project (Top 5)</h3>
 <div className="h-80">
 <ResponsiveContainer width="100%"height="100%">
 <BarChart data={taskCompletionByProject}>
 <CartesianGrid strokeDasharray="3 3"stroke={'#e2e8f0'} />
 <XAxis dataKey="name"stroke={'#64748b'} />
 <YAxis stroke={'#64748b'} />
 <Tooltip contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', color: '#000'}} />
 <Legend />
 <Bar dataKey="completed"stackId="a"fill="#10b981"name="Completed Tasks"/>
 <Bar dataKey="remaining"stackId="a"fill="#f59e0b"name="Remaining Tasks"/>
 </BarChart>
 </ResponsiveContainer>
 </div>
 </div>

 </div>
 </>
 ) : (
 <>
 {/* Bidder Metrics Cards */}
 <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
 <div className={`p-4 rounded-xl border bg-white border-slate-200 shadow-sm`}>
 <h3 className="text-slate-500 text-xs font-bold uppercase mb-2">Total Bids</h3>
 <p className={`text-2xl font-bold text-slate-800`}>{totalBids}</p>
 </div>
 <div className={`p-4 rounded-xl border bg-white border-slate-200 shadow-sm`}>
 <h3 className="text-slate-500 text-xs font-bold uppercase mb-2">Total Connects Spent</h3>
 <p className={`text-2xl font-bold text-slate-800`}>{totalConnects}</p>
 </div>
 <div className={`p-4 rounded-xl border bg-white border-slate-200 shadow-sm`}>
 <h3 className="text-slate-500 text-xs font-bold uppercase mb-2">Boosted Connects</h3>
 <p className={`text-2xl font-bold text-slate-800`}>{totalBoosted}</p>
 </div>
 <div className={`p-4 rounded-xl border bg-white border-slate-200 shadow-sm`}>
 <h3 className="text-slate-500 text-xs font-bold uppercase mb-2">Total Hired</h3>
 <p className={`text-2xl font-bold text-slate-800`}>{totalHired}</p>
 </div>
 </div>

 {/* Bidder Charts Section */}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
 
 {/* Bids by Source */}
 <div className={`p-6 rounded-xl border bg-white border-slate-200 shadow-sm`}>
 <h3 className={`text-lg font-bold mb-6 text-slate-800`}>Bids by Source</h3>
 <div className="h-80">
 <ResponsiveContainer width="100%"height="100%">
 <PieChart>
 <Pie
 data={bidsBySourceData}
 cx="50%"
 cy="50%"
 labelLine={false}
 label={({ name, percent}) =>`${name} ${(percent * 100).toFixed(0)}%`}
 outerRadius={80}
 fill="#8884d8"
 dataKey="value"
 >
 {bidsBySourceData.map((entry, index) => (
 <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
 ))}
 </Pie>
 <Tooltip contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', color: '#000'}} />
 <Legend />
 </PieChart>
 </ResponsiveContainer>
 </div>
 </div>

 {/* Bids by Profile */}
 <div className={`p-6 rounded-xl border bg-white border-slate-200 shadow-sm`}>
 <h3 className={`text-lg font-bold mb-6 text-slate-800`}>Bids by Profile</h3>
 <div className="h-80">
 <ResponsiveContainer width="100%"height="100%">
 <BarChart data={bidsByProfileData}>
 <CartesianGrid strokeDasharray="3 3"stroke={'#e2e8f0'} />
 <XAxis dataKey="name"stroke={'#64748b'} />
 <YAxis stroke={'#64748b'} />
 <Tooltip contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', color: '#000'}} />
 <Legend />
 <Bar dataKey="value"fill="#8884d8"name="Bids"radius={[4, 4, 0, 0]} />
 </BarChart>
 </ResponsiveContainer>
 </div>
 </div>

 {/* Bids by Employee */}
 <div className={`p-6 rounded-xl border bg-white border-slate-200 shadow-sm lg:col-span-2`}>
 <h3 className={`text-lg font-bold mb-6 text-slate-800`}>Bids by Employee</h3>
 <div className="h-80">
 <ResponsiveContainer width="100%"height="100%">
 <BarChart data={bidsByEmployeeData}>
 <CartesianGrid strokeDasharray="3 3"stroke={'#e2e8f0'} />
 <XAxis dataKey="name"stroke={'#64748b'} />
 <YAxis stroke={'#64748b'} />
 <Tooltip contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', color: '#000'}} />
 <Legend />
 <Bar dataKey="value"fill="#10b981"name="Bids"radius={[4, 4, 0, 0]} />
 </BarChart>
 </ResponsiveContainer>
 </div>
 </div>

 </div>
 </>
 )}
 </div>
 </AdminLayout>
 );
}

import React, { useState, useEffect } from 'react';
import { BarChart2, Mail, MousePointerClick, AlertCircle, Users, ArrowUpRight, Search, Download, ArrowLeft, Home } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import { useMarketing } from '../../context/MarketingContext';

export default function CampaignLogs() {
  const { campaigns, campaignLogs, getCampaignStats } = useMarketing();
  const [searchParams] = useSearchParams();
  const initialCampaignId = searchParams.get('campaignId') || '';
  const [selectedCampaign, setSelectedCampaign] = useState(initialCampaignId);
  const [searchTerm, setSearchTerm] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (campaigns.length > 0 && !selectedCampaign) {
      setSelectedCampaign(campaigns[0].id);
    }
  }, [campaigns, selectedCampaign]);

  // Reset page when campaign or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCampaign, searchTerm]);

  const stats = selectedCampaign ? getCampaignStats(selectedCampaign) : {
    sent: 0,
    delivered: 0,
    opened: 0,
    clicked: 0,
    bounced: 0,
    unsubscribed: 0,
    spam: 0
  };

  const calculatePercentage = (value: number, total: number) => {
    if (total === 0) return '0.0';
    return ((value / total) * 100).toFixed(1);
  };

  const filteredLogs = campaignLogs
    .filter(log => log.campaignId === selectedCampaign)
    .filter(log => 
      log.recipientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      log.recipientEmail.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const paginatedLogs = filteredLogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Opened':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400">Opened</span>;
      case 'Clicked':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400">Clicked</span>;
      case 'Bounced':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-400">Bounced</span>;
      case 'Unsubscribed':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-400">Unsubscribed</span>;
      case 'Delivered':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300">Delivered</span>;
      case 'Spam':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400">Spam</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300">{status}</span>;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-2">
          <Link to="/marketing" className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Menu
          </Link>
          <span className="text-slate-300 dark:text-slate-600">|</span>
          <Link to="/" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 transition-colors">
            <Home className="w-4 h-4" /> Back to Dashboard
          </Link>
        </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Campaign Logs & Reports</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Detailed performance metrics for your email campaigns</p>
        </div>
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <select 
            value={selectedCampaign}
            onChange={(e) => setSelectedCampaign(e.target.value)}
            className="flex-1 sm:w-64 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            {campaigns.length === 0 && <option value="">No campaigns available</option>}
            {campaigns.map(c => (
              <option key={c.id} value={c.id}>{c.name} ({new Date(c.date).toLocaleDateString()})</option>
            ))}
          </select>
          <button className="p-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors" title="Export Report">
            <Download className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Top Level Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-lg">
              <Mail className="w-6 h-6" />
            </div>
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Sent</span>
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">{(stats.sent || 0).toLocaleString()}</p>
          <div className="mt-2 flex items-center text-sm">
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">{calculatePercentage(stats.delivered, stats.sent)}%</span>
            <span className="text-slate-500 dark:text-slate-400 ml-2">Delivery Rate</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <ArrowUpRight className="w-6 h-6" />
            </div>
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Opens</span>
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">{(stats.opened || 0).toLocaleString()}</p>
          <div className="mt-2 flex items-center text-sm">
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">{calculatePercentage(stats.opened, stats.delivered)}%</span>
            <span className="text-slate-500 dark:text-slate-400 ml-2">Open Rate</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-lg">
              <MousePointerClick className="w-6 h-6" />
            </div>
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Clicks</span>
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">{(stats.clicked || 0).toLocaleString()}</p>
          <div className="mt-2 flex items-center text-sm">
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">{calculatePercentage(stats.clicked, stats.opened)}%</span>
            <span className="text-slate-500 dark:text-slate-400 ml-2">Click-to-Open Rate</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded-lg">
              <AlertCircle className="w-6 h-6" />
            </div>
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Issues</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{stats.bounced}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Bounces</p>
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{stats.unsubscribed}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Unsubs</p>
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{stats.spam}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Spam</p>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Activity Log */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Recipient Activity Log</h3>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search email or name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-sm focus:ring-1 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-3 font-medium">Recipient</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Opens</th>
                <th className="px-6 py-3 font-medium">Clicks</th>
                <th className="px-6 py-3 font-medium">Last Activity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {paginatedLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                    No activity logs found for this campaign.
                  </td>
                </tr>
              ) : (
                paginatedLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900 dark:text-white">{log.recipientName}</div>
                      <div className="text-slate-500 dark:text-slate-400 text-xs">{log.recipientEmail}</div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(log.status)}
                    </td>
                    <td className="px-6 py-4 text-slate-900 dark:text-white font-medium">{log.opens}</td>
                    <td className="px-6 py-4 text-slate-900 dark:text-white font-medium">{log.clicks}</td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{new Date(log.lastActivity).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {filteredLogs.length > 0 && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-sm">
            <span className="text-slate-500 dark:text-slate-400">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredLogs.length)} of {filteredLogs.length} entries
            </span>
            <div className="flex gap-1">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-slate-200 dark:border-slate-700 rounded-md text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button 
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 rounded-md ${
                    currentPage === page 
                      ? 'bg-indigo-600 text-white' 
                      : 'border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-slate-200 dark:border-slate-700 rounded-md text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
    </AdminLayout>
  );
}

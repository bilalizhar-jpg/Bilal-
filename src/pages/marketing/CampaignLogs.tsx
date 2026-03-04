import React, { useState } from 'react';
import { BarChart2, Mail, MousePointerClick, AlertCircle, Users, ArrowUpRight, Search, Download } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CampaignLogs() {
  const [selectedCampaign, setSelectedCampaign] = useState('1');

  const campaigns = [
    { id: '1', name: 'Q1 Product Update Newsletter', date: '2026-02-28' },
    { id: '2', name: 'Customer Feedback Survey', date: '2026-01-20' },
    { id: '3', name: 'Holiday Greetings', date: '2025-12-24' },
  ];

  const stats = {
    sent: 1250,
    delivered: 1242,
    opened: 845,
    clicked: 320,
    bounced: 8,
    unsubscribed: 12,
    spam: 2
  };

  const calculatePercentage = (value: number, total: number) => {
    return ((value / total) * 100).toFixed(1);
  };

  return (
    <div className="space-y-6">
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
            {campaigns.map(c => (
              <option key={c.id} value={c.id}>{c.name} ({c.date})</option>
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
          <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.sent.toLocaleString()}</p>
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
          <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.opened.toLocaleString()}</p>
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
          <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.clicked.toLocaleString()}</p>
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
              {/* Mock Data Rows */}
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-medium text-slate-900 dark:text-white">John Doe</div>
                  <div className="text-slate-500 dark:text-slate-400 text-xs">john.doe@example.com</div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400">Opened</span>
                </td>
                <td className="px-6 py-4 text-slate-900 dark:text-white font-medium">2</td>
                <td className="px-6 py-4 text-slate-900 dark:text-white font-medium">1</td>
                <td className="px-6 py-4 text-slate-500 dark:text-slate-400">2026-02-28 10:45 AM</td>
              </tr>
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-medium text-slate-900 dark:text-white">Jane Smith</div>
                  <div className="text-slate-500 dark:text-slate-400 text-xs">jane.smith@example.com</div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400">Clicked</span>
                </td>
                <td className="px-6 py-4 text-slate-900 dark:text-white font-medium">1</td>
                <td className="px-6 py-4 text-slate-900 dark:text-white font-medium">3</td>
                <td className="px-6 py-4 text-slate-500 dark:text-slate-400">2026-02-28 11:20 AM</td>
              </tr>
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-medium text-slate-900 dark:text-white">Robert Johnson</div>
                  <div className="text-slate-500 dark:text-slate-400 text-xs">robert.j@example.com</div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-400">Bounced</span>
                </td>
                <td className="px-6 py-4 text-slate-900 dark:text-white font-medium">0</td>
                <td className="px-6 py-4 text-slate-900 dark:text-white font-medium">0</td>
                <td className="px-6 py-4 text-slate-500 dark:text-slate-400">2026-02-28 10:01 AM</td>
              </tr>
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-medium text-slate-900 dark:text-white">Emily Davis</div>
                  <div className="text-slate-500 dark:text-slate-400 text-xs">emily.d@example.com</div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-400">Unsubscribed</span>
                </td>
                <td className="px-6 py-4 text-slate-900 dark:text-white font-medium">1</td>
                <td className="px-6 py-4 text-slate-900 dark:text-white font-medium">0</td>
                <td className="px-6 py-4 text-slate-500 dark:text-slate-400">2026-02-28 02:15 PM</td>
              </tr>
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-medium text-slate-900 dark:text-white">Michael Wilson</div>
                  <div className="text-slate-500 dark:text-slate-400 text-xs">m.wilson@example.com</div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300">Delivered</span>
                </td>
                <td className="px-6 py-4 text-slate-900 dark:text-white font-medium">0</td>
                <td className="px-6 py-4 text-slate-900 dark:text-white font-medium">0</td>
                <td className="px-6 py-4 text-slate-500 dark:text-slate-400">2026-02-28 10:00 AM</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        {/* Pagination Mock */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-sm">
          <span className="text-slate-500 dark:text-slate-400">Showing 1 to 5 of 1,250 entries</span>
          <div className="flex gap-1">
            <button className="px-3 py-1 border border-slate-200 dark:border-slate-700 rounded-md text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50">Previous</button>
            <button className="px-3 py-1 bg-indigo-600 text-white rounded-md">1</button>
            <button className="px-3 py-1 border border-slate-200 dark:border-slate-700 rounded-md text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">2</button>
            <button className="px-3 py-1 border border-slate-200 dark:border-slate-700 rounded-md text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">3</button>
            <span className="px-2 py-1 text-slate-500 dark:text-slate-400">...</span>
            <button className="px-3 py-1 border border-slate-200 dark:border-slate-700 rounded-md text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}

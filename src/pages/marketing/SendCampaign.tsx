import React, { useState } from 'react';
import { Send, Users, Mail, Clock, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useMarketing } from '../../context/MarketingContext';

export default function SendCampaign() {
  const navigate = useNavigate();
  const { emailLists, addCampaign, addCampaignLog } = useMarketing();
  const [formData, setFormData] = useState({
    senderName: 'HRM Pro Team',
    senderEmail: 'hello@hrmpro.com',
    subject: 'Your Monthly Update is Here!',
    list: '',
    schedule: 'now',
    date: '',
    time: ''
  });

  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const lists = emailLists;

  const handleSend = async () => {
    setIsSending(true);
    
    // Create the campaign
    const campaignId = await addCampaign({
      name: formData.subject,
      date: new Date().toISOString(),
      subject: formData.subject,
      senderName: formData.senderName,
      senderEmail: formData.senderEmail,
      listId: formData.list,
      status: formData.schedule === 'now' ? 'Sent' : 'Scheduled',
      scheduleDate: formData.date,
      scheduleTime: formData.time
    });

    setIsSending(false);
    setIsSent(true);
  };

  if (isSent) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Campaign Sent Successfully!</h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-8">
          Your email campaign is now on its way to {lists.find(l => l.name === formData.list)?.count || 0} recipients. You can track its performance in the Campaign Logs.
        </p>
        <div className="flex gap-4">
          <Link 
            to="/marketing/campaigns"
            className="px-6 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-md font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            Back to Campaigns
          </Link>
          <Link 
            to="/marketing/logs"
            className="px-6 py-2 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700 transition-colors"
          >
            View Report
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Send Campaign</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Configure your email details and select recipients</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Sender Details */}
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <Mail className="w-5 h-5 text-indigo-500" />
              Sender Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Sender Name</label>
                <input 
                  type="text" 
                  value={formData.senderName}
                  onChange={(e) => setFormData({...formData, senderName: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Sender Email</label>
                <input 
                  type="email" 
                  value={formData.senderEmail}
                  onChange={(e) => setFormData({...formData, senderEmail: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Subject Line</label>
                <input 
                  type="text" 
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Recipients */}
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-500" />
              Recipients
            </h2>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Select Email List</label>
              <select 
                value={formData.list}
                onChange={(e) => setFormData({...formData, list: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="" disabled>Choose a list...</option>
                {lists.map(list => (
                  <option key={list.id} value={list.name}>{list.name} ({list.count.toLocaleString()} contacts)</option>
                ))}
              </select>
            </div>
          </div>

          {/* Schedule */}
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-500" />
              Schedule
            </h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="schedule" 
                    value="now"
                    checked={formData.schedule === 'now'}
                    onChange={(e) => setFormData({...formData, schedule: e.target.value})}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Send Now</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="schedule" 
                    value="later"
                    checked={formData.schedule === 'later'}
                    onChange={(e) => setFormData({...formData, schedule: e.target.value})}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Schedule for Later</span>
                </label>
              </div>

              {formData.schedule === 'later' && (
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date</label>
                    <input 
                      type="date" 
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Time</label>
                    <input 
                      type="time" 
                      value={formData.time}
                      onChange={(e) => setFormData({...formData, time: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Summary Sidebar */}
        <div className="space-y-6">
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 p-6 sticky top-6">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Campaign Summary</h3>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">Template:</span>
                <span className="font-medium text-slate-900 dark:text-white text-right truncate max-w-[150px]">New Campaign Template</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">Recipients:</span>
                <span className="font-medium text-slate-900 dark:text-white">
                  {formData.list ? lists.find(l => l.name === formData.list)?.count.toLocaleString() : '0'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">Schedule:</span>
                <span className="font-medium text-slate-900 dark:text-white capitalize">
                  {formData.schedule === 'now' ? 'Immediate' : `${formData.date} ${formData.time}`}
                </span>
              </div>
            </div>

            <button 
              onClick={handleSend}
              disabled={!formData.list || !formData.subject || isSending}
              className="w-full py-3 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSending ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  {formData.schedule === 'now' ? 'Send Campaign Now' : 'Schedule Campaign'}
                </>
              )}
            </button>
            
            <p className="text-xs text-center text-slate-500 dark:text-slate-400 mt-4">
              By sending this campaign, you agree to our anti-spam policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

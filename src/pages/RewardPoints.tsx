import React, { useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import { useTheme } from '../context/ThemeContext';
import { useEmployees } from '../context/EmployeeContext';
import { Target, Star, TrendingUp, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function RewardPoints() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { employees, updateEmployee } = useEmployees();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [points, setPoints] = useState(0);
  const [reason, setReason] = useState('');

  // Calculate total points distributed
  const totalPoints = employees.reduce((sum, emp) => sum + (emp.rewardPoints || 0), 0);

  // Sort employees by points for leaderboard
  const leaderboard = [...employees]
    .filter(emp => (emp.rewardPoints || 0) > 0)
    .sort((a, b) => (b.rewardPoints || 0) - (a.rewardPoints || 0))
    .map((emp, index) => ({
      ...emp,
      rank: index + 1
    }));

  const handleAwardPoints = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee || points <= 0) return;

    const employee = employees.find(emp => emp.id === selectedEmployee);
    if (employee) {
      const currentPoints = employee.rewardPoints || 0;
      await updateEmployee(employee.id, { rewardPoints: currentPoints + points });
      setIsModalOpen(false);
      setSelectedEmployee('');
      setPoints(0);
      setReason('');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Reward Points</h1>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Employee Recognition & Rewards</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Award Points
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className={`p-6 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-amber-100 dark:bg-amber-900/20 p-2 rounded-lg">
                <Star className="w-5 h-5 text-amber-600" />
              </div>
              <h3 className={`font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Total Points Distributed</h3>
            </div>
            <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{(totalPoints || 0).toLocaleString()}</p>
            <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-emerald-500" />
              Lifetime Total
            </p>
          </div>
        </div>

        <div className={`rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm overflow-hidden`}>
          <div className={`p-4 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
            <h2 className={`font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Reward Leaderboard</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {leaderboard.length === 0 ? (
                <p className={`text-center py-8 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>No points awarded yet.</p>
              ) : (
                leaderboard.map((user) => (
                  <div key={user.id} className={`flex items-center justify-between p-4 rounded-xl border ${isDark ? 'bg-slate-800/50 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                    <div className="flex items-center gap-4">
                      <span className="text-lg font-bold text-slate-400 w-8">#{user.rank}</span>
                      <img 
                        src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`} 
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover" 
                        referrerPolicy="no-referrer" 
                      />
                      <div>
                        <h4 className={`font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{user.name}</h4>
                        <p className="text-xs text-slate-500">{user.designation}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{user.rewardPoints}</div>
                      <div className="text-[10px] text-slate-500 uppercase font-bold">Points</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Award Points Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsModalOpen(false)}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              />
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className={`fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md shadow-2xl z-50 rounded-xl p-6 ${
                  isDark ? 'bg-slate-900 border border-slate-800' : 'bg-white'
                }`}
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Award Points</h2>
                  <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-500">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleAwardPoints} className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Select Employee</label>
                    <select
                      required
                      value={selectedEmployee}
                      onChange={(e) => setSelectedEmployee(e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg border outline-none ${
                        isDark 
                          ? 'bg-slate-800 border-slate-700 text-white' 
                          : 'bg-white border-slate-200 text-slate-900'
                      }`}
                    >
                      <option value="">Select an employee...</option>
                      {employees.map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.name} ({emp.employeeId})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Points</label>
                    <input
                      required
                      type="number"
                      min="1"
                      value={points}
                      onChange={(e) => setPoints(parseInt(e.target.value))}
                      className={`w-full px-3 py-2 rounded-lg border outline-none ${
                        isDark 
                          ? 'bg-slate-800 border-slate-700 text-white' 
                          : 'bg-white border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Reason</label>
                    <input
                      type="text"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="e.g. Project Completion"
                      className={`w-full px-3 py-2 rounded-lg border outline-none ${
                        isDark 
                          ? 'bg-slate-800 border-slate-700 text-white' 
                          : 'bg-white border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-medium transition-colors mt-4"
                  >
                    Award Points
                  </button>
                </form>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
}

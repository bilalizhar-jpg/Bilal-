import React from 'react';
import AdminLayout from '../components/AdminLayout';
import { useTheme } from '../context/ThemeContext';
import { Target, Star, TrendingUp } from 'lucide-react';

export default function RewardPoints() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const leaderboard = [
    { name: 'Honorato Imogene', points: 1250, rank: 1, avatar: 'https://picsum.photos/seed/user1/40/40' },
    { name: 'Maisha Lucy', points: 1100, rank: 2, avatar: 'https://picsum.photos/seed/user2/40/40' },
    { name: 'Amy Aphrodite', points: 950, rank: 3, avatar: 'https://picsum.photos/seed/user3/40/40' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className={`p-6 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-amber-100 dark:bg-amber-900/20 p-2 rounded-lg">
                <Star className="w-5 h-5 text-amber-600" />
              </div>
              <h3 className="font-bold text-slate-800 dark:text-white">Total Points Distributed</h3>
            </div>
            <p className="text-3xl font-bold text-slate-800 dark:text-white">45,800</p>
            <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-emerald-500" />
              +12% from last month
            </p>
          </div>
        </div>

        <div className={`rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm overflow-hidden`}>
          <div className="p-4 border-b border-slate-100 dark:border-slate-800">
            <h2 className="font-bold text-slate-800 dark:text-white">Reward Leaderboard</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {leaderboard.map((user) => (
                <div key={user.rank} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-4">
                    <span className="text-lg font-bold text-slate-400 w-6">#{user.rank}</span>
                    <img src={user.avatar} className="w-10 h-10 rounded-full object-cover" referrerPolicy="no-referrer" />
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-white">{user.name}</h4>
                      <p className="text-xs text-slate-500">Top Contributor</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{user.points}</div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold">Points</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

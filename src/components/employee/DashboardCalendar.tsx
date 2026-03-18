import React, { useState} from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Bell} from 'lucide-react';
import { Note} from './DashboardNotes';

interface DashboardCalendarProps {
 notes: Note[];
}

export function DashboardCalendar({ notes}: DashboardCalendarProps) {
 
 const [currentDate, setCurrentDate] = useState(new Date());

 const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
 const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

 const prevMonth = () => {
 setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
};

 const nextMonth = () => {
 setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
};

 const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
 const dayNames = ["Su","Mo","Tu","We","Th","Fr","Sa"];

 // Get notes with reminders for the current month
 const getRemindersForDay = (day: number) => {
 return notes.filter(note => {
 if (!note.reminderDate) return false;
 const reminderDate = new Date(note.reminderDate);
 return (
 reminderDate.getDate() === day &&
 reminderDate.getMonth() === currentDate.getMonth() &&
 reminderDate.getFullYear() === currentDate.getFullYear()
 );
});
};

 const renderCalendarDays = () => {
 const days = [];
 
 // Empty slots for days before the 1st
 for (let i = 0; i < firstDayOfMonth; i++) {
 days.push(<div key={`empty-${i}`} className="h-10 w-10"></div>);
}

 // Actual days
 for (let day = 1; day <= daysInMonth; day++) {
 const isToday = 
 day === new Date().getDate() && 
 currentDate.getMonth() === new Date().getMonth() && 
 currentDate.getFullYear() === new Date().getFullYear();

 const dayReminders = getRemindersForDay(day);
 const hasReminders = dayReminders.length > 0;

 days.push(
 <div 
 key={day} 
 className={`relative h-10 w-10 flex items-center justify-center rounded-full text-sm font-bold transition-all cursor-pointer group ${
 isToday 
 ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' 
 : 'text-slate-700 hover:bg-slate-100'
}`}
 >
 {day}
 {hasReminders && (
 <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white"></div>
 )}

 {/* Tooltip for reminders */}
 {hasReminders && (
 <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 rounded-xl bg-slate-800 text-white text-xs shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 pointer-events-none">
 <div className="font-bold mb-2 flex items-center gap-1 text-amber-400">
 <Bell className="w-3 h-3"/>
 Reminders
 </div>
 <ul className="space-y-1">
 {dayReminders.map(r => (
 <li key={r.id} className="truncate text-slate-300">{r.title}</li>
 ))}
 </ul>
 <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
 </div>
 )}
 </div>
 );
}

 return days;
};

 return (
 <div className={`p-8 rounded-3xl border flex flex-col h-full bg-white border-slate-100 shadow-xl shadow-slate-200/50`}>
 <div className="flex items-center justify-between mb-8">
 <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
 <CalendarIcon className="w-4 h-4 text-indigo-500"/>
 Calendar
 </h3>
 <div className="flex items-center gap-2">
 <button onClick={prevMonth} className={`p-1.5 rounded-lg transition-colors hover:bg-slate-100 text-slate-600`}>
 <ChevronLeft className="w-4 h-4"/>
 </button>
 <span className={`text-xs font-bold uppercase tracking-widest text-slate-800`}>
 {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
 </span>
 <button onClick={nextMonth} className={`p-1.5 rounded-lg transition-colors hover:bg-slate-100 text-slate-600`}>
 <ChevronRight className="w-4 h-4"/>
 </button>
 </div>
 </div>

 <div className="grid grid-cols-7 gap-y-4 gap-x-2 justify-items-center mb-2">
 {dayNames.map(day => (
 <div key={day} className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
 {day}
 </div>
 ))}
 {renderCalendarDays()}
 </div>

 <div className="mt-auto pt-6 border-t border-slate-100">
 <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
 <div className="w-2 h-2 rounded-full bg-amber-500"></div>
 Days with reminders
 </div>
 </div>
 </div>
 );
}

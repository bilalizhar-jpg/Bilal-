import React, { useState, useEffect} from 'react';
import { Search, Plus, Trash2, Edit2, Calendar as CalendarIcon, CheckCircle2, Circle, X} from 'lucide-react';
import { motion, AnimatePresence} from 'motion/react';

export interface Note {
 id: string;
 title: string;
 content: string;
 reminderDate: string | null;
 isDone: boolean;
 createdAt: string;
}

interface DashboardNotesProps {
 notes: Note[];
 setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
}

export function DashboardNotes({ notes, setNotes}: DashboardNotesProps) {
 
 const [searchQuery, setSearchQuery] = useState('');
 const [isModalOpen, setIsModalOpen] = useState(false);
 const [editingNote, setEditingNote] = useState<Note | null>(null);
 
 // Form state
 const [title, setTitle] = useState('');
 const [content, setContent] = useState('');
 const [reminderDate, setReminderDate] = useState('');

 const filteredNotes = notes.filter(note => 
 note.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
 note.content.toLowerCase().includes(searchQuery.toLowerCase())
 );

 const handleSaveNote = () => {
 if (!title.trim()) return;

 if (editingNote) {
 setNotes(notes.map(n => n.id === editingNote.id ? {
 ...n,
 title,
 content,
 reminderDate: reminderDate || null
} : n));
} else {
 const newNote: Note = {
 id: Date.now().toString(),
 title,
 content,
 reminderDate: reminderDate || null,
 isDone: false,
 createdAt: new Date().toISOString()
};
 setNotes([newNote, ...notes]);
}
 closeModal();
};

 const handleDelete = (id: string) => {
 setNotes(notes.filter(n => n.id !== id));
};

 const toggleDone = (id: string) => {
 setNotes(notes.map(n => n.id === id ? { ...n, isDone: !n.isDone} : n));
};

 const openEditModal = (note: Note) => {
 setEditingNote(note);
 setTitle(note.title);
 setContent(note.content);
 setReminderDate(note.reminderDate || '');
 setIsModalOpen(true);
};

 const closeModal = () => {
 setIsModalOpen(false);
 setEditingNote(null);
 setTitle('');
 setContent('');
 setReminderDate('');
};

 return (
 <div className={`p-8 rounded-3xl border flex flex-col h-full bg-white border-slate-100 shadow-xl shadow-slate-200/50`}>
 <div className="flex items-center justify-between mb-8">
 <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
 <Edit2 className="w-4 h-4 text-indigo-500"/>
 My Notes & Reminders
 </h3>
 <button 
 onClick={() => setIsModalOpen(true)}
 className="p-2 bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500/20 rounded-xl transition-colors"
 >
 <Plus className="w-5 h-5"/>
 </button>
 </div>

 <div className="relative mb-6">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/>
 <input
 type="text"
 placeholder="Search notes..."
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm font-medium outline-none transition-all ${
 'bg-slate-50 text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/20 border border-transparent'
}`}
 />
 </div>

 <div className="flex-1 overflow-y-auto pr-2 space-y-4 min-h-[300px] max-h-[400px] custom-scrollbar">
 {filteredNotes.length === 0 ? (
 <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
 <Edit2 className="w-8 h-8 opacity-20"/>
 <p className="text-xs font-bold uppercase tracking-widest">No notes found</p>
 </div>
 ) : (
 filteredNotes.map(note => (
 <div 
 key={note.id} 
 className={`p-5 rounded-2xl border transition-all group ${
 note.isDone 
 ? ('bg-slate-50 border-slate-100 opacity-60')
 : ('bg-white border-slate-200 hover:border-indigo-500/30 shadow-sm')
}`}
 >
 <div className="flex items-start justify-between gap-4">
 <button onClick={() => toggleDone(note.id)} className="mt-1 shrink-0">
 {note.isDone ? (
 <CheckCircle2 className="w-5 h-5 text-emerald-500"/>
 ) : (
 <Circle className="w-5 h-5 text-slate-400 hover:text-indigo-500 transition-colors"/>
 )}
 </button>
 <div className="flex-1 min-w-0">
 <h4 className={`text-sm font-bold truncate ${note.isDone ? 'line-through text-slate-500' : ('text-slate-800')}`}>
 {note.title}
 </h4>
 {note.content && (
 <p className={`text-xs mt-1 line-clamp-2 text-slate-500`}>
 {note.content}
 </p>
 )}
 {note.reminderDate && (
 <div className="flex items-center gap-1 mt-3 text-[10px] font-bold uppercase tracking-widest text-amber-500">
 <CalendarIcon className="w-3 h-3"/>
 {new Date(note.reminderDate).toLocaleString()}
 </div>
 )}
 </div>
 <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
 <button onClick={() => openEditModal(note)} className="p-1.5 text-slate-400 hover:text-indigo-500 hover:bg-indigo-500/10 rounded-lg transition-colors">
 <Edit2 className="w-4 h-4"/>
 </button>
 <button onClick={() => handleDelete(note.id)} className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors">
 <Trash2 className="w-4 h-4"/>
 </button>
 </div>
 </div>
 </div>
 ))
 )}
 </div>

 {/* Add/Edit Modal */}
 <AnimatePresence>
 {isModalOpen && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
 <motion.div 
 initial={{ opacity: 0, scale: 0.95}}
 animate={{ opacity: 1, scale: 1}}
 exit={{ opacity: 0, scale: 0.95}}
 className={`w-full max-w-md rounded-2xl shadow-xl overflow-hidden bg-white`}
 >
 <div className="p-6">
 <div className="flex items-center justify-between mb-6">
 <h2 className={`text-lg font-bold text-slate-900`}>
 {editingNote ? 'Edit Note' : 'Add Note'}
 </h2>
 <button onClick={closeModal} className="text-slate-400 hover:text-slate-500">
 <X className="w-5 h-5"/>
 </button>
 </div>

 <div className="space-y-4">
 <div>
 <label className={`block text-xs font-bold uppercase tracking-widest mb-2 text-slate-500`}>Title</label>
 <input
 type="text"
 value={title}
 onChange={(e) => setTitle(e.target.value)}
 placeholder="Note title..."
 className={`w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all ${
 'bg-slate-50 text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 border border-slate-200'
}`}
 />
 </div>
 <div>
 <label className={`block text-xs font-bold uppercase tracking-widest mb-2 text-slate-500`}>Content</label>
 <textarea
 value={content}
 onChange={(e) => setContent(e.target.value)}
 placeholder="Note content..."
 rows={4}
 className={`w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all resize-none ${
 'bg-slate-50 text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 border border-slate-200'
}`}
 />
 </div>
 <div>
 <label className={`block text-xs font-bold uppercase tracking-widest mb-2 text-slate-500`}>Reminder (Optional)</label>
 <input
 type="datetime-local"
 value={reminderDate}
 onChange={(e) => setReminderDate(e.target.value)}
 className={`w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all ${
 'bg-slate-50 text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 border border-slate-200'
}`}
 />
 </div>
 </div>

 <div className="flex justify-end gap-3 mt-8">
 <button 
 onClick={closeModal}
 className={`px-5 py-2.5 text-xs font-bold rounded-xl transition-colors text-slate-600 hover:bg-slate-100`}
 >
 Cancel
 </button>
 <button 
 onClick={handleSaveNote}
 disabled={!title.trim()}
 className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl transition-colors shadow-lg shadow-indigo-500/20"
 >
 Save Note
 </button>
 </div>
 </div>
 </motion.div>
 </div>
 )}
 </AnimatePresence>
 </div>
 );
}

import React, { useState, useEffect, useRef } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { useTheme } from '../../context/ThemeContext';
import { useChat, Chat } from '../../context/ChatContext';
import { useEmployees } from '../../context/EmployeeContext';
import { useAuth } from '../../context/AuthContext';
import { Search, Hash, Plus, Send, Video, Info, MoreVertical, Smile, Paperclip, X, Trash2, Users, UserPlus, MessageSquare, Phone } from 'lucide-react';

export default function Messages() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { employees } = useEmployees();
  const { chats, messages, activeChat, setActiveChat, sendMessage, sendInvitation, createGroup, deleteChat } = useChat();
  const isDark = theme === 'dark';

  const [newMessage, setNewMessage] = useState('');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    await sendMessage(newMessage);
    setNewMessage('');
  };

  const getChatName = (chat: Chat) => {
    if (chat.type === 'group') return chat.name;
    const otherUserId = chat.participants.find(p => p !== user?.id);
    const otherUser = employees.find(e => e.id === otherUserId);
    return otherUser?.name || 'Unknown User';
  };

  const getChatAvatar = (chat: Chat) => {
    if (chat.type === 'group') return null;
    const otherUserId = chat.participants.find(p => p !== user?.id);
    const otherUser = employees.find(e => e.id === otherUserId);
    return otherUser?.avatar;
  };

  const getChatStatus = (chat: Chat) => {
    if (chat.type === 'group') return null;
    const otherUserId = chat.participants.find(p => p !== user?.id);
    const otherUser = employees.find(e => e.id === otherUserId);
    // Mock status for now as we don't have real-time presence
    return otherUser?.status || 'offline';
  };

  // Filtered employees for adding to chat
  const filteredEmployees = employees.filter(emp => 
    emp.id !== user?.id && 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className={`flex h-[calc(100vh-12rem)] border rounded-xl overflow-hidden ${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
        
        {/* Sidebar */}
        <div className={`w-64 flex flex-col border-r ${isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-slate-50'}`}>
          <div className={`p-4 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'} flex justify-between items-center`}>
            <h2 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-800'}`}>Messages</h2>
            <div className="flex gap-1">
              <button 
                onClick={() => setShowCreateGroupModal(true)}
                title="Create Group"
                className={`p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
              >
                <Users className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setShowAddUserModal(true)}
                title="New Chat"
                className={`p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
            {chats.map(chat => (
              <button
                key={chat.id}
                onClick={() => setActiveChat(chat)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  activeChat?.id === chat.id
                    ? (isDark ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-50 text-indigo-600')
                    : (isDark ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-200')
                }`}
              >
                <div className="relative shrink-0">
                  {chat.type === 'group' ? (
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}>
                      <Hash className="w-4 h-4" />
                    </div>
                  ) : (
                    <>
                      <img 
                        src={getChatAvatar(chat) || `https://ui-avatars.com/api/?name=${getChatName(chat)}`} 
                        alt={getChatName(chat)} 
                        className="w-8 h-8 rounded-full object-cover" 
                        referrerPolicy="no-referrer" 
                      />
                      <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-slate-900 ${
                        getChatStatus(chat) === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'
                      }`} />
                    </>
                  )}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="font-medium truncate">{getChatName(chat)}</p>
                  {chat.lastMessage && (
                    <p className={`text-xs truncate ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      {chat.lastMessage.senderId === user?.id ? 'You: ' : ''}{chat.lastMessage.text}
                    </p>
                  )}
                </div>
              </button>
            ))}

            {chats.length === 0 && (
              <div className="text-center py-8 text-slate-500 text-sm">
                No chats yet. Start a new conversation!
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        {activeChat ? (
          <div className="flex-1 flex flex-col min-w-0">
            {/* Chat Header */}
            <div className={`h-16 px-6 flex items-center justify-between border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
              <div className="flex items-center gap-3">
                <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-800'}`}>
                  {getChatName(activeChat)}
                </h3>
                {activeChat.type === 'group' && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                    {activeChat.participants.length} members
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setShowVideoCall(true)}
                  className={`p-2 rounded-full ${isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
                  title="Video Call"
                >
                  <Video className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this chat?')) {
                      deleteChat(activeChat.id);
                    }
                  }}
                  className={`p-2 rounded-full hover:bg-red-50 text-red-500 dark:hover:bg-red-900/20`}
                  title="Delete Chat"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              {messages.map((msg) => {
                const sender = employees.find(e => e.id === msg.senderId);
                const isMe = msg.senderId === user?.id;
                
                return (
                  <div key={msg.id} className={`flex gap-4 ${isMe ? 'flex-row-reverse' : ''}`}>
                    <img 
                      src={sender?.avatar || `https://ui-avatars.com/api/?name=${sender?.name || 'User'}`} 
                      alt={sender?.name} 
                      className="w-10 h-10 rounded-full shrink-0 object-cover" 
                      referrerPolicy="no-referrer" 
                    />
                    <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[70%]`}>
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className={`font-semibold text-sm ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                          {sender?.name || 'Unknown'}
                        </span>
                        <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                          {msg.timestamp?.toDate ? new Date(msg.timestamp.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </div>
                      <div className={`px-4 py-2 rounded-2xl text-sm ${
                        isMe 
                          ? 'bg-indigo-600 text-white rounded-tr-none' 
                          : isDark ? 'bg-slate-800 text-slate-200 rounded-tl-none' : 'bg-slate-100 text-slate-800 rounded-tl-none'
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className={`p-4 border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
              <form onSubmit={handleSendMessage} className={`flex items-end gap-2 p-2 rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-300'} focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition-all`}>
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                  placeholder={`Message ${getChatName(activeChat)}`}
                  className={`flex-1 max-h-32 min-h-[40px] bg-transparent border-none focus:ring-0 resize-none py-2 text-sm ${isDark ? 'text-white placeholder-slate-500' : 'text-slate-900 placeholder-slate-400'}`}
                  rows={1}
                />
                <button 
                  type="submit"
                  disabled={!newMessage.trim()}
                  className={`p-2 rounded-lg mb-0.5 ${
                    newMessage.trim() 
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                      : isDark ? 'bg-slate-700 text-slate-500' : 'bg-slate-100 text-slate-400'
                  } transition-colors`}
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <MessageSquare className="w-16 h-16 mb-4 opacity-20" />
            <p>Select a chat or start a new conversation</p>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className={`w-full max-w-md p-6 rounded-xl shadow-xl ${isDark ? 'bg-slate-900 border border-slate-800' : 'bg-white'}`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>New Chat</h3>
              <button onClick={() => setShowAddUserModal(false)} className="text-slate-500 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-9 pr-4 py-2 rounded-lg border ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'} focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              />
            </div>

            <div className="max-h-60 overflow-y-auto custom-scrollbar space-y-2">
              {filteredEmployees.map(emp => (
                <button
                  key={emp.id}
                  onClick={() => {
                    sendInvitation(emp.id, 'direct');
                    setShowAddUserModal(false);
                    alert(`Invitation sent to ${emp.name}`);
                  }}
                  className={`w-full flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors`}
                >
                  <img 
                    src={emp.avatar || `https://ui-avatars.com/api/?name=${emp.name}`} 
                    alt={emp.name} 
                    className="w-10 h-10 rounded-full object-cover" 
                  />
                  <div className="text-left">
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{emp.name}</p>
                    <p className="text-xs text-slate-500">{emp.designation}</p>
                  </div>
                  <Plus className="w-4 h-4 ml-auto text-slate-400" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Create Group Modal */}
      {showCreateGroupModal && (
        <CreateGroupModal 
          onClose={() => setShowCreateGroupModal(false)} 
          employees={employees}
          currentUserId={user?.id}
          onCreate={createGroup}
          isDark={isDark}
        />
      )}

      {/* Video Call Modal (Simulated) */}
      {showVideoCall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
          <div className="relative w-full max-w-4xl aspect-video bg-slate-900 rounded-xl overflow-hidden shadow-2xl border border-slate-800">
            <div className="absolute top-4 left-4 z-10 bg-black/50 px-3 py-1 rounded-full text-white text-sm flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              Live
            </div>
            
            {/* Main Video (Remote) */}
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <img 
                  src={getChatAvatar(activeChat!) || `https://ui-avatars.com/api/?name=${getChatName(activeChat!)}`} 
                  alt="Caller" 
                  className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-slate-700"
                />
                <h3 className="text-2xl font-bold text-white mb-2">{getChatName(activeChat!)}</h3>
                <p className="text-slate-400 animate-pulse">Calling...</p>
              </div>
            </div>

            {/* Self Video (Local) */}
            <div className="absolute bottom-4 right-4 w-48 aspect-video bg-slate-800 rounded-lg border border-slate-700 overflow-hidden shadow-lg">
               <VideoPreview />
            </div>

            {/* Controls */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4">
              <button className="p-4 rounded-full bg-slate-800 text-white hover:bg-slate-700 transition-colors">
                <Video className="w-6 h-6" />
              </button>
              <button 
                onClick={() => setShowVideoCall(false)}
                className="p-4 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                <Phone className="w-6 h-6 rotate-[135deg]" />
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

function VideoPreview() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch(err => console.error("Error accessing camera:", err));
  }, []);

  return <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />;
}

import { Employee } from '../../context/EmployeeContext';

interface CreateGroupModalProps {
  onClose: () => void;
  employees: Employee[];
  currentUserId: string | undefined;
  onCreate: (name: string, userIds: string[]) => void;
  isDark: boolean;
}

function CreateGroupModal({ onClose, employees, currentUserId, onCreate, isDark }: CreateGroupModalProps) {
  const [groupName, setGroupName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEmployees = employees.filter((emp) => 
    emp.id !== currentUserId && 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim() || selectedUsers.length === 0) return;
    onCreate(groupName, selectedUsers);
    onClose();
  };

  const toggleUser = (userId: string) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className={`w-full max-w-md p-6 rounded-xl shadow-xl ${isDark ? 'bg-slate-900 border border-slate-800' : 'bg-white'}`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Create Group</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Group Name</label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'} focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              placeholder="e.g. Marketing Team"
              required
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Add Members</label>
            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-9 pr-4 py-2 rounded-lg border ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'} focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              />
            </div>
            <div className="max-h-40 overflow-y-auto custom-scrollbar space-y-1 border rounded-lg p-2 dark:border-slate-700">
              {filteredEmployees.map((emp) => (
                <div
                  key={emp.id}
                  onClick={() => toggleUser(emp.id)}
                  className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                    selectedUsers.includes(emp.id) 
                      ? (isDark ? 'bg-indigo-900/30 border border-indigo-500/50' : 'bg-indigo-50 border border-indigo-200')
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                    selectedUsers.includes(emp.id) ? 'bg-indigo-600 border-indigo-600' : 'border-slate-400'
                  }`}>
                    {selectedUsers.includes(emp.id) && <CheckIcon className="w-3 h-3 text-white" />}
                  </div>
                  <img 
                    src={emp.avatar || `https://ui-avatars.com/api/?name=${emp.name}`} 
                    alt={emp.name} 
                    className="w-8 h-8 rounded-full object-cover" 
                  />
                  <span className={`text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{emp.name}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={!groupName.trim() || selectedUsers.length === 0}
            className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create Group
          </button>
        </form>
      </div>
    </div>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
    </svg>
  );
}


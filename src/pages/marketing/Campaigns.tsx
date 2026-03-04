import React, { useState } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Campaigns() {
  return (
    <div className="bg-white min-h-[calc(100vh-4rem)]">
      <div className="border-b border-slate-200">
        <div className="flex px-6">
          <div className="py-4 border-b-2 border-indigo-600 text-indigo-900 font-medium text-sm">
            Email
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="flex gap-4 mb-20">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search for a campaign" 
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-md text-sm focus:ring-1 focus:ring-indigo-500 outline-none text-slate-900"
            />
          </div>
          <div className="relative w-48">
            <select className="w-full pl-3 pr-8 py-2 bg-white border border-slate-300 rounded-md text-sm focus:ring-1 focus:ring-indigo-500 outline-none text-slate-700 appearance-none">
              <option>All statuses</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        <div className="flex flex-col items-center justify-center max-w-md mx-auto text-center">
          <div className="mb-6 relative w-64 h-40">
            {/* Illustration placeholder matching the image */}
            <svg viewBox="0 0 200 120" className="w-full h-full text-emerald-600" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M100 110C140 110 180 120 180 120H20C20 120 60 110 100 110Z" fill="#F3F0E6" />
              <circle cx="85" cy="30" r="12" fill="#E8F5E9" stroke="currentColor" strokeWidth="1" />
              <circle cx="95" cy="35" r="2" stroke="currentColor" strokeWidth="1" />
              <path d="M110 25L115 25M112.5 22.5L112.5 27.5" stroke="currentColor" strokeWidth="1" />
              <path d="M125 40L130 35M125 35L130 40" stroke="currentColor" strokeWidth="1" />
              <path d="M100 50C100 45 105 40 110 40C115 40 115 45 115 50L120 70L95 70L100 50Z" fill="currentColor" />
              <path d="M110 40C105 40 105 35 105 35C105 35 110 32 115 35C115 35 115 40 110 40Z" fill="#E8F5E9" stroke="currentColor" strokeWidth="1" />
              <path d="M95 70L60 85L55 80" stroke="currentColor" strokeWidth="1" fill="none" />
              <path d="M95 70L70 90L65 85" stroke="currentColor" strokeWidth="1" fill="none" />
              <path d="M120 70L135 85" stroke="currentColor" strokeWidth="1" fill="none" />
              <path d="M140 90C140 85 145 80 145 80C145 80 145 95 140 95C135 95 140 90 140 90Z" fill="currentColor" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">You have not created any email campaigns</h2>
          <p className="text-slate-500 mb-6 text-sm">
            Click on "Create campaign" and start designing your first email campaign.
          </p>
          <Link 
            to="/marketing/builder"
            className="px-6 py-2 bg-white border border-slate-300 text-slate-700 rounded-full text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            Create campaign
          </Link>
        </div>
      </div>
    </div>
  );
}

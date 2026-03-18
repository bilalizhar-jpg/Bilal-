import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
 label?: string;
}

export default function Input({ label, className = '', ...props}: InputProps) {
 return (
 <div className="flex flex-col gap-1.5">
 {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
 <input
 className={`w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:border-black focus:ring-1 focus:ring-black outline-none transition-colors ${className}`}
 {...props}
 />
 </div>
 );
}

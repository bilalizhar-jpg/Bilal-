import React from 'react';

interface CardProps {
 children: React.ReactNode;
 className?: string;
 variant?: 'default' | 'glass';
}

export default function Card({ children, className = '', variant = 'default'}: CardProps) {
 const baseStyles ="rounded-lg border transition-colors";
 const variants = {
 default:"bg-white border-gray-200 shadow-sm p-6",
 glass:"bg-white border-gray-200 shadow-sm p-6", // Removed glassmorphism
};
 
 return (
 <div className={`${baseStyles} ${variants[variant]} ${className}`}>
 {children}
 </div>
 );
}

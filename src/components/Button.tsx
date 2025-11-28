import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  className = '',
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center px-6 py-3 text-sm font-semibold tracking-wide transition-all duration-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-gradient-to-r from-ukm-red to-red-700 text-white shadow-lg shadow-red-900/20 hover:shadow-red-900/40 hover:-translate-y-0.5",
    secondary: "bg-white text-black hover:bg-gray-100",
    outline: "border border-zinc-700 text-zinc-300 hover:border-white hover:text-white",
    danger: "bg-zinc-900 text-red-500 hover:bg-red-900/20 hover:text-red-400"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? "w-full" : ""} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
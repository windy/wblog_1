import { ButtonHTMLAttributes } from 'react';
import LoadingSpinner from './LoadingSpinner';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'red' | 'blue' | 'gray';
  loading?: boolean;
}

export default function Button({ 
  children, 
  variant = 'red', 
  loading, 
  className = '', 
  disabled,
  ...props 
}: ButtonProps) {
  const baseStyle = "group relative w-full flex justify-center py-2 px-4 border text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-50";
  
  const variantStyles = {
    red: "bg-muaythai-red hover:bg-muaythai-red-dark focus:ring-muaythai-red border-transparent",
    blue: "bg-muaythai-blue hover:bg-muaythai-blue-dark focus:ring-muaythai-blue border-transparent",
    gray: "bg-gray-600 hover:bg-gray-700 focus:ring-gray-500 border-transparent"
  };

  return (
    <button
      className={`${baseStyle} ${variantStyles[variant]} ${className}`}
      disabled={loading || disabled}
      {...props}
    >
      {loading ? <LoadingSpinner /> : children}
    </button>
  );
} 
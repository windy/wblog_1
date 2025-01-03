import React from 'react';

interface LoadingSpinnerProps {
  className?: string;
}

export default function LoadingSpinner({ className = '' }: LoadingSpinnerProps) {
  return (
    <div className={`flex justify-center items-center ${className}`}>
      <div className="animate-spin rounded-full h-full w-full border-b-2 border-muaythai-blue"></div>
    </div>
  );
}
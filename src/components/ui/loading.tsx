/**
 * Loading Components
 * Various loading indicators and spinners
 */

import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Simple loading spinner
 */
export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-b-2 border-blue-600',
        sizeClasses[size],
        className
      )}
    />
  );
}

interface LoadingPageProps {
  message?: string;
}

/**
 * Full page loading component
 */
export function LoadingPage({ message = 'Loading...' }: LoadingPageProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <LoadingSpinner size="lg" className="mx-auto mb-4" />
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
}

interface LoadingCardProps {
  className?: string;
}

/**
 * Loading card with skeleton effect
 */
export function LoadingCard({ className }: LoadingCardProps) {
  return (
    <div className={cn('bg-white rounded-xl shadow-sm border p-6', className)}>
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
      </div>
    </div>
  );
}

/**
 * Loading button state
 */
export function LoadingButton({ 
  children, 
  isLoading, 
  className,
  ...props 
}: {
  children: React.ReactNode;
  isLoading: boolean;
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg',
        'text-sm font-medium text-white bg-blue-600 hover:bg-blue-700',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
        'transition-colors duration-200',
        isLoading && 'opacity-50 cursor-not-allowed',
        className
      )}
      disabled={isLoading}
      {...props}
    >
      {isLoading && <LoadingSpinner size="sm" className="mr-2" />}
      {children}
    </button>
  );
}

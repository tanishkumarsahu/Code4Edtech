/**
 * Toaster Component
 * Displays toast notifications throughout the application
 */

'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export interface Toast {
  id: string;
  title?: string;
  description?: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

interface ToasterProps {
  className?: string;
}

// Simple toast store (can be replaced with Zustand later)
let toasts: Toast[] = [];
let listeners: Array<(toasts: Toast[]) => void> = [];

export const toast = {
  success: (message: string, title?: string) => addToast({ type: 'success', description: message, title }),
  error: (message: string, title?: string) => addToast({ type: 'error', description: message, title }),
  warning: (message: string, title?: string) => addToast({ type: 'warning', description: message, title }),
  info: (message: string, title?: string) => addToast({ type: 'info', description: message, title }),
};

function addToast(toast: Omit<Toast, 'id'>) {
  const id = Math.random().toString(36).substr(2, 9);
  const newToast: Toast = { id, duration: 5000, ...toast };
  toasts = [...toasts, newToast];
  listeners.forEach(listener => listener(toasts));
  
  // Auto remove after duration
  setTimeout(() => {
    removeToast(id);
  }, newToast.duration);
}

function removeToast(id: string) {
  toasts = toasts.filter(toast => toast.id !== id);
  listeners.forEach(listener => listener(toasts));
}

export function Toaster({ className }: ToasterProps) {
  const [currentToasts, setCurrentToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const listener = (newToasts: Toast[]) => {
      setCurrentToasts(newToasts);
    };
    
    listeners.push(listener);
    
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  }, []);

  if (currentToasts.length === 0) return null;

  return (
    <div className={cn(
      "fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm",
      className
    )}>
      {currentToasts.map((toast) => (
        <ToastComponent
          key={toast.id}
          toast={toast}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}

interface ToastComponentProps {
  toast: Toast;
  onClose: () => void;
}

function ToastComponent({ toast, onClose }: ToastComponentProps) {
  const getToastStyles = (type: Toast['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  return (
    <div className={cn(
      "relative rounded-lg border p-4 shadow-lg transition-all duration-300 ease-in-out",
      getToastStyles(toast.type)
    )}>
      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      
      {toast.title && (
        <div className="font-semibold mb-1 pr-6">
          {toast.title}
        </div>
      )}
      
      {toast.description && (
        <div className="text-sm pr-6">
          {toast.description}
        </div>
      )}
    </div>
  );
}

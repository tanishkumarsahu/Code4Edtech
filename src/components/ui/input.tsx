/**
 * Input Component
 * Reusable input component with proper styling and validation states
 */

import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'error' | 'success';
  label?: string;
  helperText?: string;
  errorMessage?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    type = 'text', 
    variant = 'default',
    label,
    helperText,
    errorMessage,
    id,
    ...props 
  }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = variant === 'error' || !!errorMessage;
    const hasSuccess = variant === 'success';

    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={inputId} 
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        <input
          id={inputId}
          type={type}
          className={cn(
            // Base form input class
            "form-input",
            
            // Error state
            hasError && "error",
            
            // Success state
            hasSuccess && "success",
            
            className
          )}
          ref={ref}
          {...props}
        />
        
        {/* Helper text or error message */}
        {(helperText || errorMessage) && (
          <div className="mt-1 text-xs">
            {errorMessage ? (
              <span className="text-red-600 flex items-center">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errorMessage}
              </span>
            ) : (
              <span className="text-gray-500">{helperText}</span>
            )}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };

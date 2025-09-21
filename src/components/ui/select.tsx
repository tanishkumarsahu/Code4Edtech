/**
 * Select Component
 * Reusable select dropdown component with proper styling
 */

import React from 'react';
import { cn } from '@/lib/utils';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  variant?: 'default' | 'error' | 'success';
  label?: string;
  helperText?: string;
  errorMessage?: string;
  options?: SelectOption[];
  placeholder?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ 
    className, 
    variant = 'default',
    label,
    helperText,
    errorMessage,
    options = [],
    placeholder,
    id,
    children,
    ...props 
  }, ref) => {
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = variant === 'error' || !!errorMessage;
    const hasSuccess = variant === 'success';

    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={selectId} 
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        <div className="relative">
          <select
            id={selectId}
            className={cn(
              // Base form input class with appearance-none for custom arrow
              "form-input appearance-none cursor-pointer",
              
              // Error state
              hasError && "error",
              
              // Success state
              hasSuccess && "success",
              
              className
            )}
            ref={ref}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            
            {options.map((option) => (
              <option 
                key={option.value} 
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
            
            {children}
          </select>
          
          {/* Dropdown arrow */}
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg 
              className="w-4 h-4 text-gray-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M19 9l-7 7-7-7" 
              />
            </svg>
          </div>
        </div>
        
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

Select.displayName = 'Select';

export { Select };

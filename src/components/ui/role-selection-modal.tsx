/**
 * Role Selection Modal Component
 * Modal for selecting user role during Google Sign-In
 */

import React, { useState } from 'react';
// Removed Google Sign-In for hackathon compliance
import { cn } from '@/lib/utils';
import { UserRole } from '@/types';

interface RoleSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function RoleSelectionModal({
  isOpen,
  onClose,
  onSuccess,
  onError,
}: RoleSelectionModalProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSuccess = () => {
    onSuccess?.();
    onClose();
  };

  const handleError = (error: string) => {
    onError?.(error);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Choose Your Account Type
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Role Selection */}
        <div className="space-y-4 mb-6">
          <div
            className={cn(
              "p-4 border-2 rounded-lg cursor-pointer transition-all",
              selectedRole === 'student'
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
            )}
            onClick={() => setSelectedRole('student')}
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={cn(
                  "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                  selectedRole === 'student' ? "border-blue-500" : "border-gray-300"
                )}>
                  {selectedRole === 'student' && (
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  )}
                </div>
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-gray-900">Student</h4>
                <p className="text-xs text-gray-600">Upload and analyze your resume</p>
              </div>
            </div>
          </div>

          <div
            className={cn(
              "p-4 border-2 rounded-lg cursor-pointer transition-all",
              selectedRole === 'recruiter'
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
            )}
            onClick={() => setSelectedRole('recruiter')}
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={cn(
                  "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                  selectedRole === 'recruiter' ? "border-blue-500" : "border-gray-300"
                )}>
                  {selectedRole === 'recruiter' && (
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  )}
                </div>
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-gray-900">Recruiter</h4>
                <p className="text-xs text-gray-600">Manage job postings and review candidates</p>
              </div>
            </div>
          </div>
        </div>

        {/* Simplified for hackathon - no auth required */}
        <button
          onClick={() => {
            onClose();
            onSuccess?.();
          }}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
        >
          Continue as {selectedRole}
        </button>

        {/* Alternative Actions */}
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Or{' '}
            <button
              onClick={onClose}
              className="text-blue-600 hover:text-blue-500 font-medium"
            >
              create account manually
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RoleSelectionModal;

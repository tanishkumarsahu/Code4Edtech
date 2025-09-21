/**
 * Resume Upload Zone Component - Flask Integration
 * Simple file upload with Flask backend integration
 */

'use client';

import React, { useState, useCallback, useRef } from 'react';
import { flaskApiService } from '@/services/flaskApiService';
import { DirectDbService } from '@/services/directDbService';
import { toast } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';

interface ResumeUploadZoneProps {
  jobDescriptionId: string;
  onUploadStart?: () => void;
  onUploadComplete?: (result: any) => void;
  onUploadError?: (error: string) => void;
  disabled?: boolean;
}

export const ResumeUploadZone: React.FC<ResumeUploadZoneProps> = ({
  jobDescriptionId,
  onUploadStart,
  onUploadComplete,
  onUploadError,
  disabled = false,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validate file before upload
  const validateFile = (file: File): { isValid: boolean; error?: string } => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    
    if (file.size > maxSize) {
      return { isValid: false, error: 'File size must be less than 10MB' };
    }
    
    if (!allowedTypes.includes(file.type)) {
      return { isValid: false, error: 'Only PDF and DOCX files are allowed' };
    }
    
    return { isValid: true };
  };

  // Handle file upload
  const handleFileUpload = useCallback(async (file: File) => {
    if (!jobDescriptionId || disabled || isUploading) {
      return;
    }

    const validation = validateFile(file);
    if (!validation.isValid) {
      const errorMessage = validation.error || 'Invalid file';
      toast.error(errorMessage);
      onUploadError?.(errorMessage);
      return;
    }

    setIsUploading(true);
    setSelectedFile(file);
    onUploadStart?.();

    try {
      const handleUpload = async (file: File) => {
        if (!jobDescriptionId) {
          onUploadError?.('Please select a job description first');
          return;
        }

        try {
          onUploadStart?.();
          
          // Use Flask API for real Gemini analysis
          const formData = new FormData();
          formData.append('file', file);
          formData.append('job_id', jobDescriptionId);
          
          console.log(' Uploading to Flask backend with real Gemini AI...');
          
          const response = await fetch('http://localhost:5000/api/upload-resume', {
            method: 'POST',
            body: formData,
          });
          
          if (!response.ok) {
            throw new Error(`Upload failed: ${response.statusText}`);
          }
          
          const result = await response.json();
          
          if (result.success) {
            console.log(' Real Gemini analysis completed:', result);
            
            // Format the result to match expected interface
            const formattedResult = {
              id: result.resume_id || Date.now(),
              filename: file.name,
              job_title: result.job_title || 'Unknown Position',
              company: result.company || 'Unknown Company',
              ...result.analysis
            };
            
            onUploadComplete?.(formattedResult);
          } else {
            throw new Error(result.error || 'Analysis failed');
          }
        } catch (error) {
          console.error('Upload error:', error);
          onUploadError?.(error instanceof Error ? error.message : 'Upload failed');
        }
      };

      await handleUpload(file);
    } catch (error: any) {
      const errorMessage = error.message || 'Upload failed';
      console.error('Upload error:', error);
      toast.error(errorMessage);
      onUploadError?.(errorMessage);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      setSelectedFile(null);
    }
  }, [jobDescriptionId, disabled, isUploading, onUploadStart, onUploadComplete, onUploadError]);

  // Handle drag and drop events
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  // Handle file input change
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, [handleFileUpload]);

  // Trigger file input click
  const handleClick = useCallback(() => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click();
    }
  }, [disabled, isUploading]);

  return (
    <div className="w-full">
      {/* Upload Zone */}
      <div
        className={cn(
          "relative border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
          isDragOver && "border-blue-400 bg-blue-50",
          !isDragOver && "border-gray-300 hover:border-gray-400",
          disabled && "opacity-50 cursor-not-allowed",
          isUploading && "pointer-events-none"
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
      >
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx"
          onChange={handleFileInputChange}
          className="hidden"
          disabled={disabled || isUploading}
        />

        {isUploading ? (
          <div className="space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {selectedFile ? `Uploading ${selectedFile.name}...` : 'Processing...'}
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">{uploadProgress}% complete</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <svg fill="none" stroke="currentColor" viewBox="0 0 48 48" aria-hidden="true">
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                Drop your resume here, or <span className="text-blue-600">browse</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Supports PDF and DOCX files up to 10MB
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Job Selection Validation */}
      {!jobDescriptionId && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-700">
            ⚠️ Please select a job description before uploading your resume.
          </p>
        </div>
      )}
    </div>
  );
};

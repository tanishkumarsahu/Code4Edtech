/**
 * Resume Upload Component - Flask Backend Integration
 * Uses real Flask API with Gemini AI analysis
 */

'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from '../ui/toaster';

interface ResumeUploadFlaskProps {
  jobDescriptionId: string;
  onUploadStart?: () => void;
  onUploadComplete?: (result: any) => void;
  onUploadError?: (error: string) => void;
  disabled?: boolean;
}

export const ResumeUploadFlask: React.FC<ResumeUploadFlaskProps> = ({
  jobDescriptionId,
  onUploadStart,
  onUploadComplete,
  onUploadError,
  disabled = false
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const uploadToFlask = async (file: File) => {
    if (!jobDescriptionId) {
      throw new Error('Please select a job description first');
    }

    console.log('🚀 Starting Flask upload with real Gemini AI...');
    
    // Create FormData for file upload
    const formData = new FormData();
    formData.append('file', file);
    formData.append('job_id', jobDescriptionId);
    
    // Upload to Flask backend
    const response = await fetch('http://localhost:5000/api/upload-resume', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Upload failed: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Analysis failed');
    }
    
    console.log('✅ Real Gemini analysis completed:', result);
    
    // Format result to match expected interface
    return {
      id: result.resume_id || Date.now(),
      filename: file.name,
      job_title: result.job_title || 'Unknown Position',
      company: result.company || 'Unknown Company',
      ...result.analysis
    };
  };

  const handleFileUpload = async (file: File) => {
    // Validate file
    if (!file) return;
    
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      const errorMessage = 'File size must be less than 10MB';
      toast.error(errorMessage);
      onUploadError?.(errorMessage);
      return;
    }

    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      const errorMessage = 'Only PDF and DOCX files are allowed';
      toast.error(errorMessage);
      onUploadError?.(errorMessage);
      return;
    }

    setIsUploading(true);
    setSelectedFile(file);
    setUploadProgress(0);
    onUploadStart?.();

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const result = await uploadToFlask(file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      setTimeout(() => {
        onUploadComplete?.(result);
        toast.success('Resume analyzed successfully with AI!');
      }, 500);
      
    } catch (error: any) {
      const errorMessage = error.message || 'Upload failed';
      console.error('Upload error:', error);
      toast.error(errorMessage);
      onUploadError?.(errorMessage);
    } finally {
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        setSelectedFile(null);
      }, 1000);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      handleFileUpload(acceptedFiles[0]);
    }
  }, [jobDescriptionId]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    multiple: false,
    disabled: disabled || isUploading || !jobDescriptionId
  });

  return (
    <div className="w-full">
      {/* Upload Zone */}
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200
          ${isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'}
          ${disabled || !jobDescriptionId ? 'opacity-50 cursor-not-allowed' : ''}
          ${isUploading ? 'pointer-events-none' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        {isUploading ? (
          <div className="space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <div>
              <p className="text-lg font-medium text-gray-900">
                🤖 Analyzing with Gemini AI...
              </p>
              <p className="text-sm text-gray-600">
                {selectedFile?.name}
              </p>
              <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {uploadProgress < 90 ? 'Uploading...' : 'Processing with AI...'}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-4xl">📄</div>
            <div>
              <p className="text-lg font-medium text-gray-900">
                {isDragActive ? 'Drop your resume here' : 'Upload your resume'}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Drag & drop or click to select • PDF, DOCX • Max 10MB
              </p>
              {!jobDescriptionId && (
                <p className="text-sm text-red-600 mt-2">
                  ⚠️ Please select a job description first
                </p>
              )}
            </div>
            <button
              type="button"
              disabled={disabled || !jobDescriptionId}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Choose File
            </button>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          🤖 Powered by Gemini AI • Real-time analysis • Comprehensive feedback
        </p>
      </div>
    </div>
  );
};

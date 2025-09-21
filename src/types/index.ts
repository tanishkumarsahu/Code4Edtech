/**
 * TypeScript Type Definitions for Resume Relevance System
 * Defines all interfaces, types, and enums used throughout the application
 */

// Removed Firebase dependency - using Date instead

// ============================================================================
// User Management Types
// ============================================================================

export type UserRole = 'student' | 'recruiter' | 'admin';

export interface IUserProfile {
  name: string;
  phone?: string;
  organization?: string;
  department?: string;
}

export interface IUser {
  uid: string;
  email: string;
  role: UserRole;
  profile: IUserProfile;
  createdAt: Date | string;
  updatedAt: Date | string;
  isActive: boolean;
}

// ============================================================================
// Resume and Job Description Types
// ============================================================================

export interface IPersonalInfo {
  name: string;
  email: string;
  phone: string;
  location?: string;
}

export interface IEducation {
  degree: string;
  institution: string;
  year: string;
  gpa?: string;
}

export interface IExperience {
  company: string;
  position?: string;
  duration: string;
  description: string;
}

export interface IProject {
  name: string;
  description: string;
  technologies: string[];
}

export interface IParsedResumeData {
  personalInfo: IPersonalInfo;
  education: IEducation[];
  experience: IExperience[];
  skills: string[];
  projects?: IProject[];
  certifications?: string[];
  rawText?: string;
}

export interface IJobRequirements {
  mustHave: string[];
  goodToHave: string[];
  experience: string;
  education: string[];
}

export interface IJobDescription {
  id: string;
  title: string;
  company: string;
  description: string;
  requirements: IJobRequirements;
  uploadedBy: string; // recruiter userId
  createdAt: Date | string;
  isActive: boolean;
  applicationCount: number;
}

// ============================================================================
// Analysis and Scoring Types
// ============================================================================

export type TVerdict = 'High' | 'Medium' | 'Low';

export interface IAnalysis {
  relevanceScore: number; // 0-100
  verdict: TVerdict;
  hardMatchScore?: number;
  semanticMatchScore?: number;
  matchedSkills: string[];
  missingSkills: string[];
  strengths: string[];
  gaps?: string[];
  improvements?: string[];
  feedback?: string;
}

export interface IFeedback {
  overallFeedback: string;
  improvementSuggestions: string[];
  recommendedSkills: string[];
  recommendedProjects: string[];
}

export type TResumeStatus = 'uploaded' | 'processing' | 'analyzed' | 'completed' | 'failed' | 'error';

export interface IResume {
  id: string;
  studentId: string;
  jobDescriptionId: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  downloadURL: string; // File storage URL
  filePath: string;
  extractedText?: string;
  parsedData: IParsedResumeData;
  analysis: IAnalysis;
  feedback?: IFeedback;
  status: TResumeStatus;
  createdAt: Date | string;
  updatedAt: Date | string;
  processedAt?: Date | string;
}

// ============================================================================
// Analytics Types
// ============================================================================

export interface IScoreDistribution {
  high: number;
  medium: number;
  low: number;
}

export interface ISkillCount {
  skill: string;
  count: number;
}

export interface IProcessingTime {
  average: number;
  min: number;
  max: number;
}

export interface IAnalytics {
  date: string; // YYYY-MM-DD
  totalResumes: number;
  processedResumes: number;
  averageScore: number;
  scoreDistribution: IScoreDistribution;
  topSkills: ISkillCount[];
  processingTime: IProcessingTime;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface IApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface IPaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// ============================================================================
// Form and UI Types
// ============================================================================

export interface IUploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UploadProgress {
  progress: number;
  bytesTransferred: number;
  totalBytes: number;
  state: string;
}

export interface IResumeUploadData {
  fileName: string;
  fileSize: number;
  fileType: string;
  downloadURL: string;
  filePath: string;
  jobDescriptionId: string;
}

export interface IFilterOptions {
  jobId?: string;
  minScore?: number;
  maxScore?: number;
  verdict?: TVerdict;
  dateFrom?: Date;
  dateTo?: Date;
  limit?: number;
  offset?: number;
}

export interface ISortOptions {
  field: 'createdAt' | 'relevanceScore' | 'studentName';
  direction: 'asc' | 'desc';
}

// ============================================================================
// Authentication Types
// ============================================================================

export interface IAuthState {
  user: IUser | null;
  loading: boolean;
  error: string | null;
}

export interface ILoginCredentials {
  email: string;
  password: string;
}

export interface IRegisterData {
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
  profile: IUserProfile;
}

// ============================================================================
// Component Props Types
// ============================================================================

export interface IResumeUploadProps {
  jobDescriptionId: string;
  onUploadComplete: (resumeId: string) => void;
  onUploadError: (error: string) => void;
}

export interface IDashboardProps {
  userRole: UserRole;
}

export interface IResumeTableProps {
  resumes: IResume[];
  loading: boolean;
  onFilterChange: (filters: IFilterOptions) => void;
  onSortChange: (sort: ISortOptions) => void;
}

// ============================================================================
// Store/State Management Types
// ============================================================================

export interface IAppState {
  user: IUser | null;
  resumes: IResume[];
  jobDescriptions: IJobDescription[];
  filters: IFilterOptions;
  loading: boolean;
  error: string | null;
}

export interface IAppActions {
  setUser: (user: IUser | null) => void;
  addResume: (resume: IResume) => void;
  updateResume: (resumeId: string, updates: Partial<IResume>) => void;
  setJobDescriptions: (jobDescriptions: IJobDescription[]) => void;
  updateFilters: (filters: Partial<IFilterOptions>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

// ============================================================================
// Utility Types
// ============================================================================

export type TFileType = 'pdf' | 'docx';

export interface IFileValidation {
  maxSize: number; // in bytes
  allowedTypes: TFileType[];
}

export interface IEnvironmentConfig {
  apiUrl: string;
  flaskApiUrl: string;
  isDevelopment: boolean;
  isProduction: boolean;
}

// ============================================================================
// Error Types
// ============================================================================

export interface IAppError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
}

export type TErrorCode = 
  | 'AUTH_ERROR'
  | 'UPLOAD_ERROR'
  | 'PROCESSING_ERROR'
  | 'NETWORK_ERROR'
  | 'VALIDATION_ERROR'
  | 'PERMISSION_ERROR'
  | 'UNKNOWN_ERROR';

// ============================================================================
// Constants
// ============================================================================

export const SCORE_THRESHOLDS = {
  HIGH: 80,
  MEDIUM: 50,
  LOW: 0,
} as const;

export const FILE_LIMITS = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: ['pdf', 'docx'] as TFileType[],
} as const;

export const PAGINATION = {
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

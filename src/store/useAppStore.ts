/**
 * Zustand Store for Application State Management
 * Handles user authentication, resumes, job descriptions, and UI state
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { 
  IUser, 
  IResume, 
  IJobDescription, 
  IFilterOptions, 
  IAppState, 
  IAppActions 
} from '@/types';

// Combined store interface
interface IAppStore extends IAppState, IAppActions {}

// Initial state
const initialState: IAppState = {
  user: null,
  resumes: [],
  jobDescriptions: [],
  filters: {},
  loading: false,
  error: null,
};

/**
 * Main application store using Zustand
 * Provides centralized state management for the entire application
 */
export const useAppStore = create<IAppStore>()(
  devtools(
    persist(
      (set, get) => ({
        // State
        ...initialState,

        // Actions
        setUser: (user: IUser | null) => {
          set(
            (state) => ({ 
              ...state, 
              user,
              error: null 
            }),
            false,
            'setUser'
          );
        },

        addResume: (resume: IResume) => {
          set(
            (state) => ({
              ...state,
              resumes: [resume, ...state.resumes],
              error: null,
            }),
            false,
            'addResume'
          );
        },

        updateResume: (resumeId: string, updates: Partial<IResume>) => {
          set(
            (state) => ({
              ...state,
              resumes: state.resumes.map((resume) =>
                resume.id === resumeId 
                  ? { ...resume, ...updates }
                  : resume
              ),
              error: null,
            }),
            false,
            'updateResume'
          );
        },

        setJobDescriptions: (jobDescriptions: IJobDescription[]) => {
          set(
            (state) => ({
              ...state,
              jobDescriptions,
              error: null,
            }),
            false,
            'setJobDescriptions'
          );
        },

        updateFilters: (filters: Partial<IFilterOptions>) => {
          set(
            (state) => ({
              ...state,
              filters: { ...state.filters, ...filters },
            }),
            false,
            'updateFilters'
          );
        },

        setLoading: (loading: boolean) => {
          set(
            (state) => ({ ...state, loading }),
            false,
            'setLoading'
          );
        },

        setError: (error: string | null) => {
          set(
            (state) => ({ ...state, error, loading: false }),
            false,
            'setError'
          );
        },

        clearError: () => {
          set(
            (state) => ({ ...state, error: null }),
            false,
            'clearError'
          );
        },

        // Helper methods
        getResumeById: (resumeId: string): IResume | undefined => {
          return get().resumes.find(resume => resume.id === resumeId);
        },

        getJobDescriptionById: (jobId: string): IJobDescription | undefined => {
          return get().jobDescriptions.find(job => job.id === jobId);
        },

        getResumesByJobId: (jobId: string): IResume[] => {
          return get().resumes.filter(resume => resume.jobDescriptionId === jobId);
        },

        getFilteredResumes: (): IResume[] => {
          const { resumes, filters } = get();
          let filtered = [...resumes];

          // Apply job filter
          if (filters.jobId) {
            filtered = filtered.filter(resume => resume.jobDescriptionId === filters.jobId);
          }

          // Apply score range filter
          if (filters.minScore !== undefined) {
            filtered = filtered.filter(resume => resume.analysis.relevanceScore >= filters.minScore!);
          }

          if (filters.maxScore !== undefined) {
            filtered = filtered.filter(resume => resume.analysis.relevanceScore <= filters.maxScore!);
          }

          // Apply verdict filter
          if (filters.verdict) {
            filtered = filtered.filter(resume => resume.analysis.verdict === filters.verdict);
          }

          // Apply date range filter
          if (filters.dateFrom) {
            filtered = filtered.filter(resume => 
              new Date(resume.createdAt) >= filters.dateFrom!
            );
          }

          if (filters.dateTo) {
            filtered = filtered.filter(resume => 
              new Date(resume.createdAt) <= filters.dateTo!
            );
          }

          return filtered;
        },

        // Reset methods
        resetFilters: () => {
          set(
            (state) => ({ ...state, filters: {} }),
            false,
            'resetFilters'
          );
        },

        resetStore: () => {
          set(
            () => ({ ...initialState }),
            false,
            'resetStore'
          );
        },

        // Bulk operations
        setResumes: (resumes: IResume[]) => {
          set(
            (state) => ({ ...state, resumes, error: null }),
            false,
            'setResumes'
          );
        },

        removeResume: (resumeId: string) => {
          set(
            (state) => ({
              ...state,
              resumes: state.resumes.filter(resume => resume.id !== resumeId),
            }),
            false,
            'removeResume'
          );
        },

        addJobDescription: (jobDescription: IJobDescription) => {
          set(
            (state) => ({
              ...state,
              jobDescriptions: [jobDescription, ...state.jobDescriptions],
              error: null,
            }),
            false,
            'addJobDescription'
          );
        },

        updateJobDescription: (jobId: string, updates: Partial<IJobDescription>) => {
          set(
            (state) => ({
              ...state,
              jobDescriptions: state.jobDescriptions.map((job) =>
                job.id === jobId 
                  ? { ...job, ...updates }
                  : job
              ),
              error: null,
            }),
            false,
            'updateJobDescription'
          );
        },
      }),
      {
        name: 'resume-relevance-store',
        // Only persist user and filters, not the full data
        partialize: (state) => ({
          user: state.user,
          filters: state.filters,
        }),
        // Version for migration if needed
        version: 1,
      }
    ),
    {
      name: 'resume-relevance-store',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
);

// Selector hooks for better performance
export const useUser = () => useAppStore((state) => state.user);
export const useResumes = () => useAppStore((state) => state.resumes);
export const useJobDescriptions = () => useAppStore((state) => state.jobDescriptions);
export const useFilters = () => useAppStore((state) => state.filters);
export const useLoading = () => useAppStore((state) => state.loading);
export const useError = () => useAppStore((state) => state.error);

// Action hooks
export const useAppActions = () => useAppStore((state) => ({
  setUser: state.setUser,
  addResume: state.addResume,
  updateResume: state.updateResume,
  setJobDescriptions: state.setJobDescriptions,
  updateFilters: state.updateFilters,
  setLoading: state.setLoading,
  setError: state.setError,
  clearError: state.clearError,
}));

/**
 * Flask API Service
 * Handles all communication with Flask backend
 */

const API_BASE_URL = 'http://localhost:5000/api';

export interface JobDescription {
  id?: number;
  title: string;
  company: string;
  description: string;
  must_have_skills: string[];
  good_to_have_skills: string[];
  experience_required: string;
  education_required: string[];
}

export interface ResumeAnalysis {
  id: number;
  filename: string;
  job_title: string;
  company: string;
  relevance_score: number;
  verdict: string;
  matched_skills: string[];
  missing_skills: string[];
  feedback: string;
  created_at: string;
}

export class FlaskApiService {
  private static instance: FlaskApiService;

  public static getInstance(): FlaskApiService {
    if (!FlaskApiService.instance) {
      FlaskApiService.instance = new FlaskApiService();
    }
    return FlaskApiService.instance;
  }

  /**
   * Test backend health
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      return response.ok;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }

  /**
   * Create a new job description
   */
  async createJobDescription(jobData: JobDescription): Promise<{ success: boolean; job_id?: number; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/job-descriptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jobData),
      });

      return await response.json();
    } catch (error) {
      console.error('Error creating job description:', error);
      return { success: false, error: 'Failed to create job description' };
    }
  }

  /**
   * Get all job descriptions
   */
  async getJobDescriptions(): Promise<{ success: boolean; jobs?: JobDescription[]; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/job-descriptions`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching job descriptions:', error);
      return { success: false, error: 'Failed to fetch job descriptions' };
    }
  }

  /**
   * Upload resume file
   */
  async uploadResume(file: File, jobId: string): Promise<{ success: boolean; resume_id?: number; error?: string }> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('job_id', jobId);

      const response = await fetch(`${API_BASE_URL}/upload-resume`, {
        method: 'POST',
        body: formData,
      });

      return await response.json();
    } catch (error) {
      console.error('Error uploading resume:', error);
      return { success: false, error: 'Failed to upload resume' };
    }
  }

  /**
   * Analyze resume
   */
  async analyzeResume(resumeId: number): Promise<{ success: boolean; analysis?: any; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/analyze-resume/${resumeId}`, {
        method: 'POST',
      });

      return await response.json();
    } catch (error) {
      console.error('Error analyzing resume:', error);
      return { success: false, error: 'Failed to analyze resume' };
    }
  }

  /**
   * Get all resumes with analysis
   */
  async getResumes(): Promise<{ success: boolean; resumes?: ResumeAnalysis[]; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/resumes`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching resumes:', error);
      return { success: false, error: 'Failed to fetch resumes' };
    }
  }

  /**
   * Upload and analyze resume in one call
   */
  async uploadAndAnalyzeResume(
    file: File, 
    jobId: string,
    onProgress?: (progress: number) => void
  ): Promise<{ success: boolean; analysis?: any; error?: string }> {
    try {
      // Step 1: Upload resume
      onProgress?.(25);
      const uploadResult = await this.uploadResume(file, jobId);
      
      if (!uploadResult.success || !uploadResult.resume_id) {
        return { success: false, error: uploadResult.error || 'Upload failed' };
      }

      // Step 2: Analyze resume
      onProgress?.(75);
      const analysisResult = await this.analyzeResume(uploadResult.resume_id);
      
      onProgress?.(100);
      return analysisResult;
    } catch (error) {
      console.error('Error in upload and analyze:', error);
      return { success: false, error: 'Failed to upload and analyze resume' };
    }
  }
}

// Export singleton instance
export const flaskApiService = FlaskApiService.getInstance();

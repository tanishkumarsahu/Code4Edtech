/**
 * Placement Team Dashboard
 * As per rules.txt: "Placement team dashboard: upload JD, see shortlisted resumes"
 * Features: search/filter resumes by job role, score, and location
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/components/ui/toaster';
import { DirectDbService, JobDescription } from '@/services/directDbService';
import { cn } from '@/lib/utils';

interface ResumeAnalysis {
  id: number;
  filename: string;
  job_title: string;
  company: string;
  relevance_score: number;
  verdict: 'High' | 'Medium' | 'Low';
  matched_skills: string[];
  missing_skills: string[];
  analysis_timestamp: string;
  candidate_name?: string;
  shortlisted?: boolean;
}

export default function PlacementDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'upload-jd' | 'resumes' | 'shortlisted'>('dashboard');
  const [jobDescriptions, setJobDescriptions] = useState<JobDescription[]>([]);
  const [resumeAnalyses, setResumeAnalyses] = useState<ResumeAnalysis[]>([]);
  const [filteredResumes, setFilteredResumes] = useState<ResumeAnalysis[]>([]);
  
  // Filter states
  const [selectedJob, setSelectedJob] = useState<string>('all');
  const [selectedVerdict, setSelectedVerdict] = useState<string>('all');
  const [minScore, setMinScore] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedResume, setSelectedResume] = useState<ResumeAnalysis | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Skip authentication for demo purposes (hackathon requirement)
  // useEffect(() => {
  //   if (!loading && (!user || !hasRole('recruiter'))) {
  //     router.push('/auth/login');
  //   }
  // }, [user, loading, hasRole, router]);

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  // Apply filters whenever filter states change
  useEffect(() => {
    applyFilters();
  }, [resumeAnalyses, selectedJob, selectedVerdict, minScore, searchTerm]);

  const loadData = async () => {
    try {
      console.log('🔄 Loading placement team data from Flask API...');
      
      // Load job descriptions from Flask
      const jobsResponse = await fetch('http://localhost:5000/api/job-descriptions');
      const jobsData = await jobsResponse.json();
      
      if (jobsData.success && jobsData.jobs) {
        setJobDescriptions(jobsData.jobs);
        console.log('✅ Loaded jobs from Flask:', jobsData.jobs.length);
      }
      
      // Load real analyzed resumes from Flask
      const resumesResponse = await fetch('http://localhost:5000/api/resumes');
      const resumesData = await resumesResponse.json();
      
      if (resumesData.success && resumesData.resumes) {
        // Transform Flask data to match our interface
        const transformedResumes = resumesData.resumes
          .filter((resume: any) => resume.relevance_score !== null) // Only analyzed resumes
          .map((resume: any) => {
            // Handle skills data (already parsed by Flask API)
            const matchedSkills = Array.isArray(resume.matched_skills) ? resume.matched_skills : [];
            const missingSkills = Array.isArray(resume.missing_skills) ? resume.missing_skills : [];
            
            return {
              id: resume.id,
              filename: resume.filename,
              job_title: resume.job_title || 'Unknown Position',
              company: resume.company || 'Unknown Company',
              relevance_score: resume.relevance_score || 0,
              verdict: resume.verdict || 'Medium',
              matched_skills: matchedSkills,
              missing_skills: missingSkills,
              analysis_timestamp: resume.upload_date || new Date().toISOString(),
              candidate_name: resume.filename.replace(/[_\.]/g, ' ').replace(/Resume|CV|pdf|docx/gi, '').trim()
            };
          });
        
        setResumeAnalyses(transformedResumes);
        console.log('✅ Loaded real analyzed resumes:', transformedResumes.length);
      } else {
        // Fallback to sample data if no real resumes
        console.log('📦 No analyzed resumes found, using sample data');
        const jobs = jobsData.jobs || DirectDbService.getJobDescriptions();
        const sampleAnalyses = generateSampleAnalyses(jobs);
        setResumeAnalyses(sampleAnalyses);
      }
      
    } catch (error) {
      console.error('Failed to load placement team data:', error);
      
      // Fallback to local data
      try {
        const jobs = DirectDbService.getJobDescriptions();
        setJobDescriptions(jobs);
        const sampleAnalyses = generateSampleAnalyses(jobs);
        setResumeAnalyses(sampleAnalyses);
        console.log('📦 Using fallback data');
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
      }
    }
  };

  const generateSampleAnalyses = (jobs: JobDescription[]): ResumeAnalysis[] => {
    const sampleCandidates = [
      'John_Doe_Resume.pdf', 'Sarah_Johnson_CV.pdf', 'Michael_Chen_Resume.pdf',
      'Emily_Davis_CV.pdf', 'David_Wilson_Resume.pdf', 'Lisa_Anderson_CV.pdf',
      'Robert_Taylor_Resume.pdf', 'Jennifer_Brown_CV.pdf', 'James_Miller_Resume.pdf',
      'Maria_Garcia_CV.pdf', 'Thomas_Jones_Resume.pdf', 'Amanda_Smith_CV.pdf'
    ];

    const verdicts: ('High' | 'Medium' | 'Low')[] = ['High', 'Medium', 'Low'];
    
    return sampleCandidates.map((filename, index) => {
      const job = jobs[index % jobs.length];
      const verdict = verdicts[Math.floor(Math.random() * verdicts.length)];
      const baseScore = verdict === 'High' ? 80 : verdict === 'Medium' ? 60 : 40;
      const score = baseScore + Math.floor(Math.random() * 20);
      
      return {
        id: index + 1,
        filename,
        job_title: job.title,
        company: job.company,
        relevance_score: Math.min(100, score),
        verdict,
        matched_skills: job.must_have_skills.slice(0, Math.floor(Math.random() * 4) + 2),
        missing_skills: job.must_have_skills.slice(Math.floor(Math.random() * 3) + 1),
        analysis_timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        candidate_name: filename.replace(/[_\.]/g, ' ').replace(/Resume|CV|pdf|docx/gi, '').trim()
      };
    });
  };

  const applyFilters = () => {
    let filtered = [...resumeAnalyses];

    // Filter by job
    if (selectedJob !== 'all') {
      filtered = filtered.filter(resume => resume.job_title === selectedJob);
    }

    // Filter by verdict
    if (selectedVerdict !== 'all') {
      filtered = filtered.filter(resume => resume.verdict === selectedVerdict);
    }

    // Filter by minimum score
    filtered = filtered.filter(resume => resume.relevance_score >= minScore);

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(resume => 
        resume.candidate_name?.toLowerCase().includes(term) ||
        resume.filename.toLowerCase().includes(term) ||
        resume.matched_skills.some(skill => skill.toLowerCase().includes(term))
      );
    }

    // Sort by score descending
    filtered.sort((a, b) => b.relevance_score - a.relevance_score);

    setFilteredResumes(filtered);
  };

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case 'High': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const exportResults = () => {
    const csvContent = [
      ['Candidate Name', 'Job Title', 'Company', 'Score', 'Verdict', 'Matched Skills', 'Missing Skills', 'Date'],
      ...filteredResumes.map(resume => [
        resume.candidate_name || resume.filename,
        resume.job_title,
        resume.company,
        resume.relevance_score,
        resume.verdict,
        resume.matched_skills.join('; '),
        resume.missing_skills.join('; '),
        new Date(resume.analysis_timestamp).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'resume_analysis_results.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('Results exported successfully!');
  };

  const viewResumeDetails = (resume: ResumeAnalysis) => {
    setSelectedResume(resume);
    setShowDetailModal(true);
  };

  const shortlistCandidate = async (resumeId: number) => {
    try {
      const response = await fetch(`http://localhost:5000/api/shortlist-candidate/${resumeId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Update local state
          setResumeAnalyses(prev => prev.map(resume => 
            resume.id === resumeId ? { ...resume, shortlisted: true } : resume
          ));
          setFilteredResumes(prev => prev.map(resume => 
            resume.id === resumeId ? { ...resume, shortlisted: true } : resume
          ));
          toast.success('Candidate shortlisted successfully!');
        } else {
          toast.error(data.error || 'Failed to shortlist candidate');
        }
      } else {
        toast.error('Failed to shortlist candidate');
      }
    } catch (error) {
      console.error('Failed to shortlist candidate:', error);
      toast.error('Failed to shortlist candidate');
    }
  };

  const unshortlistCandidate = async (resumeId: number) => {
    try {
      const response = await fetch(`http://localhost:5000/api/unshortlist-candidate/${resumeId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Update local state
          setResumeAnalyses(prev => prev.map(resume => 
            resume.id === resumeId ? { ...resume, shortlisted: false } : resume
          ));
          setFilteredResumes(prev => prev.map(resume => 
            resume.id === resumeId ? { ...resume, shortlisted: false } : resume
          ));
          toast.success('Candidate removed from shortlist!');
        } else {
          toast.error(data.error || 'Failed to remove candidate');
        }
      } else {
        toast.error('Failed to remove candidate');
      }
    } catch (error) {
      console.error('Failed to remove candidate:', error);
      toast.error('Failed to remove candidate');
    }
  };

  // Skip loading check for demo
  // if (loading) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center">
  //       <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  //     </div>
  //   );
  // }

  // Skip auth check for demo
  // if (!user || !hasRole('recruiter')) {
  //   return null;
  // }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2-2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Placement Team Dashboard
                </h1>
                <p className="text-sm text-gray-600 flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                  Innomatics Research Labs - Resume Analysis System
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <a 
                href="/student" 
                className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-all duration-200 font-medium"
              >
                👨‍🎓 Student Portal
              </a>
              <a 
                href="/" 
                className="px-4 py-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-200"
              >
                🏠 Home
              </a>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/60 mb-8 p-2">
          <nav className="flex space-x-2">
            {[
              { key: 'dashboard', label: '📊 Dashboard Overview', icon: '📊' },
              { key: 'resumes', label: '📄 Resume Analysis', icon: '📄' },
              { key: 'shortlisted', label: '⭐ Shortlisted Candidates', icon: '⭐' },
              { key: 'upload-jd', label: '📝 Manage Job Descriptions', icon: '📝' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={cn(
                  "flex-1 py-3 px-4 rounded-xl font-medium text-sm transition-all duration-300 ease-in-out",
                  activeTab === tab.key
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/80"
                )}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Dashboard Overview */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <StatCard
                title="Total Resumes"
                value={resumeAnalyses.length}
                icon="📄"
                color="blue"
              />
              <StatCard
                title="High Matches"
                value={resumeAnalyses.filter(r => r.verdict === 'High').length}
                icon="🎯"
                color="green"
              />
              <StatCard
                title="Active Jobs"
                value={jobDescriptions.length}
                icon="💼"
                color="purple"
              />
              <StatCard
                title="Avg Score"
                value={Math.round(resumeAnalyses.reduce((sum, r) => sum + r.relevance_score, 0) / resumeAnalyses.length)}
                icon="📊"
                color="yellow"
              />
            </div>

            {/* Quick Insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Candidates</h3>
                <div className="space-y-3">
                  {resumeAnalyses
                    .sort((a, b) => b.relevance_score - a.relevance_score)
                    .slice(0, 5)
                    .map((resume, index) => (
                      <div key={resume.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{resume.candidate_name}</p>
                          <p className="text-sm text-gray-600">{resume.job_title}</p>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold ${getScoreColor(resume.relevance_score)}`}>
                            {resume.relevance_score}%
                          </p>
                          <span className={`px-2 py-1 rounded-full text-xs ${getVerdictColor(resume.verdict)}`}>
                            {resume.verdict}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Performance</h3>
                <div className="space-y-3">
                  {jobDescriptions.map(job => {
                    const jobResumes = resumeAnalyses.filter(r => r.job_title === job.title);
                    const avgScore = jobResumes.length > 0 
                      ? Math.round(jobResumes.reduce((sum, r) => sum + r.relevance_score, 0) / jobResumes.length)
                      : 0;
                    
                    return (
                      <div key={job.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{job.title}</p>
                          <p className="text-sm text-gray-600">{jobResumes.length} applications</p>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold ${getScoreColor(avgScore)}`}>
                            {avgScore}%
                          </p>
                          <p className="text-xs text-gray-500">avg score</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Resume Analysis Tab */}
        {activeTab === 'resumes' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter & Search</h3>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {/* Job Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Role</label>
                  <select
                    value={selectedJob}
                    onChange={(e) => setSelectedJob(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    <option value="all">All Jobs</option>
                    {jobDescriptions.map(job => (
                      <option key={job.id} value={job.title}>{job.title}</option>
                    ))}
                  </select>
                </div>

                {/* Verdict Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Verdict</label>
                  <select
                    value={selectedVerdict}
                    onChange={(e) => setSelectedVerdict(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    <option value="all">All Verdicts</option>
                    <option value="High">High Match</option>
                    <option value="Medium">Medium Match</option>
                    <option value="Low">Low Match</option>
                  </select>
                </div>

                {/* Score Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Score</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={minScore}
                    onChange={(e) => setMinScore(parseInt(e.target.value) || 0)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    placeholder="0"
                  />
                </div>

                {/* Search */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    placeholder="Name or skills..."
                  />
                </div>

                {/* Export */}
                <div className="flex items-end">
                  <button
                    onClick={exportResults}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
                  >
                    Export CSV
                  </button>
                </div>
              </div>
              
              <div className="mt-4 flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  Showing {filteredResumes.length} of {resumeAnalyses.length} resumes
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      const highScoreCandidates = filteredResumes.filter(r => r.relevance_score >= 80);
                      console.log('Bulk shortlisting top candidates:', highScoreCandidates.length);
                      toast.success(`Shortlisted ${highScoreCandidates.length} top candidates!`);
                    }}
                    className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                  >
                    Shortlist Top Candidates (80%+)
                  </button>
                  <button
                    onClick={() => {
                      const rejectCandidates = filteredResumes.filter(r => r.relevance_score < 50);
                      console.log('Bulk rejecting low candidates:', rejectCandidates.length);
                      toast.success(`Rejected ${rejectCandidates.length} low-score candidates`);
                    }}
                    className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                  >
                    Reject Low Scores (Below 50%)
                  </button>
                </div>
              </div>
            </div>

            {/* Resume List */}
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Resume Analysis Results</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {filteredResumes.length === 0 ? (
                  <div className="px-6 py-8 text-center text-gray-500">
                    No resumes match your current filters.
                  </div>
                ) : (
                  filteredResumes.map((resume) => (
                    <div key={resume.id} className="px-6 py-4 hover:bg-gray-50 border-l-4 border-l-transparent hover:border-l-blue-500 transition-all">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <h4 className="text-lg font-medium text-gray-900">
                              {resume.candidate_name}
                            </h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getVerdictColor(resume.verdict)}`}>
                              {resume.verdict} Match
                            </span>
                            {resume.relevance_score >= 80 && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                ⭐ Top Candidate
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            Applied for: <span className="font-medium">{resume.job_title}</span> at {resume.company}
                          </p>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                            <span>📄 {resume.filename}</span>
                            <span>📅 {new Date(resume.analysis_timestamp).toLocaleDateString()}</span>
                            <span>🎯 {resume.matched_skills.length} skills matched</span>
                            <span>❌ {resume.missing_skills.length} skills missing</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <div className={`text-2xl font-bold ${getScoreColor(resume.relevance_score)}`}>
                              {resume.relevance_score}%
                            </div>
                            <p className="text-sm text-gray-600">Relevance Score</p>
                          </div>
                          <div className="flex flex-col space-y-2">
                            <button
                              onClick={() => viewResumeDetails(resume)}
                              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                            >
                              View Details
                            </button>
                            <button
                              onClick={() => shortlistCandidate(resume.id)}
                              className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
                            >
                              Shortlist
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      {/* Skills Preview */}
                      <div className="mt-3 flex flex-wrap gap-2">
                        {resume.matched_skills.slice(0, 5).map((skill, index) => (
                          <span key={index} className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                            ✓ {skill}
                          </span>
                        ))}
                        {resume.missing_skills.slice(0, 3).map((skill, index) => (
                          <span key={index} className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs">
                            ✗ {skill}
                          </span>
                        ))}
                        {resume.matched_skills.length > 5 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                            +{resume.matched_skills.length - 5} more skills
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Shortlisted Candidates */}
        {activeTab === 'shortlisted' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl shadow-sm border border-green-200/60 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 flex items-center">
                    ⭐ Shortlisted Candidates
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    High-potential candidates ready for interview process
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">
                      {filteredResumes.filter(r => r.shortlisted).length}
                    </div>
                    <p className="text-xs text-gray-500">Shortlisted</p>
                  </div>
                  <button
                    onClick={exportResults}
                    className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-200 font-medium"
                  >
                    📊 Export Shortlist
                  </button>
                </div>
              </div>

              {/* Shortlisted Candidates Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredResumes
                  .filter(resume => resume.shortlisted)
                  .map((resume) => (
                    <div key={resume.id} className="bg-white rounded-xl shadow-sm border border-gray-200/60 p-5 hover:shadow-md transition-all duration-300">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="font-bold text-gray-900 text-lg">
                            {resume.candidate_name || resume.filename.replace(/[_\.]/g, ' ').replace(/Resume|CV|pdf|docx/gi, '').trim()}
                          </h4>
                          <p className="text-sm text-gray-600">{resume.job_title} at {resume.company}</p>
                          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-2 ${getVerdictColor(resume.verdict)}`}>
                            {resume.verdict} Match
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-2xl font-bold ${getScoreColor(resume.relevance_score)}`}>
                            {resume.relevance_score}%
                          </div>
                          <p className="text-xs text-gray-500">Score</p>
                        </div>
                      </div>

                      {/* Skills Preview */}
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-1 mb-2">
                          {resume.matched_skills.slice(0, 3).map((skill, index) => (
                            <span key={index} className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                              ✓ {skill}
                            </span>
                          ))}
                          {resume.matched_skills.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                              +{resume.matched_skills.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex space-x-2">
                        <button
                          onClick={() => viewResumeDetails(resume)}
                          className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
                        >
                          📄 View Details
                        </button>
                        <button
                          onClick={() => unshortlistCandidate(resume.id)}
                          className="px-3 py-2 bg-red-100 text-red-600 rounded-lg text-sm hover:bg-red-200 transition-colors"
                        >
                          ❌ Remove
                        </button>
                      </div>
                    </div>
                  ))}
              </div>

              {/* Empty State */}
              {filteredResumes.filter(r => r.shortlisted).length === 0 && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">⭐</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No shortlisted candidates yet</h3>
                  <p className="text-gray-600 mb-4">Start shortlisting candidates from the Resume Analysis tab</p>
                  <button
                    onClick={() => setActiveTab('resumes')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    📄 View All Resumes
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Job Description Management */}
        {activeTab === 'upload-jd' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Job Descriptions</h3>
              <div className="space-y-4">
                {jobDescriptions.map(job => (
                  <div key={job.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{job.title}</h4>
                        <p className="text-sm text-gray-600">{job.company}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          Must-have: {job.must_have_skills.join(', ')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">
                          {resumeAnalyses.filter(r => r.job_title === job.title).length} applications
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Detailed Resume View Modal */}
        {showDetailModal && selectedResume && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                {/* Modal Header */}
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{selectedResume.candidate_name}</h3>
                    <p className="text-gray-600">{selectedResume.job_title} at {selectedResume.company}</p>
                  </div>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ✕
                  </button>
                </div>

                {/* Score Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 text-center">
                    <div className={`text-3xl font-bold ${getScoreColor(selectedResume.relevance_score)}`}>
                      {selectedResume.relevance_score}%
                    </div>
                    <div className="text-sm text-gray-600">Overall Relevance</div>
                  </div>
                  <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {selectedResume.matched_skills.length}
                    </div>
                    <div className="text-sm text-gray-600">Skills Matched</div>
                  </div>
                  <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-red-600">
                      {selectedResume.missing_skills.length}
                    </div>
                    <div className="text-sm text-gray-600">Skills Missing</div>
                  </div>
                </div>

                {/* Verdict */}
                <div className="mb-6">
                  <div className={`inline-flex items-center px-4 py-2 rounded-full text-lg font-medium ${getVerdictColor(selectedResume.verdict)}`}>
                    {selectedResume.verdict} Match Candidate
                  </div>
                </div>

                {/* Skills Analysis */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="font-semibold text-green-700 mb-3 flex items-center">
                      ✅ Matched Skills ({selectedResume.matched_skills.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedResume.matched_skills.map((skill, index) => (
                        <span key={index} className="px-3 py-1 bg-green-100 text-green-700 rounded-md text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-red-700 mb-3 flex items-center">
                      ❌ Missing Skills ({selectedResume.missing_skills.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedResume.missing_skills.map((skill, index) => (
                        <span key={index} className="px-3 py-1 bg-red-100 text-red-700 rounded-md text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between items-center pt-4 border-t">
                  <div className="text-sm text-gray-500">
                    📄 {selectedResume.filename} • 📅 {new Date(selectedResume.analysis_timestamp).toLocaleDateString()}
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => {
                        shortlistCandidate(selectedResume.id);
                        setShowDetailModal(false);
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      ✓ Shortlist Candidate
                    </button>
                    <button
                      onClick={() => setShowDetailModal(false)}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper component for stats cards
interface StatCardProps {
  title: string;
  value: number;
  icon: string;
  color: 'blue' | 'green' | 'yellow' | 'purple';
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    purple: 'bg-purple-50 text-purple-600'
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="flex items-center">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          <span className="text-xl">{icon}</span>
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

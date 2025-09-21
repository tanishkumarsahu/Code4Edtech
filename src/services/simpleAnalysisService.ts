/**
 * Simple Analysis Service - Working Demo Version
 * Provides comprehensive analysis without complex LLM integration
 */

import { JobDescription } from './directDbService';

export interface SimpleAnalysisResult {
  // Core Requirements
  relevance_score: number; // 0-100
  verdict: 'High' | 'Medium' | 'Low';
  
  // Skills Analysis
  matched_skills: string[];
  missing_skills: string[];
  critical_missing_skills: string[];
  
  // Detailed Analysis
  hard_match_score: number;
  semantic_match_score: number;
  
  // Gap Analysis
  missing_certifications: string[];
  missing_projects: string[];
  experience_gaps: string[];
  education_gaps: string[];
  
  // Feedback
  strengths: string[];
  weaknesses: string[];
  improvement_suggestions: string[];
  recommended_courses: string[];
  recommended_projects: string[];
  
  // Skills Breakdown
  skills_breakdown: {
    technical_skills: { matched: string[]; missing: string[] };
    soft_skills: { matched: string[]; missing: string[] };
    domain_knowledge: { matched: string[]; missing: string[] };
  };
  
  // Scoring Details
  scoring_breakdown: {
    skills_match: number;
    experience_match: number;
    education_match: number;
    project_relevance: number;
    overall_fit: number;
  };
  
  // Action Plan
  immediate_actions: string[];
  short_term_goals: string[];
  long_term_goals: string[];
  
  // Metadata
  analysis_timestamp: string;
  confidence_score: number;
}

export class SimpleAnalysisService {
  /**
   * Perform comprehensive resume analysis
   */
  static async analyzeResumeSimple(
    resumeText: string,
    jobDescription: JobDescription
  ): Promise<SimpleAnalysisResult> {
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Hard match analysis
    const hardMatchResult = this.performHardMatch(resumeText, jobDescription);
    
    // Generate comprehensive analysis
    const analysis = this.generateComprehensiveAnalysis(hardMatchResult, jobDescription, resumeText);
    
    return analysis;
  }

  /**
   * Hard Match Analysis - Skills and Keywords
   */
  private static performHardMatch(resumeText: string, jobDescription: JobDescription) {
    const resumeLower = resumeText.toLowerCase();
    const mustHaveSkills = jobDescription.must_have_skills;
    const goodToHaveSkills = jobDescription.good_to_have_skills;
    
    // Enhanced skill matching
    const skillVariations: { [key: string]: string[] } = {
      'javascript': ['js', 'node.js', 'nodejs', 'react', 'angular', 'vue'],
      'python': ['py', 'django', 'flask', 'fastapi', 'pandas', 'numpy'],
      'java': ['spring', 'hibernate', 'maven', 'gradle'],
      'react': ['reactjs', 'react.js', 'jsx', 'hooks'],
      'angular': ['angularjs', 'angular.js', 'typescript'],
      'machine learning': ['ml', 'ai', 'artificial intelligence', 'tensorflow', 'pytorch'],
      'sql': ['mysql', 'postgresql', 'database', 'db'],
      'aws': ['amazon web services', 'cloud', 'ec2', 's3', 'lambda'],
      'docker': ['containerization', 'kubernetes', 'k8s'],
      'git': ['github', 'version control', 'gitlab', 'bitbucket']
    };

    const matchedSkills: string[] = [];
    const missingSkills: string[] = [];
    
    // Check all skills
    [...mustHaveSkills, ...goodToHaveSkills].forEach(skill => {
      const skillLower = skill.toLowerCase();
      let isMatched = resumeLower.includes(skillLower);
      
      // Check variations
      if (!isMatched && skillVariations[skillLower]) {
        isMatched = skillVariations[skillLower].some(variation => 
          resumeLower.includes(variation.toLowerCase())
        );
      }
      
      if (isMatched) {
        matchedSkills.push(skill);
      } else {
        missingSkills.push(skill);
      }
    });
    
    // Calculate score
    const totalSkills = mustHaveSkills.length + goodToHaveSkills.length;
    const hardMatchScore = totalSkills > 0 ? Math.round((matchedSkills.length / totalSkills) * 100) : 50;

    return {
      hard_match_score: hardMatchScore,
      matched_skills: matchedSkills,
      missing_skills: missingSkills,
      critical_missing_skills: missingSkills.filter(skill => mustHaveSkills.includes(skill))
    };
  }

  /**
   * Generate comprehensive analysis based on job type and skills
   */
  private static generateComprehensiveAnalysis(
    hardMatch: any, 
    jobDescription: JobDescription, 
    resumeText: string
  ): SimpleAnalysisResult {
    
    // Generate semantic score based on job type and content
    const semanticScore = this.calculateSemanticScore(jobDescription, resumeText, hardMatch.hard_match_score);
    
    // Calculate final score (40% hard + 60% semantic)
    const finalScore = Math.round((hardMatch.hard_match_score * 0.4) + (semanticScore * 0.6));
    
    // Generate verdict
    let verdict: 'High' | 'Medium' | 'Low';
    if (finalScore >= 80) verdict = 'High';
    else if (finalScore >= 60) verdict = 'Medium';
    else verdict = 'Low';

    // Generate job-specific analysis
    const jobSpecificAnalysis = this.getJobSpecificAnalysis(jobDescription.title);
    
    return {
      // Core scores
      relevance_score: finalScore,
      verdict,
      hard_match_score: hardMatch.hard_match_score,
      semantic_match_score: semanticScore,
      
      // Skills
      matched_skills: hardMatch.matched_skills,
      missing_skills: hardMatch.missing_skills,
      critical_missing_skills: hardMatch.critical_missing_skills,
      
      // Gap analysis
      missing_certifications: jobSpecificAnalysis.certifications,
      missing_projects: jobSpecificAnalysis.projects,
      experience_gaps: jobSpecificAnalysis.experience,
      education_gaps: jobSpecificAnalysis.education,
      
      // Feedback
      strengths: this.generateStrengths(hardMatch.matched_skills, jobDescription),
      weaknesses: this.generateWeaknesses(hardMatch.missing_skills, jobDescription),
      improvement_suggestions: jobSpecificAnalysis.suggestions,
      recommended_courses: jobSpecificAnalysis.courses,
      recommended_projects: jobSpecificAnalysis.projectIdeas,
      
      // Skills breakdown
      skills_breakdown: this.categorizeSkills(hardMatch.matched_skills, hardMatch.missing_skills),
      
      // Scoring breakdown
      scoring_breakdown: {
        skills_match: hardMatch.hard_match_score,
        experience_match: Math.max(40, finalScore - 20),
        education_match: Math.max(50, finalScore - 10),
        project_relevance: Math.max(45, finalScore - 15),
        overall_fit: finalScore
      },
      
      // Action plan
      immediate_actions: jobSpecificAnalysis.immediateActions,
      short_term_goals: jobSpecificAnalysis.shortTermGoals,
      long_term_goals: jobSpecificAnalysis.longTermGoals,
      
      // Metadata
      analysis_timestamp: new Date().toISOString(),
      confidence_score: Math.max(75, Math.min(95, finalScore + 10))
    };
  }

  /**
   * Calculate semantic score based on job type and resume content
   */
  private static calculateSemanticScore(jobDescription: JobDescription, resumeText: string, hardScore: number): number {
    const resumeLower = resumeText.toLowerCase();
    let semanticScore = hardScore; // Base on hard score
    
    // Job-specific keywords that indicate good fit
    const jobKeywords: { [key: string]: string[] } = {
      'software engineer': ['development', 'programming', 'coding', 'software', 'application', 'system'],
      'frontend developer': ['ui', 'ux', 'responsive', 'design', 'user interface', 'web'],
      'data scientist': ['analysis', 'statistics', 'model', 'prediction', 'insights', 'visualization']
    };
    
    const jobTitle = jobDescription.title.toLowerCase();
    const relevantKeywords = jobKeywords[jobTitle] || [];
    
    // Boost score for relevant keywords
    const keywordMatches = relevantKeywords.filter(keyword => resumeLower.includes(keyword)).length;
    const keywordBoost = Math.min(20, keywordMatches * 3);
    
    // Experience indicators
    const experienceIndicators = ['years', 'experience', 'worked', 'developed', 'built', 'led', 'managed'];
    const experienceMatches = experienceIndicators.filter(indicator => resumeLower.includes(indicator)).length;
    const experienceBoost = Math.min(15, experienceMatches * 2);
    
    // Project indicators
    const projectIndicators = ['project', 'built', 'created', 'developed', 'implemented'];
    const projectMatches = projectIndicators.filter(indicator => resumeLower.includes(indicator)).length;
    const projectBoost = Math.min(10, projectMatches * 2);
    
    semanticScore = Math.min(100, semanticScore + keywordBoost + experienceBoost + projectBoost);
    
    return Math.round(semanticScore);
  }

  /**
   * Get job-specific analysis recommendations
   */
  private static getJobSpecificAnalysis(jobTitle: string) {
    const jobTitleLower = jobTitle.toLowerCase();
    
    if (jobTitleLower.includes('software engineer') || jobTitleLower.includes('developer')) {
      return {
        certifications: ['AWS Certified Developer', 'Google Cloud Professional', 'Microsoft Azure Fundamentals'],
        projects: ['Full-stack web application', 'REST API development', 'Database design project'],
        experience: ['Production environment experience', 'Code review participation', 'Agile methodology'],
        education: ['Computer Science fundamentals', 'Data structures and algorithms'],
        suggestions: [
          'Build a comprehensive portfolio on GitHub',
          'Contribute to open source projects',
          'Practice coding challenges on LeetCode',
          'Learn cloud platform basics',
          'Improve system design knowledge'
        ],
        courses: ['Advanced JavaScript', 'System Design', 'Cloud Computing', 'Database Management'],
        projectIdeas: ['E-commerce platform', 'Task management app', 'Real-time chat application'],
        immediateActions: [
          'Update GitHub profile with recent projects',
          'Complete online coding assessment',
          'Apply for developer internships'
        ],
        shortTermGoals: [
          'Complete a full-stack project',
          'Get AWS certification',
          'Build professional network'
        ],
        longTermGoals: [
          'Secure full-time developer role',
          'Specialize in specific technology stack'
        ]
      };
    } else if (jobTitleLower.includes('frontend')) {
      return {
        certifications: ['Google UX Design Certificate', 'Frontend Masters Certificate'],
        projects: ['Responsive portfolio website', 'Interactive web application', 'Mobile-first design'],
        experience: ['UI/UX collaboration', 'Cross-browser compatibility', 'Performance optimization'],
        education: ['Design principles', 'User experience fundamentals'],
        suggestions: [
          'Create a stunning portfolio website',
          'Learn modern CSS frameworks',
          'Practice responsive design',
          'Study user experience principles',
          'Build interactive components'
        ],
        courses: ['Advanced CSS', 'React/Vue.js', 'UI/UX Design', 'Web Performance'],
        projectIdeas: ['Personal portfolio', 'Landing page designs', 'Component library'],
        immediateActions: [
          'Redesign personal portfolio',
          'Create Dribbble/Behance profile',
          'Practice daily UI challenges'
        ],
        shortTermGoals: [
          'Master a modern frontend framework',
          'Build 3-5 impressive projects',
          'Network with designers'
        ],
        longTermGoals: [
          'Become senior frontend developer',
          'Lead UI/UX initiatives'
        ]
      };
    } else if (jobTitleLower.includes('data scientist') || jobTitleLower.includes('data')) {
      return {
        certifications: ['AWS Machine Learning Specialty', 'Google Data Analytics', 'Tableau Desktop'],
        projects: ['Predictive modeling project', 'Data visualization dashboard', 'Machine learning pipeline'],
        experience: ['Statistical analysis', 'Data cleaning and preprocessing', 'Model deployment'],
        education: ['Statistics and probability', 'Machine learning algorithms'],
        suggestions: [
          'Build end-to-end ML projects',
          'Create data visualization portfolio',
          'Practice statistical analysis',
          'Learn cloud ML platforms',
          'Participate in Kaggle competitions'
        ],
        courses: ['Machine Learning', 'Statistics', 'Data Visualization', 'Big Data Analytics'],
        projectIdeas: ['Customer churn prediction', 'Sales forecasting model', 'Sentiment analysis tool'],
        immediateActions: [
          'Complete a Kaggle competition',
          'Build ML project portfolio',
          'Create data science blog'
        ],
        shortTermGoals: [
          'Master Python data science stack',
          'Complete advanced ML course',
          'Build industry connections'
        ],
        longTermGoals: [
          'Become senior data scientist',
          'Lead data science initiatives'
        ]
      };
    }
    
    // Default analysis
    return {
      certifications: ['Industry-relevant certifications'],
      projects: ['Portfolio projects', 'Real-world applications'],
      experience: ['Hands-on experience', 'Professional development'],
      education: ['Continuous learning', 'Skill development'],
      suggestions: ['Build relevant projects', 'Gain practical experience', 'Network with professionals'],
      courses: ['Technical skills', 'Industry knowledge', 'Professional development'],
      projectIdeas: ['Personal projects', 'Open source contributions'],
      immediateActions: ['Update resume', 'Build portfolio', 'Apply for positions'],
      shortTermGoals: ['Develop core skills', 'Gain experience', 'Build network'],
      longTermGoals: ['Career advancement', 'Specialization']
    };
  }

  /**
   * Generate strengths based on matched skills
   */
  private static generateStrengths(matchedSkills: string[], jobDescription: JobDescription): string[] {
    const strengths = [];
    
    if (matchedSkills.length > 0) {
      strengths.push(`Strong technical foundation in ${matchedSkills.slice(0, 3).join(', ')}`);
    }
    
    if (matchedSkills.some(skill => ['JavaScript', 'Python', 'Java'].includes(skill))) {
      strengths.push('Solid programming language expertise');
    }
    
    if (matchedSkills.some(skill => ['React', 'Angular', 'Vue'].includes(skill))) {
      strengths.push('Modern frontend framework experience');
    }
    
    if (matchedSkills.some(skill => ['AWS', 'Docker', 'Kubernetes'].includes(skill))) {
      strengths.push('Cloud and DevOps knowledge');
    }
    
    strengths.push('Relevant educational background');
    strengths.push('Demonstrated learning ability');
    
    return strengths.slice(0, 5);
  }

  /**
   * Generate weaknesses based on missing skills
   */
  private static generateWeaknesses(missingSkills: string[], jobDescription: JobDescription): string[] {
    const weaknesses = [];
    
    if (missingSkills.length > 0) {
      weaknesses.push(`Missing key skills: ${missingSkills.slice(0, 3).join(', ')}`);
    }
    
    if (missingSkills.some(skill => ['AWS', 'Cloud'].includes(skill))) {
      weaknesses.push('Limited cloud platform experience');
    }
    
    if (missingSkills.some(skill => ['Docker', 'Kubernetes'].includes(skill))) {
      weaknesses.push('DevOps and containerization skills needed');
    }
    
    weaknesses.push('Could benefit from more hands-on project experience');
    weaknesses.push('Professional development opportunities available');
    
    return weaknesses.slice(0, 4);
  }

  /**
   * Categorize skills into technical, soft, and domain knowledge
   */
  private static categorizeSkills(matched: string[], missing: string[]) {
    const technical = ['JavaScript', 'Python', 'Java', 'React', 'Node.js', 'SQL', 'AWS', 'Docker'];
    const soft = ['Communication', 'Leadership', 'Teamwork', 'Problem Solving', 'Project Management'];
    const domain = ['Machine Learning', 'Data Science', 'Web Development', 'Mobile Development'];
    
    return {
      technical_skills: {
        matched: matched.filter(skill => technical.some(t => skill.toLowerCase().includes(t.toLowerCase()))),
        missing: missing.filter(skill => technical.some(t => skill.toLowerCase().includes(t.toLowerCase())))
      },
      soft_skills: {
        matched: matched.filter(skill => soft.some(s => skill.toLowerCase().includes(s.toLowerCase()))),
        missing: ['Communication', 'Leadership'].filter(skill => !matched.includes(skill))
      },
      domain_knowledge: {
        matched: matched.filter(skill => domain.some(d => skill.toLowerCase().includes(d.toLowerCase()))),
        missing: missing.filter(skill => domain.some(d => skill.toLowerCase().includes(d.toLowerCase())))
      }
    };
  }
}

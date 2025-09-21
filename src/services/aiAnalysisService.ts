/**
 * AI Analysis Service
 * Implements resume analysis using multiple LLM providers
 * Follows PRD requirements for scoring and feedback generation
 */

import { IResume, IJobDescription, IAnalysis, IFeedback } from '@/types';

export interface AIProvider {
  name: 'openai' | 'claude' | 'gemini';
  apiKey: string;
  model: string;
}

export interface AnalysisRequest {
  resumeText: string;
  jobDescription: IJobDescription;
  resumeData: IResume['parsedData'];
}

export interface AnalysisResult {
  relevanceScore: number; // 0-100
  verdict: 'High' | 'Medium' | 'Low';
  hardMatchScore: number;
  semanticMatchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  strengths: string[];
  gaps: string[];
  feedback: string;
  improvementSuggestions: string[];
  recommendedSkills: string[];
}

/**
 * AI Analysis Service Class
 * Implements multi-provider AI analysis with fallback support
 */
export class AIAnalysisService {
  private static instance: AIAnalysisService;
  private providers: AIProvider[] = [];

  constructor() {
    this.initializeProviders();
  }

  public static getInstance(): AIAnalysisService {
    if (!AIAnalysisService.instance) {
      AIAnalysisService.instance = new AIAnalysisService();
    }
    return AIAnalysisService.instance;
  }

  /**
   * Initialize available AI providers
   */
  private initializeProviders(): void {
    // OpenAI
    if (process.env.OPENAI_API_KEY) {
      this.providers.push({
        name: 'openai',
        apiKey: process.env.OPENAI_API_KEY,
        model: 'gpt-4o-mini', // Cost-effective for hackathon
      });
    }

    // Anthropic Claude
    if (process.env.ANTHROPIC_API_KEY) {
      this.providers.push({
        name: 'claude',
        apiKey: process.env.ANTHROPIC_API_KEY,
        model: 'claude-3-haiku-20240307', // Fast and cost-effective
      });
    }

    // Google Gemini
    if (process.env.GEMINI_API_KEY) {
      this.providers.push({
        name: 'gemini',
        apiKey: process.env.GEMINI_API_KEY,
        model: 'gemini-1.5-flash', // Fast and free tier available
      });
    }

    console.log(`Initialized ${this.providers.length} AI providers:`, this.providers.map(p => p.name));
  }

  /**
   * Analyze resume against job description
   */
  public async analyzeResume(request: AnalysisRequest): Promise<AnalysisResult> {
    try {
      // Step 1: Hard Match Analysis (keyword/skills matching)
      const hardMatchResult = this.performHardMatch(request);

      // Step 2: Semantic Analysis using AI
      const semanticResult = await this.performSemanticAnalysis(request);

      // Step 3: Combine results and calculate final score
      const finalResult = this.combineAnalysisResults(hardMatchResult, semanticResult);

      // Step 4: Generate verdict based on score
      finalResult.verdict = this.generateVerdict(finalResult.relevanceScore);

      return finalResult;
    } catch (error) {
      console.error('AI Analysis failed:', error);
      
      // Fallback to basic analysis if AI fails
      return this.performBasicAnalysis(request);
    }
  }

  /**
   * Hard Match Analysis (Keyword/Skills Matching)
   * 40% weight in final score as per PRD
   */
  private performHardMatch(request: AnalysisRequest): Partial<AnalysisResult> {
    const { resumeData, jobDescription } = request;
    
    // Extract required skills from job description
    const requiredSkills = [
      ...jobDescription.requirements.mustHave,
      ...jobDescription.requirements.goodToHave,
    ].map(skill => skill.toLowerCase());

    // Extract skills from resume
    const resumeSkills = resumeData.skills.map(skill => skill.toLowerCase());

    // Calculate matches
    const matchedSkills: string[] = [];
    const missingSkills: string[] = [];

    requiredSkills.forEach(reqSkill => {
      const isMatched = resumeSkills.some(resumeSkill => 
        resumeSkill.includes(reqSkill) || reqSkill.includes(resumeSkill)
      );
      
      if (isMatched) {
        matchedSkills.push(reqSkill);
      } else {
        missingSkills.push(reqSkill);
      }
    });

    // Calculate hard match score
    const hardMatchScore = requiredSkills.length > 0 
      ? (matchedSkills.length / requiredSkills.length) * 100 
      : 0;

    return {
      hardMatchScore: Math.round(hardMatchScore),
      matchedSkills,
      missingSkills,
    };
  }

  /**
   * Semantic Analysis using AI
   * 60% weight in final score as per PRD
   */
  private async performSemanticAnalysis(request: AnalysisRequest): Promise<Partial<AnalysisResult>> {
    const prompt = this.buildAnalysisPrompt(request);
    
    // Try each provider until one succeeds
    for (const provider of this.providers) {
      try {
        const result = await this.callAIProvider(provider, prompt);
        return this.parseAIResponse(result);
      } catch (error) {
        console.error(`AI Provider ${provider.name} failed:`, error);
        continue;
      }
    }

    throw new Error('All AI providers failed');
  }

  /**
   * Build comprehensive analysis prompt
   */
  private buildAnalysisPrompt(request: AnalysisRequest): string {
    const { resumeText, jobDescription, resumeData } = request;

    return `
You are an expert HR analyst. Analyze this resume against the job description and provide a detailed assessment.

JOB DESCRIPTION:
Title: ${jobDescription.title}
Company: ${jobDescription.company}
Description: ${jobDescription.description}
Required Skills: ${jobDescription.requirements.mustHave.join(', ')}
Preferred Skills: ${jobDescription.requirements.goodToHave.join(', ')}
Experience: ${jobDescription.requirements.experience}
Education: ${jobDescription.requirements.education.join(', ')}

RESUME CONTENT:
${resumeText}

PARSED RESUME DATA:
Name: ${resumeData.personalInfo.name}
Skills: ${resumeData.skills.join(', ')}
Experience: ${resumeData.experience.map(exp => `${exp.company} - ${exp.duration}`).join(', ')}
Education: ${resumeData.education.map(edu => `${edu.degree} from ${edu.institution}`).join(', ')}

Please analyze and respond with a JSON object containing:
{
  "semanticMatchScore": number (0-100),
  "strengths": string[] (3-5 key strengths),
  "gaps": string[] (3-5 areas for improvement),
  "feedback": string (2-3 sentences overall assessment),
  "improvementSuggestions": string[] (3-5 specific suggestions),
  "recommendedSkills": string[] (3-5 skills to learn)
}

Focus on:
1. How well the candidate's experience aligns with job requirements
2. Skill relevance and depth
3. Career progression and growth potential
4. Specific gaps and improvement areas
5. Actionable recommendations

Provide honest, constructive feedback that helps the candidate improve.
`;
  }

  /**
   * Call AI provider with retry logic
   */
  private async callAIProvider(provider: AIProvider, prompt: string): Promise<string> {
    switch (provider.name) {
      case 'openai':
        return this.callOpenAI(provider, prompt);
      case 'claude':
        return this.callClaude(provider, prompt);
      case 'gemini':
        return this.callGemini(provider, prompt);
      default:
        throw new Error(`Unsupported AI provider: ${provider.name}`);
    }
  }

  /**
   * OpenAI API call
   */
  private async callOpenAI(provider: AIProvider, prompt: string): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${provider.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: provider.model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert HR analyst specializing in resume evaluation. Always respond with valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  /**
   * Claude API call
   */
  private async callClaude(provider: AIProvider, prompt: string): Promise<string> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': provider.apiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: provider.model,
        max_tokens: 1500,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status}`);
    }

    const data = await response.json();
    return data.content[0].text;
  }

  /**
   * Gemini API call
   */
  private async callGemini(provider: AIProvider, prompt: string): Promise<string> {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${provider.model}:generateContent?key=${provider.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 1500,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  }

  /**
   * Parse AI response and extract structured data
   */
  private parseAIResponse(aiResponse: string): Partial<AnalysisResult> {
    try {
      // Extract JSON from response (AI might include extra text)
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in AI response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      return {
        semanticMatchScore: Math.min(100, Math.max(0, parsed.semanticMatchScore || 0)),
        strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
        gaps: Array.isArray(parsed.gaps) ? parsed.gaps : [],
        feedback: parsed.feedback || '',
        improvementSuggestions: Array.isArray(parsed.improvementSuggestions) ? parsed.improvementSuggestions : [],
        recommendedSkills: Array.isArray(parsed.recommendedSkills) ? parsed.recommendedSkills : [],
      };
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      
      // Return fallback analysis
      return {
        semanticMatchScore: 50,
        strengths: ['Experience in relevant field'],
        gaps: ['Could improve technical skills'],
        feedback: 'Resume shows potential but needs improvement in key areas.',
        improvementSuggestions: ['Add more specific achievements', 'Include relevant certifications'],
        recommendedSkills: ['Communication', 'Leadership'],
      };
    }
  }

  /**
   * Combine hard match and semantic analysis results
   * Hard Match: 40% weight, Semantic: 60% weight (as per PRD)
   */
  private combineAnalysisResults(
    hardMatch: Partial<AnalysisResult>,
    semantic: Partial<AnalysisResult>
  ): AnalysisResult {
    const hardScore = hardMatch.hardMatchScore || 0;
    const semanticScore = semantic.semanticMatchScore || 0;
    
    // Weighted combination: 40% hard match + 60% semantic match
    const relevanceScore = Math.round((hardScore * 0.4) + (semanticScore * 0.6));

    return {
      relevanceScore,
      verdict: 'Medium', // Will be set by generateVerdict
      hardMatchScore: hardScore,
      semanticMatchScore: semanticScore,
      matchedSkills: hardMatch.matchedSkills || [],
      missingSkills: hardMatch.missingSkills || [],
      strengths: semantic.strengths || [],
      gaps: semantic.gaps || [],
      feedback: semantic.feedback || '',
      improvementSuggestions: semantic.improvementSuggestions || [],
      recommendedSkills: semantic.recommendedSkills || [],
    };
  }

  /**
   * Generate verdict based on score (as per PRD requirements)
   */
  private generateVerdict(score: number): 'High' | 'Medium' | 'Low' {
    if (score >= 80) return 'High';
    if (score >= 50) return 'Medium';
    return 'Low';
  }

  /**
   * Fallback basic analysis when AI fails
   */
  private performBasicAnalysis(request: AnalysisRequest): AnalysisResult {
    const hardMatch = this.performHardMatch(request);
    const score = hardMatch.hardMatchScore || 30;

    return {
      relevanceScore: score,
      verdict: this.generateVerdict(score),
      hardMatchScore: score,
      semanticMatchScore: score,
      matchedSkills: hardMatch.matchedSkills || [],
      missingSkills: hardMatch.missingSkills || [],
      strengths: ['Shows relevant experience'],
      gaps: ['Could improve skill alignment'],
      feedback: 'Basic analysis completed. Consider improving skills alignment with job requirements.',
      improvementSuggestions: ['Focus on required skills', 'Add relevant projects'],
      recommendedSkills: hardMatch.missingSkills?.slice(0, 3) || [],
    };
  }
}

// Export singleton instance
export const aiAnalysisService = AIAnalysisService.getInstance();

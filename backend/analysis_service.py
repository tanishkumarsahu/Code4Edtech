"""
Advanced Resume Analysis Service using LangChain
Implements hybrid scoring as per hackathon requirements
"""

import os
import json
from typing import Dict, List, Any
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import ChatPromptTemplate
from langchain.schema import HumanMessage
import chromadb
from chromadb.utils import embedding_functions
import spacy

class ResumeAnalysisService:
    def __init__(self):
        # Initialize Gemini LLM
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-1.5-flash",
            google_api_key=os.getenv("GEMINI_API_KEY"),
            temperature=0.3
        )
        
        # Initialize ChromaDB for vector storage
        self.chroma_client = chromadb.Client()
        self.embedding_function = embedding_functions.DefaultEmbeddingFunction()
        
        # Initialize spaCy for text processing
        try:
            self.nlp = spacy.load("en_core_web_sm")
        except OSError:
            print("spaCy model not found. Install with: python -m spacy download en_core_web_sm")
            self.nlp = None
    
    def analyze_resume(self, resume_text: str, job_description: Dict[str, Any]) -> Dict[str, Any]:
        """
        Perform comprehensive resume analysis using hybrid scoring
        """
        try:
            # Step 1: Hard Match Analysis
            hard_match_result = self.perform_hard_match(resume_text, job_description)
            
            # Step 2: Semantic Analysis using LLM
            semantic_result = self.perform_semantic_analysis(resume_text, job_description)
            
            # Step 3: Combine results with weighted scoring
            final_result = self.combine_analysis_results(hard_match_result, semantic_result)
            
            return final_result
            
        except Exception as e:
            print(f"Analysis error: {e}")
            # Return fallback analysis
            return self.fallback_analysis(resume_text, job_description)
    
    def perform_hard_match(self, resume_text: str, job_description: Dict[str, Any]) -> Dict[str, Any]:
        """
        Perform keyword and skill matching (hard match)
        """
        resume_lower = resume_text.lower()
        
        # Extract skills from job description
        must_have_skills = job_description.get('must_have_skills', [])
        good_to_have_skills = job_description.get('good_to_have_skills', [])
        all_skills = must_have_skills + good_to_have_skills
        
        matched_skills = []
        missing_skills = []
        
        # Check for skill matches (including fuzzy matching)
        for skill in all_skills:
            if self.skill_matches(skill, resume_lower):
                matched_skills.append(skill)
            else:
                missing_skills.append(skill)
        
        # Calculate hard match score
        if len(all_skills) > 0:
            hard_score = (len(matched_skills) / len(all_skills)) * 100
        else:
            hard_score = 50
        
        return {
            'hard_match_score': int(hard_score),
            'matched_skills': matched_skills,
            'missing_skills': missing_skills
        }
    
    def skill_matches(self, skill: str, resume_text: str) -> bool:
        """
        Check if skill matches in resume text (with fuzzy matching)
        """
        skill_lower = skill.lower()
        
        # Direct match
        if skill_lower in resume_text:
            return True
        
        # Common variations
        variations = {
            'javascript': ['js', 'node.js', 'nodejs'],
            'python': ['py', 'django', 'flask'],
            'react': ['reactjs', 'react.js'],
            'angular': ['angularjs', 'angular.js'],
            'machine learning': ['ml', 'ai', 'artificial intelligence'],
            'database': ['db', 'sql', 'mysql', 'postgresql']
        }
        
        if skill_lower in variations:
            for variation in variations[skill_lower]:
                if variation in resume_text:
                    return True
        
        return False
    
    def perform_semantic_analysis(self, resume_text: str, job_description: Dict[str, Any]) -> Dict[str, Any]:
        """
        Perform semantic analysis using LLM
        """
        try:
            prompt = ChatPromptTemplate.from_template("""
            You are an expert HR analyst. Analyze this resume against the job description and provide a detailed assessment.

            JOB DESCRIPTION:
            Title: {job_title}
            Company: {company}
            Description: {job_desc}
            Required Skills: {must_have_skills}
            Preferred Skills: {good_to_have_skills}
            Experience: {experience}

            RESUME CONTENT:
            {resume_text}

            Please analyze and respond with a JSON object containing:
            {{
                "semantic_match_score": number (0-100),
                "strengths": [list of 3-5 key strengths],
                "gaps": [list of 3-5 areas for improvement],
                "feedback": "2-3 sentences overall assessment",
                "improvement_suggestions": [list of 3-5 specific suggestions],
                "recommended_skills": [list of 3-5 skills to learn]
            }}

            Focus on:
            1. How well the candidate's experience aligns with job requirements
            2. Skill relevance and depth
            3. Career progression and growth potential
            4. Specific gaps and improvement areas
            5. Actionable recommendations

            Provide honest, constructive feedback that helps the candidate improve.
            """)
            
            # Format the prompt
            formatted_prompt = prompt.format(
                job_title=job_description.get('title', ''),
                company=job_description.get('company', ''),
                job_desc=job_description.get('description', ''),
                must_have_skills=', '.join(job_description.get('must_have_skills', [])),
                good_to_have_skills=', '.join(job_description.get('good_to_have_skills', [])),
                experience=job_description.get('experience_required', ''),
                resume_text=resume_text[:3000]  # Limit text length
            )
            
            # Get LLM response
            response = self.llm.invoke([HumanMessage(content=formatted_prompt)])
            
            # Parse JSON response
            try:
                # Extract JSON from response
                response_text = response.content
                json_start = response_text.find('{')
                json_end = response_text.rfind('}') + 1
                
                if json_start != -1 and json_end != -1:
                    json_text = response_text[json_start:json_end]
                    result = json.loads(json_text)
                    
                    return {
                        'semantic_match_score': min(100, max(0, result.get('semantic_match_score', 50))),
                        'strengths': result.get('strengths', []),
                        'gaps': result.get('gaps', []),
                        'feedback': result.get('feedback', ''),
                        'improvement_suggestions': result.get('improvement_suggestions', []),
                        'recommended_skills': result.get('recommended_skills', [])
                    }
                
            except json.JSONDecodeError:
                print("Failed to parse LLM JSON response")
            
            # Fallback if JSON parsing fails
            return self.create_fallback_semantic_result()
            
        except Exception as e:
            print(f"Semantic analysis error: {e}")
            return self.create_fallback_semantic_result()
    
    def create_fallback_semantic_result(self) -> Dict[str, Any]:
        """Create fallback semantic analysis result"""
        return {
            'semantic_match_score': 60,
            'strengths': ['Relevant experience', 'Good technical background'],
            'gaps': ['Could improve skill alignment', 'Add more specific achievements'],
            'feedback': 'Resume shows potential but needs improvement in key areas.',
            'improvement_suggestions': ['Add quantifiable achievements', 'Include relevant certifications'],
            'recommended_skills': ['Communication', 'Leadership', 'Problem Solving']
        }
    
    def combine_analysis_results(self, hard_match: Dict[str, Any], semantic: Dict[str, Any]) -> Dict[str, Any]:
        """
        Combine hard match and semantic analysis with weighted scoring
        Hard Match: 40% weight, Semantic: 60% weight (as per requirements)
        """
        hard_score = hard_match.get('hard_match_score', 0)
        semantic_score = semantic.get('semantic_match_score', 0)
        
        # Weighted combination: 40% hard + 60% semantic
        final_score = int((hard_score * 0.4) + (semantic_score * 0.6))
        
        # Determine verdict
        if final_score >= 80:
            verdict = "High"
        elif final_score >= 50:
            verdict = "Medium"
        else:
            verdict = "Low"
        
        return {
            'relevance_score': final_score,
            'verdict': verdict,
            'hard_match_score': hard_score,
            'semantic_match_score': semantic_score,
            'matched_skills': hard_match.get('matched_skills', []),
            'missing_skills': hard_match.get('missing_skills', []),
            'strengths': semantic.get('strengths', []),
            'gaps': semantic.get('gaps', []),
            'feedback': semantic.get('feedback', ''),
            'improvement_suggestions': semantic.get('improvement_suggestions', []),
            'recommended_skills': semantic.get('recommended_skills', [])
        }
    
    def fallback_analysis(self, resume_text: str, job_description: Dict[str, Any]) -> Dict[str, Any]:
        """
        Fallback analysis when LLM fails
        """
        # Perform basic hard match only
        hard_match = self.perform_hard_match(resume_text, job_description)
        score = hard_match.get('hard_match_score', 30)
        
        return {
            'relevance_score': score,
            'verdict': 'Medium' if score >= 50 else 'Low',
            'hard_match_score': score,
            'semantic_match_score': score,
            'matched_skills': hard_match.get('matched_skills', []),
            'missing_skills': hard_match.get('missing_skills', []),
            'strengths': ['Shows relevant experience'],
            'gaps': ['Could improve skill alignment'],
            'feedback': 'Basic analysis completed. Consider improving skills alignment with job requirements.',
            'improvement_suggestions': ['Focus on required skills', 'Add relevant projects'],
            'recommended_skills': hard_match.get('missing_skills', [])[:3]
        }

# Global instance
analysis_service = ResumeAnalysisService()

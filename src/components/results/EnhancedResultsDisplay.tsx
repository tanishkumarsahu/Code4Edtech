/**
 * Enhanced Results Display Component
 * Shows comprehensive analysis results as per rules.txt requirements
 */

'use client';

import React from 'react';
import { SimpleAnalysisResult } from '@/services/simpleAnalysisService';

interface EnhancedResultsDisplayProps {
  analysis: SimpleAnalysisResult & {
    id: number;
    filename: string;
    job_title: string;
    company: string;
  };
}

export const EnhancedResultsDisplay: React.FC<EnhancedResultsDisplayProps> = ({ analysis }) => {
  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case 'High': return 'text-green-600 bg-green-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'Low': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border p-6 space-y-6">
      {/* Header */}
      <div className="border-b pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{analysis.filename}</h3>
            <p className="text-sm text-gray-600">{analysis.job_title} at {analysis.company}</p>
          </div>
          <div className="text-right">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getVerdictColor(analysis.verdict)}`}>
              {analysis.verdict} Match
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Analyzed: {new Date(analysis.analysis_timestamp).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Overall Score */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 text-center">
          <div className={`text-3xl font-bold ${getScoreColor(analysis.relevance_score)}`}>
            {analysis.relevance_score}%
          </div>
          <div className="text-sm text-gray-600">Overall Relevance</div>
        </div>
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4 text-center">
          <div className={`text-3xl font-bold ${getScoreColor(analysis.hard_match_score)}`}>
            {analysis.hard_match_score}%
          </div>
          <div className="text-sm text-gray-600">Skills Match</div>
        </div>
        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4 text-center">
          <div className={`text-3xl font-bold ${getScoreColor(analysis.semantic_match_score)}`}>
            {analysis.semantic_match_score}%
          </div>
          <div className="text-sm text-gray-600">Semantic Fit</div>
        </div>
      </div>

      {/* Detailed Scoring Breakdown */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-3">📊 Detailed Score Breakdown</h4>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
          {Object.entries(analysis.scoring_breakdown).map(([key, value]) => (
            <div key={key} className="text-center">
              <div className={`font-bold ${getScoreColor(value)}`}>{value}%</div>
              <div className="text-gray-600 capitalize">{key.replace('_', ' ')}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Skills Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Matched Skills */}
        <div>
          <h4 className="font-semibold text-green-700 mb-2 flex items-center">
            ✅ Matched Skills ({analysis.matched_skills.length})
          </h4>
          <div className="flex flex-wrap gap-2">
            {analysis.matched_skills.map((skill, index) => (
              <span key={index} className="px-2 py-1 bg-green-100 text-green-700 rounded-md text-sm">
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Missing Skills */}
        <div>
          <h4 className="font-semibold text-red-700 mb-2 flex items-center">
            ❌ Missing Skills ({analysis.missing_skills.length})
          </h4>
          <div className="flex flex-wrap gap-2">
            {analysis.missing_skills.map((skill, index) => (
              <span key={index} className="px-2 py-1 bg-red-100 text-red-700 rounded-md text-sm">
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Critical Missing Skills */}
      {analysis.critical_missing_skills.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="font-semibold text-red-800 mb-2 flex items-center">
            🚨 Critical Missing Skills
          </h4>
          <div className="flex flex-wrap gap-2">
            {analysis.critical_missing_skills.map((skill, index) => (
              <span key={index} className="px-2 py-1 bg-red-200 text-red-800 rounded-md text-sm font-medium">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Skills Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(analysis.skills_breakdown).map(([category, skills]) => (
          <div key={category} className="border rounded-lg p-3">
            <h5 className="font-medium text-gray-900 mb-2 capitalize">
              {category.replace('_', ' ')}
            </h5>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-green-600 font-medium">✓ Matched:</span>
                <div className="text-gray-600">{skills.matched.join(', ') || 'None'}</div>
              </div>
              <div>
                <span className="text-red-600 font-medium">✗ Missing:</span>
                <div className="text-gray-600">{skills.missing.join(', ') || 'None'}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Strengths and Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-semibold text-green-700 mb-3 flex items-center">
            💪 Key Strengths
          </h4>
          <ul className="space-y-2">
            {analysis.strengths.map((strength, index) => (
              <li key={index} className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                <span className="text-gray-700 text-sm">{strength}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-orange-700 mb-3 flex items-center">
            🎯 Areas for Improvement
          </h4>
          <ul className="space-y-2">
            {analysis.weaknesses.map((weakness, index) => (
              <li key={index} className="flex items-start">
                <span className="text-orange-500 mr-2">•</span>
                <span className="text-gray-700 text-sm">{weakness}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Gap Analysis */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-semibold text-yellow-800 mb-3">🔍 Gap Analysis</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          {analysis.missing_certifications.length > 0 && (
            <div>
              <span className="font-medium text-yellow-700">Missing Certifications:</span>
              <div className="text-gray-700">{analysis.missing_certifications.join(', ')}</div>
            </div>
          )}
          {analysis.missing_projects.length > 0 && (
            <div>
              <span className="font-medium text-yellow-700">Recommended Projects:</span>
              <div className="text-gray-700">{analysis.missing_projects.join(', ')}</div>
            </div>
          )}
          {analysis.experience_gaps.length > 0 && (
            <div>
              <span className="font-medium text-yellow-700">Experience Gaps:</span>
              <div className="text-gray-700">{analysis.experience_gaps.join(', ')}</div>
            </div>
          )}
          {analysis.education_gaps.length > 0 && (
            <div>
              <span className="font-medium text-yellow-700">Education Gaps:</span>
              <div className="text-gray-700">{analysis.education_gaps.join(', ')}</div>
            </div>
          )}
        </div>
      </div>

      {/* Actionable Recommendations */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-800 mb-3">🚀 Action Plan</h4>
        
        {analysis.immediate_actions.length > 0 && (
          <div className="mb-4">
            <h5 className="font-medium text-blue-700 mb-2">Immediate Actions (Next 30 days):</h5>
            <ul className="space-y-1 text-sm">
              {analysis.immediate_actions.map((action, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-blue-500 mr-2">→</span>
                  <span className="text-gray-700">{action}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {analysis.short_term_goals.length > 0 && (
          <div className="mb-4">
            <h5 className="font-medium text-blue-700 mb-2">Short-term Goals (3-6 months):</h5>
            <ul className="space-y-1 text-sm">
              {analysis.short_term_goals.map((goal, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-blue-500 mr-2">→</span>
                  <span className="text-gray-700">{goal}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {analysis.long_term_goals.length > 0 && (
          <div>
            <h5 className="font-medium text-blue-700 mb-2">Long-term Goals (1-2 years):</h5>
            <ul className="space-y-1 text-sm">
              {analysis.long_term_goals.map((goal, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-blue-500 mr-2">→</span>
                  <span className="text-gray-700">{goal}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {analysis.recommended_courses.length > 0 && (
          <div>
            <h4 className="font-semibold text-purple-700 mb-3 flex items-center">
              📚 Recommended Courses
            </h4>
            <ul className="space-y-1 text-sm">
              {analysis.recommended_courses.map((course, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-purple-500 mr-2">•</span>
                  <span className="text-gray-700">{course}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {analysis.recommended_projects.length > 0 && (
          <div>
            <h4 className="font-semibold text-indigo-700 mb-3 flex items-center">
              🛠️ Recommended Projects
            </h4>
            <ul className="space-y-1 text-sm">
              {analysis.recommended_projects.map((project, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-indigo-500 mr-2">•</span>
                  <span className="text-gray-700">{project}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Confidence Score */}
      <div className="text-center pt-4 border-t">
        <div className="text-sm text-gray-600">
          Analysis Confidence: <span className="font-medium">{analysis.confidence_score}%</span>
        </div>
      </div>
    </div>
  );
};

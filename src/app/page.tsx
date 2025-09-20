/**
 * Home Page Component - Hackathon Compliant
 * Simple landing page without authentication
 */

'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Resume Relevance System</h1>
            </div>
            <nav className="flex space-x-4">
              <Link href="/student" className="text-blue-600 hover:text-blue-800 font-medium">
                Student Portal
              </Link>
              <Link href="/placement" className="text-blue-600 hover:text-blue-800 font-medium">
                Placement Team
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
            AI-Powered Resume
            <span className="text-blue-600"> Analysis</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Automated resume relevance check system using AI to match resumes with job descriptions. 
            Built for hackathon compliance with Flask + SQLite backend.
          </p>
          
          <div className="mt-10 flex justify-center space-x-6">
            <Link
              href="/student"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              Student Dashboard
              <span className="ml-2">📄</span>
            </Link>
            <Link
              href="/placement"
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              Placement Team
              <span className="ml-2">👥</span>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mt-20">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-blue-600 text-2xl mb-4">🤖</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Analysis</h3>
              <p className="text-gray-600">Real Gemini AI analysis for accurate resume-job matching</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-blue-600 text-2xl mb-4">⚡</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Flask Backend</h3>
              <p className="text-gray-600">Compliant architecture with Flask + SQLite database</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-blue-600 text-2xl mb-4">📊</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Filtering</h3>
              <p className="text-gray-600">Advanced filtering and search for placement teams</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

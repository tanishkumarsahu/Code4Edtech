/**
 * Home Page - Landing Page for Resume Relevance System
 * Provides authentication and role-based navigation
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { RoleSelectionModal } from '@/components/ui/role-selection-modal';
import { toast } from '@/components/ui/toaster';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [showRoleModal, setShowRoleModal] = useState(false);

  // Redirect authenticated users to their dashboard
  useEffect(() => {
    if (!loading && user) {
      const dashboardPath = user.role === 'student' ? '/student' : '/recruiter';
      router.push(dashboardPath);
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold text-gray-900">
                  Resume Relevance System
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/auth/login"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/auth/register"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-6">
              AI-Powered{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Resume Screening
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Automate resume evaluation with advanced AI. Match candidates to job descriptions 
              with precision, get detailed feedback, and streamline your hiring process.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/register?role=student"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors"
              >
                Upload Resume
              </Link>
              <Link
                href="/auth/register?role=recruiter"
                className="bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 px-8 py-3 rounded-lg text-lg font-medium transition-colors"
              >
                Start Screening
              </Link>
            </div>
            
            {/* Google Sign-In Option */}
            <div className="mt-6">
              <p className="text-sm text-gray-600 mb-3">Or get started instantly with</p>
              <button
                onClick={() => setShowRoleModal(true)}
                className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-6 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Powerful Features for Modern Recruitment
            </h2>
            <p className="text-lg text-gray-600">
              Built for Theme 2 Hackathon - AI Automation Challenge
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon="🤖"
              title="AI-Powered Analysis"
              description="Advanced semantic matching using LLMs to understand context beyond keywords"
            />
            <FeatureCard
              icon="📊"
              title="Detailed Scoring"
              description="Get comprehensive relevance scores (0-100) with breakdown of strengths and gaps"
            />
            <FeatureCard
              icon="💡"
              title="Smart Feedback"
              description="Personalized improvement suggestions for candidates to enhance their profiles"
            />
            <FeatureCard
              icon="⚡"
              title="Real-time Processing"
              description="Fast resume analysis with live status updates and instant results"
            />
            <FeatureCard
              icon="🔍"
              title="Advanced Filtering"
              description="Filter and search candidates by score, skills, experience, and more"
            />
            <FeatureCard
              icon="📈"
              title="Analytics Dashboard"
              description="Track hiring metrics, candidate quality, and recruitment performance"
            />
          </div>
        </div>

        {/* How it Works */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <ProcessStep
              step="1"
              title="Upload Job Description"
              description="Recruiters upload job requirements and descriptions"
            />
            <ProcessStep
              step="2"
              title="Submit Resume"
              description="Candidates upload their PDF/DOCX resumes"
            />
            <ProcessStep
              step="3"
              title="AI Analysis"
              description="Our AI analyzes and scores resume relevance"
            />
            <ProcessStep
              step="4"
              title="Get Results"
              description="View scores, feedback, and shortlisted candidates"
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-4">Resume Relevance System</h3>
            <p className="text-gray-400 mb-4">
              Built for Theme 2 Hackathon - AI Automation Challenge
            </p>
            <div className="flex justify-center space-x-6">
              <Link href="/auth/login" className="text-gray-400 hover:text-white transition-colors">
                Sign In
              </Link>
              <Link href="/auth/register" className="text-gray-400 hover:text-white transition-colors">
                Register
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Role Selection Modal */}
      <RoleSelectionModal
        isOpen={showRoleModal}
        onClose={() => setShowRoleModal(false)}
        onSuccess={() => {
          toast.success('Successfully signed in with Google!');
        }}
        onError={(error) => {
          toast.error(error);
        }}
      />
    </div>
  );
}

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="text-3xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

interface ProcessStepProps {
  step: string;
  title: string;
  description: string;
}

function ProcessStep({ step, title, description }: ProcessStepProps) {
  return (
    <div className="text-center">
      <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-4">
        {step}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

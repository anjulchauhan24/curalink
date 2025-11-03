'use client';

import Link from 'next/link';
import { Heart, Users, FileText, Search } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Heart className="h-8 w-8 text-primary-600" />
            <span className="text-2xl font-bold text-gray-900">CuraLink</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link 
              href="/login" 
              className="text-gray-600 hover:text-gray-900 font-medium"
            >
              Sign In
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
          Connecting Patients & Researchers
        </h1>
        <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
          AI-powered platform that simplifies the discovery of clinical trials, 
          medical publications, and health experts
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/register?type=patient"
            className="bg-primary-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-primary-700 transition-colors shadow-lg"
          >
            I am a Patient/Caregiver
          </Link>
          <Link 
            href="/register?type=researcher"
            className="bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold border-2 border-primary-600 hover:bg-primary-50 transition-colors"
          >
            I am a Researcher
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          What CuraLink Offers
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard
            icon={<Search className="h-12 w-12 text-primary-600" />}
            title="Clinical Trials"
            description="Discover relevant clinical trials based on your condition and location"
          />
          <FeatureCard
            icon={<FileText className="h-12 w-12 text-primary-600" />}
            title="Publications"
            description="Access latest medical research and publications with AI-powered summaries"
          />
          <FeatureCard
            icon={<Users className="h-12 w-12 text-primary-600" />}
            title="Health Experts"
            description="Connect with specialists and researchers in your field of interest"
          />
          <FeatureCard
            icon={<Heart className="h-12 w-12 text-primary-600" />}
            title="Community Forums"
            description="Engage in discussions and get answers from researchers"
          />
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            How It Works
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <StepCard
              step={1}
              title="Create Your Profile"
              description="Share your conditions, interests, and preferences to personalize your experience"
            />
            <StepCard
              step={2}
              title="Get Personalized Matches"
              description="Our AI analyzes and recommends relevant trials, research, and experts"
            />
            <StepCard
              step={3}
              title="Connect & Collaborate"
              description="Reach out to experts, join trials, and stay informed about latest research"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">
          Ready to Get Started?
        </h2>
        <p className="text-xl text-gray-600 mb-8">
          Join thousands of patients and researchers making meaningful connections
        </p>
        <Link 
          href="/register"
          className="inline-block bg-primary-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-primary-700 transition-colors shadow-lg"
        >
          Create Your Account
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">
            &copy; 2024 CuraLink. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
}) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function StepCard({ step, title, description }: { 
  step: number; 
  title: string; 
  description: string; 
}) {
  return (
    <div className="text-center">
      <div className="bg-primary-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
        {step}
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
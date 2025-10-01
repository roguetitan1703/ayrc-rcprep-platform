import React from 'react';
import { ArrowRight, Users, Calendar, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function HeroSection() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-card-surface">
      {/* Main Hero Content */}
      <div className="max-w-7xl mx-auto px-6 py-20 sm:py-32">
        <div className="text-center">
          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-text-primary mb-6 leading-snug">
           Elevate Your Reading Skills with ARC RC Prep
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-text-secondary mb-10 max-w-3xl mx-auto leading-relaxed">
            Prepare smarter for competitive exams with expert-curated passages, instant feedback, and daily practice.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link to="/register">
            <button className="group px-8 py-4 bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg text-lg transition-all duration-200 flex items-center gap-2 shadow-card hover:shadow-card-hover">
              Start Practicing
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            </Link>
            <Link to="/login">
            <button className="px-8 py-4 bg-card-surface text-text-primary font-semibold rounded-lg text-lg border border-neutral-grey hover:bg-opacity-80 transition-all duration-200">
              Login
            </button>
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center items-center gap-6 text-text-secondary text-sm sm:text-base">
            <div className="flex items-center gap-2">             
                <Users className="w-5 h-5 text-primary" stroke="#6366f1" />          
              <span>Trusted by 5,000+ aspirants</span>
            </div>
            <span className="hidden sm:inline text-primary">·</span>
            <div className="flex items-center gap-2">
              <Zap
                className="w-5 h-5 text-success-green"
                stroke="#10b981"
              />
              <span>Free to use</span>
            </div>
            <span className="hidden sm:inline text-primary">·</span>
            <div className="flex items-center gap-2">
              <Calendar
                className="w-5 h-5 text-primary-light"
                stroke="#8b5cf6"
              />
              <span>Daily practice sets</span>
            </div>
          </div>
        </div>

        {/* Visual Element - Simple Dashboard Preview */}
        <div className="mt-20 max-w-5xl mx-auto">
          <div className="bg-card-surface rounded-xl p-6 border border-neutral-grey shadow-card">
            <div className="flex gap-2 mb-5">
              <div className="w-3 h-3 rounded-full bg-error-red opacity-60"></div>
              <div className="w-3 h-3 rounded-full bg-accent-amber opacity-60"></div>
              <div className="w-3 h-3 rounded-full bg-success-green opacity-60"></div>
            </div>

            <div className="space-y-3">
              <div className="h-8 bg-background rounded-md w-3/4"></div>
              <div className="h-8 bg-background rounded-md w-full"></div>
              <div className="h-8 bg-background rounded-md w-5/6"></div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                <div className="h-24 rounded-lg border" style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', borderColor: 'rgba(99, 102, 241, 0.2)' }}></div>
                <div className="h-24 rounded-lg border" style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)', borderColor: 'rgba(139, 92, 246, 0.2)' }}></div>
                <div className="h-24 rounded-lg border" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.2)' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
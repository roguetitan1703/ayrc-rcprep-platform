import React from 'react';
import { ArrowRight, Users, Calendar, Zap, CheckCircle, TrendingUp, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import content from '../../../content/static.json'

export default function HeroSection() {

  const miniStats = [
    { label: "Total Attempts", value: 120, icon: <CheckCircle className="w-5 h-5 text-success-green" /> },
    { label: "Personal Best", value: "85%", icon: <TrendingUp className="w-5 h-5 text-primary" /> },
    { label: "Coverage", value: "72%", icon: <BookOpen className="w-5 h-5 text-accent-amber" /> },
  ];

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-background via-background to-card-surface overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-72 h-72 bg-accent-amber rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary rounded-full blur-3xl"></div>
      </div>

      {/* Main Hero Content */}
      <div className="relative max-w-7xl mx-auto px-6 py-16 sm:py-24 lg:py-32">
        <div className="text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full mb-8">
            <Zap className="w-4 h-4 text-primary" fill="currentColor" />
            <span className="text-sm font-medium text-primary">Master CAT Reading Comprehension</span>
          </div>

          {/* Main Headline with Gradient */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-text-primary mb-6 leading-tight">
            Elevate Your Reading Skills
            <br />
            <span className="bg-gradient-to-r from-primary via-accent-amber to-primary-light bg-clip-text text-transparent">
              with {content.platformName}
            </span>
          </h1>

          {/* body */}
          <p className="text-lg sm:text-xl text-text-secondary mb-12 max-w-3xl mx-auto leading-relaxed">
            Prepare smarter for competitive exams with expert-curated passages, 
            instant feedback, and daily practice that adapts to your learning pace.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link to="/register" className="w-full sm:w-auto">
              <button className="group w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-primary to-primary-light hover:from-primary-dark hover:to-primary text-white font-semibold rounded-lg text-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-105">
                Start Practicing Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
            <Link to="/login" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto px-8 py-4 bg-card-surface text-text-primary font-semibold rounded-lg text-lg border-2 border-neutral-grey hover:border-primary hover:bg-white/5 transition-all duration-300">
                Login
              </button>
            </Link>
          </div>              
        </div>

        {/* Enhanced Dashboard Preview */}
<div className="mt-12 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
  <div className="relative">
    {/* Glow effect */}
    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent-amber/20 to-primary-light/20 blur-3xl"></div>

    <div className="relative bg-gradient-to-br from-card-surface to-background rounded-2xl p-1 shadow-2xl">
      <div className="bg-card-surface rounded-xl p-4 sm:p-6 border border-neutral-grey/50">
        {/* Browser Chrome */}
        <div className="flex gap-2 mb-6">
          <div className="w-3 h-3 rounded-full bg-error-red"></div>
          <div className="w-3 h-3 rounded-full bg-accent-amber"></div>
          <div className="w-3 h-3 rounded-full bg-success-green"></div>
        </div>

        {/* Dashboard Content Preview */}
        <div className="space-y-4">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="h-auto min-h-[2.5rem] bg-gradient-to-r from-primary/20 to-transparent rounded-md w-full sm:w-52 p-2 font-semibold text-sm sm:text-base text-center sm:text-left">
              Platform Overview
            </div>
            <div className="h-auto min-h-[2rem] font-semibold bg-background/50 rounded-md w-full sm:w-36 px-2 py-1 text-sm sm:text-base text-center sm:text-left">
              Beta Access
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-8">
            <div className="group rounded-xl border-2 border-primary/20 bg-gradient-to-br from-primary/10 to-transparent p-4 hover:border-primary/40 transition-all duration-300 hover:scale-105">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <BookOpen className="w-5 h-5 text-primary" />
                </div>
                <Users className="w-4 h-4 text-primary opacity-60" />
              </div>
              <div className="h-3 bg-primary/30 rounded w-20 mb-2"></div>
              <div className="py-1 px-2 font-medium bg-primary/40 rounded text-xs sm:text-sm md:text-base text-center break-words">
                Join our first 100 learners
              </div>
            </div>

            <div className="group rounded-xl border-2 border-accent-amber/20 bg-gradient-to-br from-accent-amber/10 to-transparent p-4 hover:border-accent-amber/40 transition-all duration-300 hover:scale-105">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 bg-accent-amber/20 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-accent-amber" />
                </div>
                <TrendingUp className="w-4 h-4 text-accent-amber opacity-60" />
              </div>
              <div className="h-3 bg-accent-amber/30 rounded w-24 mb-2"></div>
              <div className="py-1 px-2 font-medium bg-accent-amber/40 rounded text-xs sm:text-sm md:text-base text-center break-words">
                Free early access
              </div>
            </div>

            <div className="group rounded-xl border-2 border-success-green/20 bg-gradient-to-br from-success-green/10 to-transparent p-4 hover:border-success-green/40 transition-all duration-300 hover:scale-105">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 bg-success-green/20 rounded-lg">
                  <Calendar className="w-5 h-5 text-success-green" />
                </div>
                <Zap className="w-4 h-4 text-success-green opacity-60" />
              </div>
              <div className="h-3 bg-success-green/30 rounded w-16 mb-2"></div>
              <div className="py-1 px-2 font-medium bg-success-green/40 rounded text-xs sm:text-sm md:text-base text-center break-words">
                Daily practice sets
              </div>
            </div>
          </div>

          {/* Content Rows */}
          <div className="space-y-4 pt-8">
            <div className="p-2 bg-gradient-to-r from-background/80 to-background/40 rounded-lg animate-pulse text-xs sm:text-sm md:text-base leading-snug text-center sm:text-left">
              Early users get priority feedback sessions and access to all upcoming modules.
            </div>
            <div className="p-2 bg-gradient-to-r from-background/80 to-background/40 rounded-lg animate-pulse delay-75 text-xs sm:text-sm md:text-base leading-snug text-center sm:text-left">
              Experience the platform while we refine content based on real learner input.
            </div>
            <div className="p-2 bg-gradient-to-r from-background/80 to-background/40 rounded-lg animate-pulse delay-150 text-xs sm:text-sm md:text-base leading-snug text-center sm:text-left">
              Short, focused sets to help you stay consistent and build reading discipline.
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>


        {/* Features Highlight */}
        {/* <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="text-center p-6 rounded-xl bg-card-surface/50 border border-neutral-grey/30 hover:border-primary/30 transition-all duration-300">
            <div className="inline-flex p-3 bg-primary/10 rounded-xl mb-4">
              <BookOpen className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">Expert Passages</h3>
            <p className="text-sm text-text-secondary">CAT-level passages curated by experts</p>
          </div>

          <div className="text-center p-6 rounded-xl bg-card-surface/50 border border-neutral-grey/30 hover:border-accent-amber/30 transition-all duration-300">
            <div className="inline-flex p-3 bg-accent-amber/10 rounded-xl mb-4">
              <Zap className="w-8 h-8 text-accent-amber" />
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">Instant Feedback</h3>
            <p className="text-sm text-text-secondary">Get detailed explanations immediately</p>
          </div>

          <div className="text-center p-6 rounded-xl bg-card-surface/50 border border-neutral-grey/30 hover:border-success-green/30 transition-all duration-300">
            <div className="inline-flex p-3 bg-success-green/10 rounded-xl mb-4">
              <TrendingUp className="w-8 h-8 text-success-green" />
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">Track Progress</h3>
            <p className="text-sm text-text-secondary">Monitor your improvement over time</p>
          </div>
        </div> */}
      </div>
    </div>
  );
}
import React from 'react';
import { motion } from 'framer-motion';
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
        <motion.div 
          className="absolute top-20 left-10 w-72 h-72 bg-accent-amber rounded-full blur-3xl"
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-20 right-10 w-96 h-96 bg-primary rounded-full blur-3xl"
          animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.7, 0.5] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
      </div>

      {/* Main Hero Content */}
      <div className="relative max-w-7xl mx-auto px-6 py-16 sm:py-24 lg:py-32">
        <div className="text-center">
          {/* Badge */}
          <motion.div 
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Zap className="w-4 h-4 text-primary" fill="currentColor" />
            </motion.div>
            <span className="text-sm font-medium text-primary">Master CAT Reading Comprehension</span>
          </motion.div>

          {/* Main Headline with Gradient */}
          <motion.h1 
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-text-primary mb-6 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          >
            Elevate Your Reading Skills
            <br />
            <motion.span 
              className="bg-gradient-to-r from-primary via-accent-amber to-primary-light bg-clip-text text-transparent"
              style={{ backgroundSize: '200% 200%' }}
              animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
              transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
            >
              with {content.platformName}
            </motion.span>
          </motion.h1>

          {/* body */}
          <motion.p 
            className="text-lg sm:text-xl text-text-secondary mb-12 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          >
            Prepare smarter for competitive exams with expert-curated passages, 
            instant feedback, and daily practice that adapts to your learning pace.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
          >
            <Link to="/register" className="w-full sm:w-auto">
              <motion.button 
                className="group w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-primary to-primary-light hover:from-primary-dark hover:to-primary text-white font-semibold rounded-lg text-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-lg"
                whileHover={{ scale: 1.05, boxShadow: "0 20px 25px -5px rgba(59, 130, 246, 0.3)" }}
                whileTap={{ scale: 0.95 }}
              >
                Start Practicing Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </Link>
            <Link to="/login" className="w-full sm:w-auto">
              <motion.button 
                className="w-full sm:w-auto px-8 py-4 bg-card-surface text-text-primary font-semibold rounded-lg text-lg border-2 border-neutral-grey hover:border-primary hover:bg-white/5 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Login
              </motion.button>
            </Link>
          </motion.div>              
        </div>

        {/* Enhanced Dashboard Preview */}
        <motion.div 
          className="mt-12 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8, ease: "easeOut" }}
        >
          <div className="relative">
            {/* Glow effect */}
            <motion.div 
              className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent-amber/20 to-primary-light/20 blur-3xl"
              animate={{ opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />

            <div className="relative bg-gradient-to-br from-card-surface to-background rounded-2xl p-1 shadow-2xl">
              <div className="bg-card-surface rounded-xl p-4 sm:p-6 border border-neutral-grey/50">
                {/* Browser Chrome */}
                <div className="flex gap-2 mb-6">
                  <motion.div 
                    className="w-3 h-3 rounded-full bg-error-red"
                    animate={{ opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <motion.div 
                    className="w-3 h-3 rounded-full bg-accent-amber"
                    animate={{ opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
                  />
                  <motion.div 
                    className="w-3 h-3 rounded-full bg-success-green"
                    animate={{ opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
                  />
                </div>

                {/* Dashboard Content Preview */}
                <div className="space-y-4">
                  {/* Header Section */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <motion.div 
                      className="h-auto min-h-[2.5rem] bg-gradient-to-r from-primary/20 to-transparent rounded-md w-full sm:w-52 p-2 font-semibold text-sm sm:text-base text-center sm:text-left"
                      style={{ backgroundSize: '200% 100%' }}
                      animate={{ backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    >
                      Platform Overview
                    </motion.div>
                    <div className="h-auto min-h-[2rem] font-semibold bg-background/50 rounded-md w-full sm:w-36 px-2 py-1 text-sm sm:text-base text-center sm:text-left">
                      Beta Access
                    </div>
                  </div>

                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-8">
                    <motion.div 
                      className="group rounded-xl border-2 border-primary/20 bg-gradient-to-br from-primary/10 to-transparent p-4 hover:border-primary/40 transition-all duration-300"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: 1 }}
                      whileHover={{ scale: 1.05 }}
                    >
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
                    </motion.div>

                    <motion.div 
                      className="group rounded-xl border-2 border-accent-amber/20 bg-gradient-to-br from-accent-amber/10 to-transparent p-4 hover:border-accent-amber/40 transition-all duration-300"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: 1.1 }}
                      whileHover={{ scale: 1.05 }}
                    >
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
                    </motion.div>

                    <motion.div 
                      className="group rounded-xl border-2 border-success-green/20 bg-gradient-to-br from-success-green/10 to-transparent p-4 hover:border-success-green/40 transition-all duration-300"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: 1.2 }}
                      whileHover={{ scale: 1.05 }}
                    >
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
                    </motion.div>
                  </div>

                  {/* Content Rows */}
                  <div className="space-y-4 pt-8">
                    {[0, 0.15, 0.3].map((delay, index) => (
                      <motion.div 
                        key={index}
                        className="p-2 bg-gradient-to-r from-background/80 to-background/40 rounded-lg text-xs sm:text-sm md:text-base leading-snug text-center sm:text-left"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 1.3 + delay }}
                      >
                        {index === 0 && "Early users get priority feedback sessions and access to all upcoming modules."}
                        {index === 1 && "Experience the platform while we refine content based on real learner input."}
                        {index === 2 && "Short, focused sets to help you stay consistent and build reading discipline."}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
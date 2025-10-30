// Replace your existing AboutPage component with this version
// It includes Framer Motion animations while keeping all your original styling

import React from 'react'
import {
  Heart,
  Brain,
  BarChart3,
  Users,
  Target,
  Sparkles,
  ArrowRight,
  Calendar,
  Shield,
  Zap,
  FileText,
  Award,
  Globe,
  BookOpen,
  TrendingUp,
} from 'lucide-react'
import { motion } from 'framer-motion'
import AboutPreview from './Home/AboutPreview'
import content from '../../content/static.json'

export default function AboutPage() {
  const features = [
    {
      icon: <Calendar className="w-6 h-6" />,
      title: 'Daily Scheduled RCs',
      description: 'Diverse topics delivered consistently to build your reading habit',
      gradient: 'from-info-blue/20 to-success-green/20',
    },
    {
      icon: <Brain className="w-6 h-6" />,
      title: 'Expert Explanations',
      description: "Detailed answers that teach you the 'why' behind every question",
      gradient: 'from-primary-light/20 to-primary/20',
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: 'Performance Analytics',
      description: 'Track your progress with instant feedback and insights',
      gradient: 'from-accent-amber/20 to-warm-orange/20',
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Admin Portal',
      description: 'Robust tools for scheduling and managing quality content',
      gradient: 'from-primary/20 to-accent-amber/20',
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: 'Topic Tagging',
      description: 'Practice specific areas with targeted preparation',
      gradient: 'from-primary-dark/20 to-info-blue/20',
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'No Distractions',
      description: 'Zero ads. Zero paywalls. Just focused practice',
      gradient: 'from-info-blue/20 to-success-green/20',
    },
  ]

   return (
    <div className="min-h-screen">
      {/* Background decorative blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 sm:w-96 sm:h-96 bg-primary rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
        <div
          className="absolute bottom-20 right-10 w-64 h-64 sm:w-96 sm:h-96 bg-primary-light rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"
          style={{ animationDelay: '3s' }}
        ></div>
      </div>

      <section className="relative py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero section */}
          <motion.div 
            className="text-center mb-8 sm:mb-12 lg:mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary mb-4 sm:mb-6">
              About{' '}
              <span className="bg-gradient-to-r from-primary via-accent-amber to-primary-light bg-clip-text text-transparent">
                {content.platformName}
              </span>
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-text-secondary leading-relaxed max-w-4xl mx-auto px-4">
              A clean, no-nonsense platform for mastering reading comprehension — built by
              aspirants, for aspirants.
            </p>
          </motion.div>

          {/* Mission Statement */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <AboutPreview/>
          </motion.div>
     
          {/* What We Offer - Features Grid */}
          {/* <div className="mb-12 sm:mb-16 lg:mb-20">
            <div className="text-center mb-8 sm:mb-12 px-4">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text-primary mb-3 sm:mb-4">
                What We Offer
              </h2>
              <p className="text-base sm:text-lg text-text-secondary">
                Everything you need to master reading comprehension
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="bg-card-surface bg-opacity-50 backdrop-blur-sm p-5 sm:p-6 rounded-xl border border-white border-opacity-10 hover:border-opacity-20 transition-all duration-300 group hover:transform hover:scale-105"
                >
                  <div
                    className={`inline-flex p-2.5 sm:p-3 bg-gradient-to-br ${feature.gradient} rounded-lg mb-3 sm:mb-4 group-hover:scale-110 transition-transform`}
                  >
                    {feature.icon}
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-text-primary mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm sm:text-base text-text-secondary">{feature.description}</p>
                </div>
              ))}
            </div>
          </div> */}


               {/* Technology & Methodology */}
          <motion.div 
            className="my-12 sm:my-16 lg:my-20"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl text-center mb-8 sm:mb-12 font-bold text-text-primary px-4">
              Technology & Methodology
            </h2>
            <div className="bg-gradient-to-r from-card-surface to-background bg-opacity-80 backdrop-blur-sm p-6 sm:p-8 lg:p-12 rounded-2xl border border-white border-opacity-10">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6 sm:mb-8">
                <div className="p-2.5 sm:p-3 bg-gradient-warm rounded-lg flex-shrink-0">
                  <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-text-primary">
                  Science-backed approach to mastering RC
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                {[
                  {
                    color: 'bg-primary',
                    title: 'Scheduled Practice',
                    description: 'Our platform delivers daily reading comprehension passages at scheduled intervals, helping you build consistency — the key to long-term improvement.'
                  },
                  {
                    color: 'bg-primary-light',
                    title: 'Smart Analytics',
                    description: 'Track your performance across topics, difficulty levels, and time periods. Our analytics dashboard gives you actionable insights.'
                  },
                  {
                    color: 'bg-accent-amber',
                    title: 'Research-Backed Questions',
                    description: 'Every passage and question is carefully curated to match exam-level difficulty. We follow proven methodologies used in standardized testing.'
                  },
                  {
                    color: 'bg-success-green',
                    title: 'Learning-Focused',
                    description: 'Beyond just answering questions, we provide detailed explanations that help you understand reasoning patterns and improve critical thinking.'
                  }
                ].map((item, index) => (
                  <motion.div 
                    key={index}
                    className="bg-background bg-opacity-30 p-4 sm:p-5 rounded-xl"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                    whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                  >
                    <h4 className="text-lg sm:text-xl font-semibold text-text-primary mb-2 sm:mb-3 flex items-center gap-2">
                      <div className={`w-2 h-2 ${item.color} rounded-full flex-shrink-0`}></div>
                      <span>{item.title}</span>
                    </h4>
                    <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
                      {item.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Community Note  */}
          <motion.div 
            className="mb-12 sm:mb-16 lg:mb-20 flex justify-center px-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 1 }}
          >
            <div className="bg-card-surface bg-opacity-50 backdrop-blur-sm p-6 sm:p-8 lg:p-12 rounded-2xl border border-white border-opacity-10 w-full max-w-3xl">
              <div className="flex justify-center mb-4 sm:mb-6">
                  <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                  className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center shadow-md"
                >
                  <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </motion.div>
              </div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-text-primary mb-3 sm:mb-4 text-center">
                Thank You
              </h2>
              <p className="text-base sm:text-lg text-text-secondary leading-relaxed text-center">
                Thanks to everyone who's supported, tested, and given feedback. We're constantly
                working to improve {content.platformName} and make it better for you. Your trust and encouragement fuel
                our commitment to providing the best RC practice platform.
              </p>
            </div>
          </motion.div>

          {/* CTA Section - ANIMATED */}
          <motion.div 
            className="px-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
          >
            <div className="bg-gradient-to-r from-primary via-primary-light to-accent-amber p-1 rounded-2xl">
              <div className="bg-background p-6 sm:p-8 lg:p-12 rounded-2xl text-center">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text-primary mb-3 sm:mb-4">
                  Ready to Start Your RC Journey?
                </h2>
                <p className="text-base sm:text-lg text-text-secondary mb-6 sm:mb-8">
                  Join thousands of aspirants improving their reading skills daily
                </p>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-md mx-auto">
                  <motion.button 
                    className="group w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-primary text-white font-semibold rounded-lg text-base sm:text-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Create Free Account
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                  <motion.button 
                    className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white bg-opacity-5 backdrop-blur-sm text-text-primary font-semibold rounded-lg text-base sm:text-lg border border-white border-opacity-10 hover:bg-opacity-10 transition-all duration-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Back to Home
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
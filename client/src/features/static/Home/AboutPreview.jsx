import React from 'react';
import { Heart, Users, Target, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion'
import content from '../../../content/static.json'

export default function AboutPreview() {
  const values = [
    {
      icon: Heart,
      title: "Quality First",
      description: "Every passage curated with care",
      bg: "bg-primary/10",
      color: "text-primary",
    },
    {
      icon: Users,
      title: "For Aspirants",
      description: "Built by learners, for learners",
      bg: "bg-success-green/10",
      color: "text-success-green",
    },
    {
      icon: Target,
      title: "Free Forever",
      description: "No paywalls, just practice",
      bg: "bg-accent-amber/10",
      color: "text-accent-amber",
    }
  ];

  return (
    <section className='py-20 px-4 sm:px-6 lg:px-8'>
      {/* Background decorative */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 -left-32 w-64 h-64 bg-primary opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 -right-32 w-64 h-64 bg-primary-light opacity-10 rounded-full blur-3xl"></div>
      </div>

      <div >
        {/* Card */}
        <div className="bg-card-surface rounded-3xl border border-border-soft shadow-card-hover overflow-hidden">
          <div className="p-8 sm:p-12">
            <div className="mb-10 sm:mb-14 lg:mb-16">
            <div className="flex justify-center mb-6 sm:mb-8">
                          <div className="mt-16">
                            <motion.div
                              animate={{ y: [0, -8, 0] }}
                              transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                              className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center shadow-md"
                            >
                              <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                            </motion.div>
                          </div>
                        </div>
                        </div>
            {/* Header */}
            <div className="text-center mb-10">
              <div className="inline-block mb-4">
                <span className="px-4 py-2 bg-accent-amber/10 border border-accent-amber/30 rounded-full text-accent-amber text-sm font-semibold">
                  Our Mission
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary mb-6">
                Why{' '}
                <span className="bg-gradient-accent bg-clip-text text-transparent">
                  {content.platformName} Exists
                </span>
              </h2>
            </div>

            {/* Mission */}
            <div className="max-w-3xl mx-auto mb-10">
              <p className="text-lg sm:text-xl text-text-secondary leading-relaxed text-center mb-6">
                {content.platformName} is an open reading comprehension practice platform built for serious aspirants preparing for competitive exams like CAT, XAT, and more.
              </p>
              <p className="text-lg text-text-secondary leading-relaxed text-center">
                We believe quality practice shouldn't be hidden behind paywalls. Our mission is to provide a reliable, distraction-free space where you can improve your RC skills daily, backed by expert-curated content and intelligent analytics.
              </p>
            </div>

            {/* Values */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
              {values.map((value, index) => {
                const Icon = value.icon;
                return (
                  <div key={index} className="text-center group">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${value.bg} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className={`w-8 h-8 ${value.color}`} />
                    </div>
                    <h3 className="text-lg font-bold text-text-primary mb-2">
                      {value.title}
                    </h3>
                    <p className="text-sm text-text-secondary">
                      {value.description}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Stats */}
            <div className="bg-background bg-opacity-50 rounded-2xl p-6 mb-8 border border-border-soft">
              <div className="grid grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold text-primary mb-1">5K+</div>
                  <div className="text-sm text-text-secondary">Active Users</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-success-green mb-1">100+</div>
                  <div className="text-sm text-text-secondary">RC Passages</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-accent-amber mb-1">10K+</div>
                  <div className="text-sm text-text-secondary">Tests Taken</div>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="text-center">
              <a
                href="/about"
                className="group inline-flex items-center gap-3 px-8 py-4 bg-primary text-white font-semibold rounded-lg text-lg shadow-lg hover:bg-primary-dark hover:shadow-xl transform hover:scale-105 transition-all duration-200 mb-4"
              >
                Learn More About Us
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
              <p className="text-text-secondary text-sm">
                Discover our story, team, and commitment to your success
              </p>
            </div>
          </div>

          {/* Bottom Accent */}
          <div className="h-2 bg-primary"></div>
        </div>
      </div>
    </section>
  );
}

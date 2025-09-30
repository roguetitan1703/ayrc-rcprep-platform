import React from 'react';
import { Heart, Users, Target, ArrowRight } from 'lucide-react';

export default function AboutPreview() {
  const values = [
    {
      icon: Heart,
      title: "Quality First",
      description: "Every passage curated with care"
    },
    {
      icon: Users,
      title: "For Aspirants",
      description: "Built by learners, for learners"
    },
    {
      icon: Target,
      title: "Free Forever",
      description: "No paywalls, just practice"
    }
  ];

  return (
    <section className="bg-gradient-primary py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 -left-32 w-64 h-64 bg-primary opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 -right-32 w-64 h-64 bg-primary-light opacity-10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-5xl mx-auto relative">
        {/* Main Content Card */}
        <div className="bg-card-surface rounded-3xl border border-neutral-grey border-opacity-20 shadow-card-hover overflow-hidden">
          <div className="p-8 sm:p-12">
            {/* Header */}
            <div className="text-center mb-10">
              <div className="inline-block mb-4">
                <span className="px-4 py-2 bg-accent-amber bg-opacity-10 border border-accent-amber border-opacity-30 rounded-full text-accent-amber text-sm font-semibold">
                  Our Mission
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary mb-6">
                Why{' '}
                <span className="bg-gradient-accent bg-clip-text text-transparent">
                  ARC Exists
                </span>
              </h2>
            </div>

            {/* Mission Statement */}
            <div className="max-w-3xl mx-auto mb-10">
              <p className="text-lg sm:text-xl text-text-secondary leading-relaxed text-center mb-6">
                ARC Prep is an open reading comprehension practice platform built for serious aspirants preparing for competitive exams like CAT, XAT, and more.
              </p>
              <p className="text-lg text-text-secondary leading-relaxed text-center">
                We believe quality practice shouldn't be hidden behind paywalls. Our mission is to provide a reliable, distraction-free space where you can improve your RC skills daily, backed by expert-curated content and intelligent analytics.
              </p>
            </div>

            {/* Values Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
              {values.map((value, index) => {
                const Icon = value.icon;
                return (
                  <div 
                    key={index}
                    className="text-center group"
                  >
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-accent mb-4 group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-8 h-8 text-text-primary" />
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

            {/* Stats Bar */}
            <div className="bg-background bg-opacity-50 rounded-2xl p-6 mb-8 border border-neutral-grey border-opacity-20">
              <div className="grid grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold text-primary-light mb-1">5K+</div>
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
              <button className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-accent text-text-primary font-semibold rounded-lg text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 mb-4">
                Learn More About Us
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <p className="text-text-secondary text-sm">
                Discover our story, team, and commitment to your success
              </p>
            </div>
          </div>

          {/* Bottom Accent Bar */}
          <div className="h-2 bg-gradient-accent"></div>
        </div>
      </div>
    </section>
  );
}
import React from 'react';
import { UserPlus, BookOpen, TrendingUp, ArrowRight } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      number: "01",
      icon: UserPlus,
      title: "Sign Up for Free",
      description: "Create your account in seconds. No credit card required. Choose between student or admin access.",
      color: "primary"
    },
    {
      number: "02",
      icon: BookOpen,
      title: "Practice RCs Daily",
      description: "Access expert-curated passages scheduled every day. Answer questions and receive instant feedback.",
      color: "primary-light"
    },
    {
      number: "03",
      icon: TrendingUp,
      title: "Track & Improve",
      description: "Monitor your progress with detailed analytics. Review explanations and watch your scores improve.",
      color: "success-green"
    }
  ];

  return (
    <section className="bg-background py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-64 h-64 bg-primary opacity-5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 -right-20 w-64 h-64 bg-primary-light opacity-5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto relative">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary mb-4">
            How It{' '}
            <span className="bg-gradient-accent bg-clip-text text-transparent">
              Works
            </span>
          </h2>
          <p className="text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto">
            Get started in three simple steps and begin your journey to RC mastery
          </p>
        </div>

        {/* Steps Container */}
        <div className="relative">
          {/* Connecting line - hidden on mobile */}
          <div className="hidden lg:block absolute top-24 left-0 right-0 h-0.5 bg-gradient-accent opacity-20 z-0"></div>

          {/* Steps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 relative z-10">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isLast = index === steps.length - 1;
              
              return (
                <div key={index} className="relative">
                  {/* Step Card */}
                  <div className="bg-card-surface rounded-xl p-8 border border-neutral-grey border-opacity-20 hover:border-opacity-40 transition-all duration-300 hover:shadow-card-hover group">
                    {/* Step Number Badge */}
                    <div className="absolute -top-4 left-8">
                      <div className={`w-12 h-12 rounded-full bg-${step.color} flex items-center justify-center text-background font-bold text-lg shadow-lg`}>
                        {step.number}
                      </div>
                    </div>

                    {/* Icon Container */}
                    <div className="mt-4 mb-6">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br from-${step.color} to-primary-light bg-opacity-10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="w-8 h-8" />
                      </div>
                    </div>

                    {/* Content */}
                    <h3 className="text-2xl font-bold text-text-primary mb-3 group-hover:text-primary-light transition-colors duration-300">
                      {step.title}
                    </h3>
                    <p className="text-text-secondary leading-relaxed">
                      {step.description}
                    </p>

                    {/* Hover indicator */}
                    <div className="mt-6 flex items-center text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="text-sm font-semibold mr-2">Learn more</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Arrow between steps - only on desktop */}
                  {!isLast && (
                    <div className="hidden lg:block absolute top-24 -right-6 z-20">
                      <ArrowRight className="w-8 h-8 text-primary-light opacity-40" />
                    </div>
                  )}

                  {/* Mobile arrow */}
                  {!isLast && (
                    <div className="lg:hidden flex justify-center my-4">
                      <div className="transform rotate-90">
                        <ArrowRight className="w-8 h-8 text-primary-light opacity-40" />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <button className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-accent text-text-primary font-semibold rounded-lg text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
            Get Started Now
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <p className="mt-4 text-text-secondary text-sm">
            Join thousands of aspirants already improving their skills
          </p>
        </div>
      </div>
    </section>
  );
}
import React from 'react';
import { Award, CheckCircle2, Target, Tag, PieChart, Settings } from 'lucide-react';

export default function WhyUseSection() {
  const features = [
    {
      icon: Award,
      title: "Curated by Experts",
      description: "Every passage and question is carefully selected and reviewed by experienced educators who understand competitive exam patterns.",
      stat: "100%",
      statLabel: "Expert-verified"
    },
    {
      icon: CheckCircle2,
      title: "Quality Explanations",
      description: "Detailed explanations for every answer help you understand not just what's correct, but why. Learn the reasoning behind each solution.",
      stat: "Detailed",
      statLabel: "Step-by-step"
    },
    {
      icon: Target,
      title: "Exam-Level Difficulty",
      description: "Practice with passages that mirror the actual difficulty and style of CAT, XAT, and other competitive exams.",
      stat: "Real",
      statLabel: "Exam patterns"
    },
    {
      icon: Tag,
      title: "Topic Tagging & Tracking",
      description: "Identify your strengths and weaknesses with intelligent topic categorization. Focus on areas that need improvement.",
      stat: "Smart",
      statLabel: "Analytics"
    },
    {
      icon: PieChart,
      title: "Instant Result Analysis",
      description: "Get immediate feedback on your performance. See your accuracy, time management, and areas of improvement in real-time.",
      stat: "Live",
      statLabel: "Feedback"
    },
    {
      icon: Settings,
      title: "Admin Portal",
      description: "Powerful admin tools for uploading content, managing passages, and maintaining quality standards across the platform.",
      stat: "Full",
      statLabel: "Control"
    }
  ];

  return (
    <section className="bg-gradient-primary py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-block mb-4">
            <span className="px-4 py-2 bg-primary bg-opacity-10 border border-primary border-opacity-30 rounded-full text-primary-light text-sm font-semibold">
              Why Choose ARC Prep
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary mb-4">
            Built for{' '}
            <span className="bg-gradient-accent bg-clip-text text-transparent">
              Serious Aspirants
            </span>
          </h2>
          <p className="text-lg sm:text-xl text-text-secondary max-w-3xl mx-auto">
            Features that make a real difference in your preparation journey
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            
            return (
              <div
                key={index}
                className="group relative bg-card-surface rounded-2xl p-8 border border-neutral-grey border-opacity-20 hover:border-primary-light hover:border-opacity-50 transition-all duration-300 overflow-hidden"
              >
                {/* Background gradient on hover */}
                <div className="absolute inset-0 bg-gradient-accent opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
                
                {/* Content Container */}
                <div className="relative z-10">
                  {/* Icon and Stat Container */}
                  <div className="flex items-start justify-between mb-6">
                    {/* Icon */}
                    <div className="w-14 h-14 rounded-xl bg-gradient-accent p-0.5 group-hover:scale-110 transition-transform duration-300">
                      <div className="w-full h-full bg-card-surface rounded-xl flex items-center justify-center">
                        <Icon className="w-7 h-7 text-primary-light" />
                      </div>
                    </div>

                    {/* Stat Badge */}
                    <div className="text-right">
                      <div className="text-xl font-bold text-primary-light group-hover:text-accent-amber transition-colors duration-300">
                        {feature.stat}
                      </div>
                      <div className="text-xs text-text-secondary">
                        {feature.statLabel}
                      </div>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-text-primary mb-3 group-hover:text-primary-light transition-colors duration-300">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-text-secondary text-sm leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Check mark indicator */}
                  <div className="mt-6 flex items-center gap-2 text-success-green opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-xs font-semibold">Included</span>
                  </div>
                </div>

                {/* Decorative corner element */}
                <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-primary-light opacity-5 rounded-full blur-2xl group-hover:opacity-10 transition-opacity duration-300"></div>
              </div>
            );
          })}
        </div>

        {/* Bottom Feature Highlights */}
        <div className="mt-16 bg-card-surface rounded-2xl p-8 border border-neutral-grey border-opacity-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary-light mb-2">100+</div>
              <div className="text-text-secondary text-sm">RC Passages</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-success-green mb-2">24/7</div>
              <div className="text-text-secondary text-sm">Access</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-accent-amber mb-2">Daily</div>
              <div className="text-text-secondary text-sm">New Content</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">Free</div>
              <div className="text-text-secondary text-sm">Forever</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
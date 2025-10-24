import React from 'react';
import { Award, CheckCircle2, Target, Tag, PieChart, Settings, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function WhyUseSection() {
  const features = [
    { icon: Award, title: "Curated by Experts", description: "Every passage is selected and refined by experienced educators to mirror real CAT-level comprehension standards.", stat: "100%", statLabel: "Expert-verified" },
    { icon: CheckCircle2, title: "Instant Feedback & Explanations", description: "Get immediate performance feedback and clear, detailed explanations for every answer help you learn the reasoning behind each solution.", stat: "Detailed", statLabel: "Feedback" },
    { icon: Target, title: "Exam-Level Practice Sets", description: "Practice with passages that match real CAT/XAT difficulty, tone, and logic for authentic preparation", stat: "Real", statLabel: "Exam patterns" },
    { icon: Tag, title: "Topic Tagging & Tracking", description: "Identify your strengths and weaknesses with intelligent topic categorization. Focus on areas that need improvement.", stat: "Smart", statLabel: "Tracking" },
    { icon: PieChart, title: "Progress Tracking Dashboard", description: "Track your performance across accuracy, speed, and topics — see your growth over time.", stat: "Live", statLabel: "Insights" },
   {
    icon: Zap,
    title: "Adaptive Learning Experience",
    description:
      "Receive structured practice suggestions and difficulty-balanced sets that adapt to your performance and learning pace for goal-oriented smarter prep.",
    stat: "Planned",
    statLabel: "Learning path",
  },
  ];

  return (
    <section className="bg-background py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-block mb-4">
            <span className="px-4 py-2 bg-primary bg-opacity-10 border border-primary border-opacity-30 rounded-full text-primary text-sm font-semibold">
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
                className="group relative bg-card-surface rounded-2xl p-8 border border-border-soft hover:border-primary-light transition-all duration-300 overflow-hidden"
              >
                {/* Hover wash */}
                <div className="absolute inset-0 bg-gradient-accent opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
                
                <div className="relative z-10">
                  {/* Icon + Stat */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-7 h-7 text-primary" />
                    </div>

                    <div className="text-right">
                      <div className="text-xl font-bold text-primary group-hover:text-primary-light transition-colors duration-300">
                        {feature.stat}
                      </div>
                      <div className="text-xs text-text-secondary">
                        {feature.statLabel}
                      </div>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-text-primary mb-3 group-hover:text-primary transition-colors duration-300">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-text-secondary text-sm leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Check indicator */}
                  <div className="mt-6 flex items-center gap-2 text-success-green opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-xs font-semibold">Included</span>
                  </div>
                </div>

                {/* Decorative circle */}
                <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-primary opacity-5 rounded-full blur-2xl group-hover:opacity-10 transition-opacity duration-300"></div>
              </div>
            );
          })}
        </div>

        
        {/* CTA */}
        <div className="mt-12 text-center">
          <Link to="/register">
          <button className="inline-flex items-center px-8 py-4 bg-primary text-white font-semibold rounded-lg text-lg shadow-lg hover:bg-primary-dark transform hover:scale-105 transition-all duration-200">
            Start Practicing Now
          </button>
          </Link>
        </div>
      </div>
    </section>
  );
}

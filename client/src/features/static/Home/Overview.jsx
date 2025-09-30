import React from 'react';
import { Calendar, Zap, BarChart3, Shield } from 'lucide-react';

export default function FeaturesOverview() {
  const features = [
    {
      icon: Calendar,
      title: "Scheduled RC Tests",
      description: "Get new reading comprehension passages delivered daily. Stay consistent with automated scheduling.",
      gradient: "from-primary-dark to-primary-light",
    },
    {
      icon: Zap,
      title: "Instant Feedback & Explanations",
      description: "Receive immediate results with detailed explanations for every question. Learn from your mistakes instantly.",
      gradient: "from-primary-light to-accent-amber",
    },
    {
      icon: BarChart3,
      title: "Personalized Progress Dashboard",
      description: "Track your performance with personalized analytics. Visualize your improvement over time.",
      gradient: "from-success-green to-primary-dark",
    },
    {
      icon: Shield,
      title: "Expert Curated Content",
      description: "Admin-managed quality passages and questions designed to match competitive exam standards.",
      gradient: "from-accent-amber to-motivational-warm", // Changed to use motivational-warm
    },
  ];

  return (
    <section className="bg-gradient-primary py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary mb-4">
            Everything You Need to{' '}
            <span className="bg-gradient-to-r from-success-green to-success-green bg-clip-text text-transparent">
              Master RC
            </span>
          </h2>
          <p className="text-lg sm:text-xl text-text-secondary max-w-3xl mx-auto">
            Powerful features designed to accelerate your reading comprehension skills and exam preparation
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group relative bg-card-surface rounded-xl p-6 border border-neutral-grey border-opacity-20 hover:border-primary/40 transition-all duration-300 hover:shadow-card-hover hover:transform hover:scale-105"
              >
                {/* Gradient glow effect on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 rounded-xl transition-opacity duration-300`}></div>

                {/* Icon container */}
                <div className="relative mb-4">
                  <div className={`w-14 h-14 rounded-lg bg-gradient-to-br ${feature.gradient} p-0.5`}>
                    <div className="w-full h-full bg-card-surface rounded-lg flex items-center justify-center">
                      <Icon className="w-7 h-7 text-primary-light" />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="relative">
                  <h3 className="text-xl font-semibold text-text-primary mb-3 group-hover:text-primary-light transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-text-secondary text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                {/* Decorative corner accent */}
                <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${feature.gradient} opacity-5 rounded-bl-full`}></div>
              </div>
            );
          })}
        </div>

        {/* Bottom decorative line */}
        <div className="mt-16 flex justify-center">
          <div className="h-1 w-32 bg-gradient-accent rounded-full"></div>
        </div>
      </div>
    </section>
  );
}
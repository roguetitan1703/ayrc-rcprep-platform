import React from 'react';
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
} from 'lucide-react';

export default function AboutPage() {
  const features = [
    {
      icon: <Calendar className="w-6 h-6" />,
      title: 'Daily Scheduled RCs',
      description: 'Diverse topics delivered consistently to build your reading habit',
      gradient: 'from-primary to-primary-light',
    },
    {
      icon: <Brain className="w-6 h-6" />,
      title: 'Expert Explanations',
      description: "Detailed answers that teach you the 'why' behind every question",
      gradient: 'from-primary-light to-accent-amber',
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: 'Performance Analytics',
      description: 'Track your progress with instant feedback and insights',
      gradient: 'from-accent-amber to-[#fb923c]',
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Admin Portal',
      description: 'Robust tools for scheduling and managing quality content',
      gradient: 'from-success-green to-[#3b82f6]',
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: 'Topic Tagging',
      description: 'Practice specific areas with targeted preparation',
      gradient: 'from-[#3b82f6] to-primary',
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'No Distractions',
      description: 'Zero ads. Zero paywalls. Just focused practice',
      gradient: 'from-[#fb923c] to-success-green',
    },
  ];

  const stats = [
    {
      icon: <Users className="w-6 h-6 sm:w-8 sm:h-8" />,
      number: '5000+',
      label: 'Active Users',
      gradient: 'from-primary to-primary-light',
    },
    {
      icon: <FileText className="w-6 h-6 sm:w-8 sm:h-8" />,
      number: '1000+',
      label: 'RC Passages',
      gradient: 'from-primary-light to-accent-amber',
    },
    {
      icon: <Award className="w-6 h-6 sm:w-8 sm:h-8" />,
      number: '50+',
      label: 'Topics Covered',
      gradient: 'from-accent-amber to-[#fb923c]',
    },
    {
      icon: <Globe className="w-6 h-6 sm:w-8 sm:h-8" />,
      number: '100%',
      label: 'Free Forever',
      gradient: 'from-success-green to-[#3b82f6]',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-card-surface">
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
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary mb-4 sm:mb-6">
              About{' '}
              <span className="bg-gradient-accent bg-clip-text text-transparent">ARC RC Prep</span>
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-text-secondary leading-relaxed max-w-4xl mx-auto px-4">
              A clean, no-nonsense platform for mastering reading comprehension — built by aspirants, for aspirants.
            </p>
          </div>

          {/* Mission Statement */}
          <div className="mb-12 sm:mb-16 lg:mb-20">
            <div className="flex justify-center mb-6 sm:mb-8">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center shadow-md">
                <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text-primary text-center mb-8 sm:mb-12 px-4">
              Our Mission
            </h2>

            <div className="bg-card-surface bg-opacity-50 backdrop-blur-sm p-6 sm:p-8 lg:p-12 rounded-2xl border border-white border-opacity-10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 sm:w-64 sm:h-64 bg-gradient-to-br from-primary to-primary-light rounded-full blur-3xl opacity-10"></div>

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                  <div className="p-2 sm:p-3 bg-gradient-to-br from-primary to-primary-light rounded-lg flex-shrink-0">
                    <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <h3 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-text-primary">
                    Why ARC Exists
                  </h3>
                </div>

                <div className="space-y-4 text-text-secondary text-base sm:text-lg leading-relaxed">
                  <p>
                    At ARC RC Prep, we believe consistent reading practice is the most effective way
                    to improve comprehension skills — especially for competitive exams like CAT,
                    GRE, and more. Yet, many students struggle with finding structured, quality RC
                    content without distractions or paywalls.
                  </p>
                  <p>
                    That's why we built ARC: to provide a{' '}
                    <span className="text-primary font-semibold">
                      simple, effective, and open platform
                    </span>{' '}
                    where you can practice, reflect, and grow.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* What We Offer - Features Grid */}
          <div className="mb-12 sm:mb-16 lg:mb-20">
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
                  <h3 className="text-lg sm:text-xl font-semibold text-text-primary mb-2">{feature.title}</h3>
                  <p className="text-sm sm:text-base text-text-secondary">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Stats Section - Responsive */}
          <div className="mb-12 sm:mb-16 lg:mb-20">
            <div className="text-center mb-8 sm:mb-12 px-4">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text-primary mb-3 sm:mb-4">
                Our Impact
              </h2>
              <p className="text-base sm:text-lg lg:text-xl text-text-secondary">Numbers that speak for themselves why we</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="text-center p-4 sm:p-6 bg-card-surface bg-opacity-50 backdrop-blur-sm rounded-xl border border-white border-opacity-10 hover:border-opacity-20 transition-all duration-300 group hover:transform hover:scale-105"
                >
                  <div
                    className={`inline-flex p-3 sm:p-4 bg-gradient-to-br ${stat.gradient} rounded-full mb-3 sm:mb-4 group-hover:scale-110 transition-transform`}
                  >
                    {stat.icon}
                  </div>
                  <div
                    className={`text-2xl sm:text-3xl lg:text-4xl font-semibold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent mb-1 sm:mb-2`}
                  >
                    {stat.number}
                  </div>
                  <div className="text-text-secondary text-sm sm:text-base lg:text-xl font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Pull Quote - Responsive */}
          <div className="mb-12 sm:mb-16 lg:mb-20">
            <div className="text-center mb-8 sm:mb-12 px-4">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text-primary mb-2 sm:mb-3">
                Our Philosophy
              </h2>
              <p className="text-base sm:text-lg lg:text-xl text-text-secondary">Why we do what we do</p>
            </div>

            <div className="bg-gradient-to-r from-primary via-primary-light to-accent-amber p-1 rounded-2xl">
              <div className="bg-card-surface p-6 sm:p-8 lg:p-12 rounded-2xl">
                <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                  <div className="text-4xl sm:text-5xl lg:text-6xl text-primary leading-none flex-shrink-0">"</div>
                  <div className="flex-1">
                    <p className="text-xl sm:text-2xl lg:text-3xl font-semibold text-text-primary mb-3 sm:mb-4 leading-relaxed">
                      Quality practice shouldn't be hidden behind paywalls. Everyone deserves access
                      to effective learning tools.
                    </p>
                    <p className="text-text-secondary text-base sm:text-lg">— The ARC Team</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Technology & Methodology */}
          <div className="mb-12 sm:mb-16 lg:mb-20">
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
                <div className="bg-background bg-opacity-30 p-4 sm:p-5 rounded-xl">
                  <h4 className="text-lg sm:text-xl font-semibold text-text-primary mb-2 sm:mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                    <span>Scheduled Practice</span>
                  </h4>
                  <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
                    Our platform delivers daily reading comprehension passages at scheduled
                    intervals, helping you build consistency — the key to long-term improvement.
                  </p>
                </div>

                <div className="bg-background bg-opacity-30 p-4 sm:p-5 rounded-xl">
                  <h4 className="text-lg sm:text-xl font-semibold text-text-primary mb-2 sm:mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary-light rounded-full flex-shrink-0"></div>
                    <span>Smart Analytics</span>
                  </h4>
                  <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
                    Track your performance across topics, difficulty levels, and time periods. Our
                    analytics dashboard gives you actionable insights.
                  </p>
                </div>

                <div className="bg-background bg-opacity-30 p-4 sm:p-5 rounded-xl">
                  <h4 className="text-lg sm:text-xl font-semibold text-text-primary mb-2 sm:mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 bg-accent-amber rounded-full flex-shrink-0"></div>
                    <span>Research-Backed Questions</span>
                  </h4>
                  <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
                    Every passage and question is carefully curated to match exam-level difficulty.
                    We follow proven methodologies used in standardized testing.
                  </p>
                </div>

                <div className="bg-background bg-opacity-30 p-4 sm:p-5 rounded-xl">
                  <h4 className="text-lg sm:text-xl font-semibold text-text-primary mb-2 sm:mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 bg-success-green rounded-full flex-shrink-0"></div>
                    <span>Learning-Focused</span>
                  </h4>
                  <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
                    Beyond just answering questions, we provide detailed explanations that help you
                    understand reasoning patterns and improve critical thinking.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Community Note */}
          <div className="mb-12 sm:mb-16 lg:mb-20 flex justify-center px-4">
            <div className="bg-card-surface bg-opacity-50 backdrop-blur-sm p-6 sm:p-8 lg:p-12 rounded-2xl border border-white border-opacity-10 w-full max-w-3xl">
              <div className="flex justify-center mb-4 sm:mb-6">
                <div className="p-3 sm:p-4 bg-gradient-warm rounded-full">
                  <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
              </div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-text-primary mb-3 sm:mb-4 text-center">Thank You</h2>
              <p className="text-base sm:text-lg text-text-secondary leading-relaxed text-center">
                Thanks to everyone who's supported, tested, and given feedback. We're constantly
                working to improve ARC and make it better for you. Your trust and encouragement fuel
                our commitment to providing the best RC practice platform.
              </p>
            </div>
          </div>

          {/* CTA Section  */}
          <div className="px-4">
            <div className="bg-gradient-to-r from-primary via-primary-light to-accent-amber p-1 rounded-2xl">
              <div className="bg-background p-6 sm:p-8 lg:p-12 rounded-2xl text-center">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text-primary mb-3 sm:mb-4">
                  Ready to Start Your RC Journey?
                </h2>
                <p className="text-base sm:text-lg text-text-secondary mb-6 sm:mb-8">
                  Join thousands of aspirants improving their reading skills daily
                </p>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-md mx-auto">
                  <button className="group w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-accent text-white font-semibold rounded-lg text-base sm:text-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2">
                    Create Free Account
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white bg-opacity-5 backdrop-blur-sm text-text-primary font-semibold rounded-lg text-base sm:text-lg border border-white border-opacity-10 hover:bg-opacity-10 transition-all duration-200">
                    Back to Home
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
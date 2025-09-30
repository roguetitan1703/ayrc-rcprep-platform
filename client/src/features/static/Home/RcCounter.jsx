import React, { useState, useEffect, useRef } from 'react';
import { Calendar, TrendingUp, BookOpen, Target } from 'lucide-react';

export default function RcCounter() {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);
  const targetCount = 60;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, [isVisible]);

  useEffect(() => {
    if (isVisible && count < targetCount) {
      const increment = Math.ceil(targetCount / 50);
      const timer = setTimeout(() => {
        setCount(prev => Math.min(prev + increment, targetCount));
      }, 30);
      return () => clearTimeout(timer);
    }
  }, [count, isVisible, targetCount]);

  const stats = [
    {
      icon: Calendar,
      value: "Daily",
      label: "New passages",
      iconBg: "bg-primary bg-opacity-10",
      iconColor: "text-primary",
      valueColor: "text-primary"
    },
    {
      icon: TrendingUp,
      value: "95%",
      label: "User satisfaction",
      iconBg: "bg-success-green bg-opacity-10",
      iconColor: "text-success-green",
      valueColor: "text-success-green"
    },
    {
      icon: Target,
      value: "100+",
      label: "Total passages",
      iconBg: "bg-accent-amber bg-opacity-10",
      iconColor: "text-accent-amber",
      valueColor: "text-accent-amber"
    }
  ];

  return (
    <section ref={sectionRef} className="bg-gradient-primary py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-primary opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary-light opacity-10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-6xl mx-auto relative">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary mb-4">
            Practice{' '}
            <span className="bg-gradient-accent bg-clip-text text-transparent">
              Every Day
            </span>
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Stay consistent with your preparation. Track your progress and build a strong reading habit.
          </p>
        </div>

        {/* Main Counter Card */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="bg-card-surface rounded-3xl p-8 sm:p-12 border border-neutral-grey border-opacity-20 shadow-card-hover relative overflow-hidden">
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-accent opacity-5"></div>
            
            {/* Content */}
            <div className="relative text-center">
              {/* Icon */}
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-accent mb-6">
                <BookOpen className="w-10 h-10 text-text-primary" />
              </div>

              {/* Main Counter */}
              <div className="mb-6">
                <div className="text-7xl sm:text-8xl font-bold bg-gradient-accent bg-clip-text text-transparent mb-2">
                  {count}
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">
                  RCs This Month
                </h3>
                <p className="text-text-secondary text-lg">
                  New passages scheduled every day
                </p>
              </div>

              {/* Progress Bar */}
              <div className="max-w-md mx-auto mb-6">
                <div className="h-3 bg-background rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-accent rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${(count / targetCount) * 100}%` }}
                  ></div>
                </div>
                <div className="flex justify-between mt-2 text-sm text-text-secondary">
                  <span>Progress</span>
                  <span>{Math.round((count / targetCount) * 100)}%</span>
                </div>
              </div>

              {/* Supporting Text */}
              <div className="bg-background bg-opacity-50 rounded-xl p-4 border border-neutral-grey border-opacity-20">
                <p className="text-text-secondary">
                  📖 Track your streak and see how much you've practiced. Consistency is the key to mastering RC skills.
                </p>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-light opacity-5 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent-amber opacity-5 rounded-full blur-2xl"></div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div 
                key={index}
                className="bg-card-surface rounded-2xl p-6 border border-neutral-grey border-opacity-20 hover:border-opacity-40 transition-all duration-300 hover:shadow-card-hover group"
              >
                <div className="flex items-center gap-4">
                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-xl ${stat.iconBg} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`w-7 h-7 ${stat.iconColor}`} />
                  </div>

                  {/* Content */}
                  <div>
                    <div className={`text-2xl font-bold ${stat.valueColor} mb-1`}>
                      {stat.value}
                    </div>
                    <div className="text-sm text-text-secondary">
                      {stat.label}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Message */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-success-green bg-opacity-10 border border-success-green border-opacity-30 rounded-full">
            <div className="w-2 h-2 rounded-full bg-success-green animate-pulse"></div>
            <span className="text-success-green font-semibold">
              New RCs added daily at 9:00 AM IST
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
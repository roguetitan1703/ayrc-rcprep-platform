import React from 'react';
import { motion } from 'framer-motion';
import { UserPlus, BookOpen, TrendingUp, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function HowItWorks() {
  const steps = [
    {
      number: "01",
      icon: UserPlus,
      title: "Sign Up for Free",
      description: "Create your account in seconds. No credit card required. Choose between student or admin access.",
      bg: "bg-info-blue/10",
      iconColor: "text-info-blue",
    },
    {
      number: "02",
      icon: BookOpen,
      title: "Practice RCs Daily",
      description: "Access expert-curated passages scheduled every day. Answer questions and receive instant feedback.",
      bg: "bg-primary-light/10",
      iconColor: "text-primary-light",
    },
    {
      number: "03",
      icon: TrendingUp,
      title: "Track & Improve",
      description: "Monitor your progress with detailed analytics. Review explanations and watch your scores improve.",
      bg: "bg-success-green/10",
      iconColor: "text-success-green",
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  return (
    <section className="bg-background py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden" style={{ zIndex: 1 }}>
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-1/4 -left-20 w-64 h-64 bg-primary opacity-5 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.05, 0.1, 0.05]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-1/4 -right-20 w-64 h-64 bg-primary-light opacity-5 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.15, 1],
            opacity: [0.05, 0.1, 0.05]
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1.5
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto relative">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary mb-4">
            How It{' '}
            <span className="bg-gradient-accent bg-clip-text text-transparent">
              Works
            </span>
          </h2>
          <p className="text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto">
            Get started in three simple steps and begin your journey to RC mastery
          </p>
        </motion.div>

        {/* Steps Container */}
        <div className="relative">
          {/* Connecting line */}
          <motion.div 
            className="hidden lg:block absolute top-24 left-0 right-0 h-0.5 bg-gradient-accent opacity-20 z-0"
            initial={{ width: 0 }}
            whileInView={{ width: "100%" }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
          />

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 relative z-10"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isLast = index === steps.length - 1;

              return (
                <motion.div 
                  key={index} 
                  className="relative"
                  variants={itemVariants}
                >
                  {/* Step Card */}
                  <motion.div 
                    className="bg-card-surface rounded-xl p-8 border border-border-soft hover:border-primary-light transition-all duration-300 hover:shadow-card-hover group"
                    whileHover={{ y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    
                    {/* Step Number Badge */}
                    <motion.div 
                      className="absolute -top-4 left-8"
                      initial={{ scale: 0, rotate: -180 }}
                      whileInView={{ scale: 1, rotate: 0 }}
                      viewport={{ once: true }}
                      transition={{ 
                        duration: 0.6, 
                        delay: index * 0.2 + 0.3,
                        type: "spring",
                        stiffness: 200
                      }}
                    >
                      <motion.div 
                        className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-background font-bold text-lg shadow-lg"
                        whileHover={{ scale: 1.1, rotate: 360 }}
                        transition={{ duration: 0.5 }}
                      >
                        {step.number}
                      </motion.div>
                    </motion.div>

                    {/* Icon */}
                    <div className="mt-4 mb-6">
                      <motion.div 
                        className={`w-16 h-16 rounded-2xl ${step.bg} flex items-center justify-center`}
                        animate={{ 
                          y: [0, -8, 0],
                        }}
                        transition={{
                          duration: 4,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: index * 0.3
                        }}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                      >
                        <Icon className={`w-8 h-8 ${step.iconColor}`} />
                      </motion.div>
                    </div>

                    {/* Content */}
                    <h3 className="text-2xl font-bold text-text-primary mb-3 group-hover:text-primary-light transition-colors duration-300">
                      {step.title}
                    </h3>
                    <p className="text-text-secondary leading-relaxed">
                      {step.description}
                    </p>

                    {/* Hover indicator */}
                    <motion.div 
                      className="mt-6 flex items-center text-primary"
                      initial={{ opacity: 0, x: -10 }}
                      whileHover={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <span className="text-sm font-semibold mr-2">Learn more</span>
                      <ArrowRight className="w-4 h-4" />
                    </motion.div>
                  </motion.div>

                  {/* Arrows */}
                  {!isLast && (
                    <>
                      <motion.div 
                        className="hidden lg:block absolute top-24 -right-6 z-20"
                        animate={{ 
                          x: [0, 5, 0],
                          opacity: [0.4, 0.8, 0.4]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        <ArrowRight className="w-8 h-8 text-primary-light opacity-40" />
                      </motion.div>
                      <div className="lg:hidden flex justify-center my-4">
                        <motion.div 
                          className="transform rotate-90"
                          animate={{ 
                            y: [0, 5, 0],
                            opacity: [0.4, 0.8, 0.4]
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        >
                          <ArrowRight className="w-8 h-8 text-primary-light opacity-40" />
                        </motion.div>
                      </div>
                    </>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* CTA */}
        <motion.div 
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <Link to="/register">
            <motion.button 
              className="group inline-flex items-center px-8 py-4 bg-primary text-white font-semibold rounded-lg text-lg shadow-lg"
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 20px 25px -5px rgba(59, 130, 246, 0.4)"
              }}
              whileTap={{ scale: 0.95 }}
              animate={{
                boxShadow: [
                  "0 10px 15px -3px rgba(59, 130, 246, 0.3)",
                  "0 10px 25px -3px rgba(59, 130, 246, 0.5)",
                  "0 10px 15px -3px rgba(59, 130, 246, 0.3)"
                ]
              }}
              transition={{
                boxShadow: {
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }
              }}
            >
              Get Started Now
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </Link>
          <p className="mt-4 text-text-secondary text-sm">
            Join thousands of aspirants already improving their skills
          </p>
        </motion.div>
      </div>
    </section>
  );
}
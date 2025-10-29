import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle, Users, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function FinalCTABanner() {
  const benefits = ["Free forever", "Daily practice sets", "Instant feedback", "Progress tracking"];
  const trustItems = [
    { icon: Zap, text: "Start in 30 seconds" },
    { icon: CheckCircle, text: "No credit card needed" },
    { icon: Users, text: "Trusted by thousands" }
  ];

  return (
    <section className="bg-background py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Main CTA Card */}
        <motion.div 
          className="relative bg-gradient-to-br from-primary/70 via-primary-light to-accent-amber rounded-3xl overflow-hidden"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full">
              <motion.div 
                className="absolute top-10 left-10 w-20 h-20 border-4 border-white rounded-full"
                animate={{ 
                  y: [0, -10, 5, -10, 0],
                  x: [0, 5, -5, 5, 0]
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <motion.div 
                className="absolute bottom-10 right-10 w-32 h-32 border-4 border-white rounded-lg transform rotate-12"
                animate={{ 
                  rotate: [0, 360],
                  scale: [1, 1.05, 1]
                }}
                transition={{
                  duration:30,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
              <motion.div 
                className="absolute top-1/2 right-1/4 w-16 h-16 border-4 border-white rounded-full"
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </div>
          </div>

          {/* Content */}
          <div className="relative px-8 py-16 sm:px-12 sm:py-20 text-center">
            {/* Badge */}
            <motion.div 
              className="inline-flex items-center gap-2 px-4 py-2 bg-white bg-opacity-20 backdrop-blur-sm rounded-full mb-6"
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Users className="w-4 h-4 text-white" />
              <span className="text-white font-semibold text-sm">
                Join 5,000+ aspirants already improving
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h2 
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Ready to Improve Your RC Skills?
            </motion.h2>

            {/* Subheadline */}
            <motion.p 
              className="text-lg sm:text-xl text-white text-opacity-90 max-w-2xl mx-auto mb-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              Start practicing today with expert-curated passages, instant feedback, and detailed analytics. No credit card required.
            </motion.p>

            {/* Benefits List */}
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mb-10">
              {benefits.map((benefit, index) => (
                <motion.div 
                  key={index} 
                  className="flex items-center gap-2"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ 
                    duration: 0.5, 
                    delay: 0.4 + index * 0.1,
                    type: "spring",
                    stiffness: 200
                  }}
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ 
                      duration: 0.6, 
                      delay: 0.5 + index * 0.1,
                      type: "spring",
                      stiffness: 300
                    }}
                  >
                    <CheckCircle className="w-5 h-5 text-white" />
                  </motion.div>
                  <span className="text-white font-medium">{benefit}</span>
                </motion.div>
              ))}
            </div>

            {/* CTA Buttons */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <Link to="/register">
                <motion.button 
                  className="group inline-flex items-center gap-3 px-8 py-4 bg-white text-primary font-bold rounded-lg text-lg shadow-xl"
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: "0 25px 50px -12px rgba(255, 255, 255, 0.5)"
                  }}
                  whileTap={{ scale: 0.95 }}
                  animate={{
                    boxShadow: [
                      "0 10px 40px rgba(255, 255, 255, 0.3)",
                      "0 10px 60px rgba(255, 255, 255, 0.5)",
                      "0 10px 40px rgba(255, 255, 255, 0.3)"
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
                  Create Free Account
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </Link>
              <Link to="/login">
                <motion.button 
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white bg-opacity-10 backdrop-blur-sm text-white font-semibold rounded-lg text-lg border-2 border-white border-opacity-30"
                  whileHover={{ 
                    scale: 1.05,
                    backgroundColor: "rgba(255, 255, 255, 0.2)"
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  Login
                </motion.button>
              </Link>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div 
              className="mt-8 flex flex-wrap justify-center items-center gap-6 text-white text-opacity-80 text-sm"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 1 }}
            >
              {trustItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.div 
                    key={index}
                    className="flex items-center gap-2"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 1.1 + index * 0.1 }}
                  >
                    <motion.div
                      animate={index === 0 ? { scale: [1, 1.2, 1] } : {}}
                      transition={index === 0 ? {
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      } : {}}
                    >
                      <Icon className="w-4 h-4" />
                    </motion.div>
                    <span>{item.text}</span>
                  </motion.div>
                );
              })}
          
            </motion.div>
          </div>

          {/* Decorative Glow */}
          <motion.div 
            className="absolute -bottom-20 -left-20 w-40 h-40 bg-white rounded-full blur-3xl opacity-20"
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.2, 0.3, 0.2]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div 
            className="absolute -top-20 -right-20 w-40 h-40 bg-white rounded-full blur-3xl opacity-20"
            animate={{ 
              scale: [1, 1.15, 1],
              opacity: [0.2, 0.3, 0.2]
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
          />
        </motion.div>
      </div>
    </section>
  );
}
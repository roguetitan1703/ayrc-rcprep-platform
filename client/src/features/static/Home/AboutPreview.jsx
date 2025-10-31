import React from 'react';
import { Heart, Users, Target, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
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
      title: "Invest in Growth",
      description: "High-quality prep without heavy costs",
      bg: "bg-accent-amber/10",
      color: "text-accent-amber",
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const cardVariants = {
    hidden: { scale: 0.95, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <section className='py-20 px-4 sm:px-6 lg:px-8'>
      {/* Background decorative */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.15, 0.1]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/3 -left-32 w-64 h-64 bg-primary rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.1, 0.15, 0.1]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
          className="absolute bottom-1/3 -right-32 w-64 h-64 bg-primary-light rounded-full blur-3xl"
        />
      </div>

      <div>
        {/* Card */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={cardVariants}
          className="bg-card-surface rounded-3xl border border-border-soft shadow-card-hover overflow-hidden"
        >
          <div className="p-8 sm:p-12">
            {/* Floating Heart Icon */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex justify-center mb-10 sm:mb-14 lg:mb-16"
            >
              <motion.div
                animate={{ y: [0, -12, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center shadow-lg"
              >
                <Heart className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </motion.div>
            </motion.div>

            {/* Header */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={containerVariants}
              className="text-center mb-10"
            >
              <motion.div variants={itemVariants} className="inline-block mb-4">
                <span className="px-4 py-2 bg-accent-amber/10 border border-accent-amber/30 rounded-full text-accent-amber text-sm font-semibold">
                  Our Mission
                </span>
              </motion.div>
              <motion.h2
                variants={itemVariants}
                className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary mb-6"
              >
                Why{' '}
                <span className="bg-gradient-accent bg-clip-text text-transparent">
                   {content.platformName} Exists
                </span>
              </motion.h2>
            </motion.div>

            {/* Mission */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={containerVariants}
              className="max-w-3xl mx-auto mb-10"
            >
              <motion.p
                variants={itemVariants}
                className="text-lg sm:text-xl text-text-secondary leading-relaxed text-center mb-6"
              >
                  {content.platformName} Exists is an open reading comprehension practice platform built for serious aspirants preparing for competitive exams like CAT, XAT, and more.
              </motion.p>
              <motion.p
                variants={itemVariants}
                className="text-lg text-text-secondary leading-relaxed text-center"
              >
                We believe quality practice shouldn't be hidden behind paywalls. Our mission is to provide a reliable, distraction-free space where you can improve your RC skills daily, backed by expert-curated content and intelligent analytics.
              </motion.p>
            </motion.div>

            {/* Values */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={containerVariants}
              className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10"
            >
              {values.map((value, index) => {
                const Icon = value.icon;
                return (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    whileHover={{ y: -8, scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                    className="text-center group"
                  >
                    <motion.div
                      whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                      transition={{ duration: 0.5 }}
                      className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${value.bg} mb-4 group-hover:shadow-lg transition-shadow duration-300`}
                    >
                      <Icon className={`w-8 h-8 ${value.color}`} />
                    </motion.div>
                    <h3 className="text-lg font-bold text-text-primary mb-2">
                      {value.title}
                    </h3>
                    <p className="text-sm text-text-secondary">
                      {value.description}
                    </p>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-background bg-opacity-50 rounded-2xl p-6 mb-8 border border-border-soft"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.4, type: "spring" }}
                    className="text-lg md:text-xl font-bold text-primary mb-1"
                  >
                    Gaining Momentum
                  </motion.div>
                  <div className="md:max-w-[12rem] mx-auto text-xs text-text-secondary">Growing community-More learners joining everyday</div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.5, type: "spring" }}
                    className="text-lg md:text-xl font-bold text-success-green mb-1"
                  >
                    2 RCs Everyday
                  </motion.div>
                  <div className="md:max-w-[10rem] mx-auto text-xs text-text-secondary">New expertly-crafted RCs added daily</div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.6, type: "spring" }}
                    className="text-lg md:text-xl font-bold text-accent-amber mb-1"
                  >
                    100% Adaptive
                  </motion.div>
                  <div className="md:max-w-[10rem] mx-auto text-xs text-text-secondary">Smart learning engine that evolves with you</div>
                </motion.div>
              </div>
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-center"
            >
              <motion.a
                href="/about"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group inline-flex items-center gap-3 px-8 py-4 bg-primary text-white font-semibold rounded-lg text-lg shadow-lg hover:bg-primary-dark hover:shadow-xl transition-all duration-300 mb-4"
              >
                Learn More About Us
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                >
                  <ArrowRight className="w-5 h-5" />
                </motion.div>
              </motion.a>
              <p className="text-text-secondary text-sm">
                Discover our story, team, and commitment to your success
              </p>
            </motion.div>
          </div>

          {/* Bottom Accent with Animation */}
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.5 }}
            className="h-2 bg-primary origin-left"
          />
        </motion.div>
      </div>
    </section>
  );
}
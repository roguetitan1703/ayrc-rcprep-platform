import React from 'react'
import { motion } from 'framer-motion'
import { Award, CheckCircle2, Target, Tag, PieChart, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'
import content from '../../../content/static.json'

export default function WhyUseSection() {
  const features = [
    {
      icon: Award,
      title: 'Curated by Experts',
      description:
        'Every passage is selected and refined by experienced educators to mirror real CAT-level comprehension standards.',
      stat: '100%',
      statLabel: 'Expert-verified',
    },
    {
      icon: CheckCircle2,
      title: 'Instant Feedback & Explanations',
      description:
        'Get immediate performance feedback and clear, detailed explanations for every answer help you learn the reasoning behind each solution.',
      stat: 'Detailed',
      statLabel: 'Feedback',
    },
    {
      icon: Target,
      title: 'Exam-Level Practice Sets',
      description:
        'Practice with passages that match real CAT/XAT difficulty, tone, and logic for authentic preparation',
      stat: 'Real',
      statLabel: 'Exam patterns',
    },
    {
      icon: Tag,
      title: 'Topic Tagging & Tracking',
      description:
        'Identify your strengths and weaknesses with intelligent topic categorization. Focus on areas that need improvement.',
      stat: 'Smart',
      statLabel: 'Tracking',
    },
    {
      icon: PieChart,
      title: 'Progress Tracking Dashboard',
      description:
        'Track your performance across accuracy, speed, and topics — see your growth over time.',
      stat: 'Live',
      statLabel: 'Insights',
    },
    {
      icon: Zap,
      title: 'Adaptive Learning Experience',
      description:
        'Receive structured practice suggestions and difficulty-balanced sets that adapt to your performance and learning pace for goal-oriented smarter prep.',
      stat: 'Planned',
      statLabel: 'Learning path',
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
      },
    },
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
      },
    },
  }

  return (
    <section className="bg-background py-20 px-4 sm:px-6 lg:px-8" style={{ zIndex: 1 }}>
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.div
            className="inline-block mb-4"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <span className="px-4 py-2 bg-primary bg-opacity-10 border border-primary border-opacity-30 rounded-full text-primary text-sm font-semibold">
              Why Choose {content.platformName}
            </span>
          </motion.div>

          <motion.h2
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
          >
            Built for{' '}
            <span className="bg-gradient-accent bg-clip-text text-transparent">
              Serious Aspirants
            </span>
          </motion.h2>

          <motion.p
            className="text-lg sm:text-xl text-text-secondary max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
          >
            Features that make a real difference in your preparation journey
          </motion.p>
        </div>

        {/* Features Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {features.map((feature, index) => {
            const Icon = feature.icon

            return (
              <motion.div
                key={index}
                variants={cardVariants}
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ duration: 0.3 }}
                className="group relative bg-card-surface rounded-2xl p-8 border border-border-soft hover:border-primary-light transition-all duration-300 overflow-hidden"
              >
                {/* Hover wash */}
                <motion.div
                  className="absolute inset-0 bg-gradient-accent opacity-0"
                  whileHover={{ opacity: 0.05 }}
                  transition={{ duration: 0.3 }}
                />

                <div className="relative">
                  {/* Icon + Stat */}
                  <div className="flex items-start justify-between mb-6">
                    <motion.div
                      className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ duration: 0.3 }}
                    >
                      <motion.div
                        animate={{
                          y: [0, -4, 0],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: 'easeInOut',
                          delay: index * 0.2,
                        }}
                      >
                        <Icon className="w-7 h-7 text-primary" />
                      </motion.div>
                    </motion.div>

                    <motion.div
                      className="text-right"
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                    >
                      <motion.div
                        className="text-xl font-bold text-primary"
                        whileHover={{ scale: 1.1, color: 'var(--primary-light)' }}
                        transition={{ duration: 0.3 }}
                      >
                        {feature.stat}
                      </motion.div>
                      <div className="text-xs text-text-secondary">{feature.statLabel}</div>
                    </motion.div>
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
                  <motion.div
                    className="mt-6 flex items-center gap-2 text-success-green"
                    initial={{ opacity: 0, x: -10 }}
                    whileHover={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.div
                      whileHover={{ scale: 1.2, rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </motion.div>
                    <span className="text-xs font-semibold">Included</span>
                  </motion.div>
                </div>

                {/* Decorative circle */}
                <motion.div
                  className="absolute -bottom-6 -right-6 w-24 h-24 bg-primary opacity-5 rounded-full blur-2xl"
                  whileHover={{ opacity: 0.1, scale: 1.2 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.div>
            )
          })}
        </motion.div>

        {/* CTA */}
        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <Link to="/register">
            <motion.button
              className="inline-flex items-center px-8 py-4 bg-primary text-white font-semibold rounded-lg text-lg shadow-lg"
              whileHover={{
                scale: 1.05,
                boxShadow: '0 20px 25px -5px rgba(59, 130, 246, 0.4)',
              }}
              whileTap={{ scale: 0.95 }}
              animate={{
                boxShadow: [
                  '0 10px 15px -3px rgba(59, 130, 246, 0.3)',
                  '0 15px 20px -3px rgba(59, 130, 246, 0.4)',
                  '0 10px 15px -3px rgba(59, 130, 246, 0.3)',
                ],
              }}
              transition={{
                boxShadow: {
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                },
              }}
            >
              Start Practicing Now
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

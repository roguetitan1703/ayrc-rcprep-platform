import React from 'react';
import { ArrowRight, CheckCircle, Users, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function FinalCTABanner() {
  return (
    <section className="bg-background py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Main CTA Card */}
        <div className="relative bg-gradient-to-br from-primary/70 via-primary-light to-accent-amber rounded-3xl overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full">
              <div className="absolute top-10 left-10 w-20 h-20 border-4 border-white rounded-full"></div>
              <div className="absolute bottom-10 right-10 w-32 h-32 border-4 border-white rounded-lg transform rotate-12"></div>
              <div className="absolute top-1/2 right-1/4 w-16 h-16 border-4 border-white rounded-full"></div>
            </div>
          </div>

          {/* Content */}
          <div className="relative px-8 py-16 sm:px-12 sm:py-20 text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white bg-opacity-20 backdrop-blur-sm rounded-full mb-6">
              <Users className="w-4 h-4 text-white" />
              <span className="text-white font-semibold text-sm">
                Join 5,000+ aspirants already improving
              </span>
            </div>

            {/* Headline */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
              Ready to Improve Your RC Skills?
            </h2>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl text-white text-opacity-90 max-w-2xl mx-auto mb-8">
              Start practicing today with expert-curated passages, instant feedback, and detailed analytics. No credit card required.
            </p>

            {/* Benefits List */}
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mb-10">
              {[
                "Free forever",
                "Daily practice sets",
                "Instant feedback",
                "Progress tracking"
              ].map((benefit, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-white" />
                  <span className="text-white font-medium">{benefit}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/register">
              <button className="group inline-flex items-center gap-3 px-8 py-4 bg-white text-primary font-bold rounded-lg text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200">
                Create Free Account
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              </Link>
              <Link to="/login">
              <button className="inline-flex items-center gap-2 px-8 py-4 bg-white bg-opacity-10 backdrop-blur-sm text-white font-semibold rounded-lg text-lg border-2 border-white border-opacity-30 hover:bg-opacity-20 transition-all duration-200">
                Login
              </button>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="mt-8 flex flex-wrap justify-center items-center gap-6 text-white text-opacity-80 text-sm">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                <span>Start in 30 seconds</span>
              </div>
              <span className="hidden sm:inline">•</span>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>No credit card needed</span>
              </div>
              <span className="hidden sm:inline">•</span>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>Trusted by thousands</span>
              </div>
            </div>
          </div>

          {/* Decorative Glow */}
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-white rounded-full blur-3xl opacity-20"></div>
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-white rounded-full blur-3xl opacity-20"></div>
        </div>

        {/* Bottom Mini Stats */}
        <div className="mt-12 grid grid-cols-3 gap-6 max-w-3xl mx-auto">
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-primary-light mb-1">5K+</div>
            <div className="text-sm text-text-secondary">Active Users</div>
          </div>
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-success-green mb-1">100+</div>
            <div className="text-sm text-text-secondary">RC Passages</div>
          </div>
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-accent-amber mb-1">4.9/5</div>
            <div className="text-sm text-text-secondary">User Rating</div>
          </div>
        </div>
      </div>
    </section>
  );
}
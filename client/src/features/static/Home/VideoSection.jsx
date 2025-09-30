import React, { useState } from 'react';
import { Play, ArrowRight, CheckCircle } from 'lucide-react';

export default function VideoSection() {
  const [isPlaying, setIsPlaying] = useState(false);

  const highlights = [
    "Sign up in 30 seconds",
    "Access daily curated passages",
    "Get instant feedback",
    "Track your progress"
  ];

  return (
    <section className="bg-background py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Text Content */}
          <div className="order-2 lg:order-1">
            <div className="inline-block mb-4">
              <span className="px-4 py-2 bg-error-red bg-opacity-10 border border-error-red border-opacity-30 rounded-full text-error-red text-sm font-semibold">
                ⏱️ 30 Seconds
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary mb-6">
              See How{' '}
              <span className="bg-gradient-accent bg-clip-text text-transparent">
                ARC Works
              </span>
            </h2>

            <p className="text-lg text-text-secondary mb-8 leading-relaxed">
              In just 30 seconds, understand how to practice smarter, improve faster, and achieve your RC goals with our intuitive platform.
            </p>

            {/* Feature Highlights */}
            <div className="space-y-4 mb-8">
              {highlights.map((highlight, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-success-green bg-opacity-20 flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-success-green" />
                  </div>
                  <span className="text-text-primary">{highlight}</span>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <button className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-accent text-text-primary font-semibold rounded-lg text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
              Start Your First RC Now
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Right Side - Video Player */}
          <div className="order-1 lg:order-2">
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute -inset-4 bg-gradient-accent opacity-20 blur-3xl rounded-3xl"></div>

              {/* Video Container */}
              <div className="relative bg-card-surface rounded-2xl overflow-hidden border border-neutral-grey border-opacity-20 shadow-card-hover">
                {/* Video Thumbnail / Placeholder */}
                <div className="relative aspect-video bg-gradient-to-br from-primary to-primary-light">
                  {!isPlaying ? (
                    <>
                      {/* Thumbnail Overlay */}
                      <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                        {/* Play Button */}
                        <button
                          onClick={() => setIsPlaying(true)}
                          className="group relative"
                        >
                          <div className="absolute inset-0 bg-white opacity-20 rounded-full blur-2xl group-hover:opacity-30 transition-opacity"></div>
                          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300">
                            <Play className="w-10 h-10 sm:w-12 sm:h-12 text-primary ml-2" fill="currentColor" />
                          </div>
                        </button>
                      </div>

                      {/* Mock Content Grid */}
                      <div className="absolute inset-0 p-8 opacity-20">
                        <div className="grid grid-cols-3 gap-4 h-full">
                          <div className="bg-white rounded-lg"></div>
                          <div className="bg-white rounded-lg"></div>
                          <div className="bg-white rounded-lg"></div>
                          <div className="col-span-2 bg-white rounded-lg"></div>
                          <div className="bg-white rounded-lg"></div>
                        </div>
                      </div>

                      {/* Duration Badge */}
                      <div className="absolute bottom-4 right-4 px-3 py-1 bg-black bg-opacity-70 backdrop-blur-sm rounded-lg">
                        <span className="text-white text-sm font-semibold">0:30</span>
                      </div>
                    </>
                  ) : (
                    /* Video Player - Replace with actual embed URL */
                    <div className="w-full h-full flex items-center justify-center bg-black">
                      <div className="text-center p-8">
                        <p className="text-text-primary mb-4">
                          Video player placeholder
                        </p>
                        <p className="text-text-secondary text-sm">
                          Replace this with your actual video embed code:
                        </p>
                        <code className="text-xs text-primary-light block mt-2 bg-card-surface p-2 rounded">
                          &lt;iframe src="your-video-url" /&gt;
                        </code>
                        <button
                          onClick={() => setIsPlaying(false)}
                          className="mt-4 px-4 py-2 bg-primary rounded text-white text-sm"
                        >
                          Reset
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Video Info Bar */}
                <div className="bg-background bg-opacity-50 px-6 py-4 border-t border-neutral-grey border-opacity-20">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-text-primary font-semibold">Platform Overview</h4>
                      <p className="text-text-secondary text-sm">Quick tour of ARC features</p>
                    </div>
                    <div className="flex items-center gap-2 text-text-secondary text-sm">
                      <span>👁️ 5,000+ views</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Stats */}
              <div className="absolute -bottom-6 -left-6 hidden sm:block">
                <div className="bg-card-surface rounded-xl p-4 border border-success-green border-opacity-30 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-success-green bg-opacity-20 flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-success-green" />
                    </div>
                    <div>
                      <div className="text-lg font-bold text-text-primary">Easy Setup</div>
                      <div className="text-xs text-text-secondary">No complexity</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute -top-6 -right-6 hidden sm:block">
                <div className="bg-card-surface rounded-xl p-4 border border-primary border-opacity-30 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-primary bg-opacity-20 flex items-center justify-center">
                      <Play className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <div className="text-lg font-bold text-text-primary">Quick Tour</div>
                      <div className="text-xs text-text-secondary">30 sec watch</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
import React from 'react';
import { BookOpen, Clock, ArrowRight, CheckCircle, XCircle, Lightbulb } from 'lucide-react';

export default function SampleRCPreview() {
  return (
    <section className="bg-background py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-block mb-4">
            <span className="px-4 py-2 bg-success-green bg-opacity-10 border border-success-green border-opacity-30 rounded-full text-success-green text-sm font-semibold flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Sample Preview
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary mb-4">
            Experience a{' '}
            <span className="bg-gradient-accent bg-clip-text text-transparent">
              Real RC Passage
            </span>
          </h2>
          <p className="text-lg text-text-secondary max-w-3xl mx-auto">
            Here's what you'll practice with - expert-curated passages with detailed explanations
          </p>
        </div>

        {/* Main Preview Card */}
        <div className="bg-card-surface rounded-2xl border border-neutral-grey border-opacity-20 overflow-hidden shadow-card">
          {/* Passage Header */}
          <div className="bg-background bg-opacity-50 px-6 py-4 border-b border-neutral-grey border-opacity-20">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-accent flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-text-primary">Ancient Philosophy and Modern Ethics</h3>
                  <div className="flex items-center gap-4 text-sm text-text-secondary mt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      8 min read
                    </span>
                    <span className="px-2 py-0.5 bg-primary bg-opacity-10 rounded text-primary-light text-xs">
                      Philosophy
                    </span>
                    <span className="px-2 py-0.5 bg-accent-amber bg-opacity-10 rounded text-accent-amber text-xs">
                      Medium
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-text-secondary">4 Questions</div>
              </div>
            </div>
          </div>

          {/* Passage Content */}
          <div className="p-6 sm:p-8">
            <div className="prose prose-invert max-w-none">
              <p className="text-text-secondary leading-relaxed mb-4">
                The Stoic philosophers of ancient Greece developed a comprehensive ethical framework that continues to resonate in contemporary moral philosophy. Central to Stoic thought was the belief that virtue is the sole good and that external circumstances, whether favorable or adverse, should not disturb one's inner tranquility. This philosophical stance emerged as a response to the tumultuous political landscape of Hellenistic Greece, where traditional city-state structures were crumbling under expanding empires.
              </p>
              <p className="text-text-secondary leading-relaxed mb-4">
                Marcus Aurelius, perhaps the most renowned Stoic practitioner, emphasized the importance of accepting what cannot be changed while focusing energy on what lies within one's control. His "Meditations" reveal a profound understanding that human suffering often stems not from events themselves but from our judgments about those events. This cognitive approach to emotional well-being predates modern cognitive behavioral therapy by nearly two millennia.
              </p>
              <p className="text-text-secondary leading-relaxed">
                Contemporary ethicists have revisited Stoic principles, particularly in discussions about resilience and mental health. However, critics argue that the Stoic emphasis on emotional detachment may lead to passivity in the face of injustice, raising questions about the philosophy's applicability to modern social movements that require passionate engagement.
              </p>
            </div>
          </div>

          {/* Sample Question */}
          <div className="px-6 sm:px-8 pb-6">
            <div className="bg-background bg-opacity-50 rounded-xl p-6 border border-neutral-grey border-opacity-20">
              <div className="mb-4">
                <span className="text-sm font-semibold text-primary-light">Question 1 of 4</span>
                <h4 className="text-lg font-semibold text-text-primary mt-2">
                  According to the passage, what is the primary concern critics have about Stoic philosophy?
                </h4>
              </div>

              {/* Options */}
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-4 rounded-lg bg-card-surface border border-neutral-grey border-opacity-20 hover:border-primary-light hover:border-opacity-50 transition-all cursor-not-allowed opacity-60">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full border-2 border-text-secondary mt-0.5"></div>
                  <span className="text-text-secondary">It is too focused on ancient Greek politics</span>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-lg bg-success-green bg-opacity-10 border-2 border-success-green">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-success-green flex items-center justify-center mt-0.5">
                    <CheckCircle className="w-4 h-4 text-background" />
                  </div>
                  <span className="text-text-primary font-medium">It may promote passivity toward social injustice</span>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-lg bg-card-surface border border-neutral-grey border-opacity-20 hover:border-primary-light hover:border-opacity-50 transition-all cursor-not-allowed opacity-60">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full border-2 border-text-secondary mt-0.5"></div>
                  <span className="text-text-secondary">It contradicts modern cognitive behavioral therapy</span>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-lg bg-card-surface border border-neutral-grey border-opacity-20 hover:border-primary-light hover:border-opacity-50 transition-all cursor-not-allowed opacity-60">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full border-2 border-text-secondary mt-0.5"></div>
                  <span className="text-text-secondary">It overemphasizes the importance of virtue</span>
                </div>
              </div>

              {/* Explanation */}
              <div className="mt-6 p-4 bg-primary bg-opacity-5 border border-primary border-opacity-20 rounded-lg">
                <div className="flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-accent-amber flex-shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-sm font-semibold text-text-primary mb-2">Explanation</h5>
                    <p className="text-sm text-text-secondary leading-relaxed">
                      The passage explicitly states that "critics argue that the Stoic emphasis on emotional detachment may lead to passivity in the face of injustice." This directly addresses concerns about the philosophy's applicability to modern social movements requiring passionate engagement. The other options either aren't mentioned or misrepresent the passage's content.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-12 text-center">
          <div className="inline-block bg-card-surface rounded-2xl p-8 border border-neutral-grey border-opacity-20">
            <h3 className="text-2xl font-bold text-text-primary mb-3">
              Ready to Practice More?
            </h3>
            <p className="text-text-secondary mb-6 max-w-md mx-auto">
              Get access to 100+ passages like this with instant feedback and detailed explanations
            </p>
            <button className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-accent text-text-primary font-semibold rounded-lg text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
              Create Free Account
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <p className="mt-4 text-text-secondary text-sm">
              No credit card required • Start practicing in 30 seconds
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
import React from 'react';
import { Quote, Star } from 'lucide-react';
import content from '../../../content/static.json'

export default function TestimonialsSection() {
  const testimonials = [
    {
      name: "Priya Sharma",
      role: "CAT 2025 Aspirant",
      image: "P",
      rating: 5,
      text: "The daily RC schedule helped me stay consistent. I saw a real improvement in 4 weeks! The explanations are detailed and help me understand where I went wrong.",
      colorClasses: {
        text: "text-primary",
        bg: "bg-primary",
        bgOpacity: "bg-primary bg-opacity-20",
        border: "border-primary"
      }
    },
    {
      name: "Rahul Desai",
      role: "XAT Candidate",
      image: "R",
      rating: 5,
      text: "Finally, a platform that doesn't charge for quality content. The instant feedback feature is a game-changer. My accuracy has improved by 30% in just two months.",
      colorClasses: {
        text: "text-success-green",
        bg: "bg-success-green",
        bgOpacity: "bg-success-green bg-opacity-20",
        border: "border-success-green"
      }
    },
    {
      name: "Ananya Patel",
      role: "MBA Aspirant",
      image: "A",
      rating: 5,
      text: "The progress tracking keeps me motivated. I can see exactly which topics I'm weak in and focus on them. This platform is a must-have for serious aspirants.",
      colorClasses: {
        text: "text-accent-amber",
        bg: "bg-accent-amber",
        bgOpacity: "bg-accent-amber bg-opacity-20",
        border: "border-accent-amber"
      }
    },
    {
      name: "Karthik Menon",
      role: "CAT Topper 2024",
      image: "K",
      rating: 5,
  text: `I used ${content.platformName} throughout my preparation. The quality of passages matches actual exam standards. It's like having a personal RC coach available 24/7.`,
      colorClasses: {
        text: "text-primary-light",
        bg: "bg-primary-light",
        bgOpacity: "bg-primary-light bg-opacity-20",
        border: "border-primary-light"
      }
    },
    {
      name: "Sneha Gupta",
      role: "Working Professional",
      image: "S",
      rating: 5,
      text: "As someone preparing while working, the flexible schedule is perfect. I practice for 15-20 minutes daily and have seen consistent improvement in my reading speed.",
       colorClasses: {
        text: "text-success-green",
        bg: "bg-success-green",
        bgOpacity: "bg-success-green bg-opacity-20",
        border: "border-success-green"
      }
    },
    {
      name: "Arjun Singh",
      role: "Engineering Student",
      image: "A",
      rating: 5,
      text: "The admin-curated content ensures quality. No random passages here - everything is purposeful and aligned with competitive exam patterns. Highly recommended!",
     colorClasses: {
        text: "text-accent-amber",
        bg: "bg-accent-amber",
        bgOpacity: "bg-accent-amber bg-opacity-20",
        border: "border-accent-amber"
      }
    }
  ];

  return (
    <section className="bg-background py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-block mb-4">
            <span className="px-4 py-2 bg-success-green bg-opacity-10 border border-success-green border-opacity-30 rounded-full text-success-green text-sm font-semibold">
              ⭐ User Testimonials
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary mb-4">
            Trusted by{' '}
            <span className="bg-gradient-accent bg-clip-text text-transparent">
              Thousands
            </span>
          </h2>
          <p className="text-lg sm:text-xl text-text-secondary max-w-3xl mx-auto">
            See what our users are saying about their experience with {content.platformName}
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="relative bg-card-surface rounded-2xl p-6 border border-neutral-grey border-opacity-20 hover:border-opacity-40 transition-all duration-300 hover:shadow-card-hover group"
            >
              {/* Quote Icon */}
              <div className="mb-4">
                <Quote className={`w-8 h-8 ${testimonial.colorClasses.text} opacity-30`} />
              </div>

              {/* Rating Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-accent-amber fill-current" />
                ))}
              </div>

              {/* Testimonial Text */}
              <p className="text-text-secondary leading-relaxed mb-6 text-sm">
                "{testimonial.text}"
              </p>

              {/* User Info */}
              <div className="flex items-center gap-3 pt-4 border-t border-neutral-grey border-opacity-20">
                <div className={`w-12 h-12 rounded-full ${testimonial.colorClasses.bgOpacity} flex items-center justify-center flex-shrink-0`}>
                  <span className={`text-lg font-bold ${testimonial.colorClasses.text}`}>
                    {testimonial.image}
                  </span>
                </div>
                <div>
                  <div className="text-text-primary font-semibold">
                    {testimonial.name}
                  </div>
                  <div className="text-text-secondary text-xs">
                    {testimonial.role}
                  </div>
                </div>
              </div>

              {/* Hover accent */}
              <div className={`absolute bottom-0 left-0 right-0 h-1 ${testimonial.colorClasses.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-b-2xl`}></div>
            </div>
          ))}
        </div>

        {/* Bottom Stats */}
        <div className="bg-card-surface rounded-2xl p-8 border border-neutral-grey border-opacity-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-primary-light mb-2">4.9/5</div>
              <div className="text-text-secondary text-sm">Average Rating</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-success-green mb-2">5,000+</div>
              <div className="text-text-secondary text-sm">Happy Users</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-accent-amber mb-2">98%</div>
              <div className="text-text-secondary text-sm">Would Recommend</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">100+</div>
              <div className="text-text-secondary text-sm">Success Stories</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
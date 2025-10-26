import StaticPage from '../../components/layout/StaticPage'
import React, { useState } from 'react'
import content from '../../content/static.json'
import { Mail, MapPin, Phone, Send, MessageSquare, Clock, CheckCircle } from 'lucide-react'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      setFormData({ name: '', email: '', subject: '', message: '' })
    }, 3000)
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-surface-muted">
      <div className="absolute inset-0 z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-28 h-28 bg-info-blue rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
        <div
          className="absolute top-40 right-10 w-28 h-28 bg-primary rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"
          style={{ animationDelay: '2s' }}
        ></div>
        <div
          className="absolute bottom-20 left-1/2 w-28 h-28 bg-warm-orange rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"
          style={{ animationDelay: '4s' }}
        ></div>
      </div>

      <StaticPage title={content.contact.title} subtitle={content.contact.subtitle}>
        <div className="mt-12 grid md:grid-cols-2 gap-8 text-left">
          <div className="space-y-8">
            {/* Card 1 */}
            <div className="bg-background bg-opacity-50 backdrop-blur-sm p-6 rounded-xl border border-border-soft hover:border-primary-light transition-all duration-300 group">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gradient-to-br from-info-blue to-info-blue/30 rounded-lg group-hover:scale-110 transition-transform duration-300">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-text-primary mb-2">Email Us</h3>
                  <p className="text-text-secondary mb-2">Send us an email anytime!</p>
                  <a href={`mailto:${content.contact.supportEmail}`} className="text-info-blue hover:text-primary transition-colors">{content.contact.supportEmail}</a>
                </div>
              </div>
            </div>

            {/* Phone Card */}
            <div className="bg-background bg-opacity-50 backdrop-blur-sm p-6 rounded-xl border border-border-soft hover:border-primary-light transition-all duration-300 group">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gradient-to-br from-primary to-primary/40 rounded-lg group-hover:scale-110 transition-transform duration-300">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-text-primary mb-2">Call Us</h3>
                  <p className="text-text-secondary mb-2">We're available during business hours</p>
                  <a href={`tel:${content.contact.supportPhone}`} className="text-info-blue hover:text-primary transition-colors">{content.contact.supportPhone}</a>
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-background bg-opacity-50 backdrop-blur-sm p-6 rounded-xl border border-border-soft hover:border-primary-light transition-all duration-300 group">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gradient-to-br from-accent-amber to-accent-amber/40 rounded-lg group-hover:scale-110 transition-transform duration-300">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-text-primary mb-2">Response Time</h3>
                  <p className="text-text-secondary mb-2">We typically respond within 24 hours</p>
                    <span className="text-success-green font-medium">{content.contact.businessHours}</span>
                    <div className="text-text-secondary text-sm mt-1">Response SLA: <span className="font-medium">{content.contact.responseTime}</span></div>
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-background bg-opacity-50 backdrop-blur-sm p-6 rounded-xl border border-border-soft hover:border-primary-light transition-all duration-300 group">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gradient-to-br from-success-green to-success-green/30 rounded-lg group-hover:scale-110 transition-transform duration-300">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-text-primary mb-2">Location</h3>
                  <p className="text-text-secondary">
                    Raipur, Chhattisgarh
                    <br />
                {content.contact.address}
                  </p>
                </div>
              </div>
            </div>

            {/* Card 4 - Feedback & Suggestions */}
            <div className="bg-background bg-opacity-50 backdrop-blur-sm p-6 rounded-xl border border-border-soft hover:border-primary-light transition-all duration-300 group">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gradient-to-br from-primary to-primary/40 rounded-lg group-hover:scale-110 transition-transform duration-300">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-text-primary mb-2">
                    Feedback & Suggestions
                  </h3>
                  <p className="text-text-secondary mb-2">
                    Your input helps us improve. We’d love to hear your thoughts.
                  </p>
                  <a href="#" className="text-success-green hover:text-primary transition-colors">
                    Share Feedback
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="relative">
            <div className="bg-background bg-opacity-50 backdrop-blur-sm p-8 rounded-xl border border-border-soft relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-info-blue to-primary opacity-5"></div>

              <div className="relative z-10">
                <h3 className="text-2xl font-semibold text-text-primary mb-6">Send us a Message</h3>

                {submitted ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="bg-success-green bg-opacity-20 p-4 rounded-full mb-4">
                      <CheckCircle className="w-12 h-12 text-success-green" />
                    </div>
                    <h4 className="text-xl font-semibold text-text-primary mb-2">Message Sent!</h4>
                    <p className="text-text-secondary text-center">
                      Thank you for reaching out. We'll get back to you soon.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Your Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-surface-muted border border-border-soft rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:border-info-blue focus:ring-2 focus:ring-focus-ring focus:ring-opacity-20 transition-all"
                        placeholder="John Doe"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-surface-muted border border-border-soft rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:border-info-blue focus:ring-2 focus:ring-focus-ring focus:ring-opacity-20 transition-all"
                        placeholder="john@example.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Subject
                      </label>
                      <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-surface-muted border border-border-soft rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:border-info-blue focus:ring-2 focus:ring-focus-ring focus:ring-opacity-20 transition-all"
                        placeholder="How can we help?"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Message
                      </label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        rows={5}
                        className="w-full px-4 py-3 bg-surface-muted border border-border-soft rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:border-info-blue focus:ring-2 focus:ring-focus-ring focus:ring-opacity-20 transition-all resize-none"
                        placeholder="Tell us more about your inquiry..."
                      />
                    </div>

                    <button
                      onClick={handleSubmit}
                      className="w-full py-4 bg-gradient-primary text-white font-semibold rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2 group"
                    >
                      Send Message
                      <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 text-center">
            <p className="text-text-secondary mb-4">
              Looking for quick answers? Check out our{' '}
              <a href="/faq" className="text-info-blue hover:text-primary transition-colors font-medium">Frequently Asked Questions</a>
            </p>
        </div>
      </StaticPage>
    </div>
  )
}

import StaticPage from '../../components/layout/StaticPage'
import React, { useState } from 'react'
import content from '../../content/static.json'
import { Mail, Phone, Send, MessageSquare, Clock, CheckCircle } from 'lucide-react'

export default function ContactPage() {
  const [formType, setFormType] = useState('inquiry') // "inquiry" or "feedback"
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    rating: '',
  })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      setFormData({ name: '', email: '', subject: '', message: '', rating: '' })
      setFormType('inquiry')
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
      {/* Background Blobs */}
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
          {/* Left Cards */}
          <div className="space-y-8">
            {/* Email Card */}
            <div className="bg-background bg-opacity-50 backdrop-blur-sm p-6 rounded-xl border border-border-soft hover:border-primary-light transition-all duration-300 group">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gradient-to-br from-info-blue to-info-blue/30 rounded-lg group-hover:scale-110 transition-transform duration-300">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-text-primary mb-2">Email Us</h3>
                  <p className="text-text-secondary mb-2">Send us an email anytime!</p>
                  <a
                    href={`mailto:${content.contact.supportEmail}`}
                    className="text-info-blue hover:text-primary transition-colors"
                  >
                    {content.contact.supportEmail}
                  </a>
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
                  <a
                    href={`tel:${content.contact.supportPhone}`}
                    className="text-info-blue hover:text-primary transition-colors"
                  >
                    {content.contact.supportPhone}
                  </a>
                </div>
              </div>
            </div>

            {/* Address Card */}
            {/* <div className="bg-background bg-opacity-50 backdrop-blur-sm p-6 rounded-xl border border-border-soft hover:border-primary-light transition-all duration-300 group">
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
            </div> */}

            {/* Response Time */}
            <div className="bg-background bg-opacity-50 backdrop-blur-sm p-6 rounded-xl border border-border-soft hover:border-primary-light transition-all duration-300 group">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gradient-to-br from-accent-amber to-accent-amber/40 rounded-lg group-hover:scale-110 transition-transform duration-300">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-text-primary mb-2">Response Time</h3>
                  <p className="text-text-secondary mb-2">We typically respond within 24 hours</p>
                  <span className="text-success-green font-medium">
                    {content.contact.businessHours}
                  </span>
                </div>
              </div>
            </div>

            {/* Feedback Card */}
            <div
              onClick={() => setFormType('feedback')}
              className="cursor-pointer bg-background bg-opacity-50 backdrop-blur-sm p-6 rounded-xl border border-border-soft hover:border-primary-light transition-all duration-300 group"
            >
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
                  <p className="text-success-green hover:text-primary transition-colors">
                    Share Feedback
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Form */}
          <div className="relative">
            <div className="bg-background bg-opacity-50 backdrop-blur-sm p-8 rounded-xl border border-border-soft relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-info-blue to-primary opacity-5"></div>

              <div className="relative z-10">
                <h3 className="text-2xl font-semibold text-text-primary mb-6">
                  {formType === 'feedback' ? 'Share Your Feedback' : 'Send us a Message'}
                </h3>

                {submitted ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="bg-success-green bg-opacity-20 p-4 rounded-full mb-4">
                      <CheckCircle className="w-12 h-12 text-success-green" />
                    </div>
                    <h4 className="text-xl font-semibold text-text-primary mb-2">
                      {formType === 'feedback' ? 'Feedback Submitted!' : 'Message Sent!'}
                    </h4>
                    <p className="text-text-secondary text-center">
                      {formType === 'feedback'
                        ? 'Thanks for your valuable input!'
                        : "We'll get back to you soon."}
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Common Fields */}
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
                        {formType === 'feedback' ? 'What’s this feedback about?' : 'Subject'}
                      </label>
                      <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-surface-muted border border-border-soft rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:border-info-blue focus:ring-2 focus:ring-focus-ring focus:ring-opacity-20 transition-all"
                        placeholder={
                          formType === 'feedback'
                            ? 'Website experience, support, etc.'
                            : 'How can we help?'
                        }
                      />
                    </div>

                    {/* Show only in feedback mode */}
                    {formType === 'feedback' && (
                      <div>
                        <label className="block text-sm font-medium text-text-primary mb-2">
                          Rate Your Experience
                        </label>
                        <select
                          name="rating"
                          value={formData.rating}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-surface-muted border border-border-soft rounded-lg text-text-primary focus:outline-none focus:border-info-blue focus:ring-2 focus:ring-focus-ring focus:ring-opacity-20 transition-all"
                        >
                          <option value="">Select a rating</option>
                          <option value="5">Excellent</option>
                          <option value="4">Good</option>
                          <option value="3">Average</option>
                          <option value="2">Poor</option>
                          <option value="1">Very Poor</option>
                        </select>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        {formType === 'feedback' ? 'Your Feedback' : 'Message'}
                      </label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        rows={5}
                        className="w-full px-4 py-3 bg-surface-muted border border-border-soft rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:border-info-blue focus:ring-2 focus:ring-focus-ring focus:ring-opacity-20 transition-all resize-none"
                        placeholder={
                          formType === 'feedback'
                            ? 'Tell us what you liked or what we can improve...'
                            : 'Tell us more about your inquiry...'
                        }
                      />
                    </div>

                    {/* Submit */}
                    <button
                      type="submit"
                      className="w-full py-4 bg-gradient-primary text-white font-semibold rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2 group"
                    >
                      {formType === 'feedback' ? 'Submit Feedback' : 'Send Message'}
                      <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>

                    {/* Back to Inquiry toggle */}
                    {formType === 'feedback' && (
                      <p
                        className="text-sm text-info-blue text-center cursor-pointer hover:text-primary transition-colors"
                        onClick={() => setFormType('inquiry')}
                      >
                        ← Back to Inquiry Form
                      </p>
                    )}
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer note */}
        <div className="mt-20 text-center">
          <p className="text-info-blue text-lg font-medium mb-3">
            Got questions? We’re just a message away.
          </p>
          <p className="text-text-secondary">
            Reach us via <span className="font-semibold text-info-blue">email</span> or{' '}
            <span className="font-semibold text-info-blue">phone</span> — we’ll be happy to help!
          </p>
        </div>
      </StaticPage>
    </div>
  )
}

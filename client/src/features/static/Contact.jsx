import StaticPage from '../../components/layout/StaticPage'
import React, { useState } from 'react';
import { Mail, MapPin, Phone, Send, MessageSquare, Clock, CheckCircle } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 3000);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1d2e] to-[#16213e]">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#6366f1] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-[#8b5cf6] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-[#ea580c] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>

      <StaticPage 
        title="Get in Touch" 
        subtitle="Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible."
      >
        <div className="mt-12 grid md:grid-cols-2 gap-8 text-left">
          <div className="space-y-8">
            <div className="bg-[#16213e] bg-opacity-50 backdrop-blur-sm p-6 rounded-xl border border-white border-opacity-10 hover:border-opacity-20 transition-all duration-300 group">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] rounded-lg group-hover:scale-110 transition-transform duration-300">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-[#e8eaed] mb-2">Email Us</h3>
                  <p className="text-[#a9a9a9] mb-2">Send us an email anytime!</p>
                  <a href="mailto:support@arcrcprep.com" className="text-[#6366f1] hover:text-[#8b5cf6] transition-colors">
                    support@arcrcprep.com
                  </a>
                </div>
              </div>
            </div>

            
           <div className="bg-[#16213e] bg-opacity-50 backdrop-blur-sm p-6 rounded-xl border border-white border-opacity-10 hover:border-opacity-20 transition-all duration-300 group">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gradient-to-br from-[#ea580c] to-[#fb923c] rounded-lg group-hover:scale-110 transition-transform duration-300">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-[#e8eaed] mb-2">Response Time</h3>
                  <p className="text-[#a9a9a9] mb-2">We typically respond within 24 hours</p>
                  <span className="text-[#10b981] font-medium">Mon - Fri: 9 AM - 6 PM IST</span>
                </div>
              </div>
            </div>

            <div className="bg-[#16213e] bg-opacity-50 backdrop-blur-sm p-6 rounded-xl border border-white border-opacity-10 hover:border-opacity-20 transition-all duration-300 group">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gradient-to-br from-[#10b981] to-[#3b82f6] rounded-lg group-hover:scale-110 transition-transform duration-300">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-[#e8eaed] mb-2">Location</h3>
                  <p className="text-[#a9a9a9]">
                    Raipur, Chhattisgarh<br />
                    India
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="bg-[#16213e] bg-opacity-50 backdrop-blur-sm p-8 rounded-xl border border-white border-opacity-10 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] opacity-5"></div>
              
              <div className="relative z-10">
                <h3 className="text-2xl font-semibold text-[#e8eaed] mb-6">Send us a Message</h3>
                
                {submitted ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="bg-[#10b981] bg-opacity-20 p-4 rounded-full mb-4">
                      <CheckCircle className="w-12 h-12 text-[#10b981]" />
                    </div>
                    <h4 className="text-xl font-semibold text-[#e8eaed] mb-2">Message Sent!</h4>
                    <p className="text-[#a9a9a9] text-center">
                      Thank you for reaching out. We'll get back to you soon.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-[#e8eaed] mb-2">
                        Your Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-[#1a1d2e] border border-white border-opacity-10 rounded-lg text-[#e8eaed] placeholder-[#a9a9a9] focus:outline-none focus:border-[#6366f1] focus:ring-2 focus:ring-[#6366f1] focus:ring-opacity-20 transition-all"
                        placeholder="John Doe"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#e8eaed] mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-[#1a1d2e] border border-white border-opacity-10 rounded-lg text-[#e8eaed] placeholder-[#a9a9a9] focus:outline-none focus:border-[#6366f1] focus:ring-2 focus:ring-[#6366f1] focus:ring-opacity-20 transition-all"
                        placeholder="john@example.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#e8eaed] mb-2">
                        Subject
                      </label>
                      <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-[#1a1d2e] border border-white border-opacity-10 rounded-lg text-[#e8eaed] placeholder-[#a9a9a9] focus:outline-none focus:border-[#6366f1] focus:ring-2 focus:ring-[#6366f1] focus:ring-opacity-20 transition-all"
                        placeholder="How can we help?"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#e8eaed] mb-2">
                        Message
                      </label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        rows={5}
                        className="w-full px-4 py-3 bg-[#1a1d2e] border border-white border-opacity-10 rounded-lg text-[#e8eaed] placeholder-[#a9a9a9] focus:outline-none focus:border-[#6366f1] focus:ring-2 focus:ring-[#6366f1] focus:ring-opacity-20 transition-all resize-none"
                        placeholder="Tell us more about your inquiry..."
                      />
                    </div>

                    <button
                      onClick={handleSubmit}
                      className="w-full py-4 bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white font-semibold rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2 group"
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
          <p className="text-[#a9a9a9] mb-4">
            Looking for quick answers? Check out our{' '}
            <a href="/faq" className="text-[#6366f1] hover:text-[#8b5cf6] transition-colors font-medium">
              Frequently Asked Questions
            </a>
          </p>
        </div>
      </StaticPage>
    </div>
  );
}
import React from 'react'
import { BookOpen, Mail, Twitter, Linkedin, Github, Facebook, Instagram } from 'lucide-react'

export default function Footer() {
  const footerLinks = {
    product: [
      { name: 'Home', href: '/' },
      { name: 'About', href: '/about' },
      { name: 'Features', href: '/#features' },
      { name: 'Pricing', href: '/pricing' },
    ],
    legal: [
      { name: 'Terms & Conditions', href: '/terms' },
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Cancellation/Refund Policy', href: '/refund-policy' },
    ],
    support: [
      { name: 'Contact Us', href: '/contact' },
      { name: 'FAQ', href: '/faq' },
      { name: 'Help Center', href: '/help' },
      { name: 'Feedback', href: '/feedback' },
    ],
  }

  const socialLinks = [
    { icon: Twitter, href: '#', label: 'Twitter', color: 'hover:text-primary' },
    { icon: Linkedin, href: '#', label: 'LinkedIn', color: 'hover:text-primary-light' },
    { icon: Facebook, href: '#', label: 'Facebook', color: 'hover:text-primary' },
    { icon: Instagram, href: '#', label: 'Instagram', color: 'hover:text-accent-amber' },
    { icon: Github, href: '#', label: 'GitHub', color: 'hover:text-text-primary' },
  ]

  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-card-surface border-t border-neutral-grey border-opacity-20">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            {/* Logo */}
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-accent flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-text-primary" />
              </div>
              <span className="text-2xl font-bold text-text-primary">ARC Prep</span>
            </div>

            {/* Description */}
            <p className="text-text-secondary mb-6 max-w-sm">
              Your trusted platform for mastering reading comprehension. Practice daily with
              expert-curated passages and improve your competitive exam scores.
            </p>

            {/* Social Links */}
            <div className="flex gap-4">
              {socialLinks.map((social, index) => {
                const Icon = social.icon
                return (
                  <a
                    key={index}
                    href={social.href}
                    aria-label={social.label}
                    className={`w-10 h-10 rounded-lg bg-background bg-opacity-50 flex items-center justify-center text-text-secondary ${social.color} transition-colors duration-200`}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                )
              })}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-text-primary font-semibold mb-4">Product</h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-text-secondary hover:text-primary-light transition-colors duration-200"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-text-primary font-semibold mb-4">Legal</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-text-secondary hover:text-primary-light transition-colors duration-200"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-text-primary font-semibold mb-4">Support</h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-text-secondary hover:text-primary-light transition-colors duration-200"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="mt-12 pt-8 border-t border-neutral-grey border-opacity-20">
          <div className="max-w-md mx-auto text-center">
            <h3 className="text-text-primary font-semibold mb-2">Stay Updated</h3>
            <p className="text-text-secondary text-sm mb-4">
              Get the latest RC tips and practice updates delivered to your inbox
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 bg-background border border-neutral-grey border-opacity-20 rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:border-primary transition-colors"
              />
              <button className="px-6 py-2 bg-gradient-accent text-text-primary font-semibold rounded-lg hover:shadow-lg transition-all duration-200 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-neutral-grey border-opacity-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Copyright */}
            <div className="text-text-secondary text-sm">
              © {currentYear} ARC Prep. All rights reserved.
            </div>

            {/* Additional Links */}
            <div className="flex items-center gap-6 text-sm">
              <a
                href="/sitemap"
                className="text-text-secondary hover:text-primary-light transition-colors"
              >
                Sitemap
              </a>
              <a
                href="/accessibility"
                className="text-text-secondary hover:text-primary-light transition-colors"
              >
                Accessibility
              </a>
              <a
                href="/status"
                className="text-text-secondary hover:text-primary-light transition-colors"
              >
                Status
              </a>
            </div>

            {/* Made with love */}
            <div className="text-text-secondary text-sm flex items-center gap-2">
              Made with <span className="text-error-red">❤️</span> for aspirants
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

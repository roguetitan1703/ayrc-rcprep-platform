import React from 'react'
import { BookOpen, Mail, Twitter, Linkedin, Github, Facebook, Instagram } from 'lucide-react'

export default function Footer() {
  const footerLinks = {
    product: [
      { name: 'Home', href: '/' },
      { name: 'About', href: '/about' },
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
    { icon: Twitter, href: '#', label: 'Twitter', color: 'hover:text-[#6366f1]' },
    { icon: Linkedin, href: '#', label: 'LinkedIn', color: 'hover:text-[#8b5cf6]' },
    { icon: Facebook, href: '#', label: 'Facebook', color: 'hover:text-[#6366f1]' },
    { icon: Instagram, href: '#', label: 'Instagram', color: 'hover:text-[#fb923c]' },
    { icon: Github, href: '#', label: 'GitHub', color: 'hover:text-[#e8eaed]' },
  ]

  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-[#16213e] border-t border-[#4A4A5A] border-opacity-20">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Column - Full width on mobile, spans 2 cols on desktop */}
          <div className="sm:col-span-2 lg:col-span-2">
            {/* Logo */}
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-6 h-6 text-[#e8eaed]" />
              </div>
              <span className="text-xl sm:text-2xl font-bold text-[#e8eaed]">ARC Prep</span>
            </div>

            {/* Description */}
            <p className="text-[#a9a9a9] mb-6 max-w-sm text-sm sm:text-base">
              Your trusted platform for mastering reading comprehension. Practice daily with
              expert-curated passages and improve your competitive exam scores.
            </p>

            {/* Social Links */}
            <div className="flex flex-wrap gap-3">
              {socialLinks.map((social, index) => {
                const Icon = social.icon
                return (
                  <a
                    key={index}
                    href={social.href}
                    aria-label={social.label}
                    className={`w-10 h-10 rounded-lg bg-[#1a1d2e] bg-opacity-50 flex items-center justify-center text-[#a9a9a9] ${social.color} transition-colors duration-200 hover:scale-110 transform`}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                )
              })}
            </div>
          </div>

          {/* Product Links */}
          <div className="sm:col-span-1">
            <h3 className="text-[#e8eaed] font-semibold mb-4 text-base sm:text-lg">Product</h3>
            <ul className="space-y-2 sm:space-y-3">
              {footerLinks.product.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-[#a9a9a9] hover:text-[#8b5cf6] transition-colors duration-200 text-sm sm:text-base block"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div className="sm:col-span-1">
            <h3 className="text-[#e8eaed] font-semibold mb-4 text-base sm:text-lg">Legal</h3>
            <ul className="space-y-2 sm:space-y-3">
              {footerLinks.legal.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-[#a9a9a9] hover:text-[#8b5cf6] transition-colors duration-200 text-sm sm:text-base block"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div className="sm:col-span-1">
            <h3 className="text-[#e8eaed] font-semibold mb-4 text-base sm:text-lg">Support</h3>
            <ul className="space-y-2 sm:space-y-3">
              {footerLinks.support.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-[#a9a9a9] hover:text-[#8b5cf6] transition-colors duration-200 text-sm sm:text-base block"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="mt-8 sm:mt-12 pt-8 ">
          <div className="max-w-md mx-auto text-center px-2">
            <h3 className="text-[#e8eaed] font-semibold mb-2 text-lg sm:text-xl">Stay Updated</h3>
            <p className="text-[#a9a9a9] text-xs sm:text-sm mb-4">
              Get the latest RC tips and practice updates delivered to your inbox
            </p>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 bg-[#1a1d2e] border border-[#4A4A5A] border-opacity-20 rounded-lg text-[#e8eaed] placeholder-[#a9a9a9] focus:outline-none focus:border-[#6366f1] transition-colors text-sm"
              />
              <button className="px-4 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-[#e8eaed] font-semibold rounded-lg hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm whitespace-nowrap">
                <Mail className="w-4 h-4" />
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-[#4A4A5A] border-opacity-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3 sm:gap-4">
            {/* Copyright */}
            <div className="text-[#a9a9a9] text-xs sm:text-sm order-2 md:order-1">
              © {currentYear} ARC Prep. All rights reserved.
            </div>

            {/* Additional Links */}
            <div className="flex items-center flex-wrap justify-center gap-4 sm:gap-6 text-xs sm:text-sm order-3 md:order-2">
              <a href="/sitemap" className="text-[#a9a9a9] hover:text-[#8b5cf6] transition-colors">
                Sitemap
              </a>
              <a
                href="/accessibility"
                className="text-[#a9a9a9] hover:text-[#8b5cf6] transition-colors"
              >
                Accessibility
              </a>
              <a href="/status" className="text-[#a9a9a9] hover:text-[#8b5cf6] transition-colors">
                Status
              </a>
            </div>

            {/* Made with love */}
            <div className="text-[#a9a9a9] text-xs sm:text-sm flex items-center gap-2 order-1 md:order-3">
              Made with <span className="text-[#ef4444] animate-pulse">❤️</span> for aspirants
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

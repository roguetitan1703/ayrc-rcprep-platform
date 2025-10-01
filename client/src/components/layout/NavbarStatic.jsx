import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const NavbarStatic = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // List of main page paths where navbar should be visible
  const mainPages = [
    '/',
    '/about',
    '/pricing',
    '/privacy',
    '/contact',
    '/terms',
    '/refund-policy',
  ];

  // Hide navbar on dashboard routes
  if (location.pathname.startsWith('/dashboard')) {
    return null;
  }

  // Only show navbar on main pages
  if (!mainPages.includes(location.pathname)) {
    return null;
  }

  const menuItems = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Pricing', path: '/pricing' },
    { name: 'Privacy', path: '/privacy' },
    { name: 'Contact', path: '/contact' },
    { name: 'Terms', path: '/terms' },
    { name: 'Refund Policy', path: '/refund-policy' },
  ];

  return (
    <nav className="bg-gradient-primary fixed top-0 left-0 right-0 z-50 shadow-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <NavLink to="/" className="text-text-primary text-xl font-bold">
              ARC RC Prep
            </NavLink>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center ml-8 space-x-4">
            {menuItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `text-text-secondary hover:text-primary transition-colors duration-200 ${
                    isActive ? 'text-primary font-medium' : ''
                  }`
                }
              >
                {item.name}
              </NavLink>
            ))}
          </div>

          {/* Desktop Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <NavLink
              to="/register"
              className="px-4 py-2 bg-gradient-accent text-white font-semibold rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              Get Started
            </NavLink>
            <NavLink
              to="/login"
              className="px-4 py-2 bg-secondary-bg text-text-primary font-semibold rounded-lg hover:bg-primary hover:text-white transition-all duration-200"
            >
              Sign In
            </NavLink>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-text-primary hover:text-primary focus:outline-none"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-gradient-primary shadow-card z-40 transition-all duration-300 ease-in-out">
          <div className="flex justify-between items-center h-16 px-4 sm:px-6">
            {/* Logo in Mobile Menu */}
            <NavLink
              to="/"
              className="text-text-primary text-xl font-bold"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              ARC RC Prep
            </NavLink>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-text-primary hover:text-primary focus:outline-none"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="px-4 py-4 space-y-3">
            {menuItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `block text-text-secondary hover:text-primary transition-colors duration-200 text-lg font-medium ${
                    isActive ? 'text-primary' : ''
                  }`
                }
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.name}
              </NavLink>
            ))}
            <NavLink
              to="/register"
              className="block px-4 py-2 bg-gradient-accent text-white font-semibold rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 text-center"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Get Started
            </NavLink>
            <NavLink
              to="/login"
              className="block px-4 py-2 bg-secondary-bg text-text-primary font-semibold rounded-lg hover:bg-primary hover:text-white transition-all duration-200 text-center"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Sign In
            </NavLink>
          </div>
        </div>
      )}
    </nav>
  );
};

export default NavbarStatic;
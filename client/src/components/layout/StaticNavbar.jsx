// import React, { useState } from 'react';
// import { NavLink, useLocation } from 'react-router-dom';
// import { Menu, X } from 'lucide-react';

// const NavbarStatic = () => {
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
//   const location = useLocation();

//   // List of main page paths where navbar should be visible
//   const mainPages = [
//     '/',
//     '/about',
//     '/pricing',
//     '/privacy',
//     '/contact',
//     '/terms',
//     '/refund-policy',
//   ];

//   // Hide navbar on dashboard routes
//   if (location.pathname.startsWith('/dashboard')) {
//     return null;
//   }

//   // Only show navbar on main pages
//   if (!mainPages.includes(location.pathname)) {
//     return null;
//   }

//   const menuItems = [
//     { name: 'Home', path: '/' },
//     { name: 'About', path: '/about' },
//     { name: 'Pricing', path: '/pricing' },
//     { name: 'Privacy', path: '/privacy' },
//     { name: 'Contact', path: '/contact' },
//     { name: 'Terms', path: '/terms' },
//     { name: 'Refund Policy', path: '/refund-policy' },
//   ];

//   return (
//     <nav className="bg-gradient-primary fixed top-0 left-0 right-0 z-50 shadow-card">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex justify-between items-center h-16">
//           {/* Logo */}
//           <div className="flex-shrink-0">
//             <NavLink to="/" className="text-text-primary text-xl font-bold">
//               ARC RC Prep
//             </NavLink>
//           </div>

//           {/* Desktop Menu */}
//           <div className="hidden md:flex items-center ml-8 space-x-4">
//             {menuItems.map((item) => (
//               <NavLink
//                 key={item.name}
//                 to={item.path}
//                 className={({ isActive }) =>
//                   `text-text-secondary hover:text-primary transition-colors duration-200 ${
//                     isActive ? 'text-primary font-medium' : ''
//                   }`
//                 }
//               >
//                 {item.name}
//               </NavLink>
//             ))}
//           </div>

//           {/* Desktop Buttons */}
//           <div className="hidden md:flex items-center space-x-4">
//             <NavLink
//               to="/register"
//               className="px-4 py-2 bg-gradient-accent text-white font-semibold rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200"
//             >
//               Get Started
//             </NavLink>
//             <NavLink
//               to="/login"
//               className="px-4 py-2 bg-secondary-bg text-text-primary font-semibold rounded-lg hover:bg-primary hover:text-white transition-all duration-200"
//             >
//               Sign In
//             </NavLink>
//           </div>

//           {/* Mobile Menu Button */}
//           <div className="md:hidden flex items-center">
//             <button
//               onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
//               className="text-text-primary hover:text-primary focus:outline-none"
//             >
//               {isMobileMenuOpen ? (
//                 <X className="w-6 h-6" />
//               ) : (
//                 <Menu className="w-6 h-6" />
//               )}
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Mobile Menu */}
//       {isMobileMenuOpen && (
//         <div className="md:hidden fixed inset-0 bg-gradient-primary shadow-card z-40 transition-all duration-300 ease-in-out">
//           <div className="flex justify-between items-center h-16 px-4 sm:px-6">
//             {/* Logo in Mobile Menu */}
//             <NavLink
//               to="/"
//               className="text-text-primary text-xl font-bold"
//               onClick={() => setIsMobileMenuOpen(false)}
//             >
//               ARC RC Prep
//             </NavLink>
//             <button
//               onClick={() => setIsMobileMenuOpen(false)}
//               className="text-text-primary hover:text-primary focus:outline-none"
//             >
//               <X className="w-6 h-6" />
//             </button>
//           </div>
//           <div className="px-4 py-4 space-y-3">
//             {menuItems.map((item) => (
//               <NavLink
//                 key={item.name}
//                 to={item.path}
//                 className={({ isActive }) =>
//                   `block text-text-secondary hover:text-primary transition-colors duration-200 text-lg font-medium ${
//                     isActive ? 'text-primary' : ''
//                   }`
//                 }
//                 onClick={() => setIsMobileMenuOpen(false)}
//               >
//                 {item.name}
//               </NavLink>
//             ))}
//             <NavLink
//               to="/register"
//               className="block px-4 py-2 bg-gradient-accent text-white font-semibold rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 text-center"
//               onClick={() => setIsMobileMenuOpen(false)}
//             >
//               Get Started
//             </NavLink>
//             <NavLink
//               to="/login"
//               className="block px-4 py-2 bg-secondary-bg text-text-primary font-semibold rounded-lg hover:bg-primary hover:text-white transition-all duration-200 text-center"
//               onClick={() => setIsMobileMenuOpen(false)}
//             >
//               Sign In
//             </NavLink>
//           </div>
//         </div>
//       )}
//     </nav>
//   );
// };

// export default NavbarStatic;

import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { X, Menu, BookOpen } from 'lucide-react'

export default function StaticNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  const navLinks = [
    { to: '/about', label: 'About' },
    { to: '/pricing', label: 'Pricing' },
    { to: '/contact', label: 'Contact' },
    { to: '/privacy', label: 'Privacy' },
    { to: '/terms', label: 'Terms' },
    { to: '/refund-policy', label: 'Refund Policy' }
  ]

  const isActive = (path) => location.pathname === path

  return (
    <>
      {/* Full Static Header */}
      <div className="w-full px-6 h-14 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-accent-amber">
            <BookOpen size={20} />
            <span className="font-semibold">ARC</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-2 rounded text-sm transition-colors ${
                  isActive(link.to)
                    ? 'text-accent-amber bg-accent-amber/10'
                    : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Auth Buttons (Desktop) */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 rounded text-sm text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 rounded text-sm bg-accent-amber text-black font-medium hover:bg-accent-amber/90 transition-colors"
            >
              Create Account
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(true)}
            className="md:hidden inline-flex items-center justify-center p-2 rounded border border-white/10 hover:bg-white/5 text-text-secondary"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
        </div>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-50 md:hidden"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="fixed right-0 top-0 bottom-0 w-64 bg-background border-l border-white/10 p-4 flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <span className="font-semibold text-lg">Menu</span>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 rounded hover:bg-white/5"
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="flex flex-col gap-1 mb-6">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={`px-4 py-3 rounded text-sm transition-colors ${
                    isActive(link.to)
                      ? 'text-accent-amber bg-accent-amber/10'
                      : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Auth Buttons (Mobile) */}
            <div className="mt-auto flex flex-col gap-2 pt-4 border-t border-white/10">
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="w-full px-4 py-3 rounded text-sm text-center text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors border border-white/10"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileOpen(false)}
                className="w-full px-4 py-3 rounded text-sm text-center bg-accent-amber text-black font-medium hover:bg-accent-amber/90 transition-colors"
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
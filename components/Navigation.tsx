'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X, BookOpen, Code, Award, Users } from 'lucide-react'

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-ibm-blue to-ibm-purple rounded-lg flex items-center justify-center">
              <Code className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">
              GenAI Academy
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              href="/labs" 
              className="flex items-center space-x-2 text-gray-700 hover:text-ibm-blue transition"
            >
              <BookOpen className="w-4 h-4" />
              <span>Labs</span>
            </Link>
            <Link 
              href="/learning-paths" 
              className="flex items-center space-x-2 text-gray-700 hover:text-ibm-blue transition"
            >
              <Award className="w-4 h-4" />
              <span>Learning Paths</span>
            </Link>
            <Link 
              href="/community" 
              className="flex items-center space-x-2 text-gray-700 hover:text-ibm-blue transition"
            >
              <Users className="w-4 h-4" />
              <span>Community</span>
            </Link>
            <Link 
              href="/pricing" 
              className="text-gray-700 hover:text-ibm-blue transition"
            >
              Pricing
            </Link>
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link 
              href="/login" 
              className="text-gray-700 hover:text-ibm-blue transition"
            >
              Sign In
            </Link>
            <Link 
              href="/signup" 
              className="bg-ibm-blue text-white px-4 py-2 rounded-lg hover:bg-ibm-blue-dark transition"
            >
              Start Learning
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-gray-700"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-4 py-3 space-y-3">
            <Link 
              href="/labs" 
              className="block text-gray-700 hover:text-ibm-blue py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Labs
            </Link>
            <Link 
              href="/learning-paths" 
              className="block text-gray-700 hover:text-ibm-blue py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Learning Paths
            </Link>
            <Link 
              href="/community" 
              className="block text-gray-700 hover:text-ibm-blue py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Community
            </Link>
            <Link 
              href="/pricing" 
              className="block text-gray-700 hover:text-ibm-blue py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Pricing
            </Link>
            <div className="pt-3 border-t border-gray-200">
              <Link 
                href="/login" 
                className="block text-gray-700 hover:text-ibm-blue py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign In
              </Link>
              <Link 
                href="/signup" 
                className="block bg-ibm-blue text-white px-4 py-2 rounded-lg text-center mt-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Start Learning
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

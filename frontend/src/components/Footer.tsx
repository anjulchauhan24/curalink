'use client';

import Link from 'next/link';
import { Heart, Mail, Github, Linkedin, Twitter } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-primary-400" />
              <span className="text-2xl font-bold text-white">CuraLink</span>
            </div>
            <p className="text-sm text-gray-400">
              AI-powered platform connecting patients and researchers for better
              healthcare innovation.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://twitter.com/curalink"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary-400 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://linkedin.com/company/curalink"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary-400 transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="https://github.com/curalink"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary-400 transition-colors"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="mailto:support@curalink.ai"
                className="text-gray-400 hover:text-primary-400 transition-colors"
                aria-label="Email"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* For Patients */}
          <div>
            <h3 className="text-white font-semibold mb-4">For Patients</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/trials"
                  className="text-sm hover:text-primary-400 transition-colors"
                >
                  Find Clinical Trials
                </Link>
              </li>
              <li>
                <Link
                  href="/experts"
                  className="text-sm hover:text-primary-400 transition-colors"
                >
                  Connect with Experts
                </Link>
              </li>
              <li>
                <Link
                  href="/publications"
                  className="text-sm hover:text-primary-400 transition-colors"
                >
                  Research Publications
                </Link>
              </li>
              <li>
                <Link
                  href="/forums"
                  className="text-sm hover:text-primary-400 transition-colors"
                >
                  Community Forums
                </Link>
              </li>
            </ul>
          </div>

          {/* For Researchers */}
          <div>
            <h3 className="text-white font-semibold mb-4">For Researchers</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/register?type=researcher"
                  className="text-sm hover:text-primary-400 transition-colors"
                >
                  Join as Researcher
                </Link>
              </li>
              <li>
                <Link
                  href="/trials/create"
                  className="text-sm hover:text-primary-400 transition-colors"
                >
                  Post Clinical Trial
                </Link>
              </li>
              <li>
                <Link
                  href="/collaborators"
                  className="text-sm hover:text-primary-400 transition-colors"
                >
                  Find Collaborators
                </Link>
              </li>
              <li>
                <Link
                  href="/resources"
                  className="text-sm hover:text-primary-400 transition-colors"
                >
                  Research Resources
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/about"
                  className="text-sm hover:text-primary-400 transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm hover:text-primary-400 transition-colors"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-sm hover:text-primary-400 transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-sm hover:text-primary-400 transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/help"
                  className="text-sm hover:text-primary-400 transition-colors"
                >
                  Help Center
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-sm text-gray-400">
            &copy; {currentYear} CuraLink. All rights reserved.
          </p>
          <div className="flex space-x-6 text-sm">
            <Link
              href="/privacy"
              className="text-gray-400 hover:text-primary-400 transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-gray-400 hover:text-primary-400 transition-colors"
            >
              Terms
            </Link>
            <Link
              href="/cookies"
              className="text-gray-400 hover:text-primary-400 transition-colors"
            >
              Cookies
            </Link>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-6 pt-6 border-t border-gray-800">
          <p className="text-xs text-gray-500 text-center max-w-4xl mx-auto">
            <strong>Medical Disclaimer:</strong> CuraLink is an informational
            platform and does not provide medical advice. Always consult with
            qualified healthcare professionals before making medical decisions.
            Clinical trial participation should be discussed with your healthcare
            provider.
          </p>
        </div>
      </div>
    </footer>
  );
}
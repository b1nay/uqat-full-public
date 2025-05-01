import Image from "next/image";
import Link from "next/link";
import { FiHeart, FiMail, FiMapPin, FiGithub, FiLinkedin, FiTwitter } from "react-icons/fi";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-main text-white w-full mt-auto">
      {/* Wave SVG Divider (optional - adds a nice touch) */}
      <div className="w-full overflow-hidden leading-none">
        <svg
          className="relative block w-full h-12 mt-0"
          data-name="Layer 1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
            fill="currentColor"
            className="text-main"
          ></path>
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo and Description */}
          <div className="flex flex-col">
            <Link href="/" className="inline-flex items-center mb-4">
              <Image
                src="/logo-dark.png"
                alt="UQat Logo"
                width={48}
                height={48}
                className="mr-2"
              />
              <span className="font-bold text-2xl tracking-tight">UQat</span>
            </Link>
            <p className="text-gray-200 mb-4">
              Unified QnA Assistant is an AI-Powered intelligent tool designed to
              streamline how InfoSec and Compliance teams handle security
              questionnaires and on-demand queries.
            </p>
            <div className="flex space-x-4 mt-2">
              <a href="#" className="text-gray-200 hover:text-white transition-colors">
                <FiTwitter size={20} />
              </a>
              <a href="#" className="text-gray-200 hover:text-white transition-colors">
                <FiLinkedin size={20} />
              </a>
              <a href="#" className="text-gray-200 hover:text-white transition-colors">
                <FiGithub size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col md:items-center">
            <h3 className="text-lg font-semibold mb-4 border-b border-blue-400 pb-2">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/chat" className="text-gray-200 hover:text-white transition-colors flex items-center">
                  <span className="mr-2">→</span> Chat Interface
                </Link>
              </li>
              <li>
                <Link href="/batch" className="text-gray-200 hover:text-white transition-colors flex items-center">
                  <span className="mr-2">→</span> Batch Processing
                </Link>
              </li>
              <li>
                <Link href="/yeti" className="text-gray-200 hover:text-white transition-colors flex items-center">
                  <span className="mr-2">→</span> YETI
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-200 hover:text-white transition-colors flex items-center">
                  <span className="mr-2">→</span> About
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div className="flex flex-col md:items-end">
            <h3 className="text-lg font-semibold mb-4 border-b border-blue-400 pb-2 md:text-right md:w-full">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-center md:justify-end">
                <FiMail className="mr-2" />
                <a href="mailto:contact@uqat.io" className="text-gray-200 hover:text-white transition-colors">
                  contact@uqat.io
                </a>
              </li>
              <li className="flex items-center md:justify-end">
                <FiMapPin className="mr-2" />
                <span className="text-gray-200">San Francisco, CA</span>
              </li>
            </ul>
            <div className="mt-6 md:text-right">
              <Link 
                href="/contact" 
                className="bg-white text-main px-4 py-2 rounded-md font-medium hover:bg-opacity-90 transition-colors"
              >
                Get in Touch
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-blue-400 mt-8 pt-4 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-sm text-gray-300 mb-2 sm:mb-0">
            &copy; {currentYear} UQat. All rights reserved.
          </p>
          <p className="text-sm text-gray-300 flex items-center">
            Crafted with <FiHeart className="text-red-400 mx-1" /> by
            <a href="#" className="ml-1 underline hover:text-white">
              Catalysts
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
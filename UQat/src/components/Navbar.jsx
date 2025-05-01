
"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/app/context/AuthContext";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FiMenu,
  FiX,
  FiChevronDown,
  FiUser,
  FiLogOut,
  FiHelpCircle,
  FiInfo,
  FiMessageSquare,
  FiFileText,
} from "react-icons/fi";

export default function Navbar() {
  const { isLoggedIn, username, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const profileRef = useRef(null);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [profileRef]);

  const navLinks = [
    { name: "Chat", path: "/chat", icon: <FiMessageSquare /> },
    { name: "Batch", path: "/batch", icon: <FiFileText /> },
    { name: "About", path: "/about", icon: <FiInfo /> },
    { name: "Yeti", path: "/yeti", icon: <FiHelpCircle /> },
  ];

  const isActive = (path) => pathname === path;

  // Calculate navbar height for content padding
  const navbarHeight = scrolled ? "h-[70px]" : "h-[80px]";

  const toggleProfileDropdown = (e) => {
    e.stopPropagation();
    setIsProfileOpen(!isProfileOpen);
  };

  return (
    <>
      {/* Navigation Bar */}
      <nav
        className={`fixed top-0 left-0 right-0 w-full z-50 transition-all duration-300 ${
          scrolled ? "bg-main shadow-md py-2" : "bg-main py-3"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center gap-2">
                <Image
                  src="/logo-dark.png"
                  alt="UQat Logo"
                  width={48}
                  height={48}
                  className="h-10 w-10"
                />
                <span className="font-bold text-xl text-white tracking-tight">
                  UQat
                  <span className="hidden sm:inline text-xs font-light tracking-wide ml-1 text-blue-200">
                    Security Compliance Assistant
                  </span>
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.path}
                  className={`flex items-center gap-1.5 text-sm font-medium transition-colors duration-200 ${
                    isActive(link.path)
                      ? "text-white border-b-2 border-blue-300"
                      : "text-blue-100 hover:text-white"
                  }`}
                >
                  {link.icon}
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Authentication Section */}
            <div className="hidden md:flex items-center">
              {isLoggedIn ? (
                <div className="relative" ref={profileRef}>
                  <button
                    className="flex cursor-pointer items-center gap-2 bg-blue-700 bg-opacity-30 text-white px-3 py-2 rounded-full transition-all hover:bg-opacity-40 focus:outline-none"
                    onClick={toggleProfileDropdown}
                  >
                    <div className="bg-blue-500 rounded-full w-8 h-8 flex items-center justify-center text-white font-semibold">
                      {username?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <span className="font-medium">{username}</span>
                    <FiChevronDown
                      className={`transition-transform duration-200 ${
                        isProfileOpen ? "transform rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Profile Dropdown */}
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-48 py-2 bg-white rounded-md shadow-xl z-20">
                      <div className="px-4 py-2 text-sm text-gray-500 border-b border-gray-100">
                        Signed in as{" "}
                        <span className="font-semibold text-gray-700">
                          {username}
                        </span>
                      </div>
                      <Link
                        href="/profile"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      >
                        <FiUser />
                        Your Profile
                      </Link>
                      <button
                        onClick={logout}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
                      >
                        <FiLogOut />
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex gap-4 items-center">
                  <Link
                    href="/login"
                    className="text-white hover:text-blue-200 transition-colors"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/signup"
                    className="bg-white text-main hover:bg-blue-100 px-4 py-2 rounded-md font-medium transition-colors duration-200"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden">
              <button
                type="button"
                className="text-white hover:text-blue-200 focus:outline-none"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? (
                  <FiX className="h-6 w-6" />
                ) : (
                  <FiMenu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-main border-t border-blue-800">
            <div className="px-2 pt-2 pb-4 space-y-1 sm:px-3">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.path}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium ${
                    isActive(link.path)
                      ? "bg-blue-800 text-white"
                      : "text-blue-100 hover:bg-blue-700 hover:text-white"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.icon}
                  {link.name}
                </Link>
              ))}

              {/* Mobile Authentication */}
              {isLoggedIn ? (
                <div className="border-t border-blue-800 pt-4 mt-4">
                  <div className="px-3 py-2 text-blue-200">
                    Signed in as{" "}
                    <span className="font-semibold text-white">{username}</span>
                  </div>
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium text-blue-100 hover:bg-blue-700 hover:text-white"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <FiUser />
                    Your Profile
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-300 hover:bg-blue-700 hover:text-red-200"
                  >
                    <FiLogOut />
                    Sign out
                  </button>
                </div>
              ) : (
                <div className="border-t border-blue-800 pt-4 mt-4 flex flex-col gap-2">
                  <Link
                    href="/login"
                    className="flex items-center justify-center px-3 py-2 rounded-md text-base font-medium text-blue-100 hover:bg-blue-700 hover:text-white"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Log in
                  </Link>
                  <Link
                    href="/signup"
                    className="flex items-center justify-center px-3 py-2 rounded-md text-base font-medium bg-white text-main hover:bg-blue-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Spacer div to push content below navbar */}
      <div
        className={`${navbarHeight} ${
          isMenuOpen ? "md:block hidden" : "block"
        }`}
      ></div>
    </>
  );
}

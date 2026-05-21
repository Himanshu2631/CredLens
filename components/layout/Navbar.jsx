'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Container from './Container';
import { Button } from '@/components/ui/button';
import Logo from '@/components/ui/Logo';

// Modular Desktop NavLink component
const NavLink = ({ href, children, isActive }) => (
  <Link
    href={href}
    className={`text-[12px] font-medium transition-colors duration-150 py-1 ${
      isActive
        ? 'text-white'
        : 'text-zinc-400 hover:text-white'
    }`}
  >
    {children}
  </Link>
);

// Modular Mobile NavLink component
const MobileNavLink = ({ href, children, isActive, onClick }) => (
  <Link
    href={href}
    onClick={onClick}
    className={`flex items-center h-10 px-3 rounded-lg text-[13px] font-medium transition-all duration-150 ${
      isActive
        ? 'text-white bg-zinc-900 border border-zinc-800'
        : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
    }`}
  >
    {children}
  </Link>
);

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Cost Auditor', href: '/' },
    { name: 'API Key Manager', href: '/api-keys' },
    { name: 'Subscriptions', href: '/subscriptions' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md transition-all duration-200">
      <Container>
        {/* Exact 52px (h-[52px]) header line wrapper for a lightweight, modern appearance */}
        <div className="flex h-[52px] items-center justify-between">
          
          {/* Left Brand and Navigation Group */}
          <div className="flex items-center gap-8">
            <Logo />
            
            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-5">
              {navigation.map((item) => (
                <NavLink
                  key={item.name}
                  href={item.href}
                  isActive={pathname === item.href}
                >
                  {item.name}
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Desktop Right Side CTA Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="#"
              className="text-[12px] font-medium text-zinc-400 hover:text-white transition-colors px-1"
            >
              Docs
            </Link>
            
            <Button
              variant="outline"
              size="sm"
              className="font-medium text-zinc-300 hover:text-white border-zinc-800/80 bg-zinc-950 hover:bg-zinc-900"
            >
              Feedback
            </Button>
            
            <Button
              variant="default"
              size="sm"
              className="font-medium shadow-[0_1px_2px_rgba(255,255,255,0.05)]"
            >
              Analyze Cost
            </Button>
          </div>

          {/* Mobile Menu Toggle button with premium path animations */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="relative inline-flex items-center justify-center rounded-md p-2 text-zinc-400 hover:text-white hover:bg-zinc-900 focus:outline-none transition-colors"
              aria-label="Toggle menu"
              aria-expanded={isOpen}
              aria-controls="mobile-menu"
            >
              <div className="relative w-[18px] h-4 flex flex-col justify-between">
                <span
                  className={`h-[1.5px] w-[18px] bg-current rounded-full transform transition-all duration-200 ease-in-out ${
                    isOpen ? 'rotate-45 translate-y-[7.25px]' : ''
                  }`}
                />
                <span
                  className={`h-[1.5px] w-[18px] bg-current rounded-full transition-all duration-200 ease-in-out ${
                    isOpen ? 'opacity-0 scale-x-0' : 'opacity-100'
                  }`}
                />
                <span
                  className={`h-[1.5px] w-[18px] bg-current rounded-full transform transition-all duration-200 ease-in-out ${
                    isOpen ? '-rotate-45 -translate-y-[7.25px]' : ''
                  }`}
                />
              </div>
            </button>
          </div>
        </div>
      </Container>

      {/* Mobile Menu Panel: Dropdown slider with opacity/height transitions */}
      <div
        id="mobile-menu"
        className={`md:hidden absolute top-[52px] left-0 right-0 border-b border-border bg-black/95 backdrop-blur-md transition-all duration-250 ease-in-out origin-top ${
          isOpen
            ? 'opacity-100 translate-y-0 scale-y-100 pointer-events-auto'
            : 'opacity-0 -translate-y-2 scale-y-95 pointer-events-none'
        }`}
      >
        <Container className="py-4 flex flex-col gap-1.5">
          {navigation.map((item) => (
            <MobileNavLink
              key={item.name}
              href={item.href}
              isActive={pathname === item.href}
              onClick={() => setIsOpen(false)}
            >
              {item.name}
            </MobileNavLink>
          ))}
          
          <div className="h-px bg-zinc-800/60 my-2" />
          
          <Link
            href="#"
            onClick={() => setIsOpen(false)}
            className="flex items-center h-10 px-3 rounded-lg text-[13px] font-medium text-zinc-400 hover:text-white hover:bg-zinc-900/50"
          >
            Docs
          </Link>
          
          <div className="grid grid-cols-2 gap-2.5 mt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="w-full justify-center"
            >
              Feedback
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="w-full justify-center"
            >
              Analyze Cost
            </Button>
          </div>
        </Container>
      </div>
    </header>
  );
}

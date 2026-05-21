'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Container from './Container';
import { Button } from '@/components/ui/button';
import { Menu, X, ShieldAlert, Activity, CreditCard, LayoutDashboard, Sliders } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navigation = [
    { name: 'Dashboard', href: '#', icon: LayoutDashboard },
    { name: 'Cost Auditor', href: '#', icon: Activity, active: true },
    { name: 'API Key Manager', href: '#', icon: Sliders },
    { name: 'Subscriptions', href: '#', icon: CreditCard },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md transition-colors duration-300">
      <Container>
        <div className="flex h-14 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 text-white font-medium hover:opacity-90 transition-opacity">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-card border border-border text-emerald-500 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]">
                <ShieldAlert className="h-4 w-4" />
              </div>
              <span className="font-semibold tracking-tight text-xs text-white">CredLens</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navigation.map((item) => {
                const isActive = item.active || pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-cta font-medium transition-colors ${
                      isActive
                        ? 'text-white bg-card border border-border/30'
                        : 'text-muted-foreground hover:text-white hover:bg-secondary/40'
                    }`}
                  >
                    <item.icon className="h-3.5 w-3.5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Side Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="#" className="text-cta font-medium text-muted-foreground hover:text-white px-3 py-1.5 transition-colors">
              Docs
            </Link>
            <Button
              variant="outline"
              size="sm"
              className="h-8 border-border bg-card text-cta font-medium text-zinc-300 hover:text-white hover:bg-secondary"
            >
              Feedback
            </Button>
            <Button
              size="sm"
              className="h-8 bg-primary text-primary-foreground hover:bg-zinc-200 text-cta font-medium px-4"
            >
              Analyze Cost
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:text-white hover:bg-secondary focus:outline-none"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </Container>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden border-t border-border bg-background py-4 transition-all duration-300">
          <Container className="flex flex-col gap-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  item.active
                    ? 'text-white bg-card border border-border/50'
                    : 'text-muted-foreground hover:text-white hover:bg-secondary/50'
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            ))}
            <div className="h-px bg-border my-2" />
            <Link
              href="#"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-white hover:bg-secondary/50"
            >
              Docs
            </Link>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full border-border bg-card text-xs text-zinc-300 hover:text-white"
              >
                Feedback
              </Button>
              <Button
                size="sm"
                className="w-full bg-primary text-primary-foreground hover:bg-zinc-200 text-xs"
              >
                Analyze Cost
              </Button>
            </div>
          </Container>
        </div>
      )}
    </header>
  );
}

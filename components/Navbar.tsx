/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { getAboutPath, getGalleryPath, getHomePath, getPublicAssetPath } from '../sitePaths';

interface NavLink {
  key: 'home' | 'gallery' | 'about';
  label: string;
  href: string;
}

interface NavbarProps {
  forceSolid?: boolean;
  activeKey?: NavLink['key'];
}

const NAV_LINKS: NavLink[] = [
  { key: 'home', label: 'Home', href: getHomePath() },
  { key: 'gallery', label: 'Gallery', href: getGalleryPath() },
  { key: 'about', label: 'Info', href: getAboutPath() }
];

const Navbar: React.FC<NavbarProps> = ({ forceSolid = false, activeKey }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const showNavChrome = scrolled || mobileMenuOpen || forceSolid;

  useEffect(() => {
    let rafId: number | null = null;

    const handleScroll = () => {
      if (rafId !== null) {
        return;
      }

      rafId = window.requestAnimationFrame(() => {
        const nextScrolled = window.scrollY > 50;
        setScrolled((prevScrolled) => (prevScrolled === nextScrolled ? prevScrolled : nextScrolled));
        rafId = null;
      });
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const textColorClass = showNavChrome ? 'text-[#2C2A26]' : 'text-[#F5F2EB]';

  const getLinkClass = (key: NavLink['key']): string => {
    if (key === activeKey) {
      return 'opacity-100';
    }
    return 'hover:opacity-60 transition-opacity';
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 py-4 transition-colors duration-500">
        <div
          className={`absolute inset-0 pointer-events-none transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            showNavChrome ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
          }`}
        >
          <div className="absolute inset-0 bg-[#F5F2EB] shadow-sm"></div>
          <div className="absolute inset-x-0 bottom-0 h-px bg-[#D6D1C7]"></div>
        </div>

        <div className="max-w-[1800px] mx-auto px-8 flex items-center justify-between relative">
          <a href={getHomePath()} className="z-50 relative w-10 md:w-14 h-10 md:h-12 flex items-center justify-start" aria-label="Back to home">
            <img
              src={getPublicAssetPath('logo.svg')}
              alt="Personal logo"
              className={`h-7 md:h-9 w-auto object-contain transition-all duration-500 ${
                showNavChrome ? 'opacity-90' : 'invert opacity-95'
              }`}
            />
          </a>

          <div
            className={`hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-12 text-sm font-medium tracking-widest uppercase transition-colors duration-500 ${textColorClass}`}
          >
            {NAV_LINKS.map((link) => (
              <a key={link.key} href={link.href} className={getLinkClass(link.key)}>
                {link.label}
              </a>
            ))}
          </div>

          <div className={`flex items-center gap-6 z-50 relative transition-colors duration-500 ${textColorClass}`}>
            <button
              className={`block md:hidden focus:outline-none transition-colors duration-500 ${textColorClass}`}
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileMenuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </nav>

      <div
        className={`fixed inset-0 bg-[#F5F2EB] z-40 flex flex-col justify-center items-center transition-all duration-500 ease-in-out ${
          mobileMenuOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-10 pointer-events-none'
        }`}
      >
        <div className="flex flex-col items-center space-y-8 text-xl font-serif font-medium text-[#2C2A26]">
          {NAV_LINKS.map((link) => (
            <a
              key={link.key}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className={getLinkClass(link.key)}
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </>
  );
};

export default Navbar;

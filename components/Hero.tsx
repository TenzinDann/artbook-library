/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import React from 'react';

interface HeroProps {
  videoSrc?: string;
  nextHref?: string;
  prevHref?: string;
  onNext?: () => void;
  onPrev?: () => void;
}

const Hero: React.FC<HeroProps> = ({ videoSrc, nextHref, prevHref, onNext, onPrev }) => {
  return (
    <section className="relative w-full h-[100svh] overflow-hidden bg-[#D6D1C7]">
      
      {/* Background Image - Valley Picture */}
      <div className="absolute inset-0 z-0 w-full h-full pointer-events-none">
        <video
            src={videoSrc || "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260228_065522_522e2295-ba22-457e-8fdb-fbcd68109c73.mp4"}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="absolute inset-0 z-0 w-full h-full min-w-full min-h-full object-cover object-center contrast-[0.8] brightness-[0.9] transform-gpu will-change-transform [backface-visibility:hidden]"
            aria-label="Artbook Library Hero Background"
        />
        <div className="absolute inset-0 z-[1] bg-[#433E38]/30 mix-blend-multiply"></div>
        <div className="absolute inset-0 z-[2] bg-[#313030]/10"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-6 pointer-events-none">
        <div className="animate-fade-in-up w-full md:w-auto">
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-serif font-normal text-white tracking-tight mb-8 drop-shadow-sm">
            Artbook <span className="italic text-[#F5F2EB]">Library.</span>
          </h1>
        </div>
      </div>

      {/* Turn Page Left Indicator */}
      {(prevHref || onPrev) &&
        (prevHref ? (
          <a
            href={prevHref}
            className="absolute left-8 top-1/2 -translate-y-1/2 z-20 p-4 text-white/70 hover:text-white transition-all duration-500 group cursor-pointer"
            aria-label="Previous Page"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 group-hover:-translate-x-1 transition-transform">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </a>
        ) : (
          <button
            type="button"
            onClick={onPrev}
            className="absolute left-8 top-1/2 -translate-y-1/2 z-20 p-4 text-white/70 hover:text-white transition-all duration-500 group cursor-pointer"
            aria-label="Previous Page"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 group-hover:-translate-x-1 transition-transform">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
        ))}

      {/* Turn Page Right Indicator */}
      {(nextHref || onNext) &&
        (nextHref ? (
          <a 
            href={nextHref}
            className="absolute right-8 top-1/2 -translate-y-1/2 z-20 p-4 text-white/70 hover:text-white transition-all duration-500 group cursor-pointer"
            aria-label="Next Page"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 group-hover:translate-x-1 transition-transform">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </a>
        ) : (
          <button 
            type="button"
            onClick={onNext}
            className="absolute right-8 top-1/2 -translate-y-1/2 z-20 p-4 text-white/70 hover:text-white transition-all duration-500 group cursor-pointer"
            aria-label="Next Page"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 group-hover:translate-x-1 transition-transform">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        ))}
    </section>
  );
};

export default Hero;

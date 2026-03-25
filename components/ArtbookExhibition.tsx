/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Artbook } from '../types';

interface ArtbookExhibitionProps {
  artbook: Artbook;
  galleryHref?: string;
  nextHref?: string;
  prevHref?: string;
  onNext?: () => void;
  onPrev?: () => void;
}

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100vw' : '-100vw',
    opacity: 0
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? '100vw' : '-100vw',
    opacity: 0
  })
};

const smoothTransition = {
  x: { type: "tween", ease: [0.22, 1, 0.36, 1], duration: 0.8 },
  opacity: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
};

const isVideoUrl = (url: string) => /\.(mp4|webm|ogg)(?:[?#]|$)/i.test(url);

const ArtbookExhibition: React.FC<ArtbookExhibitionProps> = ({ artbook, galleryHref, nextHref, prevHref, onNext, onPrev }) => {
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [galleryDirection, setGalleryDirection] = useState(0);
  const galleryItems = artbook.gallery ?? [];
  const hasGalleryPreview = galleryItems.length > 0;
  const currentGalleryItem = galleryItems[currentImageIndex] ?? '';
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    videoRef.current?.play().catch(() => {});
  }, [artbook.id]);

  const openGallery = () => {
    if (hasGalleryPreview) {
      setCurrentImageIndex(0);
      setIsGalleryOpen(true);
    }
  };

  const handleGalleryNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setGalleryDirection(1);
    setCurrentImageIndex(prev => prev < galleryItems.length - 1 ? prev + 1 : 0);
  };

  const handleGalleryPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setGalleryDirection(-1);
    setCurrentImageIndex(prev => prev > 0 ? prev - 1 : galleryItems.length - 1);
  };

  const handleGalleryTitleKeyDown = (e: React.KeyboardEvent<HTMLHeadingElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openGallery();
    }
  };

  return (
    <section className="relative w-full h-screen min-h-[800px] overflow-hidden bg-[#D6D1C7]">
      <motion.div
        key={artbook.id}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-0 w-full h-full"
      >
          {/* Background Image */}
          <div className="absolute inset-0 z-0 w-full h-full pointer-events-none">
            {isVideoUrl(artbook.imageUrl) ? (
              <video
                ref={videoRef}
                src={artbook.imageUrl}
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                className="absolute inset-0 z-0 w-full h-full min-w-full min-h-full object-cover object-center contrast-[0.8] brightness-[0.9] transform-gpu will-change-transform [backface-visibility:hidden]"
                aria-label={artbook.title}
              />
            ) : (
              <img 
                  src={artbook.imageUrl} 
                  alt={artbook.title} 
                  className="absolute inset-0 z-0 w-full h-full object-cover object-center contrast-[0.8] brightness-[0.9] transform-gpu will-change-transform [backface-visibility:hidden]"
              />
            )}
            <div className="absolute inset-0 z-[1] bg-[#433E38]/30 mix-blend-multiply"></div>
            <div className="absolute inset-0 z-[2] bg-[#313030]/10"></div>
          </div>

          {/* Content */}
          <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-6 pointer-events-none">
            <div className="animate-fade-in-up w-full md:w-auto flex flex-col items-center group">
              <span className="block text-xs md:text-sm font-medium uppercase tracking-[0.2em] text-white/90 mb-6 backdrop-blur-sm bg-white/10 px-4 py-2 rounded-full mx-0 md:mx-auto w-fit">
                {artbook.category}
              </span>
              {galleryHref ? (
                <a
                  href={galleryHref}
                  className="text-6xl md:text-8xl lg:text-9xl font-serif font-normal text-white tracking-tight mb-8 drop-shadow-sm pointer-events-auto cursor-pointer hover:scale-105 hover:text-white/90 transition-all duration-500 relative no-underline"
                >
                  {artbook.title}
                  <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-white/50 group-hover:w-1/2 transition-all duration-500"></span>
                </a>
              ) : (
                <h1
                  className={`text-6xl md:text-8xl lg:text-9xl font-serif font-normal text-white tracking-tight mb-8 drop-shadow-sm relative pointer-events-auto ${
                    hasGalleryPreview ? 'cursor-pointer hover:text-white/90 transition-all duration-500' : ''
                  }`}
                  onClick={hasGalleryPreview ? openGallery : undefined}
                  onKeyDown={hasGalleryPreview ? handleGalleryTitleKeyDown : undefined}
                  role={hasGalleryPreview ? 'button' : undefined}
                  tabIndex={hasGalleryPreview ? 0 : undefined}
                  aria-label={hasGalleryPreview ? `Open ${artbook.title} preview` : undefined}
                >
                  {artbook.title}
                  <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-white/50 group-hover:w-1/2 transition-all duration-500"></span>
                </h1>
              )}
              {galleryHref ? (
                <span className="text-sm font-light tracking-widest uppercase text-white/60 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  Click to view gallery
                </span>
              ) : hasGalleryPreview ? (
                <span className="text-sm font-light tracking-widest uppercase text-white/60 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  Click to open preview
                </span>
              ) : artbook.tagline && (
                <span className="text-sm font-light tracking-widest uppercase text-white/60 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  {artbook.tagline}
                </span>
              )}
            </div>
          </div>
      </motion.div>

      {/* Page Turning Controls */}
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

      {nextHref ? (
        <a
          href={nextHref}
          className="absolute right-8 top-1/2 -translate-y-1/2 z-20 p-4 text-white/70 hover:text-white transition-all duration-500 group cursor-pointer"
          aria-label="Next Page"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 group-hover:translate-x-1 transition-transform">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </a>
      ) : onNext ? (
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
      ) : (
        <div
          aria-hidden="true"
          className="absolute right-8 top-1/2 -translate-y-1/2 z-20 p-4 invisible pointer-events-none"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </div>
      )}

      {/* Gallery Viewer Overlay */}
      {isGalleryOpen && hasGalleryPreview && (
        <div className="fixed inset-0 z-[100] bg-[#1A1A1A] flex items-center justify-center animate-fade-in">
          <button 
            onClick={() => setIsGalleryOpen(false)}
            className="absolute top-8 right-8 text-white/50 hover:text-white z-50 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          {/* Gallery Navigation */}
          <button 
            onClick={handleGalleryPrev}
            className="absolute left-8 top-1/2 -translate-y-1/2 z-50 text-white/50 hover:text-white transition-colors p-4"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          
          <button 
            onClick={handleGalleryNext}
            className="absolute right-8 top-1/2 -translate-y-1/2 z-50 text-white/50 hover:text-white transition-colors p-4"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>

          <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
            <AnimatePresence initial={false} custom={galleryDirection}>
              <motion.div 
                key={currentImageIndex}
                custom={galleryDirection}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={smoothTransition}
                className="absolute w-full h-full flex items-center justify-center"
              >
                {isVideoUrl(currentGalleryItem) ? (
                  <video
                    src={currentGalleryItem}
                    autoPlay
                    loop
                    muted
                    controls
                    playsInline
                    preload="metadata"
                    className="absolute inset-0 z-0 w-full h-full object-cover object-center shadow-2xl transform-gpu will-change-transform [backface-visibility:hidden]"
                    aria-label={`${artbook.title} - Video ${currentImageIndex + 1}`}
                  />
                ) : (
                  <img
                    src={currentGalleryItem}
                    alt={`${artbook.title} - Image ${currentImageIndex + 1}`}
                    className="max-w-[90vw] max-h-[90vh] object-contain shadow-2xl"
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
          
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50 tracking-[0.3em] text-xs uppercase font-medium">
            {currentImageIndex + 1} / {galleryItems.length}
          </div>
        </div>
      )}
    </section>
  );
};

export default ArtbookExhibition;

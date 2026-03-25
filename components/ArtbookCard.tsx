/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import React, { useRef, useState, useEffect } from 'react';
import { Artbook } from '../types';

interface ArtbookCardProps {
  artbook: Artbook;
  href: string;
}

const isVideoUrl = (url: string) => /\.(mp4|webm|ogg)(?:[?#]|$)/i.test(url);

const ArtbookCard: React.FC<ArtbookCardProps> = ({ artbook, href }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { rootMargin: '200px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isVisible) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [isVisible]);

  return (
    <a href={href} className="group flex flex-col gap-6 cursor-pointer">
      <div ref={containerRef} className="relative w-full aspect-[4/5] overflow-hidden bg-[#EBE7DE]">
        {isVideoUrl(artbook.imageUrl) ? (
          <video
            ref={videoRef}
            src={isVisible ? artbook.imageUrl : undefined}
            loop
            muted
            playsInline
            preload="metadata"
            className="w-full h-full object-cover transition-transform duration-1000 ease-in-out group-hover:scale-110 sepia-[0.1]"
            aria-label={artbook.title}
          />
        ) : (
          <img
            src={artbook.imageUrl}
            alt={artbook.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-1000 ease-in-out group-hover:scale-110 sepia-[0.1]"
          />
        )}

        {/* Hover overlay with "Quick View" - minimalistic */}
        <div className="absolute inset-0 bg-[#2C2A26]/0 group-hover:bg-[#2C2A26]/5 transition-colors duration-500 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                <span className="bg-white/90 backdrop-blur text-[#2C2A26] px-6 py-3 rounded-full text-xs uppercase tracking-widest font-medium">
                    Enter Exhibition
                </span>
            </div>
        </div>
      </div>

      <div className="text-center">
        <h3 className="text-2xl font-serif font-medium text-[#2C2A26] mb-1 group-hover:opacity-70 transition-opacity">{artbook.title}</h3>
        <span className="text-sm font-medium text-[#2C2A26] block">{artbook.category}</span>
      </div>
    </a>
  );
};

export default ArtbookCard;

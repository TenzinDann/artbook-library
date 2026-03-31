import React, { useEffect, useState } from 'react';
import type { ArtbookContent } from '../types';
import { getMediaCandidates, isVideoUrl } from '../mediaUrl';

interface ArtbookGallerySectionProps {
  content: ArtbookContent;
}

const GalleryMediaItem: React.FC<{ source: string; index: number }> = ({ source, index }) => {
  const [mediaIndex, setMediaIndex] = useState(0);
  const mediaCandidates = getMediaCandidates(source);
  const currentMedia = mediaCandidates[mediaIndex] ?? '';

  useEffect(() => {
    setMediaIndex(0);
  }, [source]);

  const handleMediaError = () => {
    setMediaIndex((prev) => (prev < mediaCandidates.length - 1 ? prev + 1 : prev));
  };

  return (
    <div className="w-full">
      {isVideoUrl(currentMedia) ? (
        <video
          src={currentMedia}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          onError={handleMediaError}
          className="w-full block object-cover transform-gpu"
        />
      ) : (
        <img
          src={currentMedia}
          alt={`Gallery image ${index + 1}`}
          loading="lazy"
          onError={handleMediaError}
          className="w-full block object-cover"
        />
      )}
    </div>
  );
};

const ArtbookGallerySection: React.FC<ArtbookGallerySectionProps> = ({ content }) => {
  if (!content.images.length) return null;

  return (
    <section className="bg-[#F5F2EB]">
      {content.images.map((src, i) => (
        <GalleryMediaItem key={`${content.slug}-${i}-${src}`} source={src} index={i} />
      ))}
    </section>
  );
};

export default ArtbookGallerySection;

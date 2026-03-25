import React from 'react';
import { ArtbookContent } from '../content/_index';

const isVideoUrl = (url: string) => /\.(mp4|webm|ogg)(?:[?#]|$)/i.test(url);

interface ArtbookGallerySectionProps {
  content: ArtbookContent;
}

const ArtbookGallerySection: React.FC<ArtbookGallerySectionProps> = ({ content }) => {
  if (!content.images.length) return null;

  return (
    <section className="bg-[#F5F2EB]">
      {content.images.map((src, i) => (
        <div key={i} className="w-full">
          {isVideoUrl(src) ? (
            <video
              src={src}
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              className="w-full block object-cover transform-gpu"
            />
          ) : (
            <img
              src={src}
              alt={`Gallery image ${i + 1}`}
              loading="lazy"
              className="w-full block object-cover"
            />
          )}
        </div>
      ))}
    </section>
  );
};

export default ArtbookGallerySection;

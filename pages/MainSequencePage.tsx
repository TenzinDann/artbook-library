/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Footer from '../components/Footer';
import ArtbookExhibition from '../components/ArtbookExhibition';
import { ARTBOOKS } from '../data/artbooks';
import { getArtbookPagePath } from '../sitePaths';

const HOME_VIDEO_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260228_065522_522e2295-ba22-457e-8fdb-fbcd68109c73.mp4';

const imagePreloadCache = new Set<string>();
const videoPreloadCache = new Map<string, HTMLVideoElement>();

const isVideoUrl = (url: string) => /\.(mp4|webm|ogg)(?:[?#]|$)/i.test(url);

const canAggressiveMediaPreload = (): boolean => {
  const networkInfo = (navigator as Navigator & {
    connection?: { saveData?: boolean; effectiveType?: string };
  }).connection;

  if (!networkInfo) {
    return true;
  }

  if (networkInfo.saveData) {
    return false;
  }

  return networkInfo.effectiveType !== 'slow-2g' && networkInfo.effectiveType !== '2g';
};

const preloadMedia = (url?: string) => {
  if (!url) return;

  if (isVideoUrl(url)) {
    if (videoPreloadCache.has(url)) return;
    const video = document.createElement('video');
    video.preload = canAggressiveMediaPreload() ? 'metadata' : 'none';
    video.muted = true;
    video.playsInline = true;
    video.src = url;
    video.load();
    videoPreloadCache.set(url, video);
    return;
  }

  if (imagePreloadCache.has(url)) return;
  imagePreloadCache.add(url);
  const preloadImage = new Image();
  preloadImage.crossOrigin = 'anonymous';
  preloadImage.decoding = 'async';
  preloadImage.src = url;
};

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
  x: { type: 'tween', ease: [0.22, 1, 0.36, 1], duration: 1 },
  opacity: { duration: 1, ease: [0.22, 1, 0.36, 1] }
};

const HOME_INDEX = -1;
const FIRST_ARTBOOK_INDEX = 0;
const LAST_ARTBOOK_INDEX = ARTBOOKS.length - 1;

const MainSequencePage: React.FC<{ slug?: string }> = () => {
  const [currentIndex, setCurrentIndex] = useState<number>(HOME_INDEX);
  const [pageDirection, setPageDirection] = useState(0);
  const currentArtbook = currentIndex >= 0 ? ARTBOOKS[currentIndex] : null;
  const isHomeView = currentIndex === HOME_INDEX;
  const canGoNext = currentIndex >= 0 && currentIndex < LAST_ARTBOOK_INDEX;
  const canGoPrev = currentIndex >= FIRST_ARTBOOK_INDEX;

  useEffect(() => {
    const urlsToPreload = new Set<string>();

    const collectArtbookMedia = (index: number) => {
      const artbook = ARTBOOKS[index];
      if (!artbook) {
        return;
      }
      urlsToPreload.add(artbook.imageUrl);
      if (artbook.gallery?.length) {
        urlsToPreload.add(artbook.gallery[0]);
      }
    };

    if (isHomeView) {
      collectArtbookMedia(FIRST_ARTBOOK_INDEX);
      collectArtbookMedia(FIRST_ARTBOOK_INDEX + 1);
    } else {
      urlsToPreload.add(HOME_VIDEO_URL);
      collectArtbookMedia(currentIndex);
      if (currentIndex > FIRST_ARTBOOK_INDEX) {
        collectArtbookMedia(currentIndex - 1);
      } else {
        urlsToPreload.add(HOME_VIDEO_URL);
      }

      if (currentIndex < LAST_ARTBOOK_INDEX) {
        collectArtbookMedia(currentIndex + 1);
      }
    }

    urlsToPreload.forEach((url) => preloadMedia(url));
  }, [currentIndex, isHomeView]);

  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'auto' });
  const navigateToIndex = (nextIndex: number, direction: number) => {
    setPageDirection(direction);
    setCurrentIndex(nextIndex);
    scrollTop();
  };

  const goToFirstArtbook = () => {
    navigateToIndex(FIRST_ARTBOOK_INDEX, 1);
  };

  const goPrev = () => {
    if (!canGoPrev) {
      return;
    }

    if (currentIndex > FIRST_ARTBOOK_INDEX) {
      navigateToIndex(currentIndex - 1, -1);
      return;
    }

    navigateToIndex(HOME_INDEX, -1);
  };

  const goNext = () => {
    if (!canGoNext) {
      return;
    }

    navigateToIndex(currentIndex + 1, 1);
  };

  return (
    <div className="min-h-screen bg-[#F5F2EB] font-sans text-[#2C2A26] selection:bg-[#D6D1C7] selection:text-[#2C2A26]">
      <Navbar activeKey="home" />

      <main className={`relative w-full overflow-x-hidden ${isHomeView ? 'h-[100svh] overflow-hidden' : ''}`}>
        <AnimatePresence initial={false} custom={pageDirection} mode="popLayout">
          {!currentArtbook && (
            <motion.div
              key="main-home"
              custom={pageDirection}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={smoothTransition}
              className="w-full bg-[#F5F2EB]"
            >
              <Hero videoSrc={HOME_VIDEO_URL} onNext={goToFirstArtbook} />
            </motion.div>
          )}

          {currentArtbook && (
            <motion.div
              key={`main-artbook-${currentArtbook.slug}`}
              custom={pageDirection}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={smoothTransition}
              className="w-full bg-[#D6D1C7]"
            >
              <ArtbookExhibition
                artbook={currentArtbook}
                galleryHref={getArtbookPagePath(currentArtbook.slug)}
                onPrev={goPrev}
                onNext={canGoNext ? goNext : undefined}
              />
              <Footer
                title={currentArtbook.title}
                description={currentArtbook.longDescription || currentArtbook.description}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default MainSequencePage;

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Suspense, lazy } from 'react';

export type PageType = 'main' | 'home' | 'gallery' | 'artbook' | 'about';

interface AppProps {
  pageType: PageType;
  slug?: string;
}

const MainSequencePage = lazy(() => import('./pages/MainSequencePage'));
const GalleryPage = lazy(() => import('./pages/GalleryPage'));
const StandaloneArtbookPage = lazy(() => import('./pages/StandaloneArtbookPage'));
const AboutStandalonePage = lazy(() => import('./pages/AboutStandalonePage'));

const LazyPageFallback: React.FC<{ backgroundClass?: string }> = ({ backgroundClass = 'bg-[#F5F2EB]' }) => (
  <div
    className={`min-h-screen ${backgroundClass} text-[#2C2A26] selection:bg-[#D6D1C7] selection:text-[#2C2A26]`}
    aria-hidden="true"
  />
);

const renderWithSuspense = (content: React.ReactNode, fallbackBackgroundClass?: string) => (
  <Suspense fallback={<LazyPageFallback backgroundClass={fallbackBackgroundClass} />}>
    {content}
  </Suspense>
);

const App: React.FC<AppProps> = ({ pageType, slug }) => {
  if (pageType === 'gallery') {
    return renderWithSuspense(<GalleryPage />, 'bg-[#F5F2EB]');
  }

  if (pageType === 'about') {
    return renderWithSuspense(<AboutStandalonePage />, 'bg-[#F5F2EB]');
  }

  if (pageType === 'artbook') {
    return renderWithSuspense(<StandaloneArtbookPage slug={slug} />, 'bg-[#D6D1C7]');
  }

  return renderWithSuspense(<MainSequencePage />, 'bg-[#F5F2EB]');
};

export default App;

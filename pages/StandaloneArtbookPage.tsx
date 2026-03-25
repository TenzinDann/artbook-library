/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import Navbar from '../components/Navbar';
import ArtbookExhibition from '../components/ArtbookExhibition';
import ArtbookGallerySection from '../components/ArtbookGallerySection';
import Footer from '../components/Footer';
import { ARTBOOKS, getArtbookBySlug } from '../data/artbooks';
import { getContentBySlug } from '../content/_index';

const StandaloneArtbookPage: React.FC<{ slug?: string }> = ({ slug }) => {
  const artbook = getArtbookBySlug(slug ?? '') ?? ARTBOOKS[0];
  const content = getContentBySlug(artbook.slug);

  return (
    <div className="min-h-screen bg-[#D6D1C7] font-sans text-[#2C2A26] selection:bg-[#F5F2EB] selection:text-[#2C2A26]">
      <Navbar />
      <main className="relative w-full">
        <ArtbookExhibition artbook={artbook} />
        {content && <ArtbookGallerySection content={content} />}
        <Footer title={artbook.title} description={artbook.longDescription || artbook.description} />
      </main>
    </div>
  );
};

export default StandaloneArtbookPage;

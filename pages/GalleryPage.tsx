/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import Navbar from '../components/Navbar';
import ArtbookGallery from '../components/ArtbookGallery';
import Footer from '../components/Footer';

const GalleryPage: React.FC<{ slug?: string }> = () => (
  <div className="min-h-screen bg-[#F5F2EB] font-sans text-[#2C2A26] selection:bg-[#D6D1C7] selection:text-[#2C2A26]">
    <Navbar forceSolid activeKey="gallery" />
    <main className="relative w-full">
      <ArtbookGallery />
      <Footer />
    </main>
  </div>
);

export default GalleryPage;

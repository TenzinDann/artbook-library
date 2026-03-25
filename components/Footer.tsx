/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import React from 'react';

interface FooterProps {
  title?: string;
  description?: string;
}

const Footer: React.FC<FooterProps> = ({ title, description }) => {
  return (
    <footer className="bg-[#EBE7DE] pt-12 pb-12 px-6 text-[#5D5A53]">
      <div className="max-w-[1800px] mx-auto">
        <div>
          <h4 className="text-2xl font-serif text-[#2C2A26] mb-4">
            {title || 'Artbook Library'}
          </h4>
          <p className="max-w-3xl font-light leading-relaxed">
            {description || 'A curated collection of visual arts, designed to be experienced with all senses.'}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

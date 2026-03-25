import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

const AboutPage: React.FC = () => (
  <div className="min-h-screen flex flex-col bg-[#F5F2EB] font-sans text-[#2C2A26] selection:bg-[#D6D1C7] selection:text-[#2C2A26]">
    <Navbar forceSolid activeKey="about" />
    <main className="relative w-full flex-1 pt-28 pb-20">
      <div className="max-w-3xl mx-auto px-8">
        <h1 className="font-serif text-4xl md:text-5xl font-medium mt-4 mb-8">About This Website</h1>
        <div className="h-px bg-[#D6D1C7] mb-10"></div>
        <div className="space-y-6 text-[#5D5A53] leading-relaxed">
          <p>
            Welcome to the Artbook Library. This is a curated space where visual art meets
            thoughtful presentation - a personal collection designed to be experienced with
            all senses.
          </p>
          <p>
            I believe that art deserves more than a scroll. Each exhibition here is crafted to
            give every piece the room it needs to breathe, accompanied by music and commentary
            that deepen the experience.
          </p>
          <p>
            Thank you for visiting. I hope you find something here that moves you.
          </p>
        </div>
      </div>
    </main>
    <Footer />
  </div>
);

export default AboutPage;


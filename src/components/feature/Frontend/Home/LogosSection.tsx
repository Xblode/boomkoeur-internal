'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { fadeInUp } from '@/lib/animations';

const LOGOS = [
  { src: '/svg/logo-studio.svg', alt: 'Logo Studio' },
  { src: '/svg/BMKR_Logo.svg', alt: 'BMKR' },
];

export const LogosSection: React.FC = () => {
  return (
    <section className="w-full py-6 px-4 bg-zinc-50 dark:bg-zinc-900">
      <motion.div
        className="max-w-7xl mx-auto w-full"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        variants={fadeInUp}
      >
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-8">
          {LOGOS.map((logo) => {
            const w = 180;
            const h = 48;
            return (
              <div
                key={logo.alt}
                className="flex items-center justify-center h-12 w-44 opacity-70 hover:opacity-100 transition-opacity duration-300 shrink-0"
              >
                <Image
                  src={logo.src}
                  alt={logo.alt}
                  width={w}
                  height={h}
                  className="brightness-0 invert object-contain max-h-12 max-w-full"
                />
              </div>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
};

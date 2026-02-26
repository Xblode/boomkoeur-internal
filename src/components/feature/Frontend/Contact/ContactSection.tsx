'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/atoms';
import { Mail } from 'lucide-react';
import { fadeInUp } from '@/lib/animations';

export const ContactSection: React.FC = () => {
  return (
    <section className="w-full border-t border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
      <motion.div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        variants={fadeInUp}
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-800">
              <Mail size={24} className="text-zinc-600 dark:text-zinc-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Une question ? Besoin d&apos;aide ?
              </h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Notre équipe est à votre disposition pour vous accompagner.
              </p>
            </div>
          </div>
          <Link href="/contact">
            <Button variant="primary" size="lg" className="shrink-0">
              Nous contacter
            </Button>
          </Link>
        </div>
      </motion.div>
    </section>
  );
};

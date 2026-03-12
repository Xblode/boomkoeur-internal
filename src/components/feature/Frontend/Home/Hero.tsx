'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/atoms';
import { fadeInUp, staggerContainer } from '@/lib/animations';
import { ROUTES } from '@/lib/constants';
import { siteConfig } from '@/config/site';
import { HeroDashboardPreview } from './HeroDashboardPreview';

export const Hero: React.FC = () => {
  return (
    <section className="w-full min-h-[110vh] flex flex-col items-center justify-start px-4 py-12 bg-gradient-to-b from-white to-zinc-50 dark:from-black dark:to-zinc-900">
      <motion.div
        className="max-w-7xl mx-auto w-full text-center mb-8 lg:mb-12 flex flex-col items-center"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <motion.h1
          className="text-3xl max-w-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 tracking-tight"
          variants={fadeInUp}
        >
          Gérez vos événements et projets en un seul endroit
        </motion.h1>

        <motion.p
          className="text-base max-w-2xl text-zinc-600 dark:text-zinc-400 mb-8 leading-relaxed"
          variants={fadeInUp}
        >
          Gérez vos événements, votre billetterie, vos finances et vos contacts
          depuis une seule plateforme. Événements, réunions, commercial,
          facturation, stocks et campagnes : tout est connecté pour vous faire
          gagner du temps.
        </motion.p>

        <motion.div className="flex flex-col sm:flex-row gap-3 justify-center" variants={fadeInUp}>
          <Link href={siteConfig.githubRepo} target="_blank" rel="noopener noreferrer">
            <Button variant="primary" size="md">
              Voir sur Github
            </Button>
          </Link>
          <Link href={ROUTES.DEMO}>
            <Button variant="secondary" size="md">
              Voir la démo
            </Button>
          </Link>
        </motion.div>
      </motion.div>

      {/* Preview du dashboard — 1920x1080 */}
      <motion.div
        className="w-full max-w-7xl mx-auto px-2"
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
      >
        <HeroDashboardPreview />
      </motion.div>
    </section>
  );
};

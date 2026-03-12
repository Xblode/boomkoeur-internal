'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/atoms';
import { Badge } from '@/components/ui/atoms';
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/animations';
import { ROUTES } from '@/lib/constants';
import { CampaignPagePreview } from './CampaignPagePreview';

export const CampaignSection: React.FC = () => {
  return (
    <section className="w-full py-16 px-4 bg-zinc-100 dark:bg-zinc-950">
      <motion.div
        className="max-w-7xl mx-auto w-full"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
      >
        <div className="flex flex-col gap-8 lg:gap-12 items-center">
          {/* Texte centré au-dessus */}
          <div className="flex flex-col items-center text-center max-w-2xl">
            <motion.div variants={staggerItem}>
              <Badge variant="secondary" className="mb-4">
                Onglet Campagne
              </Badge>
            </motion.div>

            <motion.h2
              className="text-2xl md:text-3xl font-bold text-foreground mb-4 tracking-tight"
              variants={staggerItem}
            >
              Pilotez votre communication événementielle
            </motion.h2>

            <motion.p
              className="text-base text-zinc-600 dark:text-zinc-400 mb-8 leading-relaxed"
              variants={staggerItem}
            >
              Centralisez tous vos visuels, planifiez vos publications sur les réseaux sociaux
              et suivez les performances de vos campagnes directement depuis la page de votre
              événement.
            </motion.p>

            <motion.div variants={staggerItem}>
              <Link href={ROUTES.DEMO}>
                <Button variant="primary" size="md">
                  Découvrir en démo
                </Button>
              </Link>
            </motion.div>
          </div>

          {/* Illustration en largeur */}
          <motion.div
            className="w-full max-w-7xl"
            variants={fadeInUp}
          >
            <CampaignPagePreview className="max-w-none" />
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

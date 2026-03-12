'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/atoms';
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/animations';
import { ROUTES } from '@/lib/constants';
import { IntegrationsChartPreview } from './IntegrationsChartPreview';

export const IntegrationsSection: React.FC = () => {
  return (
    <section className="w-full py-16 px-4 bg-zinc-50 dark:bg-zinc-900">
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
            <motion.div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-sm font-medium mb-4 w-fit"
              variants={staggerItem}
            >
              <span>Intégrations</span>
            </motion.div>

            <motion.h2
              className="text-2xl md:text-3xl font-bold text-foreground mb-4 tracking-tight"
              variants={staggerItem}
            >
              Connectez vos outils de production
            </motion.h2>

            <motion.p
              className="text-base text-zinc-600 dark:text-zinc-400 mb-8 leading-relaxed"
              variants={staggerItem}
            >
              Instagram et Shotgun sont intégrés pour centraliser vos ventes et vos publications.
              Suivez l&apos;évolution et l&apos;impact de vos campagnes : ventes, CA, posts publiés
              et corrélation entre vos annonces et vos performances.
            </motion.p>

            <motion.div variants={staggerItem}>
              <Link href={ROUTES.DEMO}>
                <Button variant="primary" size="md">
                  Découvrir en démo
                </Button>
              </Link>
            </motion.div>
          </div>

          {/* Illustration chart */}
          <motion.div
            className="w-full max-w-7xl"
            variants={fadeInUp}
          >
            <IntegrationsChartPreview />
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

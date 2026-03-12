'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/atoms';
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/animations';
import { ROUTES } from '@/lib/constants';
import { FinancePagePreview } from './FinancePagePreview';

export const FinanceSection: React.FC = () => {
  return (
    <section className="w-full py-16 px-4 bg-zinc-100 dark:bg-zinc-950">
      <motion.div
        className="max-w-7xl mx-auto w-full"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Illustration à gauche */}
          <motion.div
            className="w-full order-2 lg:order-1"
            variants={fadeInUp}
          >
            <FinancePagePreview />
          </motion.div>

          {/* Texte à droite */}
          <div className="flex flex-col space-y-6 order-1 lg:order-2">
            <motion.div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-sm font-medium w-fit"
              variants={staggerItem}
            >
              <span>Finance</span>
            </motion.div>

            <motion.h2
              className="text-2xl md:text-3xl font-bold text-foreground tracking-tight"
              variants={staggerItem}
            >
              Pilotez votre trésorerie et vos budgets
            </motion.h2>

            <motion.p
              className="text-base text-zinc-600 dark:text-zinc-400 leading-relaxed"
              variants={staggerItem}
            >
              Trésorerie, transactions, budget par projet, factures et bilan : centralisez toute
              la gestion financière de votre association. Suivez l&apos;évolution de votre solde,
              comparez revenus et dépenses, et pilotez vos budgets événement par événement.
            </motion.p>

            <motion.div variants={staggerItem}>
              <Link href={ROUTES.DEMO}>
                <Button variant="primary" size="md">
                  Découvrir en démo
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

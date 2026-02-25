'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '@/lib/animations';
import {
  CalendarDays,
  ClipboardList,
  Users,
  Wallet,
  Package,
  Megaphone,
} from 'lucide-react';

const FEATURES = [
  {
    icon: CalendarDays,
    title: 'Événements',
    description:
      'Créez vos événements, gérez la billetterie Shotgun et vos campagnes.',
  },
  {
    icon: ClipboardList,
    title: 'Réunions',
    description: 'Ordre du jour, comptes rendus et suivi des décisions.',
  },
  {
    icon: Users,
    title: 'Commercial',
    description: 'Contacts, fournisseurs, partenaires et lieux centralisés.',
  },
  {
    icon: Wallet,
    title: 'Finance',
    description: 'Transactions, budgets, factures, trésorerie et bilan.',
  },
  {
    icon: Package,
    title: 'Produits',
    description: 'Catalogue, stocks et variantes pour la merch.',
  },
  {
    icon: Megaphone,
    title: 'Communication',
    description: 'Campagnes, posts et visuels pour vos événements.',
  },
] as const;

export const FeaturesSection: React.FC = () => {
  return (
    <section className="w-full min-h-[40vh] flex flex-col justify-center px-4 py-12 bg-zinc-50 dark:bg-zinc-900">
      <motion.div
        className="max-w-7xl mx-auto w-full"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
      >
        <motion.h2
          className="mb-8 text-2xl font-semibold text-foreground text-left"
          variants={staggerItem}
        >
          Fonctionnalités
        </motion.h2>

        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4"
          variants={staggerContainer}
        >
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                className="p-4 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors flex flex-col items-center text-center min-h-[140px] min-w-0"
                variants={staggerItem}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
              >
                <div className="text-foreground mb-3">
                  <Icon size={28} />
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-1">
                  {feature.title}
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-tight">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </motion.div>
    </section>
  );
};

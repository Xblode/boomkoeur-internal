'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/atoms';
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/animations';
import { Sparkles, Zap, Rocket } from 'lucide-react';

export const Hero: React.FC = () => {
  return (
    <section className="w-full min-h-[80vh] flex items-center justify-center px-4 bg-gradient-to-b from-white to-zinc-50 dark:from-black dark:to-zinc-900">
      <motion.div 
        className="max-w-5xl mx-auto text-center"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <motion.h1 
          className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 tracking-tight"
          variants={fadeInUp}
        >
          Bienvenue sur votre
          <span className="block mt-2 bg-gradient-to-r from-zinc-600 to-zinc-900 dark:from-zinc-400 dark:to-zinc-100 bg-clip-text text-transparent">
            Template Next.js
          </span>
        </motion.h1>
        
        <motion.p 
          className="text-lg md:text-xl text-zinc-600 dark:text-zinc-400 mb-8 max-w-2xl mx-auto leading-relaxed"
          variants={fadeInUp}
        >
          Un template moderne avec architecture Frontend/Backend, système de design atomique,
          et toutes les bonnes pratiques pour démarrer votre projet rapidement.
        </motion.p>

        <motion.div 
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          variants={fadeInUp}
        >
          <Button variant="primary" size="lg">
            Commencer
          </Button>
          <Button variant="outline" size="lg">
            En savoir plus
          </Button>
        </motion.div>

        <motion.div 
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-left"
          variants={staggerContainer}
        >
          <motion.div 
            className="p-6 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
            variants={staggerItem}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
          >
            <div className="text-foreground mb-4">
              <Zap size={32} />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Performance</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Optimisé pour des temps de chargement ultra-rapides avec Next.js 15.
            </p>
          </motion.div>

          <motion.div 
            className="p-6 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
            variants={staggerItem}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
          >
            <div className="text-foreground mb-4">
              <Sparkles size={32} />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Design System</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Architecture atomique avec Atoms, Molecules et Organisms.
            </p>
          </motion.div>

          <motion.div 
            className="p-6 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
            variants={staggerItem}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
          >
            <div className="text-foreground mb-4">
              <Rocket size={32} />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Prêt à l'emploi</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Frontend et Backend séparés avec leurs layouts dédiés.
            </p>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
};

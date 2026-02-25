'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/atoms';
import { fadeInUp, staggerContainer } from '@/lib/animations';
import { ROUTES } from '@/lib/constants';

export const Hero: React.FC = () => {
  return (
    <section className="w-full min-h-[50vh] flex items-center justify-center px-4 py-12 bg-gradient-to-b from-white to-zinc-50 dark:from-black dark:to-zinc-900">
      <motion.div
        className="max-w-7xl mx-auto w-full"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-0">
            {/* Contenu texte à gauche */}
            <div className="p-8 lg:p-12 flex flex-col justify-center text-left min-h-[320px]">
              <motion.h1
                className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 tracking-tight"
                variants={fadeInUp}
              >
                Perret — Gérez vos événements et projets en un seul endroit
              </motion.h1>

              <motion.p
                className="text-lg md:text-xl font-semibold text-foreground/90 mb-4"
                variants={fadeInUp}
              >
                Tout centraliser. Tout piloter.
              </motion.p>

              <motion.p
                className="text-base text-zinc-600 dark:text-zinc-400 mb-8 leading-relaxed"
                variants={fadeInUp}
              >
                Perret vous permet de gérer vos événements, votre billetterie,
                vos finances et vos contacts depuis une seule plateforme.
                Événements, réunions, commercial, facturation, stocks et
                campagnes : tout est connecté pour vous faire gagner du temps.
              </motion.p>

              <motion.div
                className="flex flex-col sm:flex-row gap-4"
                variants={fadeInUp}
              >
                <Link href={ROUTES.LOGIN}>
                  <Button variant="outline" size="lg">
                    Connexion
                  </Button>
                </Link>
                <Link href={ROUTES.REGISTER}>
                  <Button variant="primary" size="lg">
                    S&apos;inscrire
                  </Button>
                </Link>
              </motion.div>
            </div>

            {/* Zone animation à droite
                Idée: 6 mini-cartes flottantes (icônes Événements, Réunions, Commercial, etc.)
                qui orbitent doucement autour d'un point central, avec un léger effet de parallaxe
                au survol. Style "dashboard preview" qui donne une impression de productivité. */}
            <div className="min-h-[280px] lg:min-h-[320px] flex items-center justify-center bg-zinc-50 dark:bg-zinc-900/50 p-8">
              {/* Placeholder pour l'animation */}
              <div className="w-full h-full rounded-lg border-2 border-dashed border-zinc-300 dark:border-zinc-700 flex items-center justify-center text-zinc-400 dark:text-zinc-500 text-sm">
                Zone animation
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

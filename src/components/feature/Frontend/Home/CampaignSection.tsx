'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/animations';
import { Instagram, Facebook, Image as ImageIcon, Calendar, CheckCircle2, Clock, Megaphone, BarChart3 } from 'lucide-react';

export const CampaignSection: React.FC = () => {
  return (
    <section className="w-full py-24 px-4 bg-white dark:bg-black overflow-hidden">
      <motion.div
        className="max-w-7xl mx-auto w-full"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Texte à gauche */}
          <div className="flex flex-col justify-center text-left order-2 lg:order-1">
            <motion.div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 text-sm font-medium mb-6 w-fit"
              variants={fadeInUp}
            >
              <Megaphone size={16} />
              <span>Onglet Campagne</span>
            </motion.div>

            <motion.h2
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 tracking-tight"
              variants={fadeInUp}
            >
              Pilotez votre communication événementielle
            </motion.h2>

            <motion.p
              className="text-lg text-zinc-600 dark:text-zinc-400 mb-8 leading-relaxed"
              variants={fadeInUp}
            >
              Centralisez tous vos visuels, planifiez vos publications sur les réseaux sociaux et suivez les performances de vos campagnes directement depuis la page de votre événement.
            </motion.p>

            <motion.ul className="space-y-4" variants={staggerContainer}>
              {[
                {
                  icon: Calendar,
                  title: 'Calendrier éditorial',
                  desc: 'Planifiez vos posts Instagram, Facebook et autres réseaux à l\'avance.',
                },
                {
                  icon: ImageIcon,
                  title: 'Visuels centralisés',
                  desc: 'Stockez et partagez facilement les assets graphiques avec votre équipe.',
                },
                {
                  icon: BarChart3,
                  title: 'Suivi des performances',
                  desc: 'Analysez l\'impact de vos annonces et ajustez votre stratégie.',
                },
              ].map((item, i) => (
                <motion.li key={i} className="flex gap-4" variants={staggerItem}>
                  <div className="mt-1 w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center shrink-0 text-zinc-700 dark:text-zinc-300">
                    <item.icon size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{item.title}</h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">{item.desc}</p>
                  </div>
                </motion.li>
              ))}
            </motion.ul>
          </div>

          {/* Frame d'écran à droite */}
          <motion.div
            className="relative order-1 lg:order-2"
            variants={fadeInUp}
          >
            {/* Décoration d'arrière-plan */}
            <div className="absolute -inset-4 bg-gradient-to-tr from-cyan-500/20 to-purple-500/20 blur-3xl rounded-full opacity-50 dark:opacity-20" />

            {/* Fenêtre macOS */}
            <div className="relative rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-2xl overflow-hidden">
              {/* Barre de titre */}
              <div className="flex items-center px-4 h-12 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400 dark:bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-400 dark:bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-green-400 dark:bg-green-500" />
                </div>
                <div className="mx-auto px-4 py-1 rounded-md bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-500 font-medium flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  app.perret.fr/events/campagne
                </div>
              </div>

              {/* Contenu du mockup */}
              <div className="p-6 bg-zinc-50/50 dark:bg-zinc-900/20">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-foreground">Campagne de Lancement</h3>
                    <p className="text-sm text-zinc-500">Festival d'été 2026</p>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    En cours
                  </div>
                </div>

                {/* Grille de posts */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Post 1 */}
                  <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 text-pink-600 dark:text-pink-400">
                        <Instagram size={18} />
                        <span className="text-xs font-semibold">Instagram</span>
                      </div>
                      <span className="text-xs text-zinc-500 flex items-center gap-1">
                        <CheckCircle2 size={14} className="text-green-500" />
                        Publié
                      </span>
                    </div>
                    <div className="w-full h-24 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-3">
                      <ImageIcon size={24} className="text-zinc-400" />
                    </div>
                    <p className="text-sm font-medium text-foreground truncate">Annonce Line-up</p>
                    <p className="text-xs text-zinc-500 mt-1">12 Mai • 18:00</p>
                  </div>

                  {/* Post 2 */}
                  <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                        <Facebook size={18} />
                        <span className="text-xs font-semibold">Facebook</span>
                      </div>
                      <span className="text-xs text-zinc-500 flex items-center gap-1">
                        <Clock size={14} className="text-amber-500" />
                        Planifié
                      </span>
                    </div>
                    <div className="w-full h-24 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-3">
                      <ImageIcon size={24} className="text-zinc-400" />
                    </div>
                    <p className="text-sm font-medium text-foreground truncate">Ouverture Billetterie</p>
                    <p className="text-xs text-zinc-500 mt-1">15 Mai • 12:00</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/atoms';
import { fadeInUp, staggerContainer } from '@/lib/animations';
import { ROUTES } from '@/lib/constants';
import { cn } from '@/lib/utils';
import {
  CalendarDays,
  ClipboardList,
  Users,
  Wallet,
  Package,
  Megaphone,
} from 'lucide-react';

const CARDS = [
  {
    title: 'Événements',
    icon: CalendarDays,
    className: 'text-blue-500',
    pos: { x: -220, y: -50, z: 15, rotateX: 10, rotateY: 35, rotateZ: -10 },
    duration: 3.5,
  },
  {
    title: 'Réunions',
    icon: ClipboardList,
    className: 'text-purple-500',
    pos: { x: -20, y: -170, z: -60, rotateX: 45, rotateY: 0, rotateZ: 15 },
    duration: 4.2,
  },
  {
    title: 'Commercial',
    icon: Users,
    className: 'text-emerald-500',
    pos: { x: -50, y: 20, z: 40, rotateX: 55, rotateY: 0, rotateZ: -20 },
    duration: 3.8,
  },
  {
    title: 'Finance',
    icon: Wallet,
    className: 'text-amber-500',
    pos: { x: -100, y: 200, z: 50, rotateX: 65, rotateY: 0, rotateZ: 25 },
    duration: 4.5,
  },
  {
    title: 'Produits',
    icon: Package,
    className: 'text-rose-500',
    pos: { x: 200, y: 80, z: 70, rotateX: 10, rotateY: -35, rotateZ: 15 },
    duration: 3.6,
  },
  {
    title: 'Communication',
    icon: Megaphone,
    className: 'text-cyan-500',
    pos: { x: 180, y: -110, z: -30, rotateX: 20, rotateY: -25, rotateZ: -5 },
    duration: 4.0,
  },
];

const MOBILE_POS_SCALE = 0.4; // Rapproche les cartes sur mobile

export const Hero: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1023px)');
    const set = () => setIsMobile(mq.matches);
    set();
    mq.addEventListener('change', set);
    return () => mq.removeEventListener('change', set);
  }, []);

  const getPos = (pos: (typeof CARDS)[0]['pos']) => ({
    x: isMobile ? pos.x * MOBILE_POS_SCALE : pos.x,
    y: isMobile ? pos.y * MOBILE_POS_SCALE : pos.y,
    z: pos.z,
    rotateX: pos.rotateX,
    rotateY: pos.rotateY,
    rotateZ: pos.rotateZ,
  });

  return (
    <section className="w-full min-h-[50vh] flex items-center justify-center px-4 py-12 bg-gradient-to-b from-white to-zinc-50 dark:from-black dark:to-zinc-900">
      <motion.div
        className="max-w-7xl mx-auto w-full"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <div className="relative rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-lg overflow-visible">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-0">
            {/* Contenu texte à gauche */}
            <div className="p-8 lg:p-12 flex flex-col justify-center text-left min-h-[320px] overflow-hidden rounded-l-2xl">
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
                <Link href={ROUTES.DEMO}>
                  <Button variant="primary" size="lg">
                    Essayer la démo
                  </Button>
                </Link>
                <Link href={ROUTES.REGISTER}>
                  <Button variant="outline" size="lg">
                    Commencer
                  </Button>
                </Link>
              </motion.div>
            </div>

            {/* Zone animation 3D à droite */}
            <div className="relative min-h-[420px] lg:min-h-[520px] flex items-center justify-center bg-zinc-50/50 dark:bg-zinc-900/20 p-8 overflow-visible">
              <div 
                className="relative w-full h-full flex items-center justify-center scale-100 min-w-[320px] min-h-[320px] lg:min-w-[420px] lg:min-h-[420px]" 
                style={{ perspective: '1400px' }}
              >
                {CARDS.map((card, i) => {
                  const pos = getPos(card.pos);
                  const bounceOffset = isMobile ? 8 : 15;
                  return (
                  <motion.div
                    key={card.title}
                    initial={{
                      x: pos.x,
                      y: pos.y,
                      z: pos.z,
                      rotateX: pos.rotateX,
                      rotateY: pos.rotateY,
                      rotateZ: pos.rotateZ,
                    }}
                    animate={{
                      y: [pos.y, pos.y - bounceOffset, pos.y],
                    }}
                    transition={{
                      duration: card.duration,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: i * 0.2,
                    }}
                    className="absolute w-44 h-52 rounded-2xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-white dark:border-zinc-700 shadow-[0_25px_50px_-15px_rgba(0,0,0,0.2)] dark:shadow-[0_25px_50px_-15px_rgba(0,0,0,0.6)] flex flex-col items-center justify-center gap-4 p-5"
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    <div className={cn("p-4 rounded-xl bg-zinc-100 dark:bg-zinc-950 shadow-inner", card.className)}>
                      <card.icon size={34} strokeWidth={2.5} />
                    </div>
                    <span className="font-semibold text-zinc-700 dark:text-zinc-200 text-base text-center leading-tight">
                      {card.title}
                    </span>
                  </motion.div>
                );
                })}
              </div>
            </div>
            
          </div>
        </div>
      </motion.div>
    </section>
  );
};

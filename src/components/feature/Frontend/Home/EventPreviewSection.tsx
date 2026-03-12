'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/atoms';
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/animations';
import { ROUTES } from '@/lib/constants';
import { EventPagePreview, type EventPageVariant } from './EventPagePreview';

const EVENT_VARIANTS: EventPageVariant[] = [
  'info',
  'campagne',
  'artistes',
  'planning',
  'billetterie',
  'point-de-ventes',
  'liens',
];

const VARIANT_LABELS: Record<EventPageVariant, string> = {
  info: 'Informations générales',
  campagne: 'Campagne de communication',
  artistes: 'Line-up et artistes',
  planning: 'Planning éditorial',
  billetterie: 'Billetterie Shotgun',
  'point-de-ventes': 'Points de vente',
  liens: 'Éléments liés',
};

const ROTATION_INTERVAL_MS = 10000;

export const EventPreviewSection: React.FC = () => {
  const [activeVariant, setActiveVariant] = useState<EventPageVariant>(EVENT_VARIANTS[0]);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveVariant((prev) => {
        const idx = EVENT_VARIANTS.indexOf(prev);
        const next = (idx + 1) % EVENT_VARIANTS.length;
        return EVENT_VARIANTS[next];
      });
    }, ROTATION_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="w-full py-16 px-4 bg-zinc-50 dark:bg-zinc-900">
      <motion.div
        className="max-w-7xl mx-auto w-full"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Texte à gauche */}
          <div className="space-y-6">
            <motion.h2
              className="text-2xl md:text-3xl font-bold text-foreground tracking-tight"
              variants={staggerItem}
            >
              Une page Event complète
            </motion.h2>

            <motion.p
              className="text-base text-zinc-600 dark:text-zinc-400 leading-relaxed"
              variants={staggerItem}
            >
              Chaque événement dispose d&apos;une page dédiée qui centralise tout : informations
              générales, campagne de communication, line-up, planning éditorial, billetterie
              Shotgun, points de vente et éléments liés.
            </motion.p>

            <motion.div variants={staggerItem}>
              <Link href={ROUTES.DEMO}>
                <Button variant="primary" size="lg">
                  Découvrir en démo
                </Button>
              </Link>
            </motion.div>
          </div>

          {/* Illustration à droite — rotation toutes les 10s */}
          <motion.div
            className="w-full"
            variants={fadeInUp}
          >
            <EventPagePreview
              variant={activeVariant}
              onSectionChange={setActiveVariant}
            />
            <p className="mt-2 text-center text-xs text-muted-foreground">
              {VARIANT_LABELS[activeVariant]} — cliquez pour changer ou attendez 10 s
            </p>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

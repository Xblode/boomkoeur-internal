'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/atoms';
import { fadeInUp } from '@/lib/animations';
import { ROUTES } from '@/lib/constants';

export const CTASection: React.FC = () => {
  return (
    <section className="w-full flex flex-col justify-center px-4 py-16 bg-white dark:bg-zinc-950">
      <motion.div
        className="max-w-7xl mx-auto w-full text-center"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        variants={fadeInUp}
      >
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
          Prêt à simplifier votre gestion ?
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-8 max-w-xl mx-auto">
          Rejoignez Perret et centralisez vos événements, finances et contacts en
          un seul endroit.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href={ROUTES.REGISTER}>
            <Button variant="primary" size="lg">
              Créer un compte
            </Button>
          </Link>
          <Link href="/contact">
            <Button variant="outline" size="lg">
              Nous contacter
            </Button>
          </Link>
        </div>
      </motion.div>
    </section>
  );
};

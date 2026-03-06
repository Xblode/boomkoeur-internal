'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/atoms';
import { fadeInUp } from '@/lib/animations';
import { siteConfig } from '@/config/site';
import { Github } from 'lucide-react';

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
          Open source — Déployez votre propre instance
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-8 max-w-xl mx-auto">
          Perret est open source. Clonez le repo, déployez votre instance et
          gérez vos événements, finances et campagnes en toute autonomie.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href={siteConfig.githubRepo}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex"
          >
            <Button variant="primary" size="lg" className="gap-2">
              <Github size={20} />
              Voir sur GitHub
            </Button>
          </a>
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

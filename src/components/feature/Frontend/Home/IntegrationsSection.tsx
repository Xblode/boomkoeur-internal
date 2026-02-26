'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/animations';
import { Switch } from '@/components/ui/atoms';
import { Plug2, Film, CheckCircle2, Clock, AlertCircle, Zap, Webhook, Database } from 'lucide-react';

const SHOTGUN_MOCK_ROWS = [
  { id: '001', name: 'Affiche_Festival_v3', status: 'approved', assignee: 'Marie D.' },
  { id: '002', name: 'Visuel_Line-up_Final', status: 'in_review', assignee: 'Thomas L.' },
  { id: '003', name: 'Storyboard_Scene_01', status: 'wip', assignee: 'Julie M.' },
];

const OTHER_INTEGRATIONS = [
  { icon: Webhook, label: 'API REST', desc: 'Connectez vos outils via webhooks et endpoints.' },
  { icon: Database, label: 'Export de données', desc: 'Exportez vos événements et contacts en CSV/Excel.' },
  { icon: Zap, label: 'Automatisations', desc: 'Déclenchez des actions selon vos règles métier.' },
];

export const IntegrationsSection: React.FC = () => {
  const [shotgunActive, setShotgunActive] = useState(true);

  return (
    <section className="w-full py-24 px-4 bg-zinc-50 dark:bg-zinc-900 overflow-hidden">
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
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-sm font-medium mb-6 w-fit"
              variants={fadeInUp}
            >
              <Plug2 size={16} />
              <span>Intégrations</span>
            </motion.div>

            <motion.h2
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 tracking-tight"
              variants={fadeInUp}
            >
              Connectez vos outils de production
            </motion.h2>

            <motion.p
              className="text-lg text-zinc-600 dark:text-zinc-400 mb-8 leading-relaxed"
              variants={fadeInUp}
            >
              Synchronisez vos événements avec Shotgun pour un suivi unifié de vos projets créatifs. Billetterie, campagnes et assets centralisés dans votre pipeline.
            </motion.p>

            {/* Switch Shotgun / Autres */}
            <motion.div className="flex flex-col gap-4" variants={fadeInUp}>
              <div className="flex items-center gap-4">
                <Switch
                  checked={shotgunActive}
                  onCheckedChange={setShotgunActive}
                />
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">
                    {shotgunActive ? 'Shotgun activé' : 'Autres intégrations'}
                  </span>
                  <span className="text-xs text-zinc-500">
                    {shotgunActive ? 'Sync billetterie & assets' : 'API, exports, webhooks'}
                  </span>
                </div>
              </div>
            </motion.div>

            <AnimatePresence mode="wait">
              {shotgunActive ? (
                <motion.ul
                  key="shotgun"
                  className="space-y-4 mt-6"
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                >
                  {[
                    { label: 'Billetterie synchronisée', desc: 'Ventes et places liées à vos shots et versions.' },
                    { label: 'Assets centralisés', desc: 'Visuels et médias partagés entre Perret et Shotgun.' },
                    { label: 'Statuts unifiés', desc: 'Approved, In Review, WIP visibles dans les deux outils.' },
                  ].map((item, i) => (
                    <motion.li key={i} className="flex gap-4" variants={staggerItem}>
                      <div className="mt-1 w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0 text-amber-600 dark:text-amber-400">
                        <Film size={20} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{item.label}</h3>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">{item.desc}</p>
                      </div>
                    </motion.li>
                  ))}
                </motion.ul>
              ) : (
                <motion.ul
                  key="autres"
                  className="space-y-4 mt-6"
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                >
                  {OTHER_INTEGRATIONS.map((item, i) => (
                    <motion.li key={i} className="flex gap-4" variants={staggerItem}>
                      <div className="mt-1 w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 text-zinc-700 dark:text-zinc-300">
                        <item.icon size={20} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{item.label}</h3>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">{item.desc}</p>
                      </div>
                    </motion.li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>

          {/* Mockup Shotgun / Autres à droite */}
          <motion.div className="relative order-1 lg:order-2" variants={fadeInUp}>
            <div className="absolute -inset-4 bg-gradient-to-tr from-amber-500/20 to-orange-500/20 blur-3xl rounded-full opacity-50 dark:opacity-20" />

            <AnimatePresence mode="wait">
              {shotgunActive ? (
                <motion.div
                  key="shotgun-mock"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                  className="relative rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-900 shadow-2xl overflow-hidden"
                >
                  {/* Barre titre style Shotgun */}
                  <div className="flex items-center justify-between px-4 h-11 border-b border-zinc-700 bg-zinc-800/80">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-amber-500" />
                      <span className="text-sm font-medium text-zinc-300">Shotgun • Perret Sync</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                      <span className="px-2 py-0.5 rounded bg-zinc-700/50">Projet actif</span>
                    </div>
                  </div>

                  {/* Panel Shotgun */}
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Versions</span>
                      <span className="text-xs text-zinc-500">• Événement Festival 2026</span>
                    </div>

                    {/* Grille style pipeline Shotgun */}
                    <div className="rounded-lg border border-zinc-700 overflow-hidden">
                      <div className="grid grid-cols-12 gap-2 px-3 py-2 bg-zinc-800/60 text-xs font-medium text-zinc-400 uppercase tracking-wider">
                        <div className="col-span-1">#</div>
                        <div className="col-span-5">Nom</div>
                        <div className="col-span-3">Statut</div>
                        <div className="col-span-3">Assigné</div>
                      </div>
                      {SHOTGUN_MOCK_ROWS.map((row, i) => (
                        <div
                          key={row.id}
                          className="grid grid-cols-12 gap-2 px-3 py-2.5 border-t border-zinc-700/50 hover:bg-zinc-800/40 transition-colors items-center"
                        >
                          <div className="col-span-1 text-xs text-zinc-500 font-mono">{row.id}</div>
                          <div className="col-span-5 text-sm text-zinc-200 truncate">{row.name}</div>
                          <div className="col-span-3">
                            {row.status === 'approved' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                                <CheckCircle2 size={12} />
                                Approved
                              </span>
                            )}
                            {row.status === 'in_review' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                <Clock size={12} />
                                In Review
                              </span>
                            )}
                            {row.status === 'wip' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
                                <AlertCircle size={12} />
                                WIP
                              </span>
                            )}
                          </div>
                          <div className="col-span-3 text-xs text-zinc-400">{row.assignee}</div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-3 flex items-center gap-2 text-xs text-zinc-500">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      Sync billetterie en temps réel
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="autres-mock"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                  className="relative rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-2xl overflow-hidden"
                >
                  <div className="flex items-center px-4 h-12 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-400" />
                      <div className="w-3 h-3 rounded-full bg-amber-400" />
                      <div className="w-3 h-3 rounded-full bg-green-400" />
                    </div>
                    <div className="mx-auto px-4 py-1 rounded-md bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-500 font-medium">
                      api.perret.fr/integrations
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    {OTHER_INTEGRATIONS.map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-4 p-4 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800"
                      >
                        <div className="w-10 h-10 rounded-lg bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-400">
                          <item.icon size={20} />
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground">{item.label}</h4>
                          <p className="text-sm text-zinc-500">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

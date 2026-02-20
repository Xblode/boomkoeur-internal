import React from 'react';

export const AboutContent: React.FC = () => {
  return (
    <section className="w-full py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
          À propos de nous
        </h1>
        
        <div className="prose prose-zinc dark:prose-invert max-w-none">
          <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-6 leading-relaxed">
            Cette page présente votre entreprise, votre mission, et vos valeurs.
            Personnalisez ce contenu selon vos besoins.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
            <div className="p-6 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
              <h3 className="text-xl font-semibold text-foreground mb-3">Notre Mission</h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                Fournir des solutions de qualité qui répondent aux besoins de nos clients.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
              <h3 className="text-xl font-semibold text-foreground mb-3">Nos Valeurs</h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                Excellence, innovation et satisfaction client au cœur de tout ce que nous faisons.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

'use client';

import React, { useState } from 'react';
import { FormField } from '@/components/ui/molecules';
import { Button, Label, Textarea } from '@/components/ui/atoms';

export const ContactForm: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Logique de soumission du formulaire à implémenter
    console.log('Form submitted:', formData);
    alert('Message envoyé ! (simulation)');
  };

  return (
    <section className="w-full py-20 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 text-center">
          Contactez-nous
        </h1>
        
        <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-12 text-center">
          Nous sommes là pour vous aider. Envoyez-nous un message et nous vous répondrons rapidement.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <FormField
            label="Nom"
            htmlFor="name"
            required
            inputProps={{
              type: 'text',
              id: 'name',
              value: formData.name,
              onChange: (e) => setFormData({ ...formData, name: e.target.value }),
              placeholder: 'Votre nom',
              required: true,
            }}
          />

          <FormField
            label="Email"
            htmlFor="email"
            required
            inputProps={{
              type: 'email',
              id: 'email',
              value: formData.email,
              onChange: (e) => setFormData({ ...formData, email: e.target.value }),
              placeholder: 'votre@email.com',
              required: true,
            }}
          />

          <div className="flex flex-col">
            <Label htmlFor="message" className="block text-sm font-medium text-foreground mb-1.5">
              Message <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Votre message..."
              required
              rows={6}
              className="px-4 py-2.5 border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-foreground rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-foreground focus:border-foreground w-full"
            />
          </div>

          <Button type="submit" variant="primary" size="lg" className="w-full">
            Envoyer le message
          </Button>
        </form>
      </div>
    </section>
  );
};

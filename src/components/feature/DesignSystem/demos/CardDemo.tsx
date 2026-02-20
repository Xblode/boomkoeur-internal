import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/molecules';
import { Button } from '@/components/ui/atoms';
import { User, CreditCard, Activity, TrendingUp, Check, Image as ImageIcon } from 'lucide-react';

export const CardDemo = () => {
  return (
    <div className="space-y-12 p-4">
      
      {/* 1. Standard UI Cards */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold border-b border-border-custom pb-2">Cartes Standards</h3>
        <p className="text-sm text-zinc-500 mb-6">Utilisation classique avec Header, Content et Footer inclus dans le cadre.</p>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Simple Card */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>Carte Simple</CardTitle>
              <CardDescription>Une structure basique pour tout contenu.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <p className="text-sm text-zinc-600 dark:text-zinc-300">
                Voici un exemple de carte standard. Le titre et la description sont à l'intérieur de la bordure.
                Idéal pour des grilles de contenu ou des tableaux de bord.
              </p>
            </CardContent>
            <CardFooter>
              <Button size="sm" variant="outline">En savoir plus</Button>
            </CardFooter>
          </Card>

          {/* Action Card */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>Notification</CardTitle>
              <CardDescription>Gérez vos préférences de notification.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="flex items-center gap-4 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
                  <User size={20} />
                </div>
                <div>
                  <p className="text-sm font-medium">Nouveau message</p>
                  <p className="text-xs text-zinc-500">Il y a 2 minutes</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button size="sm" variant="ghost">Ignorer</Button>
              <Button size="sm">Voir</Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* 2. Stats / Dashboard Cards */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold border-b border-border-custom pb-2">Cartes de Statistiques</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between space-y-0 pb-2">
                <p className="text-sm font-medium text-zinc-500">Revenus Totaux</p>
                <CreditCard className="h-4 w-4 text-zinc-400" />
              </div>
              <div className="text-2xl font-bold">45,231.89 €</div>
              <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1">
                <span className="text-green-500 flex items-center">+20.1%</span> depuis le mois dernier
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between space-y-0 pb-2">
                <p className="text-sm font-medium text-zinc-500">Abonnements</p>
                <User className="h-4 w-4 text-zinc-400" />
              </div>
              <div className="text-2xl font-bold">+2350</div>
              <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1">
                <span className="text-green-500 flex items-center">+180.1%</span> depuis le mois dernier
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between space-y-0 pb-2">
                <p className="text-sm font-medium text-zinc-500">Activité</p>
                <Activity className="h-4 w-4 text-zinc-400" />
              </div>
              <div className="text-2xl font-bold">+12,234</div>
              <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1">
                <span className="text-red-500 flex items-center">-4.5%</span> depuis hier
              </p>
            </CardContent>
          </Card>

        </div>
      </div>

      {/* 3. Section / Settings Style Cards */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold border-b border-border-custom pb-2">Cartes de Section (Paramètres)</h3>
        <p className="text-sm text-zinc-500 mb-6">
          Utilise les props <code>title</code> et <code>description</code> directement sur le composant Card.
          Le titre s'affiche à l'extérieur, idéal pour les pages de configuration.
        </p>
        
        <Card 
          title="Préférences du compte" 
          description="Gérez les paramètres liés à votre compte utilisateur."
        >
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">Langue</p>
                <p className="text-xs text-zinc-500">La langue utilisée dans l'interface.</p>
              </div>
              <Button variant="outline" size="sm">Français</Button>
            </div>
            <div className="my-4 h-px bg-border-custom w-full" />
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">Authentification à deux facteurs</p>
                <p className="text-xs text-zinc-500">Ajoute une couche de sécurité supplémentaire.</p>
              </div>
              <Button variant="outline" size="sm">Configurer</Button>
            </div>
          </CardContent>
          <CardFooter className="bg-zinc-50/50 dark:bg-zinc-800/50 border-t border-border-custom flex justify-end">
            <Button size="sm">Sauvegarder</Button>
          </CardFooter>
        </Card>
      </div>

      {/* 4. Other Examples */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold border-b border-border-custom pb-2">Autres Exemples</h3>
        
        <div className="grid md:grid-cols-3 gap-6">
          
          {/* Image Card */}
          <Card className="overflow-hidden flex flex-col">
            <div className="h-48 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400">
              <ImageIcon size={48} />
            </div>
            <CardHeader>
              <CardTitle>Article de blog</CardTitle>
              <CardDescription>Publié le 12 Mars 2024</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <p className="text-sm text-zinc-600 dark:text-zinc-300">
                Découvrez les dernières nouveautés de notre plateforme et comment elles peuvent améliorer votre productivité.
              </p>
            </CardContent>
            <CardFooter>
              <Button size="sm" variant="outline" className="w-full">Lire l'article</Button>
            </CardFooter>
          </Card>

          {/* Pricing Card */}
          <Card className="flex flex-col border-zinc-900 dark:border-zinc-100 shadow-md">
            <CardHeader>
              <CardTitle>Pro Plan</CardTitle>
              <CardDescription>Pour les équipes en croissance</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
              <div className="text-3xl font-bold">29€<span className="text-sm font-normal text-zinc-500">/mois</span></div>
              <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-300">
                <li className="flex items-center gap-2"><Check size={16} className="text-green-500" /> Utilisateurs illimités</li>
                <li className="flex items-center gap-2"><Check size={16} className="text-green-500" /> 20GB de stockage</li>
                <li className="flex items-center gap-2"><Check size={16} className="text-green-500" /> Support prioritaire</li>
                <li className="flex items-center gap-2"><Check size={16} className="text-green-500" /> API Access</li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Choisir ce plan</Button>
            </CardFooter>
          </Card>

          {/* Profile Card */}
          <Card className="flex flex-col items-center text-center">
            <CardHeader className="pb-2">
              <div className="w-24 h-24 rounded-full bg-zinc-100 dark:bg-zinc-800 mx-auto flex items-center justify-center mb-4">
                <User size={48} className="text-zinc-400" />
              </div>
              <CardTitle>Sophie Martin</CardTitle>
              <CardDescription>Product Designer</CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <p className="text-sm text-zinc-600 dark:text-zinc-300">
                Passionnée par l'expérience utilisateur et les interfaces minimalistes.
              </p>
            </CardContent>
            <CardFooter className="pt-4">
              <div className="flex gap-2">
                <Button size="sm" variant="outline">Message</Button>
                <Button size="sm">Suivre</Button>
              </div>
            </CardFooter>
          </Card>

        </div>
      </div>

    </div>
  );
};

export default CardDemo;

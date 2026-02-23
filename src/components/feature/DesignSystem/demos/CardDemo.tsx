import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, SettingsCardRow, CardDateBadge } from '@/components/ui/molecules';
import { Button, Badge, IconButton } from '@/components/ui/atoms';
import { User, CreditCard, Activity, TrendingUp, Check, Image as ImageIcon, Clock, ListChecks, CalendarDays } from 'lucide-react';

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

      {/* 2. Variant Outline */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold border-b border-border-custom pb-2">Variant Outline</h3>
        <p className="text-sm text-zinc-500 mb-6">
          Fond transparent, bordure uniquement. Idéal pour les sections légères, KPI, graphiques ou comparaisons.
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          <Card variant="outline">
            <CardContent className="p-4 space-y-2">
              <p className="text-sm font-medium text-zinc-500">Solde actuel</p>
              <p className="text-2xl font-bold text-green-500">12 450 €</p>
            </CardContent>
          </Card>
          <Card variant="outline">
            <CardContent className="p-4 space-y-2">
              <p className="text-sm font-medium text-zinc-500">Tendance</p>
              <p className="text-2xl font-bold">+8,2 %</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 3. Stats / Dashboard Cards */}
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

      {/* 4. Variant Settings (Apparence, Admin) */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold border-b border-border-custom pb-2">Variant Settings</h3>
        <p className="text-sm text-zinc-500 mb-6">
          Pour les pages paramètres (Apparence, Admin, Profile). Utilise <code>variant="settings"</code> avec
          <code>SettingsCardRow</code> pour les lignes label + contrôle.
        </p>
        
        <Card 
          variant="settings"
          title="Préférences du compte" 
          description="Gérez les paramètres liés à votre compte utilisateur."
        >
          <CardContent className="p-0 divide-y divide-border-custom">
            <SettingsCardRow label="Langue" description="La langue utilisée dans l'interface.">
              <Button variant="outline" size="sm">Français</Button>
            </SettingsCardRow>
            <SettingsCardRow label="Authentification à deux facteurs" description="Ajoute une couche de sécurité supplémentaire.">
              <Button variant="outline" size="sm">Configurer</Button>
            </SettingsCardRow>
          </CardContent>
          <CardFooter className="bg-zinc-50/50 dark:bg-zinc-800/50 border-t border-border-custom flex justify-end">
            <Button size="sm">Sauvegarder</Button>
          </CardFooter>
        </Card>
      </div>

      {/* 5. Cards liste (Products, Events, Meetings) */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold border-b border-border-custom pb-2">Cartes liste (Products, Events, Meetings)</h3>
        <p className="text-sm text-zinc-500 mb-6">
          Utilisez <code>variant="list"</code> pour les grilles Product, Event, Meeting. Fond sombre, bordure zinc-800.
        </p>

        <div className="space-y-6">
          <div>
            <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">ProductCard</h4>
            <p className="text-xs text-zinc-500 mb-3">
              Image carrée (aspect-square), titre + <code className="text-xs">Badge</code> statut, SKU/type, tags, prix + stock, footer (commentaires + Edit/Delete).
            </p>
            <Card variant="list" className="group relative overflow-hidden transition-all duration-300 cursor-pointer flex flex-col h-full hover:shadow-xl max-w-xs">
              <CardContent className="p-0 flex flex-col h-full">
                <div className="p-2">
                  <div className="relative w-full aspect-square overflow-hidden rounded-lg bg-zinc-800 flex items-center justify-center">
                    <ImageIcon size={32} className="text-zinc-600" />
                  </div>
                </div>
                <div className="p-4 pb-3">
                  <div className="flex items-start gap-2 mb-1">
                    <h3 className="flex-1 font-bold text-base text-white leading-tight line-clamp-2 min-w-0">T-shirt Boomkoeur</h3>
                    <Badge variant="success" className="flex-shrink-0 shadow-none">Disponible</Badge>
                  </div>
                  <p className="text-xs text-zinc-500 font-mono">SKU-001 · T-shirt</p>
                </div>
                <div className="px-4 pb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-white">24,00 €</span>
                    <span className="text-xs text-zinc-400">50 unités</span>
                  </div>
                </div>
                <div className="mt-auto px-4 py-3 border-t border-zinc-800 flex items-center justify-between">
                  <span className="text-sm text-zinc-400">0 commentaires</span>
                  <div className="flex gap-1">
                    <IconButton icon={<User size={14} />} ariaLabel="Éditer" variant="ghost" size="sm" className="p-2 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-700" />
                    <IconButton icon={<CreditCard size={14} />} ariaLabel="Supprimer" variant="ghost" size="sm" className="p-2 rounded-md text-zinc-400 hover:text-red-400 hover:bg-zinc-700" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">EventCard</h4>
            <p className="text-xs text-zinc-500 mb-3">
              Image paysage (aspect-video 16:9), titre + <code className="text-xs">Badge</code> statut + lieu, bloc date (mois/jour), tags/artistes/horaires, footer (commentaires + Edit/Copy/Delete).
            </p>
            <Card variant="list" className="group relative overflow-hidden transition-all duration-300 cursor-pointer flex flex-col h-full hover:shadow-xl max-w-xs">
              <CardContent className="p-0 flex flex-col h-full">
                <div className="p-2">
                  <div className="relative w-full aspect-video overflow-hidden rounded-lg bg-zinc-800 flex items-center justify-center">
                    <CalendarDays size={48} className="text-zinc-600" />
                  </div>
                </div>
                <div className="p-4 flex gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="flex-1 font-bold text-lg text-white leading-tight line-clamp-2 min-w-0">Soirée Electro 2025</h3>
                      <Badge variant="success" className="flex-shrink-0 shadow-none">Confirmé</Badge>
                    </div>
                    <p className="text-sm text-zinc-400 font-medium">Le Transbordeur, Lyon</p>
                  </div>
                  <CardDateBadge month="Mar" day="21" />
                </div>
                <div className="px-4 pb-4 space-y-2">
                  <div className="flex gap-2">
                    <span className="inline-flex rounded-md px-2.5 py-0.5 text-xs font-medium bg-surface-elevated text-text-tertiary">Électro</span>
                  </div>
                  <div className="text-sm text-text-tertiary">20:00 – 23:00</div>
                </div>
                <div className="mt-auto px-4 py-3 border-t border-zinc-800 flex items-center justify-between">
                  <span className="text-sm text-zinc-400">3 commentaires</span>
                  <div className="flex gap-1">
                    <IconButton icon={<User size={14} />} ariaLabel="Éditer" variant="ghost" size="sm" className="p-2 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800" />
                    <IconButton icon={<CreditCard size={14} />} ariaLabel="Dupliquer" variant="ghost" size="sm" className="p-2 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800" />
                    <IconButton icon={<Activity size={14} />} ariaLabel="Supprimer" variant="ghost" size="sm" className="p-2 rounded-md text-zinc-400 hover:text-red-400 hover:bg-zinc-800" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">MeetingCard</h4>
            <p className="text-xs text-zinc-500 mb-3">
              Sans image. Titre + <code className="text-xs">Badge</code> statut + lieu, bloc date (mois/jour), horaires + ordre du jour, footer (participants + Présenter/Edit/Delete).
            </p>
            <Card variant="list" className="group relative overflow-hidden transition-all duration-300 cursor-pointer flex flex-col h-full hover:shadow-xl max-w-xs">
              <CardContent className="p-0 flex flex-col h-full">
                <div className="p-4 flex gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="flex-1 font-bold text-lg text-white leading-tight line-clamp-2 min-w-0">Point hebdo équipe</h3>
                      <Badge variant="info" className="flex-shrink-0 shadow-none">À venir</Badge>
                    </div>
                    <p className="text-sm text-zinc-400 font-medium truncate">Salle A</p>
                  </div>
                  <CardDateBadge month="Fév" day="19" />
                </div>
                <div className="px-4 pb-4 space-y-2">
                  <div className="flex items-center gap-2.5 text-sm text-text-tertiary">
                    <Clock className="h-4 w-4 flex-shrink-0" />
                    <span>14:00 – 15:00</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-sm text-text-tertiary">
                    <ListChecks className="h-4 w-4 flex-shrink-0" />
                    <span>3 points à l&apos;ordre du jour</span>
                  </div>
                </div>
                <div className="mt-auto px-4 py-3 border-t border-zinc-800 flex items-center justify-between">
                  <span className="text-sm text-zinc-400">5 participants</span>
                  <div className="flex gap-1">
                    <IconButton icon={<Activity size={14} />} ariaLabel="Présenter" variant="ghost" size="sm" className="p-2 rounded-md text-zinc-400 hover:text-purple-400 hover:bg-zinc-800" />
                    <IconButton icon={<User size={14} />} ariaLabel="Modifier" variant="ghost" size="sm" className="p-2 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800" />
                    <IconButton icon={<CreditCard size={14} />} ariaLabel="Supprimer" variant="ghost" size="sm" className="p-2 rounded-md text-zinc-400 hover:text-red-400 hover:bg-zinc-800" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-6 p-4 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
          <h4 className="text-sm font-medium mb-2">Pattern commun</h4>
          <ul className="text-xs text-zinc-600 dark:text-zinc-400 space-y-1 list-disc list-inside">
            <li><code>Card</code> + <code>CardContent p-0</code>, <code>flex flex-col h-full</code></li>
            <li>Statut : <code>Badge</code> (variant success/info/destructive/secondary)</li>
            <li>Variant : <code>variant="list"</code></li>
            <li>Bloc date optionnel : <code>CardDateBadge</code></li>
            <li>Footer : <code>mt-auto border-t border-zinc-800</code> + actions</li>
            <li>Fichiers : ProductCard, EventCard, MeetingCard</li>
          </ul>
        </div>
      </div>

    </div>
  );
};

export default CardDemo;

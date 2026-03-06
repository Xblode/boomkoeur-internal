# Template V1 - Next.js

Un template Next.js moderne avec architecture Frontend/Backend séparée, système de design atomique, et toutes les bonnes pratiques pour démarrer votre projet rapidement.

## Caractéristiques

- ⚡ **Next.js 15** avec App Router
- 🎨 **Design System Atomique** (Atoms, Molecules, Organisms)
- 🏗️ **Architecture Frontend/Backend séparée**
- 🎯 **TypeScript** pour la sécurité des types
- 💅 **Tailwind CSS 4** pour le styling
- 🎬 **Framer Motion** pour les animations fluides
- 🎭 **Lucide React** pour des icônes modernes
- 📦 **Barrel Exports** pour des imports propres
- 🔍 **SEO optimisé** (robots.ts, sitemap.ts)
- 🌙 **Mode sombre** inclus
- ♿ **Accessible** par défaut

## Démarrage rapide

### Installation

```bash
npm install
```

### Développement

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

### Build

```bash
npm run build
npm start
```

## Structure du projet

```
src/
├── app/                          # Pages et routes
│   ├── (frontend)/               # Groupe de routes Frontend (/)
│   │   ├── layout.tsx            # Layout avec Header/Footer
│   │   ├── page.tsx              # Homepage
│   │   ├── about/
│   │   │   └── page.tsx
│   │   └── contact/
│   │       └── page.tsx
│   ├── dashboard/                # Section Backend (/dashboard)
│   │   ├── layout.tsx            # Layout avec Sidebar
│   │   ├── page.tsx              # Page Dashboard
│   │   └── settings/
│   │       └── page.tsx
│   ├── error.tsx                 # Page d'erreur globale
│   ├── not-found.tsx             # Page 404
│   ├── loading.tsx               # Page de chargement
│   ├── forbidden.tsx             # Page 403
│   ├── unauthorized.tsx          # Page 401
│   ├── robots.ts                 # Configuration robots.txt
│   ├── sitemap.ts                # Génération sitemap.xml
│   ├── layout.tsx                # Layout racine
│   └── globals.css               # Styles globaux
│
├── components/                   # Composants React
│   ├── ui/                       # Design System
│   │   ├── atoms/                # Composants de base
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Label.tsx
│   │   │   └── index.ts
│   │   ├── molecules/            # Combinaisons d'atoms
│   │   │   ├── SearchBar.tsx
│   │   │   ├── FormField.tsx
│   │   │   └── index.ts
│   │   ├── organisms/            # Sections complexes
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── index.ts
│   │   └── index.ts
│   └── feature/                  # Composants métier
│       ├── Frontend/
│       │   ├── Home/
│       │   │   ├── Hero.tsx
│       │   │   └── index.ts
│       │   ├── About/
│       │   └── Contact/
│       ├── Backend/
│       │   ├── Dashboard/
│       │   └── Settings/
│       └── index.ts
│
├── lib/                          # Fonctions utilitaires
│   ├── utils.ts                  # Helpers (cn, formatDate, debounce...)
│   ├── constants.ts              # Constantes (ROUTES, ERROR_MESSAGES...)
│   └── index.ts
│
├── types/                        # Types TypeScript
│   ├── common.ts                 # Types communs
│   └── index.ts
│
├── hooks/                        # Custom React Hooks
│   ├── useMediaQuery.ts          # Hook responsive
│   └── index.ts
│
├── config/                       # Configuration
│   ├── navigation.ts             # Configuration des menus
│   └── site.ts                   # Métadonnées du site
│
└── styles/                       # Styles supplémentaires
    └── variables.css             # Variables CSS personnalisées
```

## Architecture

### Design System (Atomic Design)

Le projet utilise l'approche Atomic Design pour organiser les composants UI :

#### Atoms (Composants de base)
Composants les plus simples, non décomposables :
- `Button` : Bouton avec variants (primary, secondary, outline, ghost)
- `Input` : Champ de saisie
- `Label` : Label de formulaire

```tsx
import { Button, Input, Label } from '@/components/ui/atoms';
```

#### Molecules (Combinaisons d'atoms)
Groupes d'atoms qui fonctionnent ensemble :
- `SearchBar` : Input + Button
- `FormField` : Label + Input + Message d'erreur

```tsx
import { SearchBar, FormField } from '@/components/ui/molecules';
```

#### Organisms (Sections complexes)
Composants réutilisables complexes :
- `Header` : En-tête avec navigation
- `Footer` : Pied de page
- `Sidebar` : Navigation latérale (backend)

```tsx
import { Header, Footer, Sidebar } from '@/components/ui/organisms';
```

### Composants Feature

Les composants feature sont spécifiques à une page ou contexte :

```tsx
// Dans app/(frontend)/page.tsx
import { Hero } from '@/components/feature/Frontend/Home';

export default function HomePage() {
  return <Hero />;
}
```

**Convention** : Les pages ne contiennent que la composition, pas de logique métier.

## Ajouter une nouvelle page

### Frontend

1. Créez le dossier de la page dans `app/(frontend)/`
2. Créez les composants feature dans `components/feature/Frontend/[PageName]/`
3. Importez et utilisez dans `page.tsx`

Exemple pour une page "Services" :

```bash
# 1. Créer la structure
mkdir src/app/(frontend)/services
mkdir src/components/feature/Frontend/Services

# 2. Créer le composant feature
# src/components/feature/Frontend/Services/ServicesList.tsx
```

```tsx
// src/components/feature/Frontend/Services/ServicesList.tsx
export const ServicesList = () => {
  return (
    <section>
      {/* Contenu de la section */}
    </section>
  );
};

// src/components/feature/Frontend/Services/index.ts
export { ServicesList } from './ServicesList';
```

```tsx
// src/app/(frontend)/services/page.tsx
import { ServicesList } from '@/components/feature/Frontend/Services';

export default function ServicesPage() {
  return <ServicesList />;
}
```

### Backend

Même principe pour le backend dans `app/dashboard/` et `components/feature/Backend/`.

**Note** : Le backend est accessible via `/dashboard` au lieu d'utiliser un groupe de routes, pour éviter les conflits d'URL avec le frontend.

## Alias TypeScript

Le projet utilise des alias pour des imports propres :

```tsx
import { Button } from '@/components/ui/atoms';
import { cn, formatDate } from '@/lib/utils';
import { ROUTES } from '@/lib/constants';
import { User } from '@/types';
import { useMediaQuery } from '@/hooks';
import { siteConfig } from '@/config/site';
```

## Conventions de nommage

- **Composants** : PascalCase (`Button.tsx`, `Hero.tsx`)
- **Fonctions** : camelCase (`formatDate`, `debounce`)
- **Constantes** : UPPER_SNAKE_CASE (`ERROR_MESSAGES`, `ROUTES`)
- **Types** : PascalCase (`User`, `ApiResponse`)
- **Fichiers** : PascalCase pour composants, camelCase pour utilitaires

## Styling

Le projet utilise Tailwind CSS avec des variables CSS personnalisées dans `styles/variables.css`.

### Thème

Le mode sombre est automatique via `prefers-color-scheme`. Les variables CSS s'adaptent automatiquement.

### Utiliser les classes Tailwind

```tsx
import { cn } from '@/lib/utils';

<div className={cn(
  'base-classes',
  condition && 'conditional-classes'
)} />
```

## SEO

### Métadonnées

Les métadonnées sont configurées dans `config/site.ts` et utilisées dans le layout racine.

Pour personnaliser par page :

```tsx
export const metadata: Metadata = {
  title: 'Titre de la page',
  description: 'Description',
};
```

### Robots et Sitemap

- `robots.ts` : Configuration du fichier robots.txt
- `sitemap.ts` : Génération automatique du sitemap

Mettez à jour l'URL du site dans `config/site.ts`.

## Pages d'erreur

Le template inclut des pages d'erreur personnalisées :

- **error.tsx** : Erreurs générales de l'application
- **not-found.tsx** : Page 404
- **loading.tsx** : État de chargement
- **forbidden.tsx** : Accès interdit (403)
- **unauthorized.tsx** : Non authentifié (401)

## Hooks personnalisés

### useMediaQuery

Hook pour gérer le responsive :

```tsx
import { useIsMobile, useIsDesktop } from '@/hooks';

const Component = () => {
  const isMobile = useIsMobile();
  
  return isMobile ? <MobileView /> : <DesktopView />;
};
```

## Configuration

### Navigation

Configurez les menus dans `config/navigation.ts` :

```ts
export const frontendNavigation = [
  { label: 'Accueil', href: '/' },
  { label: 'À propos', href: '/about' },
];
```

### Site

Métadonnées globales dans `config/site.ts` :

```ts
export const siteConfig = {
  name: 'Votre Site',
  description: 'Description',
  url: 'https://votresite.com',
};
```

## Technologies

- [Next.js](https://nextjs.org/) - Framework React
- [TypeScript](https://www.typescriptlang.org/) - Langage typé
- [Tailwind CSS](https://tailwindcss.com/) - Framework CSS
- [Framer Motion](https://www.framer.com/motion/) - Animations
- [Lucide React](https://lucide.dev/) - Icônes
- [Geist Font](https://vercel.com/font) - Police optimisée

## Animations avec Framer Motion

Le projet inclut des animations prédéfinies dans `lib/animations.ts` :

```tsx
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer } from '@/lib/animations';

<motion.div variants={fadeInUp} initial="hidden" animate="visible">
  Contenu animé
</motion.div>
```

**Animations disponibles** :
- `fadeIn`, `fadeInUp`, `fadeInDown`, `fadeInLeft`, `fadeInRight`
- `scaleIn`, `slideInBottom`, `slideInTop`
- `staggerContainer` + `staggerItem` (pour listes)
- `bounce`, `pulse`, `shake` (animations infinies)

**Scroll reveal** :
```tsx
import { scrollReveal } from '@/lib/animations';

<motion.div variants={fadeInUp} {...scrollReveal}>
  Animé au scroll
</motion.div>
```

## Icônes avec Lucide React

Utilisation simple et moderne :

```tsx
import { Home, Settings, User } from 'lucide-react';

<Home size={24} />
<Settings size={20} className="text-blue-500" />
```

**Composant Icon** pour tailles prédéfinies :
```tsx
import { Icon } from '@/components/ui/atoms';
import { Home } from 'lucide-react';

<Icon icon={Home} size="md" />
```

[Parcourir toutes les icônes Lucide](https://lucide.dev/icons/)

## Prochaines étapes

1. Personnalisez `config/site.ts` avec vos informations
2. Modifiez les composants UI selon votre charte graphique
3. Ajoutez vos pages et fonctionnalités
4. Configurez l'authentification si nécessaire (non incluse dans le template)
5. Connectez une base de données si nécessaire

## Scripts disponibles

```bash
npm run dev      # Démarre le serveur de développement
npm run build    # Build pour production
npm start        # Démarre le serveur de production
npm run lint     # Vérifie les erreurs ESLint
```

## Support

Pour toute question ou problème, consultez la [documentation Next.js](https://nextjs.org/docs).

## Licence

**CC BY-NC 4.0** (Attribution - Pas d'Utilisation Commerciale)

- ✅ **Usage non commercial** : gratuit (personnel, éducationnel, associatif…)
- ❌ **Usage commercial** : interdit sans licence payante — contactez-nous pour obtenir une licence commerciale.

Voir le fichier [LICENSE](./LICENSE) pour les détails.

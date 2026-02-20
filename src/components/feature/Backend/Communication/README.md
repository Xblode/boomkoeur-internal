# Module Communication & Réseaux Sociaux

Module complet de gestion des campagnes de communication et des posts sur les réseaux sociaux pour Boomkoeur.

## 📋 Vue d'ensemble

Le module Communication permet de :
- 📊 Gérer des campagnes de communication (liées à des événements ou génériques)
- 📱 Créer et planifier des posts pour Instagram (Post, Carrousel, Reel, Story)
- 👀 Prévisualiser le feed Instagram avant publication
- 🔄 Suivre un workflow de validation (Brainstorming → Création → Revue → Validation → Planification)

## 🏗️ Architecture

```
src/components/feature/Backend/Communication/
├── CommunicationView.tsx          # Vue principale (Split View)
├── Dashboard/
│   ├── CampaignTable.tsx          # Tableau des campagnes
│   ├── GlobalFeedPreview.tsx      # Grille de prévisualisation du feed
│   └── index.ts
├── Previews/
│   ├── InstagramPostPreview.tsx   # Preview de post/carrousel/reel
│   ├── InstagramStoryPreview.tsx  # Preview de story
│   └── index.ts
├── PostWizard/
│   ├── PostCreationWizard.tsx     # Wizard principal
│   ├── StepBrainstorming.tsx      # Étape 1: Idéation
│   ├── StepContent.tsx            # Étape 2: Contenu
│   └── index.ts
└── index.ts
```

## 🎯 Fonctionnalités

### Dashboard Principal (`/dashboard/communication`)

**Split View** :
- **Gauche (60%)** : Tableau des campagnes
- **Droite (40%)** : Aperçu du feed Instagram

### Gestion des Campagnes

**Types de campagnes** :
- **Événement** : Liée à un ou plusieurs événements
- **Générique** : Campagne libre (merch, branding, etc.)

**Statuts** :
- `draft` : Brouillon
- `active` : Active
- `completed` : Terminée
- `archived` : Archivée

### Création de Post (Wizard)

#### Étape 1 : Brainstorming
- Objectif du post
- Format pressenti (Post, Carrousel, Reel, Story)
- Public cible
- Date approximative
- Mini brief

#### Étape 2 : Contenu
- Upload médias
- Rédaction caption
- Hashtags
- Tags utilisateurs
- Collaboration
- Lieu
- Musique (Reel/Story)
- Éléments interactifs (Story)
- Date de publication

#### Étape 3 : Prévisualisation
- Aperçu fidèle du rendu Instagram
- Validation finale

### Workflow de Validation

```
Brainstorming → Créé → En Revue → Validé → Planifié → Publié
```

## 📱 Formats Instagram Supportés

### Post
- Photo unique
- Caption, hashtags, tags
- Musique optionnelle

### Carrousel
- Plusieurs photos
- Texte par slide (brainstorming)
- Caption globale

### Reel
- Vidéo
- Musique obligatoire
- Caption, hashtags

### Story
- Format 9:16
- Musique
- Éléments interactifs :
  - Sondage
  - Question
  - Lien
  - Compte à rebours
  - Quiz

## 💾 Persistance des Données

Les données sont stockées dans le localStorage :
- `boomkoeur_campaigns` : Campagnes et posts planifiés
- `boomkoeur_published_posts` : Posts déjà publiés

### API localStorage

```typescript
// Campagnes
import {
  getCampaigns,
  saveCampaign,
  deleteCampaign,
  getCampaignById,
} from '@/lib/localStorage/communication';

// Posts
import {
  addPostToCampaign,
  updatePost,
  deletePost,
  publishPost,
} from '@/lib/localStorage/communication';

// Posts publiés
import {
  getPublishedPosts,
  addPublishedPost,
  deletePublishedPost,
} from '@/lib/localStorage/communication';
```

## 🎨 Composants de Prévisualisation

### InstagramPostPreview

```tsx
import { InstagramPostPreview } from '@/components/feature/Backend/Communication';

<InstagramPostPreview
  post={socialPost}
  username="boomkoeur"
  userAvatar="/avatar.jpg"
/>
```

### InstagramStoryPreview

```tsx
import { InstagramStoryPreview } from '@/components/feature/Backend/Communication';

<InstagramStoryPreview
  post={socialPost}
  username="boomkoeur"
  userAvatar="/avatar.jpg"
/>
```

## 🔮 Évolutions Futures

### Réseaux sociaux supplémentaires
- TikTok
- Facebook
- YouTube
- LinkedIn

### Autres canaux
- Newsletter
- Site web
- Emails

### Fonctionnalités avancées
- Connexion API Instagram (récupération automatique des anciens posts)
- Groupes de hashtags favoris
- Base de contacts/partenaires pour les tags
- Drag & Drop pour réorganiser le feed visuellement
- Statistiques et analytics
- Planification automatique

## 🎯 Utilisation

### 1. Créer une campagne

```typescript
const newCampaign = {
  name: 'Event 27 Février',
  type: 'event',
  eventIds: ['event-id'],
  platforms: ['instagram', 'tiktok'],
  description: 'Campagne pour l\'événement du 27 février',
  posts: [],
  status: 'active',
};

saveCampaign(newCampaign);
```

### 2. Créer un post

Utiliser le `PostCreationWizard` qui guide l'utilisateur à travers les 3 étapes.

### 3. Gérer le feed

Le `GlobalFeedPreview` affiche automatiquement tous les posts (publiés et planifiés) dans l'ordre chronologique inverse.

## 📝 Notes Importantes

- Les médias sont actuellement stockés comme URLs (images placeholder)
- L'upload de fichiers est à implémenter (composant Upload)
- La connexion avec l'API Instagram est prévue pour le futur
- Les notifications de publication sont à implémenter

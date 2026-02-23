# Composants UI - Design System

Documentation des composants du design system atomique du projet Boomkoeur.

## Atoms

Composants de base, non décomposables.

| Composant | Fichier | Description |
|-----------|---------|-------------|
| `Button` | `Button.tsx` | Bouton avec variants (primary, secondary, outline, ghost) |
| `IconButton` | `IconButton.tsx` | Bouton avec icône |
| `Input` | `Input.tsx` | Champ de saisie |
| `Textarea` | `Textarea.tsx` | Zone de texte multiligne |
| `Select` | `Select.tsx` | Liste déroulante de sélection |
| `Checkbox` | `Checkbox.tsx` | Case à cocher |
| `Radio` | `Radio.tsx` | Bouton radio |
| `Switch` | `Switch.tsx` | Interrupteur on/off |
| `Slider` | `Slider.tsx` | Curseur de valeur |
| `Label` | `Label.tsx` | Label de formulaire |
| `Icon` | `Icon.tsx` | Icône (Lucide React) |
| `Badge` | `Badge.tsx` | Badge/étiquette (variants : default, info, success, warning, destructive) |
| `Tag` | `Status.tsx` | Tag de statut (variants alignés Badge, option showDot) |
| `Dot` | `Status.tsx` | Point indicateur de statut (success, warning, error, info, neutral) |
| `Chip` | `Chip.tsx` | Chip/pastille (variants alignés Badge, option onDelete) |
| `Avatar` | `Avatar.tsx` | Avatar utilisateur |
| `Spinner` | `Spinner.tsx` | Indicateur de chargement |
| `Skeleton` | `Skeleton.tsx` | Placeholder de chargement |
| `Progress` | `Progress.tsx` | Barre de progression |
| `Divider` | `Divider.tsx` | Séparateur horizontal/vertical |
| `CustomLink` | `Link.tsx` | Lien personnalisé |
| `Heading` | `Typography.tsx` | Titre |
| `Text` | `Typography.tsx` | Texte |
| `Rating` | `Rating.tsx` | Notation par étoiles |
| `Toaster` | `Toaster.tsx` | Système de notifications toast |
| `Calendar` | `Calendar.tsx` | Calendrier |
| `Popover` | `Popover.tsx` | Contenu contextuel flottant |
| `PopoverContent` | `Popover.tsx` | Contenu du popover |
| `PopoverTrigger` | `Popover.tsx` | Déclencheur du popover |

## Molecules

Combinaisons d'atoms qui fonctionnent ensemble.

| Composant | Fichier | Description |
|-----------|---------|-------------|
| `Breadcrumb` | `Breadcrumb.tsx` | Fil d'Ariane de navigation |
| `EmptyState` | `EmptyState.tsx` | État vide (aucune donnée). Variantes : `full`, `compact`, `inline` |
| `Card` | `Card.tsx` | Carte conteneur |
| `CardHeader` | `Card.tsx` | En-tête de carte |
| `CardFooter` | `Card.tsx` | Pied de carte |
| `CardTitle` | `Card.tsx` | Titre de carte |
| `CardDescription` | `Card.tsx` | Description de carte |
| `CardContent` | `Card.tsx` | Contenu de carte |
| `FormField` | `FormField.tsx` | Champ de formulaire (Label + Input + erreur) |
| `SearchBar` | `SearchBar.tsx` | Barre de recherche (Input + Button) |
| `DatePicker` | `DatePicker.tsx` | Sélecteur de date |
| `TimePicker` | `DatePicker.tsx` | Sélecteur d'heure |
| `DetailHeader` | `DetailHeader.tsx` | En-tête de page détail (titre + grille métadonnées + tags) |
| `EventSelector` | `EventSelector.tsx` | Sélecteur d'événement |
| `TagMultiSelect` | `TagMultiSelect.tsx` | Sélection multiple de tags |
| `AssetUploaderPanel` | `AssetUploaderPanel.tsx` | Panneau d'upload d'assets |
| `MemberPicker` | `MemberPicker.tsx` | Sélecteur de membre |

## Organisms

Sections complexes et composants réutilisables.

| Composant | Fichier | Description |
|-----------|---------|-------------|
| `Header` | `Header.tsx` | En-tête avec navigation |
| `Footer` | `Footer.tsx` | Pied de page |
| `Sidebar` | `Sidebar.tsx` | Navigation latérale (dashboard) |
| `ProfileHeader` | `ProfileHeader.tsx` | En-tête de profil utilisateur |
| `PageToolbar` | `PageToolbar.tsx` | Barre d'outils de page |
| `Modal` | `Modal.tsx` | Fenêtre modale |
| `ModalFooter` | `Modal.tsx` | Pied de fenêtre modale |

## Import

```tsx
// Depuis l'index principal
import { Button, FormField, Header } from '@/components/ui';

// Depuis les dossiers spécifiques
import { Button } from '@/components/ui/atoms';
import { FormField } from '@/components/ui/molecules';
import { Header } from '@/components/ui/organisms';
```

---

## Badge, Tag, Chip — palette unifiée

Les trois composants partagent la même palette de couleurs (référence : EventStatusBadge, EventInfoSection).

| Variant | Usage | Couleurs (light) | Couleurs (dark) |
|---------|-------|------------------|-----------------|
| `default` / `secondary` | Neutre | `bg-zinc-100 text-zinc-700` | `bg-zinc-800/50 text-zinc-400` |
| `info` | Information | `bg-blue-100 text-blue-700` | `bg-blue-900/30 text-blue-300` |
| `success` | Succès, confirmé | `bg-green-100 text-green-700` | `bg-green-900/30 text-green-300` |
| `warning` | Attention, préparation | `bg-yellow-100 text-yellow-700` | `bg-yellow-900/30 text-yellow-300` |
| `destructive` / `error` | Erreur, supprimé | `bg-red-100 text-red-700` | `bg-red-900/30 text-red-300` |

### Différences d’usage

| Composant | Rôle | Props clés |
|-----------|------|------------|
| **Badge** | Étiquette statique (statut, rôle) | `variant`, `size` |
| **Tag** | Étiquette avec option point coloré | `variant`, `showDot` |
| **Chip** | Pastille supprimable (tags événements, sélecteurs) | `variant`, `label`, `onDelete` |

**Référence visuelle :** `EventInfoSection` (tags) et `EventForm` (chips) dans la page Events.

---

# Inventaire des composants Feature (Backend)

Documentation des éléments utilisés dans les pages Backend, avec nommage, particularités et nombre d'occurrences. Objectif : assurer la cohérence du design system.

---

## Admin

**Pages :** `/dashboard/admin` (Utilisateurs), `/dashboard/admin/general` (Général), `/dashboard/admin/migration` (Migration)

### Résumé par page

| Page | Éléments | Occurrences totales |
|------|----------|---------------------|
| **Utilisateurs** | PageHeader, PrimaryActionButton, FilterBar, CountDisplay, EmptyStateCard OU DataTable, FormModal, DetailsModal | 1 PageHeader, 1 CTA, 1 FilterBar (3 champs), 1 Count, 1 Card ou 1 Table, 2 Modals |
| **Général** | PageHeader, SettingsFormCard | 1 PageHeader, 1 Card (3 champs) |
| **Migration** | PageHeader, MigrationActionCard | 1 PageHeader, 1 Card |

### Composants UI utilisés

| Composant Design System | Utilisation Admin |
|-------------------------|-------------------|
| `Button` | CTA, actions tableau, formulaires, modals |
| `Input` | Recherche, filtres, formulaires |
| `Select` | Filtres rôle/statut |
| `FormField` | UserForm (création/édition) |
| `Label` | Admin General (champs settings) |
| `Badge` | UserDetails modal uniquement |
| `Avatar` | Lignes tableau, UserDetails |
| `Skeleton` | État chargement UsersList |
| `Card` / `CardContent` / `CardFooter` | Empty state, UserStats, Settings, Migration |
| `Modal` / `ModalFooter` | UserForm, UserDetails |
| `PageToolbar` | AdminToolbar (optionnel) |

### Éléments nommés et inventaire

#### 1. PageHeader
**Description :** Bloc titre + sous-titre en haut de chaque page.  
**Particularités :** `h1` text-3xl font-bold, `p` text-muted-foreground.  
**Occurrences :** 3 (Utilisateurs, Général, Migration)

```
┌─────────────────────────────────────┐
│ Utilisateurs                         │
│ Gérez les comptes et les accès      │
└─────────────────────────────────────┘
```

#### 2. PrimaryActionButton
**Description :** Bouton principal d’action en haut à droite.  
**Particularités :** `Button variant="primary" size="sm"`, icône + texte.  
**Occurrences :** 1 (Nouvel utilisateur)

#### 3. FilterBar (grille 3 colonnes)
**Description :** Barre de filtres avec labels.  
**Particularités :** grid-cols-3, label text-xs, Input avec icône Search, 2× Select.  
**Occurrences :** 1 (UsersList)

| Élément | Type | Occurrences |
|---------|------|-------------|
| SearchInput | Input + icône Search | 1 |
| RoleSelect | Select (Tous/Admin/Membre) | 1 |
| StatusSelect | Select (Tous/Actif/Inactif) | 1 |

#### 4. CountDisplay
**Description :** Texte "X utilisateur(s) [sur Y]".  
**Particularités :** text-sm text-zinc-600.  
**Occurrences :** 1

#### 5. EmptyStateCard
**Description :** Carte centrée quand aucune donnée.  
**Particularités :** Card + CardContent p-12, icône 48px, titre, description, CTA.  
**Occurrences :** 1 (UsersList, aucun utilisateur)

| Propriété | Valeur |
|-----------|--------|
| Composant | Card + CardContent |
| Icône | Search 48px |
| CTA | Button variant="outline" |

#### 6. DataTable (UsersTable)
**Description :** Tableau de données avec en-têtes.  
**Particularités :** rounded-xl, border, thead bg-zinc-50, lignes hover.  
**Occurrences :** 1 (liste utilisateurs)

| Colonne | Contenu |
|---------|---------|
| Utilisateur | Avatar + nom + actions (Eye, Edit, Key, Trash2) |
| Email | Icône Mail + email |
| Rôle | RoleBadge (custom) |
| Statut | StatusBadge (custom, cliquable) |
| Dernière connexion | Date formatée |

#### 7. RoleBadge (custom)
**Description :** Badge rôle.  
**Particularités :** span custom, pas l’atom Badge. Admin=bleu, Membre=zinc.  
**Occurrences :** N par ligne (N = nb utilisateurs)

#### 8. StatusBadge (custom)
**Description :** Badge statut, cliquable pour toggle.  
**Particularités :** span custom. Actif=vert, Inactif=rouge.  
**Occurrences :** N par ligne

#### 9. FormModal (UserForm)
**Description :** Modal formulaire création/édition.  
**Particularités :** Modal size="lg" scrollable, grille 2 colonnes, FormField, ModalFooter.  
**Occurrences :** 1

| Champs | Composant |
|--------|-----------|
| Prénom, Nom | FormField + Input |
| Email | FormField + Input type email |
| Rôle, Statut | FormField + select natif |
| Téléphone, Poste, Avatar | FormField + Input |

#### 10. DetailsModal (UserDetails)
**Description :** Modal lecture seule avec infos utilisateur.  
**Particularités :** Modal size="lg", Avatar xl, Badge atom, sections avec icônes.  
**Occurrences :** 1

| Section | Contenu |
|---------|---------|
| En-tête | Avatar, nom, Badge rôle + statut |
| Contact | Mail, Phone, Briefcase |
| Système | Calendar, Clock (dates) |
| Actions | Réinitialiser MDP, Modifier, Supprimer |

#### 11. SettingsFormCard (Admin General)
**Description :** Carte formulaire avec titre/description.  
**Particularités :** Card title+description, CardContent divide-y, CardFooter.  
**Occurrences :** 1

| Champ | Layout |
|-------|--------|
| Nom du site | Label 1/3 + Input 2/3 |
| Description | Idem |
| Email admin | Idem |

#### 12. MigrationActionCard
**Description :** Carte d’action de migration.  
**Particularités :** Card max-w-2xl, icône alerte, liste d’exemples, warning box, CTA, result box.  
**Occurrences :** 1

| Bloc | Style |
|------|-------|
| Alerte | bg-yellow-50, border-yellow |
| Résultat succès | bg-green-50 |
| Résultat erreur | bg-red-50 |

#### 13. StatCard (UserStats — non utilisé sur la page actuelle)
**Description :** Carte KPI avec icône, label, valeur, description.  
**Particularités :** Card, icon top-right, value text-2xl font-bold.  
**Occurrences :** 4 (composant UserStats)

#### 14. AdminSidebar (AdminLayout)
**Description :** Sidebar admin custom.  
**Particularités :** w-64, sticky, liens avec icônes, état actif.  
**Occurrences :** 1

---

## Events

**Pages :** `/dashboard/events` (Liste), `/dashboard/events/[id]` (Détail), `/dashboard/events/[id]/billetterie`, `/dashboard/events/[id]/planning`, `/dashboard/events/[id]/artistes`, `/dashboard/events/[id]/elements-lies`, `/dashboard/events/[id]/campagne`

### Référence design : Badge, Tag, Chip

La page Events sert de **référence visuelle** pour les composants Badge, Tag et Chip :

| Composant | Référence | Usage |
|-----------|-----------|-------|
| **Badge** | EventStatusBadge | Statut événement (Idée, Préparation, Confirmé, Terminé, Archivé) |
| **Tag** | — | Étiquettes avec point coloré (variants alignés Badge) |
| **Chip** | EventInfoSection, EventForm | Tags supprimables (événements, formulaires) |

### Éléments principaux

| Élément | Fichier | Description |
|---------|---------|-------------|
| EventDetailView | EventDetailView.tsx | Vue détail (orchestrateur) |
| EventInfoSection | EventInfoSection.tsx | Infos + tags (Chip), statut (EventStatusBadge) |
| EventForm | EventForm.tsx | Formulaire création/édition, tags (Chip) |
| EventStatusBadge | EventStatusBadge.tsx | Badge statut (palette Feedback) |

---

### Incohérences identifiées (à harmoniser) (à harmoniser)

| Élément | Problème | Recommandation |
|---------|----------|----------------|
| RoleBadge / StatusBadge | Implémentation custom dans UsersList | Utiliser l’atom `Badge` avec variants |
| UserForm rôle/statut | `select` natif | Utiliser l’atom `Select` |
| Alertes MigrationPanel | div custom | Créer un atom `Alert` ou réutiliser un pattern existant |
| UserStats | Non utilisé sur la page Admin | L’intégrer ou le retirer |

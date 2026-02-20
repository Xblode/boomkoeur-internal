# Modules Produits & Commandes - Documentation

## Vue d'ensemble

Deux nouveaux modules backend ont été implémentés pour gérer le merchandising :

1. **Produits/Merch** (`/dashboard/products`) - Gestion du catalogue, stock, fournisseurs
2. **Commandes** (`/dashboard/orders`) - Gestion des ventes clients

## Architecture

### Structure des fichiers

```
src/
├── app/dashboard/
│   ├── products/page.tsx          # Page Produits
│   └── orders/page.tsx            # Page Commandes
├── components/
│   ├── feature/Backend/
│   │   ├── Products/              # Composants Produits
│   │   │   ├── ProductsPage.tsx   # Orchestrateur principal
│   │   │   ├── Catalog/           # Onglet Catalogue
│   │   │   ├── Stock/             # Onglet Stock
│   │   │   ├── Providers/         # Onglet Fournisseurs
│   │   │   └── Stats/             # Onglet Statistiques
│   │   └── Orders/                # Composants Commandes
│   │       ├── OrdersPage.tsx     # Orchestrateur principal
│   │       └── Dashboard/         # Dashboard avec KPI
│   └── providers/
│       ├── ProductProvider.tsx
│       └── OrderProvider.tsx
├── lib/
│   ├── services/
│   │   ├── ProductDataService.ts          # Service produits
│   │   ├── OrderDataService.ts            # Service commandes
│   │   ├── FinanceIntegrationService.ts   # Sync Finance
│   │   └── StockAutomationService.ts      # Automation stock
│   ├── localStorage/
│   │   ├── products/              # localStorage produits
│   │   └── orders/                # localStorage commandes
│   └── mocks/
│       ├── products/demoData.ts   # Données démo produits
│       └── orders/demoData.ts     # Données démo commandes
└── types/
    ├── product.ts                 # Types produits
    └── order.ts                   # Types commandes
```

## Module Produits/Merch

### Fonctionnalités

#### 1. Catalogue
- Grille de produits avec images
- Filtres : type, statut, stock faible
- Création/édition de produits
- Gestion des variantes (taille, couleur, design)
- Génération automatique de SKU

#### 2. Stock
- Alertes stock faible
- Historique des mouvements (entrées/sorties)
- Tracking par variante
- Raisons de mouvement : achat, vente, retour, perte, ajustement

#### 3. Fournisseurs
- Base de données fournisseurs
- Informations de contact
- Notes et adresses

#### 4. Statistiques
- KPI : total produits, disponibles, stock total, alertes
- Top produits par stock
- Analyse par catégorie

### Types de produits supportés

- T-shirts (`tshirt`)
- Affiches (`poster`)
- Porte-clés (`keychain`)
- Éventails (`fan`)
- Autre (`other`)

### Workflow produit

```
Idée → En production → Disponible → Rupture de stock → Archivé
```

### Variantes

Chaque produit peut avoir plusieurs variantes avec :
- **Taille** : XS, S, M, L, XL, XXL
- **Couleur** : personnalisable
- **Design** : variantes de visuel

### Prix multiples

- **Public** : Prix de vente normal
- **Membre** : Prix adhérent
- **Partenaire** : Prix partenaire privilégié

## Module Commandes

### Fonctionnalités

#### 1. Dashboard
- KPI : total commandes, CA, panier moyen, en attente
- Liste des commandes avec filtres
- Recherche par numéro, client, email

#### 2. Gestion des commandes
- Sources : manuelle, boutique en ligne, événement
- Workflow complet : panier → paiement → préparation → expédition → livraison
- Gestion des retours

#### 3. Paiements
- Méthodes : Stripe, CB, virement, espèces, PayPal
- Statuts : en attente, payé, échoué, remboursé
- Intégration Stripe (préparée)

#### 4. Livraison
- Adresse complète
- Transporteur et numéro de suivi
- Dates d'expédition et livraison
- Coût de livraison

### Types de clients

- **Particulier** (`individual`)
- **Professionnel** (`professional`)
- **Partenaire** (`partner`)

### Workflow commande

```
Panier → En attente paiement → Payée → En préparation → Expédiée → Livrée
                                                                    ↓
                                                                Retournée
```

## Intégrations

### 1. Finance (automatique)

#### Ventes
- Commande payée → Transaction `income` dans Finance
- Catégorie : "Ventes Merchandising"
- Montant : total commande
- Référence : numéro de commande

#### Achats fournisseurs
- Mouvement stock "purchase" → Transaction `expense` dans Finance
- Catégorie : "Achats Merchandising"
- Fournisseur dans les notes

### 2. Stock Automatique

#### Vente
- Commande payée → Mouvements stock `out` pour chaque ligne
- Mise à jour automatique des quantités

#### Retour
- Commande retournée → Mouvements stock `in`
- Restauration du stock

### 3. Événements

- Produits peuvent être liés à un événement (`event_id`)
- Commandes peuvent être liées à un événement
- Tracking des ventes par événement

## Utilisation

### Initialisation

Les données démo sont initialisées automatiquement au premier chargement :

```typescript
// Produits
initializeProductsDemoData();

// Commandes
initializeOrdersDemoData();
```

### Services

```typescript
import { productDataService } from '@/lib/services/ProductDataService';
import { orderDataService } from '@/lib/services/OrderDataService';

// Récupérer des produits
const products = await productDataService.getProducts();

// Créer une commande
const order = await orderDataService.createOrder({
  // ... données commande
});

// Sync Finance
import { syncOrderToFinance } from '@/lib/services/FinanceIntegrationService';
await syncOrderToFinance(order);

// Impact stock
import { updateStockFromOrder } from '@/lib/services/StockAutomationService';
await updateStockFromOrder(order.id);
```

### Providers

```typescript
import { ProductProvider, OrderProvider } from '@/components/providers';

// Utiliser dans un composant
const { refreshTrigger, triggerRefresh } = useProduct();
const { refreshTrigger, triggerRefresh } = useOrder();
```

## Données démo

### Produits
- 5 produits (2 T-shirts, 2 affiches, 1 porte-clés)
- 10 variantes
- 3 fournisseurs
- Mouvements de stock historiques

### Commandes
- 6 commandes avec différents statuts
- 12 lignes de commandes
- Sources variées (boutique, événement, manuelle)
- Différents types de clients

## Migration Supabase

L'architecture est prête pour une migration vers Supabase :

1. **Service Layer** : Interface abstraite séparée de l'implémentation
2. **Types compatibles** : Types PostgreSQL-ready
3. **Relations** : Foreign keys prévues dans les types

Pour migrer :
1. Créer les tables Supabase
2. Implémenter `SupabaseProductService` et `SupabaseOrderService`
3. Remplacer les singletons dans les services
4. Les composants n'ont pas besoin de changement

## Points techniques

### Génération automatique

- **SKU produits** : `TSH-001`, `AFF-002`, `PC-003`
- **SKU variantes** : `TSH-001-M-NOI`, `AFF-002-A3`
- **Numéros commandes** : `CMD-2026-0001`

### localStorage

Clés utilisées :
- `products`
- `product_variants`
- `stock_movements`
- `providers`
- `orders`
- `order_lines`

### Performance

- Filtres côté client (localStorage)
- Pagination recommandée si >100 produits
- Indexation par SKU pour recherche rapide

## Navigation

Les nouveaux modules sont ajoutés dans la sidebar :

```typescript
{
  label: 'Produits',
  href: '/dashboard/products',
  icon: Package,
},
{
  label: 'Commandes',
  href: '/dashboard/orders',
  icon: ShoppingCart,
}
```

## Future Stripe Integration

La structure est prête pour Stripe :

1. Créer `src/lib/stripe/client.ts`
2. Créer routes API :
   - `/api/stripe/create-payment-intent`
   - `/api/stripe/webhook`
3. Configurer webhooks Stripe
4. Variables d'environnement :
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`

## Notes importantes

- Toujours utiliser les services, jamais directement localStorage
- Appeler `triggerRefresh()` après mutations
- Les images sont des placeholders (à remplacer par vraies images)
- Les intégrations Finance/Stock sont automatiques
- Stripe mocked initialement (paiements `card`, `transfer`, `cash`)

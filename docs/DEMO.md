# Configuration de la démo

La démo permet à tout visiteur d'accéder à un tableau de bord prérempli sans créer de compte.

## Option 1 : Script automatique (recommandé)

```bash
DEMO_PASSWORD=Demo123! pnpm demo:create
```

Variables requises (dans `.env.local` ou en préfixe) :
- `DEMO_PASSWORD` : mot de passe du compte demo@perret.app
- `NEXT_PUBLIC_SUPABASE_URL` : URL du projet Supabase
- `SUPABASE_SERVICE_ROLE_KEY` : clé service role (Dashboard > Settings > API)

Le script crée le compte `demo@perret.app` et l'organisation « Perret Démo ».

## Option 2 : Manuel + SQL

1. **Créer l'utilisateur démo** dans Supabase :
   - Dashboard Supabase > Authentication > Users > Add user
   - Email : `demo@perret.app`
   - Mot de passe : choisir un mot de passe (ex. `Demo123!`)

2. **Exécuter le seed SQL** :
   ```bash
   # Via Supabase CLI (si configuré)
   supabase db execute -f supabase/seed/demo.sql

   # Ou copier le contenu de supabase/seed/demo.sql
   # et l'exécuter dans Supabase Dashboard > SQL Editor
   ```

3. **Configurer la variable d'environnement** :
   ```env
   DEMO_PASSWORD=Demo123!
   ```
   (Utiliser le même mot de passe que celui défini à l'étape 1.)

## Utilisation

- **Page d'accueil** : le bouton « Essayer la démo » redirige vers `/demo`
- **Route `/demo`** : connexion automatique au compte démo puis redirection vers le dashboard
- **Contenu** : organisation « Perret Démo » avec événements, réunions, contacts, produits, finances et commandes préremplies

## Seed étendu (optionnel)

Pour enrichir la démo avec plus de contenu :

```bash
# Exécuter dans Supabase Dashboard > SQL Editor
# Fichier : supabase/seed/demo-extended.sql
```

Ajoute : 9 transactions supplémentaires, 3 artistes (Max Beat, Pixel Vision, Neon Lights), posts de campagne sur chaque événement, budgets par événement (finance_event_budgets).

## Données créées par le seed complet

- 1 organisation (slug `demo`)
- 3 événements (dont « Soirée Électro Printemps » comme prochain)
- 2 réunions (1 passée, 1 à venir)
- 2 artistes
- 2 contacts commerciaux
- 2 produits
- Compte bancaire, transactions, facture, budget
- Commandes (localStorage) : 2 commandes démo au premier chargement

## Réexécution du seed

Le script SQL est idempotent : il supprime les données existantes de l'org démo avant de recréer. Vous pouvez le réexécuter pour réinitialiser la démo.

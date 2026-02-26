# Configuration du domaine Perret.app

Ce guide explique comment connecter le domaine **perret.app** (OVH) à Vercel et Supabase.

## Architecture des URLs

| Usage | URL |
|-------|-----|
| **Frontend** (accueil, contact, login, inscription) | https://perret.app |
| **Backend** (dashboard) | https://dashboard.perret.app |

Le middleware redirige automatiquement :
- `perret.app/dashboard/*` → `dashboard.perret.app/dashboard/*`
- `dashboard.perret.app/` → `dashboard.perret.app/dashboard`
- Après connexion → `dashboard.perret.app/dashboard`

---

## 1. Configuration DNS chez OVH

1. Connectez-vous à [OVH Manager](https://www.ovh.com/manager/)
2. Allez dans **Web Cloud** → **Noms de domaine** → **perret.app**
3. Onglet **Zone DNS**

### Conflit OVH à résoudre

OVH ajoute par défaut un enregistrement A `@` → `213.186.33.5` (page parking). **Supprimez-le** avant d’ajouter l’enregistrement Vercel, sinon le domaine restera en "Invalid Configuration".

### Enregistrements à configurer

| Type | Sous-domaine | Cible | TTL |
|------|--------------|-------|-----|
| **A** | `@` | `216.198.79.1` | 300 |
| **CNAME** | `www` | `36bf0b1b8b7b605e.vercel-dns-017.com.` | 300 |
| **CNAME** | `dashboard` | `36bf0b1b8b7b605e.vercel-dns-017.com.` | 300 |

> **Note** : L’IP `216.198.79.1` est celle de Vercel. Si OVH propose une intégration Vercel, vous pouvez l’utiliser à la place.

### Alternative : délégation DNS vers Vercel

Si vous préférez gérer le DNS chez Vercel :

1. Dans Vercel : **Settings** → **Domains** → **Add** → `perret.app`
2. Vercel affiche les nameservers à configurer (ex. `ns1.vercel-dns.com`, `ns2.vercel-dns.com`)
3. Chez OVH : **Zone DNS** → **Modifier la zone en mode expert** → remplacer les NS par ceux de Vercel

---

## 2. Configuration Vercel

### Ajouter les domaines

1. Ouvrez votre projet sur [Vercel](https://vercel.com)
2. **Settings** → **Domains**
3. Ajoutez :
   - `perret.app` (domaine principal)
   - `www.perret.app` (optionnel)
   - `dashboard.perret.app` (sous-domaine)

### Vérification

Vercel vérifie automatiquement les domaines. Si la propagation DNS n’est pas encore faite, la vérification peut prendre jusqu’à 48 h.

### Variables d’environnement (Production)

Dans **Settings** → **Environment Variables** :

| Variable | Valeur | Environnement |
|----------|--------|---------------|
| `NEXT_PUBLIC_APP_URL` | `https://dashboard.perret.app` | Production |
| `NEXT_PUBLIC_DASHBOARD_URL` | `https://dashboard.perret.app` | Production (optionnel) |

> `NEXT_PUBLIC_APP_URL` est utilisée pour les callbacks OAuth, invitations et emails. Elle doit pointer vers le dashboard.

---

## 3. Configuration Supabase

### URL Configuration

1. [Supabase Dashboard](https://supabase.com/dashboard) → votre projet
2. **Authentication** → **URL Configuration**

| Paramètre | Valeur |
|-----------|--------|
| **Site URL** | `https://perret.app` |
| **Redirect URLs** | (ajouter une par ligne) |
| | `https://perret.app/**` |
| | `https://dashboard.perret.app/**` |
| | `http://localhost:3000/**` |

### Templates email

Les templates (confirmation, invite, recovery) utilisent `{{ .SiteURL }}` pour le logo. Avec **Site URL** = `https://perret.app`, le logo sera chargé depuis `https://perret.app/logo-white.png`.

---

## 4. OAuth (Google, Meta/Instagram)

Si vous utilisez Google ou Meta OAuth, mettez à jour les URLs de redirection :

### Google Cloud Console

- **APIs & Services** → **Credentials** → votre OAuth 2.0 Client
- **Authorized redirect URIs** : `https://dashboard.perret.app/api/admin/integrations/google/callback`

### Meta for Developers

- **Instagram** → **Basic Display** ou **Instagram Graph API**
- **Valid OAuth Redirect URIs** : `https://dashboard.perret.app/api/admin/integrations/meta/callback`

---

## 5. Vérification

1. **Frontend** : https://perret.app → page d’accueil
2. **Login** : https://perret.app/login
3. **Dashboard** : https://dashboard.perret.app → redirection vers `/dashboard`
4. **Redirection** : https://perret.app/dashboard → redirection vers `dashboard.perret.app/dashboard`

---

## Dépannage

### "Invalid Configuration" pour perret.app

Vercel affiche cette erreur quand un enregistrement DNS entre en conflit. Pour perret.app :

1. **Supprimez** l'enregistrement A `@` → `213.186.33.5` (OVH l'ajoute par défaut)
2. **Ajoutez** l'enregistrement A `@` → `216.198.79.1`
3. Attendez 5 à 30 minutes pour la propagation DNS

### Le domaine ne se résout pas

- Vérifier les enregistrements DNS (outil : [dnschecker.org](https://dnschecker.org))
- La propagation peut prendre jusqu’à 48 h

### Erreur SSL

- Vercel provisionne automatiquement les certificats Let’s Encrypt
- Attendre quelques minutes après l’ajout du domaine

### Redirections OAuth échouent

- Vérifier que `NEXT_PUBLIC_APP_URL` = `https://dashboard.perret.app`
- Vérifier les Redirect URLs dans Supabase
- Vérifier les URIs dans Google Cloud / Meta for Developers

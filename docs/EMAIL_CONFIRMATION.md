# Configuration de l'email de confirmation d'inscription

Ce guide explique comment configurer l'email de confirmation envoyé aux utilisateurs lors de leur inscription sur Perret.

## 1. Accéder aux templates d'email Supabase

1. Connectez-vous au [Dashboard Supabase](https://supabase.com/dashboard)
2. Sélectionnez votre projet
3. Allez dans **Authentication** → **Email Templates**
4. Cliquez sur **Confirm signup** pour modifier le template

## 2. Configurer le sujet de l'email

Remplacez le sujet par défaut par :

```
Confirmez votre inscription sur Perret
```

## 3. Configurer le contenu HTML

Copiez le contenu du fichier `supabase/templates/confirmation.html` dans le champ **Message body** du template "Confirm signup".

Ce template inclut :
- Un message de bienvenue personnalisé (avec le prénom si disponible)
- Un bouton "Confirmer mon adresse email"
- Un lien de secours en texte brut
- Un style sobre et professionnel aux couleurs de Perret

## 4. Variables disponibles dans le template

| Variable | Description |
|----------|-------------|
| `{{ .ConfirmationURL }}` | Lien de confirmation (à inclure dans le bouton) |
| `{{ .SiteURL }}` | URL de votre site (ex: https://perret.fr) |
| `{{ .Email }}` | Adresse email de l'utilisateur |
| `{{ .Data }}` | Métadonnées (ex: `prenom`, `nom` passés lors de l'inscription) |
| `{{ .RedirectTo }}` | URL de redirection après confirmation |

## 5. Configuration des URLs (important)

Dans **Authentication** → **URL Configuration** :

- **Site URL** : `https://perret.app` (frontend)
- **Redirect URLs** : ajoutez les URLs autorisées :
  - `https://perret.app/**`
  - `https://dashboard.perret.app/**`
  - `http://localhost:3000/**` (développement)

**Variables d'environnement** (Vercel) :
- `NEXT_PUBLIC_APP_URL` : `https://dashboard.perret.app` (pour OAuth, invitations, callbacks)
- `NEXT_PUBLIC_DASHBOARD_URL` : `https://dashboard.perret.app` (optionnel, pour redirections post-login)

## 6. SMTP personnalisé (recommandé en production)

Par défaut, Supabase envoie les emails via `mail.app.supabase.io`. Pour un envoi plus fiable et personnalisé :

1. Allez dans **Authentication** → **SMTP Settings**
2. Activez **Custom SMTP**
3. Configurez votre fournisseur (SendGrid, Mailgun, Postmark, AWS SES, etc.)

Exemple avec SendGrid :
- **Host** : `smtp.sendgrid.net`
- **Port** : `587`
- **Username** : `apikey`
- **Password** : votre clé API SendGrid
- **Sender email** : `noreply@perret.fr`
- **Sender name** : `Perret`

## 7. Désactiver la confirmation (développement uniquement)

Pour tester sans email de confirmation :

1. **Authentication** → **Providers** → **Email**
2. Désactivez **Confirm email**

⚠️ Ne pas désactiver en production pour des raisons de sécurité.

## 8. Développement local avec Supabase CLI

Si vous utilisez `supabase start` en local, créez ou modifiez `supabase/config.toml` :

```toml
[auth.email.template.confirmation]
subject = "Confirmez votre inscription sur Perret"
content_path = "./supabase/templates/confirmation.html"
```

Puis redémarrez Supabase : `supabase stop` puis `supabase start`.

## 9. Template d'invitation admin

Lorsqu'un administrateur invite un utilisateur (Dashboard > Admin > Utilisateurs > Inviter par email), Supabase envoie un email via le template "Invite user".

### Configuration

1. Allez dans **Authentication** → **Email Templates**
2. Cliquez sur **Invite user**
3. **Sujet** : `Vous êtes invité sur Perret`
4. **Message body** : copiez le contenu de `supabase/templates/invite.html`

### Variables disponibles

| Variable | Description |
|---------|-------------|
| `{{ .ConfirmationURL }}` | Lien d'acceptation de l'invitation |
| `{{ .SiteURL }}` | URL du site |
| `{{ .Email }}` | Email de l'invité |
| `{{ .Data }}` | Métadonnées (first_name, last_name, etc.) |

### Développement local (config.toml)

```toml
[auth.email.template.invite]
subject = "Vous êtes invité sur Perret"
content_path = "./supabase/templates/invite.html"
```

## 10. Template de réinitialisation de mot de passe

Lorsqu'un utilisateur demande à réinitialiser son mot de passe (page Mot de passe oublié), Supabase envoie un email via le template "Reset password".

### Configuration

1. Allez dans **Authentication** → **Email Templates**
2. Cliquez sur **Reset password**
3. **Sujet** : `Réinitialisez votre mot de passe — Perret`
4. **Message body** : copiez le contenu de `supabase/templates/recovery.html`

### Variables disponibles

| Variable | Description |
|---------|-------------|
| `{{ .ConfirmationURL }}` | Lien de réinitialisation |
| `{{ .SiteURL }}` | URL du site |
| `{{ .Email }}` | Email de l'utilisateur |
| `{{ .Data }}` | Métadonnées (prenom, etc.) |
| `{{ .RedirectTo }}` | URL de redirection après reset |

### Développement local (config.toml)

```toml
[auth.email.template.recovery]
subject = "Réinitialisez votre mot de passe — Perret"
content_path = "./supabase/templates/recovery.html"
```

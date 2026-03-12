# Messagerie Organisation

Document de reference pour la messagerie interne Boomkoeur.
Derniere mise a jour : mars 2026.

---

# 1. Besoins metier

## Pourquoi une messagerie interne

L'information operationnelle est aujourd'hui dispersee entre les modules du dashboard :

- les events vivent dans leur section
- les posts et campagnes vivent dans le module Communication
- les reunions vivent dans leur section
- les rappels importants ne sont centralises nulle part

Il manque un espace commun ou l'equipe peut echanger rapidement, consulter les informations critiques et prendre des decisions sans naviguer entre plusieurs pages.

## Objectif principal

Centraliser les alertes et les informations operationnelles de l'organisation dans un espace de discussion unique, accessible a tous les membres.

La messagerie n'est pas un reseau social interne. C'est un outil de coordination operationnelle.

## Cible utilisateur

Tous les membres de l'organisation, sans restriction de role au lancement. Le chat general est ouvert a toute personne ayant acces au dashboard.

## Promesse produit

Permettre a l'equipe de discuter, de consulter les informations cles et de prendre des decisions plus rapidement, depuis un seul endroit.

## Ton d'usage

Semi-professionnel. Les echanges doivent etre rapides et directs, mais rester cadres. Ce n'est ni un chat perso, ni un outil de reporting formel.

## Critere de reussite

Le MVP est reussi si les decisions et les validations au sein de l'equipe vont plus vite grace a la messagerie. Le critere n'est pas le volume de messages, mais la reduction du temps perdu a chercher ou repeter l'information.

## Ce que la messagerie n'est pas

- Ce n'est pas un Slack complet avec canaux, threads et integrations ouvertes
- Ce n'est pas d'abord une messagerie privee
- Ce n'est pas une plateforme d'automatisation
- Ce n'est pas un outil de gestion de projet

La messagerie est un fil operationnel commun, relie aux objets metier de Boomkoeur.

---

# 2. Experience visuelle et logique d'usage

## Inspiration

L'experience visuelle cible est un hybride entre une messagerie moderne et une interface produit.

Le modele n'est pas Instagram tel quel, mais plutot un chat utilitaire ou chaque type de message peut avoir son importance selon le contexte, sans hierarchie rigide entre messages humains, messages systeme et contenus epingles. L'inspiration la plus proche en termes de hierarchie d'information est un chat de type Cursor : structurellement simple, mais ou chaque element peut etre mis en valeur quand il le merite.

## Identite visuelle

La messagerie doit donner une impression editoriale et professionnelle a la fois. Un mix entre contenu vivant et outil de travail. Pas de look "application de chat grand public", mais pas non plus d'interface austere.

## Layout desktop

Sur desktop, la page Messages utilise une structure a deux colonnes :

- une sidebar laterale a gauche, qui peut contenir des informations contextuelles, des filtres futurs ou la liste des conversations quand le produit evoluera
- une zone de chat principale a droite, occupant la majorite de l'espace

La sidebar reste legere dans le MVP. Elle peut se limiter a un en-tete, un indicateur de contexte ou rester un espace reserve.

## Layout mobile

Sur mobile, la messagerie est un chat plein ecran avec un bloc d'informations epinglees en haut.

L'experience doit etre directe :

- le flux de messages est immediatement visible a l'ouverture
- les messages epingles sont accessibles en haut sans bloquer la lecture
- le champ de saisie est toujours accessible en bas
- la cohabitation avec les elements fixes du dashboard est soignee

L'equilibre entre lecture, ecriture et navigation est la priorite mobile. Aucune de ces trois actions ne doit etre sacrifiee.

## Densite visuelle

Equilibree. Les messages doivent etre lisibles sans etre trop espaces. On ne cherche ni la densite maximale ni l'aeration extreme. L'objectif est un confort de lecture qui fonctionne aussi bien sur un ecran desktop large que sur un telephone.

## Style des messages

Un style hybride entre DM moderne et interface produit :

- les bulles ou blocs de messages sont propres et alignes de maniere familiere
- les informations d'auteur et d'horodatage sont presentes mais discretes
- les messages systeme sont legerement distincts visuellement, sans etre envahissants
- les cards liees a un objet metier sont integrees dans le message de maniere subtile, pas comme des blocs massifs

## Zone de messages epingles

Un bloc dedie en haut de la page. Ce bloc est toujours visible quand il contient des epingles. Il ne doit pas prendre trop de place, mais rester un repere clair.

## Champ de saisie

Le composer est oriente texte avant tout. Ultra simple au lancement. L'utilisateur tape son message et l'envoie. Les actions complementaires viendront progressivement.

## Entree produit

L'acces a la messagerie se fait via une icone Messages dans le header backend, avec un badge ou compteur visuel pour indiquer l'activite. Un clic redirige directement vers la page `/dashboard/messages`.

## Regles d'importance des messages

Il n'y a pas de hierarchie fixe entre les types de messages. Un message humain peut etre aussi important qu'un message systeme, et inversement. L'importance depend du contexte, pas du type.

Les mecanismes de mise en valeur sont :

- l'epinglage pour les messages a garder visibles
- le style legerement distinct pour les messages systeme
- les cards discretes pour les liaisons metier
- la position dans le flux pour la fraicheur

L'interface ne doit jamais donner l'impression qu'un type de message est systematiquement plus important qu'un autre.

---

# 3. Perimetre MVP et non-objectifs

## Perimetre MVP strict

### Inclus dans le MVP

- une page Messages dans le dashboard, accessible via `/dashboard/messages`
- un acces depuis le header backend via une icone Messages avec badge/compteur
- un chat general unique par organisation
- envoi de messages texte
- affichage chronologique des messages avec auteur, heure, contenu
- auto-scroll sur les nouveaux messages
- etat vide propre si aucun message
- possibilite d'epingler des messages, ouverte a tous les membres
- bloc de messages epingles en haut de la page
- messages systeme generes par l'application
- liaisons vers des posts, avec card discrete dans le message
- premiere automatisation : la veille d'un post planifie, creation d'un message systeme avec une card speciale

### Extensions prioritaires juste apres le MVP

Ces elements ne font pas partie du MVP strict mais sont la priorite immediate suivante :

- liaisons vers des events, avec card discrete
- liaisons vers des reunions, avec card discrete

### Hors perimetre MVP

- edition ou suppression de messages
- recherche dans les messages
- messages prives entre utilisateurs
- canaux ou groupes multiples
- reactions emoji
- reponses a un message ou threads
- pieces jointes, fichiers ou medias
- mentions utilisateurs inline
- notifications push ou email
- moderation avancee
- permissions fines par role
- suivi de lecture detaille

## Automatisations dans le MVP

L'approche est volontairement minimaliste. La messagerie est d'abord un espace d'echange humain. Les automatisations ne doivent pas submerger le flux.

### Automatisation prioritaire

La veille d'un post planifie :

- generer un message systeme dans le chat general
- afficher une card speciale indiquant le nom du post, la date de publication, le type de contenu et un lien vers le module de gestion
- le message doit etre clairement identifie comme automatique

### Pourquoi ce cas en premier

- lien fort avec le module Communication deja present dans Boomkoeur
- valeur immediate pour l'equipe
- facile a comprendre
- base ideale pour etendre ensuite a d'autres declencheurs

## Messages epingles

### Fonctionnement MVP

- tout membre de l'organisation peut epingler un message
- le message reste dans le flux normal
- une reference apparait dans le bloc Epingles en haut
- on peut naviguer rapidement vers le message source dans le flux

### Valeur

- eviter de repeter les consignes importantes
- garder visibles les informations structurantes de la semaine ou du moment
- servir de repere commun a toute l'equipe

## Types de messages

### Message standard

- auteur
- horodatage
- texte

### Message epingle

- message standard avec mise en avant visuelle
- present dans le flux normal et dans la zone Epingles

### Message systeme

Message genere par l'application, legerement distinct visuellement.

Exemples :

- "Le post Aftermovie Event X doit etre publie demain"
- "La reunion Production Semaine 14 commence dans 1 heure"
- "L'event Boom Summer vient d'etre mis a jour"

### Message avec card metier

Le message peut embarquer une card liee a une ressource du produit. Dans le MVP, seul le type post est supporte. Les types event et meeting suivent juste apres.

Chaque card affiche :

- titre
- type
- date si pertinente
- statut si pertinent
- action pour ouvrir la ressource

Les cards sont discretes et integrees dans le message, pas sous forme de blocs massifs.

## Donnees fonctionnelles minimales

### Conversation

- id
- orgId
- type : general
- title

### Message

- id
- conversationId
- orgId
- authorId
- type : user ou system
- content
- createdAt
- isPinned
- relatedEntityType : post | event | meeting | null
- relatedEntityId
- metadata

### Suivi de lecture

Simplifie ou reporte dans le MVP. Le badge/compteur dans le header repose sur une logique de base, pas sur un suivi fin par message.

## Parcours MVP

### Parcours principal

- un utilisateur ouvre Messages
- il voit les epingles en haut
- il lit les derniers messages
- il envoie un nouveau message texte

### Parcours enrichi

- le systeme detecte un post prevu le lendemain
- il poste un message systeme avec une card speciale
- l'equipe est alertee dans un endroit central

### Parcours post-MVP

- un utilisateur ecrit un message et associe un event
- le message apparait avec une card d'event dans le flux

---

# 4. Roadmap fonctionnelle

La roadmap est organisee par themes fonctionnels. A l'interieur de chaque theme, les elements sont classes par priorite.

## Automatisations metier

### Court terme

- rappels automatiques la veille d'un post planifie
- rappels automatiques avant une reunion

### Moyen terme

- alertes sur changements critiques d'un event
- notifications de validation ou de publication d'un post
- workflows de validation relies a la messagerie

### Long terme

- messages automatiques relies a des deadlines generiques
- digests quotidiens ou hebdomadaires

## Extension des objets metier

### Court terme

- liaisons vers des events avec card
- liaisons vers des reunions avec card

### Moyen terme

- meilleure previsualisation des entites liees
- enrichissement des cards selon le type d'objet

### Long terme

- liaisons vers d'autres modules si pertinent

## Experience utilisateur

### Court terme

- reactions emoji sur les messages
- date separators dans le flux
- compteur de non lus plus precis

### Moyen terme

- meilleure navigation mobile entre messages et objets metier lies
- edition ou suppression de ses propres messages
- filtres simples dans le flux

### Long terme

- resume intelligent des discussions importantes
- suggestions automatiques de contexte a l'envoi d'un message

## Conversations et collaboration

### Court terme

- messages prives en 1-to-1

### Moyen terme

- petits groupes ou canaux thematiques
- reponses a un message
- mentions utilisateurs
- partage de fichiers ou medias

### Long terme

- logique multi-canaux complete
- meilleure gestion du temps reel

## Confiance et tracabilite

### Court terme

- notifications in-app basiques
- badge visuel dans le header

### Moyen terme

- notifications push ou email
- permissions par role si necessaire

### Long terme

- audit trail et journalisation des actions
- regles de conservation et archivage des messages

## Vision long terme

La messagerie doit evoluer vers un centre operationnel de l'organisation. Un espace ou les decisions sont prises, les actions sont suivies et les informations critiques sont accessibles sans naviguer entre plusieurs modules.

Elle ne doit pas chercher a devenir un outil de communication generaliste, mais rester ancree dans la realite operationnelle de Boomkoeur : events, posts, reunions, coordination d'equipe.

---

# Recommandations produit

## 1. Commencer par un seul chat general

C'est la meilleure facon de verifier l'adoption sans complexite inutile.

## 2. Miser tot sur les messages systeme

C'est ce qui differenciera la messagerie Boomkoeur d'un simple clone de chat. La valeur est dans le lien entre la conversation et le travail reel.

## 3. Limiter les automatisations au debut

Une seule automatisation bien executee vaut mieux qu'un systeme bruyant ou mal calibre.

## 4. Garder l'interface mobile comme reference

L'interface mobile doit etre la contrainte principale de conception. Si ca fonctionne bien sur mobile, ca fonctionnera bien partout.

## 5. Ne pas forcer de hierarchie de messages

Tous les types de messages peuvent etre importants selon le moment. L'interface doit le refleter.

---

# Ordre d'implementation recommande

Si l'on passe a l'execution, voici l'ordre suggere :

1. creer la route `/dashboard/messages` et la structure de page
2. afficher un fil simple avec messages mockes
3. ajouter l'envoi de message texte
4. ajouter l'epinglage
5. ajouter les messages systeme
6. ajouter les cards liees aux posts
7. brancher la premiere automatisation autour des posts planifies
8. etendre aux cards events et reunions

---

# Configuration optionnelle : synthèse IA

Au-dessus de chaque séparateur de jour, un résumé du jour précédent affiche le nombre de messages et une courte synthèse générée par IA (Google Gemini, tier gratuit).

Pour activer la synthèse :

1. Créer une clé API gratuite sur [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Ajouter dans `.env.local` : `GEMINI_API_KEY=votre_cle`

Sans cette variable, seul le nombre de messages est affiché (pas d’erreur).

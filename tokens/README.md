# Design Tokens

Système de design tokens à 3 couches pour le projet Boomkoeur.

## Architecture

```
tokens/
├── primitives.json      # Couche 1 : valeurs brutes (couleurs, espacements, radius, etc.)
├── semantic.json        # Structure des rôles sémantiques
├── chart-palette.json   # Palette pour les graphiques Recharts
├── themes/
│   ├── neutral.json     # Thème neutre (light/dark)
│   └── custom.json      # Thème personnalisé (palette verte)
├── scripts/
│   └── generate-css.cjs # Script de génération
└── output/
    ├── primitives.css   # Variables primitives
    ├── themes/
    │   ├── neutral.css  # Thème neutre
    │   └── custom.css   # Thème custom
    └── aliases.css      # Alias de compatibilité
```

## Génération

```bash
pnpm tokens:generate
```

Génère :
- `tokens/output/*.css` — fichiers CSS des tokens
- `src/lib/constants/chart-colors.ts` — palette pour les graphiques

## Couches

### 1. Primitives
Valeurs brutes : `color.neutral.50`, `space.4`, `radius.md`, etc.

### 2. Sémantique
Mapping des primitives vers des rôles : `surface.canvas`, `content.primary`, `border.default`, etc.

### 3. Thèmes
Chaque thème définit les valeurs sémantiques pour light et dark :
- **neutral** : palette zinc/gray, accent bleu
- **custom** : palette verte (#0C7236)

## Thèmes disponibles

- **Clair** / **Sombre** / **Système** : thème neutre
- **Custom** : palette personnalisée (vert), suit la préférence système pour light/dark

Sélection dans Paramètres > Apparence.

## Règles

- Utiliser uniquement les tokens (variables CSS, classes Tailwind issues du thème)
- Aucune couleur hex/rgb hardcodée dans les composants
- Pour les graphiques Recharts : importer depuis `@/lib/constants/chart-colors`

/**
 * Script de génération des Design Tokens CSS
 * Lit primitives.json et themes/*.json, génère les fichiers CSS
 */

const fs = require("fs");
const path = require("path");

const TOKENS_DIR = path.join(__dirname, "..");
const OUTPUT_DIR = path.join(TOKENS_DIR, "output");

const ALIAS_MAPPING = {
  "--background": "surface.canvas",
  "--foreground": "content.primary",
  "--bg-backend": "surface.base",
  "--bg-card": "surface.elevated.1",
  "--bg-toggle": "toggle.bg",
  "--bg-toggle-active": "toggle.active",
  "--border-color": "border.default",
  "--color-primary": "action.primary.bg",
  "--color-primary-hover": "action.primary.hover.bg",
  "--color-primary-foreground": "action.primary.fg",
  "--color-secondary": "content.secondary",
  "--color-accent": "brand.accent",
  "--color-bg-primary": "surface.canvas",
  "--color-bg-secondary": "surface.base",
  "--color-bg-tertiary": "surface.subtle",
  "--color-text-primary": "content.primary",
  "--color-text-secondary": "content.secondary",
  "--color-text-tertiary": "content.muted",
  "--color-border-light": "border.subtle",
  "--color-border-medium": "border.default",
  "--color-border-dark": "border.strong",
  "--color-success": "status.success.content",
  "--color-warning": "status.warning.content",
  "--color-error": "status.error.content",
  "--color-info": "status.info.content",
};

function flattenObject(obj, prefix = "") {
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "string" || typeof value === "number") {
      result[fullKey] = value;
    } else if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      Object.assign(result, flattenObject(value, fullKey));
    }
  }
  return result;
}

function getNestedValue(obj, pathStr) {
  const parts = pathStr.split(".");
  let current = obj;
  for (const part of parts) {
    if (current === null || typeof current !== "object") return undefined;
    current = current[part];
  }
  return typeof current === "string" ? current : undefined;
}

function primitivePathToVar(primitivePath) {
  if (primitivePath === "transparent") return "transparent";
  if (primitivePath.startsWith("#") || primitivePath.startsWith("rgb")) return primitivePath;
  const cssVarName = primitivePath.replace(/\./g, "-");
  return `var(--${cssVarName})`;
}

function generatePrimitivesCss(primitives) {
  const flat = flattenObject(primitives);
  const lines = ["/* Design Tokens - Primitives (généré) */", "", ":root {"];
  for (const [key, value] of Object.entries(flat)) {
    if (typeof value === "string" || typeof value === "number") {
      const cssVar = `--${key.replace(/\./g, "-")}`;
      lines.push(`  ${cssVar}: ${value};`);
    }
  }
  lines.push("}");
  return lines.join("\n");
}

function extractThemeValues(themeObj, prefix = "") {
  const result = {};
  for (const [key, value] of Object.entries(themeObj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "string") {
      result[fullKey] = value;
    } else if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      Object.assign(result, extractThemeValues(value, fullKey));
    }
  }
  return result;
}

function generateThemeCss(themeName, themeData) {
  const lines = [
    `/* Design Tokens - Thème ${themeName} (généré) */`,
    "",
  ];

  if (themeData.light) {
    const lightValues = extractThemeValues(themeData.light);
    lines.push(":root {");
    for (const [alias, semanticPath] of Object.entries(ALIAS_MAPPING)) {
      const primitivePath = getNestedValue(themeData.light, semanticPath);
      if (primitivePath) {
        lines.push(`  ${alias}: ${primitivePathToVar(primitivePath)};`);
      }
    }
    for (const [semanticPath, primitivePath] of Object.entries(lightValues)) {
      const cssVar = `--${semanticPath.replace(/\./g, "-")}`;
      lines.push(`  ${cssVar}: ${primitivePathToVar(primitivePath)};`);
    }
    lines.push("}", "");
  }

  if (themeData.dark) {
    const darkValues = extractThemeValues(themeData.dark);
    lines.push(".dark {");
    for (const [alias, semanticPath] of Object.entries(ALIAS_MAPPING)) {
      const primitivePath = getNestedValue(themeData.dark, semanticPath);
      if (primitivePath) {
        lines.push(`  ${alias}: ${primitivePathToVar(primitivePath)};`);
      }
    }
    for (const [semanticPath, primitivePath] of Object.entries(darkValues)) {
      const cssVar = `--${semanticPath.replace(/\./g, "-")}`;
      lines.push(`  ${cssVar}: ${primitivePathToVar(primitivePath)};`);
    }
    lines.push("}", "");
  }

  return lines.join("\n");
}

function generateThemeCustomCss(themeName, themeData) {
  const lines = [
    `/* Design Tokens - Thème ${themeName} (généré) */`,
    '/* Appliqué quand data-theme="custom" sur html */',
    "",
  ];

  if (themeData.light) {
    const lightValues = extractThemeValues(themeData.light);
    lines.push('[data-theme="custom"]:not(.dark) {');
    for (const [alias, semanticPath] of Object.entries(ALIAS_MAPPING)) {
      const primitivePath = getNestedValue(themeData.light, semanticPath);
      if (primitivePath) {
        lines.push(`  ${alias}: ${primitivePathToVar(primitivePath)};`);
      }
    }
    for (const [semanticPath, primitivePath] of Object.entries(lightValues)) {
      const cssVar = `--${semanticPath.replace(/\./g, "-")}`;
      lines.push(`  ${cssVar}: ${primitivePathToVar(primitivePath)};`);
    }
    lines.push("}", "");
  }

  if (themeData.dark) {
    const darkValues = extractThemeValues(themeData.dark);
    lines.push('[data-theme="custom"].dark {');
    for (const [alias, semanticPath] of Object.entries(ALIAS_MAPPING)) {
      const primitivePath = getNestedValue(themeData.dark, semanticPath);
      if (primitivePath) {
        lines.push(`  ${alias}: ${primitivePathToVar(primitivePath)};`);
      }
    }
    for (const [semanticPath, primitivePath] of Object.entries(darkValues)) {
      const cssVar = `--${semanticPath.replace(/\./g, "-")}`;
      lines.push(`  ${cssVar}: ${primitivePathToVar(primitivePath)};`);
    }
    lines.push("}", "");
  }

  return lines.join("\n");
}

function main() {
  const primitivesPath = path.join(TOKENS_DIR, "primitives.json");
  const primitives = JSON.parse(fs.readFileSync(primitivesPath, "utf-8"));

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.mkdirSync(path.join(OUTPUT_DIR, "themes"), { recursive: true });

  const primitivesCss = generatePrimitivesCss(primitives);
  fs.writeFileSync(path.join(OUTPUT_DIR, "primitives.css"), primitivesCss, "utf-8");
  console.log("✓ output/primitives.css");

  const neutralPath = path.join(TOKENS_DIR, "themes", "neutral.json");
  const neutralTheme = JSON.parse(fs.readFileSync(neutralPath, "utf-8"));
  const neutralCss = generateThemeCss("neutral", neutralTheme);
  fs.writeFileSync(path.join(OUTPUT_DIR, "themes", "neutral.css"), neutralCss, "utf-8");
  console.log("✓ output/themes/neutral.css");

  const customPath = path.join(TOKENS_DIR, "themes", "custom.json");
  if (fs.existsSync(customPath)) {
    const customTheme = JSON.parse(fs.readFileSync(customPath, "utf-8"));
    const customCss = generateThemeCustomCss("custom", customTheme);
    fs.writeFileSync(path.join(OUTPUT_DIR, "themes", "custom.css"), customCss, "utf-8");
    console.log("✓ output/themes/custom.css");
  }

  // Générer aliases.css (compatibilité variables.css)
  const aliases = [
    "/* Alias de compatibilité (généré) */",
    "",
    ":root {",
    "  --spacing-1: var(--space-1);",
    "  --spacing-2: var(--space-2);",
    "  --spacing-3: var(--space-3);",
    "  --spacing-4: var(--space-4);",
    "  --spacing-5: var(--space-5);",
    "  --spacing-6: var(--space-6);",
    "  --spacing-8: var(--space-8);",
    "  --spacing-10: var(--space-10);",
    "  --spacing-12: var(--space-12);",
    "  --spacing-16: var(--space-16);",
    "  --spacing-xs: var(--space-1);",
    "  --spacing-sm: var(--space-2);",
    "  --spacing-md: var(--space-4);",
    "  --spacing-lg: var(--space-6);",
    "  --spacing-xl: var(--space-8);",
    "  --spacing-2xl: var(--space-12);",
    "  --spacing-3xl: var(--space-16);",
    "  --shadow-sm: var(--shadow-1);",
    "  --shadow-md: var(--shadow-2);",
    "  --shadow-lg: var(--shadow-3);",
    "  --shadow-xl: var(--shadow-4);",
    "  --transition-fast: var(--motion-duration-fast);",
    "  --transition-normal: var(--motion-duration-normal);",
    "  --transition-slow: var(--motion-duration-slow);",
    "  --z-overlay: var(--zIndex-overlay);",
    "  --z-dropdown-panel: var(--zIndex-dropdownPanel);",
    "  --z-dropdown: var(--zIndex-dropdown);",
    "  --z-sticky: var(--zIndex-sticky);",
    "  --z-fixed: var(--zIndex-fixed);",
    "  --z-modal-backdrop: var(--zIndex-modalBackdrop);",
    "  --z-modal: var(--zIndex-modal);",
    "  --z-popover: var(--zIndex-popover);",
    "  --z-tooltip: var(--zIndex-tooltip);",
    "  --max-width-sm: var(--maxWidth-sm);",
    "  --max-width-md: var(--maxWidth-md);",
    "  --max-width-lg: var(--maxWidth-lg);",
    "  --max-width-xl: var(--maxWidth-xl);",
    "  --max-width-2xl: var(--maxWidth-2xl);",
    "}",
  ].join("\n");
  fs.writeFileSync(path.join(OUTPUT_DIR, "aliases.css"), aliases, "utf-8");
  console.log("✓ output/aliases.css");

  // Générer lib/constants/chart-colors.ts
  const chartPath = path.join(TOKENS_DIR, "chart-palette.json");
  if (fs.existsSync(chartPath)) {
    const chartPalette = JSON.parse(fs.readFileSync(chartPath, "utf-8"));
    const resolveColor = (ref) => {
      if (typeof ref !== "string") return ref;
      if (ref.startsWith("#")) return ref;
      const parts = ref.split(".");
      let val = primitives;
      for (const p of parts) val = val?.[p];
      return val || ref;
    };
    const categories = (chartPalette.categories || []).map(resolveColor);
    const series = {};
    for (const [k, v] of Object.entries(chartPalette.series || {})) {
      series[k] = resolveColor(v);
    }
    const calendar = {};
    for (const [k, v] of Object.entries(chartPalette.calendar || {})) {
      calendar[k] = resolveColor(v);
    }
    const chartUi = {};
    for (const [k, v] of Object.entries(chartPalette.chartUi || {})) {
      chartUi[k] = resolveColor(v);
    }
    const out = `/**
 * Palette des graphiques - généré depuis tokens/chart-palette.json
 * Ne pas modifier manuellement. Exécuter: pnpm tokens:generate
 */

export const CHART_CATEGORY_COLORS = ${JSON.stringify(categories)} as const;

export const CHART_SERIES_COLORS: Record<string, string> = ${JSON.stringify(series)};

export const CALENDAR_EVENT_COLORS: Record<string, string> = ${JSON.stringify(calendar)};

export const CHART_UI_COLORS: Record<string, string> = ${JSON.stringify(chartUi)};
`;
    const libDir = path.join(TOKENS_DIR, "..", "src", "lib", "constants");
    fs.mkdirSync(libDir, { recursive: true });
    fs.writeFileSync(path.join(libDir, "chart-colors.ts"), out, "utf-8");
    console.log("✓ src/lib/constants/chart-colors.ts");
  }

  console.log("\nGénération terminée.");
}

main();

/**
 * Script de génération des Design Tokens CSS
 * Lit primitives.json et themes/*.json, génère les fichiers CSS
 */

import * as fs from "fs";
import * as path from "path";

const TOKENS_DIR = path.join(__dirname, "..");
const OUTPUT_DIR = path.join(TOKENS_DIR, "output");

// Mapping des alias CSS existants vers les chemins sémantiques
const ALIAS_MAPPING: Record<string, string> = {
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

function flattenObject(
  obj: Record<string, unknown>,
  prefix = ""
): Record<string, string | number> {
  const result: Record<string, string | number> = {};
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "string" || typeof value === "number") {
      result[fullKey] = value;
    } else if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      Object.assign(result, flattenObject(value as Record<string, unknown>, fullKey));
    }
  }
  return result;
}

function getNestedValue(obj: Record<string, unknown>, path: string): string | undefined {
  const parts = path.split(".");
  let current: unknown = obj;
  for (const part of parts) {
    if (current === null || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return typeof current === "string" ? current : undefined;
}

function primitivePathToVar(primitivePath: string): string {
  if (primitivePath === "transparent") return "transparent";
  const cssVarName = primitivePath.replace(/\./g, "-");
  return `var(--${cssVarName})`;
}

function generatePrimitivesCss(primitives: Record<string, unknown>): string {
  const flat = flattenObject(primitives);
  const lines: string[] = ["/* Design Tokens - Primitives (généré) */", ""];
  for (const [key, value] of Object.entries(flat)) {
    if (typeof value === "string" || typeof value === "number") {
      const cssVar = `--${key.replace(/\./g, "-")}`;
      lines.push(`${cssVar}: ${value};`);
    }
  }
  return lines.join("\n");
}

function extractThemeValues(
  themeObj: Record<string, unknown>,
  prefix = ""
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(themeObj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "string") {
      result[fullKey] = value;
    } else if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      Object.assign(
        result,
        extractThemeValues(value as Record<string, unknown>, fullKey)
      );
    }
  }
  return result;
}

function generateThemeCss(
  themeName: string,
  themeData: { light?: Record<string, unknown>; dark?: Record<string, unknown> }
): string {
  const lines: string[] = [
    `/* Design Tokens - Thème ${themeName} (généré) */`,
    "",
  ];

  if (themeData.light) {
    const lightValues = extractThemeValues(themeData.light);
    lines.push(":root {");
    for (const [alias, semanticPath] of Object.entries(ALIAS_MAPPING)) {
      const primitivePath = getNestedValue(
        themeData.light as Record<string, unknown>,
        semanticPath
      );
      if (primitivePath) {
        lines.push(`  ${alias}: ${primitivePathToVar(primitivePath)};`);
      }
    }
    // Ajouter les variables sémantiques brutes
    for (const [semanticPath, primitivePath] of Object.entries(lightValues)) {
      const cssVar = `--${semanticPath.replace(/\./g, "-")}`;
      lines.push(`  ${cssVar}: ${primitivePathToVar(primitivePath)};`);
    }
    lines.push("}", "");
  }

  if (themeData.dark) {
    lines.push(".dark {");
    const darkValues = extractThemeValues(themeData.dark);
    for (const [alias, semanticPath] of Object.entries(ALIAS_MAPPING)) {
      const primitivePath = getNestedValue(
        themeData.dark as Record<string, unknown>,
        semanticPath
      );
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

function generateThemeCustomCss(
  themeName: string,
  themeData: { light?: Record<string, unknown>; dark?: Record<string, unknown> }
): string {
  const lines: string[] = [
    `/* Design Tokens - Thème ${themeName} (généré) */`,
    "/* Appliqué quand data-theme=\"custom\" sur html */",
    "",
  ];

  if (themeData.light) {
    lines.push('[data-theme="custom"]:not(.dark) {');
    const lightValues = extractThemeValues(themeData.light);
    for (const [alias, semanticPath] of Object.entries(ALIAS_MAPPING)) {
      const primitivePath = getNestedValue(
        themeData.light as Record<string, unknown>,
        semanticPath
      );
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
    lines.push('[data-theme="custom"].dark {');
    const darkValues = extractThemeValues(themeData.dark);
    for (const [alias, semanticPath] of Object.entries(ALIAS_MAPPING)) {
      const primitivePath = getNestedValue(
        themeData.dark as Record<string, unknown>,
        semanticPath
      );
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
  const primitives: Record<string, unknown> = JSON.parse(
    fs.readFileSync(primitivesPath, "utf-8")
  );

  // Créer output dir
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.mkdirSync(path.join(OUTPUT_DIR, "themes"), { recursive: true });

  // Générer primitives.css
  const primitivesCss = generatePrimitivesCss(primitives);
  fs.writeFileSync(
    path.join(OUTPUT_DIR, "primitives.css"),
    primitivesCss,
    "utf-8"
  );
  console.log("✓ output/primitives.css");

  // Générer themes/neutral.css
  const neutralPath = path.join(TOKENS_DIR, "themes", "neutral.json");
  const neutralTheme = JSON.parse(fs.readFileSync(neutralPath, "utf-8"));
  const neutralCss = generateThemeCss("neutral", neutralTheme);
  fs.writeFileSync(
    path.join(OUTPUT_DIR, "themes", "neutral.css"),
    neutralCss,
    "utf-8"
  );
  console.log("✓ output/themes/neutral.css");

  // Générer themes/custom.css si le fichier existe
  const customPath = path.join(TOKENS_DIR, "themes", "custom.json");
  if (fs.existsSync(customPath)) {
    const customTheme = JSON.parse(fs.readFileSync(customPath, "utf-8"));
    const customCss = generateThemeCustomCss("custom", customTheme);
    fs.writeFileSync(
      path.join(OUTPUT_DIR, "themes", "custom.css"),
      customCss,
      "utf-8"
    );
    console.log("✓ output/themes/custom.css");
  }

  console.log("\nGénération terminée.");
}

main();

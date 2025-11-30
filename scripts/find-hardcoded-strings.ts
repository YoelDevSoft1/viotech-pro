#!/usr/bin/env tsx
/**
 * Script para encontrar strings hardcodeados que deberían estar traducidos
 * 
 * Uso: npx tsx scripts/find-hardcoded-strings.ts
 */

import { readFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

// Palabras comunes en español que deberían estar traducidas
const SPANISH_KEYWORDS = [
  "Guardar",
  "Cancelar",
  "Eliminar",
  "Editar",
  "Crear",
  "Actualizar",
  "Bienvenido",
  "Dashboard",
  "Proyectos",
  "Tickets",
  "Configuración",
  "Perfil",
  "Cerrar sesión",
  "Buscar",
  "Filtrar",
  "Aplicar",
  "Limpiar",
  "Aceptar",
  "Rechazar",
  "Confirmar",
  "Sí",
  "No",
  "Cargando",
  "Error",
  "Éxito",
  "Advertencia",
  "Información",
];

// Palabras comunes en inglés que deberían estar traducidas
const ENGLISH_KEYWORDS = [
  "Save",
  "Cancel",
  "Delete",
  "Edit",
  "Create",
  "Update",
  "Welcome",
  "Dashboard",
  "Projects",
  "Tickets",
  "Settings",
  "Profile",
  "Logout",
  "Search",
  "Filter",
  "Apply",
  "Clear",
  "Accept",
  "Reject",
  "Confirm",
  "Yes",
  "No",
  "Loading",
  "Error",
  "Success",
  "Warning",
  "Info",
];

// Extensiones de archivos a revisar
const FILE_EXTENSIONS = [".tsx", ".ts", ".jsx", ".js"];

// Directorios a excluir
const EXCLUDE_DIRS = [
  "node_modules",
  ".next",
  ".git",
  "dist",
  "build",
  "scripts",
  "messages", // Archivos de traducción
];

// Archivos a excluir
const EXCLUDE_FILES = [
  "i18n.ts",
  "middleware.ts",
  "next.config.ts",
];

interface Match {
  file: string;
  line: number;
  text: string;
  keyword: string;
}

function shouldExcludePath(path: string): boolean {
  return EXCLUDE_DIRS.some((dir) => path.includes(dir));
}

function shouldExcludeFile(file: string): boolean {
  return EXCLUDE_FILES.some((exclude) => file.includes(exclude));
}

function findMatches(content: string, file: string): Match[] {
  const matches: Match[] = [];
  const lines = content.split("\n");

  lines.forEach((line, index) => {
    // Buscar palabras en español
    SPANISH_KEYWORDS.forEach((keyword) => {
      // Buscar como string literal
      const regex = new RegExp(`["']${keyword}["']`, "g");
      if (regex.test(line)) {
        matches.push({
          file,
          line: index + 1,
          text: line.trim(),
          keyword,
        });
      }
    });

    // Buscar palabras en inglés
    ENGLISH_KEYWORDS.forEach((keyword) => {
      const regex = new RegExp(`["']${keyword}["']`, "g");
      if (regex.test(line)) {
        matches.push({
          file,
          line: index + 1,
          text: line.trim(),
          keyword,
        });
      }
    });
  });

  return matches;
}

function scanDirectory(dir: string, baseDir: string = dir): Match[] {
  const matches: Match[] = [];

  if (shouldExcludePath(dir)) {
    return matches;
  }

  const entries = readdirSync(dir);

  entries.forEach((entry) => {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      matches.push(...scanDirectory(fullPath, baseDir));
    } else if (stat.isFile()) {
      const ext = entry.substring(entry.lastIndexOf("."));
      if (FILE_EXTENSIONS.includes(ext) && !shouldExcludeFile(entry)) {
        try {
          const content = readFileSync(fullPath, "utf-8");
          const fileMatches = findMatches(content, fullPath.replace(baseDir + "/", ""));
          matches.push(...fileMatches);
        } catch (error) {
          console.error(`Error reading file ${fullPath}:`, error);
        }
      }
    }
  });

  return matches;
}

function main() {
  console.log("🔍 Buscando strings hardcodeados...\n");

  const appDir = join(process.cwd(), "app");
  const componentsDir = join(process.cwd(), "components");

  const matches: Match[] = [];

  if (statSync(appDir).isDirectory()) {
    matches.push(...scanDirectory(appDir, process.cwd()));
  }

  if (statSync(componentsDir).isDirectory()) {
    matches.push(...scanDirectory(componentsDir, process.cwd()));
  }

  if (matches.length === 0) {
    console.log("✅ No se encontraron strings hardcodeados comunes.");
    return;
  }

  console.log(`⚠️  Se encontraron ${matches.length} posibles strings hardcodeados:\n`);

  // Agrupar por archivo
  const byFile = matches.reduce((acc, match) => {
    if (!acc[match.file]) {
      acc[match.file] = [];
    }
    acc[match.file].push(match);
    return acc;
  }, {} as Record<string, Match[]>);

  Object.entries(byFile).forEach(([file, fileMatches]) => {
    console.log(`📄 ${file}`);
    fileMatches.forEach((match) => {
      console.log(`   Línea ${match.line}: "${match.keyword}"`);
      console.log(`   ${match.text.substring(0, 80)}...`);
    });
    console.log();
  });

  console.log(`\n💡 Tip: Revisa estos archivos y reemplaza los strings con useTranslations()`);
}

main();


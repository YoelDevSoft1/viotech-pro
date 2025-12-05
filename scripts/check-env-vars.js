#!/usr/bin/env node

/**
 * Script para verificar variables de entorno faltantes
 * Uso: node scripts/check-env-vars.js
 */

const fs = require('fs');
const path = require('path');

// Variables requeridas (obligatorias)
const REQUIRED_VARS = [
  'NEXT_PUBLIC_BACKEND_API_URL',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
];

// Variables recomendadas (opcionales pero importantes)
const RECOMMENDED_VARS = [
  'NEXT_PUBLIC_SENTRY_DSN',
  'NEXT_PUBLIC_ENVIRONMENT',
  'NEXT_PUBLIC_APP_VERSION',
  'NEXT_PUBLIC_WS_URL',
  'NEXT_PUBLIC_VAPID_PUBLIC_KEY',
];

// Variables opcionales
const OPTIONAL_VARS = [
  'NEXT_PUBLIC_GA4_MEASUREMENT_ID',
  'NEXT_PUBLIC_LOG_LEVEL',
  'NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET',
  'SUPABASE_STORAGE_BUCKET',
];

// Variables de testing (solo para E2E)
const TEST_VARS = [
  'PLAYWRIGHT_BASE_URL',
  'TEST_PARTNER_EMAIL',
  'TEST_PARTNER_PASSWORD',
  'TEST_USER_EMAIL',
  'TEST_USER_PASSWORD',
];

// Leer .env.local
const envPath = path.join(process.cwd(), '.env.local');
let envContent = '';

if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf-8');
} else {
  console.log('⚠️  Archivo .env.local no encontrado\n');
  console.log('📝 Creando template...\n');
}

// Extraer variables definidas
const definedVars = new Set();
const lines = envContent.split('\n');
lines.forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const match = trimmed.match(/^([A-Z_]+)=/);
    if (match) {
      definedVars.add(match[1]);
    }
  }
});

// Verificar variables requeridas
console.log('🔍 Verificando variables de entorno...\n');

const missingRequired = [];
const missingRecommended = [];
const missingOptional = [];

REQUIRED_VARS.forEach(varName => {
  if (!definedVars.has(varName)) {
    missingRequired.push(varName);
  }
});

RECOMMENDED_VARS.forEach(varName => {
  if (!definedVars.has(varName)) {
    missingRecommended.push(varName);
  }
});

OPTIONAL_VARS.forEach(varName => {
  if (!definedVars.has(varName)) {
    missingOptional.push(varName);
  }
});

// Mostrar resultados
console.log('═══════════════════════════════════════════════════════════\n');

if (missingRequired.length === 0) {
  console.log('✅ Variables REQUERIDAS: Todas presentes\n');
} else {
  console.log('❌ Variables REQUERIDAS faltantes:\n');
  missingRequired.forEach(v => console.log(`   - ${v}`));
  console.log('');
}

if (missingRecommended.length === 0) {
  console.log('✅ Variables RECOMENDADAS: Todas presentes\n');
} else {
  console.log('⚠️  Variables RECOMENDADAS faltantes:\n');
  missingRecommended.forEach(v => console.log(`   - ${v}`));
  console.log('');
}

if (missingOptional.length > 0) {
  console.log('ℹ️  Variables OPCIONALES no configuradas:\n');
  missingOptional.forEach(v => console.log(`   - ${v}`));
  console.log('');
}

// Resumen
console.log('═══════════════════════════════════════════════════════════\n');
console.log('📊 Resumen:\n');
console.log(`   Requeridas: ${REQUIRED_VARS.length - missingRequired.length}/${REQUIRED_VARS.length} ✅`);
console.log(`   Recomendadas: ${RECOMMENDED_VARS.length - missingRecommended.length}/${RECOMMENDED_VARS.length} ${missingRecommended.length === 0 ? '✅' : '⚠️'}`);
console.log(`   Opcionales: ${OPTIONAL_VARS.length - missingOptional.length}/${OPTIONAL_VARS.length} configuradas\n`);

// Generar template si faltan variables
if (missingRequired.length > 0 || missingRecommended.length > 0) {
  console.log('═══════════════════════════════════════════════════════════\n');
  console.log('📝 Template para agregar a .env.local:\n');
  console.log('# Variables Requeridas');
  missingRequired.forEach(v => {
    console.log(`${v}=`);
  });
  if (missingRecommended.length > 0) {
    console.log('\n# Variables Recomendadas');
    missingRecommended.forEach(v => {
      console.log(`${v}=`);
    });
  }
  console.log('');
}

// Ver documentación
console.log('📚 Ver documentación completa en: docs/VARIABLES_ENTORNO_FRONTEND.md\n');


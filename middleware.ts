// Middleware de i18n - Temporalmente deshabilitado para evitar conflictos con páginas existentes
// Se activará gradualmente cuando las páginas estén migradas a usar next-intl

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Por ahora, solo pasar la request sin modificar
  // Se activará cuando las páginas estén listas para i18n
  return NextResponse.next();
}

export const config = {
  // Matcher vacío para no procesar ninguna ruta por ahora
  matcher: [],
};


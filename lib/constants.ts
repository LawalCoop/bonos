// Sistema de niveles
export const NIVELES = {
  1: { puntos: 0, nombre: "Primera Vez", icono: "🎭", descuento: 0, eventosMinimos: 0 },
  2: { puntos: 300, nombre: "Explorando", icono: "🎪", descuento: 5, eventosMinimos: 3 },
  3: { puntos: 700, nombre: "De la Casa", icono: "🏠", descuento: 8, eventosMinimos: 7 },
  4: { puntos: 1200, nombre: "Entusiasta", icono: "🎨", descuento: 10, eventosMinimos: 12 },
  5: { puntos: 2000, nombre: "Incondicional", icono: "💙", descuento: 12, eventosMinimos: 20 },
  6: { puntos: 3000, nombre: "Pilar", icono: "⚡", descuento: 15, eventosMinimos: 30 },
  7: { puntos: 4500, nombre: "Referente", icono: "⭐", descuento: 18, eventosMinimos: 45 },
  8: { puntos: 6500, nombre: "Guardián", icono: "📚", descuento: 20, eventosMinimos: 65 },
} as const;

// Sistema de puntos
export const PUNTOS = {
  ASISTIR_EVENTO: 100,
} as const;

// Descuentos por veces visto (fan de artista)
export const DESCUENTO_FAN = {
  3: 3,   // 3 veces = 3% extra
  5: 5,   // 5 veces = 5% extra
  10: 8,  // 10 veces = 8% extra
} as const;

// Calcular nivel según puntos
export function calcularNivel(puntos: number): number {
  if (puntos >= 6500) return 8;
  if (puntos >= 4500) return 7;
  if (puntos >= 3000) return 6;
  if (puntos >= 2000) return 5;
  if (puntos >= 1200) return 4;
  if (puntos >= 700) return 3;
  if (puntos >= 300) return 2;
  return 1;
}

// Obtener info del nivel
export function getNivelInfo(nivel: number) {
  return NIVELES[nivel as keyof typeof NIVELES] || NIVELES[1];
}

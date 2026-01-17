import { prisma } from "@/lib/prisma";

// Niveles por defecto (fallback si no hay en DB)
export const NIVELES_DEFAULT = {
  1: { puntos: 0, nombre: "Primera Vez", icono: "🎭", descuento: 0 },
  2: { puntos: 300, nombre: "Explorando", icono: "🎪", descuento: 5 },
  3: { puntos: 700, nombre: "De la Casa", icono: "🏠", descuento: 8 },
  4: { puntos: 1200, nombre: "Entusiasta", icono: "🎨", descuento: 10 },
  5: { puntos: 2000, nombre: "Incondicional", icono: "💙", descuento: 12 },
  6: { puntos: 3000, nombre: "Pilar", icono: "⚡", descuento: 15 },
  7: { puntos: 4500, nombre: "Referente", icono: "⭐", descuento: 18 },
  8: { puntos: 6500, nombre: "Guardián", icono: "📚", descuento: 20 },
} as const;

export type NivelInfo = {
  puntos: number;
  nombre: string;
  icono: string;
  descuento: number;
};

// Cache para evitar consultas repetidas
let nivelesCache: Record<number, NivelInfo> | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL = 60000; // 1 minuto

// Obtener niveles de la base de datos (con cache)
export async function getNivelesFromDB(): Promise<Record<number, NivelInfo>> {
  // Si el cache es válido, usarlo
  if (nivelesCache && Date.now() - cacheTimestamp < CACHE_TTL) {
    return nivelesCache;
  }

  try {
    const niveles = await prisma.nivelConfig.findMany({
      orderBy: { nivel: "asc" },
    });

    if (niveles.length === 0) {
      return NIVELES_DEFAULT;
    }

    // Convertir a formato de objeto
    const nivelesMap: Record<number, NivelInfo> = {};
    for (const nivel of niveles) {
      nivelesMap[nivel.nivel] = {
        puntos: nivel.puntos,
        nombre: nivel.nombre,
        icono: nivel.icono,
        descuento: nivel.descuento,
      };
    }

    // Actualizar cache
    nivelesCache = nivelesMap;
    cacheTimestamp = Date.now();

    return nivelesMap;
  } catch (error) {
    console.error("Error fetching niveles from DB:", error);
    return NIVELES_DEFAULT;
  }
}

// Calcular nivel según puntos (usando DB)
export async function calcularNivelFromDB(puntos: number): Promise<number> {
  const niveles = await getNivelesFromDB();
  const nivelesOrdenados = Object.entries(niveles)
    .map(([nivel, info]) => ({ nivel: parseInt(nivel), ...info }))
    .sort((a, b) => b.puntos - a.puntos); // Ordenar de mayor a menor puntos

  for (const nivel of nivelesOrdenados) {
    if (puntos >= nivel.puntos) {
      return nivel.nivel;
    }
  }

  return 1;
}

// Obtener info de un nivel específico (usando DB)
export async function getNivelInfoFromDB(nivel: number): Promise<NivelInfo> {
  const niveles = await getNivelesFromDB();
  return niveles[nivel] || niveles[1] || NIVELES_DEFAULT[1];
}

// Invalidar cache (llamar después de actualizar niveles)
export function invalidateNivelesCache() {
  nivelesCache = null;
  cacheTimestamp = 0;
}

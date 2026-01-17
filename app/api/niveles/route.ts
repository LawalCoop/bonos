import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Niveles por defecto
const NIVELES_DEFAULT = [
  { nivel: 1, puntos: 0, nombre: "Primera Vez", icono: "🎭", descuento: 0 },
  { nivel: 2, puntos: 300, nombre: "Explorando", icono: "🎪", descuento: 5 },
  { nivel: 3, puntos: 700, nombre: "De la Casa", icono: "🏠", descuento: 8 },
  { nivel: 4, puntos: 1200, nombre: "Entusiasta", icono: "🎨", descuento: 10 },
  { nivel: 5, puntos: 2000, nombre: "Incondicional", icono: "💙", descuento: 12 },
  { nivel: 6, puntos: 3000, nombre: "Pilar", icono: "⚡", descuento: 15 },
  { nivel: 7, puntos: 4500, nombre: "Referente", icono: "⭐", descuento: 18 },
  { nivel: 8, puntos: 6500, nombre: "Guardián", icono: "📚", descuento: 20 },
];

// GET - Obtener todos los niveles (público)
export async function GET() {
  try {
    let niveles = await prisma.nivelConfig.findMany({
      orderBy: { nivel: "asc" },
      select: {
        nivel: true,
        nombre: true,
        icono: true,
        puntos: true,
        descuento: true,
      },
    });

    // Si no hay niveles configurados, retornar defaults
    if (niveles.length === 0) {
      return NextResponse.json(NIVELES_DEFAULT);
    }

    return NextResponse.json(niveles);
  } catch (error) {
    console.error("Error fetching niveles:", error);
    // En caso de error, retornar defaults
    return NextResponse.json(NIVELES_DEFAULT);
  }
}

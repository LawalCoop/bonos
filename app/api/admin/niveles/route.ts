import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin";
import { invalidateNivelesCache } from "@/lib/niveles";

export const dynamic = "force-dynamic";

// Niveles por defecto (se usan si no hay configuración en DB)
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

// GET - Obtener todos los niveles
export async function GET() {
  try {
    let niveles = await prisma.nivelConfig.findMany({
      orderBy: { nivel: "asc" },
    });

    // Si no hay niveles configurados, inicializar con los defaults
    if (niveles.length === 0) {
      await prisma.nivelConfig.createMany({
        data: NIVELES_DEFAULT,
      });
      niveles = await prisma.nivelConfig.findMany({
        orderBy: { nivel: "asc" },
      });
    }

    return NextResponse.json(niveles);
  } catch (error) {
    console.error("Error fetching niveles:", error);
    return NextResponse.json(
      { error: "Error al obtener niveles" },
      { status: 500 }
    );
  }
}

// PUT - Actualizar todos los niveles (bulk update)
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || !isAdmin(session.user.rol)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { niveles } = body;

    if (!niveles || !Array.isArray(niveles)) {
      return NextResponse.json(
        { error: "Datos inválidos" },
        { status: 400 }
      );
    }

    // Validar que los niveles estén ordenados correctamente (puntos ascendentes)
    for (let i = 1; i < niveles.length; i++) {
      if (niveles[i].puntos <= niveles[i - 1].puntos) {
        return NextResponse.json(
          { error: `Los puntos del nivel ${niveles[i].nivel} deben ser mayores que el nivel anterior` },
          { status: 400 }
        );
      }
    }

    // Actualizar cada nivel
    const updates = await Promise.all(
      niveles.map((nivel: any) =>
        prisma.nivelConfig.upsert({
          where: { nivel: nivel.nivel },
          update: {
            nombre: nivel.nombre,
            icono: nivel.icono,
            puntos: nivel.puntos,
            descuento: nivel.descuento,
          },
          create: {
            nivel: nivel.nivel,
            nombre: nivel.nombre,
            icono: nivel.icono,
            puntos: nivel.puntos,
            descuento: nivel.descuento,
          },
        })
      )
    );

    // Invalidar cache
    invalidateNivelesCache();

    return NextResponse.json(updates);
  } catch (error) {
    console.error("Error updating niveles:", error);
    return NextResponse.json(
      { error: "Error al actualizar niveles" },
      { status: 500 }
    );
  }
}

// POST - Agregar un nuevo nivel
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || !isAdmin(session.user.rol)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { nivel, nombre, icono, puntos, descuento } = body;

    if (!nivel || !nombre || !icono || puntos === undefined || descuento === undefined) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    // Verificar que el nivel no exista
    const existing = await prisma.nivelConfig.findUnique({
      where: { nivel },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Ya existe un nivel con ese número" },
        { status: 400 }
      );
    }

    const nuevoNivel = await prisma.nivelConfig.create({
      data: {
        nivel,
        nombre,
        icono,
        puntos,
        descuento,
      },
    });

    return NextResponse.json(nuevoNivel);
  } catch (error) {
    console.error("Error creating nivel:", error);
    return NextResponse.json(
      { error: "Error al crear nivel" },
      { status: 500 }
    );
  }
}

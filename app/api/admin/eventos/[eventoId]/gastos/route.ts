import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin";

// GET - Listar gastos de un evento
export async function GET(
  request: Request,
  { params }: { params: Promise<{ eventoId: string }> }
) {
  try {
    const { eventoId } = await params;
    const session = await auth();

    if (!session?.user || !isAdmin(session.user.rol)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const gastos = await prisma.gastoEvento.findMany({
      where: { eventoId: eventoId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(gastos);
  } catch (error) {
    console.error("Error fetching gastos:", error);
    return NextResponse.json(
      { error: "Error al obtener gastos" },
      { status: 500 }
    );
  }
}

// POST - Crear nuevo gasto
export async function POST(
  request: Request,
  { params }: { params: Promise<{ eventoId: string }> }
) {
  try {
    const { eventoId } = await params;
    const session = await auth();

    if (!session?.user || !isAdmin(session.user.rol)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const {
      concepto,
      descripcion,
      monto,
      esCompartido,
      porcentajeArtista,
      porcentajeBayer,
      proveedor,
      pagado,
    } = body;

    // Validaciones
    if (!concepto || !monto) {
      return NextResponse.json(
        { error: "Concepto y monto son requeridos" },
        { status: 400 }
      );
    }

    if (monto < 0) {
      return NextResponse.json(
        { error: "El monto debe ser positivo" },
        { status: 400 }
      );
    }

    // Si es compartido, validar porcentajes
    if (esCompartido) {
      const pArtista = porcentajeArtista || 50;
      const pBayer = porcentajeBayer || 50;

      if (pArtista + pBayer !== 100) {
        return NextResponse.json(
          { error: "Los porcentajes deben sumar 100%" },
          { status: 400 }
        );
      }
    }

    const gasto = await prisma.gastoEvento.create({
      data: {
        eventoId: eventoId,
        concepto,
        descripcion,
        monto: parseFloat(monto),
        esCompartido: esCompartido || false,
        porcentajeArtista: esCompartido ? parseFloat(porcentajeArtista || 50) : null,
        porcentajeBayer: esCompartido ? parseFloat(porcentajeBayer || 50) : null,
        proveedor,
        pagado: pagado || false,
      },
    });

    return NextResponse.json(gasto);
  } catch (error) {
    console.error("Error creating gasto:", error);
    return NextResponse.json(
      { error: "Error al crear gasto" },
      { status: 500 }
    );
  }
}

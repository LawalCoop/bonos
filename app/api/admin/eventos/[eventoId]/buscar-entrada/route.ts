import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET - Buscar entradas por apellido, nombre o DNI
export async function GET(
  request: NextRequest,
  { params }: { params: { eventoId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.rol !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");

    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        { error: "La búsqueda debe tener al menos 2 caracteres" },
        { status: 400 }
      );
    }

    const searchTerm = query.trim().toLowerCase();

    // Buscar en bonos (por nombre de usuario o email)
    const bonos = await prisma.bono.findMany({
      where: {
        eventoId: params.eventoId,
        estado: { in: ["PAGADO", "UTILIZADO"] },
        usuario: {
          OR: [
            { nombre: { contains: searchTerm, mode: "insensitive" } },
            { apellido: { contains: searchTerm, mode: "insensitive" } },
            { name: { contains: searchTerm, mode: "insensitive" } },
            { email: { contains: searchTerm, mode: "insensitive" } },
          ],
        },
      },
      include: {
        usuario: {
          select: {
            name: true,
            nombre: true,
            apellido: true,
            email: true,
          },
        },
      },
      take: 10,
    });

    // Buscar en ventas externas (por apellido, nombre o DNI)
    const ventasExternas = await prisma.ventaExterna.findMany({
      where: {
        eventoId: params.eventoId,
        OR: [
          { apellido: { contains: searchTerm, mode: "insensitive" } },
          { nombre: { contains: searchTerm, mode: "insensitive" } },
          { dni: { contains: searchTerm, mode: "insensitive" } },
        ],
      },
      take: 10,
    });

    // Combinar resultados
    const resultados = [
      ...bonos.map((bono) => ({
        tipo: "bono",
        bono: {
          codigo: bono.codigo,
          precioFinal: bono.precioFinal,
          usuario: bono.usuario,
        },
        utilizado: bono.estado === "UTILIZADO",
      })),
      ...ventasExternas.map((venta) => ({
        tipo: "venta",
        venta: {
          id: venta.id,
          nombre: venta.nombre,
          apellido: venta.apellido,
          dni: venta.dni,
          precio: venta.precio,
          cantidad: venta.cantidad,
          vendidoPor: venta.vendidoPor,
        },
        utilizado: venta.utilizado,
      })),
    ];

    return NextResponse.json({ resultados });
  } catch (error) {
    console.error("Error al buscar entradas:", error);
    return NextResponse.json(
      { error: "Error al buscar entradas" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

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

    // Count bonos utilizados (ingresados)
    const bonosIngresados = await prisma.bono.count({
      where: {
        eventoId: eventoId,
        estado: "UTILIZADO",
      },
    });

    // Count total bonos pagados (los que pueden ingresar)
    const totalBonosPagados = await prisma.bono.count({
      where: {
        eventoId: eventoId,
        estado: {
          in: ["PAGADO", "UTILIZADO"],
        },
      },
    });

    // Count ventas externas utilizadas (ingresadas)
    const ventasExternasIngresadas = await prisma.ventaExterna.count({
      where: {
        eventoId: eventoId,
        utilizado: true,
      },
    });

    // Count total ventas externas (todas pueden ingresar)
    const totalVentasExternas = await prisma.ventaExterna.count({
      where: {
        eventoId: eventoId,
      },
    });

    // Totals combining both sources
    const ingresados = bonosIngresados + ventasExternasIngresadas;
    const totalPagados = totalBonosPagados + totalVentasExternas;

    return NextResponse.json({
      ingresados,
      totalPagados,
    });
  } catch (error: any) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Error al obtener estadísticas" },
      { status: 500 }
    );
  }
}

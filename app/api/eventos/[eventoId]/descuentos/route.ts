import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { calcularDescuentos } from "@/lib/descuentos";
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
    const { searchParams } = new URL(request.url);
    const cantidadBonos = parseInt(searchParams.get("cantidad") || "1");
    const userIdParam = searchParams.get("userId");
    const emailParam = searchParams.get("email");

    let userId = session?.user?.id;

    // Si es admin y provee userId o email, calcular para ese usuario
    if (session?.user && isAdmin(session.user.rol)) {
      if (emailParam) {
        // Buscar usuario por email
        const user = await prisma.user.findUnique({
          where: { email: emailParam },
          select: { id: true },
        });
        if (user) {
          userId = user.id;
        } else {
          // Usuario no encontrado, devolver solo promociones
          userId = undefined;
        }
      } else if (userIdParam) {
        userId = userIdParam;
      }
    }

    const calculo = await calcularDescuentos(
      eventoId,
      userId,
      cantidadBonos
    );

    return NextResponse.json(calculo);
  } catch (error) {
    console.error("Error calculando descuentos:", error);
    return NextResponse.json(
      { error: "Error al calcular descuentos" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  { params }: { params: { promocionId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || !isAdmin(session.user.rol)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { activo } = body;

    const promocion = await prisma.promocion.update({
      where: { id: params.promocionId },
      data: {
        activo,
      },
    });

    return NextResponse.json(promocion);
  } catch (error) {
    console.error("Error updating promocion:", error);
    return NextResponse.json(
      { error: "Error al actualizar promoción" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { promocionId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || !isAdmin(session.user.rol)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    await prisma.promocion.delete({
      where: { id: params.promocionId },
    });

    return NextResponse.json({ message: "Promoción eliminada" });
  } catch (error) {
    console.error("Error deleting promocion:", error);
    return NextResponse.json(
      { error: "Error al eliminar promoción" },
      { status: 500 }
    );
  }
}

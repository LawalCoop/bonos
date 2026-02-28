import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ bonoId: string }> }
) {
  try {
    const { bonoId } = await params;
    const session = await auth();
    if (!session?.user?.email || !(await isAdmin(session.user.email))) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const { estado } = await req.json();

    // Validar estado
    const estadosValidos = ["PENDIENTE", "PAGADO", "UTILIZADO", "CANCELADO"];
    if (!estadosValidos.includes(estado)) {
      return NextResponse.json(
        { error: "Estado no válido" },
        { status: 400 }
      );
    }

    const bono = await prisma.bono.update({
      where: { id: bonoId },
      data: { estado },
    });

    return NextResponse.json(bono);
  } catch (error: any) {
    console.error("Error actualizando bono:", error);
    return NextResponse.json(
      { error: "Error actualizando bono" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ bonoId: string }> }
) {
  try {
    const { bonoId } = await params;
    const session = await auth();
    if (!session?.user?.email || !(await isAdmin(session.user.email))) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    // Marcar como cancelado en lugar de eliminar
    const bono = await prisma.bono.update({
      where: { id: bonoId },
      data: { estado: "CANCELADO" },
    });

    return NextResponse.json(bono);
  } catch (error: any) {
    console.error("Error cancelando bono:", error);
    return NextResponse.json(
      { error: "Error cancelando bono" },
      { status: 500 }
    );
  }
}

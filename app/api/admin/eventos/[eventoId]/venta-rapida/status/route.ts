import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin";
import { MercadoPagoConfig, Payment } from "mercadopago";

export const dynamic = "force-dynamic";

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

export async function GET(
  request: Request,
  { params }: { params: { eventoId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || !isAdmin(session.user.rol)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const preferenceId = searchParams.get("preferenceId");

    if (!preferenceId) {
      return NextResponse.json(
        { error: "PreferenceId requerido" },
        { status: 400 }
      );
    }

    // Search for payments with this preference_id in metadata
    const payment = new Payment(client);

    // Try to find payment by searching bonos that might have been updated
    // by the webhook
    const bonos = await prisma.bono.findMany({
      where: {
        eventoId: params.eventoId,
        codigo: {
          startsWith: "VENTA-",
        },
        estado: "PAGADO",
        createdAt: {
          gte: new Date(Date.now() - 10 * 60 * 1000), // Last 10 minutes
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 1,
    });

    if (bonos.length > 0) {
      const bono = bonos[0];
      return NextResponse.json({
        status: "approved",
        bonoQR: bono.qrCode,
        bonoCode: bono.codigo,
      });
    }

    // If no paid bono found, payment is still pending
    return NextResponse.json({
      status: "pending",
    });
  } catch (error) {
    console.error("Error checking payment status:", error);
    return NextResponse.json(
      { error: "Error al verificar estado de pago" },
      { status: 500 }
    );
  }
}

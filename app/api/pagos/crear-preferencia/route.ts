import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calcularDescuentos } from "@/lib/descuentos";
import { MercadoPagoConfig, Preference } from "mercadopago";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { eventoId, cantidad } = body;

    if (!eventoId || !cantidad) {
      return NextResponse.json(
        { error: "Faltan datos requeridos" },
        { status: 400 }
      );
    }

    // Obtener evento
    const evento = await prisma.evento.findUnique({
      where: { id: eventoId },
    });

    if (!evento) {
      return NextResponse.json(
        { error: "Evento no encontrado" },
        { status: 404 }
      );
    }

    // Calcular descuentos
    const calculo = await calcularDescuentos(
      eventoId,
      session.user.id,
      cantidad
    );

    // Configurar Mercado Pago
    const client = new MercadoPagoConfig({
      accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || "",
    });

    const preference = new Preference(client);

    // Crear preferencia
    const preferenceData: any = {
      items: [
        {
          id: eventoId,
          title: `${evento.nombre} - ${cantidad} bono${cantidad > 1 ? 's' : ''}`,
          quantity: 1,
          unit_price: calculo.precioFinal,
          currency_id: "ARS",
        },
      ],
      payer: {
        email: session.user.email || "",
        name: session.user.name || "",
      },
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_APP_URL}/pago/exito`,
        failure: `${process.env.NEXT_PUBLIC_APP_URL}/pago/error`,
        pending: `${process.env.NEXT_PUBLIC_APP_URL}/pago/pendiente`,
      },
      auto_return: "approved", // Redirección automática cuando el pago es aprobado
      notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/pagos/webhook`,
      metadata: {
        user_id: session.user.id,
        evento_id: eventoId,
        cantidad: cantidad.toString(),
        descuentos: JSON.stringify(calculo.descuentos),
      },
      statement_descriptor: "LA BAYER EXPERIMENTAL",
      external_reference: `${eventoId}-${session.user.id}-${Date.now()}`,
    };

    console.log("Creando preferencia con datos:", preferenceData);

    const result = await preference.create({
      body: preferenceData,
    });

    return NextResponse.json({
      preferenceId: result.id,
      initPoint: result.init_point,
    });
  } catch (error: any) {
    console.error("Error creando preferencia:", error);
    console.error("Error details:", error.message);
    console.error("Error cause:", error.cause);

    return NextResponse.json(
      {
        error: "Error al crear preferencia de pago",
        details: error.message || "Error desconocido",
        cause: error.cause || null
      },
      { status: 500 }
    );
  }
}

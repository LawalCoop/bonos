import { Resend } from "resend";
import { render } from "@react-email/components";
import BonoEmail from "@/emails/bono-email";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { logger } from "./logger";
import { generateTicketPDF } from "./pdf-ticket";

const resend = new Resend(process.env.RESEND_API_KEY);

interface EnviarBonoEmailParams {
  to: string;
  nombreUsuario: string;
  bonos: Array<{
    codigo: string;
    qrCode: string;
  }>;
  evento: {
    nombre: string;
    fecha: Date;
    horaInicio: string;
    ubicacion: string;
  };
  precioFinal: number;
  descuentos: Array<{
    nombre: string;
    porcentaje: number;
    monto: number;
  }>;
}

export async function enviarBonoEmail({
  to,
  nombreUsuario,
  bonos,
  evento,
  precioFinal,
  descuentos,
}: EnviarBonoEmailParams) {
  try {
    const fechaFormateada = format(evento.fecha, "EEEE d 'de' MMMM", {
      locale: es,
    });

    // Si hay múltiples bonos, enviar uno por email o crear un attachment
    const primerBono = bonos[0];

    const emailHtml = await render(
      BonoEmail({
        nombreUsuario,
        nombreEvento: evento.nombre,
        fecha: fechaFormateada,
        horaInicio: evento.horaInicio,
        ubicacion: evento.ubicacion,
        codigoBono: primerBono.codigo,
        qrCode: primerBono.qrCode,
        precioFinal,
        descuentos,
      })
    );

    logger.info("Intentando enviar email via Resend", {
      to,
      from: process.env.RESEND_FROM_EMAIL || "La Bayer Experimental <onboarding@resend.dev>",
      subject: `Tu bono para ${evento.nombre}`,
    });

    // Generate PDF ticket using jsPDF
    logger.info("Generando PDF ticket", { codigo: primerBono.codigo });
    const pdfBuffer = await generateTicketPDF({
      codigo: primerBono.codigo,
      qrCode: primerBono.qrCode,
      evento: {
        nombre: evento.nombre,
        fecha: evento.fecha,
        horaInicio: evento.horaInicio,
        ubicacion: evento.ubicacion,
      },
      nombreUsuario,
      precioFinal,
    });
    logger.info("PDF ticket generado exitosamente");

    const result = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "La Bayer Experimental <onboarding@resend.dev>",
      to,
      subject: `Tu bono para ${evento.nombre}`,
      html: emailHtml,
      attachments: [
        {
          filename: `ticket-${primerBono.codigo}.pdf`,
          content: pdfBuffer,
        },
      ],
    });

    logger.info("Respuesta de Resend", { result });

    // Check if there's an error in the result
    if (result.error) {
      logger.error("Resend retornó error", { error: result.error });
      throw new Error(`Resend error: ${JSON.stringify(result.error)}`);
    }

    logger.info("Email enviado exitosamente via Resend", { emailId: result.data?.id });
    return result;
  } catch (error: any) {
    logger.error("Error enviando email", {
      error: error.message,
      stack: error.stack,
      to,
    });
    throw error;
  }
}

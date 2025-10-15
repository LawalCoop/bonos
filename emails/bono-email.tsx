import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Img,
  Hr,
  Link,
} from "@react-email/components";

interface BonoEmailProps {
  nombreUsuario: string;
  nombreEvento: string;
  fecha: string;
  horaInicio: string;
  ubicacion: string;
  codigoBono: string;
  qrCode: string;
  precioFinal: number;
  descuentos: Array<{
    nombre: string;
    porcentaje: number;
    monto: number;
  }>;
}

export default function BonoEmail({
  nombreUsuario = "Amigue",
  nombreEvento = "Evento de Prueba",
  fecha = "Sábado 15 de octubre",
  horaInicio = "21:00",
  ubicacion = "La Bayer Experimental",
  codigoBono = "ABC123",
  qrCode = "",
  precioFinal = 5000,
  descuentos = [],
}: BonoEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={heading}>La Bayer Experimental</Text>
            <Text style={subheading}>Tu bono está listo</Text>
          </Section>

          {/* Greeting */}
          <Section style={section}>
            <Text style={text}>
              ¡Hola {nombreUsuario}! 👋
            </Text>
            <Text style={text}>
              Tu bono para <strong>{nombreEvento}</strong> fue generado exitosamente.
            </Text>
          </Section>

          {/* QR Code */}
          <Section style={qrSection}>
            <Text style={qrLabel}>Tu ticket está adjunto</Text>
            <Text style={text}>
              📎 Descargá el archivo adjunto <strong>ticket-{codigoBono}.pdf</strong> para ver tu ticket con código QR
            </Text>
            {qrCode && (
              <Img
                src={qrCode}
                alt="Código QR del bono"
                width="200"
                height="200"
                style={qrImage}
              />
            )}
            <Text style={codigoText}>Código: {codigoBono}</Text>
            <Text style={smallText}>
              Presentá este código QR al ingresar al evento. Podés usar el PDF adjunto o este email.
            </Text>
          </Section>

          <Hr style={divider} />

          {/* Event Details */}
          <Section style={section}>
            <Text style={sectionTitle}>Detalles del evento</Text>
            <Text style={detailText}>
              <strong>📅 Fecha:</strong> {fecha}
            </Text>
            <Text style={detailText}>
              <strong>🕐 Hora:</strong> {horaInicio} hs
            </Text>
            <Text style={detailText}>
              <strong>📍 Lugar:</strong> {ubicacion}
            </Text>
          </Section>

          <Hr style={divider} />

          {/* Payment Details */}
          <Section style={section}>
            <Text style={sectionTitle}>Resumen de pago</Text>
            {descuentos.length > 0 && (
              <>
                <Text style={smallText}>Descuentos aplicados:</Text>
                {descuentos.map((desc, idx) => (
                  <Text key={idx} style={descuentoText}>
                    ✓ {desc.nombre} (-{desc.porcentaje}%): -${desc.monto.toLocaleString()}
                  </Text>
                ))}
              </>
            )}
            <Text style={totalText}>
              Total pagado: <strong>${precioFinal.toLocaleString()}</strong>
            </Text>
          </Section>

          <Hr style={divider} />

          {/* Important Info */}
          <Section style={infoBox}>
            <Text style={infoTitle}>Información importante</Text>
            <Text style={infoText}>
              • Guardá este email para presentarlo el día del evento
            </Text>
            <Text style={infoText}>
              • Llegá con tiempo para validar tu entrada
            </Text>
            <Text style={infoText}>
              • Este bono es personal e intransferible
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Todo lo recaudado va para les artistas y la ampliación de la biblioteca.
              ¡Gracias por apoyar la cultura autogestiva!
            </Text>
            <Hr style={divider} />
            <Text style={footerSmall}>
              Biblioteca Popular Osvaldo Bayer
            </Text>
            <Text style={footerSmall}>
              <Link href="https://labayer.org" style={link}>
                labayer.org
              </Link>{" "}
              •{" "}
              <Link href="mailto:labayerexperimental@gmail.com" style={link}>
                labayerexperimental@gmail.com
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
  width: "100%",
  maxWidth: "600px",
};

const header = {
  padding: "32px 24px",
  backgroundColor: "#1a1a1a",
  textAlign: "center" as const,
};

const heading = {
  fontSize: "28px",
  fontWeight: "bold",
  color: "#ffffff",
  margin: "0",
};

const subheading = {
  fontSize: "16px",
  color: "#a0a0a0",
  margin: "8px 0 0",
};

const section = {
  padding: "24px",
};

const text = {
  color: "#333",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "8px 0",
};

const qrSection = {
  padding: "32px 24px",
  textAlign: "center" as const,
  backgroundColor: "#f9fafb",
};

const qrLabel = {
  fontSize: "18px",
  fontWeight: "600",
  color: "#333",
  marginBottom: "16px",
};

const qrImage = {
  margin: "16px auto",
  border: "4px solid #1a1a1a",
  borderRadius: "8px",
};

const codigoText = {
  fontSize: "14px",
  color: "#666",
  fontFamily: "monospace",
  marginTop: "16px",
};

const smallText = {
  fontSize: "14px",
  color: "#666",
  marginTop: "8px",
};

const divider = {
  borderColor: "#e5e7eb",
  margin: "24px 0",
};

const sectionTitle = {
  fontSize: "18px",
  fontWeight: "600",
  color: "#333",
  marginBottom: "12px",
};

const detailText = {
  fontSize: "15px",
  color: "#555",
  lineHeight: "24px",
  margin: "8px 0",
};

const descuentoText = {
  fontSize: "14px",
  color: "#059669",
  lineHeight: "20px",
  margin: "4px 0",
};

const totalText = {
  fontSize: "18px",
  color: "#333",
  marginTop: "16px",
};

const infoBox = {
  padding: "20px 24px",
  backgroundColor: "#eff6ff",
  borderLeft: "4px solid #3b82f6",
  margin: "24px",
};

const infoTitle = {
  fontSize: "16px",
  fontWeight: "600",
  color: "#1e40af",
  marginBottom: "12px",
};

const infoText = {
  fontSize: "14px",
  color: "#1e3a8a",
  lineHeight: "20px",
  margin: "6px 0",
};

const footer = {
  padding: "0 24px",
};

const footerText = {
  fontSize: "14px",
  color: "#666",
  lineHeight: "20px",
  textAlign: "center" as const,
  marginBottom: "16px",
};

const footerSmall = {
  fontSize: "12px",
  color: "#999",
  textAlign: "center" as const,
  margin: "4px 0",
};

const link = {
  color: "#3b82f6",
  textDecoration: "none",
};

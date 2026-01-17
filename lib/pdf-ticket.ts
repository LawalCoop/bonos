import jsPDF from "jspdf";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface TicketData {
  codigo: string;
  qrCode: string;
  evento: {
    nombre: string;
    fecha: Date;
    horaInicio: string;
    ubicacion: string;
  };
  nombreUsuario: string;
  precioFinal: number;
}

export async function generateTicketPDF(data: TicketData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      // Create PDF - A4 size
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const fechaFormateada = format(data.evento.fecha, "EEEE d 'de' MMMM, yyyy", {
        locale: es,
      });

      // Colors
      const primaryColor = "#1a1a1a";
      const accentColor = "#3b82f6";
      const textColor = "#333333";
      const lightText = "#666666";

      // Page dimensions
      const pageWidth = doc.internal.pageSize.getWidth();
      const centerX = pageWidth / 2;

      // Header background
      doc.setFillColor(26, 26, 26);
      doc.rect(0, 0, pageWidth, 40, "F");

      // Venue name
      doc.setFontSize(12);
      doc.setTextColor(255, 255, 255);
      doc.text("LA BAYER EXPERIMENTAL", centerX, 15, { align: "center" });

      // Event name
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text(data.evento.nombre.toUpperCase(), centerX, 28, { align: "center" });

      // Date and time
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text(`${fechaFormateada} • ${data.evento.horaInicio}hs`, centerX, 36, {
        align: "center",
      });

      // QR Code
      const qrSize = 80;
      const qrX = (pageWidth - qrSize) / 2;
      const qrY = 50;

      // Remove data URI prefix if present
      const qrBase64 = data.qrCode.replace(/^data:image\/png;base64,/, "");
      doc.addImage(qrBase64, "PNG", qrX, qrY, qrSize, qrSize);

      // Ticket Code
      doc.setFontSize(10);
      doc.setTextColor(102, 102, 102);
      doc.text("CÓDIGO DEL BONO", centerX, qrY + qrSize + 10, { align: "center" });

      doc.setFontSize(14);
      doc.setTextColor(51, 51, 51);
      doc.setFont("courier", "bold");
      doc.text(data.codigo, centerX, qrY + qrSize + 18, { align: "center" });

      // Info section
      const infoY = qrY + qrSize + 30;

      // Draw info box
      doc.setFillColor(249, 250, 251);
      doc.rect(20, infoY, pageWidth - 40, 50, "F");

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(102, 102, 102);
      doc.text("ASISTENTE", 25, infoY + 10);

      doc.setFontSize(12);
      doc.setTextColor(51, 51, 51);
      doc.setFont("helvetica", "bold");
      doc.text(data.nombreUsuario, 25, infoY + 18);

      doc.setFontSize(10);
      doc.setTextColor(102, 102, 102);
      doc.setFont("helvetica", "normal");
      doc.text("UBICACIÓN", 25, infoY + 30);

      doc.setFontSize(11);
      doc.setTextColor(51, 51, 51);
      doc.text(data.evento.ubicacion, 25, infoY + 38);

      // Price badge
      doc.setFillColor(59, 130, 246);
      doc.roundedRect(pageWidth - 50, infoY + 8, 30, 12, 2, 2, "F");

      doc.setFontSize(12);
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.text(`$${data.precioFinal.toLocaleString("es-AR")}`, pageWidth - 35, infoY + 16, {
        align: "center",
      });

      // Footer
      doc.setFontSize(9);
      doc.setTextColor(102, 102, 102);
      doc.setFont("helvetica", "normal");
      doc.text("Presentá este código QR al ingresar al evento", centerX, infoY + 60, {
        align: "center",
      });
      doc.text("Biblioteca Popular Osvaldo Bayer", centerX, infoY + 67, {
        align: "center",
      });

      // Convert to buffer
      const pdfBuffer = Buffer.from(doc.output("arraybuffer"));
      resolve(pdfBuffer);
    } catch (error) {
      reject(error);
    }
  });
}

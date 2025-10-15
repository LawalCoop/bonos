"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Download,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  Percent,
  Receipt,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Bordereau {
  evento: {
    id: string;
    nombre: string;
    fecha: string;
    ubicacion: string;
    capacidad: number;
  };
  artistas: Array<{
    nombre: string;
    rol: string | null;
  }>;
  ventas: {
    totalBonos: number;
    totalVentasExternas: number;
    totalEntradas: number;
    capacidad: number;
    porcentajeOcupacion: number;
    totalRecaudadoGeneral: number;
    totalRecaudadoBonos: number;
    totalRecaudadoVentasExternas: number;
    precioBase: number;
    precioPromedio: number;
  };
  ventasExternas: Array<{
    id: string;
    nombre: string;
    apellido: string;
    dni: string;
    precio: number;
    cantidad: number;
    vendidoPor?: string;
    utilizado: boolean;
  }>;
  distribucionPrecios: Array<{
    precio: number;
    cantidad: number;
    porcentaje: number;
    totalRecaudado: number;
  }>;
  descuentos: {
    totalDescuentos: number;
    detalles: Array<{
      tipo: string;
      nombre: string;
      cantidad: number;
      totalDescuento: number;
    }>;
  };
  gastos: {
    total: number;
    compartidos: {
      total: number;
      artista: number;
      bayer: number;
      detalles: Array<{
        concepto: string;
        monto: number;
        porcentajeArtista: number;
        porcentajeBayer: number;
        montoArtista: number;
        montoBayer: number;
        proveedor?: string;
        pagado: boolean;
      }>;
    };
    noCompartidos: {
      total: number;
      detalles: Array<{
        concepto: string;
        monto: number;
        descripcion?: string;
        proveedor?: string;
        pagado: boolean;
      }>;
    };
  };
  distribucion: {
    porcentajes: {
      artista: number;
      bayer: number;
    };
    ingresosNetos: number;
    gastosCompartidosTotal: number;
    artista: {
      porcentajeIngresos: number;
      montoIngresos: number;
      ventasExternasYaCobradas: number;
      montoFinal: number;
    };
    bayer: {
      porcentajeIngresos: number;
      montoIngresos: number;
      gastosExclusivos: number;
      montoFinal: number;
    };
  };
}

export default function BordoereauPage() {
  const params = useParams();
  const router = useRouter();
  const [bordereau, setBordereau] = useState<Bordereau | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBordereau();
  }, []);

  const fetchBordereau = async () => {
    try {
      const res = await fetch(`/api/admin/eventos/${params.eventoId}/bordereau`);
      if (res.ok) {
        const data = await res.json();
        setBordereau(data);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!bordereau) {
      alert("No hay datos del bordereau para generar el PDF");
      return;
    }

    try {
      console.log("Iniciando descarga de PDF...");

      // Dynamic import both modules
      const jsPDFModule = await import("jspdf");
      const autoTableModule = await import("jspdf-autotable");

      // Get jsPDF class
      const jsPDF = jsPDFModule.jsPDF || jsPDFModule.default;
      console.log("jsPDF importado correctamente");

      // Get autoTable function
      const autoTable = autoTableModule.default || autoTableModule.autoTable;
      console.log("jspdf-autotable importado correctamente");

      // Create doc instance
      const doc = new jsPDF() as any;
      console.log("Documento PDF creado", typeof doc.autoTable);

      // Configurar fuente predeterminada - Times es más formal y elegante
      doc.setFont("times", "normal");

      // Helper function to call autoTable - use as standalone or bound method
      const callAutoTable = (options: any) => {
        if (typeof doc.autoTable === 'function') {
          return doc.autoTable(options);
        } else if (typeof autoTable === 'function') {
          return autoTable(doc, options);
        } else {
          throw new Error('autoTable no está disponible');
        }
      };

      // Encabezado con fondo oscuro
      doc.setFillColor(33, 33, 33); // Gris muy oscuro
      doc.rect(0, 0, 210, 45, 'F');

      // Título principal
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(32);
      doc.setFont("times", "bold");
      doc.text("BORDEREAU", 105, 18, { align: "center" });

      doc.setFontSize(12);
      doc.setFont("times", "italic");
      doc.text("Liquidacion de Evento Cultural", 105, 26, { align: "center" });

      // Nombre de la institución
      doc.setFontSize(9);
      doc.setFont("times", "normal");
      doc.text("La Bayer Experimental - Biblioteca Popular Osvaldo Bayer", 105, 32, { align: "center" });

      // Badge decorativo
      doc.setFillColor(70, 70, 70); // Gris oscuro
      doc.roundedRect(160, 8, 42, 8, 2, 2, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      doc.text("SIN FINES DE LUCRO", 181, 13, { align: "center" });

      // Resetear color de texto
      doc.setTextColor(0, 0, 0);

      // Línea decorativa sólida
      doc.setDrawColor(33, 33, 33);
      doc.setLineWidth(2);
      doc.line(14, 46, 196, 46);
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.line(14, 47.5, 196, 47.5);

      // Información del documento en cajas
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.3);

      const fechaEmision = format(new Date(), "dd/MM/yyyy HH:mm");

      // Caja izquierda - Fecha
      doc.setFillColor(245, 247, 250);
      doc.roundedRect(14, 52, 88, 12, 2, 2, 'FD');
      doc.setFontSize(7);
      doc.setTextColor(100, 100, 100);
      doc.setFont("helvetica", "normal");
      doc.text("FECHA DE EMISION", 16, 57);
      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);
      doc.setFont("times", "bold");
      doc.text(fechaEmision, 16, 62);

      // Caja derecha - Número de documento
      doc.setFillColor(245, 247, 250);
      doc.roundedRect(108, 52, 88, 12, 2, 2, 'FD');
      doc.setFontSize(7);
      doc.setTextColor(100, 100, 100);
      doc.setFont("helvetica", "normal");
      doc.text("DOCUMENTO N", 110, 57);
      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);
      doc.setFont("courier", "bold");
      doc.text(`BRD-${bordereau.evento.id.substring(0, 8).toUpperCase()}`, 110, 62);

      // Info del evento con diseño atractivo
      let yPos = 70;

      // Caja destacada para datos del evento
      doc.setFillColor(250, 250, 250);
      doc.setDrawColor(180, 180, 180);
      doc.setLineWidth(0.3);
      doc.roundedRect(14, yPos, 182, 32, 3, 3, 'FD');

      yPos += 6;
      doc.setFontSize(11);
      doc.setFont("times", "bold");
      doc.setTextColor(33, 33, 33);
      doc.text("DATOS DEL EVENTO", 18, yPos);
      doc.setTextColor(0, 0, 0);
      yPos += 8;

      doc.setFontSize(9);
      doc.setFont("times", "bold");
      doc.text("Nombre:", 18, yPos);
      doc.setFont("times", "normal");
      doc.text(bordereau.evento.nombre, 38, yPos);
      yPos += 5;

      doc.setFont("times", "bold");
      doc.text("Fecha:", 18, yPos);
      doc.setFont("times", "normal");
      doc.text(
        format(new Date(bordereau.evento.fecha), "PPP", { locale: es }),
        38,
        yPos
      );
      yPos += 5;

      doc.setFont("times", "bold");
      doc.text("Ubicacion:", 18, yPos);
      doc.setFont("times", "normal");
      doc.text(bordereau.evento.ubicacion, 38, yPos);

      doc.setFont("times", "bold");
      doc.text("Capacidad:", 120, yPos);
      doc.setFont("times", "normal");
      doc.text(`${bordereau.evento.capacidad} personas`, 145, yPos);
      yPos += 5;

      // Artistas
      if (bordereau.artistas.length > 0) {
        doc.setFont("times", "bold");
        doc.text("Artistas:", 18, yPos);
        doc.setFont("times", "normal");
        const artistasText = bordereau.artistas
          .map((a) => `${a.nombre}${a.rol ? ` (${a.rol})` : ""}`)
          .join(", ");
        doc.text(artistasText, 38, yPos, { maxWidth: 150 });
      }

      yPos += 12;

      // Resumen de ventas
      doc.setFontSize(12);
      doc.setFont("times", "bold");
      doc.setTextColor(33, 33, 33);
      doc.text("RESUMEN DE VENTAS", 14, yPos);
      doc.setTextColor(0, 0, 0);
      yPos += 8;

      doc.setFontSize(10);
      doc.setFont("times", "normal");
      doc.text(
        `Entradas vendidas: ${bordereau.ventas.totalEntradas} (${bordereau.ventas.totalBonos} online + ${bordereau.ventas.totalVentasExternas} externas)`,
        14,
        yPos
      );
      yPos += 6;
      doc.text(
        `Capacidad: ${bordereau.ventas.capacidad} (${bordereau.ventas.porcentajeOcupacion.toFixed(1)}% ocupacion)`,
        14,
        yPos
      );
      yPos += 6;
      doc.text(
        `Total recaudado general: $${bordereau.ventas.totalRecaudadoGeneral.toLocaleString("es-AR")} (Bonos: $${bordereau.ventas.totalRecaudadoBonos.toLocaleString("es-AR")} + Externas: $${bordereau.ventas.totalRecaudadoVentasExternas.toLocaleString("es-AR")})`,
        14,
        yPos
      );
      yPos += 6;
      doc.text(
        `Precio promedio: $${bordereau.ventas.precioPromedio.toFixed(0)}`,
        14,
        yPos
      );
      yPos += 10;

      // Distribución de precios
      if (bordereau.distribucionPrecios.length > 0) {
        doc.setFontSize(12);
        doc.setFont(undefined, "bold");
        doc.setTextColor(33, 33, 33);
        doc.text("DISTRIBUCION POR PRECIO", 14, yPos);
        doc.setTextColor(0, 0, 0);
        yPos += 8;

        callAutoTable({
          startY: yPos,
          head: [["Precio", "Cantidad", "Porcentaje", "Recaudado"]],
          body: bordereau.distribucionPrecios.map((p) => [
            `$${p.precio}`,
            p.cantidad,
            `${p.porcentaje.toFixed(1)}%`,
            `$${p.totalRecaudado.toLocaleString("es-AR")}`,
          ]),
          theme: "striped",
          headStyles: {
            fillColor: [70, 70, 70],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            halign: 'center',
            font: 'helvetica'
          },
          styles: { fontSize: 9, halign: 'center', font: 'times' },
          alternateRowStyles: { fillColor: [248, 248, 248] },
        });

        yPos = (doc.lastAutoTable?.finalY || yPos) + 10;
      }

      // Ventas Externas
      if (bordereau.ventasExternas && bordereau.ventasExternas.length > 0) {
        if (yPos > 220) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFontSize(12);
        doc.setFont(undefined, "bold");
        doc.setTextColor(33, 33, 33);
        doc.text("VENTAS EXTERNAS (SIN QR)", 14, yPos);
        doc.setTextColor(0, 0, 0);
        yPos += 8;

        callAutoTable({
          startY: yPos,
          head: [["Comprador", "DNI", "Precio", "Cant.", "Total", "Vendido Por"]],
          body: bordereau.ventasExternas.map((v) => [
            `${v.apellido}, ${v.nombre}`,
            v.dni,
            `$${v.precio}`,
            v.cantidad,
            `$${(v.precio * v.cantidad).toLocaleString("es-AR")}`,
            v.vendidoPor || "-",
          ]),
          theme: "striped",
          headStyles: {
            fillColor: [70, 70, 70],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            halign: 'center'
          },
          styles: { fontSize: 9 },
          columnStyles: {
            0: { halign: 'left' },
            1: { halign: 'center' },
            2: { halign: 'right' },
            3: { halign: 'center' },
            4: { halign: 'right' },
            5: { halign: 'left' },
          },
          alternateRowStyles: { fillColor: [248, 248, 248] },
        });

        yPos = (doc.lastAutoTable?.finalY || yPos) + 8;
        doc.setFontSize(10);
        doc.setFont(undefined, "bold");
        doc.text(
          `Total ventas externas: $${bordereau.ventas.totalRecaudadoVentasExternas.toLocaleString("es-AR")} (${bordereau.ventas.totalVentasExternas} entradas)`,
          14,
          yPos
        );
        yPos += 10;
      }

      // Descuentos
      if (bordereau.descuentos.detalles.length > 0) {
        doc.setFontSize(12);
        doc.setFont(undefined, "bold");
        doc.setTextColor(33, 33, 33);
        doc.text("DESCUENTOS APLICADOS", 14, yPos);
        doc.setTextColor(0, 0, 0);
        yPos += 8;

        callAutoTable({
          startY: yPos,
          head: [["Descuento", "Aplicaciones", "Total"]],
          body: bordereau.descuentos.detalles.map((d) => [
            d.nombre,
            d.cantidad,
            `-$${d.totalDescuento.toLocaleString("es-AR")}`,
          ]),
          theme: "striped",
          headStyles: {
            fillColor: [70, 70, 70],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            halign: 'center'
          },
          styles: { fontSize: 9 },
          alternateRowStyles: { fillColor: [248, 248, 248] },
        });

        yPos = (doc.lastAutoTable?.finalY || yPos) + 8;
        doc.setFontSize(10);
        doc.setFont(undefined, "bold");
        doc.text(
          `Total descuentos: -$${bordereau.descuentos.totalDescuentos.toLocaleString("es-AR")}`,
          14,
          yPos
        );
        yPos += 10;
      }

      // Gastos compartidos
      if (bordereau.gastos.compartidos.detalles.length > 0) {
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFontSize(12);
        doc.setFont(undefined, "bold");
        doc.setTextColor(33, 33, 33);
        doc.text("GASTOS COMPARTIDOS", 14, yPos);
        doc.setTextColor(0, 0, 0);
        yPos += 8;

        callAutoTable({
          startY: yPos,
          head: [["Concepto", "Monto Total", "Artista", "Bayer"]],
          body: bordereau.gastos.compartidos.detalles.map((g) => [
            g.concepto,
            `$${g.monto.toLocaleString("es-AR")}`,
            `${g.porcentajeArtista}% ($${g.montoArtista.toLocaleString("es-AR")})`,
            `${g.porcentajeBayer}% ($${g.montoBayer.toLocaleString("es-AR")})`,
          ]),
          theme: "striped",
          headStyles: {
            fillColor: [70, 70, 70],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            halign: 'center'
          },
          styles: { fontSize: 9 },
          alternateRowStyles: { fillColor: [248, 248, 248] },
        });

        yPos = (doc.lastAutoTable?.finalY || yPos) + 10;
      }

      // Gastos exclusivos Bayer
      if (bordereau.gastos.noCompartidos.detalles.length > 0) {
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFontSize(12);
        doc.setFont(undefined, "bold");
        doc.setTextColor(33, 33, 33);
        doc.text("GASTOS EXCLUSIVOS BAYER", 14, yPos);
        doc.setTextColor(0, 0, 0);
        yPos += 8;

        callAutoTable({
          startY: yPos,
          head: [["Concepto", "Monto"]],
          body: bordereau.gastos.noCompartidos.detalles.map((g) => [
            g.concepto,
            `$${g.monto.toLocaleString("es-AR")}`,
          ]),
          theme: "striped",
          headStyles: {
            fillColor: [70, 70, 70],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            halign: 'center'
          },
          styles: { fontSize: 9 },
          alternateRowStyles: { fillColor: [248, 248, 248] },
        });

        yPos = (doc.lastAutoTable?.finalY || yPos) + 10;
      }

      // Distribución final
      if (yPos > 220) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(14);
      doc.setFont(undefined, "bold");
      doc.setTextColor(33, 33, 33);
      doc.text("DISTRIBUCION FINAL", 14, yPos);
      doc.setTextColor(0, 0, 0);
      yPos += 10;

      doc.setFontSize(11);
      doc.text(
        `Total recaudado (bonos): $${bordereau.ventas.totalRecaudadoBonos.toLocaleString("es-AR")}`,
        14,
        yPos
      );
      yPos += 6;
      doc.text(
        `Gastos compartidos: -$${bordereau.distribucion.gastosCompartidosTotal.toLocaleString("es-AR")}`,
        14,
        yPos
      );
      yPos += 6;
      doc.setFont(undefined, "bold");
      doc.text(
        `Ingresos netos a distribuir: $${bordereau.distribucion.ingresosNetos.toLocaleString("es-AR")}`,
        14,
        yPos
      );
      doc.setFont(undefined, "normal");
      yPos += 10;

      // Tabla de distribución
      callAutoTable({
        startY: yPos,
        head: [["", "Artista/Productor", "La Bayer"]],
        body: [
          [
            "Porcentaje",
            `${bordereau.distribucion.porcentajes.artista}%`,
            `${bordereau.distribucion.porcentajes.bayer}%`,
          ],
          [
            "Monto distribuido",
            `$${bordereau.distribucion.artista.montoIngresos.toLocaleString("es-AR")}`,
            `$${bordereau.distribucion.bayer.montoIngresos.toLocaleString("es-AR")}`,
          ],
          ...(bordereau.distribucion.artista.ventasExternasYaCobradas > 0 ? [[
            "Ventas externas (ya cobradas)",
            `-$${bordereau.distribucion.artista.ventasExternasYaCobradas.toLocaleString("es-AR")}`,
            "-",
          ]] : []),
          ...(bordereau.distribucion.bayer.gastosExclusivos > 0 ? [[
            "Gastos exclusivos Bayer",
            "-",
            `-$${bordereau.distribucion.bayer.gastosExclusivos.toLocaleString("es-AR")}`,
          ]] : []),
          [
            "MONTO FINAL A PAGAR",
            `$${bordereau.distribucion.artista.montoFinal.toLocaleString("es-AR")}`,
            `$${bordereau.distribucion.bayer.montoFinal.toLocaleString("es-AR")}`,
          ],
        ],
        theme: "striped",
        headStyles: {
          fillColor: [70, 70, 70],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          halign: 'center'
        },
        styles: { fontSize: 10, halign: 'center' },
        columnStyles: {
          0: { fontStyle: "bold", halign: 'left' },
        },
        alternateRowStyles: { fillColor: [248, 248, 248] },
        didParseCell: function (data: any) {
          // Calcular cantidad de filas
          let rowCount = 2; // Porcentaje + Monto distribuido
          if (bordereau.distribucion.artista.ventasExternasYaCobradas > 0) rowCount++;
          if (bordereau.distribucion.bayer.gastosExclusivos > 0) rowCount++;
          const lastRowIndex = rowCount; // MONTO FINAL A PAGAR

          // Resaltar la última fila (MONTO FINAL A PAGAR)
          if (data.row.index === lastRowIndex) {
            data.cell.styles.fontStyle = "bold";
            data.cell.styles.fontSize = 11;
            data.cell.styles.fillColor = [230, 230, 230];
          }

          // Resaltar fila de ventas externas (resta) con color rojo claro
          if (bordereau.distribucion.artista.ventasExternasYaCobradas > 0 && data.row.index === 2) {
            data.cell.styles.fillColor = [255, 240, 240]; // Red tint para indicar resta
          }
        },
      });

      // Cierre profesional con firmas
      yPos = (doc.lastAutoTable?.finalY || yPos) + 15;

      // Verificar si necesitamos nueva página para el cierre
      if (yPos > 220) {
        doc.addPage();
        yPos = 20;
      }

      // Línea decorativa antes del cierre
      doc.setLineWidth(0.5);
      doc.line(14, yPos, 196, yPos);
      yPos += 10;

      // Información sobre la institución
      doc.setFontSize(9);
      doc.setFont("times", "bold");
      doc.text("SOBRE LA INSTITUCION", 14, yPos);
      yPos += 6;

      doc.setFont("times", "italic");
      doc.setFontSize(8);
      const textoCompleto = "La Biblioteca Popular Osvaldo Bayer es una asociacion civil sin fines de lucro. Todos los fondos recaudados son reinvertidos en la biblioteca y en proyectos comunitarios. Somos un espacio cultural autogestivo e impulsado por personas que lo eligen como lugar de encuentro y transformacion social. Este evento forma parte de nuestra mision de promover la cultura accesible y fortalecer los lazos comunitarios.";

      // Usar splitTextToSize para que ocupe todo el ancho
      const lineasInstitucion = doc.splitTextToSize(textoCompleto, 182);
      lineasInstitucion.forEach((linea: string) => {
        doc.text(linea, 14, yPos);
        yPos += 4;
      });

      yPos += 8;

      // Texto de cierre
      doc.setFontSize(10);
      doc.setFont("times", "italic");
      doc.text(
        "El presente documento constituye la liquidacion oficial del evento mencionado.",
        105,
        yPos,
        { align: "center", maxWidth: 170 }
      );
      yPos += 10;
      doc.text(
        "Ambas partes declaran estar conformes con los montos detallados en este bordereau.",
        105,
        yPos,
        { align: "center", maxWidth: 170 }
      );
      yPos += 20;

      // Sección de firmas
      const firmaPosY = yPos;

      // Firma Artista/Productor (izquierda)
      doc.setFontSize(10);
      doc.setFont("times", "normal");
      doc.line(20, firmaPosY, 85, firmaPosY); // Línea de firma
      doc.setFont("times", "bold");
      doc.text("Artista/Productor", 52.5, firmaPosY + 6, { align: "center" });
      doc.setFont("times", "normal");
      doc.setFontSize(8);

      // Campos en blanco para completar
      doc.text("Nombre: _______________________________", 20, firmaPosY + 12);
      doc.text("Rol: _______________________________________", 20, firmaPosY + 17);
      doc.text("DNI: _______________________________________", 20, firmaPosY + 22);
      doc.setFontSize(7);
      doc.setTextColor(100, 100, 100);
      doc.text("Firma y aclaracion", 52.5, firmaPosY + 28, { align: "center" });
      doc.setTextColor(0, 0, 0);

      // Firma La Bayer (derecha)
      doc.setFontSize(10);
      doc.setFont("times", "normal");
      doc.line(125, firmaPosY, 190, firmaPosY); // Línea de firma
      doc.setFont("times", "bold");
      doc.text("La Bayer Experimental", 157.5, firmaPosY + 6, { align: "center" });
      doc.setFont("times", "normal");
      doc.setFontSize(8);

      // Campos en blanco para completar
      doc.text("Nombre: _______________________________", 125, firmaPosY + 12);
      doc.text("Rol: _______________________________________", 125, firmaPosY + 17);
      doc.text("DNI: _______________________________________", 125, firmaPosY + 22);
      doc.setFontSize(7);
      doc.setTextColor(100, 100, 100);
      doc.text("Firma y aclaracion", 157.5, firmaPosY + 28, { align: "center" });
      doc.setTextColor(0, 0, 0);

      yPos = firmaPosY + 35;

      // Footer con información adicional
      doc.setFontSize(7);
      doc.setFont(undefined, "italic");
      doc.setTextColor(100, 100, 100);
      doc.text(
        `Documento generado automáticamente el ${format(new Date(), "PPpp", { locale: es })}`,
        105,
        yPos,
        { align: "center" }
      );
      yPos += 4;
      doc.text(
        "Este documento tiene validez administrativa. Conservar para fines contables.",
        105,
        yPos,
        { align: "center" }
      );

      // Resetear color del texto
      doc.setTextColor(0, 0, 0);

      // Guardar PDF
      const fileName = `Bordereau_${bordereau.evento.nombre.replace(/\s+/g, "_")}_${format(new Date(bordereau.evento.fecha), "yyyy-MM-dd")}.pdf`;
      console.log("Guardando PDF con nombre:", fileName);
      doc.save(fileName);
      console.log("PDF guardado exitosamente");
    } catch (error) {
      console.error("Error generando PDF:", error);
      alert(`Error al generar el PDF: ${error instanceof Error ? error.message : "Error desconocido"}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!bordereau) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </div>
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-gray-500">No se pudo cargar el bordereau</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Bordereau</h1>
            <p className="text-gray-500">{bordereau.evento.nombre}</p>
          </div>
        </div>
        <Button onClick={handleDownloadPDF}>
          <Download className="h-4 w-4 mr-2" />
          Descargar PDF
        </Button>
      </div>

      {/* Info del Evento */}
      <Card>
        <CardHeader>
          <CardTitle>Información del Evento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Fecha</p>
              <p className="font-medium">
                {format(new Date(bordereau.evento.fecha), "PPP", { locale: es })}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Ubicación</p>
              <p className="font-medium">{bordereau.evento.ubicacion}</p>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-2">Artistas</p>
            <div className="flex flex-wrap gap-2">
              {bordereau.artistas.map((artista, idx) => (
                <Badge key={idx} variant="secondary">
                  {artista.nombre}
                  {artista.rol && ` (${artista.rol})`}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumen de Ventas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Entradas Vendidas</p>
                <p className="text-2xl font-bold">{bordereau.ventas.totalEntradas}</p>
                <p className="text-xs text-gray-500">
                  {bordereau.ventas.totalBonos} online + {bordereau.ventas.totalVentasExternas} externas
                </p>
                <p className="text-xs text-gray-500">
                  de {bordereau.ventas.capacidad} ({bordereau.ventas.porcentajeOcupacion.toFixed(1)}%)
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Recaudado</p>
                <p className="text-2xl font-bold">
                  ${bordereau.ventas.totalRecaudadoGeneral.toLocaleString("es-AR")}
                </p>
                <p className="text-xs text-gray-500">
                  Bonos: ${bordereau.ventas.totalRecaudadoBonos.toLocaleString("es-AR")} + Externas: ${bordereau.ventas.totalRecaudadoVentasExternas.toLocaleString("es-AR")}
                </p>
                <p className="text-xs text-gray-500">
                  Promedio: ${bordereau.ventas.precioPromedio.toFixed(0)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Descuentos</p>
                <p className="text-2xl font-bold text-orange-600">
                  -${bordereau.descuentos.totalDescuentos.toLocaleString("es-AR")}
                </p>
                <p className="text-xs text-gray-500">
                  {bordereau.descuentos.detalles.reduce(
                    (sum, d) => sum + d.cantidad,
                    0
                  )}{" "}
                  aplicados
                </p>
              </div>
              <Percent className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Gastos</p>
                <p className="text-2xl font-bold text-red-600">
                  -${bordereau.gastos.total.toLocaleString("es-AR")}
                </p>
                <p className="text-xs text-gray-500">
                  Compartidos + Exclusivos
                </p>
              </div>
              <Receipt className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Distribución de Precios */}
      <Card>
        <CardHeader>
          <CardTitle>Distribución por Precio Pagado</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {bordereau.distribucionPrecios.map((precio, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="font-mono font-bold text-lg">
                    ${precio.precio}
                  </div>
                  <div className="text-sm text-gray-500">
                    {precio.cantidad} bonos ({precio.porcentaje.toFixed(1)}%)
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    ${precio.totalRecaudado.toLocaleString("es-AR")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Ventas Externas */}
      {bordereau.ventasExternas && bordereau.ventasExternas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Ventas Externas (sin QR)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {bordereau.ventasExternas.map((venta) => (
                <div
                  key={venta.id}
                  className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{venta.apellido}, {venta.nombre}</p>
                    <p className="text-sm text-gray-500">
                      DNI: {venta.dni} · {venta.cantidad} entrada{venta.cantidad > 1 ? 's' : ''}
                      {venta.vendidoPor && ` · Vendido por: ${venta.vendidoPor}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-purple-600">
                      ${(venta.precio * venta.cantidad).toLocaleString("es-AR")}
                    </p>
                    <p className="text-xs text-gray-500">
                      ${venta.precio} c/u
                    </p>
                  </div>
                </div>
              ))}
              <div className="pt-2 border-t">
                <div className="flex justify-between text-sm font-medium">
                  <span>Total Ventas Externas:</span>
                  <span className="text-purple-600">
                    ${bordereau.ventas.totalRecaudadoVentasExternas.toLocaleString("es-AR")}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Descuentos Aplicados */}
      {bordereau.descuentos.detalles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Descuentos Aplicados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {bordereau.descuentos.detalles.map((desc, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{desc.nombre}</p>
                    <p className="text-sm text-gray-500">
                      {desc.cantidad} aplicaciones
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-orange-600">
                      -${desc.totalDescuento.toLocaleString("es-AR")}
                    </p>
                    <p className="text-xs text-gray-500">
                      Promedio: -$
                      {(desc.totalDescuento / desc.cantidad).toFixed(0)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Gastos */}
      {bordereau.gastos.total > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Gastos Compartidos */}
          {bordereau.gastos.compartidos.detalles.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Gastos Compartidos</span>
                  <Badge variant="outline">
                    ${bordereau.gastos.compartidos.total.toLocaleString("es-AR")}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {bordereau.gastos.compartidos.detalles.map((gasto, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{gasto.concepto}</p>
                      <Badge
                        variant={gasto.pagado ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {gasto.pagado ? "Pagado" : "Pendiente"}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-gray-500">Artista ({gasto.porcentajeArtista}%)</p>
                        <p className="font-medium">
                          ${gasto.montoArtista.toLocaleString("es-AR")}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Bayer ({gasto.porcentajeBayer}%)</p>
                        <p className="font-medium">
                          ${gasto.montoBayer.toLocaleString("es-AR")}
                        </p>
                      </div>
                    </div>
                    {gasto.proveedor && (
                      <p className="text-xs text-gray-500">
                        Proveedor: {gasto.proveedor}
                      </p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Gastos No Compartidos (solo Bayer) */}
          {bordereau.gastos.noCompartidos.detalles.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Gastos Exclusivos Bayer</span>
                  <Badge variant="outline">
                    ${bordereau.gastos.noCompartidos.total.toLocaleString("es-AR")}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {bordereau.gastos.noCompartidos.detalles.map((gasto, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium">{gasto.concepto}</p>
                      <Badge
                        variant={gasto.pagado ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {gasto.pagado ? "Pagado" : "Pendiente"}
                      </Badge>
                    </div>
                    <p className="text-lg font-bold">
                      ${gasto.monto.toLocaleString("es-AR")}
                    </p>
                    {gasto.descripcion && (
                      <p className="text-sm text-gray-500 mt-1">
                        {gasto.descripcion}
                      </p>
                    )}
                    {gasto.proveedor && (
                      <p className="text-xs text-gray-500 mt-1">
                        Proveedor: {gasto.proveedor}
                      </p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Distribución Final */}
      <Card className="border-2 border-blue-200 dark:border-blue-800">
        <CardHeader className="bg-blue-50 dark:bg-blue-900/20">
          <CardTitle className="text-2xl">Distribución Final</CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {/* Cálculo de Ingresos Netos */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Total recaudado (bonos)</span>
              <span className="font-medium">${bordereau.ventas.totalRecaudadoBonos.toLocaleString("es-AR")}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-red-600">
              <span>Gastos compartidos</span>
              <span className="font-medium">-${bordereau.distribucion.gastosCompartidosTotal.toLocaleString("es-AR")}</span>
            </div>
            <div className="pt-2 border-t border-gray-300 dark:border-gray-600">
              <div className="flex items-center justify-between">
                <span className="font-bold">Ingresos netos a distribuir</span>
                <span className="text-2xl font-bold">${bordereau.distribucion.ingresosNetos.toLocaleString("es-AR")}</span>
              </div>
            </div>
          </div>

          {/* Split Artista/Bayer */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Artista */}
            <div className="p-6 bg-green-50 dark:bg-green-900/20 rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">Artista/Productor</h3>
                <Badge variant="outline" className="text-lg px-3 py-1">
                  {bordereau.distribucion.porcentajes.artista}%
                </Badge>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Monto distribuido ({bordereau.distribucion.porcentajes.artista}%)</span>
                  <span className="font-medium">
                    ${bordereau.distribucion.artista.montoIngresos.toLocaleString("es-AR")}
                  </span>
                </div>

                {bordereau.distribucion.artista.ventasExternasYaCobradas > 0 && (
                  <div className="flex items-center justify-between text-sm bg-red-50 dark:bg-red-900/20 p-2 rounded">
                    <span className="text-red-700 dark:text-red-300">Ventas externas (ya cobradas)</span>
                    <span className="font-medium text-red-700 dark:text-red-300">
                      -${bordereau.distribucion.artista.ventasExternasYaCobradas.toLocaleString("es-AR")}
                    </span>
                  </div>
                )}

                <div className="pt-3 border-t-2 border-green-200 dark:border-green-700">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold">Monto Final a Pagar</span>
                    <span className="text-2xl font-bold text-green-600">
                      ${bordereau.distribucion.artista.montoFinal.toLocaleString("es-AR")}
                    </span>
                  </div>
                  {bordereau.distribucion.artista.ventasExternasYaCobradas > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      (Descontados ${bordereau.distribucion.artista.ventasExternasYaCobradas.toLocaleString("es-AR")} de ventas externas ya cobradas)
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Bayer */}
            <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">La Bayer</h3>
                <Badge variant="outline" className="text-lg px-3 py-1">
                  {bordereau.distribucion.porcentajes.bayer}%
                </Badge>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Monto distribuido ({bordereau.distribucion.porcentajes.bayer}%)</span>
                  <span className="font-medium">
                    ${bordereau.distribucion.bayer.montoIngresos.toLocaleString("es-AR")}
                  </span>
                </div>

                {bordereau.distribucion.bayer.gastosExclusivos > 0 && (
                  <div className="flex items-center justify-between text-sm text-red-600">
                    <span>Gastos exclusivos</span>
                    <span className="font-medium">
                      -${bordereau.distribucion.bayer.gastosExclusivos.toLocaleString("es-AR")}
                    </span>
                  </div>
                )}

                <div className="pt-3 border-t-2 border-blue-200 dark:border-blue-700">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold">Monto Final</span>
                    <span className="text-2xl font-bold text-blue-600">
                      ${bordereau.distribucion.bayer.montoFinal.toLocaleString("es-AR")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

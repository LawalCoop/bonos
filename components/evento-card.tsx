import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, Tag } from "lucide-react";

interface EventoCardProps {
  evento: {
    id: string;
    nombre: string;
    slug: string;
    fecha: Date;
    horaInicio: string;
    ubicacion: string;
    imagenPrincipal: string;
    precioBase: number;
    esFechaEspecial: boolean;
    precioEspecial?: number | null;
    artistas: Array<{
      artista: {
        nombre: string;
        ciudad: string;
        esLocal: boolean;
      };
      rol?: string | null;
    }>;
    promociones?: Array<{
      id: string;
      nombre: string;
      tipo: string;
      valor: number;
    }>;
    descuentos?: Array<{
      tipo: string;
      nombre: string;
      porcentaje: number;
      monto: number;
    }>;
    precioFinal?: number;
    totalDescuento?: number;
  };
}

export function EventoCard({ evento }: EventoCardProps) {
  const precio = evento.esFechaEspecial && evento.precioEspecial
    ? evento.precioEspecial
    : evento.precioBase;

  const promocion = evento.promociones?.[0]; // La de mayor prioridad

  // Calcular descuento equivalente de la promoción
  let descuentoPromocion = 0;
  let precioConPromocion = precio;

  if (promocion) {
    if (promocion.tipo === "2x1") {
      descuentoPromocion = 50; // 2x1 = 50% descuento
      precioConPromocion = precio / 2; // Precio efectivo por bono
    } else if (promocion.tipo === "PORCENTAJE") {
      descuentoPromocion = promocion.valor;
      precioConPromocion = precio * (1 - promocion.valor / 100);
    } else if (promocion.tipo === "MONTO_FIJO") {
      descuentoPromocion = (promocion.valor / precio) * 100;
      precioConPromocion = precio - promocion.valor;
    }
  }

  // Calcular descuento total del usuario
  const totalDescuentoUsuario = evento.descuentos?.reduce((sum, d) => sum + d.porcentaje, 0) || 0;

  // Determinar qué es mejor
  const usarPromocion = promocion && descuentoPromocion > totalDescuentoUsuario;
  const usarDescuentosUsuario = !usarPromocion && evento.precioFinal !== undefined && totalDescuentoUsuario > 0;

  const headliner = evento.artistas.find(a => a.rol === "Headliner") || evento.artistas[0];
  const totalArtistas = evento.artistas.length;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <Link href={`/eventos/${evento.slug}`}>
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
          <Image
            src={evento.imagenPrincipal}
            alt={evento.nombre}
            fill
            className="object-cover transition-transform hover:scale-105"
          />
          <div className="absolute top-2 right-2 flex flex-col gap-2 items-end">
            {evento.esFechaEspecial && (
              <Badge variant="destructive">
                Fecha especial
              </Badge>
            )}
            {promocion && (
              <Badge className="bg-green-600">
                {promocion.tipo === "2x1" && "🎉 2x1"}
                {promocion.tipo === "PORCENTAJE" && `🎉 ${promocion.valor}% OFF`}
                {promocion.tipo === "MONTO_FIJO" && `🎉 $${promocion.valor} OFF`}
              </Badge>
            )}
          </div>
        </div>
      </Link>

      <CardContent className="p-3 md:p-4 space-y-2.5 md:space-y-3">
        <Link href={`/eventos/${evento.slug}`}>
          <h3 className="font-bold text-base md:text-lg line-clamp-2 hover:text-primary transition-colors">
            {evento.nombre}
          </h3>
        </Link>

        <div className="flex items-start gap-2 text-xs md:text-sm text-muted-foreground">
          <Calendar className="h-3.5 w-3.5 md:h-4 md:w-4 flex-shrink-0 mt-0.5" />
          <span className="line-clamp-2">
            {format(new Date(evento.fecha), "EEEE d 'de' MMMM", { locale: es })} - {evento.horaInicio}
          </span>
        </div>

        <div className="flex items-start gap-2 text-xs md:text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 md:h-4 md:w-4 flex-shrink-0 mt-0.5" />
          <span className="line-clamp-1">{evento.ubicacion}</span>
        </div>

        {headliner && (
          <div className="flex items-center gap-2 text-xs md:text-sm">
            <Users className="h-3.5 w-3.5 md:h-4 md:w-4 text-muted-foreground flex-shrink-0" />
            <span className="font-medium truncate">{headliner.artista.nombre}</span>
            {totalArtistas > 1 && (
              <Badge variant="secondary" className="text-xs flex-shrink-0">
                +{totalArtistas - 1}
              </Badge>
            )}
          </div>
        )}

        {/* Mostrar descuentos del usuario solo si ganan sobre la promoción */}
        {evento.descuentos && evento.descuentos.length > 0 && !usarPromocion && (
          <div className="pt-2 border-t">
            <div className="flex items-center gap-1 text-xs text-blue-600 font-medium mb-1">
              <Tag className="h-3 w-3" />
              <span>Tus descuentos activos:</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {evento.descuentos.slice(0, 2).map((desc, idx) => (
                <Badge key={idx} variant="outline" className="text-xs text-blue-600 border-blue-600">
                  {desc.nombre}
                </Badge>
              ))}
              {evento.descuentos.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{evento.descuentos.length - 2}
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="p-3 md:p-4 pt-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:justify-between">
        <div className="flex-shrink-0">
          {usarPromocion ? (
            // Mostrar promoción (es mejor que descuentos del usuario)
            <>
              <p className="text-xl md:text-2xl font-bold">${Math.round(precioConPromocion).toLocaleString()}</p>
              <p className="text-xs text-muted-foreground line-through">
                ${precio.toLocaleString()}
              </p>
              {promocion?.tipo === "2x1" ? (
                <p className="text-xs text-green-600 font-medium">c/u comprando 2 🎉</p>
              ) : (
                <p className="text-xs text-green-600 font-medium">
                  {Math.round(descuentoPromocion)}% OFF 🎉
                </p>
              )}
            </>
          ) : usarDescuentosUsuario ? (
            // Mostrar descuentos del usuario (son mejores que la promoción)
            <>
              <p className="text-xl md:text-2xl font-bold">${Math.round(evento.precioFinal!).toLocaleString()}</p>
              <p className="text-xs text-muted-foreground line-through">
                ${precio.toLocaleString()}
              </p>
              <p className="text-xs text-blue-600 font-medium">
                Tus descuentos: {Math.round(totalDescuentoUsuario)}%
              </p>
            </>
          ) : (
            // Sin descuentos ni promociones
            <>
              <p className="text-xl md:text-2xl font-bold">${precio.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Precio base</p>
            </>
          )}
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href={`/eventos/${evento.slug}`}>Sacar bono</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

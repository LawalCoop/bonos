import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, MapPin, Clock, Ticket } from "lucide-react";
import Image from "next/image";

async function getUserBonos(userId: string) {
  return prisma.bono.findMany({
    where: {
      usuarioId: userId,
    },
    include: {
      evento: true,
    },
    orderBy: {
      fechaCompra: "desc",
    },
  });
}

export default async function MisBonosPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/api/auth/signin?callbackUrl=/mis-bonos");
  }

  const bonos = await getUserBonos(session.user.id);

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "PAGADO":
        return <Badge className="bg-green-600">Pagado</Badge>;
      case "UTILIZADO":
        return <Badge variant="secondary">Utilizado</Badge>;
      case "CANCELADO":
        return <Badge variant="destructive">Cancelado</Badge>;
      case "PENDIENTE":
        return <Badge variant="outline">Pendiente</Badge>;
      default:
        return <Badge>{estado}</Badge>;
    }
  };

  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Mis Bonos</h1>
          <p className="text-muted-foreground mt-2">
            Tus entradas para eventos de La Bayer Experimental
          </p>
        </div>

        {bonos.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Ticket className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">
                No tenés bonos todavía
              </h3>
              <p className="text-muted-foreground mb-4">
                Cuando compres entradas para eventos, aparecerán acá
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {bonos.map((bono) => (
              <Card key={bono.id} className="overflow-hidden">
                <div className="md:flex">
                  {/* Event Image */}
                  <div className="md:w-48 h-48 relative bg-gray-100">
                    {bono.evento.imagenPrincipal && (
                      <Image
                        src={bono.evento.imagenPrincipal}
                        alt={bono.evento.nombre}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>

                  {/* Event Info */}
                  <div className="flex-1 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold mb-2">
                          {bono.evento.nombre}
                        </h3>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            {new Date(bono.evento.fecha).toLocaleDateString(
                              "es-AR",
                              {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            {bono.evento.horaInicio} hs
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            {bono.evento.ubicacion}
                          </div>
                        </div>
                      </div>
                      {getEstadoBadge(bono.estado)}
                    </div>

                    <Separator className="my-4" />

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">
                          Código del bono
                        </p>
                        <p className="font-mono text-sm">{bono.codigo}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground mb-1">
                          Precio pagado
                        </p>
                        <p className="font-bold text-lg">
                          ${bono.precioFinal.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* QR Code - Only for PAGADO status */}
                    {bono.estado === "PAGADO" && (
                      <>
                        <Separator className="my-4" />
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-3">
                            Mostrá este código QR al ingresar al evento
                          </p>
                          <div className="inline-block p-4 bg-white rounded-lg border-4 border-gray-900">
                            <Image
                              src={bono.qrCode}
                              alt={`QR Code ${bono.codigo}`}
                              width={200}
                              height={200}
                            />
                          </div>
                        </div>
                      </>
                    )}

                    {/* Utilizado info */}
                    {bono.estado === "UTILIZADO" && bono.fechaUtilizacion && (
                      <>
                        <Separator className="my-4" />
                        <p className="text-sm text-muted-foreground text-center">
                          Utilizado el{" "}
                          {new Date(bono.fechaUtilizacion).toLocaleDateString(
                            "es-AR",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

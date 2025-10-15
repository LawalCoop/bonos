import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";

export default function PagoPendientePage() {
  return (
    <div className="container py-12">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="p-12 text-center space-y-6">
            <Clock className="h-24 w-24 text-yellow-500 mx-auto" />
            <div>
              <h1 className="text-3xl font-bold mb-2">Pago pendiente</h1>
              <p className="text-lg text-muted-foreground">
                Estamos esperando la confirmación de tu pago
              </p>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-950 p-4 rounded-lg">
              <p className="text-sm text-yellow-900 dark:text-yellow-100">
                Tu pago está siendo procesado. Te notificaremos por email cuando se confirme.
                Esto puede demorar unos minutos.
              </p>
            </div>
            <div className="space-y-2">
              <Button asChild className="w-full" size="lg">
                <Link href="/mis-bonos">Ver mis bonos</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/">Volver al inicio</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

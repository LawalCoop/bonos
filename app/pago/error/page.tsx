import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";

export default function PagoErrorPage() {
  return (
    <div className="container py-12">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="p-12 text-center space-y-6">
            <XCircle className="h-24 w-24 text-red-500 mx-auto" />
            <div>
              <h1 className="text-3xl font-bold mb-2">Pago rechazado</h1>
              <p className="text-lg text-muted-foreground">
                No pudimos procesar tu pago
              </p>
            </div>
            <div className="bg-red-50 dark:bg-red-950 p-4 rounded-lg">
              <p className="text-sm text-red-900 dark:text-red-100">
                Por favor, verificá los datos de tu tarjeta o intentá con otro medio de pago.
              </p>
            </div>
            <div className="space-y-2">
              <Button asChild className="w-full" size="lg">
                <Link href="/eventos">Intentar de nuevo</Link>
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

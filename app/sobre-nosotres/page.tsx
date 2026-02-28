import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Heart,
  Music,
  BookOpen,
  Users,
  MapPin,
  Mail,
  Instagram,
  ArrowRight
} from "lucide-react";

export const metadata = {
  title: "Sobre Nosotres | La Bayer Experimental",
  description: "Conocé la Biblioteca Popular Osvaldo Bayer y el ciclo cultural La Bayer Experimental",
};

export default function SobreNosotresPage() {
  return (
    <div className="container py-8 md:py-12 space-y-12">
      {/* Hero */}
      <section className="text-center space-y-4 max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          Sobre <span className="text-primary">Nosotres</span>
        </h1>
        <p className="text-lg text-muted-foreground">
          Ciclo cultural autogestivo que surge en la Biblioteca Popular Osvaldo Bayer
        </p>
      </section>

      {/* Qué es La Bayer */}
      <section className="grid md:grid-cols-2 gap-8 items-center">
        <div className="space-y-4">
          <h2 className="text-3xl font-bold">
            <Music className="inline-block mr-2 h-8 w-8 text-primary" />
            Bayer Experimental
          </h2>
          <p className="text-muted-foreground">
            Somos un ciclo cultural autogestivo que surge en la Biblioteca Popular
            Osvaldo Bayer. Quienes hacemos este ciclo habitamos la biblioteca de
            manera voluntaria, conformando la Subcomisión Bayer Experimental.
          </p>
          <p className="text-muted-foreground">
            Buscamos generar encuentros entre artistas locales y otres de paso,
            promover el acceso a la cultura y sumar a la diversidad de espacios
            culturales de la ciudad.
          </p>
        </div>
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-6 space-y-4">
            <BookOpen className="h-12 w-12 text-primary" />
            <h3 className="text-xl font-bold">Propósito solidario</h3>
            <p className="text-sm text-muted-foreground">
              Nuestro objetivo principal es acompañar el crecimiento de la
              biblioteca, aportando particularmente al proyecto de ampliación.
              Cada evento que organizamos contribuye a este propósito colectivo.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Cómo funcionamos */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold text-center">
          ¿Cómo funcionamos?
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6 space-y-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Heart className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-bold">Autogestión</h3>
              <p className="text-sm text-muted-foreground">
                Todo lo que hacemos se sostiene con el trabajo voluntario
                y el aporte de quienes participan de nuestras actividades.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-bold">Bonos Contribución</h3>
              <p className="text-sm text-muted-foreground">
                Cada bono se divide entre les artistas, el mantenimiento
                del espacio y los objetivos colectivos de la biblioteca.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Music className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-bold">Pago justo a artistas</h3>
              <p className="text-sm text-muted-foreground">
                La mayor parte de lo recaudado va directamente a quienes
                hacen la música.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* A dónde va tu aporte */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold text-center">
          ¿A dónde va tu aporte?
        </h2>
        <p className="text-center text-muted-foreground max-w-2xl mx-auto">
          Cada bono contribución se distribuye de forma transparente.
          Los porcentajes específicos se muestran en cada evento.
        </p>
        <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <Card>
            <CardContent className="p-6 space-y-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-bold">Artistas</h3>
              <p className="text-sm text-muted-foreground">
                Pago directo a quienes hacen la música
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 space-y-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-bold">La Biblioteca</h3>
              <p className="text-sm text-muted-foreground">
                Gastos operativos, mantenimiento y objetivos colectivos
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Contacto */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold text-center">Encontranos</h2>
        <div className="grid sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <MapPin className="h-5 w-5 text-primary flex-shrink-0" />
              <div>
                <p className="font-medium text-sm">Dirección</p>
                <p className="text-xs text-muted-foreground">
                  Consultar en redes
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Mail className="h-5 w-5 text-primary flex-shrink-0" />
              <div>
                <p className="font-medium text-sm">Email</p>
                <a
                  href="mailto:labayerexperimental@gmail.com"
                  className="text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  labayerexperimental@gmail.com
                </a>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Instagram className="h-5 w-5 text-primary flex-shrink-0" />
              <div>
                <p className="font-medium text-sm">Instagram</p>
                <a
                  href="https://instagram.com/labayerexperimental"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  @labayerexperimental
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center space-y-4 py-8">
        <h2 className="text-2xl font-bold">
          ¿Querés ser parte?
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Vení a disfrutar de la música, conocé el espacio y sumate
          a los próximos encuentros.
        </p>
        <Button size="lg" asChild>
          <Link href="/eventos">
            Ver próximos eventos
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </section>
    </div>
  );
}

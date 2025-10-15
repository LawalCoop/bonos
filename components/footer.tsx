import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { Instagram, Facebook, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div className="space-y-3">
            <h3 className="font-bold text-lg">La Bayer Experimental</h3>
            <p className="text-sm text-muted-foreground">
              Espacio cultural de la Biblioteca Popular Osvaldo Bayer.
              Todo lo recaudado va para les artistas y la ampliación de la biblioteca.
            </p>
          </div>

          {/* Navigation */}
          <div className="space-y-3">
            <h3 className="font-semibold">Navegación</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/eventos" className="text-muted-foreground hover:text-foreground transition-colors">
                  Eventos
                </Link>
              </li>
              <li>
                <Link href="/artistas" className="text-muted-foreground hover:text-foreground transition-colors">
                  Artistas
                </Link>
              </li>
              <li>
                <Link href="/sobre-nosotres" className="text-muted-foreground hover:text-foreground transition-colors">
                  Sobre nosotres
                </Link>
              </li>
              <li>
                <Link href="/contacto" className="text-muted-foreground hover:text-foreground transition-colors">
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          {/* Info */}
          <div className="space-y-3">
            <h3 className="font-semibold">Información</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/como-funciona" className="text-muted-foreground hover:text-foreground transition-colors">
                  ¿Cómo funciona?
                </Link>
              </li>
              <li>
                <Link href="/niveles" className="text-muted-foreground hover:text-foreground transition-colors">
                  Sistema de niveles
                </Link>
              </li>
              <li>
                <Link href="/descuentos" className="text-muted-foreground hover:text-foreground transition-colors">
                  Descuentos
                </Link>
              </li>
              <li>
                <Link href="/preguntas-frecuentes" className="text-muted-foreground hover:text-foreground transition-colors">
                  Preguntas frecuentes
                </Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div className="space-y-3">
            <h3 className="font-semibold">Redes sociales</h3>
            <div className="flex space-x-4">
              <a
                href="https://instagram.com/labayerexperimental"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </a>
              <a
                href="https://facebook.com/labayerexperimental"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </a>
              <a
                href="mailto:labayerexperimental@gmail.com"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Mail className="h-5 w-5" />
                <span className="sr-only">Email</span>
              </a>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              labayerexperimental@gmail.com
            </p>
          </div>
        </div>

        <Separator className="my-6" />

        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
          <p>© 2025 La Bayer Experimental. Biblioteca Popular Osvaldo Bayer.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link href="/terminos" className="hover:text-foreground transition-colors">
              Términos y condiciones
            </Link>
            <Link href="/privacidad" className="hover:text-foreground transition-colors">
              Privacidad
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

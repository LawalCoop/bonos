'use client'

import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { Instagram, Facebook, Mail, Twitter, Youtube } from "lucide-react";
import { useConfig } from "@/hooks/use-config";

export function Footer() {
  const { config } = useConfig()

  return (
    <footer className="border-t bg-background">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div className="space-y-3">
            <h3 className="font-bold text-lg">{config?.nombreSitio || 'La Bayer Experimental'}</h3>
            <p className="text-sm text-muted-foreground">
              {config?.descripcion || 'Espacio cultural de la Biblioteca Popular Osvaldo Bayer. Todo lo recaudado va para les artistas y la ampliación de la biblioteca.'}
            </p>
            {config?.direccion && (
              <p className="text-xs text-muted-foreground">
                {config.direccion}, {config.ciudad}
              </p>
            )}
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
              {config?.instagram && (
                <a
                  href={config.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Instagram className="h-5 w-5" />
                  <span className="sr-only">Instagram</span>
                </a>
              )}
              {config?.facebook && (
                <a
                  href={config.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Facebook className="h-5 w-5" />
                  <span className="sr-only">Facebook</span>
                </a>
              )}
              {config?.twitter && (
                <a
                  href={config.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Twitter className="h-5 w-5" />
                  <span className="sr-only">Twitter</span>
                </a>
              )}
              {config?.youtube && (
                <a
                  href={config.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Youtube className="h-5 w-5" />
                  <span className="sr-only">YouTube</span>
                </a>
              )}
              {config?.email && (
                <a
                  href={`mailto:${config.email}`}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Mail className="h-5 w-5" />
                  <span className="sr-only">Email</span>
                </a>
              )}
            </div>
            {config?.email && (
              <p className="text-xs text-muted-foreground mt-4">
                {config.email}
              </p>
            )}
            {config?.telefono && (
              <p className="text-xs text-muted-foreground">
                Tel: {config.telefono}
              </p>
            )}
          </div>
        </div>

        <Separator className="my-6" />

        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} {config?.nombreSitio || 'La Bayer Experimental'}</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            {config?.terminosUrl ? (
              <a href={config.terminosUrl} target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
                Términos y condiciones
              </a>
            ) : (
              <Link href="/terminos" className="hover:text-foreground transition-colors">
                Términos y condiciones
              </Link>
            )}
            {config?.privacidadUrl ? (
              <a href={config.privacidadUrl} target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
                Privacidad
              </a>
            ) : (
              <Link href="/privacidad" className="hover:text-foreground transition-colors">
                Privacidad
              </Link>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}

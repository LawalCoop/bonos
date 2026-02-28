"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { User, LogOut, Ticket, Bell, Zap, Loader2 } from "lucide-react";
import { NIVELES, getNivelInfo } from "@/lib/constants";
import { ThemeToggle } from "@/components/theme-toggle";
import { useConfig } from "@/hooks/use-config";

export function Header() {
  const { data: session, status } = useSession();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const { config } = useConfig();

  // Calculate level progress
  const calcularProgreso = () => {
    if (!session?.user?.nivel || !session?.user?.puntos) return 0;

    const nivelActual = session.user.nivel;
    const puntosActuales = session.user.puntos;
    const siguienteNivel = nivelActual + 1;

    // If max level, return 100%
    if (nivelActual >= 8) return 100;

    const puntosNivelActual = getNivelInfo(nivelActual).puntos;
    const puntosNivelSiguiente = getNivelInfo(siguienteNivel).puntos;

    const puntosEnNivel = puntosActuales - puntosNivelActual;
    const puntosNecesarios = puntosNivelSiguiente - puntosNivelActual;

    return Math.min((puntosEnNivel / puntosNecesarios) * 100, 100);
  };

  const progreso = calcularProgreso();
  const nivelActual = session?.user?.nivel || 1;
  const nivelInfo = getNivelInfo(nivelActual);
  const siguienteNivelInfo = nivelActual < 8 ? getNivelInfo(nivelActual + 1) : null;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          {config?.logoUrl ? (
            <img
              src={config.logoUrl}
              alt={config.nombreSitio}
              className="h-12 md:h-14 lg:h-16 w-auto max-w-[200px] md:max-w-[280px] lg:max-w-[320px] object-contain"
            />
          ) : (
            <div className="font-bold text-xl">
              {config?.nombreCorto || 'La Bayer'} <span className="text-primary">{config?.nombreSitio.replace(config?.nombreCorto || 'La Bayer', '').trim() || 'Experimental'}</span>
            </div>
          )}
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          <Link
            href="/eventos"
            className="transition-colors hover:text-foreground/80 text-foreground/60"
          >
            Eventos
          </Link>
          <Link
            href="/artistas"
            className="transition-colors hover:text-foreground/80 text-foreground/60"
          >
            Artistas
          </Link>
          <Link
            href="/sobre-nosotres"
            className="transition-colors hover:text-foreground/80 text-foreground/60"
          >
            Sobre nosotres
          </Link>
        </nav>

        {/* User menu */}
        <div className="flex items-center space-x-4">
          {/* Theme Toggle - Always visible */}
          <ThemeToggle />

          {session ? (
            <>
              {/* Notificaciones */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-72" align="end">
                  <DropdownMenuLabel>Notificaciones</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    <Bell className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p>No tenés notificaciones nuevas</p>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Level Progress - Hidden on mobile */}
              <div className="hidden lg:flex items-center gap-3 px-3 py-2 rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/30 border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-600" />
                  <div className="text-xs">
                    <div className="font-bold text-yellow-700 dark:text-yellow-400">
                      {nivelInfo.icono} {nivelInfo.nombre}
                    </div>
                    <div className="text-yellow-600 dark:text-yellow-500 text-[10px]">
                      Nivel {nivelActual}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-1 min-w-[100px]">
                  <Progress value={progreso} className="h-2 bg-yellow-200 dark:bg-yellow-900" />
                  <div className="text-[9px] text-yellow-600 dark:text-yellow-500 flex justify-between">
                    <span>{session.user.puntos || 0} pts</span>
                    {siguienteNivelInfo && (
                      <span>→ {siguienteNivelInfo.puntos} pts</span>
                    )}
                  </div>
                </div>
              </div>

              {/* User dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={session.user?.image || ""} alt={session.user?.name || ""} />
                      <AvatarFallback>
                        {session.user?.name?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{session.user?.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {session.user?.email}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary">
                          Nivel {session.user?.nivel || 1}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {session.user?.puntos || 0} pts
                        </span>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/perfil" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Mi perfil</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/mis-bonos" className="cursor-pointer">
                      <Ticket className="mr-2 h-4 w-4" />
                      <span>Mis bonos</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer text-red-600"
                    disabled={isSigningOut}
                    onClick={async () => {
                      setIsSigningOut(true);
                      await signOut();
                    }}
                  >
                    {isSigningOut ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <LogOut className="mr-2 h-4 w-4" />
                    )}
                    <span>{isSigningOut ? "Cerrando..." : "Cerrar sesión"}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button
              onClick={async () => {
                setIsSigningIn(true);
                await signIn("google");
              }}
              disabled={isSigningIn || status === "loading"}
            >
              {isSigningIn || status === "loading" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cargando...
                </>
              ) : (
                "Ingresar"
              )}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

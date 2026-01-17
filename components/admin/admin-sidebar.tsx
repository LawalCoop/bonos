"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState } from "react";
import {
  LayoutDashboard,
  Calendar,
  Users,
  Ticket,
  Building2,
  Target,
  Settings,
  Music,
  Home,
  Scan,
  Percent,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useConfig } from "@/hooks/use-config";

const menuItems = [
  {
    title: "General",
    items: [
      { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
      { href: "/admin/ingreso", icon: Scan, label: "Modalidad Ingreso" },
      { href: "/", icon: Home, label: "Ver sitio público" },
    ],
  },
  {
    title: "Gestión",
    items: [
      { href: "/admin/eventos", icon: Calendar, label: "Eventos" },
      { href: "/admin/artistas", icon: Music, label: "Artistas" },
      { href: "/admin/bonos", icon: Ticket, label: "Bonos" },
      { href: "/admin/usuarios", icon: Users, label: "Usuarios" },
    ],
  },
  {
    title: "Configuración",
    items: [
      { href: "/admin/promociones", icon: Percent, label: "Promociones" },
      { href: "/admin/descuentos", icon: Percent, label: "Descuentos" },
      { href: "/admin/organizaciones", icon: Building2, label: "Organizaciones" },
      { href: "/admin/objetivos", icon: Target, label: "Objetivos" },
      { href: "/admin/configuracion", icon: Settings, label: "Configuración" },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { config } = useConfig();

  const closeSidebar = () => setIsOpen(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Admin Panel
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {config?.nombreCorto || 'La Bayer'}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:relative inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-200 ease-in-out lg:transform-none lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="h-full overflow-y-auto">
          <div className="p-6 hidden lg:block">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Admin Panel
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {config?.nombreCorto || 'La Bayer'}
            </p>
          </div>

          <nav className="px-3 pb-6 pt-20 lg:pt-0">
            {menuItems.map((section, idx) => (
              <div key={idx} className="mb-6">
                <h3 className="px-3 mb-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {section.title}
                </h3>
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href ||
                      (item.href !== "/admin" && pathname?.startsWith(item.href));

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={closeSidebar}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                          isActive
                            ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                            : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                        )}
                      >
                        <Icon className="h-5 w-5" />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Calendar,
  Users,
  Ticket,
  Building2,
  Target,
  Bell,
  Settings,
  Music,
  Home,
  Scan,
  Percent,
} from "lucide-react";

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
      { href: "/admin/notificaciones", icon: Bell, label: "Notificaciones" },
      { href: "/admin/configuracion", icon: Settings, label: "Configuración" },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Admin Panel
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          La Bayer Experimental
        </p>
      </div>

      <nav className="px-3 pb-6">
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
    </aside>
  );
}

import { auth } from "@/auth";
import { redirect } from "next/navigation";

export async function requireAdmin() {
  const session = await auth();

  if (!session?.user) {
    redirect("/api/auth/signin?callbackUrl=/admin");
  }

  if (session.user.rol !== "ADMIN" && session.user.rol !== "SUPER_ADMIN") {
    redirect("/");
  }

  return session;
}

export async function requireSuperAdmin() {
  const session = await auth();

  if (!session?.user) {
    redirect("/api/auth/signin?callbackUrl=/admin");
  }

  if (session.user.rol !== "SUPER_ADMIN") {
    redirect("/");
  }

  return session;
}

export function isAdmin(rol: string): boolean {
  return rol === "ADMIN" || rol === "SUPER_ADMIN";
}

export function isSuperAdmin(rol: string): boolean {
  return rol === "SUPER_ADMIN";
}

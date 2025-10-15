import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";
import { calcularNivel } from "@/lib/constants";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user && user) {
        session.user.id = user.id;
        // Obtener datos del usuario desde la BD
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
        });
        if (dbUser) {
          // Calcular nivel desde puntos en lugar de usar el valor almacenado
          session.user.nivel = calcularNivel(dbUser.puntos);
          session.user.puntos = dbUser.puntos;
          session.user.esAsociado = dbUser.esAsociado;
          session.user.rol = dbUser.rol;
        }
      }
      return session;
    },
  },
  session: {
    strategy: "database",
  },
  debug: process.env.NODE_ENV === "development",
};

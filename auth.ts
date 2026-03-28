import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";
import { calcularNivel } from "@/lib/constants";

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user && user) {
        session.user.id = user.id;
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
        });
        if (dbUser) {
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
  debug: true,
});

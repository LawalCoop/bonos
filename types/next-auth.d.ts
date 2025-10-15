import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      nivel: number;
      puntos: number;
      esAsociado: boolean;
      rol: string;
    } & DefaultSession["user"];
  }

  interface User {
    nivel: number;
    puntos: number;
    esAsociado: boolean;
    rol: string;
  }
}

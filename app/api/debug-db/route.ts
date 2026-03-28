import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const userCount = await prisma.user.count();
    const accountCount = await prisma.account.count();
    const sessionCount = await prisma.session.count();
    return NextResponse.json({
      status: "connected",
      dbUrl: process.env.DATABASE_URL?.replace(/\/\/.*@/, "//***@"),
      users: userCount,
      accounts: accountCount,
      sessions: sessionCount,
    });
  } catch (error: any) {
    return NextResponse.json({
      status: "error",
      message: error.message,
      dbUrl: process.env.DATABASE_URL?.replace(/\/\/.*@/, "//***@"),
    }, { status: 500 });
  }
}

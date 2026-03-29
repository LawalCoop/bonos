import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    envDbUrl: process.env.DATABASE_URL?.replace(/\/\/.*@/, "//***@"),
    envDbHost: process.env.DATABASE_URL?.match(/@([^:/]+)/)?.[1] || "unknown",
    nodeEnv: process.env.NODE_ENV,
  });
}

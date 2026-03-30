import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    railwayUrl: process.env.DATABASE_RAILWAY_URL?.replace(/\/\/.*@/, "//***@"),
    railwayHost: process.env.DATABASE_RAILWAY_URL?.match(/@([^:/]+)/)?.[1] || "unknown",
    oldUrl: process.env.DATABASE_URL?.replace(/\/\/.*@/, "//***@") || "not set",
    nodeEnv: process.env.NODE_ENV,
  });
}

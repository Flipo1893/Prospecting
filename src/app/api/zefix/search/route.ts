import { NextRequest, NextResponse } from "next/server";
import { searchCompanies } from "@/lib/zefix/client";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const industry = searchParams.get("industry") ?? undefined;
  const canton = searchParams.get("canton") ?? undefined;

  const outcome = await searchCompanies({ industry, canton });

  return NextResponse.json(outcome);
}

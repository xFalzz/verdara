import { NextRequest, NextResponse } from "next/server";
import { POST as samPost } from "@/app/api/meta/sam/route";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  return samPost(req);
}

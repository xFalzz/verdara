import { NextRequest } from "next/server";
import { POST as councilPost } from "@/app/api/council/route";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  return councilPost(req);
}

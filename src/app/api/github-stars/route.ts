import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 60;

export async function GET() {
  try {
    const res = await fetch("https://api.github.com/repos/xFalzz/verdara", {
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": "Verdara-App",
      },
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      return NextResponse.json({
        stars: 0,
        repo: "xFalzz/verdara",
        url: "https://github.com/xFalzz/verdara",
        status: "cached_fallback",
      });
    }

    const data = await res.json();
    const stars = typeof data.stargazers_count === "number" ? data.stargazers_count : 0;

    return NextResponse.json({
      stars,
      repo: "xFalzz/verdara",
      url: data.html_url || "https://github.com/xFalzz/verdara",
      forks: data.forks_count ?? 0,
      status: "live",
    });
  } catch {
    return NextResponse.json({
      stars: 0,
      repo: "xFalzz/verdara",
      url: "https://github.com/xFalzz/verdara",
      status: "offline_fallback",
    });
  }
}

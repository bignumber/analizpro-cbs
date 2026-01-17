import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";

function safeHostFromDatabaseUrl(urlStr: string) {
  try {
    // Ensure it parses even if it’s missing protocol (just in case)
    const u = new URL(urlStr);
    return u.host || "(no-host)";
  } catch {
    // Fallback: try to extract between @ and /
    const m = urlStr.match(/@([^/]+)/);
    return m?.[1] || "(unparseable)";
  }
}

export async function GET() {
  try {
    const dbUrl = process.env.DATABASE_URL || "";
    const host = dbUrl ? safeHostFromDatabaseUrl(dbUrl) : "(missing)";

    if (!dbUrl) {
      return NextResponse.json(
        { ok: false, error: "DATABASE_URL is missing", host },
        { status: 500 }
      );
    }

    const pool = getPool();
    const res = await pool.query("SELECT postgis_full_version()");
    return NextResponse.json({ ok: true, host, postgis: res.rows[0].postgis_full_version });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, host: safeHostFromDatabaseUrl(process.env.DATABASE_URL || ""), error: e?.message || String(e) },
      { status: 500 }
    );
  }
}

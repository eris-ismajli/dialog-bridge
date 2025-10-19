import { openDB } from "@/lib/db.js";

export async function GET() {
  const db = await openDB();
  const rows = await db.all("SELECT path FROM uploads ORDER BY id DESC");
  return new Response(JSON.stringify({ files: rows.map(r => r.path) }), { status: 200 });
}

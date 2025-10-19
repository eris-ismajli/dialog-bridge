import { openDB } from "@/app/lib/db.js";

export async function GET() {
  try {
    const db = await openDB();
    await db.exec(`CREATE TABLE IF NOT EXISTS uploads (id INTEGER PRIMARY KEY AUTOINCREMENT, path TEXT, date TEXT)`);
    const rows = await db.all("SELECT path FROM uploads ORDER BY id DESC");
    return new Response(JSON.stringify({ files: rows.map(r => r.path) }), { status: 200 });
  } catch (err) {
    console.error("LIST ERROR:", err);
    return new Response(JSON.stringify({ message: "List failed", error: String(err) }), { status: 500 });
  }
}

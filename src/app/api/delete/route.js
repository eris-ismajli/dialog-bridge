import { del } from "@vercel/blob";
import { openDB } from "@/lib/db.js";

export async function POST(req) {
  try {
    const { url } = await req.json();
    if (!url) return new Response(JSON.stringify({ message: "No URL provided" }), { status: 400 });

    await del(url); // remove from Vercel Blob

    const db = await openDB();
    await db.run("DELETE FROM uploads WHERE path = ?", [url]);

    return new Response(JSON.stringify({ message: "Deleted successfully" }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ message: "Delete failed" }), { status: 500 });
  }
}

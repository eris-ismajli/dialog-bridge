import fs from "fs";
import path from "path";
import { del } from "@vercel/blob";
import { openDB } from "@/app/lib/db.js";

export async function POST(req) {
  try {
    const { url } = await req.json();
    if (!url) return new Response(JSON.stringify({ message: "No URL provided" }), { status: 400 });

    if (process.env.ERIS_READ_WRITE_TOKEN && url.startsWith("http")) {
      // Delete from Vercel Blob
      await del(url, { token: process.env.ERIS_READ_WRITE_TOKEN });
    } else {
      // Local delete: url is like "/uploads/filename"
      const filename = decodeURIComponent(url.split("/").pop());
      const filePath = path.join(process.cwd(), "public", "uploads", filename);
      if (fs.existsSync(filePath)) await fs.promises.unlink(filePath);
    }

    const db = await openDB();
    await db.run("DELETE FROM uploads WHERE path = ?", [url]);

    return new Response(JSON.stringify({ message: "Deleted successfully" }), { status: 200 });
  } catch (err) {
    console.error("DELETE ERROR:", err);
    return new Response(JSON.stringify({ message: "Delete failed", error: String(err) }), { status: 500 });
  }
}

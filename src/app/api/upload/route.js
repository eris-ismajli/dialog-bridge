import { put } from "@vercel/blob";
import { openDB } from "@/app/lib/db.js";

export async function POST(req) {
  try {
    const data = await req.formData();
    const file = data.get("file");

    if (!file) return new Response(JSON.stringify({ message: "No file uploaded" }), { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const blob = await put(file.name, buffer, { access: "public" });

    // Save URL to DB
    const db = await openDB();
    await db.exec(`CREATE TABLE IF NOT EXISTS uploads (id INTEGER PRIMARY KEY, path TEXT, date TEXT)`);
    await db.run("INSERT INTO uploads (path, date) VALUES (?, ?)", [blob.url, new Date().toISOString()]);

    return new Response(JSON.stringify({ message: "File uploaded!", path: blob.url }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ message: "Upload failed" }), { status: 500 });
  }
}

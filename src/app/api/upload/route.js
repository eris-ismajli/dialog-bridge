import fs from "fs";
import path from "path";
import { put } from "@vercel/blob";
import { openDB } from "@/app/lib/db.js";

export async function POST(req) {
  try {
    const data = await req.formData();
    const file = data.get("file");
    if (!file)
      return new Response(JSON.stringify({ message: "No file uploaded" }), {
        status: 400,
      });

    const buffer = Buffer.from(await file.arrayBuffer());
    let url;

    if (process.env.ERIS_READ_WRITE_TOKEN) {
      // Production / blob mode
      const blob = await put(file.name, buffer, {
        access: "public",
        token: process.env.ERIS_READ_WRITE_TOKEN,
      });
      url = blob.url;
    } else {
      // Local dev fallback: write to public/uploads
      const uploadsDir = path.join(process.cwd(), "public", "uploads");
      await fs.promises.mkdir(uploadsDir, { recursive: true });
      const safeName = file.name.replace(/[^a-z0-9.-]/gi, "_");
      const filePath = path.join(uploadsDir, safeName);
      await fs.promises.writeFile(filePath, buffer);
      url = `/uploads/${encodeURIComponent(file.name)}`;
    }

    // Ensure DB and record
    const db = await openDB();
    await db.exec(
      `CREATE TABLE IF NOT EXISTS uploads (id INTEGER PRIMARY KEY AUTOINCREMENT, path TEXT, date TEXT)`
    );
    await db.run("INSERT INTO uploads (path, date) VALUES (?, ?)", [
      url,
      new Date().toISOString(),
    ]);

    return new Response(
      JSON.stringify({ message: "File uploaded!", path: url }),
      { status: 200 }
    );
  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    return new Response(
      JSON.stringify({ message: "Upload failed", error: String(err) }),
      { status: 500 }
    );
  }
}

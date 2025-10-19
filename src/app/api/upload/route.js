import { writeFile } from "fs/promises";
import path from "path";
import { openDB } from "@/app/lib/db";

export async function POST(req) {
  const data = await req.formData();
  const file = data.get("file");

  if (!file) {
    return new Response(JSON.stringify({ message: "No file uploaded" }), { status: 400 });
  }

  // 1️⃣ Convert uploaded file to a buffer and save it locally
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const filePath = path.join(process.cwd(), "public", "uploads", file.name);
  await writeFile(filePath, buffer);

  // 2️⃣ Open the database connection and insert file metadata
  const db = await openDB();
  await db.exec(`
    CREATE TABLE IF NOT EXISTS uploads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      path TEXT,
      date TEXT
    )
  `);
  await db.run(
    `INSERT INTO uploads (name, path, date) VALUES (?, ?, ?)`,
    [file.name, `/uploads/${file.name}`, new Date().toISOString()]
  );

  // 3️⃣ Return success response
  return new Response(
    JSON.stringify({
      message: "File uploaded successfully!",
      path: `/uploads/${file.name}`,
    }),
    { status: 200 }
  );
}

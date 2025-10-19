import fs from "fs";
import path from "path";

export async function POST(req) {
  try {
    const { filename } = await req.json();

    if (!filename) {
      return new Response(JSON.stringify({ message: "No filename provided" }), { status: 400 });
    }

    const filePath = path.join(process.cwd(), "public", "uploads", filename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return new Response(JSON.stringify({ message: "File deleted successfully" }), { status: 200 });
    } else {
      return new Response(JSON.stringify({ message: "File not found" }), { status: 404 });
    }
  } catch (err) {
    console.error("Delete error:", err);
    return new Response(JSON.stringify({ message: "Failed to delete file" }), { status: 500 });
  }
}

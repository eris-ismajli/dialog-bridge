import fs from "fs";
import path from "path";

export async function GET() {
  const dir = path.join(process.cwd(), "public", "uploads");

  // Ensure uploads folder exists
  if (!fs.existsSync(dir)) {
    return new Response(JSON.stringify({ files: [] }), { status: 200 });
  }

  const files = fs.readdirSync(dir).map((name) => `/uploads/${name}`);

  return new Response(JSON.stringify({ files }), { status: 200 });
}

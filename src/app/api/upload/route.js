import { put } from "@vercel/blob";

export async function POST(req) {
  try {
    const data = await req.formData();
    const file = data.get("file");

    if (!file) return new Response(JSON.stringify({ message: "No file uploaded" }), { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const blob = await put(file.name, buffer, { access: "public" });

    return new Response(JSON.stringify({ message: "File uploaded!", path: blob.url }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ message: "Upload failed" }), { status: 500 });
  }
}

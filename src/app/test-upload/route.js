// /app/api/test-upload/route.js
export const runtime = "node";

export async function POST(req) {
  console.log("POST route hit!");
  return new Response(JSON.stringify({ message: "ok" }), { status: 200 });
}

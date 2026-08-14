import { createFileRoute } from "@tanstack/react-router";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-n8n-target",
  "Access-Control-Max-Age": "86400",
} as const;

/** فقط آدرس‌های http/https پذیرفته می‌شوند */
function parseTarget(raw: string | null): URL | null {
  if (!raw) return null;
  try {
    const url = new URL(raw.trim());
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url;
  } catch {
    return null;
  }
}

export const Route = createFileRoute("/api/public/n8n-proxy")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS_HEADERS }),

      POST: async ({ request }) => {
        const target = parseTarget(request.headers.get("x-n8n-target"));
        if (!target) {
          return new Response(
            JSON.stringify({ error: "آدرس وب‌هوک نامعتبر است." }),
            { status: 400, headers: { "Content-Type": "application/json", ...CORS_HEADERS } },
          );
        }

        const forwardHeaders = new Headers();
        const contentType = request.headers.get("content-type");
        if (contentType) forwardHeaders.set("Content-Type", contentType);
        forwardHeaders.set("ngrok-skip-browser-warning", "true");
        forwardHeaders.set("User-Agent", "ProjehYar-App");

        try {
          const upstream = await fetch(target.toString(), {
            method: "POST",
            headers: forwardHeaders,
            body: await request.arrayBuffer(),
          });
          const body = await upstream.text();
          return new Response(body, {
            status: upstream.status,
            headers: {
              "Content-Type": upstream.headers.get("content-type") ?? "text/plain; charset=utf-8",
              ...CORS_HEADERS,
            },
          });
        } catch (error) {
          console.error("[n8n-proxy] upstream request failed", error);
          return new Response(
            JSON.stringify({
              error: "سرور نتوانست به n8n وصل شود؛ احتمالاً ngrok آفلاین است.",
            }),
            { status: 502, headers: { "Content-Type": "application/json", ...CORS_HEADERS } },
          );
        }
      },
    },
  },
});

import { createFileRoute } from "@tanstack/react-router";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-n8n-workflow",
  "Access-Control-Max-Age": "86400",
} as const;

const DEFAULT_N8N_WEBHOOK_URL = "https://oat-vessel-suffrage.ngrok-free.dev/webhook/upload-excel";

/** مقصد n8n به‌صورت مرکزی در محیط سرور تعریف می‌شود و از کاربر دریافت نمی‌شود. */
function resolveTarget(workflow: string | null): URL | null {
  const configuredUrl = process.env["N8N_WEBHOOK_URL"] ?? DEFAULT_N8N_WEBHOOK_URL;
  try {
    const url = new URL(configuredUrl);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    if (workflow === "variance") url.pathname = "/webhook/generate-variance-report";
    return url;
  } catch {
    return null;
  }
}

export const Route = createFileRoute("/api/public/n8n-proxy")({
  staticData: { sitemap: false },
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS_HEADERS }),

      POST: async ({ request }) => {
        const target = resolveTarget(request.headers.get("x-n8n-workflow"));
        if (!target) {
          return new Response(
            JSON.stringify({ error: "اتصال خودکار سرویس تنظیم نشده است." }),
            { status: 503, headers: { "Content-Type": "application/json", ...CORS_HEADERS } },
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

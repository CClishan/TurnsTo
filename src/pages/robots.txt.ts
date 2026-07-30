export function GET() {
  const site = import.meta.env.PUBLIC_SITE_URL?.replace(/\/$/, "");
  const sitemap = site ? `Sitemap: ${site}/sitemap-index.xml\n` : "";
  return new Response(`User-agent: *\nAllow: /\n${sitemap}`, {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}

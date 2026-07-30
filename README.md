# TurnsTo

An English-first collection of quick, explainable conversion tools. The MVP ships a pet-age estimate and a color converter.

## Run locally

```bash
npm install
npm run dev
```

## Deploy to Cloudflare Pages

1. Connect the repository in Cloudflare Pages.
2. Use `npm run build` as the build command and `dist` as the output directory.
3. Set `PUBLIC_SITE_URL` to the production HTTPS origin after the domain is ready.

`PUBLIC_SITE_URL` enables canonical URLs, sitemap generation, and the sitemap hint in `robots.txt`. The static MVP needs no Worker; add one only when a future tool needs server-side data or an API.

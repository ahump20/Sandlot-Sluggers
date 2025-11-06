# BlazeSportsIntel Platform

This repository hosts the BlazeSportsIntel monorepo targeting a Cloudflare-first deployment.
It includes a Next.js front end optimised for Cloudflare Pages and an API served from
Cloudflare Workers with D1 + KV bindings.

## Structure

- `apps/web` – Next.js (TypeScript, App Router) experience for BlazeSportsIntel.com.
- `apps/api` – Cloudflare Worker entrypoint exposing sports intelligence APIs backed by D1 and KV.
- `wrangler.toml` – Shared configuration for deploying the Workers API.
- `.github/workflows/deploy.yml` – CI/CD pipeline integrating GitHub Actions with Cloudflare Pages and Workers.

## Getting Started

Install dependencies and spin up both layers locally:

```bash
npm install
npm run dev --workspace web # Next.js at http://localhost:3000
npm run dev --workspace api # Workers API via wrangler dev at http://127.0.0.1:8787
```

Set `NEXT_PUBLIC_API_BASE_URL` to the URL emitted by `wrangler dev` so the web app can retrieve
analytics data from the Worker. A sample configuration lives in `.env.example`.

To deploy, configure the required Cloudflare secrets (`CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN`,
`NEXT_PUBLIC_API_BASE_URL`) in GitHub and push to `main`. The GitHub Actions workflow will build the
Next.js site with `@cloudflare/next-on-pages`, publish to Cloudflare Pages, and run `wrangler deploy`
for the Worker.

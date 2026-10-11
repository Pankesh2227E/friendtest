# RealOnes

Make a quiz about yourself, share the link, and see which friends really know you. Zero dependencies: Node 18+ and one HTML file. All artwork is original inline SVG.

## Run locally
    npm start   # http://localhost:8080

## Put it on GitHub
Keep the layout as is: `server.js`, `package.json`, `Dockerfile`, `render.yaml`, `.gitignore`, and `public/index.html`.

## Deploy
- **Render:** New > Web Service > pick the repo. It reads `render.yaml` (or use `npm install` / `npm start`).
- **Fly.io:** `fly launch` (uses the Dockerfile, port 8080). For lasting data: `fly volumes create data`, mount it at `/data`, set `DATA_DIR=/data`.
- **Vercel:** not supported as is (no writable disk); use Render or Fly.io.

Data lives in `data/db.json`. Free tiers wipe it on restart or redeploy unless you attach a disk and set `DATA_DIR` to it.

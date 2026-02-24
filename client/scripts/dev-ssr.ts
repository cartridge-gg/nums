#!/usr/bin/env node
/**
 * Local development server for testing SSR API
 *
 * Mode 1 - Vite running (hot reload):
 *   Terminal 1: pnpm dev (Vite on 1337)
 *   Terminal 2: pnpm dev:ssr
 *   Visit: http://localhost:3000/ or http://localhost:1337/ (via Vite proxy)
 *
 * Mode 2 - Build only (no Vite):
 *   pnpm build && pnpm dev:ssr
 *   Visit: http://localhost:3000/
 */

import { createServer } from "http";
import fs from "node:fs";
import path from "node:path";
import { parse } from "url";
import { fileURLToPath } from "node:url";
import ssrHandler from "../api/ssr";
import imageHandler from "../api/image";
import type { VercelRequest, VercelResponse } from "@vercel/node";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;
const VITE_PORT = process.env.VITE_PORT || 1337;

function serveFromDist(_req: import("http").IncomingMessage, res: import("http").ServerResponse, filePath: string): boolean {
  const base = path.join(__dirname, "..");
  const distPaths = [
    path.join(base, "dist", filePath),
    path.join(process.cwd(), "dist", filePath),
    path.join(process.cwd(), "client", "dist", filePath),
    path.join(base, "public", filePath),
  ];
  if (filePath === "index.html") {
    distPaths.push(path.join(base, "index.html"));
  }
  if (filePath === "manifest.webmanifest") {
    distPaths.push(path.join(base, "public", "site.webmanifest"));
  }

  for (const p of distPaths) {
    try {
      const stat = fs.statSync(p);
      if (stat.isFile()) {
        const content = fs.readFileSync(p);
        const ext = path.extname(p);
        const types: Record<string, string> = {
          ".html": "text/html",
          ".js": "application/javascript",
          ".css": "text/css",
          ".json": "application/json",
          ".webmanifest": "application/manifest+json",
        };
        res.setHeader("Content-Type", types[ext] || "application/octet-stream");
        res.writeHead(200);
        res.end(content);
        return true;
      }
    } catch {
      /* try next */
    }
  }
  return false;
}

async function proxyToVite(req: import("http").IncomingMessage, res: import("http").ServerResponse) {
  const parsedUrl = parse(req.url || "/", true);
  const urlPath = parsedUrl.pathname || "/";

  // If Vite not running, try serving from dist/ (index.html + built assets)
  const distPath = urlPath === "/" ? "index.html" : urlPath.slice(1);
  if (serveFromDist(req, res, distPath)) return;

  const target = `http://127.0.0.1:${VITE_PORT}${req.url}`;
  try {
    const response = await fetch(target, {
      method: req.method,
      headers: req.headers as Record<string, string>,
    });
    const headers = Object.fromEntries(response.headers.entries());
    for (const [k, v] of Object.entries(headers)) {
      if (v) res.setHeader(k, v);
    }
    res.writeHead(response.status);
    const body = await response.arrayBuffer();
    res.end(Buffer.from(body));
  } catch (err) {
    console.error("Proxy error:", err);
    res.writeHead(502, { "Content-Type": "text/html; charset=utf-8" });
    res.end(
      `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Vite required</title></head><body style="font-family:sans-serif;padding:2rem;max-width:40rem"><h1>Vite not running</h1><p>Start Vite in another terminal:</p><pre style="background:#f0f0f0;padding:1rem;border-radius:4px">pnpm dev</pre><p>Then visit <a href="http://localhost:${VITE_PORT}">http://localhost:${VITE_PORT}</a> or <a href="http://localhost:${PORT}">http://localhost:${PORT}</a></p><p>Or run <code>pnpm build</code> first for dist-only mode.</p></body></html>`,
    );
  }
}

const server = createServer(async (req, res) => {
  const parsedUrl = parse(req.url || "/", true);

  // Debug log
  console.log(`[${new Date().toISOString()}] ${req.method} ${parsedUrl.pathname}`, parsedUrl.query);

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  // Test endpoint
  if (parsedUrl.pathname === "/test") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        message: "SSR dev server is running",
        endpoints: { ssr: "/", game: "/game?id=5", image: "/api/image?id=5" },
      }),
    );
    return;
  }

  const callVercelHandler = async (
    handler: (req: VercelRequest, res: VercelResponse) => Promise<void>,
  ) => {
    try {
      const headers: Record<string, string | string[] | undefined> = {};
      if (req.headers) {
        for (const [key, value] of Object.entries(req.headers)) {
          headers[key] = value;
        }
      }
      headers.host = `localhost:${PORT}`;

      const vercelReq = {
        query: parsedUrl.query,
        body: undefined,
        method: req.method || "GET",
        url: req.url || "/",
        headers,
      } as VercelRequest;

      let statusCode = 200;
      const responseHeaders: Record<string, string> = {};

      const vercelRes = {
        status: (code: number) => {
          statusCode = code;
          return vercelRes;
        },
        setHeader: (name: string, value: string) => {
          responseHeaders[name] = value;
          return vercelRes;
        },
        send: (body: string | Buffer) => {
          res.writeHead(statusCode, { ...responseHeaders, "Content-Type": responseHeaders["Content-Type"] || "text/html" });
          res.end(body);
          return vercelRes;
        },
        json: (body: unknown) => {
          res.writeHead(statusCode, { ...responseHeaders, "Content-Type": "application/json" });
          res.end(JSON.stringify(body));
          return vercelRes;
        },
      } as VercelResponse;

      await handler(vercelReq, vercelRes);
    } catch (error) {
      console.error("Error in handler:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end(`Internal Server Error: ${errorMessage}`);
    }
  };

  // SSR route: /game only (Vercel rewrites /game -> /api/ssr; / serves index.html)
  if (parsedUrl.pathname === "/game") {
    await callVercelHandler(ssrHandler);
    return;
  }

  // Image endpoint
  if (parsedUrl.pathname === "/api/image") {
    await callVercelHandler(imageHandler);
    return;
  }

  // API SSR direct (for testing)
  if (parsedUrl.pathname === "/api/ssr") {
    await callVercelHandler(ssrHandler);
    return;
  }

  // Browser/DevTools requests - return 404 without proxying (avoids proxy error when Vite not running)
  if (parsedUrl.pathname?.startsWith("/.well-known/")) {
    res.writeHead(404);
    res.end();
    return;
  }

  // Proxy everything else to Vite (scripts, assets, HMR, etc.)
  await proxyToVite(req, res);
});

const distExists = fs.existsSync(path.join(__dirname, "..", "dist", "index.html"));

server.listen(PORT, () => {
  console.log(`🚀 SSR dev server: http://localhost:${PORT}`);
  console.log(`\n   Visit: http://localhost:${PORT}/ or http://localhost:${PORT}/game?id=5`);
  if (!distExists) {
    console.log(`\n   ⚠️  Run "pnpm dev" in another terminal (Vite required for assets)`);
  } else {
    console.log(`   ✓ dist/ found - can run without Vite`);
  }
  console.log("");
});

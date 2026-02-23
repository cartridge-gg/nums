#!/usr/bin/env node
/**
 * Local development server for testing SSR API
 * 
 * Usage:
 *   1. Build the app first (one time): pnpm build
 *   2. Run this script: pnpm dev:ssr
 *   3. Visit: http://localhost:3000/api/ssr?id=5
 * 
 * The server will automatically reload when you modify files in src/api/
 * 
 * Alternative: Use Vercel CLI (recommended)
 *   pnpm dev:vercel
 */

import { createServer } from "http";
import { parse } from "url";
import ssrHandler from "../src/api/ssr";
import imageHandler from "../src/api/image";
import type { VercelRequest, VercelResponse } from "@vercel/node";

const PORT = process.env.PORT || 3000;

const server = createServer(async (req, res) => {
  const parsedUrl = parse(req.url || "/", true);
  
  // Debug log
  console.log(`[${new Date().toISOString()}] ${req.method} ${parsedUrl.pathname}`, parsedUrl.query);
  
  // CORS headers
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
        endpoints: {
          ssr: "/api/ssr?id=5",
          image: "/api/image?id=5",
          test: "/test",
        },
      })
    );
    return;
  }

  // Helper function to convert request/response and call handler
  const callVercelHandler = async (handler: (req: VercelRequest, res: VercelResponse) => Promise<void>) => {
    try {
      const headers: Record<string, string | string[] | undefined> = {};
      if (req.headers) {
        for (const [key, value] of Object.entries(req.headers)) {
          headers[key] = value;
        }
      }

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
          const contentType = responseHeaders["Content-Type"] || "text/html";
          res.writeHead(statusCode, { ...responseHeaders, "Content-Type": contentType });
          res.end(body);
          return vercelRes;
        },
        json: (body: any) => {
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

  // SSR endpoint
  if (parsedUrl.pathname === "/api/ssr") {
    await callVercelHandler(ssrHandler);
    return;
  }

  // Image endpoint
  if (parsedUrl.pathname === "/api/image") {
    console.log("Image endpoint called:", parsedUrl.pathname, parsedUrl.query);
    await callVercelHandler(imageHandler);
    return;
  }

  // 404 for other routes
  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end("Not Found");
});

server.listen(PORT, () => {
  console.log(`🚀 SSR dev server running on http://localhost:${PORT}`);
  console.log(`📝 Test endpoint: http://localhost:${PORT}/test`);
  console.log(`🎮 SSR endpoint: http://localhost:${PORT}/api/ssr?id=5`);
  console.log(`🖼️  Image endpoint: http://localhost:${PORT}/api/image?id=5`);
  console.log("\n💡 Make sure to build the app first (one time): pnpm build");
  console.log("💡 The SSR function will look for index.html in dist/ or .vercel/output/static/");
  console.log("💡 Server will auto-reload when you modify files in src/api/");
  console.log("\n💡 Alternative: Use Vercel CLI for better compatibility:");
  console.log("   pnpm dev:vercel\n");
});

// @ts-nocheck
import React from "react";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { ImageResponse } from "@vercel/og";
import { getGame } from "./ssr";
import { Card } from "@/components/og/card";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, "..", "..", "public");
const FONT_PATHS = [
  path.join(PUBLIC_DIR, "assets", "fonts", "pixel-game.regular.otf"),
];
const FONT_NAME = "PixelGame";

async function loadSvgDataUrl(relativePath: string): Promise<string | null> {
  const candidates = [
    path.join(PUBLIC_DIR, relativePath),
    path.join(process.cwd(), "public", relativePath),
    path.join(process.cwd(), "client", "public", relativePath),
  ];
  for (const svgPath of candidates) {
    try {
      const svg = await readFile(svgPath, "utf-8");
      const base64 = Buffer.from(svg).toString("base64");
      return `data:image/svg+xml;base64,${base64}`;
    } catch {
      // Try next path
    }
  }
  console.warn(`Failed to load SVG: ${relativePath}`);
  return null;
}

async function loadPlaceholderSvg(): Promise<Buffer | null> {
  const candidates = [
    path.join(PUBLIC_DIR, "assets", "placeholder.svg"),
    path.join(process.cwd(), "public", "assets", "placeholder.svg"),
    path.join(process.cwd(), "client", "public", "assets", "placeholder.svg"),
  ];
  for (const p of candidates) {
    try {
      return await readFile(p);
    } catch {
      /* try next */
    }
  }
  return null;
}

async function sendPlaceholderFallback(
  res: VercelResponse,
): Promise<boolean> {
  const placeholderUrl = await loadSvgDataUrl("assets/placeholder.svg");
  if (!placeholderUrl) return false;

  try {
    const imageResponse = new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            width: "100%",
            height: "100%",
            margin: 0,
            padding: 0,
            backgroundImage: `url(${placeholderUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            backgroundColor: "#4218B7",
          }}
        />
      ),
      { width: 1200, height: 630 },
    );

    const arrayBuffer = await imageResponse.arrayBuffer();
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "public, max-age=300, s-maxage=300");
    res.status(200).send(Buffer.from(arrayBuffer));
    return true;
  } catch {
    const rawSvg = await loadPlaceholderSvg();
    if (rawSvg) {
      res.setHeader("Content-Type", "image/svg+xml");
      res.setHeader("Cache-Control", "public, max-age=300, s-maxage=300");
      res.status(200).send(rawSvg);
      return true;
    }
    return false;
  }
}

async function loadFont(): Promise<ArrayBuffer | null> {
  for (const fontPath of FONT_PATHS) {
    try {
      const buffer = await readFile(fontPath);
      return new Uint8Array(buffer).buffer;
    } catch {
      /* try next */
    }
  }
  console.warn(
    `PixelGame font not found (tried .otf and .ttf), using default font`,
  );
  return null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const gameIdParam = req.query.id as string | undefined;
    const gameId =
      gameIdParam && !Number.isNaN(Number.parseInt(gameIdParam, 10))
        ? Number.parseInt(gameIdParam, 10)
        : undefined;

    if (!gameId) {
      const sent = await sendPlaceholderFallback(res);
      if (!sent) res.status(400).send("Missing or invalid game ID");
      return;
    }

    const game = await getGame(gameId);

    if (!game) {
      const sent = await sendPlaceholderFallback(res);
      if (!sent) res.status(404).send("Game not found");
      return;
    }

    const fontData = await loadFont();

    const backgroundDataUrl = await loadSvgDataUrl("assets/numbers.svg");
    const imageResponse = new ImageResponse(
      <Card
        useInlineLogo
        backgroundUrl={backgroundDataUrl ?? undefined}
        scoreProps={{ score: game.score }}
        rewardProps={{ reward: game.reward }}
        infoProps={{ over: game.over, values: game.slots }}
      />,
      {
        width: 1200,
        height: 630,
        ...(fontData && {
          fonts: [
            {
              name: FONT_NAME,
              data: fontData,
              style: "normal",
              weight: 400,
            },
          ],
        }),
      },
    );

    const arrayBuffer = await imageResponse.arrayBuffer();
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "public, max-age=300, s-maxage=300");
    res.status(200).send(Buffer.from(arrayBuffer));
  } catch (error) {
    console.error("Game image generation error:", error);
    const sent = await sendPlaceholderFallback(res);
    if (!sent) {
      const msg = error instanceof Error ? error.message : String(error);
      res.status(500).send(`Internal Server Error: ${msg}`);
    }
  }
}

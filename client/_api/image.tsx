// @ts-nocheck
import React from "react";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { ImageResponse } from "@vercel/og";
import { getGame } from "./ssr";
import { Card, Placeholder } from "@/components/og";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(currentDir, "..", "public");
const FONT_PATHS = [
  path.join(PUBLIC_DIR, "assets", "fonts", "pixel-game.regular.otf"),
];
const FONT_NAME = "PixelGame";

async function fallback(res: VercelResponse) {
  const imageResponse = new ImageResponse(
    <Placeholder />,
    { width: 1200, height: 630 },
  );

  const arrayBuffer = await imageResponse.arrayBuffer();
  res.setHeader("Content-Type", "image/png");
  res.setHeader("Cache-Control", "public, max-age=300, s-maxage=300");
  res.status(200).send(Buffer.from(arrayBuffer));
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
      return fallback(res);
    }

    const game = await getGame(gameId);

    if (!game) {
      return fallback(res);
    }

    const fontData = await loadFont();
    const imageResponse = new ImageResponse(
      <Card
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
    return fallback(res);
  }
}

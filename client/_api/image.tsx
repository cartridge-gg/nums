// @ts-nocheck

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { ImageResponse } from "@vercel/og";
import React from "react";
import { Card, Placeholder } from "@/components/og";
import { FONT_BASE64, FONT_NAME } from "@/components/og/asset";
import { getGame } from "./ssr";

// Pre-decode font once at module level (cold start), not per request
const FONT_BUFFER: ArrayBuffer = Buffer.from(
  FONT_BASE64.replace(/^data:[^,]+,/, ""),
  "base64",
).buffer;

const IMAGE_CACHE = new Map<number, { buffer: Buffer; timestamp: number }>();
const CACHE_TTL = 300_000; // aligned with Cache-Control s-maxage

function getCachedImage(gameId: number): Buffer | null {
  const entry = IMAGE_CACHE.get(gameId);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    IMAGE_CACHE.delete(gameId);
    return null;
  }
  return entry.buffer;
}

function setCachedImage(gameId: number, buffer: Buffer): void {
  if (IMAGE_CACHE.size >= 100) {
    const oldest = IMAGE_CACHE.keys().next().value;
    if (oldest !== undefined) IMAGE_CACHE.delete(oldest);
  }
  IMAGE_CACHE.set(gameId, { buffer, timestamp: Date.now() });
}

async function fallback(res: VercelResponse) {
  const imageResponse = new ImageResponse(<Placeholder />, {
    width: 1200,
    height: 630,
  });

  const arrayBuffer = await imageResponse.arrayBuffer();
  res.setHeader("Content-Type", "image/png");
  res.setHeader("Cache-Control", "public, max-age=300, s-maxage=300");
  res.status(200).send(Buffer.from(arrayBuffer));
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Extract gameId from query (?id=) or path (/api/image/:id)
    const gameIdParam =
      (req.query.id as string | undefined) ??
      req.url?.match(/\/api\/image\/(\d+)/)?.[1];
    const gameId =
      gameIdParam && !Number.isNaN(Number.parseInt(gameIdParam, 10))
        ? Number.parseInt(gameIdParam, 10)
        : undefined;

    if (!gameId) {
      await fallback(res);
      return;
    }

    const cached = getCachedImage(gameId);
    if (cached) {
      res.setHeader("Content-Type", "image/png");
      res.setHeader("Cache-Control", "public, max-age=300, s-maxage=300");
      res.status(200).send(cached);
      return;
    }

    const game = await getGame(gameId);

    if (!game) {
      await fallback(res);
      return;
    }

    const imageResponse = new ImageResponse(
      <Card
        scoreProps={{ score: game.score }}
        rewardProps={{ reward: game.reward }}
        infoProps={{ over: game.over, values: game.slots }}
      />,
      {
        width: 1200,
        height: 630,
        fonts: [
          {
            name: FONT_NAME,
            data: FONT_BUFFER,
            weight: 400,
            style: "normal",
          },
        ],
      },
    );

    const arrayBuffer = await imageResponse.arrayBuffer();
    const imageBuffer = Buffer.from(arrayBuffer);

    setCachedImage(gameId, imageBuffer);

    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "public, max-age=300, s-maxage=300");
    res.status(200).send(imageBuffer);
  } catch (error) {
    console.error("Game image generation error:", error);
    await fallback(res);
  }
}

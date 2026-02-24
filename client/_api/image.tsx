// @ts-nocheck
import React from "react";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { ImageResponse } from "@vercel/og";
import { getGame } from "./ssr";
import { Card, Placeholder } from "@/components/og";
import { FONT_NAME, FONT_BASE64 } from "@/components/og/asset";

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Extract gameId from query (?id=) or path (/api/image/:id)
    const gameIdParam =
      (req.query.id as string | undefined) ??
      (req.url?.match(/\/api\/image\/(\d+)/)?.[1]);
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
            data: await fetch(FONT_BASE64).then(res => res.arrayBuffer()),
            weight: 400,
            style: "normal",
          },
        ]
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

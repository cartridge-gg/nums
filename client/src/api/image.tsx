import React from "react";
import { ImageResponse } from "@vercel/og";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Card } from "../components/og/card";
import { getGame } from "../../_api/ssr";

const WIDTH = 1200;
const HEIGHT = 630;

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  const host = req.headers.host || "sepolia.nums.gg";
  const baseUrl =
    host.includes("localhost") || host.includes("127.0.0.1")
      ? `http://${host}`
      : `https://${host}`;

  const gameIdParam = req.query.id as string | undefined;
  const gameId =
    gameIdParam && !isNaN(parseInt(gameIdParam, 10))
      ? parseInt(gameIdParam, 10)
      : undefined;

  let score = 0;
  let reward = 0;
  let over = false;
  let slots: number[] = [];

  if (gameId) {
    const game = await getGame(gameId);
    if (game) {
      score = game.score;
      reward = game.reward;
      over = game.over;
      slots = game.slots;
    }
  }

  if (slots.length === 0) {
    slots = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  }

  const image = new ImageResponse(
    React.createElement(Card, {
      scoreProps: { score },
      rewardProps: { reward },
      infoProps: { over, values: slots },
      baseUrl,
      useInlineLogo: true,
    }),
    {
      width: WIDTH,
      height: HEIGHT,
    },
  );

  res.status(image.status);
  image.headers.forEach((v: string, k: string) => res.setHeader(k, v));
  const buffer = Buffer.from(await image.arrayBuffer());
  res.send(buffer);
}

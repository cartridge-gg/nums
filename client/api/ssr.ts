import type { VercelRequest, VercelResponse } from "@vercel/node";
import fs from "node:fs";
import path from "node:path";

const BASE_URL = "https://sepolia.nums.gg";
const TORII_URL = "https://api.cartridge.gg/x/nums-bal/torii";
const SLOT_SIZE = 12n;

interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string }>;
}

export interface GameData {
  id: number;
  over: boolean;
  score: number;
  reward: number;
  slots: number[];
}

const GAME_QUERY = `query Game($id: String!) {
	numsGameModels(where: {id: $id}) {
		edges {
			node {
				id
        over
        level
        slot_count
        reward
        slots
      }
    }
  }
}`;

class Packer {
  static sized_unpack(packed: bigint, size: bigint, len: number): number[] {
    const result: number[] = [];
    const mask = (1n << size) - 1n;
    for (let i = 0; i < len; i++) {
      result.push(Number(packed & mask));
      packed >>= size;
    }
    return result;
  }
}

export async function getGame(gameId: number): Promise<GameData | null> {
  try {
    const response = await fetch(`${TORII_URL}/graphql`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: GAME_QUERY,
        variables: { id: gameId.toString(16).padStart(16, "0") },
      }),
    });

    if (!response.ok) {
      throw new Error(`Torii request failed: ${response.status}`);
    }

    const json = (await response.json()) as GraphQLResponse<{
      numsGameModels: {
        edges: Array<{
          node: {
            id: string;
            over: string;
            level: number;
            reward: string;
            slot_count: number;
            slots: string;
          };
        }>;
      };
    }>;

    if (json.errors) {
      throw new Error(
        `Torii GraphQL error: ${json.errors.map((e) => e.message).join(", ")}`,
      );
    }

    if (!json.data?.numsGameModels?.edges) {
      throw new Error("No game data returned from Torii");
    }

    const raw = json.data.numsGameModels.edges[0].node;
    const game: GameData = {
      id: parseInt(raw.id, 16),
      over: parseInt(raw.over, 16) !== 0,
      score: Number(raw.level),
      reward: Number(raw.reward),
      slots: Packer.sized_unpack(BigInt(raw.slots), SLOT_SIZE, raw.slot_count),
    };
    return game;
  } catch (error) {
    console.error("Error fetching game:", error);
    return null;
  }
}

/**
 * Escape HTML special characters to prevent XSS attacks
 */
function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Escape URL for HTML attributes without breaking query parameters
 */
function escapeUrl(url: string): string {
  return url
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Build meta tags HTML string
 */
function buildMetaTags(
  title: string,
  description: string,
  imageUrl: string,
  pageUrl: string,
): string {
  const safeTitle = escapeHtml(title);
  const safeDescription = escapeHtml(description);
  const safeImageUrl = escapeUrl(imageUrl);
  const safePageUrl = escapeUrl(pageUrl);

  return `
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${safePageUrl}" />
    <meta property="og:title" content="${safeTitle}" />
    <meta property="og:description" content="${safeDescription}" />
    <meta property="og:image" content="${safeImageUrl}" />
    <meta property="og:site_name" content="Nums" />

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:site" content="@cartridge_gg" />
    <meta name="twitter:creator" content="@cartridge_gg" />
    <meta name="twitter:title" content="${safeTitle}" />
    <meta name="twitter:description" content="${safeDescription}" />
    <meta name="twitter:image" content="${safeImageUrl}" />
  `.trim();
}

async function generateMetaTags(
  url: string,
  gameId: number | undefined,
  baseUrl: string = BASE_URL,
): Promise<string> {
  const title = "Nums.gg";
  const description = "The numbers must be sorted";
  const imageUrl = gameId
    ? `${baseUrl}/api/image?id=${gameId}`
    : `${baseUrl}/api/image`;
  const pageUrl = `${baseUrl}${url}`;
  return buildMetaTags(title, description, imageUrl, pageUrl);
}

let cachedBaseHtml: string | null = null;

const FALLBACK_HTML = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Nums</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.tsx"></script>
</body>
</html>`;

async function loadBaseHtml(host: string): Promise<string> {
  if (cachedBaseHtml) {
    return cachedBaseHtml;
  }

  const protocol =
    host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https";
  const indexUrl = `${protocol}://${host}/index.html`;

  try {
    const response = await fetch(indexUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch index.html: ${response.status}`);
    }
    cachedBaseHtml = await response.text();
    return cachedBaseHtml;
  } catch (fetchError) {
    const localPaths = [
      path.join(process.cwd(), "dist/index.html"),
      path.join(process.cwd(), "client/dist/index.html"),
      path.join(process.cwd(), ".vercel/output/static/index.html"),
    ];

    for (const filePath of localPaths) {
      try {
        cachedBaseHtml = fs.readFileSync(filePath, "utf-8");
        break;
      } catch {
        // Try next path
      }
    }

    if (!cachedBaseHtml) {
      console.warn(
        `Could not load index.html from ${indexUrl} or local filesystem, using fallback`,
      );
      cachedBaseHtml = FALLBACK_HTML;
    }
  }

  return cachedBaseHtml!;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const requestPath = req.url || "/";
  const host = req.headers.host || "sepolia.nums.gg";
  const baseUrl =
    host.includes("localhost") || host.includes("127.0.0.1")
      ? `http://${host}`
      : `https://${host}`;

  try {
    const gameIdParam = req.query.id as string | undefined;
    const gameId =
      gameIdParam && !isNaN(parseInt(gameIdParam, 10))
        ? parseInt(gameIdParam, 10)
        : undefined;

    const metaTags = await generateMetaTags(requestPath, gameId, baseUrl);
    let baseHtml = await loadBaseHtml(host);

    baseHtml = baseHtml.replace(
      /<meta\s+(property|name)=["'](og:|twitter:)[^>]*>/gi,
      "",
    );

    const modifiedHtml = baseHtml.replace(
      "</head>",
      `  ${metaTags}\n  </head>`,
    );

    res.setHeader("Content-Type", "text/html");
    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");
    res.status(200).send(modifiedHtml);
  } catch (error) {
    console.error("SSR Error:", error);
    try {
      const metaTags = await buildMetaTags("Nums", "The numbers must be sorted", `${baseUrl || "https://sepolia.nums.gg"}/api/image`, requestPath || "/");
      const fallback = FALLBACK_HTML.replace("</head>", `  ${metaTags}\n  </head>`);
      res.setHeader("Content-Type", "text/html");
      res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");
      res.status(200).send(fallback);
    } catch (fallbackError) {
      res.setHeader("Content-Type", "text/html");
      res.status(200).send(FALLBACK_HTML);
    }
  }
}

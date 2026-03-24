import { DEFAULT_CHAIN_ID, dojoConfigs } from "@/config";

export function getSqlUrl(): string {
  return `${dojoConfigs[DEFAULT_CHAIN_ID].toriiUrl}/sql`;
}

function parseSqlResponse<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object") {
    if ("rows" in data && Array.isArray((data as { rows: unknown }).rows)) {
      return (data as { rows: T[] }).rows;
    }
    if ("data" in data && Array.isArray((data as { data: unknown }).data)) {
      return (data as { data: T[] }).data;
    }
  }
  return [];
}

export async function executeSql<T>(url: string, query: string): Promise<T[]> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: query,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `SQL query failed: ${response.status} ${response.statusText}. ${errorText}`,
    );
  }

  const contentType = response.headers.get("content-type");
  let data: unknown;
  if (contentType?.includes("application/json")) {
    data = await response.json();
  } else {
    const text = await response.text();
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(`Unexpected response format: ${text.substring(0, 100)}`);
    }
  }

  return parseSqlResponse<T>(data);
}

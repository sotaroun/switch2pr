import { NextResponse } from "next/server";

import { buildCoverUrl, buildScreenshotUrl, igdbRequest } from "@/lib/igdb/client";
import type { GameDetailResponse } from "@/types/game-detail";

const GAME_FIELDS = [
  "id",
  "name",
  "summary",
  "cover.image_id",
  "genres.name",
  "screenshots.image_id",
];

const buildQuery = (id: number) => `fields ${GAME_FIELDS.join(", ")}; where id = ${id}; limit 1;`;

type RawGame = {
  id: number;
  name: string;
  summary?: string | null;
  cover?: { image_id?: string | null } | null;
  genres?: Array<{ name?: string | null }> | null;
  screenshots?: Array<{ image_id?: string | null }> | null;
};

export async function GET(_req: Request, ctx: { params: { id: string } }) {
  const id = Number(ctx.params.id);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "invalid id" }, { status: 400 });
  }

  try {
    const [game] = await igdbRequest<RawGame[]>("games", buildQuery(id));

    if (!game) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }

    const genres = (game.genres ?? [])
      .map((item) => item?.name)
      .filter((name): name is string => Boolean(name));

    const screenshots = (game.screenshots ?? [])
      .map((item) => buildScreenshotUrl(item?.image_id))
      .filter((url): url is string => Boolean(url));

    const responseBody: GameDetailResponse = {
      id: game.id,
      name: game.name,
      summary: game.summary ?? undefined,
      coverUrl: buildCoverUrl(game.cover?.image_id ?? undefined),
      genres,
      screenshots,
    };

    return NextResponse.json(responseBody, {
      headers: {
        "Cache-Control": "public, max-age=60",
      },
    });
  } catch (error) {
    console.error("IGDB request failed", error);
    return NextResponse.json({ error: "igdb_request_failed" }, { status: 500 });
  }
}

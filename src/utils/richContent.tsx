import type { ReactNode } from "react";

export type RichBlock =
  | { id: string; type: "text"; text: string }
  | { id: string; type: "image"; url: string; alt?: string }
  | { id: string; type: "video"; url: string };

export type RichDoc = {
  blocks: RichBlock[];
};

export function parseRichDoc(value: unknown): RichDoc {
  if (!value || typeof value !== "object") return { blocks: [] };
  const v = value as { blocks?: unknown };
  const blocks = Array.isArray(v.blocks) ? (v.blocks as unknown[]) : [];
  const normalized: RichBlock[] = [];

  const fallbackId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  for (const b of blocks) {
    if (!b || typeof b !== "object") continue;
    const obj = b as Record<string, unknown>;
    const type = obj.type;
    const id = typeof obj.id === "string" ? obj.id : fallbackId();

    if (type === "text" && typeof obj.text === "string") {
      normalized.push({ id, type: "text", text: obj.text });
    }
    if (type === "image" && typeof obj.url === "string") {
      normalized.push({
        id,
        type: "image",
        url: obj.url,
        alt: typeof obj.alt === "string" ? obj.alt : undefined,
      });
    }
    if (type === "video" && typeof obj.url === "string") {
      normalized.push({ id, type: "video", url: obj.url });
    }
  }

  return { blocks: normalized };
}

export function renderRichDoc(doc: RichDoc): ReactNode {
  return (
    <div className="space-y-4">
      {doc.blocks.map((b) => {
        if (b.type === "text") {
          return (
            <p key={b.id} className="text-sm leading-7 text-zinc-700 md:text-base">
              {b.text}
            </p>
          );
        }
        if (b.type === "image") {
          return (
            <div key={b.id} className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
              <img src={b.url} alt={b.alt || ""} className="h-auto w-full" />
            </div>
          );
        }
        if (b.type === "video") {
          const isEmbed = b.url.includes("youtube.com") || b.url.includes("youtu.be") || b.url.includes("player.vimeo.com") || b.url.includes("/embed/");
          return (
            <div key={b.id} className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
              <div className="aspect-video w-full">
                {isEmbed ? (
                  <iframe
                    className="h-full w-full"
                    src={b.url}
                    title="video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video className="h-full w-full" src={b.url} controls />
                )}
              </div>
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}


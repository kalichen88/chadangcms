import { useMemo } from "react";
import type { RichBlock, RichDoc } from "@/utils/richContent";

function newId() {
  if (globalThis.crypto && "randomUUID" in globalThis.crypto) return globalThis.crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function move<T>(arr: T[], from: number, to: number) {
  const copy = [...arr];
  const [item] = copy.splice(from, 1);
  copy.splice(to, 0, item);
  return copy;
}

export default function RichBlockEditor({
  value,
  onChange,
}: {
  value: RichDoc;
  onChange: (next: RichDoc) => void;
}) {
  const blocks = useMemo(() => value.blocks || [], [value.blocks]);

  const updateBlock = (id: string, updater: (prev: RichBlock) => RichBlock) => {
    const next = blocks.map((b) => (b.id === id ? updater(b) : b));
    onChange({ blocks: next });
  };

  const removeBlock = (id: string) => {
    onChange({ blocks: blocks.filter((b) => b.id !== id) });
  };

  const addText = () => onChange({ blocks: [...blocks, { id: newId(), type: "text", text: "" }] });
  const addImage = () => onChange({ blocks: [...blocks, { id: newId(), type: "image", url: "" }] });
  const addVideo = () => onChange({ blocks: [...blocks, { id: newId(), type: "video", url: "" }] });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={addText}
          className="rounded-xl bg-zinc-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800"
        >
          添加文字
        </button>
        <button
          type="button"
          onClick={addImage}
          className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-50"
        >
          添加图片
        </button>
        <button
          type="button"
          onClick={addVideo}
          className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-50"
        >
          添加视频
        </button>
      </div>

      {blocks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-6 text-sm text-zinc-600">
          还没有内容块。可添加文字/图片/视频。
        </div>
      ) : null}

      <div className="space-y-3">
        {blocks.map((b, idx) => (
          <div key={b.id} className="rounded-2xl border border-zinc-200 bg-white p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="text-sm font-semibold text-zinc-900">
                {b.type === "text" ? "文字" : b.type === "image" ? "图片" : "视频"} · #{idx + 1}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={() => onChange({ blocks: move(blocks, idx, idx - 1) })}
                  className="rounded-lg border border-zinc-200 bg-white px-2 py-1 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-40"
                >
                  上移
                </button>
                <button
                  type="button"
                  disabled={idx === blocks.length - 1}
                  onClick={() => onChange({ blocks: move(blocks, idx, idx + 1) })}
                  className="rounded-lg border border-zinc-200 bg-white px-2 py-1 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-40"
                >
                  下移
                </button>
                <button
                  type="button"
                  onClick={() => removeBlock(b.id)}
                  className="rounded-lg border border-zinc-200 bg-white px-2 py-1 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-50"
                >
                  删除
                </button>
              </div>
            </div>

            {b.type === "text" ? (
              <textarea
                value={b.text}
                onChange={(e) =>
                  updateBlock(b.id, (prev) =>
                    prev.type === "text" ? { ...prev, text: e.target.value } : prev
                  )
                }
                className="mt-3 h-28 w-full resize-none rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none ring-blue-600/20 focus:ring-4"
                placeholder="输入文字内容"
              />
            ) : null}

            {b.type === "image" ? (
              <div className="mt-3 space-y-2">
                <input
                  value={b.url}
                  onChange={(e) =>
                    updateBlock(b.id, (prev) =>
                      prev.type === "image" ? { ...prev, url: e.target.value } : prev
                    )
                  }
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none ring-blue-600/20 focus:ring-4"
                  placeholder="图片URL（后续可接入上传到 Supabase Storage）"
                />
                {b.url ? <img src={b.url} alt="" className="h-auto w-full rounded-xl border border-zinc-200" /> : null}
              </div>
            ) : null}

            {b.type === "video" ? (
              <div className="mt-3 space-y-2">
                <input
                  value={b.url}
                  onChange={(e) =>
                    updateBlock(b.id, (prev) =>
                      prev.type === "video" ? { ...prev, url: e.target.value } : prev
                    )
                  }
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none ring-blue-600/20 focus:ring-4"
                  placeholder="视频URL（YouTube embed 或 mp4 链接）"
                />
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}


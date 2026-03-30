import { useMemo, useRef, useState } from "react";
import type { RichBlock, RichDoc } from "@/utils/richContent";
import { uploadToPublicBucket } from "@/utils/supabaseStorage";

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
  accessToken,
  storageBucket,
  storageFolder,
}: {
  value: RichDoc;
  onChange: (next: RichDoc) => void;
  accessToken?: string;
  storageBucket: string;
  storageFolder: string;
}) {
  const blocks = useMemo(() => value.blocks || [], [value.blocks]);
  const inputByBlock = useRef<Record<string, HTMLInputElement | null>>({});
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [uploadError, setUploadError] = useState<Record<string, string | undefined>>({});

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

  const setBlockUploading = (id: string, v: boolean) =>
    setUploading((prev) => ({ ...prev, [id]: v }));
  const setBlockError = (id: string, msg: string | undefined) =>
    setUploadError((prev) => ({ ...prev, [id]: msg }));

  const onPickFile = (blockId: string) => {
    const el = inputByBlock.current[blockId];
    if (!el) return;
    el.value = "";
    el.click();
  };

  const onUploadFile = async (blockId: string, kind: "image" | "video", file: File) => {
    if (!accessToken) {
      setBlockError(blockId, "未登录，无法上传")
      return;
    }
    if (kind === "image" && !file.type.startsWith("image/")) {
      setBlockError(blockId, "请选择图片文件")
      return;
    }
    if (kind === "video" && !file.type.startsWith("video/")) {
      setBlockError(blockId, "请选择视频文件")
      return;
    }

    setBlockError(blockId, undefined);
    setBlockUploading(blockId, true);
    try {
      const { publicUrl } = await uploadToPublicBucket({
        accessToken,
        bucket: storageBucket,
        folder: storageFolder,
        file,
      });
      updateBlock(blockId, (prev) => (prev.type === kind ? { ...prev, url: publicUrl } : prev));
    } catch (e) {
      const msg = e instanceof Error ? e.message : "上传失败";
      const hint =
        msg === "Failed to fetch"
          ? "网络/CORS/权限导致请求被浏览器拦截。请先确认已登录后台、`/__env` 返回的 Supabase 配置非空，并检查 Supabase Storage bucket `public-media` 已存在且允许 authenticated 写入。"
          : "";
      setBlockError(blockId, hint ? `${msg}（${hint}）` : msg);
    } finally {
      setBlockUploading(blockId, false);
    }
  };

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
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onPickFile(b.id)}
                    disabled={!accessToken || !!uploading[b.id]}
                    className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-800 transition hover:bg-zinc-50 disabled:opacity-50"
                  >
                    {uploading[b.id] ? "上传中…" : "选择图片上传"}
                  </button>
                  <input
                    ref={(el) => {
                      inputByBlock.current[b.id] = el;
                    }}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      void onUploadFile(b.id, "image", f);
                    }}
                  />
                  <div className="text-xs text-zinc-500">将原图上传到 Storage，并自动回填公开URL</div>
                </div>
                <input
                  value={b.url}
                  onChange={(e) =>
                    updateBlock(b.id, (prev) =>
                      prev.type === "image" ? { ...prev, url: e.target.value } : prev
                    )
                  }
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none ring-blue-600/20 focus:ring-4"
                  placeholder="图片URL（可粘贴外链，也可用上方按钮上传）"
                />
                {uploadError[b.id] ? (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                    {uploadError[b.id]}
                  </div>
                ) : null}
                {b.url ? <img src={b.url} alt="" className="h-auto w-full rounded-xl border border-zinc-200" /> : null}
              </div>
            ) : null}

            {b.type === "video" ? (
              <div className="mt-3 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onPickFile(b.id)}
                    disabled={!accessToken || !!uploading[b.id]}
                    className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-800 transition hover:bg-zinc-50 disabled:opacity-50"
                  >
                    {uploading[b.id] ? "上传中…" : "选择视频上传"}
                  </button>
                  <input
                    ref={(el) => {
                      inputByBlock.current[b.id] = el;
                    }}
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      void onUploadFile(b.id, "video", f);
                    }}
                  />
                  <div className="text-xs text-zinc-500">将原视频上传到 Storage，并自动回填公开URL</div>
                </div>
                <input
                  value={b.url}
                  onChange={(e) =>
                    updateBlock(b.id, (prev) =>
                      prev.type === "video" ? { ...prev, url: e.target.value } : prev
                    )
                  }
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none ring-blue-600/20 focus:ring-4"
                  placeholder="视频URL（可粘贴 mp4 链接，也可用上方按钮上传）"
                />
                {uploadError[b.id] ? (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                    {uploadError[b.id]}
                  </div>
                ) : null}
                {b.url ? (
                  <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
                    <div className="aspect-video w-full">
                      <video className="h-full w-full" src={b.url} controls />
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}


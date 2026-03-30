import { useRef, useState } from "react";
import type { CarouselItem } from "@/utils/supabaseRest";
import { uploadToPublicBucket } from "@/utils/supabaseStorage";

export default function CarouselPanel({
  loading,
  carousel,
  newCarousel,
  accessToken,
  onChangeNew,
  onCreate,
  onUpdate,
  onDelete,
}: {
  loading: boolean
  carousel: CarouselItem[]
  newCarousel: { title: string; image_url: string; link_url: string; sort_order: number; is_published: boolean }
  accessToken: string
  onChangeNew: (next: { title: string; image_url: string; link_url: string; sort_order: number; is_published: boolean }) => void
  onCreate: () => void
  onUpdate: (row: CarouselItem, patch: Partial<CarouselItem>) => void
  onDelete: (row: CarouselItem) => void
}) {
  const newFileRef = useRef<HTMLInputElement | null>(null)
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({})
  const [uploading, setUploading] = useState<Record<string, boolean>>({})
  const [error, setError] = useState<Record<string, string | undefined>>({})

  const setRowUploading = (id: string, v: boolean) => setUploading((p) => ({ ...p, [id]: v }))
  const setRowError = (id: string, msg: string | undefined) => setError((p) => ({ ...p, [id]: msg }))

  const upload = async (rowId: string, file: File) => {
    if (!accessToken) {
      setRowError(rowId, "未登录，无法上传")
      return
    }
    if (!file.type.startsWith("image/")) {
      setRowError(rowId, "请选择图片文件")
      return
    }
    setRowError(rowId, undefined)
    setRowUploading(rowId, true)
    try {
      const { publicUrl } = await uploadToPublicBucket({
        accessToken,
        bucket: "public-media",
        folder: "cms/carousel",
        file,
      })
      if (rowId === "new") {
        onChangeNew({ ...newCarousel, image_url: publicUrl })
      } else {
        const row = carousel.find((c) => c.id === rowId)
        if (row) onUpdate(row, { image_url: publicUrl })
      }
    } catch (e) {
      setRowError(rowId, e instanceof Error ? e.message : "上传失败")
    } finally {
      setRowUploading(rowId, false)
    }
  }

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-zinc-200 bg-white p-4">
        <div className="text-sm font-semibold text-zinc-900">新增轮播</div>
        <div className="mt-4 grid gap-2 md:grid-cols-4">
          <input
            value={newCarousel.title}
            onChange={(e) => onChangeNew({ ...newCarousel, title: e.target.value })}
            className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none ring-blue-600/20 focus:ring-4"
            placeholder="标题"
          />
          <input
            value={newCarousel.image_url}
            onChange={(e) => onChangeNew({ ...newCarousel, image_url: e.target.value })}
            className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none ring-blue-600/20 focus:ring-4"
            placeholder="图片URL"
          />
          <input
            value={newCarousel.link_url}
            onChange={(e) => onChangeNew({ ...newCarousel, link_url: e.target.value })}
            className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none ring-blue-600/20 focus:ring-4"
            placeholder="跳转链接（/list/services）"
          />
          <input
            value={String(newCarousel.sort_order)}
            onChange={(e) => onChangeNew({ ...newCarousel, sort_order: Number(e.target.value) || 0 })}
            className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none ring-blue-600/20 focus:ring-4"
            placeholder="排序"
          />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (!newFileRef.current) return
              newFileRef.current.value = ""
              newFileRef.current.click()
            }}
            disabled={loading || uploading["new"]}
            className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-50 disabled:opacity-50"
          >
            {uploading["new"] ? "上传中…" : "上传图片"}
          </button>
          <input
            ref={newFileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (!f) return
              void upload("new", f)
            }}
          />
          {error["new"] ? <div className="text-xs text-amber-700">{error["new"]}</div> : null}
        </div>
        <button
          type="button"
          onClick={onCreate}
          className="mt-3 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          添加轮播
        </button>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-4">
        <div className="text-sm font-semibold text-zinc-900">轮播列表</div>
        <div className="mt-4 space-y-3">
          {carousel.map((c) => (
            <div key={c.id} className="rounded-2xl border border-zinc-200 bg-white p-4">
              <div className="grid gap-2 md:grid-cols-4">
                <input
                  defaultValue={c.title}
                  onBlur={(e) => onUpdate(c, { title: e.target.value })}
                  className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none"
                />
                <input
                  defaultValue={c.image_url}
                  onBlur={(e) => onUpdate(c, { image_url: e.target.value })}
                  className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none"
                />
                <input
                  defaultValue={c.link_url}
                  onBlur={(e) => onUpdate(c, { link_url: e.target.value })}
                  className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none"
                />
                <input
                  defaultValue={String(c.sort_order)}
                  onBlur={(e) => onUpdate(c, { sort_order: Number(e.target.value) || 0 })}
                  className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none"
                />
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => onUpdate(c, { is_published: !c.is_published })}
                  className={
                    c.is_published
                      ? "rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700"
                      : "rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-700"
                  }
                >
                  {c.is_published ? "已发布" : "下线"}
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const el = fileRefs.current[c.id]
                      if (!el) return
                      el.value = ""
                      el.click()
                    }}
                    disabled={loading || uploading[c.id]}
                    className="rounded-lg border border-zinc-200 bg-white px-2 py-1 text-xs font-semibold text-zinc-800 hover:bg-zinc-50 disabled:opacity-50"
                  >
                    {uploading[c.id] ? "上传中…" : "换图"}
                  </button>
                  <input
                    ref={(el) => {
                      fileRefs.current[c.id] = el
                    }}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0]
                      if (!f) return
                      void upload(c.id, f)
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => onDelete(c)}
                    className="rounded-lg border border-red-200 bg-white px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-50"
                  >
                    删除
                  </button>
                  {c.image_url ? <img src={c.image_url} alt="" className="h-10 w-16 rounded-lg object-cover" /> : null}
                </div>
              </div>
              {error[c.id] ? <div className="mt-2 text-xs text-amber-700">{error[c.id]}</div> : null}
            </div>
          ))}
          {!carousel.length && !loading ? <div className="text-sm text-zinc-600">暂无轮播</div> : null}
        </div>
      </section>
    </div>
  )
}


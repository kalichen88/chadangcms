import type { CarouselItem } from "@/utils/supabaseRest";

export default function CarouselPanel({
  loading,
  carousel,
  newCarousel,
  onChangeNew,
  onCreate,
  onUpdate,
}: {
  loading: boolean
  carousel: CarouselItem[]
  newCarousel: { title: string; image_url: string; link_url: string; sort_order: number; is_published: boolean }
  onChangeNew: (next: { title: string; image_url: string; link_url: string; sort_order: number; is_published: boolean }) => void
  onCreate: () => void
  onUpdate: (row: CarouselItem, patch: Partial<CarouselItem>) => void
}) {
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
              <div className="mt-3 flex items-center justify-between">
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
                {c.image_url ? <img src={c.image_url} alt="" className="h-10 w-16 rounded-lg object-cover" /> : null}
              </div>
            </div>
          ))}
          {!carousel.length && !loading ? <div className="text-sm text-zinc-600">暂无轮播</div> : null}
        </div>
      </section>
    </div>
  )
}


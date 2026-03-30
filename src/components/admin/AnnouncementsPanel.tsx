import RichBlockEditor from "@/components/admin/RichBlockEditor";
import type { RichDoc } from "@/utils/richContent";
import type { Announcement } from "@/utils/supabaseRest";

export default function AnnouncementsPanel({
  loading,
  announcements,
  title,
  slug,
  doc,
  accessToken,
  onChangeTitle,
  onChangeSlug,
  onChangeDoc,
  onCreate,
  onToggle,
}: {
  loading: boolean
  announcements: Announcement[]
  title: string
  slug: string
  doc: RichDoc
  accessToken: string
  onChangeTitle: (v: string) => void
  onChangeSlug: (v: string) => void
  onChangeDoc: (v: RichDoc) => void
  onCreate: () => void
  onToggle: (a: Announcement) => void
}) {
  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-zinc-200 bg-white p-4">
        <div className="text-sm font-semibold text-zinc-900">新增公告</div>
        <div className="mt-4 grid gap-2 md:grid-cols-2">
          <input
            value={title}
            onChange={(e) => onChangeTitle(e.target.value)}
            className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none ring-blue-600/20 focus:ring-4"
            placeholder="公告标题"
          />
          <input
            value={slug}
            onChange={(e) => onChangeSlug(e.target.value)}
            className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none ring-blue-600/20 focus:ring-4"
            placeholder="slug（如 announcement-2）"
          />
        </div>
        <div className="mt-4">
          <RichBlockEditor
            value={doc}
            onChange={onChangeDoc}
            accessToken={accessToken}
            storageBucket="public-media"
            storageFolder={`cms/announcement/${slug || "draft"}`}
          />
        </div>
        <button
          type="button"
          onClick={onCreate}
          className="mt-3 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          发布公告
        </button>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-4">
        <div className="text-sm font-semibold text-zinc-900">公告列表</div>
        <div className="mt-4 space-y-2">
          {announcements.map((a) => (
            <div key={a.id} className="flex items-center justify-between gap-3 rounded-2xl border border-zinc-200 bg-white px-4 py-3">
              <div>
                <div className="text-sm font-semibold text-zinc-900">{a.title}</div>
                <div className="mt-1 text-xs text-zinc-500">slug：{a.slug}</div>
              </div>
              <button
                type="button"
                onClick={() => onToggle(a)}
                className={
                  a.is_published
                    ? "rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700"
                    : "rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-700"
                }
              >
                {a.is_published ? "已发布" : "下线"}
              </button>
            </div>
          ))}
          {!announcements.length && !loading ? <div className="text-sm text-zinc-600">暂无公告</div> : null}
        </div>
      </section>
    </div>
  )
}


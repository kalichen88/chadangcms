import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Container from "@/components/layout/Container";
import SiteShell from "@/components/layout/SiteShell";
import { useEffect, useState } from "react";
import { getPublicAnnouncementBySlug, getPublicDetailBySlug, type Announcement, type ContentItem } from "@/utils/supabaseRest";
import { parseRichDoc, renderRichDoc } from "@/utils/richContent";
import { usePublicSettings } from "@/hooks/usePublicSettings";

export default function Detail() {
  const { contentSlug } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [content, setContent] = useState<ContentItem | null>(null);
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);

  useEffect(() => {
    if (!contentSlug) return;
    let cancelled = false;
    setLoading(true);
    void (async () => {
      const c = await getPublicDetailBySlug(contentSlug);
      if (c) return { c, a: null as Announcement | null };
      const a = await getPublicAnnouncementBySlug(contentSlug);
      return { c: null as ContentItem | null, a };
    })()
      .then(({ c, a }) => {
        if (cancelled) return;
        setContent(c);
        setAnnouncement(a);
        setError(null);
        setLoading(false);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "加载失败");
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [contentSlug]);

  const title = content?.title || announcement?.title || "内容详情";
  const price = content?.price_text || "";
  const code = content?.code || "";
  const doc = parseRichDoc((content?.content_json || announcement?.content_json) as unknown);
  const { settings } = usePublicSettings();

  return (
    <SiteShell>
      <Container className="py-10">
        <div className="mb-6 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 transition hover:bg-zinc-50"
          >
            <ArrowLeft className="h-4 w-4" />
            返回
          </button>
          <div />
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <article className="rounded-2xl border border-zinc-200 bg-white p-6">
            {error ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">{error}</div>
            ) : null}

            {loading ? (
              <div className="animate-pulse">
                <div className="h-8 w-2/3 rounded bg-zinc-100" />
                <div className="mt-3 h-4 w-1/2 rounded bg-zinc-100" />
                <div className="mt-6 h-40 w-full rounded-xl bg-zinc-100" />
              </div>
            ) : content || announcement ? (
              <>
                <h1 className="text-2xl font-semibold text-zinc-900">{title}</h1>
                {content ? (
                  <div className="mt-2 text-sm text-zinc-600">
                    {price ? `价格：${price}` : "价格：面议"}
                    {code ? ` · 项目ID：${code}` : null}
                  </div>
                ) : (
                  <div className="mt-2 text-sm text-zinc-600">公告</div>
                )}
                <div className="mt-6">{renderRichDoc(doc)}</div>
              </>
            ) : (
              <div className="text-sm text-zinc-600">未找到该内容或尚未发布。</div>
            )}
          </article>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-zinc-200 bg-white p-4">
              <div className="text-sm font-semibold text-zinc-900">联系方式</div>
              <div className="mt-2 space-y-1 text-sm text-zinc-600">
                {settings?.phone ? <div>电话：{settings.phone}</div> : null}
                {settings?.email ? <div>邮箱：{settings.email}</div> : null}
                {settings?.work_time ? <div>工作时间：{settings.work_time}</div> : null}
              </div>
            </div>
          </aside>
        </div>
      </Container>
    </SiteShell>
  );
}


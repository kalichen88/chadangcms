import { Link, useParams } from "react-router-dom";
import Container from "@/components/layout/Container";
import SiteShell from "@/components/layout/SiteShell";
import { useEffect, useState } from "react";
import { getPublicListData, type ContentItem, type Category } from "@/utils/supabaseRest";

export default function List() {
  const { categorySlug } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [items, setItems] = useState<ContentItem[]>([]);

  useEffect(() => {
    if (!categorySlug) return;
    let cancelled = false;
    setLoading(true);
    void getPublicListData(categorySlug)
      .then((d) => {
        if (cancelled) return;
        setCategory(d.category);
        setItems(d.items);
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
  }, [categorySlug]);

  return (
    <SiteShell>
      <Container className="py-10">
        <div className="mb-6">
          <h1 className="mt-2 text-2xl font-semibold text-zinc-900">{category?.name || `栏目：${categorySlug}`}</h1>
        </div>

        {error ? (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            {error}
          </div>
        ) : null}

        <div>
          <section className="grid gap-4 md:grid-cols-2">
            {loading ? (
              Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className="animate-pulse rounded-2xl border border-zinc-200 bg-white p-4">
                  <div className="aspect-[16/9] w-full rounded-xl bg-zinc-100" />
                  <div className="mt-4 h-4 w-2/3 rounded bg-zinc-100" />
                  <div className="mt-2 h-4 w-1/2 rounded bg-zinc-100" />
                  <div className="mt-3 h-4 w-full rounded bg-zinc-100" />
                </div>
              ))
            ) : items.length ? (
              items.map((it) => (
                <Link
                  key={it.id}
                  to={`/detail/${it.slug}`}
                  className="group rounded-2xl border border-zinc-200 bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <div className="aspect-[16/9] w-full overflow-hidden rounded-xl bg-zinc-100">
                    {it.cover_url ? <img src={it.cover_url} alt={it.title} className="h-full w-full object-cover" /> : null}
                  </div>
                  <div className="mt-4 flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-zinc-900 group-hover:text-blue-700">{it.title}</div>
                      <div className="mt-1 text-sm text-zinc-600">价格：{it.price_text || "面议"}</div>
                      <div className="mt-1 text-xs text-zinc-500">ID：{it.code}</div>
                    </div>
                    <div className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">查看详情</div>
                  </div>
                  {it.summary ? <div className="mt-2 text-sm text-zinc-600">{it.summary}</div> : null}
                </Link>
              ))
            ) : (
              <div className="col-span-full rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600">
                该栏目暂无已发布内容。
              </div>
            )}
          </section>
        </div>
      </Container>
    </SiteShell>
  );
}


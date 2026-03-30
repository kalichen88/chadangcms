import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import RichBlockEditor from "@/components/admin/RichBlockEditor";
import { useAuthStore } from "@/stores/authStore";
import {
  adminCreateContent,
  adminGenerateNextCode,
  adminGetContentById,
  adminListCategories,
  adminUpdateContent,
  type Category,
  type ContentItem,
  type ContentWrite,
} from "@/utils/supabaseRest";
import { parseRichDoc, type RichDoc } from "@/utils/richContent";

export default function AdminEditor() {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const session = useAuthStore((s) => s.session);
  const token = session?.access_token || "";

  const isNew = id === "new";
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [current, setCurrent] = useState<ContentItem | null>(null);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [priceText, setPriceText] = useState("");
  const [code, setCode] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [summary, setSummary] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [tagsCsv, setTagsCsv] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [doc, setDoc] = useState<RichDoc>({ blocks: [] });

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    setLoading(true);
    void (async () => {
      const cs = await adminListCategories(token);
      const item = !isNew && id ? await adminGetContentById(token, id) : null;
      return { cs, item };
    })()
      .then(({ cs, item }) => {
        if (cancelled) return;
        setCategories(cs);
        setCurrent(item);
        if (item) {
          setTitle(item.title);
          setSlug(item.slug);
          setPriceText(item.price_text);
          setCode(item.code);
          setCategoryId(item.category_id);
          setSummary(item.summary);
          setCoverUrl(item.cover_url);
          setTagsCsv(item.tags_csv);
          setIsPublished(item.is_published);
          setDoc(parseRichDoc(item.content_json));
        } else {
          const first = cs[0];
          if (first) setCategoryId(first.id);
          setDoc({ blocks: [] });
        }
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
  }, [id, isNew, token]);

  const selectedCategory = useMemo(() => categories.find((c) => c.id === categoryId) || null, [categories, categoryId]);

  useEffect(() => {
    if (!token) return;
    if (!isNew) return;
    if (!selectedCategory) return;
    if (code) return;
    void adminGenerateNextCode(token, selectedCategory.id, selectedCategory.code_prefix)
      .then((c) => setCode(c))
      .catch(() => setCode(`${selectedCategory.code_prefix}001`));
  }, [code, isNew, selectedCategory, token]);

  const canSave = useMemo(() => !!title && !!slug && !!categoryId && !!code, [categoryId, code, slug, title]);

  const onSave = async (publish: boolean) => {
    if (!token || !type) return;
    if (!canSave) {
      setError("请填写标题、slug、栏目与项目ID");
      return;
    }
    setSaving(true);
    try {
      const payload: ContentWrite = {
        type,
        title,
        slug,
        category_id: categoryId,
        code,
        price_text: priceText,
        summary,
        cover_url: coverUrl,
        tags_csv: tagsCsv,
        seo_title: "",
        seo_description: "",
        og_image_url: "",
        content_json: doc,
        content_html: "",
        is_published: publish,
        published_at: publish ? new Date().toISOString() : null,
      };

      if (isNew) {
        const created = await adminCreateContent(token, payload);
        const row = created[0];
        navigate(`/admin/editor/${type}/${row.id}`, { replace: true });
      } else if (current) {
        await adminUpdateContent(token, current.id, payload);
      }
      setIsPublished(publish);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "保存失败");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <Link
              to="/admin/content"
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 transition hover:bg-zinc-50"
            >
              <ArrowLeft className="h-4 w-4" />
              返回
            </Link>
            <h1 className="text-xl font-semibold text-zinc-900">富内容编辑器</h1>
          </div>
          <div className="mt-2 text-sm text-zinc-600">类型：{type} · 状态：{isPublished ? "已发布" : "草稿"}</div>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">{error}</div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <section className="rounded-2xl border border-zinc-200 bg-white p-4">
          <div className="text-sm font-semibold text-zinc-900">详情内容</div>
          <div className="mt-3">
            {loading ? (
              <div className="h-[520px] animate-pulse rounded-xl bg-zinc-100" />
            ) : (
              <RichBlockEditor
                value={doc}
                onChange={setDoc}
                accessToken={token}
                storageBucket="public-media"
                storageFolder={`cms/${type || "content"}/${slug || code || "draft"}`}
              />
            )}
          </div>
        </section>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-zinc-200 bg-white p-4">
            <div className="text-sm font-semibold text-zinc-900">基础信息</div>
            <div className="mt-3 space-y-3">
              <label className="block">
                <div className="text-xs font-semibold text-zinc-600">标题</div>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none ring-blue-600/20 focus:ring-4"
                />
              </label>
              <label className="block">
                <div className="text-xs font-semibold text-zinc-600">slug（用于URL）</div>
                <input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none ring-blue-600/20 focus:ring-4"
                  placeholder="demo-project-1"
                />
              </label>
              <label className="block">
                <div className="text-xs font-semibold text-zinc-600">所属栏目</div>
                <select
                  value={categoryId}
                  onChange={(e) => {
                    setCategoryId(e.target.value);
                    if (isNew) setCode("");
                  }}
                  className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none ring-blue-600/20 focus:ring-4"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}（{c.code_prefix}）
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <div className="text-xs font-semibold text-zinc-600">项目ID</div>
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none ring-blue-600/20 focus:ring-4"
                  placeholder="A001"
                />
              </label>
              <label className="block">
                <div className="text-xs font-semibold text-zinc-600">价格</div>
                <input
                  value={priceText}
                  onChange={(e) => setPriceText(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none ring-blue-600/20 focus:ring-4"
                  placeholder="¥ 9,800 起"
                />
              </label>
              <label className="block">
                <div className="text-xs font-semibold text-zinc-600">摘要</div>
                <textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="mt-1 h-20 w-full resize-none rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none ring-blue-600/20 focus:ring-4"
                />
              </label>
              <label className="block">
                <div className="text-xs font-semibold text-zinc-600">封面URL</div>
                <input
                  value={coverUrl}
                  onChange={(e) => setCoverUrl(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none ring-blue-600/20 focus:ring-4"
                />
              </label>
              <label className="block">
                <div className="text-xs font-semibold text-zinc-600">标签（逗号分隔）</div>
                <input
                  value={tagsCsv}
                  onChange={(e) => setTagsCsv(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none ring-blue-600/20 focus:ring-4"
                />
              </label>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-4">
            <div className="text-sm font-semibold text-zinc-900">操作</div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                className="rounded-xl bg-zinc-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-50"
                type="button"
                disabled={saving}
                onClick={() => void onSave(false)}
              >
                {saving ? "保存中…" : "保存草稿"}
              </button>
              <button
                className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-50"
                type="button"
                onClick={() => window.open(`/detail/${slug}`, "_blank")}
                disabled={!slug}
              >
                预览
              </button>
              <button
                className="col-span-2 rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
                type="button"
                disabled={saving}
                onClick={() => void onSave(true)}
              >
                发布
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}


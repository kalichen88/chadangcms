import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import {
  adminCreateCategory,
  adminDeleteContent,
  adminListAllContent,
  adminListCategories,
  adminUpdateCategory,
  type Category,
  type ContentItem,
} from "@/utils/supabaseRest";

export default function AdminContent() {
  const session = useAuthStore((s) => s.session);
  const token = session?.access_token || "";
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<ContentItem[]>([]);
  const [catName, setCatName] = useState("");
  const [catSlug, setCatSlug] = useState("");
  const [catPrefix, setCatPrefix] = useState("A");

  const reload = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [cs, its] = await Promise.all([adminListCategories(token), adminListAllContent(token)]);
      setCategories(cs);
      setItems(its);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const canCreateCategory = useMemo(() => !!catName && !!catSlug && !!catPrefix, [catName, catPrefix, catSlug]);

  const onCreateCategory = async () => {
    if (!token || !canCreateCategory) return;
    try {
      await adminCreateCategory(token, {
        name: catName,
        slug: catSlug,
        code_prefix: catPrefix,
        sort_order: 0,
        is_published: true,
        show_on_home: true,
      });
      setCatName("");
      setCatSlug("");
      setCatPrefix("A");
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "创建失败");
    }
  };

  const toggleCategoryPublished = async (c: Category) => {
    if (!token) return;
    await adminUpdateCategory(token, c.id, { is_published: !c.is_published });
    await reload();
  };

  const onDelete = async (it: ContentItem) => {
    if (!token) return
    const ok = window.confirm(`确认删除：${it.title}（${it.code}）？删除后不可恢复。`)
    if (!ok) return
    try {
      await adminDeleteContent(token, it.id)
      await reload()
    } catch (e) {
      setError(e instanceof Error ? e.message : "删除失败")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">内容管理</h1>
          <div className="mt-1 text-sm text-zinc-600">管理栏目、项目/文章、公告等内容并发布。</div>
        </div>
        <Link
          to="/admin/editor/project/new"
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          新建内容
        </Link>
      </div>

      {error ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">{error}</div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-zinc-200 bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-zinc-900">栏目管理</div>
              <div className="mt-1 text-sm text-zinc-600">新增/上下线栏目，并配置栏目编号前缀(A/B/C)。</div>
            </div>
          </div>

          <div className="mt-4 grid gap-2 md:grid-cols-3">
            <input
              value={catName}
              onChange={(e) => setCatName(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none ring-blue-600/20 focus:ring-4"
              placeholder="栏目名称"
            />
            <input
              value={catSlug}
              onChange={(e) => setCatSlug(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none ring-blue-600/20 focus:ring-4"
              placeholder="slug（如 services）"
            />
            <input
              value={catPrefix}
              onChange={(e) => setCatPrefix(e.target.value.toUpperCase().slice(0, 1))}
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none ring-blue-600/20 focus:ring-4"
              placeholder="编号前缀（A）"
            />
          </div>
          <button
            type="button"
            onClick={() => void onCreateCategory()}
            disabled={!canCreateCategory || loading}
            className="mt-3 rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            添加栏目
          </button>

          <div className="mt-4 overflow-hidden rounded-2xl border border-zinc-200">
            <div className="grid grid-cols-12 border-b border-zinc-100 bg-zinc-50 px-3 py-2 text-xs font-semibold text-zinc-600">
              <div className="col-span-5">名称</div>
              <div className="col-span-3">slug</div>
              <div className="col-span-2">前缀</div>
              <div className="col-span-2">状态</div>
            </div>
            {categories.map((c) => (
              <div key={c.id} className="grid grid-cols-12 items-center px-3 py-2 text-sm">
                <div className="col-span-5 font-medium text-zinc-900">{c.name}</div>
                <div className="col-span-3 text-zinc-600">{c.slug}</div>
                <div className="col-span-2 text-zinc-600">{c.code_prefix}</div>
                <div className="col-span-2">
                  <button
                    type="button"
                    onClick={() => void toggleCategoryPublished(c)}
                    className={
                      c.is_published
                        ? "rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700"
                        : "rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-semibold text-zinc-700"
                    }
                  >
                    {c.is_published ? "已发布" : "下线"}
                  </button>
                </div>
              </div>
            ))}
            {!categories.length && !loading ? (
              <div className="px-3 py-4 text-sm text-zinc-600">暂无栏目</div>
            ) : null}
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white">
          <div className="flex items-start justify-between gap-4 border-b border-zinc-100 px-4 py-4">
            <div>
              <div className="text-sm font-semibold text-zinc-900">项目/内容列表</div>
              <div className="mt-1 text-sm text-zinc-600">点击进入编辑，保存后可发布到前台展示。</div>
            </div>
            <Link
              to="/admin/editor/project/new"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              新建
            </Link>
          </div>

          <div className="grid grid-cols-12 border-b border-zinc-100 px-4 py-3 text-xs font-semibold text-zinc-600">
            <div className="col-span-4">标题</div>
            <div className="col-span-2">ID</div>
            <div className="col-span-2">类型</div>
            <div className="col-span-2">状态</div>
            <div className="col-span-1">更新时间</div>
            <div className="col-span-1 text-right">操作</div>
          </div>
          {items.map((it) => (
            <div key={it.id} className="grid grid-cols-12 items-center px-4 py-3 text-sm transition hover:bg-zinc-50">
              <Link
                to={`/admin/editor/${it.type}/${it.id}`}
                className="col-span-4 font-medium text-zinc-900 hover:underline"
              >
                {it.title}
              </Link>
              <div className="col-span-2 text-zinc-600">{it.code}</div>
              <div className="col-span-2 text-zinc-600">{it.type}</div>
              <div className="col-span-2">
                <span
                  className={
                    it.is_published
                      ? "rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700"
                      : "rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700"
                  }
                >
                  {it.is_published ? "已发布" : "草稿"}
                </span>
              </div>
              <div className="col-span-1 truncate text-zinc-600" title={new Date(it.updated_at).toLocaleString()}>
                {new Date(it.updated_at).toLocaleDateString()}
              </div>
              <div className="col-span-1 flex justify-end">
                <button
                  type="button"
                  onClick={() => void onDelete(it)}
                  className="rounded-lg border border-red-200 bg-white px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-50"
                >
                  删除
                </button>
              </div>
            </div>
          ))}
          {!items.length && !loading ? <div className="px-4 py-4 text-sm text-zinc-600">暂无内容</div> : null}
        </section>
      </div>
    </div>
  );
}


import { Link } from "react-router-dom";
import Container from "@/components/layout/Container";
import SiteShell from "@/components/layout/SiteShell";
import { useEffect, useMemo, useState } from "react";
import { getPublicHomeData, type CarouselItem, type Category, type Announcement, type SiteSettings } from "@/utils/supabaseRest";
import MarqueeNotice from "@/components/MarqueeNotice";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [carousel, setCarousel] = useState<CarouselItem[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [carouselIndex, setCarouselIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void getPublicHomeData()
      .then((d) => {
        if (cancelled) return;
        setSettings(d.settings);
        setCarousel(d.carousel);
        setAnnouncements(d.announcements);
        setCategories(d.categories);
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
  }, []);

  const active = carousel.length ? carousel[Math.min(carouselIndex, carousel.length - 1)] : null;

  useEffect(() => {
    if (!carousel.length) return;
    const t = window.setInterval(() => {
      setCarouselIndex((i) => (i + 1) % carousel.length);
    }, 4500);
    return () => window.clearInterval(t);
  }, [carousel.length]);

  const homeCategories = useMemo(() => categories.filter((c) => c.show_on_home), [categories]);

  return (
    <SiteShell>
      <div className="border-b border-zinc-200 bg-white">
        <div className="relative h-[360px] overflow-hidden md:h-[440px]">
          {active?.image_url ? (
            active.link_url ? (
              <Link to={active.link_url} aria-label={active.title || "轮播"} className="absolute inset-0">
                <img src={active.image_url} alt={active.title} className="h-full w-full object-cover" />
              </Link>
            ) : (
              <img src={active.image_url} alt={active.title} className="absolute inset-0 h-full w-full object-cover" />
            )
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-sky-500 to-zinc-900" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/70 via-zinc-950/20 to-zinc-950/10" />
          <Container className="relative flex h-full items-end pb-10">
            <div className="max-w-2xl">
              <div className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/90 ring-1 ring-white/20">
                {settings?.company_name ? `${settings.company_name}｜官网` : "可配置轮播 + 公告 + 富内容CMS"}
              </div>
              <h1 className="mt-4 text-3xl font-semibold text-white md:text-4xl">
                {active?.title || "让业务介绍与报价更清晰"}
              </h1>
              <p className="mt-3 text-base text-white/85 md:text-lg">
                支持栏目/项目管理、图文/视频详情编辑发布，右下角悬浮咨询入口帮助提升转化。
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to={active?.link_url || "/list/services"}
                  className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-100"
                >
                  立即查看
                </Link>
                <Link
                  to="/list/cases"
                  className="rounded-xl border border-white/30 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15"
                >
                  浏览案例
                </Link>
              </div>
              {carousel.length > 1 ? (
                <div className="mt-5 flex items-center gap-2">
                  {carousel.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setCarouselIndex(i)}
                      className={
                        i === carouselIndex
                          ? "h-2 w-6 rounded-full bg-white/90"
                          : "h-2 w-2 rounded-full bg-white/40 hover:bg-white/60"
                      }
                      aria-label={`切换到第 ${i + 1} 张`}
                    />
                  ))}
                </div>
              ) : null}
            </div>
          </Container>
        </div>
      </div>

      <Container className="py-10">
        {error ? (
          <section className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <div className="font-semibold">数据加载失败</div>
            <div className="mt-1">{error}</div>
            <div className="mt-2 text-xs text-amber-800">
              请在本地或 Cloudflare（Workers/Pages）环境变量中配置 `VITE_SUPABASE_URL` 与 `VITE_SUPABASE_ANON_KEY`。
            </div>
          </section>
        ) : null}

        <section className="rounded-2xl border border-zinc-200 bg-white p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-semibold text-zinc-900">公告栏</div>
              <div className="mt-1 text-sm text-zinc-600">支持后台编辑，首页跑马灯展示。</div>
            </div>
            {announcements[0] ? (
              <Link to={`/detail/${announcements[0].slug}`} className="text-sm font-medium text-blue-700 hover:underline">
                查看最新
              </Link>
            ) : null}
          </div>
          <div className="mt-4">
            {loading ? (
              <div className="h-10 animate-pulse rounded-2xl bg-zinc-100" />
            ) : (
              <MarqueeNotice
                enabled={!!settings?.notice_enabled}
                text={settings?.notice_text || (announcements[0]?.title || "")}
                speed={settings?.notice_speed ?? 60}
              />
            )}
          </div>
        </section>

        <section className="mt-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-zinc-900">精选栏目</h2>
              <div className="mt-1 text-sm text-zinc-600">栏目可在后台新增/排序/上下线。</div>
            </div>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {(homeCategories.length ? homeCategories : categories).slice(0, 6).map((c) => (
              <Link
                key={c.slug}
                to={`/list/${c.slug}`}
                className="group rounded-2xl border border-zinc-200 bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-zinc-900 group-hover:text-blue-700">{c.name}</div>
                  <div className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700">进入</div>
                </div>
                <div className="mt-2 text-sm text-zinc-600">查看该栏目下的项目列表、价格与详情。</div>
              </Link>
            ))}
          </div>
        </section>

        <section id="contact" className="mt-10 rounded-2xl border border-zinc-200 bg-white p-6">
          <h2 className="text-xl font-semibold text-zinc-900">联系我们</h2>
          <div className="mt-2 text-sm text-zinc-600">联系方式可在后台统一配置，全站同步展示。</div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-zinc-50 p-4">
              <div className="text-sm font-semibold text-zinc-900">电话</div>
              <div className="mt-2 text-sm text-zinc-600">{settings?.phone || "待配置"}</div>
            </div>
            <div className="rounded-2xl bg-zinc-50 p-4">
              <div className="text-sm font-semibold text-zinc-900">邮箱</div>
              <div className="mt-2 text-sm text-zinc-600">{settings?.email || "待配置"}</div>
            </div>
            <div className="rounded-2xl bg-zinc-50 p-4">
              <div className="text-sm font-semibold text-zinc-900">地址</div>
              <div className="mt-2 text-sm text-zinc-600">{settings?.address || "待配置"}</div>
            </div>
          </div>
        </section>
      </Container>
    </SiteShell>
  );
}

import { Link } from "react-router-dom";
import Container from "@/components/layout/Container";
import SiteShell from "@/components/layout/SiteShell";
import { useEffect, useMemo, useState, type ReactNode } from "react";
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

  const carouselIntervalMs = useMemo(() => {
    const raw = settings?.carousel_interval_ms ?? 4500;
    const clamped = Math.min(20000, Math.max(1500, raw));
    return clamped;
  }, [settings?.carousel_interval_ms]);

  useEffect(() => {
    if (!carousel.length) return;
    const t = window.setInterval(() => {
      setCarouselIndex((i) => (i + 1) % carousel.length);
    }, carouselIntervalMs);
    return () => window.clearInterval(t);
  }, [carousel.length, carouselIntervalMs]);

  const homeCategories = useMemo(() => categories.filter((c) => c.show_on_home), [categories]);

  const renderCarouselLink = (href: string, children: ReactNode) => {
    if (/^https?:\/\//i.test(href)) {
      return (
        <a href={href} target="_blank" rel="noreferrer" className="absolute inset-0" aria-label={active?.title || "轮播"}>
          {children}
        </a>
      );
    }
    return (
      <Link to={href} aria-label={active?.title || "轮播"} className="absolute inset-0">
        {children}
      </Link>
    );
  };

  return (
    <SiteShell>
      <div className="border-b border-zinc-200 bg-white">
        <div className="relative h-[360px] overflow-hidden md:h-[440px]">
          {active?.image_url ? (
            active.link_url ? (
              renderCarouselLink(
                active.link_url,
                <img src={active.image_url} alt={active.title} className="h-full w-full object-cover" />
              )
            ) : (
              <img src={active.image_url} alt={active.title} className="absolute inset-0 h-full w-full object-cover" />
            )
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-sky-500 to-zinc-900" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/70 via-zinc-950/20 to-zinc-950/10" />
          <Container className="relative flex h-full items-end pb-8">
            <div className="w-full">
              {active?.title ? (
                <div className="max-w-3xl">
                  <div className="inline-flex rounded-2xl bg-black/25 px-4 py-3 text-2xl font-semibold text-white backdrop-blur md:text-3xl">
                    {active.title}
                  </div>
                </div>
              ) : null}
              {carousel.length > 1 ? (
                <div className="mt-4 flex items-center gap-2">
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

      <div className="border-b border-zinc-200 bg-white">
        <Container className="py-2">
          {loading ? (
            <div className="h-8 animate-pulse rounded-2xl bg-zinc-100" />
          ) : (
            <MarqueeNotice
              variant="bar"
              enabled={!!settings?.notice_enabled}
              text={settings?.notice_text || (announcements[0]?.title || "")}
              speed={settings?.notice_speed ?? 60}
            />
          )}
        </Container>
      </div>

      <Container className="py-8">
        {error ? (
          <section className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <div className="font-semibold">数据加载失败</div>
            <div className="mt-1">{error}</div>
            <div className="mt-2 text-xs text-amber-800">
              请在本地或 Cloudflare（Workers/Pages）环境变量中配置 `VITE_SUPABASE_URL` 与 `VITE_SUPABASE_ANON_KEY`。
            </div>
          </section>
        ) : null}

        <section className="mt-5">
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {(homeCategories.length ? homeCategories : categories).slice(0, 6).map((c) => (
              <Link
                key={c.slug}
                to={`/list/${c.slug}`}
                className="group rounded-2xl border border-zinc-200 bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-zinc-900 group-hover:text-blue-700">{c.name}</div>
                </div>
                <div className="mt-2 text-sm text-zinc-600">查看项目列表与详情</div>
              </Link>
            ))}
          </div>
        </section>
      </Container>
    </SiteShell>
  );
}

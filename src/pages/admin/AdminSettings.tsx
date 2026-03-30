import { useCallback, useEffect, useState } from "react";
import AnnouncementsPanel from "@/components/admin/AnnouncementsPanel";
import CarouselPanel from "@/components/admin/CarouselPanel";
import SettingsPanel from "@/components/admin/SettingsPanel";
import { useAuthStore } from "@/stores/authStore";
import {
  adminCreateAnnouncement,
  adminCreateCarousel,
  adminDeleteCarousel,
  adminGetSettings,
  adminListAnnouncements,
  adminListCarousel,
  adminSaveSettings,
  adminUpdateAnnouncement,
  adminUpdateCarousel,
  type Announcement,
  type CarouselItem,
  type SiteSettings,
} from "@/utils/supabaseRest";
import type { RichDoc } from "@/utils/richContent";

type TabKey = "settings" | "carousel" | "announcements";

export default function AdminSettings() {
  const session = useAuthStore((s) => s.session);
  const token = session?.access_token || "";
  const [tab, setTab] = useState<TabKey>("settings");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [carousel, setCarousel] = useState<CarouselItem[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  const [newCarousel, setNewCarousel] = useState({
    title: "",
    image_url: "",
    link_url: "/",
    sort_order: 10,
    is_published: true,
  });

  const [newAnnouncementTitle, setNewAnnouncementTitle] = useState("");
  const [newAnnouncementSlug, setNewAnnouncementSlug] = useState("");
  const [newAnnouncementDoc, setNewAnnouncementDoc] = useState<RichDoc>({ blocks: [] });

  const reload = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [s, c, a] = await Promise.all([
        adminGetSettings(token),
        adminListCarousel(token),
        adminListAnnouncements(token),
      ]);
      setSettings(s);
      setCarousel(c);
      setAnnouncements(a);
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

  const saveSettings = async () => {
    if (!token || !settings) return;
    try {
      await adminSaveSettings(token, settings);
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "保存失败");
    }
  };

  const createCarousel = async () => {
    if (!token) return;
    if (!newCarousel.image_url) {
      setError("请填写轮播图片URL");
      return;
    }
    await adminCreateCarousel(token, newCarousel);
    setNewCarousel({ title: "", image_url: "", link_url: "/", sort_order: 10, is_published: true });
    await reload();
  };

  const updateCarouselRow = async (row: CarouselItem, patch: Partial<CarouselItem>) => {
    if (!token) return;
    await adminUpdateCarousel(token, row.id, patch);
    await reload();
  };

  const deleteCarouselRow = async (row: CarouselItem) => {
    if (!token) return
    const ok = window.confirm(`确认删除轮播：${row.title || row.id}？删除后不可恢复。`)
    if (!ok) return
    await adminDeleteCarousel(token, row.id)
    await reload()
  }

  const createAnnouncement = async () => {
    if (!token) return;
    if (!newAnnouncementTitle || !newAnnouncementSlug) {
      setError("请填写公告标题与slug");
      return;
    }
    await adminCreateAnnouncement(token, {
      title: newAnnouncementTitle,
      slug: newAnnouncementSlug,
      content_json: newAnnouncementDoc,
      content_html: "",
      is_published: true,
      published_at: new Date().toISOString(),
    });
    setNewAnnouncementTitle("");
    setNewAnnouncementSlug("");
    setNewAnnouncementDoc({ blocks: [] });
    await reload();
  };

  const toggleAnnouncement = async (a: Announcement) => {
    if (!token) return;
    await adminUpdateAnnouncement(token, a.id, {
      is_published: !a.is_published,
      published_at: !a.is_published ? new Date().toISOString() : null,
    });
    await reload();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">站点设置</h1>
          <div className="mt-1 text-sm text-zinc-600">管理轮播、公告、联系方式、客服入口等运营配置。</div>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">{error}</div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {(
          [
            { key: "settings" as const, label: "联系方式/客服" },
            { key: "carousel" as const, label: "首页轮播" },
            { key: "announcements" as const, label: "公告" },
          ]
        ).map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={
              tab === t.key
                ? "rounded-xl bg-zinc-900 px-3 py-2 text-sm font-semibold text-white"
                : "rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-800 hover:bg-zinc-50"
            }
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "settings" ? (
        <SettingsPanel
          loading={loading}
          settings={settings}
          onChange={(next) => setSettings(next)}
          onSave={() => void saveSettings()}
        />
      ) : null}

      {tab === "carousel" ? (
        <CarouselPanel
          loading={loading}
          carousel={carousel}
          newCarousel={newCarousel}
          accessToken={token}
          onChangeNew={setNewCarousel}
          onCreate={() => void createCarousel()}
          onUpdate={(row, patch) => void updateCarouselRow(row, patch)}
          onDelete={(row) => void deleteCarouselRow(row)}
        />
      ) : null}

      {tab === "announcements" ? (
        <AnnouncementsPanel
          loading={loading}
          announcements={announcements}
          title={newAnnouncementTitle}
          slug={newAnnouncementSlug}
          doc={newAnnouncementDoc}
          accessToken={token}
          onChangeTitle={setNewAnnouncementTitle}
          onChangeSlug={setNewAnnouncementSlug}
          onChangeDoc={setNewAnnouncementDoc}
          onCreate={() => void createAnnouncement()}
          onToggle={(a) => void toggleAnnouncement(a)}
        />
      ) : null}
    </div>
  );
}


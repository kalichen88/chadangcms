import { getRequiredEnv } from "@/utils/env";

export type AuthSession = {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: {
    id: string;
    email?: string;
  };
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  code_prefix: string;
  sort_order: number;
  is_published: boolean;
  show_on_home: boolean;
};

export type ContentItem = {
  id: string;
  type: string;
  code: string;
  title: string;
  slug: string;
  price_text: string;
  summary: string;
  cover_url: string;
  category_id: string;
  tags_csv: string;
  seo_title: string;
  seo_description: string;
  og_image_url: string;
  content_json: unknown;
  content_html: string;
  is_published: boolean;
  published_at: string | null;
  updated_at: string;
};

export type CarouselItem = {
  id: string;
  title: string;
  image_url: string;
  link_url: string;
  sort_order: number;
  is_published: boolean;
};

export type Announcement = {
  id: string;
  title: string;
  slug: string;
  content_json: unknown;
  content_html: string;
  is_published: boolean;
  published_at: string | null;
};

export type SiteSettings = {
  id: string;
  company_name: string;
  phone: string;
  email: string;
  address: string;
  work_time: string;
  cs_button_text: string;
  cs_popup_json: unknown;
  notice_enabled: boolean;
  notice_text: string;
  notice_speed: number;
};

function getBase() {
  const url = getRequiredEnv("VITE_SUPABASE_URL")
  const anon = getRequiredEnv("VITE_SUPABASE_ANON_KEY")
  return { url, anon }
}

async function requestJson<T>({
  method,
  url,
  headers,
  body,
}: {
  method: string
  url: string
  headers: Record<string, string>
  body?: unknown
}) {
  const res = await fetch(url, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(`Request failed: ${res.status} ${res.statusText} ${text}`)
  }

  const ct = res.headers.get("content-type") || ""
  if (ct.includes("application/json")) return (await res.json()) as T
  return (await res.text()) as T
}

export async function authPasswordSignIn(email: string, password: string) {
  const { url, anon } = getBase()
  const endpoint = `${url}/auth/v1/token?grant_type=password`
  return await requestJson<AuthSession>({
    method: "POST",
    url: endpoint,
    headers: {
      apikey: anon,
      "Content-Type": "application/json",
    },
    body: { email, password },
  })
}

export async function authRefreshSession(refreshToken: string) {
  const { url, anon } = getBase()
  const endpoint = `${url}/auth/v1/token?grant_type=refresh_token`
  return await requestJson<AuthSession>({
    method: "POST",
    url: endpoint,
    headers: {
      apikey: anon,
      "Content-Type": "application/json",
    },
    body: { refresh_token: refreshToken },
  })
}

export async function authGetUser(accessToken: string) {
  const { url, anon } = getBase()
  const endpoint = `${url}/auth/v1/user`
  return await requestJson<{ id: string; email?: string }>({
    method: "GET",
    url: endpoint,
    headers: {
      apikey: anon,
      Authorization: `Bearer ${accessToken}`,
    },
  })
}

export async function restSelect<T>(path: string, accessToken?: string) {
  const { url, anon } = getBase()
  return await requestJson<T>({
    method: "GET",
    url: `${url}/rest/v1/${path}`,
    headers: {
      apikey: anon,
      Authorization: accessToken ? `Bearer ${accessToken}` : `Bearer ${anon}`,
    },
  })
}

export async function restWrite<T>(
  method: "POST" | "PATCH" | "DELETE",
  path: string,
  body: unknown | undefined,
  accessToken: string
) {
  const { url, anon } = getBase()
  return await requestJson<T>({
    method,
    url: `${url}/rest/v1/${path}`,
    headers: {
      apikey: anon,
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: method === "DELETE" ? undefined : body,
  })
}

export async function adminDeleteContent(accessToken: string, id: string) {
  await restWrite<unknown>("DELETE", `content_items?id=eq.${encodeURIComponent(id)}`, undefined, accessToken)
}

export async function adminDeleteCarousel(accessToken: string, id: string) {
  await restWrite<unknown>("DELETE", `carousel_items?id=eq.${encodeURIComponent(id)}`, undefined, accessToken)
}

export async function getPublicHomeData() {
  const [settings, carousel, announcements, categories] = await Promise.all([
    restSelect<SiteSettings[]>("site_settings?select=*&limit=1"),
    restSelect<CarouselItem[]>("carousel_items?select=*&is_published=eq.true&order=sort_order.asc"),
    restSelect<Announcement[]>(
      "announcements?select=*&is_published=eq.true&order=published_at.desc&limit=8"
    ),
    restSelect<Category[]>("categories?select=*&is_published=eq.true&order=sort_order.asc"),
  ])

  return {
    settings: settings[0] || null,
    carousel,
    announcements,
    categories,
  }
}

export async function getPublicSettings() {
  const settings = await restSelect<SiteSettings[]>("site_settings?select=*&limit=1")
  return settings[0] || null
}

export async function getPublicListData(categorySlug: string) {
  const categories = await restSelect<Category[]>(
    `categories?select=*&is_published=eq.true&slug=eq.${encodeURIComponent(categorySlug)}&limit=1`
  )
  const category = categories[0] || null
  if (!category) return { category: null, items: [] as ContentItem[] }

  const items = await restSelect<ContentItem[]>(
    `content_items?select=*&is_published=eq.true&category_id=eq.${encodeURIComponent(category.id)}&order=published_at.desc.nullslast&limit=60`
  )

  return { category, items }
}

export async function getPublicDetailBySlug(contentSlug: string) {
  const items = await restSelect<ContentItem[]>(
    `content_items?select=*&is_published=eq.true&slug=eq.${encodeURIComponent(contentSlug)}&limit=1`
  )
  return items[0] || null
}

export async function getPublicAnnouncementBySlug(slug: string) {
  const items = await restSelect<Announcement[]>(
    `announcements?select=*&is_published=eq.true&slug=eq.${encodeURIComponent(slug)}&limit=1`
  )
  return items[0] || null
}

export async function adminListAllContent(accessToken: string) {
  return await restSelect<ContentItem[]>("content_items?select=*&order=updated_at.desc&limit=200", accessToken)
}

export async function adminListCategories(accessToken: string) {
  return await restSelect<Category[]>("categories?select=*&order=sort_order.asc&limit=200", accessToken)
}

export async function adminCreateCategory(
  accessToken: string,
  category: { name: string; slug: string; code_prefix: string; sort_order: number; is_published: boolean; show_on_home: boolean }
) {
  const payload = {
    ...category,
    updated_at: new Date().toISOString(),
  }
  return await restWrite<Category[]>("POST", "categories", [payload], accessToken)
}

export async function adminUpdateCategory(accessToken: string, id: string, patch: Partial<Category>) {
  const payload = {
    ...patch,
    updated_at: new Date().toISOString(),
  }
  return await restWrite<Category[]>(
    "PATCH",
    `categories?id=eq.${encodeURIComponent(id)}`,
    payload,
    accessToken
  )
}

export async function adminGetContentById(accessToken: string, id: string) {
  const items = await restSelect<ContentItem[]>(`content_items?select=*&id=eq.${encodeURIComponent(id)}&limit=1`, accessToken)
  return items[0] || null
}

export async function adminGenerateNextCode(accessToken: string, categoryId: string, codePrefix: string) {
  const rows = await restSelect<Pick<ContentItem, "code">[]>(
    `content_items?select=code&category_id=eq.${encodeURIComponent(categoryId)}&order=code.desc&limit=1`,
    accessToken
  )
  const latest = rows[0]?.code || ""
  const num = latest.startsWith(codePrefix) ? Number(latest.slice(codePrefix.length)) : 0
  const next = Number.isFinite(num) ? num + 1 : 1
  return `${codePrefix}${String(next).padStart(3, "0")}`
}

export type ContentWrite = {
  type: string
  title: string
  slug: string
  category_id: string
  code: string
  price_text: string
  summary: string
  cover_url: string
  tags_csv: string
  seo_title: string
  seo_description: string
  og_image_url: string
  content_json: unknown
  content_html: string
  is_published: boolean
  published_at: string | null
}

export async function adminCreateContent(accessToken: string, payload: ContentWrite) {
  const row = {
    ...payload,
    updated_at: new Date().toISOString(),
  }
  return await restWrite<ContentItem[]>("POST", "content_items", [row], accessToken)
}

export async function adminUpdateContent(accessToken: string, id: string, patch: Partial<ContentWrite>) {
  const payload = {
    ...patch,
    updated_at: new Date().toISOString(),
  }
  return await restWrite<ContentItem[]>("PATCH", `content_items?id=eq.${encodeURIComponent(id)}`, payload, accessToken)
}

export async function adminGetSettings(accessToken: string) {
  const list = await restSelect<SiteSettings[]>("site_settings?select=*&limit=1", accessToken)
  return list[0] || null
}

export async function adminSaveSettings(accessToken: string, settings: SiteSettings) {
  const payload = {
    company_name: settings.company_name,
    phone: settings.phone,
    email: settings.email,
    address: settings.address,
    work_time: settings.work_time,
    cs_button_text: settings.cs_button_text,
    cs_popup_json: settings.cs_popup_json || {},
    notice_enabled: settings.notice_enabled,
    notice_text: settings.notice_text,
    notice_speed: settings.notice_speed,
    updated_at: new Date().toISOString(),
  }

  return await restWrite<SiteSettings[]>("PATCH", `site_settings?id=eq.${encodeURIComponent(settings.id)}`, payload, accessToken)
}

export async function adminListCarousel(accessToken: string) {
  return await restSelect<CarouselItem[]>("carousel_items?select=*&order=sort_order.asc&limit=200", accessToken)
}

export async function adminCreateCarousel(
  accessToken: string,
  payload: { title: string; image_url: string; link_url: string; sort_order: number; is_published: boolean }
) {
  return await restWrite<CarouselItem[]>("POST", "carousel_items", [payload], accessToken)
}

export async function adminUpdateCarousel(accessToken: string, id: string, patch: Partial<CarouselItem>) {
  const payload = {
    ...patch,
    updated_at: new Date().toISOString(),
  }
  return await restWrite<CarouselItem[]>(
    "PATCH",
    `carousel_items?id=eq.${encodeURIComponent(id)}`,
    payload,
    accessToken
  )
}

export async function adminListAnnouncements(accessToken: string) {
  return await restSelect<Announcement[]>("announcements?select=*&order=updated_at.desc&limit=200", accessToken)
}

export async function adminCreateAnnouncement(
  accessToken: string,
  payload: { title: string; slug: string; content_json: unknown; content_html: string; is_published: boolean; published_at: string | null }
) {
  const row = {
    ...payload,
    updated_at: new Date().toISOString(),
  }
  return await restWrite<Announcement[]>("POST", "announcements", [row], accessToken)
}

export async function adminUpdateAnnouncement(accessToken: string, id: string, patch: Partial<Announcement>) {
  const payload = {
    ...patch,
    updated_at: new Date().toISOString(),
  }
  return await restWrite<Announcement[]>(
    "PATCH",
    `announcements?id=eq.${encodeURIComponent(id)}`,
    payload,
    accessToken
  )
}


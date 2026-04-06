import { useMemo, useState } from "react";
import { MessageCircle, Phone, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePublicSettings } from "@/hooks/usePublicSettings";

type SupportItem = {
  label: string;
  value: string;
};

function parseSupportItems(input: unknown): SupportItem[] {
  if (!input || typeof input !== "object") return [];
  const obj = input as { items?: unknown };
  const items = Array.isArray(obj.items) ? (obj.items as unknown[]) : [];
  const out: SupportItem[] = [];
  for (const it of items) {
    if (!it || typeof it !== "object") continue;
    const row = it as Record<string, unknown>;
    const label = typeof row.label === "string" ? row.label : "";
    const value = typeof row.value === "string" ? row.value : "";
    if (label && value) out.push({ label, value });
  }
  return out;
}

export default function FloatingSupport() {
  const [open, setOpen] = useState(false);
  const { settings } = usePublicSettings();

  const items = useMemo<SupportItem[]>(
    () => {
      const configured = parseSupportItems(settings?.cs_popup_json);
      if (configured.length) return configured;
      const out: SupportItem[] = [];
      if (settings?.phone) out.push({ label: "电话", value: settings.phone });
      if (settings?.email) out.push({ label: "邮箱", value: settings.email });
      return out;
    },
    [settings?.cs_popup_json, settings?.email, settings?.phone]
  );

  return (
    <div className="fixed bottom-5 right-5 z-50">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "group relative flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-sky-500 px-4 py-3 text-sm font-semibold text-white shadow-lg",
          "transition hover:shadow-xl",
          "before:absolute before:inset-0 before:rounded-full before:ring-4 before:ring-sky-300/30 before:content-[''] before:animate-pulse"
        )}
        aria-label={open ? "关闭在线咨询" : "打开在线咨询"}
      >
        <MessageCircle className="h-5 w-5" />
        <span className="hidden sm:inline">{settings?.cs_button_text || "在线咨询"}</span>
      </button>

      <div
        className={cn(
          "pointer-events-none absolute bottom-14 right-0 w-[320px] translate-y-2 opacity-0",
          "transition duration-200",
          open && "pointer-events-auto translate-y-0 opacity-100"
        )}
        role="dialog"
        aria-modal="true"
        aria-hidden={!open}
      >
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                <Phone className="h-4 w-4" />
              </div>
              <div>
                <div className="text-sm font-semibold text-zinc-900">联系咨询</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg p-2 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900"
              aria-label="关闭"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-3 p-4">
            {items.map((it) => (
              <div key={it.label} className="flex items-center justify-between rounded-xl bg-zinc-50 px-3 py-2">
                <div className="text-sm text-zinc-600">{it.label}</div>
                <div className="text-sm font-medium text-zinc-900">{it.value}</div>
              </div>
            ))}
            {!items.length ? <div className="text-sm text-zinc-600">请在后台配置咨询信息</div> : null}
          </div>
        </div>
      </div>
    </div>
  );
}


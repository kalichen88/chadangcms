import type { SiteSettings } from "@/utils/supabaseRest";

export default function SettingsPanel({
  loading,
  settings,
  onChange,
  onSave,
}: {
  loading: boolean
  settings: SiteSettings | null
  onChange: (next: SiteSettings) => void
  onSave: () => void
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section className="rounded-2xl border border-zinc-200 bg-white p-4">
        <div className="text-sm font-semibold text-zinc-900">联系方式</div>
        <div className="mt-4 grid gap-3">
          <input
            value={settings?.company_name || ""}
            onChange={(e) => settings && onChange({ ...settings, company_name: e.target.value })}
            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none ring-blue-600/20 focus:ring-4"
            placeholder="公司名称"
            disabled={!settings || loading}
          />
          <input
            value={settings?.phone || ""}
            onChange={(e) => settings && onChange({ ...settings, phone: e.target.value })}
            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none ring-blue-600/20 focus:ring-4"
            placeholder="电话"
            disabled={!settings || loading}
          />
          <input
            value={settings?.email || ""}
            onChange={(e) => settings && onChange({ ...settings, email: e.target.value })}
            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none ring-blue-600/20 focus:ring-4"
            placeholder="邮箱"
            disabled={!settings || loading}
          />
          <input
            value={settings?.address || ""}
            onChange={(e) => settings && onChange({ ...settings, address: e.target.value })}
            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none ring-blue-600/20 focus:ring-4"
            placeholder="地址"
            disabled={!settings || loading}
          />
          <input
            value={settings?.work_time || ""}
            onChange={(e) => settings && onChange({ ...settings, work_time: e.target.value })}
            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none ring-blue-600/20 focus:ring-4"
            placeholder="工作时间"
            disabled={!settings || loading}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-4">
        <div className="text-sm font-semibold text-zinc-900">客服入口</div>
        <div className="mt-4 space-y-3">
          <input
            value={settings?.cs_button_text || ""}
            onChange={(e) => settings && onChange({ ...settings, cs_button_text: e.target.value })}
            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none ring-blue-600/20 focus:ring-4"
            placeholder="按钮文案（如 在线咨询）"
            disabled={!settings || loading}
          />
          <textarea
            value={settings ? JSON.stringify(settings.cs_popup_json || {}, null, 2) : ""}
            onChange={(e) => {
              if (!settings) return
              try {
                const v = JSON.parse(e.target.value)
                onChange({ ...settings, cs_popup_json: v })
              } catch {
                onChange({ ...settings })
              }
            }}
            className="h-40 w-full resize-none rounded-xl border border-zinc-200 bg-white px-3 py-2 font-mono text-xs outline-none ring-blue-600/20 focus:ring-4"
            disabled={!settings || loading}
          />
          <div className="text-xs text-zinc-500">当前以 JSON 维护弹窗内容，后续可做可视化表单。</div>
          <button
            type="button"
            onClick={onSave}
            disabled={!settings || loading}
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            保存设置
          </button>
        </div>
      </section>
    </div>
  )
}


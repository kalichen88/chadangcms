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
        <div className="text-sm font-semibold text-zinc-900">公告栏（跑马灯）</div>
        <div className="mt-4 space-y-3">
          <label className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-3 py-2">
            <div className="text-sm font-semibold text-zinc-800">启用</div>
            <input
              type="checkbox"
              checked={!!settings?.notice_enabled}
              onChange={(e) => settings && onChange({ ...settings, notice_enabled: e.target.checked })}
              disabled={!settings || loading}
            />
          </label>
          <textarea
            value={settings?.notice_text || ""}
            onChange={(e) => settings && onChange({ ...settings, notice_text: e.target.value })}
            className="h-28 w-full resize-none rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none ring-blue-600/20 focus:ring-4"
            placeholder="输入公告滚动文字（建议一条长句）"
            disabled={!settings || loading}
          />
          <label className="block">
            <div className="text-xs font-semibold text-zinc-600">滚动速度（数值越大越快）</div>
            <input
              type="number"
              value={String(settings?.notice_speed ?? 60)}
              onChange={(e) => settings && onChange({ ...settings, notice_speed: Number(e.target.value) || 60 })}
              className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none ring-blue-600/20 focus:ring-4"
              disabled={!settings || loading}
              min={10}
              max={200}
            />
          </label>
          <button
            type="button"
            onClick={onSave}
            disabled={!settings || loading}
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            保存公告设置
          </button>
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


export async function loadRuntimeEnv() {
  const g = globalThis as unknown as { __APP_ENV?: Record<string, string | undefined> }
  if (g.__APP_ENV) return

  try {
    const resp = await fetch("/__env", { cache: "no-store" })
    if (!resp.ok) return
    const json = (await resp.json()) as unknown
    if (!json || typeof json !== "object") return
    g.__APP_ENV = json as Record<string, string | undefined>
  } catch {
    return
  }
}


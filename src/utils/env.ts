export function getRequiredEnv(name: string) {
  const buildTimeValue = (import.meta.env as unknown as Record<string, string | undefined>)[name]
  if (buildTimeValue) return buildTimeValue

  const runtimeEnv = (globalThis as unknown as { __APP_ENV?: Record<string, string | undefined> }).__APP_ENV
  const runtimeValue = runtimeEnv?.[name]
  if (runtimeValue) return runtimeValue

  throw new Error(
    `Missing env: ${name}. 请在本地 .env 或 Cloudflare（Workers/Pages）环境变量中配置。`
  )
}


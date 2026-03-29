export function getRequiredEnv(name: string) {
  const value = (import.meta.env as unknown as Record<string, string | undefined>)[name]
  if (!value) throw new Error(`Missing env: ${name}`)
  return value
}


export function slugify(input: string) {
  const trimmed = input.trim().toLowerCase()
  const replaced = trimmed
    .replace(/['"`]/g, "")
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
  return replaced || "item"
}


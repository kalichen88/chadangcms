import { getRequiredEnv } from "@/utils/env";

function getBase() {
  const url = getRequiredEnv("VITE_SUPABASE_URL");
  const anon = getRequiredEnv("VITE_SUPABASE_ANON_KEY");
  return { url, anon };
}

function sanitizeFileName(name: string) {
  const trimmed = name.trim();
  const replaced = trimmed.replace(/\s+/g, "-");
  return replaced.replace(/[^a-zA-Z0-9._-]+/g, "-");
}

function encodePath(path: string) {
  return path
    .split("/")
    .filter(Boolean)
    .map((seg) => encodeURIComponent(seg))
    .join("/");
}

function buildPath(prefix: string, fileName: string) {
  const now = new Date();
  const y = String(now.getUTCFullYear());
  const m = String(now.getUTCMonth() + 1).padStart(2, "0");
  const d = String(now.getUTCDate()).padStart(2, "0");
  const id = globalThis.crypto && "randomUUID" in globalThis.crypto ? globalThis.crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const safe = sanitizeFileName(fileName);
  return `${prefix}/${y}/${m}/${d}/${id}-${safe}`;
}

export async function uploadToPublicBucket({
  accessToken,
  bucket,
  folder,
  file,
}: {
  accessToken: string;
  bucket: string;
  folder: string;
  file: File;
}) {
  const { url, anon } = getBase();
  const path = buildPath(folder, file.name);
  const encoded = encodePath(path);
  const endpoint = `${url}/storage/v1/object/${encodeURIComponent(bucket)}/${encoded}`;

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      apikey: anon,
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": file.type || "application/octet-stream",
    },
    body: file,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Upload failed: ${res.status} ${res.statusText} ${text}`);
  }

  const publicUrl = `${url}/storage/v1/object/public/${encodeURIComponent(bucket)}/${encoded}`;
  return { path, publicUrl };
}


type Fetcher = {
  fetch: (request: Request) => Promise<Response>
}

type Env = {
  ASSETS: Fetcher
  VITE_SUPABASE_URL?: string
  VITE_SUPABASE_ANON_KEY?: string
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)

    if (url.pathname === "/__env") {
      return Response.json(
        {
          VITE_SUPABASE_URL: env.VITE_SUPABASE_URL,
          VITE_SUPABASE_ANON_KEY: env.VITE_SUPABASE_ANON_KEY,
        },
        {
          headers: {
            "Cache-Control": "no-store",
            "Content-Type": "application/json; charset=utf-8",
          },
        },
      )
    }

    const res = await env.ASSETS.fetch(request)
    const ct = res.headers.get("content-type") || ""
    if (!ct.includes("text/html")) return res

    const headers = new Headers(res.headers)
    headers.set("Cache-Control", "no-cache")
    return new Response(res.body, { status: res.status, statusText: res.statusText, headers })
  },
}


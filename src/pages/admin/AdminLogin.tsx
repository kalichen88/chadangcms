import { Link, useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useAuthStore } from "@/stores/authStore";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const disabled = useMemo(() => !email || !password, [email, password]);
  const signIn = useAuthStore((s) => s.signIn);
  const session = useAuthStore((s) => s.session);
  const loading = useAuthStore((s) => s.loading);
  const error = useAuthStore((s) => s.error);
  const initFromStorage = useAuthStore((s) => s.initFromStorage);

  useEffect(() => {
    void initFromStorage();
  }, [initFromStorage]);

  useEffect(() => {
    if (session) navigate("/admin/content", { replace: true });
  }, [navigate, session]);

  return (
    <div className="min-h-dvh bg-gradient-to-b from-white to-zinc-50">
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-4">
        <Link to="/" className="mb-8 text-sm font-medium text-zinc-600 hover:text-zinc-900">
          返回官网
        </Link>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <div className="text-base font-semibold text-zinc-900">CMS后台登录</div>
              <div className="text-sm text-zinc-600">使用邮箱账号登录进行内容管理</div>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <label className="block">
              <div className="text-sm font-medium text-zinc-700">邮箱</div>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none ring-blue-600/20 focus:ring-4"
                placeholder="name@company.com"
              />
            </label>

            <label className="block">
              <div className="text-sm font-medium text-zinc-700">密码</div>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none ring-blue-600/20 focus:ring-4"
                placeholder="******"
              />
            </label>

            <button
              type="button"
              disabled={disabled || loading}
              className="w-full rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() => void signIn(email, password)}
            >
              {loading ? "登录中…" : "登录"}
            </button>

            {error ? <div className="rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-900">{error}</div> : null}

            <div className="text-xs text-zinc-500">账号使用 Supabase Auth 邮箱登录。</div>
          </div>
        </div>
      </div>
    </div>
  );
}


import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { LayoutGrid, LogOut, Settings, SquarePen } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";

const nav = [
  { to: "/admin/content", label: "内容管理", icon: LayoutGrid },
  { to: "/admin/settings", label: "站点设置", icon: Settings },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const session = useAuthStore((s) => s.session);
  const initFromStorage = useAuthStore((s) => s.initFromStorage);
  const signOut = useAuthStore((s) => s.signOut);

  useEffect(() => {
    void initFromStorage();
  }, [initFromStorage]);

  useEffect(() => {
    if (!session) {
      navigate("/admin/login", { replace: true, state: { from: location.pathname } });
    }
  }, [location.pathname, navigate, session]);

  return (
    <div className="min-h-dvh bg-zinc-50 text-zinc-900">
      <div className="grid min-h-dvh grid-cols-1 md:grid-cols-[260px_1fr]">
        <aside className="border-b border-zinc-200 bg-white md:border-b-0 md:border-r">
          <div className="flex items-center justify-between px-4 py-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white">
                <SquarePen className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-semibold">CMS后台</div>
                <div className="text-xs text-zinc-500">内容与运营管理</div>
              </div>
            </Link>
            <button
              type="button"
              className="rounded-lg p-2 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900"
              aria-label="退出登录"
              onClick={() => {
                signOut();
                navigate("/admin/login", { replace: true });
              }}
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>

          <nav className="px-2 pb-4">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-zinc-700 transition hover:bg-zinc-100",
                    isActive && "bg-zinc-100 text-zinc-900"
                  )
                }
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}


import { Link, NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import Container from "@/components/layout/Container";
import type { ReactNode } from "react";
import { usePublicSettings } from "@/hooks/usePublicSettings";

const navItems = [
  { to: "/", label: "首页" },
  { to: "/list/services", label: "服务栏目" },
  { to: "/list/cases", label: "项目案例" },
];

export default function SiteHeader({ rightSlot }: { rightSlot?: ReactNode }) {
  const { settings } = usePublicSettings();

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/80 backdrop-blur">
      <Container className="flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-600 to-sky-400" />
          <div className="leading-tight">
            <div className="text-sm font-semibold text-zinc-900">{settings?.company_name || "官网"}</div>
            <div className="text-xs text-zinc-500">Official Site</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "rounded-lg px-3 py-2 text-sm text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900",
                  isActive && "bg-zinc-100 text-zinc-900"
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {settings?.phone ? <div className="hidden text-xs text-zinc-600 md:block">电话：{settings.phone}</div> : null}
          <Link
            to="/admin/login"
            className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-50"
          >
            CMS
          </Link>
          {rightSlot}
        </div>
      </Container>
    </header>
  );
}


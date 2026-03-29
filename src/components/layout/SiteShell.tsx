import FloatingSupport from "@/components/support/FloatingSupport";
import SiteFooter from "@/components/layout/SiteFooter";
import SiteHeader from "@/components/layout/SiteHeader";
import type { ReactNode } from "react";

export default function SiteShell({
  children,
  headerRight,
}: {
  children: ReactNode;
  headerRight?: ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-gradient-to-b from-white to-zinc-50 text-zinc-900">
      <SiteHeader rightSlot={headerRight} />
      <main className="min-h-[calc(100dvh-64px)]">{children}</main>
      <SiteFooter />
      <FloatingSupport />
    </div>
  );
}


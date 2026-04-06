import Container from "@/components/layout/Container";
import { usePublicSettings } from "@/hooks/usePublicSettings";

export default function SiteFooter() {
  const { settings } = usePublicSettings();

  return (
    <footer className="border-t border-zinc-200 bg-white">
      <Container className="py-10">
        <div className="grid gap-6 md:grid-cols-3">
          <div>
            <div className="text-sm font-semibold text-zinc-900">{settings?.company_name || "公司"}</div>
          </div>
          <div>
            <div className="text-sm font-semibold text-zinc-900">联系</div>
            <div className="mt-2 space-y-1 text-sm text-zinc-600">
              {settings?.phone ? <div>电话：{settings.phone}</div> : null}
              {settings?.email ? <div>邮箱：{settings.email}</div> : null}
              {settings?.address ? <div>地址：{settings.address}</div> : null}
            </div>
          </div>
          <div>
            <div className="text-sm font-semibold text-zinc-900">声明</div>
            <div className="mt-2 text-sm text-zinc-600">© {new Date().getFullYear()} All rights reserved.</div>
          </div>
        </div>
      </Container>
    </footer>
  );
}


import Container from "@/components/layout/Container";
import { usePublicSettings } from "@/hooks/usePublicSettings";

export default function SiteFooter() {
  const { settings } = usePublicSettings();

  return (
    <footer className="border-t border-zinc-200 bg-white">
      <Container className="py-10">
        <div className="grid gap-6 md:grid-cols-3">
          <div>
            <div className="text-sm font-semibold text-zinc-900">商务咨询公司</div>
            <div className="mt-2 text-sm text-zinc-600">提供可落地的咨询与解决方案，支持定制化服务。</div>
          </div>
          <div>
            <div className="text-sm font-semibold text-zinc-900">联系</div>
            <div className="mt-2 space-y-1 text-sm text-zinc-600">
              <div>电话：{settings?.phone || "待配置"}</div>
              <div>邮箱：{settings?.email || "待配置"}</div>
              <div>地址：{settings?.address || "待配置"}</div>
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


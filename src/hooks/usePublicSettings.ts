import { useEffect, useState } from "react";
import { getPublicSettings, type SiteSettings } from "@/utils/supabaseRest";

export function usePublicSettings() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void getPublicSettings()
      .then((d) => {
        if (cancelled) return;
        setSettings(d);
        setError(null);
        setLoading(false);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "加载失败");
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { settings, loading, error };
}


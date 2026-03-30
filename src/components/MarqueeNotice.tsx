import { useMemo } from "react";

export default function MarqueeNotice({
  enabled,
  text,
  speed,
}: {
  enabled: boolean;
  text: string;
  speed: number;
}) {
  const durationSeconds = useMemo(() => {
    const s = Number.isFinite(speed) ? speed : 60;
    const clamped = Math.min(200, Math.max(10, s));
    return Math.min(60, Math.max(8, Math.round(900 / clamped)));
  }, [speed]);

  if (!enabled) return null;
  if (!text.trim()) return null;

  return (
    <div className="marquee-shell" role="note" aria-label="公告">
      <div className="marquee-track" style={{ animationDuration: `${durationSeconds}s` }}>
        <span className="marquee-text">{text}</span>
        <span className="marquee-gap" aria-hidden="true" />
        <span className="marquee-text" aria-hidden="true">
          {text}
        </span>
      </div>
    </div>
  );
}


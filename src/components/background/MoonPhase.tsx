interface MoonPhaseProps {
  className?: string;
  size?: number;
}

/** 装饰性月相,带柔和光晕 */
export function MoonPhase({ className, size = 120 }: MoonPhaseProps) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute ${className ?? ""}`}
      style={{ width: size, height: size }}
    >
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "radial-gradient(circle at 38% 35%, #f7f1e7 0%, #e8ddc4 30%, #c9b98f 60%, #9a8c6a 100%)",
          boxShadow:
            "0 0 40px 8px rgba(242,218,156,0.18), 0 0 120px 30px rgba(242,218,156,0.08)",
          opacity: 0.85,
        }}
      />
      {/* 月面阴影,形成上弦月效果 */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "radial-gradient(circle at 72% 60%, rgba(7,8,18,0.55) 0%, rgba(7,8,18,0.35) 35%, transparent 62%)",
        }}
      />
    </div>
  );
}

interface NebulaGlowProps {
  className?: string;
}

/** 低对比度星云光斑,纯 CSS 渐变,无动画成本 */
export function NebulaGlow({ className }: NebulaGlowProps) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className ?? ""}`}
    >
      <div
        className="absolute -top-32 left-1/2 h-[60vh] w-[90vw] -translate-x-1/2 rounded-full opacity-60"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(117,98,168,0.22) 0%, rgba(117,98,168,0.08) 40%, transparent 70%)",
        }}
      />
      <div
        className="absolute top-1/3 -left-40 h-[50vh] w-[50vw] rounded-full opacity-50"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(90,127,168,0.14) 0%, transparent 65%)",
        }}
      />
      <div
        className="absolute -right-32 bottom-0 h-[45vh] w-[55vw] rounded-full opacity-50"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(215,180,106,0.10) 0%, transparent 65%)",
        }}
      />
    </div>
  );
}

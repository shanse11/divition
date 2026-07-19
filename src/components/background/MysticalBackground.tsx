import { StarField } from "./StarField";
import { NebulaGlow } from "./NebulaGlow";

interface MysticalBackgroundProps {
  /** 星星密度 */
  starCount?: number;
  /** 是否绘制低对比度星座连线 */
  constellations?: boolean;
}

/** 全站通用神秘背景:星点 + 星云 + 星座线 + 颗粒纹理 */
export function MysticalBackground({
  starCount = 90,
  constellations = true,
}: MysticalBackgroundProps) {
  return (
    <div className="grain pointer-events-none fixed inset-0 -z-10">
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, #070812 0%, #0a0c1a 45%, #0d0e20 100%)",
        }}
      />
      <NebulaGlow />
      <StarField count={starCount} />
      {constellations && (
        <svg
          aria-hidden
          className="absolute inset-0 h-full w-full opacity-[0.10]"
          viewBox="0 0 1440 900"
          preserveAspectRatio="xMidYMid slice"
          fill="none"
        >
          {/* 抽象星座连线 */}
          <g stroke="#d7b46a" strokeWidth="0.8">
            <path d="M120 140 L210 190 L300 150 L360 230 L470 210" />
            <path d="M1080 120 L1160 200 L1250 170 L1330 260" />
            <path d="M180 640 L280 700 L340 640 L450 720 L520 680" />
            <path d="M980 620 L1080 690 L1180 640 L1260 730" />
          </g>
          <g fill="#f2da9c">
            {[
              [120, 140],
              [210, 190],
              [300, 150],
              [360, 230],
              [470, 210],
              [1080, 120],
              [1160, 200],
              [1250, 170],
              [1330, 260],
              [180, 640],
              [280, 700],
              [340, 640],
              [450, 720],
              [520, 680],
              [980, 620],
              [1080, 690],
              [1180, 640],
              [1260, 730],
            ].map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r="2.4" />
            ))}
          </g>
        </svg>
      )}
    </div>
  );
}

import "./Mechanic.css";

/* Flat-fill palette — matches Visualizer.tsx (sprite-art look, no gradients). */
const STEEL = "#26241f";
const STEEL_DARK = "#1b1916";
const STEEL_HI = "#322f28";
const STEEL_HI_2 = "#46443a";
const GLASS = "#0c0c0c";
const AMBER = "var(--color-accent)";
const AMBER_DIM = "var(--color-accent-dim)";

/* Skin/beard tones break from the app's steel-and-amber palette on purpose —
   without them the face reads as more sprite than portrait. */
const SKIN = "#c98456";
const SKIN_SHADOW = "#8f5a35";
const EAR_SHADOW = "#6b4226";
const EAR_HI = "#a8704a";
const BEARD = "#2b211b";
const BEARD_MID = "#3a2c22";
const BEARD_HI = "#46362c";

export function Mechanic() {
  return (
    <div className="mechanic">
      <svg
        className="mechanic-svg"
        viewBox="0 0 72 96"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Mechanic"
      >
        <g shapeRendering="crispEdges">
          {/* cap crown */}
          <rect x={22} y={6} width={16} height={2} fill={STEEL_HI} />
          <rect x={18} y={8} width={24} height={2} fill={STEEL_HI} />
          <rect x={16} y={10} width={28} height={2} fill={STEEL_HI} />
          <rect x={14} y={12} width={32} height={2} fill={STEEL_HI} />
          <rect x={14} y={12} width={6} height={2} fill={STEEL_HI_2} />
          <rect x={12} y={14} width={36} height={4} fill={STEEL_HI} />
          <rect x={12} y={14} width={6} height={4} fill={STEEL_HI_2} />
          <rect x={10} y={18} width={40} height={14} fill={STEEL_HI} />
          <rect x={10} y={18} width={6} height={14} fill={STEEL_HI_2} />
          {/* cap band, dropped low to cover half the forehead */}
          <rect x={8} y={32} width={44} height={6} fill={AMBER} />
          {/* back of brim */}
          <rect x={4} y={34} width={8} height={4} fill={STEEL_DARK} />
          {/* brim, flat and angled up-right */}
          <rect x={40} y={30} width={12} height={4} fill={STEEL_DARK} />
          <rect x={48} y={24} width={16} height={4} fill={STEEL_DARK} stroke={AMBER_DIM} strokeWidth={1} />
          {/* forehead sliver, just above the eyebrows */}
          <rect x={14} y={38} width={32} height={2} fill={SKIN} />
          {/* face */}
          <rect x={12} y={40} width={36} height={2} fill={SKIN} />
          <rect x={10} y={42} width={40} height={2} fill={SKIN} />
          <rect x={8} y={44} width={44} height={4} fill={SKIN} />
          <rect x={6} y={48} width={48} height={2} fill={SKIN} />
          {/* amber rim-light along the far cheek */}
          <rect x={14} y={38} width={2} height={2} fill={AMBER_DIM} />
          <rect x={10} y={42} width={2} height={6} fill={AMBER_DIM} />
          <rect x={6} y={48} width={2} height={4} fill={AMBER_DIM} />
          {/* eyebrows, asymmetric for the 3/4 turn */}
          <rect x={16} y={40} width={8} height={2} fill={BEARD} />
          <rect x={32} y={40} width={14} height={2} fill={BEARD} />
          {/* eyes, far smaller / near bigger */}
          <rect x={18} y={43} width={4} height={3} fill={GLASS} />
          <rect x={34} y={42} width={7} height={4} fill={GLASS} />
          {/* beard, tapering to a rounded chin */}
          <rect x={6} y={50} width={48} height={16} fill={BEARD} />
          <rect x={8} y={66} width={44} height={4} fill={BEARD} />
          <rect x={10} y={70} width={40} height={2} fill={BEARD} />
          <rect x={12} y={72} width={36} height={2} fill={BEARD} />
          <rect x={14} y={74} width={32} height={2} fill={BEARD} />
          <rect x={16} y={76} width={28} height={2} fill={BEARD} />
          <rect x={20} y={78} width={20} height={2} fill={BEARD} />
          <rect x={24} y={80} width={12} height={2} fill={BEARD} />
          {/* mustache volume + mouth */}
          <rect x={22} y={51} width={16} height={3} fill={BEARD_HI} />
          <rect x={24} y={57} width={10} height={2} fill={GLASS} />
          {/* beard texture flecks */}
          <rect x={18} y={52} width={4} height={4} fill={BEARD_MID} />
          <rect x={40} y={54} width={4} height={4} fill={BEARD_HI} />
          <rect x={10} y={58} width={4} height={4} fill={BEARD_HI} />
          <rect x={44} y={58} width={4} height={4} fill={BEARD_MID} />
          <rect x={36} y={62} width={4} height={4} fill={BEARD_HI} />
          <rect x={14} y={66} width={4} height={4} fill={BEARD_MID} />
          {/* near ear */}
          <rect x={48} y={40} width={8} height={16} fill={EAR_SHADOW} />
          <rect x={50} y={44} width={4} height={8} fill={EAR_HI} />
          {/* nose, protrudes furthest right */}
          <rect x={52} y={44} width={8} height={6} fill={SKIN_SHADOW} />
          <rect x={54} y={50} width={8} height={6} fill={SKIN_SHADOW} />
          <rect x={52} y={56} width={5} height={3} fill={SKIN_SHADOW} />
          {/* neck + collar */}
          <rect x={22} y={82} width={16} height={4} fill={SKIN_SHADOW} />
          <rect x={18} y={86} width={24} height={6} fill={STEEL} stroke={AMBER_DIM} strokeWidth={1} />
        </g>
      </svg>
    </div>
  );
}

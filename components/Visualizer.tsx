import type { ReactElement } from "react";
import type { MachineSelection } from "../types/machine";
import type { Addon } from "../types/addon";
import "./Visualizer.css";

interface Props {
  selection: MachineSelection;
}

/* ------------------------------------------------------------------ *
 * Anchor system
 * ------------------------------------------------------------------ */

type Rect = { x: number; y: number; w: number; h: number };
type Edge = "top" | "bottom" | "left" | "right";

interface ChassisAnchors {
  wheelFront: { x: number; y: number }; // left wheel center (vehicles face left)
  wheelRear: { x: number; y: number }; // right wheel center
  wheelBase: number; // baseline tire radius for this frame
  engineBay: Rect; // where EngineLayer draws
  armorZone: Rect; // bounding box the armor plating covers
}

/* Body silhouette paths — shared by ChassisLayer (to draw) and the clipPath
   (so armor plating conforms to the body instead of floating beside it). */
const BODY_PATHS: Record<string, string> = {
  "racer-frame":
    "M36,118 L92,103 L118,85 L165,85 L196,103 L224,109 L224,122 L36,122 Z",
  "utility-frame": "M42,122 L42,84 L58,72 L206,72 L206,122 Z",
  "heavy-frame": "M30,118 L30,104 L50,92 L70,86 L200,86 L228,98 L228,118 Z",
};

const ANCHORS: Record<string, ChassisAnchors> = {
  "racer-frame": {
    wheelFront: { x: 70, y: 118 },
    wheelRear: { x: 190, y: 118 },
    wheelBase: 15,
    engineBay: { x: 46, y: 99, w: 44, h: 18 },
    armorZone: { x: 40, y: 101, w: 184, h: 20 },
  },
  "utility-frame": {
    wheelFront: { x: 72, y: 116 },
    wheelRear: { x: 188, y: 116 },
    wheelBase: 18,
    engineBay: { x: 46, y: 100, w: 40, h: 18 },
    armorZone: { x: 44, y: 92, w: 160, h: 28 },
  },
  "heavy-frame": {
    wheelFront: { x: 64, y: 112 },
    wheelRear: { x: 196, y: 112 },
    wheelBase: 22,
    engineBay: { x: 36, y: 95, w: 42, h: 18 },
    armorZone: { x: 32, y: 88, w: 196, h: 28 },
  },
};

/* Which side of the machine each add-on floats to. Add-ons are placed around
   the perimeter (never on the body) and evenly spaced along their edge, so
   icons never overlap the vehicle or each other. */
const ADDON_EDGE: Record<string, Edge> = {
  // top — weapons and roof sensors that point up / outward
  railgun: "top",
  "harpoon-launcher": "top",
  "short-range-radar": "top",
  "medium-range-radar": "top",
  "long-range-radar": "top",
  "targeting-computer": "top",
  // left — front-facing (vehicles face left)
  floodlights: "left",
  // bottom — chassis-mounted utility gear
  nos: "bottom",
  "welding-rig": "bottom",
  // right — rear-mounted
  "cargo-expansion": "right",
};

/* Perimeter layout: each edge is a line the icons distribute along, centered
   and spaced by EDGE_GAP. Horizontal edges vary x at a fixed y; vertical edges
   vary y at a fixed x. Bottom uses the clear gap between the front/rear wheels. */
const EDGE_GAP = 22;
const EDGES: Record<Edge, { axis: "h" | "v"; fixed: number; center: number }> =
  {
    top: { axis: "h", fixed: 14, center: 137 },
    bottom: { axis: "h", fixed: 149, center: 130 },
    left: { axis: "v", fixed: 14, center: 96 },
    right: { axis: "v", fixed: 246, center: 98 },
  };

/* Flat-fill palette (sprite-art look — no gradients). */
const STEEL = "#26241f";
const STEEL_DARK = "#1b1916";
const STEEL_HI = "#322f28";
const GLASS = "#0c0c0c";
const AMBER = "var(--color-accent)";
const AMBER_DIM = "var(--color-accent-dim)";
const GLOW = "var(--color-accent-glow)";

/* ------------------------------------------------------------------ *
 * Suspension layer (bottom) — wheels at the chassis anchors
 * ------------------------------------------------------------------ */

function Wheel({
  cx,
  cy,
  r,
  knobby,
}: {
  cx: number;
  cy: number;
  r: number;
  knobby?: boolean;
}) {
  const ticks = knobby ? 12 : 0;
  return (
    <g>
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill={STEEL_DARK}
        stroke={AMBER_DIM}
        strokeWidth={3}
      />
      <circle
        cx={cx}
        cy={cy}
        r={r * 0.42}
        fill={STEEL_HI}
        stroke={AMBER_DIM}
        strokeWidth={2}
      />
      <circle cx={cx} cy={cy} r={r * 0.12} fill={AMBER} />
      {Array.from({ length: ticks }).map((_, i) => {
        const a = (i / ticks) * Math.PI * 2;
        const x1 = cx + Math.cos(a) * (r - 1);
        const y1 = cy + Math.sin(a) * (r - 1);
        const x2 = cx + Math.cos(a) * (r - 4);
        const y2 = cy + Math.sin(a) * (r - 4);
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={STEEL}
            strokeWidth={2}
          />
        );
      })}
    </g>
  );
}

function SuspensionLayer({
  chassisId,
  suspensionId,
}: {
  chassisId: string;
  suspensionId: string | null;
}) {
  const a = ANCHORS[chassisId];
  const base = a.wheelBase;

  if (!suspensionId) {
    return (
      <g className="viz-layer" key="susp-empty">
        <circle
          className="viz-ghost"
          cx={a.wheelFront.x}
          cy={a.wheelFront.y}
          r={base}
          strokeWidth={2}
        />
        <circle
          className="viz-ghost"
          cx={a.wheelRear.x}
          cy={a.wheelRear.y}
          r={base}
          strokeWidth={2}
        />
      </g>
    );
  }

  // Tire radius + lift scale by suspension type.
  const cfg: Record<string, { scale: number; knobby: boolean; drop: number }> =
    {
      racing: { scale: 0.9, knobby: false, drop: 0 },
      "rock-crawler": { scale: 1.1, knobby: true, drop: 4 },
      monster: { scale: 1.35, knobby: true, drop: 8 },
    };
  const { scale, knobby, drop } = cfg[suspensionId] ?? cfg.racing;
  const r = base * scale;
  const fy = a.wheelFront.y + drop;
  const ry = a.wheelRear.y + drop;

  return (
    <g className="viz-layer" key={`susp-${suspensionId}`}>
      {/* Lift / axle link for raised setups */}
      {drop > 0 && (
        <>
          <line
            x1={a.wheelFront.x}
            y1={fy}
            x2={a.wheelRear.x}
            y2={ry}
            stroke={AMBER_DIM}
            strokeWidth={3}
          />
          <line
            x1={a.wheelFront.x}
            y1={fy}
            x2={a.wheelFront.x}
            y2={fy - drop - 4}
            stroke={AMBER_DIM}
            strokeWidth={3}
          />
          <line
            x1={a.wheelRear.x}
            y1={ry}
            x2={a.wheelRear.x}
            y2={ry - drop - 4}
            stroke={AMBER_DIM}
            strokeWidth={3}
          />
        </>
      )}
      <Wheel cx={a.wheelFront.x} cy={fy} r={r} knobby={knobby} />
      <Wheel cx={a.wheelRear.x} cy={ry} r={r} knobby={knobby} />
    </g>
  );
}

/* ------------------------------------------------------------------ *
 * Chassis layer — the body silhouette
 * ------------------------------------------------------------------ */

function ChassisLayer({ chassisId }: { chassisId: string }) {
  const d = BODY_PATHS[chassisId];
  return (
    <g className="viz-layer" key={`chassis-${chassisId}`}>
      <path
        d={d}
        fill={STEEL}
        stroke={AMBER_DIM}
        strokeWidth={3}
        strokeLinejoin="round"
      />
      {chassisId === "racer-frame" && (
        <>
          {/* cabin glass */}
          <path
            d="M122,88 L132,88 L122,99 L114,99 Z"
            fill={GLASS}
            stroke={AMBER_DIM}
            strokeWidth={1.5}
          />
          <path
            d="M138,88 L162,88 L160,99 L138,99 Z"
            fill={GLASS}
            stroke={AMBER_DIM}
            strokeWidth={1.5}
          />
        </>
      )}
      {chassisId === "utility-frame" && (
        <>
          {/* cab windows */}
          <rect
            x={50}
            y={78}
            width={42}
            height={16}
            fill={GLASS}
            stroke={AMBER_DIM}
            strokeWidth={1.5}
          />
          {/* cab / cargo divider */}
          <line
            x1={100}
            y1={72}
            x2={100}
            y2={122}
            stroke={AMBER_DIM}
            strokeWidth={2}
          />
          {/* cargo panel ribs */}
          <line
            x1={130}
            y1={80}
            x2={130}
            y2={118}
            stroke={AMBER_DIM}
            strokeWidth={1.5}
            opacity={0.6}
          />
          <line
            x1={160}
            y1={80}
            x2={160}
            y2={118}
            stroke={AMBER_DIM}
            strokeWidth={1.5}
            opacity={0.6}
          />
          <line
            x1={190}
            y1={80}
            x2={190}
            y2={118}
            stroke={AMBER_DIM}
            strokeWidth={1.5}
            opacity={0.6}
          />
        </>
      )}
      {chassisId === "heavy-frame" && (
        <>
          {/* low turret / cabin */}
          <path
            d="M118,86 L118,70 L132,64 L170,64 L176,86 Z"
            fill={STEEL_HI}
            stroke={AMBER_DIM}
            strokeWidth={2.5}
            strokeLinejoin="round"
          />
          <rect
            x={130}
            y={68}
            width={26}
            height={9}
            fill={GLASS}
            stroke={AMBER_DIM}
            strokeWidth={1.5}
          />
        </>
      )}
    </g>
  );
}

/* ------------------------------------------------------------------ *
 * Armor layer — plating clipped to the body so it sits ON the vehicle
 * ------------------------------------------------------------------ */

function ArmorLayer({
  chassisId,
  armorId,
}: {
  chassisId: string;
  armorId: string | null;
}) {
  const a = ANCHORS[chassisId];
  const z = a.armorZone;

  if (!armorId) {
    return (
      <g className="viz-layer" key="armor-empty">
        <rect
          className="viz-ghost"
          x={z.x}
          y={z.y}
          width={z.w}
          height={z.h}
          strokeWidth={2}
          rx={2}
        />
      </g>
    );
  }

  const clip = `url(#viz-clip-${chassisId})`;
  let plates: ReactElement;

  if (armorId === "scrap-metal") {
    // Irregular patchy plates + rivets.
    const segs = [
      { x: z.x, w: z.w * 0.26, dy: -2 },
      { x: z.x + z.w * 0.24, w: z.w * 0.3, dy: 1 },
      { x: z.x + z.w * 0.52, w: z.w * 0.26, dy: -1 },
      { x: z.x + z.w * 0.76, w: z.w * 0.26, dy: 2 },
    ];
    plates = (
      <g clipPath={clip}>
        {segs.map((s, i) => (
          <g key={i}>
            <rect
              x={s.x}
              y={z.y + s.dy}
              width={s.w + 2}
              height={z.h}
              fill={i % 2 ? "#403a30" : "#352f27"}
              stroke={AMBER_DIM}
              strokeWidth={1.5}
            />
            <circle cx={s.x + 4} cy={z.y + s.dy + 4} r={1.2} fill={AMBER_DIM} />
            <circle
              cx={s.x + s.w - 3}
              cy={z.y + s.dy + z.h - 4}
              r={1.2}
              fill={AMBER_DIM}
            />
          </g>
        ))}
      </g>
    );
  } else if (armorId === "composite") {
    // Smooth clean panels.
    plates = (
      <g clipPath={clip}>
        <rect x={z.x} y={z.y} width={z.w} height={z.h} fill="#23211d" />
        {[0.25, 0.5, 0.75].map((f, i) => (
          <line
            key={i}
            x1={z.x + z.w * f}
            y1={z.y}
            x2={z.x + z.w * f}
            y2={z.y + z.h}
            stroke={AMBER_DIM}
            strokeWidth={1.2}
          />
        ))}
      </g>
    );
  } else {
    // fortress — thick overlapping slabs.
    const fortressSlabs = [0, 1, 2, 3].map((i) => {
      const w = z.w * 0.32;
      const x = z.x + i * (z.w * 0.23);
      const y = z.y - 1;
      const h = z.h + 2;
      return { i, x, y, w, h };
    });
    const inset = 5;
    // Rivets sit on the visible panel between this slab's left edge and the
    // next slab's left edge (slabs overlap, so the next slab hides the rest
    // of this one) — the last slab has no overlap on its right, so it uses
    // its own right edge.
    const panelBounds = fortressSlabs.map(({ x, w, y, h }, idx) => ({
      left: x,
      right: idx < fortressSlabs.length - 1 ? fortressSlabs[idx + 1].x : x + w,
      y,
      h,
    }));
    plates = (
      <g clipPath={clip}>
        {fortressSlabs.map(({ i, x, y, w, h }) => (
          <rect
            key={i}
            x={x}
            y={y}
            width={w}
            height={h}
            fill={i % 2 ? "#3a352c" : "#2f2b23"}
            stroke={AMBER_DIM}
            strokeWidth={2.5}
            strokeLinejoin="round"
          />
        ))}
        {panelBounds.map(({ left, right, y, h }, i) => (
          <g key={i}>
            <circle
              cx={left + inset}
              cy={y + inset}
              r={1.2}
              fill={AMBER_DIM}
            />
            <circle
              cx={right - inset}
              cy={y + inset}
              r={1.2}
              fill={AMBER_DIM}
            />
            <circle
              cx={left + inset}
              cy={y + h - inset}
              r={1.2}
              fill={AMBER_DIM}
            />
            <circle
              cx={right - inset}
              cy={y + h - inset}
              r={1.2}
              fill={AMBER_DIM}
            />
          </g>
        ))}
      </g>
    );
  }

  return (
    <g className="viz-layer" key={`armor-${armorId}`}>
      {plates}
    </g>
  );
}

/* ------------------------------------------------------------------ *
 * Engine layer — drawn inside the engine bay
 * ------------------------------------------------------------------ */

function EngineLayer({
  chassisId,
  engineId,
}: {
  chassisId: string;
  engineId: string | null;
}) {
  const bay = ANCHORS[chassisId].engineBay;
  const cx = bay.x + bay.w / 2;
  const cy = bay.y + bay.h / 2;

  if (!engineId) {
    return (
      <g className="viz-layer" key="engine-empty">
        <rect
          className="viz-ghost"
          x={bay.x}
          y={bay.y}
          width={bay.w}
          height={bay.h}
          strokeWidth={2}
          rx={2}
        />
      </g>
    );
  }

  let glyph: ReactElement;
  if (engineId === "mazda-rotary") {
    glyph = (
      <g>
        <rect
          x={cx - 12}
          y={cy - 7}
          width={24}
          height={15}
          rx={2}
          fill={STEEL_HI}
          stroke={AMBER_DIM}
          strokeWidth={2}
        />
        {/* rotor */}
        <path
          d={`M${cx - 5},${cy - 4} Q${cx + 6},${cy} ${cx - 5},${cy + 4} Q${cx - 9},${cy} ${cx - 5},${cy - 4} Z`}
          fill={AMBER}
          opacity={0.85}
        />
        <circle cx={cx + 8} cy={cy - 3} r={2} fill={AMBER_DIM} />
      </g>
    );
  } else if (engineId === "turbo-diesel") {
    glyph = (
      <g>
        <rect
          x={cx - 15}
          y={cy - 6}
          width={30}
          height={16}
          rx={1.5}
          fill={STEEL_HI}
          stroke={AMBER_DIM}
          strokeWidth={2}
        />
        {/* ribs */}
        {[-9, -3, 3, 9].map((dx, i) => (
          <line
            key={i}
            x1={cx + dx}
            y1={cy - 5}
            x2={cx + dx}
            y2={cy + 9}
            stroke={AMBER_DIM}
            strokeWidth={1.5}
          />
        ))}
        {/* exhaust stack */}
        <rect
          x={cx + 8}
          y={cy - 18}
          width={6}
          height={14}
          fill={STEEL_DARK}
          stroke={AMBER_DIM}
          strokeWidth={2}
        />
        <ellipse
          cx={cx + 11}
          cy={cy - 18}
          rx={3.5}
          ry={1.5}
          fill={AMBER}
          opacity={0.7}
        />
      </g>
    );
  } else {
    // military-turbine — jet turbine cylinder
    glyph = (
      <g>
        <rect
          x={cx - 14}
          y={cy - 7}
          width={26}
          height={15}
          rx={7.5}
          fill={STEEL_HI}
          stroke={AMBER_DIM}
          strokeWidth={2}
        />
        {/* intake */}
        <circle
          cx={cx - 12}
          cy={cy + 0.5}
          r={7}
          fill={STEEL_DARK}
          stroke={AMBER_DIM}
          strokeWidth={2}
        />
        <circle
          cx={cx - 12}
          cy={cy + 0.5}
          r={3}
          fill={AMBER}
          opacity={0.85}
          style={{ filter: `drop-shadow(0 0 2px ${GLOW})` }}
        />
        {/* fins */}
        {[-3, 2, 7].map((dx, i) => (
          <line
            key={i}
            x1={cx + dx}
            y1={cy - 6}
            x2={cx + dx}
            y2={cy + 7}
            stroke={AMBER_DIM}
            strokeWidth={1.5}
          />
        ))}
      </g>
    );
  }

  return (
    <g className="viz-layer" key={`engine-${engineId}`}>
      {glyph}
    </g>
  );
}

/* ------------------------------------------------------------------ *
 * Add-on icons — ~20x20 glyphs drawn relative to a center point
 * ------------------------------------------------------------------ */

function IconChip({
  cx,
  cy,
  children,
}: {
  cx: number;
  cy: number;
  children: React.ReactNode;
}) {
  return (
    <g>
      <rect
        x={cx - 10}
        y={cy - 10}
        width={20}
        height={20}
        rx={3}
        fill="#14110a"
        stroke={AMBER_DIM}
        strokeWidth={1.5}
      />
      {children}
    </g>
  );
}

function radar(
  cx: number,
  cy: number,
  dishR: number,
  bars: number,
): ReactElement {
  return (
    <IconChip cx={cx} cy={cy}>
      <line
        x1={cx}
        y1={cy + 7}
        x2={cx}
        y2={cy}
        stroke={AMBER_DIM}
        strokeWidth={2}
      />
      <path
        d={`M${cx - dishR},${cy - 2} A${dishR},${dishR} 0 0 1 ${cx + dishR},${cy - 2} Z`}
        fill={STEEL_HI}
        stroke={AMBER}
        strokeWidth={1.5}
      />
      <line
        x1={cx}
        y1={cy - 2}
        x2={cx}
        y2={cy - dishR - 3}
        stroke={AMBER}
        strokeWidth={1.5}
      />
      {Array.from({ length: bars }).map((_, i) => (
        <line
          key={i}
          x1={cx - dishR + i * 3}
          y1={cy - 2}
          x2={cx - dishR + i * 3}
          y2={cy - dishR + 1}
          stroke={AMBER_DIM}
          strokeWidth={1}
        />
      ))}
    </IconChip>
  );
}

const ADDON_ICONS: Record<string, (cx: number, cy: number) => ReactElement> = {
  floodlights: (cx, cy) => (
    <IconChip cx={cx} cy={cy}>
      <circle
        cx={cx - 3}
        cy={cy}
        r={3}
        fill={AMBER}
        style={{ filter: `drop-shadow(0 0 2px ${GLOW})` }}
      />
      <circle
        cx={cx + 4}
        cy={cy}
        r={3}
        fill={AMBER}
        style={{ filter: `drop-shadow(0 0 2px ${GLOW})` }}
      />
      <path
        d={`M${cx - 6},${cy - 4} L${cx - 9},${cy - 6} M${cx - 6},${cy + 4} L${cx - 9},${cy + 6}`}
        stroke={AMBER}
        strokeWidth={1}
        opacity={0.7}
      />
    </IconChip>
  ),
  "short-range-radar": (cx, cy) => radar(cx, cy, 4, 0),
  "medium-range-radar": (cx, cy) => radar(cx, cy, 6, 0),
  "long-range-radar": (cx, cy) => radar(cx, cy, 7, 4),
  "welding-rig": (cx, cy) => (
    <IconChip cx={cx} cy={cy}>
      <line
        x1={cx - 7}
        y1={cy + 6}
        x2={cx + 1}
        y2={cy - 2}
        stroke={AMBER_DIM}
        strokeWidth={2.5}
      />
      <line
        x1={cx + 1}
        y1={cy - 2}
        x2={cx + 5}
        y2={cy - 5}
        stroke="#888"
        strokeWidth={2}
      />
      <circle
        cx={cx + 6}
        cy={cy - 6}
        r={2}
        fill={AMBER}
        style={{ filter: `drop-shadow(0 0 3px ${GLOW})` }}
      />
      <path
        d={`M${cx + 6},${cy - 9} L${cx + 7},${cy - 6} L${cx + 9},${cy - 6}`}
        stroke={AMBER}
        strokeWidth={1}
        fill="none"
      />
    </IconChip>
  ),
  nos: (cx, cy) => (
    <IconChip cx={cx} cy={cy}>
      <rect
        x={cx - 4}
        y={cy - 7}
        width={8}
        height={13}
        rx={3}
        fill={STEEL_HI}
        stroke={AMBER}
        strokeWidth={1.5}
      />
      <rect x={cx - 2} y={cy + 6} width={4} height={3} fill={AMBER_DIM} />
      <text
        x={cx}
        y={cy + 1}
        fontSize={5}
        fill={AMBER}
        textAnchor="middle"
        fontFamily="var(--font-body)"
      >
        N
      </text>
    </IconChip>
  ),
  "harpoon-launcher": (cx, cy) => (
    <IconChip cx={cx} cy={cy}>
      <rect
        x={cx - 8}
        y={cy - 2}
        width={12}
        height={4}
        fill={STEEL_HI}
        stroke={AMBER_DIM}
        strokeWidth={1.5}
      />
      <line
        x1={cx + 4}
        y1={cy}
        x2={cx + 9}
        y2={cy}
        stroke={AMBER}
        strokeWidth={2}
      />
      <path
        d={`M${cx + 9},${cy} L${cx + 6},${cy - 3} M${cx + 9},${cy} L${cx + 6},${cy + 3}`}
        stroke={AMBER}
        strokeWidth={1.5}
      />
    </IconChip>
  ),
  railgun: (cx, cy) => (
    <IconChip cx={cx} cy={cy}>
      <rect
        x={cx - 8}
        y={cy + 1}
        width={6}
        height={6}
        fill={STEEL_HI}
        stroke={AMBER_DIM}
        strokeWidth={1.5}
      />
      <line
        x1={cx - 6}
        y1={cy - 2}
        x2={cx + 9}
        y2={cy - 2}
        stroke={AMBER}
        strokeWidth={1.5}
      />
      <line
        x1={cx - 6}
        y1={cy + 1}
        x2={cx + 9}
        y2={cy + 1}
        stroke={AMBER}
        strokeWidth={1.5}
      />
      <circle
        cx={cx + 9}
        cy={cy - 0.5}
        r={1.6}
        fill={AMBER}
        style={{ filter: `drop-shadow(0 0 2px ${GLOW})` }}
      />
    </IconChip>
  ),
  "targeting-computer": (cx, cy) => (
    <IconChip cx={cx} cy={cy}>
      <rect
        x={cx - 8}
        y={cy - 5}
        width={16}
        height={10}
        rx={1.5}
        fill={STEEL_HI}
        stroke={AMBER_DIM}
        strokeWidth={1.5}
      />
      <circle
        cx={cx - 3}
        cy={cy}
        r={2.6}
        fill={GLASS}
        stroke={AMBER}
        strokeWidth={1.2}
      />
      <circle cx={cx + 4} cy={cy - 1} r={1.4} fill={AMBER} />
      <circle cx={cx + 4} cy={cy + 2.5} r={1} fill={AMBER_DIM} />
    </IconChip>
  ),
  "cargo-expansion": (cx, cy) => (
    <IconChip cx={cx} cy={cy}>
      <rect
        x={cx - 7}
        y={cy - 6}
        width={14}
        height={12}
        fill={STEEL_HI}
        stroke={AMBER_DIM}
        strokeWidth={1.5}
      />
      <path
        d={`M${cx - 7},${cy - 6} L${cx + 7},${cy + 6} M${cx + 7},${cy - 6} L${cx - 7},${cy + 6}`}
        stroke={AMBER_DIM}
        strokeWidth={1.2}
      />
    </IconChip>
  ),
};

function AddonLayer({ addons }: { addons: Addon[] }) {
  // Group add-ons by the machine edge they float to, then spread each group
  // evenly along its edge so no two icons overlap.
  const byEdge = new Map<Edge, Addon[]>();
  for (const addon of addons) {
    const edge = ADDON_EDGE[addon.id] ?? "top";
    const list = byEdge.get(edge) ?? [];
    list.push(addon);
    byEdge.set(edge, list);
  }

  const placed: { addon: Addon; x: number; y: number }[] = [];
  for (const [edge, list] of byEdge) {
    const spec = EDGES[edge];
    const start = spec.center - ((list.length - 1) * EDGE_GAP) / 2;
    list.forEach((addon, i) => {
      const along = start + i * EDGE_GAP;
      placed.push({
        addon,
        x: spec.axis === "h" ? along : spec.fixed,
        y: spec.axis === "h" ? spec.fixed : along,
      });
    });
  }

  return (
    <g
      className="viz-layer"
      key={`addons-${addons.map((x) => x.id).join("-") || "none"}`}
    >
      {placed.map(({ addon, x, y }) => {
        const draw = ADDON_ICONS[addon.id];
        return draw ? <g key={addon.id}>{draw(x, y)}</g> : null;
      })}
    </g>
  );
}

/* ------------------------------------------------------------------ *
 * Empty state — no chassis selected
 * ------------------------------------------------------------------ */

function EmptyState() {
  return (
    <g className="viz-layer" key="empty">
      <path
        className="viz-ghost"
        d="M66,118 L96,100 L122,92 L162,92 L188,100 L214,118 L214,124 L66,124 Z"
        strokeWidth={2}
      />
      <circle className="viz-ghost" cx={98} cy={124} r={13} strokeWidth={2} />
      <circle className="viz-ghost" cx={182} cy={124} r={13} strokeWidth={2} />
      <text
        className="viz-prompt"
        x={130}
        y={60}
        textAnchor="middle"
        fontSize={8}
        letterSpacing={1}
      >
        SELECT A CHASSIS
      </text>
      <text
        className="viz-prompt-sub"
        x={130}
        y={76}
        textAnchor="middle"
        fontSize={7}
      >
        to begin assembly
      </text>
    </g>
  );
}

/* ------------------------------------------------------------------ *
 * Main component
 * ------------------------------------------------------------------ */

export function Visualizer({ selection }: Props) {
  const { chassis, engine, suspension, armor, addons } = selection;
  const chassisId = chassis?.id ?? null;

  return (
    <div className="visualizer">
      <div className="visualizer-title">MACHINE</div>
      <svg
        className="viz-svg"
        viewBox="0 0 260 160"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Machine preview"
      >
        {/* backdrop */}
        <rect
          x={0}
          y={0}
          width={260}
          height={160}
          rx={4}
          fill="var(--color-bg-deep)"
        />
        <line
          x1={10}
          y1={135}
          x2={250}
          y2={135}
          stroke={AMBER_DIM}
          strokeWidth={1.5}
          opacity={0.5}
        />

        {chassisId && ANCHORS[chassisId] ? (
          <>
            <defs>
              <clipPath id={`viz-clip-${chassisId}`}>
                <path d={BODY_PATHS[chassisId]} />
              </clipPath>
            </defs>
            <SuspensionLayer
              chassisId={chassisId}
              suspensionId={suspension?.id ?? null}
            />
            <ChassisLayer chassisId={chassisId} />
            <ArmorLayer chassisId={chassisId} armorId={armor?.id ?? null} />
            <EngineLayer chassisId={chassisId} engineId={engine?.id ?? null} />
            <AddonLayer addons={addons} />
          </>
        ) : (
          <EmptyState />
        )}
      </svg>
    </div>
  );
}

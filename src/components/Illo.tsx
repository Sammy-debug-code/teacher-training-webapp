/**
 * Flat, brand-coloured illustrations for training cards.
 * Deliberately simple: round heads, rounded bodies, no faces that could read as a real person.
 * Palette: plum #331e4e, purple #6b498f, orchid #944cc4, marigold #fdba31, sunrise #e16a34,
 * cream #f3f0ea, mist #f0eaf7, gold #ebbb77.
 */

export type IlloName =
  | "staffroom"
  | "classroom-disturb"
  | "back-of-class"
  | "office-bench"
  | "crouch-desk"
  | "seats-empty"
  | "ladder"
  | "notebook"
  | "calendar"
  | "coins"
  | "map";

const P = "#331e4e", U = "#6b498f", O = "#944cc4", M = "#fdba31", S = "#e16a34", C = "#f3f0ea", L = "#f0eaf7", G = "#ebbb77", W = "#ffffff";

function Person({ x, y, h = 60, body = U, head = C, flip = false }: { x: number; y: number; h?: number; body?: string; head?: string; flip?: boolean }) {
  const r = h * 0.17;
  return (
    <g transform={`translate(${x} ${y}) ${flip ? "scale(-1 1)" : ""}`}>
      <circle cx={0} cy={-h + r} r={r} fill={head} />
      <rect x={-h * 0.22} y={-h + r * 2 + 2} width={h * 0.44} height={h * 0.62} rx={h * 0.12} fill={body} />
    </g>
  );
}

function Desk({ x, y, w = 56 }: { x: number; y: number; w?: number }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={8} rx={2} fill={P} />
      <rect x={x + 4} y={y + 8} width={4} height={18} fill={P} />
      <rect x={x + w - 8} y={y + 8} width={4} height={18} fill={P} />
    </g>
  );
}

function Frame({ children, bg = L }: { children: React.ReactNode; bg?: string }) {
  return (
    <svg viewBox="0 0 320 180" role="img" aria-hidden className="h-auto w-full rounded-lg" style={{ background: bg }}>
      {children}
    </svg>
  );
}

export default function Illo({ name }: { name: IlloName }) {
  switch (name) {
    case "staffroom":
      return (
        <Frame bg={C}>
          <rect x="0" y="130" width="320" height="50" fill={L} />
          <rect x="40" y="100" width="240" height="10" rx="3" fill={G} />
          <rect x="50" y="110" width="6" height="40" fill={G} />
          <rect x="264" y="110" width="6" height="40" fill={G} />
          <Person x={110} y={150} h={70} body={U} />
          <Person x={200} y={150} h={70} body={O} flip />
          <ellipse cx="155" cy="60" rx="40" ry="18" fill={W} />
          <path d="M140 76 l-8 12 l20 -10 z" fill={W} />
          <circle cx="142" cy="60" r="3" fill={P} /><circle cx="155" cy="60" r="3" fill={P} /><circle cx="168" cy="60" r="3" fill={P} />
        </Frame>
      );

    case "classroom-disturb":
      return (
        <Frame>
          <rect x="20" y="18" width="130" height="70" rx="4" fill={P} />
          <rect x="34" y="34" width="60" height="6" rx="2" fill={W} opacity=".9" />
          <rect x="34" y="48" width="40" height="6" rx="2" fill={W} opacity=".6" />
          <rect x="34" y="62" width="70" height="6" rx="2" fill={W} opacity=".6" />
          <Person x={190} y={95} h={78} body={U} />
          <Desk x={30} y={128} /> <Desk x={110} y={128} /> <Desk x={190} y={128} /> <Desk x={260} y={128} w={46} />
          <Person x={58} y={128} h={34} body={O} />
          <Person x={138} y={128} h={34} body={O} />
          <Person x={218} y={128} h={34} body={O} />
          {/* the child out of his seat */}
          <Person x={270} y={120} h={44} body={S} />
          <path d="M252 96 l10 -6 l-2 10" fill="none" stroke={S} strokeWidth="3" strokeLinecap="round" />
        </Frame>
      );

    case "back-of-class":
      return (
        <Frame>
          <rect x="20" y="18" width="110" height="60" rx="4" fill={P} />
          <Person x={70} y={150} h={70} body={U} />
          <Desk x={120} y={120} /> <Desk x={190} y={120} /> <Desk x={120} y={150} /> <Desk x={190} y={150} />
          <Person x={148} y={120} h={30} body={O} flip />
          <Person x={218} y={120} h={30} body={O} flip />
          <Person x={148} y={150} h={30} body={O} flip />
          {/* child standing at the back, arms up */}
          <Person x={285} y={125} h={52} body={S} />
          <path d="M270 92 l-10 -10 M300 92 l10 -10" stroke={S} strokeWidth="4" strokeLinecap="round" />
          <circle cx="258" cy="70" r="3" fill={M} /><circle cx="312" cy="66" r="3" fill={M} /><circle cx="285" cy="58" r="3" fill={M} />
        </Frame>
      );

    case "office-bench":
      return (
        <Frame bg={C}>
          <rect x="190" y="20" width="110" height="130" rx="4" fill={L} />
          <rect x="200" y="40" width="90" height="8" rx="2" fill={U} />
          <text x="245" y="84" textAnchor="middle" fontFamily="sans-serif" fontSize="12" fontWeight="700" fill={P}>OFFICE</text>
          <rect x="225" y="95" width="40" height="55" rx="2" fill={P} />
          <rect x="30" y="118" width="130" height="8" rx="2" fill={G} />
          <rect x="40" y="126" width="6" height="30" fill={G} /><rect x="144" y="126" width="6" height="30" fill={G} />
          <Person x={95} y={118} h={44} body={S} />
          <circle cx="60" cy="60" r="18" fill={W} />
          <path d="M60 48 v12 l8 5" fill="none" stroke={P} strokeWidth="3" strokeLinecap="round" />
        </Frame>
      );

    case "crouch-desk":
      return (
        <Frame>
          <Desk x={60} y={110} w={80} />
          <Desk x={180} y={110} w={80} />
          <rect x="72" y="100" width="40" height="10" rx="2" fill={W} />
          <Person x={100} y={110} h={40} body={S} />
          {/* teacher crouching: lower, closer */}
          <g transform="translate(160 118)">
            <circle cx="0" cy="-40" r="11" fill={C} />
            <rect x="-14" y="-28" width="28" height="30" rx="8" fill={U} />
          </g>
          <Person x={220} y={110} h={34} body={O} />
          <path d="M126 70 q14 -14 28 0" fill="none" stroke={U} strokeWidth="2" strokeDasharray="3 3" />
        </Frame>
      );

    case "seats-empty":
      return (
        <Frame>
          <rect x="20" y="18" width="110" height="60" rx="4" fill={P} />
          <Person x={70} y={150} h={70} body={U} flip />
          <Desk x={150} y={120} /> <Desk x={230} y={120} /> <Desk x={150} y={150} /> <Desk x={230} y={150} />
          <Person x={178} y={150} h={30} body={O} />
          <Person x={290} y={100} h={40} body={S} />
          <Person x={250} y={90} h={40} body={S} flip />
          <Person x={205} y={85} h={40} body={S} />
        </Frame>
      );

    case "ladder":
      return (
        <Frame>
          {[0, 1, 2, 3, 4].map((i) => (
            <g key={i}>
              <rect x={60 + i * 4} y={150 - i * 28} width={200 - i * 8} height="20" rx="6" fill={i === 1 ? U : W} stroke={i === 1 ? U : P} strokeWidth="2" />
              <text x={160} y={164 - i * 28} textAnchor="middle" fontFamily="sans-serif" fontSize="11" fontWeight="700" fill={i === 1 ? W : P}>{i + 1}</text>
            </g>
          ))}
          <Person x={30} y={170} h={46} body={U} />
        </Frame>
      );

    case "notebook":
      return (
        <Frame bg={C}>
          <rect x="95" y="25" width="130" height="130" rx="6" fill={W} stroke={P} strokeWidth="2" />
          <rect x="95" y="25" width="14" height="130" rx="6" fill={U} />
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x="122" y={50 + i * 22} width={i === 3 ? 40 : 80} height="6" rx="3" fill={i === 3 ? M : L} />
          ))}
          <rect x="200" y="100" width="8" height="60" rx="3" transform="rotate(30 204 130)" fill={S} />
        </Frame>
      );

    case "calendar":
      return (
        <Frame>
          <rect x="60" y="30" width="200" height="120" rx="6" fill={W} stroke={P} strokeWidth="2" />
          <rect x="60" y="30" width="200" height="24" rx="6" fill={P} />
          {Array.from({ length: 8 }).map((_, i) => {
            const col = i % 4, row = Math.floor(i / 4);
            return (
              <g key={i}>
                <rect x={74 + col * 46} y={66 + row * 40} width="34" height="28" rx="4" fill={i < 3 ? M : L} />
                <text x={91 + col * 46} y={85 + row * 40} textAnchor="middle" fontFamily="sans-serif" fontSize="11" fontWeight="700" fill={P}>{i + 1}</text>
              </g>
            );
          })}
        </Frame>
      );

    case "coins":
      return (
        <Frame bg={C}>
          {[0, 1, 2, 3, 4].map((i) => (
            <ellipse key={i} cx={130} cy={140 - i * 12} rx="48" ry="14" fill={M} stroke={S} strokeWidth="2" />
          ))}
          <ellipse cx="130" cy="92" rx="48" ry="14" fill={M} stroke={S} strokeWidth="2" />
          <circle cx="230" cy="70" r="26" fill={S} />
          <path d="M224 56 q6 -6 12 0 q6 6 0 12 l-6 6 l-6 -6 q-6 -6 0 -12z" fill={W} />
          <path d="M226 95 l8 20 M230 95 l12 18" stroke={S} strokeWidth="3" strokeLinecap="round" />
        </Frame>
      );

    case "map":
      return (
        <Frame>
          <path d="M30 140 C 90 60, 150 170, 210 90 S 290 50, 300 40" fill="none" stroke={U} strokeWidth="4" strokeDasharray="8 8" strokeLinecap="round" />
          <circle cx="30" cy="140" r="10" fill={S} />
          <circle cx="300" cy="40" r="12" fill={M} stroke={P} strokeWidth="2" />
          <Person x={60} y={150} h={46} body={U} />
        </Frame>
      );
  }
}

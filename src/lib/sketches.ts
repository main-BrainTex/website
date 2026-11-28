// Schemi illustrativi del glossario, disegnati dal codice: difetti del tessuto e macchine.
// Sono SVG senza testo (salvo i numeri delle legende), uguali per tutte le lingue.

const BG = '#0b2235';
const WARP = '#eef3f6';
const WEFT = '#b9cad6';
const DIM = '#8fa7b8';

type Stroke = { d: string[]; color: string; width: number; cap?: 'round' | 'butt'; opacity?: number };

class Canvas {
  private layers = new Map<string, Stroke>();
  private order: string[] = [];
  extra: string[] = [];

  line(points: [number, number][], color: string, width: number, cap: 'round' | 'butt' = 'butt', opacity = 1) {
    const key = `${color}|${width}|${cap}|${opacity}`;
    if (!this.layers.has(key)) {
      this.layers.set(key, { d: [], color, width, cap, opacity });
      this.order.push(key);
    }
    const [first, ...rest] = points.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`);
    this.layers.get(key)!.d.push(`M${first}${rest.map((p) => `L${p}`).join('')}`);
  }

  /** Chiude il livello corrente: le linee aggiunte dopo stanno sopra. */
  flush() {
    for (const key of this.order) {
      const s = this.layers.get(key)!;
      const op = s.opacity !== 1 ? ` stroke-opacity="${s.opacity}"` : '';
      this.extra.push(
        `<path d="${s.d.join('')}" fill="none" stroke="${s.color}" stroke-width="${s.width}" stroke-linecap="${s.cap}"${op}/>`,
      );
    }
    this.layers.clear();
    this.order = [];
  }

  svg(w: number, h: number, defs = '') {
    this.flush();
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${defs}<rect width="${w}" height="${h}" fill="${BG}"/>${this.extra.join('')}</svg>`;
  }
}

// ---- Tela (tessuto a navetta) ------------------------------------------------------------

const W = 240;
const H = 160;
const P = 12;
const T = 9;

interface Weft {
  y: (x: number) => number;
  h: number;
  color: string;
  x0?: number;
  x1?: number;
}
interface Warp {
  x: (y: number) => number;
  w: number;
  color: string;
  idx: number;
}

interface WeaveOptions {
  wefts?: Weft[];
  warps?: Warp[];
  /** Incrocio in cui il filo di ordito resta sotto (per i flottanti). */
  under?: (i: number, j: number) => boolean;
  after?: (c: Canvas) => void;
  defs?: string;
}

const baseWefts = (): Weft[] =>
  Array.from({ length: Math.ceil(H / P) + 1 }, (_, j) => ({ y: () => j * P + P / 2, h: T, color: WEFT }));
const baseWarps = (): Warp[] =>
  Array.from({ length: W / P }, (_, i) => ({ x: () => i * P + P / 2, w: T, color: WARP, idx: i }));

function weave(o: WeaveOptions = {}) {
  const c = new Canvas();
  const wefts = o.wefts ?? baseWefts();
  const warps = o.warps ?? baseWarps();
  const samples = (a: number, b: number, step = 5) =>
    Array.from({ length: Math.floor((b - a) / step) + 1 }, (_, k) => a + k * step);

  for (const wp of warps) c.line(samples(-5, H + 5).map((y) => [wp.x(y), y]), wp.color, wp.w);
  c.flush();
  for (const wf of wefts) c.line(samples(wf.x0 ?? -5, wf.x1 ?? W + 5).map((x) => [x, wf.y(x)]), wf.color, wf.h);
  c.flush();
  wefts.forEach((wf, j) => {
    for (const wp of warps) {
      if ((wp.idx + j) % 2 !== 0 || o.under?.(wp.idx, j)) continue;
      const y = wf.y(wp.x(wf.y(0)));
      const x = wp.x(y);
      if (x < (wf.x0 ?? -10) || x > (wf.x1 ?? W + 10)) continue;
      c.line([[x, y - wf.h / 2 - 0.5], [x, y + wf.h / 2 + 0.5]], wp.color, wp.w);
    }
  });
  c.flush();
  o.after?.(c);
  return c.svg(W, H, o.defs);
}

// ---- Maglia -----------------------------------------------------------------------------

const KW = 16;
const KH = 12;

function knit(o: { color?: (col: number, row: number) => string | null; after?: (c: Canvas) => void } = {}) {
  const c = new Canvas();
  for (let row = -1; row <= H / KH + 1; row++) {
    for (let col = 0; col < W / KW; col++) {
      const color = o.color ? o.color(col, row) : WARP;
      if (!color) continue;
      const x = col * KW + KW / 2;
      const y = row * KH;
      c.line([[x - 5.5, y - 1], [x, y + KH + 1]], color, 7.5, 'round');
      c.line([[x + 5.5, y - 1], [x, y + KH + 1]], color === WARP ? WEFT : color, 7.5, 'round');
    }
  }
  c.flush();
  o.after?.(c);
  return c.svg(W, H);
}

// ---- Difetti ----------------------------------------------------------------------------

const pick = 7;
const end = 10;

export const DEFECT_SKETCHES: Record<string, () => string> = {
  'trama-mancante': () => weave({ wefts: baseWefts().map((w, j) => (j === pick ? { ...w, color: BG, h: 0.1 } : w)) }),

  'doppia-trama': () =>
    weave({
      wefts: baseWefts().map((w, j) => (j === pick ? { ...w, h: 11.5, color: '#93aabb' } : w)),
      under: (_, j) => j === pick,
    }),

  'filo-mancante': () => weave({ warps: baseWarps().filter((w) => w.idx !== end) }),

  'filo-tirato': () =>
    weave({
      warps: baseWarps().map((w) => {
        const d = w.idx - end;
        if (d === 0) return { ...w, w: 5, color: '#f4f7f9' };
        if (Math.abs(d) > 3) return w;
        const pull = (4 - Math.abs(d)) * 1.6 * -Math.sign(d);
        return { ...w, x: (y: number) => w.x(y) + pull * Math.exp(-(((y - 80) / 38) ** 2)) };
      }),
    }),

  nodo: () =>
    weave({
      after: (c) => {
        c.extra.push(
          `<path d="M134 86q10-7 16 2M118 94q-10 7-16-2" fill="none" stroke="#f4f7f9" stroke-width="3.5" stroke-linecap="round"/>`,
          `<ellipse cx="126" cy="90" rx="11" ry="9" fill="#f4f7f9" stroke="${DIM}" stroke-width="2"/>`,
        );
      },
    }),

  grossi: () =>
    weave({
      wefts: baseWefts().flatMap((w, j) =>
        j === 5
          ? [
              { ...w, x1: 60 },
              { ...w, x0: 60, x1: 130, h: 13, color: '#dfe8ee' },
              { ...w, x0: 130, x1: 190, h: 4 },
              { ...w, x0: 190 },
            ]
          : [w],
      ),
    }),

  barratura: () =>
    weave({ wefts: baseWefts().map((w, j) => (j >= 5 && j <= 8 ? { ...w, color: '#8aa3b5' } : w)) }),

  fermata: () => {
    const ys = [6, 18, 30, 42, 54, 66, 74, 80, 86, 104, 116, 128, 140, 152, 164];
    return weave({ wefts: ys.map((y) => ({ y: () => y, h: T, color: WEFT })) });
  },

  'fitto-rado': () => {
    const ys = [6, 18, 30, 42, 60, 78, 96, 114, 126, 138, 150, 162];
    return weave({ wefts: ys.map((y) => ({ y: () => y, h: T, color: WEFT })) });
  },

  flottante: () =>
    weave({
      under: (i, j) => j === pick && i >= 5 && i <= 14,
      after: (c) => {
        c.line([[64, 92], [176, 92]], '#000000', 9, 'round', 0.3);
        c.line([[64, 90], [176, 90]], '#f6f9fb', 9, 'round');
      },
    }),

  cimosa: () =>
    weave({
      after: (c) => {
        const pts: string[] = [];
        for (let y = -5; y <= H + 5; y += 5) pts.push(`${(214 + 7 * Math.sin(y / 11)).toFixed(1)} ${y}`);
        c.extra.push(`<path d="M${pts.join('L')}L${W + 5} ${H + 5}L${W + 5} -5Z" fill="${BG}"/>`);
      },
    }),

  'riga-ago': () => knit({ color: (col) => (col === 7 ? '#8fa7b8' : WARP) }),

  smagliatura: () =>
    knit({
      color: (col, row) => (col === 7 && row >= 3 ? null : WARP),
      after: (c) => {
        for (let y = 3 * KH + 4; y < H; y += KH) c.line([[7 * KW + 1, y], [8 * KW - 1, y]], WEFT, 2.5, 'round');
      },
    }),

  buco: () =>
    knit({
      color: (col, row) => (((col * KW + KW / 2 - 120) / 30) ** 2 + ((row * KH + 6 - 80) / 24) ** 2 < 1 ? null : WARP),
      after: (c) => {
        c.line([[94, 66], [100, 72]], WEFT, 2.5, 'round');
        c.line([[146, 92], [140, 87]], WEFT, 2.5, 'round');
        c.line([[118, 58], [121, 65]], WEFT, 2.5, 'round');
      },
    }),

  macchia: () =>
    weave({
      after: (c) => {
        c.extra.push(
          '<path d="M98 58c14-12 38-8 46 6 9 14 2 22 10 32 6 10-6 22-22 18-12-3-18 6-30-2-12-8-8-20-14-28-6-12 0-20 10-26z" fill="#a36f2e" fill-opacity="0.5"/>',
        );
      },
    }),

  'differenza-tinta': () =>
    weave({
      defs: '<defs><linearGradient id="g" x1="0" x2="1"><stop offset="0" stop-color="#1f4d6e" stop-opacity="0.55"/><stop offset="0.6" stop-color="#1f4d6e" stop-opacity="0"/></linearGradient></defs>',
      after: (c) => c.extra.push(`<rect width="${W}" height="${H}" fill="url(#g)"/>`),
    }),

  piega: () =>
    weave({
      after: (c) => {
        c.line([[20, 158], [222, 4]], '#000000', 6, 'butt', 0.3);
        c.line([[24, 160], [226, 6]], '#ffffff', 2.5, 'butt', 0.55);
      },
    }),

  'trama-storta': () =>
    weave({
      wefts: baseWefts().map((w, j) => ({ ...w, y: (x: number) => j * P + P / 2 + 12 * Math.sin((Math.PI * x) / W) - 6 })),
    }),
};

// ---- Macchine ---------------------------------------------------------------------------

const MW = 480;
const MH = 240;
const LINE = '#8fb3c9';
const FABRIC = '#e6edf2';
const ACCENT = '#35d2f3';

const badge = (n: number, x: number, y: number) =>
  `<circle cx="${x}" cy="${y}" r="11" fill="${ACCENT}"/><text x="${x}" y="${y + 4.5}" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="700" fill="#00213a">${n}</text>`;

const machine = (body: string, badges: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${MW} ${MH}" width="${MW}" height="${MH}"><rect width="${MW}" height="${MH}" fill="${BG}"/><g fill="none" stroke="${LINE}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${body}</g>${badges}</svg>`;

export const MACHINE_SKETCHES: Record<string, () => string> = {
  // Telaio visto di lato: subbio d'ordito, licci, inserzione della trama, pettine, tessuto.
  telaio: () =>
    machine(
      [
        '<circle cx="55" cy="160" r="32"/><circle cx="55" cy="160" r="9"/>',
        '<circle cx="115" cy="92" r="8"/>',
        `<path d="M55 128L115 84" stroke="${FABRIC}" stroke-width="1.5"/>`,
        `<path d="M115 84L200 66L300 96M115 84L200 118L300 96" stroke="${FABRIC}" stroke-width="1.5"/>`,
        '<rect x="188" y="40" width="10" height="100" rx="2"/><rect x="204" y="40" width="10" height="100" rx="2"/>',
        '<path d="M188 66h10M204 118h10"/>',
        '<ellipse cx="245" cy="96" rx="16" ry="6" fill="#57f0fe" fill-opacity="0.25" stroke="#57f0fe"/>',
        '<rect x="268" y="56" width="9" height="80" rx="2"/><path d="M268 66h9M268 76h9M268 86h9M268 96h9M268 106h9M268 116h9M268 126h9"/>',
        `<path d="M300 96L370 96" stroke="${FABRIC}" stroke-width="5"/>`,
        '<rect x="362" y="88" width="16" height="16" rx="3"/>',
        `<path d="M378 98L412 158" stroke="${FABRIC}" stroke-width="5"/>`,
        '<circle cx="415" cy="185" r="28"/><circle cx="415" cy="185" r="8"/>',
        '<path d="M20 225H460"/>',
      ].join(''),
        badge(1, 55, 108) +
        badge(2, 201, 26) +
        badge(3, 245, 124) +
        badge(4, 272, 40) +
        badge(5, 440, 140),
    ),

  // Macchina circolare per maglieria vista di fronte.
  maglieria: () =>
    machine(
      [
        '<path d="M140 52L152 18L164 52ZM228 52L240 18L252 52ZM316 52L328 18L340 52Z"/>',
        `<path d="M152 52L190 86M240 52L240 86M328 52L290 86" stroke="${FABRIC}" stroke-width="1.5"/>`,
        '<ellipse cx="240" cy="88" rx="110" ry="12"/>',
        '<rect x="182" y="82" width="10" height="8" rx="1"/><rect x="235" y="94" width="10" height="8" rx="1"/><rect x="288" y="82" width="10" height="8" rx="1"/>',
        '<rect x="160" y="104" width="160" height="40" rx="4"/>',
        '<path d="M172 108v32M184 108v32M196 108v32M208 108v32M220 108v32M232 108v32M244 108v32M256 108v32M268 108v32M280 108v32M292 108v32M304 108v32"/>',
        `<path d="M168 144L196 196H284L312 144" stroke="${FABRIC}" stroke-width="3" fill="${FABRIC}" fill-opacity="0.12"/>`,
        '<circle cx="222" cy="204" r="9"/><circle cx="258" cy="204" r="9"/>',
        '<ellipse cx="240" cy="226" rx="50" ry="9"/>',
      ].join(''),
        badge(1, 112, 34) +
        badge(2, 372, 88) +
        badge(3, 342, 124) +
        badge(4, 330, 172) +
        badge(5, 312, 222),
    ),

  // Linea di tintoria e finissaggio: vasca, spremitura, rameuse, avvolgimento.
  finissaggio: () =>
    machine(
      [
        '<path d="M20 120V200H140V120"/>',
        '<path d="M24 150q10-6 20 0t20 0t20 0t20 0t20 0t12 0" stroke="#57f0fe" stroke-opacity="0.6"/>',
        '<circle cx="40" cy="110" r="7"/><circle cx="80" cy="110" r="7"/><circle cx="120" cy="110" r="7"/><circle cx="60" cy="185" r="7"/><circle cx="100" cy="185" r="7"/>',
        `<path d="M10 110H33M40 117L60 178M67 185L80 117M87 110L100 178M107 185L120 117M127 110L163 110" stroke="${FABRIC}" stroke-width="3"/>`,
        '<circle cx="170" cy="100" r="10"/><circle cx="170" cy="121" r="10"/>',
        `<path d="M180 110H210" stroke="${FABRIC}" stroke-width="3"/>`,
        '<rect x="210" y="62" width="190" height="100" rx="6"/>',
        `<path d="M210 112H400" stroke="${FABRIC}" stroke-width="3"/>`,
        '<path d="M214 104H396M214 120H396" stroke-dasharray="2 6"/>',
        '<path d="M240 72q6 8 0 16t0 16M290 72q6 8 0 16t0 16M340 72q6 8 0 16t0 16" stroke="#f0a35e"/>',
        '<path d="M240 152q6-8 0-16M290 152q6-8 0-16M340 152q6-8 0-16" stroke="#f0a35e"/>',
        `<path d="M400 112L430 140" stroke="${FABRIC}" stroke-width="3"/>`,
        '<circle cx="440" cy="168" r="26"/><circle cx="440" cy="168" r="7"/>',
        '<path d="M10 215H470"/>',
      ].join(''),
        badge(1, 80, 222 - 12) +
        badge(2, 170, 74) +
        badge(3, 305, 46) +
        badge(4, 440, 122),
    ),

  // Specola: rotolo in entrata, piano luminoso inclinato, operatore, rotolo in uscita.
  specola: () =>
    machine(
      [
        '<path d="M150 205L300 70" stroke="#57f0fe" stroke-width="14" stroke-opacity="0.25"/>',
        '<path d="M150 205L300 70"/>',
        `<path d="M265 210L162 200M156 196L300 66L312 60L392 166" stroke="${FABRIC}" stroke-width="3"/>`,
        '<circle cx="290" cy="208" r="20"/><circle cx="290" cy="208" r="6"/>',
        '<circle cx="312" cy="58" r="8"/>',
        '<circle cx="405" cy="186" r="26"/><circle cx="405" cy="186" r="7"/>',
        '<path d="M200 22h50l-8 12h-34z" stroke="#f0d35e"/><path d="M225 34v14" stroke="#f0d35e" stroke-dasharray="3 4"/>',
        '<circle cx="70" cy="80" r="14"/><path d="M70 94V160M70 160L56 222M70 160L84 222M70 112L118 132M70 112L112 104"/>',
        '<path d="M20 228H470"/>',
      ].join(''),
        badge(1, 290, 168) +
        badge(2, 214, 112) +
        badge(3, 40, 60) +
        badge(4, 440, 140),
    ),
};

export const SKETCH_NAMES = [
  ...Object.keys(DEFECT_SKETCHES).map((id) => `difetto-${id}`),
  ...Object.keys(MACHINE_SKETCHES).map((id) => `macchina-${id}`),
];

export function sketchSvg(name: string): string {
  if (name.startsWith('difetto-')) return DEFECT_SKETCHES[name.slice(8)]();
  return MACHINE_SKETCHES[name.slice(9)]();
}

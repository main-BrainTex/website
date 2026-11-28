// Vista 3D della fabbrica (caricata solo su richiesta): un capannone intero generato dal codice,
// con macchine, operatori stilizzati, reparti, sala dati e, a valle, il confezionista.
// Stessa pianta della mappa 2D (x → asse x, y → asse z), ingrandita di un fattore S.
// Tutto l'hardware è stilizzato e generico: nessun dettaglio tecnico reale.
import {
  BoxGeometry,
  BufferGeometry,
  CanvasTexture,
  CircleGeometry,
  Color,
  ConeGeometry,
  CylinderGeometry,
  DirectionalLight,
  DoubleSide,
  Float32BufferAttribute,
  Fog,
  Group,
  HemisphereLight,
  Line,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  type Object3D,
  PerspectiveCamera,
  PlaneGeometry,
  QuadraticBezierCurve3,
  RepeatWrapping,
  RingGeometry,
  Scene,
  SphereGeometry,
  SRGBColorSpace,
  Vector3,
  WebGLRenderer,
} from 'three';
import { NODES, type FactoryEvent, type NodeKey } from '../../data/factory';
import type { Mode } from './engine';
import type { SceneView } from './ui';

const S = 2; // scala: la pianta 100 × 60 diventa un capannone di 200 × 120 unità
const C = {
  ground: 0x00121f,
  floor: 0x06304f,
  room: 0x0a3a5e,
  wall: 0x0b4068,
  machine: 0x1b5f8c,
  machineDark: 0x0d4268,
  metal: 0x9fc4d8,
  fabric: 0x2a86b3,
  cloth: 0xd7ecf5,
  suit: 0xf2f8fb,
  unit: 0x57f0fe,
  good: 0x9ced40,
  bad: 0xff9d9d,
  grass: 0x0c4a3c,
  tree: 0x2f8f3a,
  water: 0x35d2f3,
  murky: 0x4a5f6e,
};

/** Centro di ogni zona nella scena (il confezionista è un edificio a parte, più a destra). */
const centre = (key: NodeKey) => {
  const n = NODES.find((x) => x.key === key)!;
  return key === 'confezionista' ? new Vector3(188, 0, n.y * S) : new Vector3(n.x * S, 0, n.y * S);
};

function canvasTexture(w: number, h: number, draw: (g: CanvasRenderingContext2D) => void) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  draw(c.getContext('2d')!);
  const tex = new CanvasTexture(c);
  tex.colorSpace = SRGBColorSpace;
  return tex;
}

function weaveTexture(repeat: number) {
  const tex = canvasTexture(64, 64, (g) => {
    g.fillStyle = '#2a86b3';
    g.fillRect(0, 0, 64, 64);
    g.fillStyle = 'rgba(215,236,245,0.35)';
    for (let i = 0; i < 64; i += 8) g.fillRect(i, 0, 2, 64);
    g.fillStyle = 'rgba(0,53,93,0.45)';
    for (let i = 0; i < 64; i += 8) g.fillRect(0, i, 64, 3);
  });
  tex.wrapS = tex.wrapT = RepeatWrapping;
  tex.repeat.set(repeat, 1);
  return tex;
}

/** Schermo della sala dati: un cruscotto di fantasia, senza numeri. */
function dashboardTexture() {
  return canvasTexture(512, 192, (g) => {
    g.fillStyle = '#00172a';
    g.fillRect(0, 0, 512, 192);
    g.fillStyle = '#06304f';
    for (const x of [12, 180, 348]) g.fillRect(x, 12, 152, 168);
    g.strokeStyle = '#57f0fe';
    g.lineWidth = 4;
    g.beginPath();
    [150, 140, 146, 120, 110, 116, 84, 70, 52].forEach((y, i) => g[i ? 'lineTo' : 'moveTo'](24 + i * 16, y));
    g.stroke();
    g.fillStyle = '#57f0fe';
    [60, 44, 70, 130, 52].forEach((v, i) => g.fillRect(196 + i * 26, 166 - v, 16, v));
    for (let r = 0; r < 4; r++)
      for (let col = 0; col < 4; col++) {
        g.globalAlpha = r === 2 && col === 3 ? 1 : 0.15 + ((r * 3 + col * 5) % 5) * 0.1;
        g.fillRect(362 + col * 32, 28 + r * 36, 26, 30);
      }
    g.globalAlpha = 1;
    g.fillStyle = '#9ced40';
    for (const x of [12, 180, 348]) g.fillRect(x, 12, 152, 5);
  });
}

/** Tavolo di taglio del confezionista: senza mappa i difetti finiscono nei capi, con la mappa il piazzamento li evita. */
function cuttingTexture(withMap: boolean) {
  return canvasTexture(512, 192, (g) => {
    g.fillStyle = '#d7ecf5';
    g.fillRect(0, 0, 512, 192);
    const defects = [
      [96, 60],
      [250, 130],
      [330, 48],
      [440, 120],
    ];
    const pieces = withMap
      ? [[14, 80, 120, 100], [120, 14, 110, 90], [150, 112, 80, 70], [270, 14, 46, 90], [360, 14, 130, 80], [270, 112, 150, 70]]
      : [[14, 14, 130, 90], [160, 14, 120, 90], [300, 14, 100, 80], [14, 112, 150, 70], [180, 112, 130, 70], [330, 104, 160, 78]];
    g.lineWidth = 4;
    for (const [x, y, w, h] of pieces) {
      const hit = defects.some(([dx, dy]) => dx > x && dx < x + w && dy > y && dy < y + h);
      g.strokeStyle = hit ? '#d6455b' : '#1373a8';
      g.fillStyle = hit ? 'rgba(214,69,91,0.18)' : 'rgba(19,115,168,0.14)';
      g.beginPath();
      g.roundRect(x, y, w, h, 14);
      g.fill();
      g.stroke();
    }
    for (const [x, y] of defects) {
      g.fillStyle = '#00355d';
      g.beginPath();
      g.arc(x, y, 6, 0, 7);
      g.fill();
      if (withMap) {
        g.strokeStyle = '#30a016';
        g.beginPath();
        g.arc(x, y, 13, 0, 7);
        g.stroke();
      }
    }
  });
}

interface Mover {
  g: Object3D;
  path?: Vector3[];
  speed: number;
  phase: number;
  turn: number;
  bob: number;
}

export function createScene(container: HTMLElement, lang: 'it' | 'en'): SceneView {
  const renderer = new WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.append(renderer.domElement);

  const scene = new Scene();
  scene.fog = new Fog(C.ground, 230, 520);
  const camera = new PerspectiveCamera(38, 5 / 3, 1, 900);
  scene.add(new HemisphereLight(0xdff4ff, 0x001626, 1.6));
  const sun = new DirectionalLight(0xffffff, 1.5);
  sun.position.set(60, 140, 120);
  scene.add(sun);

  // ---- Mattoncini: geometrie unitarie condivise e materiali riusati ------------------------
  const unitBox = new BoxGeometry(1, 1, 1);
  const unitCyl = new CylinderGeometry(1, 1, 1, 20);
  const unitSphere = new SphereGeometry(1, 16, 12);
  const unitCone = new ConeGeometry(1, 1, 10);
  const mats = new Map<string, MeshStandardMaterial>();
  const mat = (color: number, glow = 0) => {
    const key = `${color}-${glow}`;
    if (!mats.has(key))
      mats.set(key, new MeshStandardMaterial({ color, roughness: 0.85, emissive: color, emissiveIntensity: glow }));
    return mats.get(key)!;
  };
  /** Parallelepipedo appoggiato alla quota y. */
  const box = (parent: Object3D, w: number, h: number, d: number, x: number, y: number, z: number, m = mat(C.machine)) => {
    const mesh = new Mesh(unitBox, m);
    mesh.scale.set(w, h, d);
    mesh.position.set(x, y + h / 2, z);
    parent.add(mesh);
    return mesh;
  };
  /** Cilindro centrato in (x, y, z), disteso lungo l'asse indicato. */
  const cyl = (parent: Object3D, r: number, len: number, x: number, y: number, z: number, m = mat(C.metal), axis: 'x' | 'y' | 'z' = 'y') => {
    const mesh = new Mesh(unitCyl, m);
    mesh.scale.set(r, len, r);
    if (axis === 'x') mesh.rotation.z = Math.PI / 2;
    if (axis === 'z') mesh.rotation.x = Math.PI / 2;
    mesh.position.set(x, y, z);
    parent.add(mesh);
    return mesh;
  };
  const ball = (parent: Object3D, r: number, x: number, y: number, z: number, m: MeshStandardMaterial) => {
    const mesh = new Mesh(unitSphere, m);
    mesh.scale.setScalar(r);
    mesh.position.set(x, y, z);
    parent.add(mesh);
    return mesh;
  };
  const flat = (parent: Object3D, w: number, d: number, x: number, y: number, z: number, m: MeshStandardMaterial | MeshBasicMaterial) => {
    const mesh = new Mesh(new PlaneGeometry(w, d), m);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(x, y, z);
    parent.add(mesh);
    return mesh;
  };
  const group = (x: number, z: number, parent: Object3D = scene) => {
    const g = new Group();
    g.position.set(x, 0, z);
    parent.add(g);
    return g;
  };

  const withOnly: Object3D[] = []; // ciò che compare solo "con BrainTex"
  const withoutOnly: Object3D[] = [];
  const movers: Mover[] = [];
  const fabricTex = weaveTexture(6);
  const loomTex = weaveTexture(1);
  const fabricMat = new MeshStandardMaterial({ map: fabricTex, roughness: 0.9 });
  const loomMat = new MeshStandardMaterial({ map: loomTex, roughness: 0.9 });
  const beam = new MeshBasicMaterial({ color: C.unit, transparent: true, opacity: 0.2, side: DoubleSide, depthWrite: false });
  const glowUnit = mat(C.unit, 0.9);
  const lampMat = mat(C.good, 1);

  /** Unità di ispezione stilizzata: una barra luminosa sopra il tessuto, con la sua lama di luce e una lampada. */
  const inspectionUnit = (parent: Object3D, width: number, x: number, y: number, z: number, drop: number) => {
    const g = new Group();
    g.position.set(x, 0, z);
    box(g, width, 0.35, 0.45, 0, y, 0, glowUnit);
    box(g, 0.25, y, 0.25, -width / 2, 0, 0, glowUnit);
    box(g, 0.25, y, 0.25, width / 2, 0, 0, glowUnit);
    const sheet = new Mesh(new PlaneGeometry(width - 0.4, drop), beam);
    sheet.position.set(0, y - drop / 2, 0);
    g.add(sheet);
    box(g, 0.12, 1.4, 0.12, width / 2, y, 0, mat(C.metal));
    ball(g, 0.32, width / 2, y + 1.55, 0, lampMat);
    parent.add(g);
    withOnly.push(g);
    return g;
  };

  // ---- Persone stilizzate ------------------------------------------------------------------
  const suit = mat(C.suit, 0.12);
  const person = (x: number, z: number, turn = 0, path?: Vector3[]) => {
    const g = group(x, z);
    cyl(g, 0.5, 1.9, 0, 1.25, 0, suit);
    ball(g, 0.46, 0, 2.75, 0, suit);
    for (const side of [-1, 1]) {
      const arm = box(g, 0.2, 1.1, 0.2, side * 0.62, 1.2, 0.3, suit);
      arm.rotation.x = -0.9;
    }
    g.rotation.y = turn;
    movers.push({ g, path, speed: 0.05 + Math.random() * 0.03, phase: Math.random() * 6, turn, bob: 1 });
    return g;
  };
  const v3 = (x: number, z: number) => new Vector3(x, 0, z);

  // ---- Terreno, capannone, strada ----------------------------------------------------------
  flat(scene, 700, 500, 100, -0.05, 60, mat(C.ground));
  flat(scene, 166, 96, 85, 0, 52, mat(C.floor));
  // Corsie segnate a terra
  const lanes: number[] = [];
  for (const z of [36, 58, 92]) lanes.push(4, 0.03, z, 166, 0.03, z);
  for (const x of [44, 84, 124]) lanes.push(x, 0.03, 36, x, 0.03, 100);
  const laneGeo = new BufferGeometry();
  laneGeo.setAttribute('position', new Float32BufferAttribute(lanes, 3));
  scene.add(new LineSegments(laneGeo, new LineBasicMaterial({ color: C.unit, transparent: true, opacity: 0.22 })));

  // Parete di fondo con finestre, pilastri e capriate del tetto (solo linee, per non coprire l'interno)
  box(scene, 166, 11, 0.6, 85, 0, 4, mat(C.wall));
  box(scene, 0.6, 11, 96, 2, 0, 52, mat(C.wall));
  for (let x = 12; x < 166; x += 14) box(scene, 8, 1.6, 0.2, x, 8, 4.4, mat(C.cloth, 0.35));
  const truss: number[] = [];
  for (let x = 2; x <= 168; x += 20.75) {
    truss.push(x, 11, 4, x, 19, 52, x, 19, 52, x, 11, 100, x, 11, 4, x, 11, 100);
    truss.push(x, 11, 28, x, 15, 28, x, 11, 76, x, 15, 76, x, 19, 52, x, 11, 52);
    box(scene, 0.5, 11, 0.5, x, 0, 100, mat(C.wall));
  }
  truss.push(2, 19, 52, 168, 19, 52, 2, 11, 100, 168, 11, 100);
  const trussGeo = new BufferGeometry();
  trussGeo.setAttribute('position', new Float32BufferAttribute(truss, 3));
  scene.add(new LineSegments(trussGeo, new LineBasicMaterial({ color: 0x5fa8c9, transparent: true, opacity: 0.4 })));

  // Rotoli di tessuto a terra, per dare l'idea del materiale che gira in reparto
  const rolls = (x: number, z: number, n: number, m = mat(C.fabric)) => {
    for (let i = 0; i < n; i++) cyl(scene, 0.8, 3.2, x + (i % 3) * 1.8, 0.8 + Math.floor(i / 3) * 1.5, z, m, 'z');
  };

  // ---- Tessitura: una sala telai ------------------------------------------------------------
  const loom = (x: number, z: number) => {
    const g = group(x, z);
    box(g, 7, 2.4, 3.6, 0, 0, 0, mat(C.machine));
    box(g, 0.5, 4.2, 4.2, -3.7, 0, 0, mat(C.machineDark));
    box(g, 0.5, 4.2, 4.2, 3.7, 0, 0, mat(C.machineDark));
    box(g, 7.6, 0.4, 0.7, 0, 4.2, -0.4, mat(C.machineDark));
    cyl(g, 1.05, 6.6, 0, 2.7, -2.3, mat(C.cloth), 'x');
    cyl(g, 0.8, 6.6, 0, 1.2, 2.4, mat(C.fabric), 'x');
    flat(g, 6.4, 3.4, 0, 2.5, 0.4, loomMat);
    inspectionUnit(g, 6.8, 0, 3.3, 1.3, 0.8);
  };
  for (const z of [62, 72, 82]) for (const x of [13, 24, 35]) loom(x, z);
  person(18.5, 84, Math.PI);
  person(29.5, 74, Math.PI);
  person(13, 66.5, Math.PI);
  person(35, 76.5, Math.PI);
  person(8, 60, 0, [v3(7.5, 60), v3(7.5, 86), v3(40.5, 86), v3(40.5, 60)]);
  rolls(6, 92, 5);

  // ---- Tavoli di controllo (greggio e finito) ------------------------------------------------
  const inspectionTable = (x: number, z: number) => {
    const g = group(x, z);
    box(g, 0.4, 5, 0.4, -3.2, 0, -1, mat(C.machineDark));
    box(g, 0.4, 5, 0.4, 3.2, 0, -1, mat(C.machineDark));
    box(g, 6.8, 0.5, 2.6, 0, 0, 0, mat(C.machineDark));
    const board = box(g, 6.2, 4.4, 0.25, 0, 0.9, -0.2, mat(C.cloth, 0.45));
    board.rotation.x = -0.3;
    const cloth = new Mesh(new PlaneGeometry(5.6, 4.2), loomMat);
    cloth.position.set(0, 3.1, 0.02);
    cloth.rotation.x = -0.3;
    g.add(cloth);
    cyl(g, 0.7, 6.4, 0, 0.9, 1.4, mat(C.fabric), 'x');
    cyl(g, 0.6, 6.4, 0, 5.2, -1.4, mat(C.fabric), 'x');
    inspectionUnit(g, 6.8, 0, 5.9, 0.6, 1.2);
    // Tablet dell'operatore accanto al tavolo
    const tablet = box(g, 1.1, 0.8, 0.1, 4.3, 2.4, 1.2, glowUnit);
    box(g, 0.12, 2.4, 0.12, 4.3, 0, 1.2, mat(C.metal));
    withOnly.push(tablet);
    person(x + (Math.random() - 0.5), z + 4, Math.PI);
  };
  for (const [x, z] of [[58, 82], [69, 82], [63.5, 68]]) inspectionTable(x, z);
  rolls(54, 92, 4);
  for (const [x, z] of [[138, 82], [149, 82], [143.5, 68]]) inspectionTable(x, z);
  rolls(134, 92, 6);
  // Senza BrainTex: le pezze contestate si accumulano accanto al controllo finito
  const rejects = group(152, 92);
  for (let i = 0; i < 5; i++) cyl(rejects, 0.8, 3.2, (i % 3) * 1.8, 0.8 + Math.floor(i / 3) * 1.5, 0, mat(C.bad, 0.25), 'z');
  withoutOnly.push(rejects);

  // ---- Tintoria e finissaggio: vasche di tintura e una lunga rameuse --------------------------
  for (const x of [93, 104, 115]) {
    const g = group(x, 64);
    cyl(g, 2.3, 7, 0, 2.9, 0, mat(C.metal), 'x');
    box(g, 6, 0.6, 3, 0, 0, 0, mat(C.machineDark));
    cyl(g, 0.5, 1.6, 0, 5.6, 0, mat(C.machineDark));
    ball(g, 0.5, 2.2, 4.6, 1.2, mat(C.unit, 0.4));
  }
  const stenter = group(104, 80);
  box(stenter, 30, 4.4, 6.4, 0, 0, 0, mat(C.machine));
  box(stenter, 30.4, 0.5, 6.8, 0, 4.4, 0, mat(C.machineDark));
  for (const x of [-11, -4, 4, 11]) {
    cyl(stenter, 0.7, 6, x, 7.6, -1.6, mat(C.metal));
    box(stenter, 4.6, 2.2, 0.15, x, 1.2, 3.25, mat(C.cloth, 0.3));
  }
  box(stenter, 2, 3, 1.6, -17.5, 0, 4.4, mat(C.machineDark));
  flat(scene, 46, 4.6, 104, 2.2, 80, fabricMat);
  inspectionUnit(scene, 6.4, 85, 5.2, 80, 2.9).rotation.y = Math.PI / 2;
  inspectionUnit(scene, 6.4, 123, 5.2, 80, 2.9).rotation.y = Math.PI / 2;
  person(86, 86, Math.PI);
  person(104, 69.5, Math.PI);
  person(96, 87, 0, [v3(90, 87), v3(120, 87)]);
  rolls(124, 92, 3);

  // ---- Reparti lungo la parete di fondo ---------------------------------------------------------
  const room = (key: NodeKey, width: number) => {
    const c = centre(key);
    flat(scene, width, 28, c.x, 0.02, 20, mat(C.room));
    box(scene, 0.4, 4, 28, c.x - width / 2, 0, 20, mat(C.wall));
    box(scene, 0.4, 4, 28, c.x + width / 2, 0, 20, mat(C.wall));
    return c.x;
  };
  // Manutenzione: banco, parete attrezzi, ricambi
  let x = room('manutenzione', 34);
  box(scene, 10, 1.5, 2.6, x - 4, 0, 12, mat(C.machineDark));
  box(scene, 12, 4, 0.3, x - 4, 2.5, 4.8, mat(C.machineDark));
  for (let i = 0; i < 8; i++) box(scene, 0.8, 1 + (i % 3) * 0.6, 0.2, x - 9 + i * 1.4, 3.2, 5.1, mat(i % 2 ? C.metal : C.unit, 0.2));
  box(scene, 6, 5, 2, x + 10, 0, 8, mat(C.machine));
  cyl(scene, 1, 3, x + 4, 1, 20, mat(C.metal), 'x');
  person(x - 4, 14.6, Math.PI);
  person(x, 30, 0, [v3(x + 6, 26), v3(x + 6, 56), v3(x - 14, 56), v3(x + 6, 56)]);

  // Qualità: tavolo luminoso e campioni
  x = room('qualita', 34);
  box(scene, 9, 1.4, 4, x - 3, 0, 14, mat(C.cloth, 0.5));
  box(scene, 5, 1.4, 2.4, x + 9, 0, 10, mat(C.machineDark));
  box(scene, 1.2, 1.6, 1.2, x + 9, 1.4, 10, mat(C.metal));
  for (let i = 0; i < 5; i++) cyl(scene, 0.5, 2.4, x - 12 + i * 1.3, 1.2, 7, mat(i % 2 ? C.fabric : C.cloth));
  person(x - 3, 17.4, Math.PI);
  person(x + 9, 12.6, Math.PI);

  // Uffici e direzione: scrivanie e, sulla parete, la sala dati con il cruscotto
  x = room('uffici', 38);
  for (const [dx, dz] of [[-10, 22], [0, 22], [10, 22], [-10, 30]]) {
    box(scene, 4, 1.3, 2, x + dx, 0, dz, mat(C.machineDark));
    box(scene, 1.5, 1, 0.12, x + dx, 1.5, dz - 0.5, mat(C.unit, 0.5));
    person(x + dx, dz + 1.8, Math.PI);
  }
  const screenOn = new MeshBasicMaterial({ map: dashboardTexture() });
  const screenOff = mat(0x04121d);
  box(scene, 21, 8.4, 0.3, x, 1.6, 4.6, mat(C.machineDark));
  const screen: Mesh = new Mesh(new PlaneGeometry(20, 7.5), screenOff);
  screen.position.set(x, 5.8, 4.8);
  scene.add(screen);
  const dataWall = new Vector3(x, 6, 5.2);
  person(x + 6, 9, Math.PI);

  // Magazzino e spedizioni: scaffali di pezze, carrello, baia di carico
  x = room('magazzino', 30);
  for (const rz of [10, 18, 26]) {
    for (const px of [-11, 0, 11]) box(scene, 0.4, 8, 0.4, x + px, 0, rz, mat(C.machineDark));
    for (const level of [0, 1, 2]) {
      box(scene, 22.4, 0.25, 3.4, x, 0.6 + level * 2.6, rz, mat(C.machineDark));
      for (let i = 0; i < 9; i++)
        if ((i + level + rz) % 4) cyl(scene, 0.85, 3, x - 9.6 + i * 2.4, 1.7 + level * 2.6, rz, mat(i % 3 ? C.fabric : C.cloth), 'z');
    }
  }
  const forklift = group(x - 4, 34);
  box(forklift, 2.2, 1.8, 3.4, 0, 0.4, 0, mat(C.good, 0.15));
  box(forklift, 0.25, 4.2, 0.25, -0.8, 0, 1.9, mat(C.metal));
  box(forklift, 0.25, 4.2, 0.25, 0.8, 0, 1.9, mat(C.metal));
  cyl(forklift, 0.8, 3, 0, 1.4, 3, mat(C.fabric), 'x');
  movers.push({ g: forklift, path: [v3(x - 12, 34), v3(x + 12, 34), v3(x + 12, 46), v3(152, 60), v3(x + 12, 46), v3(x + 12, 34)], speed: 0.05, phase: 0, turn: 0, bob: 0 });

  // ---- Strada, camion e confezionista (un'altra azienda della filiera) ------------------------
  flat(scene, 6, 130, 171.5, 0, 52, mat(0x0a2233));
  const truck = group(171.5, 30);
  box(truck, 3, 3.4, 8, 0, 1, -1, mat(C.cloth, 0.1));
  box(truck, 2.8, 2.4, 2.4, 0, 1, 4.4, mat(C.machine));
  for (const tz of [-3.5, 0, 4.4]) cyl(truck, 0.7, 3.2, 0, 0.7, tz, mat(0x04121d), 'x');
  movers.push({ g: truck, path: [v3(171.5, 16), v3(171.5, 96)], speed: 0.035, phase: 0, turn: 0, bob: 0 });

  const cx = centre('confezionista').x;
  flat(scene, 30, 44, cx + 2, 0.02, 80, mat(C.room));
  box(scene, 30, 7, 0.5, cx + 2, 0, 58, mat(C.wall));
  box(scene, 0.5, 7, 44, cx + 17, 0, 80, mat(C.wall));
  box(scene, 0.5, 3, 16, cx - 13, 0, 66, mat(C.wall));
  // Tavolo di taglio con carro di taglio automatico che scorre
  box(scene, 20, 1.6, 7.6, cx + 1, 0, 76, mat(C.machineDark));
  const cutWithout = new MeshBasicMaterial({ map: cuttingTexture(false) });
  const cutWith = new MeshBasicMaterial({ map: cuttingTexture(true) });
  const lay: Mesh = flat(scene, 19, 7.1, cx + 1, 1.65, 76, cutWithout);
  cyl(scene, 0.9, 7, cx - 10.5, 1.6, 76, mat(C.fabric), 'z');
  const cutter = group(cx + 1, 76);
  box(cutter, 0.7, 0.6, 8.6, 0, 2.6, 0, mat(C.metal));
  box(cutter, 0.5, 2.6, 0.5, 0, 0, -4.1, mat(C.metal));
  box(cutter, 0.5, 2.6, 0.5, 0, 0, 4.1, mat(C.metal));
  const head = box(cutter, 1, 0.9, 1, 0, 1.9, 0, mat(C.unit, 0.6));
  // Cassone degli scarti di taglio: più pieno senza la mappa dei difetti
  box(scene, 4, 2.4, 4, cx + 13, 0, 68, mat(C.machineDark));
  const scraps = box(scene, 3.4, 1, 3.4, cx + 13, 1.6, 68, mat(C.cloth));
  // Cucitura e capi finiti
  for (const dz of [88, 94]) {
    for (const dx of [-6, 2, 10]) {
      box(scene, 3.6, 1.4, 1.8, cx + dx, 0, dz, mat(C.machineDark));
      box(scene, 0.8, 0.8, 0.6, cx + dx + 0.8, 1.4, dz, mat(C.cloth));
    }
  }
  person(cx - 6, 90, Math.PI);
  person(cx + 10, 90, Math.PI);
  person(cx + 2, 96, Math.PI);
  person(cx - 4, 81, Math.PI);
  person(cx + 6, 71, 0);

  // ---- Ambiente: verde e acqua davanti allo stabilimento ----------------------------------------
  flat(scene, 190, 22, 96, -0.02, 114, mat(C.grass));
  const env = centre('ambiente');
  const water = new Mesh(new CircleGeometry(9, 32), new MeshStandardMaterial({ color: C.water, emissive: C.water, emissiveIntensity: 0.25, roughness: 0.3 }));
  water.rotation.x = -Math.PI / 2;
  water.scale.set(2.2, 0.7, 1);
  water.position.set(env.x, 0.02, 113);
  scene.add(water);
  for (let i = 0; i < 16; i++) {
    const tx = 8 + i * 11.6 + (i % 2) * 3;
    if (Math.abs(tx - env.x) < 22) continue;
    const tz = 112 + (i % 3) * 3.5;
    const hgt = 3 + (i % 3);
    cyl(scene, 0.4, 2.4, tx, 1.2, tz, mat(0x23485a));
    const crown = new Mesh(unitCone, mat(C.tree, 0.1));
    crown.scale.set(2.4, hgt, 2.4);
    crown.position.set(tx, 2.2 + hgt / 2, tz);
    scene.add(crown);
  }

  // ---- Flussi dei dati verso la sala dati (solo con BrainTex) --------------------------------------
  const flowMat = new LineBasicMaterial({ color: C.unit, transparent: true, opacity: 0.55 });
  const flows: { curve: QuadraticBezierCurve3; dots: Mesh[] }[] = [];
  for (const key of ['tessitura', 'greggio', 'finissaggio', 'controllo', 'confezionista'] as NodeKey[]) {
    const from = centre(key).setY(6);
    const mid = from.clone().add(dataWall).multiplyScalar(0.5).setY(26);
    const curve = new QuadraticBezierCurve3(from, mid, dataWall);
    const line = new Line(new BufferGeometry().setFromPoints(curve.getPoints(40)), flowMat);
    const dots = [0, 1].map(() => ball(scene, 0.5, 0, 0, 0, glowUnit));
    scene.add(line);
    withOnly.push(line, ...dots);
    flows.push({ curve, dots });
  }

  // ---- Zone, etichette, impulsi degli eventi ---------------------------------------------------
  const rings = new Map<NodeKey, MeshBasicMaterial>();
  const labels = NODES.map((n) => {
    const c = centre(n.key);
    const m = new MeshBasicMaterial({ color: C.unit, transparent: true, opacity: 0, side: DoubleSide, depthWrite: false });
    const ring = new Mesh(new RingGeometry(13, 14.2, 48), m);
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(c.x, 0.08, n.key === 'ambiente' ? 113 : c.z);
    scene.add(ring);
    rings.set(n.key, m);
    const el = document.createElement('span');
    el.className = 'label3d';
    el.textContent = n.name[lang];
    el.setAttribute('aria-hidden', 'true');
    container.append(el);
    return { key: n.key, el, at: new Vector3(c.x, n.kind === 'station' ? 13 : 10, c.z) };
  });

  const pulseGeo = new SphereGeometry(1.4, 16, 16);
  let pulses: { mesh: Mesh; curve: QuadraticBezierCurve3; start: number }[] = [];
  let mode: Mode = 'with';
  let hits: NodeKey[] = [];
  let origin: NodeKey | null = null;

  const paint = () => {
    for (const [key, m] of rings) {
      const hit = hits.includes(key);
      m.color = new Color(key === origin ? C.unit : mode === 'with' ? C.good : C.bad);
      m.opacity = key === origin || hit ? 0.85 : 0;
    }
    labels.forEach((l) => l.el.classList.toggle('is-hit', hits.includes(l.key)));
    const on = mode === 'with';
    withOnly.forEach((o) => (o.visible = on));
    withoutOnly.forEach((o) => (o.visible = !on));
    screen.material = on ? screenOn : screenOff;
    lay.material = on ? cutWith : cutWithout;
    scraps.scale.y = on ? 0.4 : 1.8;
    scraps.position.y = 1.6 + scraps.scale.y / 2;
    (water.material as MeshStandardMaterial).color.set(on ? C.water : C.murky);
    (water.material as MeshStandardMaterial).emissive.set(on ? C.water : C.murky);
  };

  const clearPulses = () => {
    pulses.forEach((p) => {
      scene.remove(p.mesh);
      (p.mesh.material as MeshStandardMaterial).dispose();
    });
    pulses = [];
  };

  // ---- Camera: vista d'insieme, avvicinamento alle fasi, rotazione trascinando -------------------
  // La distanza della vista d'insieme dipende dalle proporzioni del riquadro: la fabbrica deve starci tutta.
  const home = { target: new Vector3(103, 0, 64), offset: new Vector3(0, 92, 150) };
  const fitHome = (aspect: number) => home.offset.set(0, 0.68, 0.73).multiplyScalar(Math.max(165, 400 / aspect));
  const camTarget = home.target.clone();
  const camOffset = home.offset.clone();
  const wantTarget = home.target.clone();
  const wantOffset = home.offset.clone();
  let yaw = 0;
  let wantYaw = 0;
  let dragX: number | null = null;
  let focused: NodeKey | null = null;
  const canvas = renderer.domElement;
  const onDown = (e: PointerEvent) => {
    dragX = e.clientX;
    try {
      canvas.setPointerCapture(e.pointerId);
    } catch {
      // puntatore già rilasciato: si trascina comunque finché resta premuto
    }
  };
  const onMove = (e: PointerEvent) => {
    if (dragX === null) return;
    wantYaw = Math.max(-1.3, Math.min(1.3, wantYaw - (e.clientX - dragX) * 0.005));
    dragX = e.clientX;
  };
  const onUp = () => (dragX = null);
  canvas.addEventListener('pointerdown', onDown);
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerup', onUp);
  canvas.addEventListener('pointercancel', onUp);

  const view: SceneView = {
    setMode(m) {
      mode = m;
      paint();
    },
    focus(node) {
      wantYaw = 0;
      focused = node;
      if (!node) {
        wantTarget.copy(home.target);
        wantOffset.copy(home.offset);
        return;
      }
      // Ci si avvicina alla zona, abbastanza da vedere macchine e persone.
      wantTarget.copy(centre(node)).lerp(home.target, 0.18);
      wantOffset.set(0, 44, 70);
    },
    showEvent(event: FactoryEvent, m: Mode) {
      mode = m;
      origin = event.origin;
      hits = event.targets;
      paint();
      clearPulses();
      const from = centre(event.origin).setY(4);
      const now = performance.now();
      event.targets.forEach((t, i) => {
        const to = centre(t).setY(4);
        const mid = from.clone().add(to).multiplyScalar(0.5);
        mid.y += 34;
        const color = m === 'with' ? C.good : C.bad;
        const mesh = new Mesh(pulseGeo, new MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.9 }));
        scene.add(mesh);
        pulses.push({ mesh, curve: new QuadraticBezierCurve3(from.clone(), mid, to), start: now + i * 350 });
      });
    },
    dispose() {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      clearPulses();
      scene.traverse((o) => {
        const mesh = o as Mesh;
        mesh.geometry?.dispose();
        const material = mesh.material as (MeshStandardMaterial & { map?: CanvasTexture | null }) | undefined;
        material?.map?.dispose();
        material?.dispose();
      });
      [screenOn, screenOff, cutWith, cutWithout].forEach((m) => {
        (m as MeshBasicMaterial).map?.dispose();
        m.dispose();
      });
      pulseGeo.dispose();
      renderer.dispose();
      container.replaceChildren();
    },
  };

  // Dimensioni e ciclo di disegno (fermo quando non è visibile)
  const resize = () => {
    const w = container.clientWidth;
    if (!w) return; // riquadro ancora nascosto
    const h = container.clientHeight || (w * 3) / 5;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    fitHome(w / h);
    if (!focused) wantOffset.copy(home.offset);
  };
  const ro = new ResizeObserver(resize);
  ro.observe(container);
  resize();

  let visible = true;
  const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
  io.observe(container);

  const v = new Vector3();
  const up = new Vector3(0, 1, 0);
  let raf = 0;
  const frame = (now: number) => {
    raf = requestAnimationFrame(frame);
    if (!visible || document.hidden) return;
    const t = now / 1000;

    // Tessuto che scorre, carro di taglio, dati che salgono verso la sala dati
    fabricTex.offset.x -= 0.004;
    loomTex.offset.y += 0.003;
    cutter.position.x = cx + 1 + Math.sin(t * 0.5) * 8.5;
    head.position.z = Math.sin(t * 2.3) * 3.2;
    flows.forEach((f, i) => f.dots.forEach((d, j) => d.position.copy(f.curve.getPoint((t * 0.22 + i * 0.17 + j * 0.5) % 1))));

    // Persone e mezzi: chi lavora si muove sul posto, gli altri seguono il loro percorso
    for (const m of movers) {
      if (!m.path) {
        m.g.rotation.y = m.turn + Math.sin(t * 1.4 + m.phase) * 0.35;
        m.g.position.y = Math.abs(Math.sin(t * 2 + m.phase)) * 0.08;
        continue;
      }
      const n = m.path.length;
      const loop = n === 2 ? 2 : n; // con due soli punti si va avanti e indietro
      const p = (t * m.speed + m.phase) % loop;
      const i = Math.floor(p);
      const a = m.path[i % n];
      const b = m.path[(i + 1) % n];
      m.g.position.lerpVectors(a, b, p - i);
      m.g.position.y = m.bob * Math.abs(Math.sin(t * 6 + m.phase)) * 0.15;
      m.g.rotation.y = Math.atan2(b.x - a.x, b.z - a.z);
    }

    // Camera: avvicinamento morbido, rotazione trascinando e un lieve movimento continuo
    camTarget.lerp(wantTarget, 0.05);
    camOffset.lerp(wantOffset, 0.05);
    yaw += (wantYaw - yaw) * 0.08;
    camera.position.copy(camOffset).applyAxisAngle(up, yaw + Math.sin(t * 0.12) * 0.05).add(camTarget);
    camera.lookAt(camTarget);

    for (const p of pulses) {
      const k = Math.min(1, Math.max(0, (now - p.start) / 1500));
      p.mesh.visible = k > 0 && k < 1;
      p.mesh.position.copy(p.curve.getPoint(k));
    }

    renderer.render(scene, camera);

    const w = container.clientWidth;
    const h = container.clientHeight;
    for (const l of labels) {
      v.copy(l.at).project(camera);
      l.el.style.transform = `translate(-50%, -50%) translate(${((v.x + 1) / 2) * w}px, ${((1 - v.y) / 2) * h}px)`;
    }
  };
  raf = requestAnimationFrame(frame);

  paint();
  return view;
}

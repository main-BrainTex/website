// Vista 3D della fabbrica (caricata solo su richiesta). Stessa pianta della mappa 2D:
// x della pianta → asse x, y della pianta → asse z. Hardware sempre stilizzato e generico.
import {
  BoxGeometry,
  CanvasTexture,
  Color,
  CylinderGeometry,
  DirectionalLight,
  EdgesGeometry,
  Group,
  HemisphereLight,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  QuadraticBezierCurve3,
  RepeatWrapping,
  Scene,
  SphereGeometry,
  SRGBColorSpace,
  Vector3,
  WebGLRenderer,
} from 'three';
import { NODES, type FactoryEvent, type NodeKey } from '../../data/factory';
import type { Mode } from './engine';
import type { SceneView } from './ui';

const C = {
  floor: 0x002a4a,
  station: 0x0a3d63,
  dept: 0x00253f,
  edge: 0x5fa8c9,
  fabric: 0x0a4f7a,
  unit: 0x57f0fe,
  good: 0x9ced40,
  bad: 0xffb3b3,
  origin: 0x57f0fe,
};

function weaveTexture() {
  const c = document.createElement('canvas');
  c.width = 64;
  c.height = 64;
  const g = c.getContext('2d')!;
  g.fillStyle = '#0a4f7a';
  g.fillRect(0, 0, 64, 64);
  g.fillStyle = 'rgba(87,240,254,0.35)';
  for (let i = 0; i < 64; i += 8) g.fillRect(i, 0, 2, 64);
  g.fillStyle = 'rgba(19,115,168,0.7)';
  for (let i = 0; i < 64; i += 8) g.fillRect(0, i, 64, 3);
  const tex = new CanvasTexture(c);
  tex.wrapS = tex.wrapT = RepeatWrapping;
  tex.repeat.set(18, 1);
  tex.colorSpace = SRGBColorSpace;
  return tex;
}

export function createScene(container: HTMLElement, lang: 'it' | 'en'): SceneView {
  const renderer = new WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.append(renderer.domElement);

  const scene = new Scene();
  const camera = new PerspectiveCamera(38, 5 / 3, 1, 600);
  const home = { pos: new Vector3(50, 78, 118), target: new Vector3(50, 0, 30) };
  const camPos = home.pos.clone();
  const camTarget = home.target.clone();
  const wantPos = home.pos.clone();
  const wantTarget = home.target.clone();

  scene.add(new HemisphereLight(0xcfefff, 0x001020, 1.1));
  const sun = new DirectionalLight(0xffffff, 1.4);
  sun.position.set(30, 80, 60);
  scene.add(sun);

  const disposables: { dispose(): void }[] = [];
  const keep = <T extends { dispose(): void }>(x: T) => (disposables.push(x), x);

  // Pavimento
  const floor = new Mesh(keep(new PlaneGeometry(116, 74)), keep(new MeshStandardMaterial({ color: C.floor })));
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(50, 0, 32);
  scene.add(floor);

  // Tessuto che scorre lungo la linea
  const stations = NODES.filter((n) => n.kind === 'station');
  const x0 = stations[0].x - 8;
  const x1 = stations[stations.length - 1].x + 8;
  const fabricTex = keep(weaveTexture());
  const fabric = new Mesh(
    keep(new PlaneGeometry(x1 - x0, 4.5)),
    keep(new MeshStandardMaterial({ map: fabricTex, roughness: 0.9 })),
  );
  fabric.rotation.x = -Math.PI / 2;
  fabric.position.set((x0 + x1) / 2, 2.6, stations[0].y);
  scene.add(fabric);

  // Nodi: macchine della linea e reparti
  const nodeMeshes = new Map<NodeKey, Mesh>();
  const units: Group[] = [];
  const stationGeo = keep(new BoxGeometry(11, 5, 9));
  const deptGeo = keep(new BoxGeometry(17, 3, 8));
  const envGeo = keep(new CylinderGeometry(6, 6, 1.2, 32));
  const edgeMat = keep(new LineBasicMaterial({ color: C.edge, transparent: true, opacity: 0.6 }));
  const unitMat = keep(new MeshStandardMaterial({ color: C.unit, emissive: C.unit, emissiveIntensity: 0.6 }));
  const postGeo = keep(new BoxGeometry(0.6, 6, 0.6));
  const barGeo = keep(new BoxGeometry(9, 0.8, 1.2));

  for (const n of NODES) {
    const isStation = n.kind === 'station';
    const geo = n.key === 'ambiente' ? envGeo : isStation ? stationGeo : deptGeo;
    const mat = keep(new MeshStandardMaterial({ color: isStation ? C.station : C.dept, emissive: 0x000000 }));
    const mesh = new Mesh(geo, mat);
    const h = n.key === 'ambiente' ? 0.6 : isStation ? 2.5 : 1.5;
    mesh.position.set(n.x, h, n.y);
    mesh.add(new LineSegments(keep(new EdgesGeometry(geo)), edgeMat));
    scene.add(mesh);
    nodeMeshes.set(n.key, mesh);

    if (isStation) {
      // Unità di ispezione stilizzata: un portale sopra il tessuto, solo "con BrainTex"
      const unit = new Group();
      const left = new Mesh(postGeo, unitMat);
      const right = new Mesh(postGeo, unitMat);
      const bar = new Mesh(barGeo, unitMat);
      left.position.set(-4.5, 3, 0);
      right.position.set(4.5, 3, 0);
      bar.position.set(0, 6, 0);
      unit.add(left, right, bar);
      unit.position.set(n.x + 7, 0, n.y);
      scene.add(unit);
      units.push(unit);
    }
  }

  // Etichette HTML (testo vero, leggibile e accessibile)
  const labels = NODES.map((n) => {
    const el = document.createElement('span');
    el.className = 'label3d';
    el.textContent = n.name[lang];
    el.setAttribute('aria-hidden', 'true');
    container.append(el);
    return { key: n.key, el, at: new Vector3(n.x, n.kind === 'station' ? 8 : 5, n.y) };
  });

  // Impulsi della catena di conseguenze
  const pulseGeo = keep(new SphereGeometry(1, 16, 16));
  let pulses: { mesh: Mesh; curve: QuadraticBezierCurve3; start: number }[] = [];
  let mode: Mode = 'with';
  let hits: NodeKey[] = [];
  let origin: NodeKey | null = null;

  const paint = () => {
    for (const [key, mesh] of nodeMeshes) {
      const mat = mesh.material as MeshStandardMaterial;
      const hit = hits.includes(key);
      const color = key === origin ? C.origin : hit ? (mode === 'with' ? C.good : C.bad) : 0x000000;
      mat.emissive = new Color(color);
      mat.emissiveIntensity = key === origin || hit ? 0.45 : 0;
    }
    labels.forEach((l) => l.el.classList.toggle('is-hit', hits.includes(l.key)));
    units.forEach((u) => (u.visible = mode === 'with'));
  };

  const clearPulses = () => {
    pulses.forEach((p) => {
      scene.remove(p.mesh);
      (p.mesh.material as MeshStandardMaterial).dispose();
    });
    pulses = [];
  };

  const view: SceneView = {
    setMode(m) {
      mode = m;
      paint();
    },
    focus(node) {
      if (!node) {
        wantPos.copy(home.pos);
        wantTarget.copy(home.target);
        return;
      }
      // Ci si avvicina alla fase senza perdere di vista il resto della fabbrica.
      const n = NODES.find((x) => x.key === node)!;
      wantTarget.set(n.x, 0, n.y).lerp(home.target, 0.45);
      wantPos.copy(wantTarget).add(new Vector3(0, 62, 86));
    },
    showEvent(event: FactoryEvent, m: Mode) {
      mode = m;
      origin = event.origin;
      hits = event.targets;
      paint();
      clearPulses();
      const from = nodeMeshes.get(event.origin)!.position;
      const now = performance.now();
      event.targets.forEach((t, i) => {
        const to = nodeMeshes.get(t)!.position;
        const mid = from.clone().add(to).multiplyScalar(0.5);
        mid.y += 18;
        const mat = new MeshStandardMaterial({
          color: m === 'with' ? C.good : C.bad,
          emissive: m === 'with' ? C.good : C.bad,
          emissiveIntensity: 0.8,
        });
        const mesh = new Mesh(pulseGeo, mat);
        scene.add(mesh);
        pulses.push({ mesh, curve: new QuadraticBezierCurve3(from.clone(), mid, to.clone()), start: now + i * 350 });
      });
    },
    dispose() {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      clearPulses();
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
      container.replaceChildren();
    },
  };

  // Dimensioni e ciclo di disegno (fermo quando non è visibile)
  const resize = () => {
    const w = container.clientWidth;
    const h = container.clientHeight || (w * 3) / 5;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  const ro = new ResizeObserver(resize);
  ro.observe(container);
  resize();

  let visible = true;
  const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
  io.observe(container);

  const v = new Vector3();
  let raf = 0;
  const frame = (now: number) => {
    raf = requestAnimationFrame(frame);
    if (!visible || document.hidden) return;
    fabricTex.offset.x -= 0.004;
    camPos.lerp(wantPos, 0.05);
    camTarget.lerp(wantTarget, 0.05);
    camera.position.copy(camPos);
    camera.lookAt(camTarget);

    for (const p of pulses) {
      const t = Math.min(1, Math.max(0, (now - p.start) / 1300));
      p.mesh.visible = t > 0 && t < 1;
      p.mesh.position.copy(p.curve.getPoint(t));
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

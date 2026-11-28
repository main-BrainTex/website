// Collega il motore della simulazione all'interfaccia: mappa 2D, catena, contatori, indicatori,
// comandi della modalità demo e caricamento su richiesta della vista 3D.
import { EVENTS, GUIDED_TOUR, INDICATORS, LENSES, NODES, type FactoryEvent, type NodeKey } from '../../data/factory';
import { FactorySim, levelWord, type Mode } from './engine';

export interface SceneView {
  setMode(mode: Mode): void;
  focus(node: NodeKey | null): void;
  showEvent(event: FactoryEvent, mode: Mode): void;
  dispose(): void;
}

export interface FactoryController {
  sim: FactorySim;
  focus(node: NodeKey | null): void;
  /** Applica l'evento alla giornata (la prima volta) e lo mostra. */
  play(key: string): void;
}

const S = 10;
const pos = (key: NodeKey) => {
  const n = NODES.find((x) => x.key === key)!;
  return { x: n.x * S, y: n.y * S };
};

const prefersReducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

function webglAvailable(): boolean {
  try {
    const c = document.createElement('canvas');
    return Boolean(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

const controllers = new WeakMap<HTMLElement, FactoryController>();

export function initFactorySim(root: HTMLElement): FactoryController {
  const existing = controllers.get(root);
  if (existing) return existing;
  const lang = (root.dataset.lang === 'en' ? 'en' : 'it') as 'it' | 'en';
  const ui = JSON.parse(root.dataset.ui ?? '{}') as Record<string, string>;
  const sim = new FactorySim();
  const svg = root.querySelector<SVGSVGElement>('[data-map]')!;
  const pulses = root.querySelector<SVGGElement>('[data-pulses]')!;
  const chain = root.querySelector<HTMLElement>('[data-chain]')!;
  const three = root.querySelector<HTMLElement>('[data-three]')!;
  const status = root.querySelector<HTMLElement>('[data-status]')!;
  const view3dBtn = root.querySelector<HTMLButtonElement>('[data-view3d]')!;
  const tourBtn = root.querySelector<HTMLButtonElement>('[data-tour3d]')!;
  const caption = root.querySelector<HTMLElement>('[data-caption]')!;
  const playBtn = root.querySelector<HTMLButtonElement>('[data-play]')!;
  const lensSelect = root.querySelector<HTMLSelectElement>('[data-lens]')!;
  const fmt = new Intl.NumberFormat(lang === 'it' ? 'it-IT' : 'en-GB');
  const applied = new Set<string>();
  let scene: SceneView | null = null;
  let focusNode: NodeKey | null = null;
  let playTimer = 0;

  // ---- Rendering ----------------------------------------------------------------------
  const nodeEl = (key: NodeKey) => svg.querySelector<SVGGElement>(`[data-node="${key}"]`);

  const renderChain = () => {
    const e = sim.last;
    if (!e) return;
    const steps = (sim.mode === 'with' ? e.with : e.without)[lang];
    chain.replaceChildren();
    const title = document.createElement('p');
    title.className = 'chain-title';
    title.textContent = `${e.phase[lang]} · ${e.title[lang]}`;
    const mode = document.createElement('p');
    mode.className = 'chain-mode';
    mode.textContent = sim.mode === 'with' ? ui.with : ui.without;
    const list = document.createElement('ol');
    for (const s of steps) {
      const li = document.createElement('li');
      li.textContent = s;
      list.append(li);
    }
    chain.append(title, mode, list);
  };

  const renderNodes = () => {
    svg.querySelectorAll('.map__node').forEach((n) => n.classList.remove('is-origin', 'is-hit', 'is-focus'));
    if (focusNode) nodeEl(focusNode)?.classList.add('is-focus');
    const e = sim.last;
    if (!e) return;
    nodeEl(e.origin)?.classList.add('is-origin');
    e.targets.forEach((k) => nodeEl(k)?.classList.add('is-hit'));
  };

  const renderPulses = () => {
    const e = sim.last;
    pulses.replaceChildren();
    if (!e || prefersReducedMotion()) return;
    const from = pos(e.origin);
    e.targets.forEach((target, i) => {
      const to = pos(target);
      const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      dot.setAttribute('r', '11');
      dot.setAttribute('class', 'pulse');
      pulses.append(dot);
      dot.animate(
        [
          { transform: `translate(${from.x}px, ${from.y}px)`, opacity: 1 },
          { transform: `translate(${to.x}px, ${to.y}px)`, opacity: 1, offset: 0.85 },
          { transform: `translate(${to.x}px, ${to.y}px)`, opacity: 0 },
        ],
        { duration: 1400, delay: i * 350, easing: 'cubic-bezier(0.2, 0.7, 0.2, 1)', fill: 'both' },
      );
    });
  };

  const renderState = () => {
    const d = sim.day;
    const set = (key: string, value: number) => {
      const el = root.querySelector(`[data-counter="${key}"]`);
      if (el) el.textContent = fmt.format(Math.round(value));
    };
    set('inspected', sim.inspected);
    set('stoppedAtSource', d.stoppedAtSource);
    set('stoppedAtInspection', d.stoppedAtInspection);
    set('reachedCustomer', d.reachedCustomer);
    set('meters', d.meters);
    root.querySelector('[data-meters-label]')!.textContent = sim.mode === 'with' ? ui.saved : ui.lost;

    const bin = root.querySelector<SVGRectElement>('[data-bin-fill]')!;
    const h = Math.min(52, d.scrap * 13);
    bin.setAttribute('height', String(h));
    bin.setAttribute('y', String(16 - h));
    root.querySelector('[data-returns-badge]')!.textContent = d.returns ? `↩ ${d.returns}` : '';
    root.querySelector('[data-queue-badge]')!.textContent = d.queue ? `${d.queue} ⧗` : '';

    const touched = sim.last?.indicators ?? [];
    for (const ind of INDICATORS) {
      const li = root.querySelector<HTMLElement>(`[data-indicator="${ind.key}"]`);
      if (!li) continue;
      const level = d.levels[ind.key];
      li.querySelectorAll('.ind__bar span').forEach((s, i) => s.classList.toggle('is-on', i <= level));
      li.querySelector('[data-level-word]')!.textContent = levelWord(level, lang);
      const better = sim.mode === 'with';
      li.classList.toggle('is-up', touched.includes(ind.key) && better);
      li.classList.toggle('is-down', touched.includes(ind.key) && !better);
    }
  };

  const renderAll = (animate = false) => {
    root.dataset.mode = sim.mode;
    renderNodes();
    renderChain();
    renderState();
    if (animate) renderPulses();
    root.querySelectorAll<HTMLButtonElement>('[data-event]').forEach((b) =>
      b.classList.toggle('is-current', b.dataset.event === sim.last?.key),
    );
    if (scene && sim.last) scene.showEvent(sim.last, sim.mode);
  };

  sim.addEventListener('event', () => renderAll(true));
  sim.addEventListener('mode', () => {
    root.querySelectorAll<HTMLButtonElement>('[data-mode-btn]').forEach((b) =>
      b.setAttribute('aria-pressed', String(b.dataset.modeBtn === sim.mode)),
    );
    scene?.setMode(sim.mode);
    renderAll(true);
  });
  sim.addEventListener('tick', renderState);
  sim.addEventListener('reset', () => {
    applied.clear();
    chain.replaceChildren(Object.assign(document.createElement('p'), { className: 'sim__chain-idle', textContent: ui.idle }));
    pulses.replaceChildren();
    renderNodes();
    renderState();
  });

  // ---- Controller --------------------------------------------------------------------
  const controller: FactoryController = {
    sim,
    focus(node) {
      focusNode = node;
      renderNodes();
      scene?.focus(node);
    },
    play(key) {
      if (applied.has(key)) {
        // Già accaduto oggi: lo si rivede senza contarlo due volte.
        sim.last = EVENTS.find((e) => e.key === key) ?? null;
        renderAll(true);
        return;
      }
      applied.add(key);
      sim.advance(400 + Math.random() * 300);
      sim.run(key);
    },
  };
  controllers.set(root, controller);

  // ---- Comandi -----------------------------------------------------------------------
  root.querySelectorAll<HTMLButtonElement>('[data-mode-btn]').forEach((b) =>
    b.addEventListener('click', () => sim.setMode(b.dataset.modeBtn as Mode)),
  );

  // Giro guidato nella fabbrica 3D: la vista si sposta da sola da una tappa all'altra.
  let tourTimer = 0;
  const stopTour = () => {
    if (!tourTimer) return;
    window.clearTimeout(tourTimer);
    tourTimer = 0;
    caption.hidden = true;
    tourBtn.textContent = ui.tour;
    tourBtn.setAttribute('aria-pressed', 'false');
    controller.focus(null);
  };
  const tourStep = (i: number) => {
    const stop = GUIDED_TOUR[i];
    if (!stop) {
      tourTimer = -1; // fine del giro: stopTour riporta tutto com'era
      return stopTour();
    }
    controller.focus(stop.focus);
    caption.textContent = stop.text[lang];
    caption.hidden = false;
    tourTimer = window.setTimeout(() => tourStep(i + 1), 6000);
  };
  tourBtn.addEventListener('click', () => {
    if (tourTimer) return stopTour();
    tourBtn.textContent = ui.tourStop;
    tourBtn.setAttribute('aria-pressed', 'true');
    tourStep(0);
  });
  // Chi tocca la scena riprende il comando.
  three.addEventListener('pointerdown', stopTour);

  root.querySelectorAll<HTMLButtonElement>('[data-event]').forEach((b) =>
    b.addEventListener('click', () => {
      stopTour();
      applied.delete(b.dataset.event!); // nella demo ogni clic fa accadere di nuovo l'evento
      controller.play(b.dataset.event!);
    }),
  );

  root.querySelector('[data-reset]')?.addEventListener('click', () => sim.reset());

  // Lente per ruolo: mette in primo piano eventi e indicatori del ruolo scelto.
  const applyLens = () => {
    const lens = LENSES.find((l) => l.key === lensSelect.value);
    root.querySelectorAll<HTMLElement>('[data-event]').forEach((b) =>
      b.classList.toggle('is-dim', Boolean(lens) && !lens!.events.includes(b.dataset.event!)),
    );
    root.querySelectorAll<HTMLElement>('[data-indicator]').forEach((li) =>
      li.classList.toggle('is-dim', Boolean(lens) && !lens!.indicators.includes(li.dataset.indicator as never)),
    );
  };
  lensSelect.addEventListener('change', applyLens);

  // Turno accelerato: fa accadere in sequenza gli eventi (quelli della lente, se scelta).
  const stopShift = () => {
    window.clearInterval(playTimer);
    playTimer = 0;
    playBtn.textContent = ui.play;
  };
  playBtn.addEventListener('click', () => {
    if (playTimer) return stopShift();
    const lens = LENSES.find((l) => l.key === lensSelect.value);
    const queue = (lens ? lens.events : EVENTS.map((e) => e.key)).slice();
    let i = 0;
    const step = () => {
      if (i >= queue.length) return stopShift();
      applied.delete(queue[i]);
      controller.play(queue[i++]);
    };
    playBtn.textContent = ui.stop;
    step();
    playTimer = window.setInterval(step, prefersReducedMotion() ? 3000 : 4500);
  });

  // ---- Modalità demo (schermo intero) -----------------------------------------------------
  const openBtn = root.querySelector<HTMLButtonElement>('[data-demo-open]')!;
  const closeBtn = root.querySelector<HTMLButtonElement>('[data-demo-close]')!;
  const placeholder = document.createComment('sim');

  const openDemo = () => {
    root.before(placeholder);
    document.body.append(root); // fuori da contenitori sticky, sopra a tutto
    root.classList.add('is-demo');
    controller.focus(null); // nella demo si parte dalla vista d'insieme
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-modal', 'true');
    document.documentElement.style.overflow = 'hidden';
    root.requestFullscreen?.().catch(() => undefined);
    closeBtn.focus();
  };
  const closeDemo = () => {
    if (!root.classList.contains('is-demo')) return;
    root.classList.remove('is-demo');
    root.removeAttribute('role');
    root.removeAttribute('aria-modal');
    document.documentElement.style.overflow = '';
    placeholder.replaceWith(root);
    if (document.fullscreenElement) document.exitFullscreen().catch(() => undefined);
    stopShift();
    stopTour();
    openBtn.focus();
  };
  openBtn.addEventListener('click', openDemo);
  closeBtn.addEventListener('click', closeDemo);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeDemo();
  });
  document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement && root.classList.contains('is-demo')) closeDemo();
  });
  // Link diretto alla demo: pagina#demo
  if (location.hash === '#demo') openDemo();

  // ---- Vista 3D su richiesta --------------------------------------------------------------
  // 3D solo su schermi ampi, dispositivi non troppo modesti, WebGL presente e senza "riduci movimento".
  const lowEnd = (navigator.hardwareConcurrency ?? 4) <= 2;
  const can3d =
    webglAvailable() && !prefersReducedMotion() && !lowEnd && matchMedia('(min-width: 56rem)').matches;
  view3dBtn.hidden = !can3d;
  view3dBtn.addEventListener('click', async () => {
    if (scene) {
      stopTour();
      tourBtn.hidden = true;
      scene.dispose();
      scene = null;
      three.hidden = true;
      three.replaceChildren();
      svg.classList.remove('is-hidden');
      view3dBtn.textContent = ui.view3d;
      status.textContent = '';
      return;
    }
    status.textContent = ui.loading3d;
    try {
      const { createScene } = await import('./scene3d');
      scene = createScene(three, lang);
      three.hidden = false;
      svg.classList.add('is-hidden');
      scene.setMode(sim.mode);
      scene.focus(focusNode);
      if (sim.last) scene.showEvent(sim.last, sim.mode);
      view3dBtn.textContent = ui.view2d;
      status.textContent = ui.drag3d;
      tourBtn.hidden = false;
    } catch {
      status.textContent = ui.failed3d;
      view3dBtn.hidden = true;
    }
  });

  // I metri controllati avanzano mentre il simulatore è visibile (un po' più veloci nel turno).
  let visible = false;
  new IntersectionObserver(([entry]) => (visible = entry.isIntersecting)).observe(root);
  window.setInterval(() => {
    if ((visible || root.classList.contains('is-demo')) && !document.hidden) sim.advance(playTimer ? 30 : 1);
  }, 1000);

  renderState();
  return controller;
}

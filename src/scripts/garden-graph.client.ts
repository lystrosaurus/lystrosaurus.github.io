/**
 * Knowledge-graph interactions (zero dependency, ~30 lines of native DOM).
 *
 * - Hover a node → highlight it and its immediate neighbours, dim the rest.
 * - Click a category chip → highlight that category's nodes, dim the rest.
 *
 * All state is read from `data-*` attributes emitted at build time; no data is
 * fetched and no layout is computed on the client.
 */

type GNode = SVGGElement & { dataset: DOMStringMap };
type GEdge = SVGLineElement & { dataset: DOMStringMap };
type GChip = HTMLButtonElement & { dataset: DOMStringMap };

const nodes = Array.from(document.querySelectorAll<GNode>('.garden-graph-node'));
const edges = Array.from(document.querySelectorAll<GEdge>('.garden-graph-edge'));
const chips = Array.from(document.querySelectorAll<GChip>('.garden-graph-chip'));

const byId = new Map(nodes.map((n) => [n.dataset.id as string, n]));

function relatedOf(id: string): Set<string> {
  const n = byId.get(id);
  const raw = (n?.dataset.related ?? '').trim();
  return new Set(raw ? raw.split(',').filter(Boolean) : []);
}

/** activeCat: currently highlighted category, or null for "show all". */
let activeCat: string | null = null;

function clearStates(): void {
  nodes.forEach((n) => n.classList.remove('dim', 'hl'));
  edges.forEach((e) => e.classList.remove('dim'));
}

function applyCategory(cat: string | null): void {
  activeCat = cat;
  if (!cat) {
    clearStates();
    chips.forEach((c) => c.classList.toggle('garden-chip-active', c.dataset.cat === ''));
    return;
  }
  nodes.forEach((n) => n.classList.toggle('dim', n.dataset.category !== cat));
  edges.forEach((e) => {
    const fromCat = byId.get(e.dataset.from as string)?.dataset.category;
    const toCat = byId.get(e.dataset.to as string)?.dataset.category;
    e.classList.toggle('dim', !(fromCat === cat && toCat === cat));
  });
  chips.forEach((c) => c.classList.toggle('garden-chip-active', c.dataset.cat === cat));
}

function highlight(id: string | null): void {
  if (!id) {
    applyCategory(activeCat);
    return;
  }
  const rel = relatedOf(id);
  rel.add(id);
  nodes.forEach((n) => {
    const on = rel.has(n.dataset.id as string);
    n.classList.toggle('dim', !on);
    n.classList.toggle('hl', n.dataset.id === id);
  });
  edges.forEach((e) => {
    const on = e.dataset.from === id || e.dataset.to === id;
    e.classList.toggle('dim', !on);
  });
}

nodes.forEach((n) => {
  n.addEventListener('mouseenter', () => highlight(n.dataset.id as string));
  n.addEventListener('mouseleave', () => highlight(null));
});

chips.forEach((c) => {
  c.addEventListener('click', () => {
    const cat = c.dataset.cat ?? '';
    applyCategory(activeCat === cat ? null : cat);
  });
});

applyCategory(null);

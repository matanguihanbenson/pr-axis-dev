// Random walks along the hero grid, for the circuit pulses.
//
// Every pulse is assigned a lane (0, 1, 2) and only ever travels on grid lines
// whose index leaves that remainder: columns c % 3 === lane, rows r % 3 === lane.
// Two different lanes therefore never share a row or a column, so pulses can
// cross at right angles but never run on top of each other.
//
// Points sit half a pixel off the line coordinate, so a 1px stroke covers the
// exact pixel the grey grid line occupies.

export const CELL = 64;
export const LANES = 2;

type Dir = "l" | "r" | "u" | "d";
type Cell = { c: number; r: number };

const DELTA: Record<Dir, readonly [number, number]> = {
  l: [-1, 0],
  r: [1, 0],
  u: [0, -1],
  d: [0, 1],
};

const REVERSE: Record<Dir, Dir> = { l: "r", r: "l", u: "d", d: "u" };

export type Blocked = { c0: number; c1: number; r0: number; r1: number };
export type CircuitPath = { d: string; length: number };
export type Side = "left" | "right" | "top" | "bottom";

/** The opposite edge, so a pair of pulses never enters from the same side. */
export const MIRROR_SIDE: Record<Side, Side> = {
  left: "right",
  right: "left",
  top: "bottom",
  bottom: "top",
};

const pick = <T>(list: T[], random: () => number): T =>
  list[Math.min(list.length - 1, Math.floor(random() * list.length))];

export function buildCircuitPath(
  width: number,
  height: number,
  blocked: Blocked,
  lane: number,
  random: () => number,
  side?: Side,
): CircuitPath | null {
  const cols = Math.floor(width / CELL);
  const rows = Math.floor(height / CELL);
  if (cols < 9 || rows < 6) return null;

  const blockedAt = (c: number, r: number) =>
    c >= blocked.c0 && c <= blocked.c1 && r >= blocked.r0 && r <= blocked.r1;
  const inField = (c: number, r: number) =>
    c >= 1 && c <= cols - 1 && r >= 0 && r <= rows;
  const free = (c: number, r: number) => inField(c, r) && !blockedAt(c, r);

  const laneCols: number[] = [];
  for (let c = lane; c <= cols - 1; c += LANES) if (c >= 1) laneCols.push(c);
  const laneRows: number[] = [];
  for (let r = lane; r <= rows; r += LANES) laneRows.push(r);
  if (laneCols.length < 2 || laneRows.length < 2) return null;

  // Candidates per edge, ordered from that edge inward, so a requested side is
  // honoured from as close to the edge as the text block allows.
  const fromEdge = (edge: Side): { cell: Cell; dir: Dir }[] => {
    const out: { cell: Cell; dir: Dir }[] = [];
    if (edge === "left" || edge === "right") {
      const cols = edge === "left" ? laneCols : [...laneCols].reverse();
      for (const c of cols) {
        for (const r of laneRows) out.push({ cell: { c, r }, dir: edge === "left" ? "r" : "l" });
      }
    } else {
      const rows = edge === "top" ? laneRows : [...laneRows].reverse();
      for (const r of rows) {
        for (const c of laneCols) out.push({ cell: { c, r }, dir: edge === "top" ? "d" : "u" });
      }
    }
    return out.filter((entry) => free(entry.cell.c, entry.cell.r));
  };

  const SIDES: Side[] = ["left", "right", "top", "bottom"];
  const preferred = side ? fromEdge(side) : [];
  // Fall back only when the lane has no free start on the requested edge.
  const pool = preferred.length ? preferred.slice(0, 6) : SIDES.flatMap(fromEdge).slice(0, 12);
  if (!pool.length) return null;
  const start = pick(pool, random);
  const points = [start.cell];
  let dir = start.dir;
  let cur = start.cell;

  // Steps available in a direction before the field edge or the text block.
  const room = (direction: Dir) => {
    const [dc, dr] = DELTA[direction];
    let steps = 0;
    let edge = false;
    for (;;) {
      const c = cur.c + dc * LANES * (steps + 1);
      const r = cur.r + dr * LANES * (steps + 1);
      if (!inField(c, r)) {
        edge = true;
        break;
      }
      if (blockedAt(c, r)) break;
      steps += 1;
      if (steps >= 24) break;
    }
    return { steps, edge };
  };

  for (let guard = 0; guard < 8; guard += 1) {
    const options = (Object.keys(DELTA) as Dir[])
      .filter((direction) => direction !== REVERSE[dir])
      .map((direction) => ({ direction, ...room(direction) }))
      .filter((option) => option.steps > 0);
    if (!options.length) break;

    // Turn more often than not, so a pulse wanders instead of running one
    // line end to end.
    const perpendicular = options.filter((option) => option.direction !== dir);
    const pool =
      perpendicular.length > 0 && random() < 0.5 ? perpendicular : options;

    const turn = pick(pool, random);
    const wasStraight = turn.direction === dir;
    dir = turn.direction;
    const [dc, dr] = DELTA[dir];
    // A straight leg is kept short when a turn was available, so the pulse
    // keeps working the corners instead of running one line to its end.
    const run = Math.min(
      turn.steps,
      wasStraight && perpendicular.length > 0
        ? 1
        : 1 + Math.floor(random() * 3),
    );
    cur = { c: cur.c + dc * LANES * run, r: cur.r + dr * LANES * run };
    points.push(cur);
  }

  // Leave through an edge when the run ends at one, so the pulse exits the
  // frame instead of stopping mid-field.
  const last = room(dir);
  if (last.edge) {
    const [dc, dr] = DELTA[dir];
    points.push({ c: cur.c + dc * LANES, r: cur.r + dr * LANES });
  }

  if (points.length < 3) return null;

  const at = (c: number, r: number) => [c * CELL + 0.5, r * CELL + 0.5] as const;
  let length = 0;
  const d = points
    .map((point, index) => {
      const [x, y] = at(point.c, point.r);
      if (index === 0) return `M${x} ${y}`;
      const [px, py] = at(points[index - 1].c, points[index - 1].r);
      length += Math.abs(x - px) + Math.abs(y - py);
      return `L${x} ${y}`;
    })
    .join(" ");

  return { d, length };
}

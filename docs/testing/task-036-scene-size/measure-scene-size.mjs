// Task 036 (6.3): measures the saved JSON size of a panel holding the 2,000-stroke stress test.
// Run from the repository root:  node docs/testing/task-036-scene-size/measure-scene-size.mjs
// Uses Node.js built-ins only. The numbers it prints are measured, not estimated.

import { randomUUID } from 'node:crypto';

// The same panel and strokes as the Task 035 stress test (client/src/features/canvas/spike/CanvasSpike.jsx).
// A JSX file cannot be imported into plain Node, so the generator is repeated here line for line.
const PANEL_WIDTH = 800;
const PANEL_HEIGHT = 1200;
const BRUSH_COLOR = '#111111';
const BRUSH_SIZE = 4;
const STRESS_SEED = 6202;
const STRESS_STROKE_COUNT = 2000;
const STRESS_MIN_POINTS = 20;
const STRESS_MAX_POINTS = 50;
const STRESS_MAX_STEP = 12;

// Expected values for seed 6202, used to prove this is the same panel as Task 035.
const EXPECTED_POINTS = 70706;
const EXPECTED_FINGERPRINT = 571242605;

// The limit to compare against. Express (Task 8.2, '2mb') counts 1 MB as 1,048,576 bytes.
const MB = 1024 * 1024;
const REQUEST_LIMIT_BYTES = 2 * MB;

function mulberry32(seed) {
  let state = seed;
  return function next() {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function randomInt(next, min, max) {
  return min + Math.floor(next() * (max - min + 1));
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function generateStressStrokes() {
  const next = mulberry32(STRESS_SEED);
  const strokes = [];
  for (let stroke = 0; stroke < STRESS_STROKE_COUNT; stroke += 1) {
    const pointCount = randomInt(next, STRESS_MIN_POINTS, STRESS_MAX_POINTS);
    let x = randomInt(next, 0, PANEL_WIDTH);
    let y = randomInt(next, 0, PANEL_HEIGHT);
    const points = [x, y];
    for (let point = 1; point < pointCount; point += 1) {
      x = clamp(x + randomInt(next, -STRESS_MAX_STEP, STRESS_MAX_STEP), 0, PANEL_WIDTH);
      y = clamp(y + randomInt(next, -STRESS_MAX_STEP, STRESS_MAX_STEP), 0, PANEL_HEIGHT);
      points.push(x, y);
    }
    strokes.push(points);
  }
  return strokes;
}

// The same fingerprint the Task 035 browser check computed over all points, in order.
function fingerprint(strokes) {
  let sum = 0;
  for (const points of strokes) {
    for (let i = 0; i < points.length; i += 2) {
      sum = (sum * 31 + points[i] * 7 + points[i + 1]) % 1000000007;
    }
  }
  return sum;
}

const strokes = generateStressStrokes();
const pointCount = strokes.reduce((total, points) => total + points.length / 2, 0);
const allWhole = strokes.every((points) => points.every(Number.isInteger));
const print = fingerprint(strokes);

// One layer holding every stroke, in the scene format agreed in Issue #39 (D-1 to D-10).
const scene = {
  formatVersion: 1,
  width: PANEL_WIDTH,
  height: PANEL_HEIGHT,
  layers: [
    {
      id: randomUUID(),
      name: 'Layer 1',
      visible: true,
      locked: false,
      opacity: 1,
      shapes: strokes.map((points) => ({
        type: 'stroke',
        id: randomUUID(),
        tool: 'brush',
        color: BRUSH_COLOR,
        size: BRUSH_SIZE,
        opacity: 1,
        points,
      })),
    },
  ],
};

// Compact JSON, as the browser sends it to the server. Every UUID has 36 characters,
// so the byte count is the same on every run even though the ids differ.
const json = JSON.stringify(scene);
const bytes = Buffer.byteLength(json, 'utf8');
const roundTrip = JSON.stringify(JSON.parse(json)) === json;

const checks = [
  ['strokes', strokes.length, STRESS_STROKE_COUNT],
  ['points', pointCount, EXPECTED_POINTS],
  ['fingerprint', print, EXPECTED_FINGERPRINT],
];
const failed = checks.filter(([, actual, expected]) => actual !== expected);

// The scene's size as a share of a limit, for example "38.2%".
const percent = (limitBytes) => `${((bytes / limitBytes) * 100).toFixed(1)}%`;
console.log('Task 036 (6.3) scene JSON size: measured result (not an estimate)');
console.log(`Command: node docs/testing/task-036-scene-size/measure-scene-size.mjs`);
console.log(`Node.js: ${process.version}`);
console.log(`Panel: ${PANEL_WIDTH} x ${PANEL_HEIGHT}, seed ${STRESS_SEED}, 1 layer`);
for (const [name, actual, expected] of checks) {
  console.log(
    `${name}: ${actual} (expected ${expected}) ${actual === expected ? 'OK' : 'MISMATCH'}`,
  );
}
console.log(`all points are whole numbers: ${allWhole ? 'yes' : 'NO'}`);
console.log(`JSON parses back unchanged: ${roundTrip ? 'yes' : 'NO'}`);
console.log(`JSON size: ${bytes} bytes (UTF-8, compact JSON.stringify)`);
console.log(`         = ${(bytes / MB).toFixed(3)} MiB (1 MiB = 1,048,576 bytes)`);
console.log(`share of the 2 MiB save request limit (Task 8.2): ${percent(REQUEST_LIMIT_BYTES)}`);

if (failed.length > 0 || !allWhole || !roundTrip) {
  console.error('A check failed: this is not the Task 035 panel, or the JSON is not valid.');
  process.exit(1);
}

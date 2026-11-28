import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { Layer, Line, Stage } from 'react-konva';

// Temporary spike for tasks 6.1 and 6.2: proves that freehand drawing works with React-Konva,
// and measures how the canvas copes with a full panel of 2,000 strokes (stress test, Issue #36).
// It lives at /dev/canvas-spike and is replaced by the real canvas editor later in Phase 6.

// Size of one webtoon panel in pixels (800 wide, as every canvas in Toonverse).
const PANEL_WIDTH = 800;
const PANEL_HEIGHT = 1200;

// The existing brush, used for hand-drawn and generated strokes alike.
const BRUSH_COLOR = '#111111';
// Test page only: hand-drawn strokes are blue so they stay visible on top of the 2,000 dark
// stress strokes. The real editor's colours are not affected.
const DRAWN_STROKE_COLOR = '#2563EB';
const BRUSH_SIZE = 4;

// Stress test settings approved in Issue #36.
const STRESS_SEED = 6202;
const STRESS_STROKE_COUNT = 2000;
const STRESS_MIN_POINTS = 20;
const STRESS_MAX_POINTS = 50;
// Largest step between two points of a generated stroke, in pixels.
const STRESS_MAX_STEP = 12;
// Every measurement: one warm-up that is not counted, then this many counted runs.
const MEASURED_RUNS = 5;
// One redraw run times this many draws in a row and divides by it, because a single cached
// redraw can be shorter than the browser timer's smallest step.
const DRAWS_PER_BATCH = 100;
// A measured stroke with fewer valid lag samples than this is rejected and drawn again.
const MIN_LAG_SAMPLES = 60;
// A recorded stroke closes at the first paint that shows all of its points. This is only the
// safety net: if that paint has not happened this many frames after release (about 167 ms at
// 60 frames per second), the stroke closes anyway and its unpainted samples count as never painted.
const FALLBACK_FRAMES_AFTER_RELEASE = 10;

const BUTTON_CLASS = 'rounded border border-ink px-3 py-1 disabled:opacity-50';

// mulberry32: a tiny, well-known seeded random number generator. The same seed always gives
// the same numbers, so every setup is measured with exactly the same 2,000 strokes.
function mulberry32(seed) {
  let state = seed;
  return function next() {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// A whole number from min to max, both included.
function randomInt(next, min, max) {
  return min + Math.floor(next() * (max - min + 1));
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

// Builds the 2,000 test strokes: each starts at a random point and wanders in small steps,
// staying inside the panel. Points are whole numbers, as the scene format will store them.
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

function summarize(values) {
  const total = values.reduce((sum, value) => sum + value, 0);
  return { average: total / values.length, min: Math.min(...values), max: Math.max(...values) };
}

// The smallest step the browser's performance timer moves in (browsers round it for privacy).
function measureTimerStep() {
  const steps = [];
  let last = performance.now();
  while (steps.length < 20) {
    const now = performance.now();
    if (now > last) {
      steps.push(now - last);
      last = now;
    }
  }
  return Math.min(...steps);
}

// How many decimals the timer step allows: 1 for a 0.1 ms step, 3 for a 0.005 ms step.
function decimalsFor(step) {
  let decimals = 0;
  while (decimals < 6 && Math.round(step * 10 ** decimals * 1000) / 1000 < 1) decimals += 1;
  return decimals;
}

// Measured once when the page loads, so no number is shown more precisely than it was timed.
const TIMER_STEP_MS = measureTimerStep();
const TIMER_DECIMALS = decimalsFor(TIMER_STEP_MS);

// extraDecimals is only for values divided by DRAWS_PER_BATCH (100 = two more decimals).
function formatMs(value, extraDecimals = 0) {
  return `${value.toFixed(TIMER_DECIMALS + extraDecimals)} ms`;
}

function summaryText(values, extraDecimals = 0) {
  const { average, min, max } = summarize(values);
  const format = (value) => formatMs(value, extraDecimals);
  return `average ${format(average)}, min ${format(min)}, max ${format(max)}`;
}

// Timing helpers. They live outside the component because they are only ever called from
// event handlers, never while React renders the page.
function timeMs(action) {
  const start = performance.now();
  action();
  return performance.now() - start;
}

// draw() paints the layer straight away (batchDraw waits for the next frame), so it can be timed.
function timeOneRedraw(layer) {
  return timeMs(() => layer.draw());
}

// Times DRAWS_PER_BATCH draws in a row. Returns the whole batch time and the time per draw.
function timeRedrawBatch(layer) {
  const total = timeMs(() => {
    for (let draw = 0; draw < DRAWS_PER_BATCH; draw += 1) {
      layer.draw();
    }
  });
  return { total, perDraw: total / DRAWS_PER_BATCH };
}

function batchText(batch) {
  return (
    `${DRAWS_PER_BATCH} draws in ${formatMs(batch.total)} = ` +
    `${formatMs(batch.perDraw, 2)} per draw (batched average)`
  );
}

// The four approved setups: A none, B listening(false), C layer cache, D both.
function setupLetter(listeningOff, cacheOn) {
  if (listeningOff && cacheOn) return 'D';
  if (cacheOn) return 'C';
  if (listeningOff) return 'B';
  return 'A';
}

function waitFrames(count, callback) {
  if (count === 0) {
    callback();
    return;
  }
  requestAnimationFrame(() => waitFrames(count - 1, callback));
}

// The generated strokes. memo() stops React from rebuilding all 2,000 lines every time
// a hand-drawn stroke changes, so the test measures Konva's drawing, not React's work.
const StressStrokes = memo(function StressStrokes({ strokes }) {
  return strokes.map((points, index) => (
    // Generated strokes never change order, so the index is a stable key.
    <Line
      key={index}
      points={points}
      stroke={BRUSH_COLOR}
      strokeWidth={BRUSH_SIZE}
      lineCap="round"
      lineJoin="round"
    />
  ));
});

export default function CanvasSpike() {
  // Every stroke has a unique id and one flat list of points: [x1, y1, x2, y2, ...],
  // the format Konva's Line uses.
  const [lines, setLines] = useState([]);
  // A ref, not state: knowing whether the pointer is pressed must not redraw the page.
  const isDrawing = useRef(false);
  // Counts up and never resets, so a stroke id is never reused, even after "Clear my drawing".
  const nextStrokeIdRef = useRef(0);

  // Stress test state.
  const [stressStrokes, setStressStrokes] = useState([]);
  const [listeningOff, setListeningOff] = useState(false);
  const [cacheOn, setCacheOn] = useState(false);
  const [recordingLag, setRecordingLag] = useState(false);
  const [report, setReport] = useState([]);
  const stressLayerRef = useRef(null);
  const drawingLayerRef = useRef(null);

  // Lag recorder. Refs only: recording must never re-render the page while a stroke is drawn.
  const activeStrokeRef = useRef(-1);
  const activePointCountRef = useRef(0);
  // The point count the stroke has once released; its first paint showing this many closes it.
  const finalPointCountRef = useRef(0);
  // The setup letter when the stroke started, so the result is labelled with the right setup.
  const strokeSetupRef = useRef('A');
  const pendingSamplesRef = useRef([]);
  const strokeLagsRef = useRef([]);
  const mergedMovesRef = useRef(0);
  const finishingStrokeRef = useRef(null);
  const warmUpDoneRef = useRef(false);
  const lagRunsRef = useRef([]);

  const setup = setupLetter(listeningOff, cacheOn);

  // Closes one recorded stroke: rejects it, counts it as the warm-up, or adds it as a run.
  // It uses only refs and setReport, so it is safe to call from Konva's draw event.
  const finishLagRun = useCallback((strokeId, closedBy) => {
    if (finishingStrokeRef.current !== strokeId) return;
    finishingStrokeRef.current = null;
    const label = `Setup ${strokeSetupRef.current} lag`;
    const lags = strokeLagsRef.current;
    // Samples whose point was never painted are not lag samples and never count towards 60.
    const neverPainted = pendingSamplesRef.current.length;
    pendingSamplesRef.current = [];
    strokeLagsRef.current = [];
    const counts =
      `valid samples ${lags.length}, never painted ${neverPainted}, closed by: ${closedBy}, ` +
      `moves with merged readings ${mergedMovesRef.current} (diagnostic only)`;
    let newLines;
    if (lags.length < MIN_LAG_SAMPLES) {
      newLines = [
        `${label} stroke rejected: ${counts}. At least ${MIN_LAG_SAMPLES} valid samples are needed; draw it again.`,
      ];
    } else {
      const { average, max } = summarize(lags);
      const strokeText = `average ${formatMs(average)}, highest ${formatMs(max)}, ${counts}`;
      if (!warmUpDoneRef.current) {
        warmUpDoneRef.current = true;
        newLines = [`${label} warm-up (not counted): ${strokeText}`];
      } else if (lagRunsRef.current.length >= MEASURED_RUNS) {
        newLines = [`${label}: ${MEASURED_RUNS} runs are already recorded; stroke not counted.`];
      } else {
        lagRunsRef.current.push(average);
        const runNumber = lagRunsRef.current.length;
        newLines = [`${label} run ${runNumber}: ${strokeText}`];
        if (runNumber === MEASURED_RUNS) {
          newLines.push(
            `${label} summary of ${MEASURED_RUNS} stroke averages: ${summaryText(lagRunsRef.current)}`,
          );
        }
      }
    }
    setReport((current) => [...current, ...newLines]);
  }, []);

  // Match each recorded pointer move to the first frame that paints its point.
  useEffect(() => {
    const layer = drawingLayerRef.current;
    function handleDraw() {
      const pending = pendingSamplesRef.current;
      if (pending.length === 0) return;
      const paintedTime = performance.now();
      // Read what Konva has just painted from the Line itself. React state can already be
      // ahead of the canvas, so it would credit points to a frame that did not show them.
      // Konva fires this event straight after painting, so the Line cannot change in between.
      const strokeId = activeStrokeRef.current;
      const line = layer.findOne(`#stroke-${strokeId}`);
      if (!line) return;
      const paintedPointCount = line.points().length / 2;
      const stillWaiting = [];
      for (const sample of pending) {
        if (sample.strokeId === strokeId && sample.pointCount <= paintedPointCount) {
          // Both times use the page's performance clock, so they can be subtracted.
          strokeLagsRef.current.push(paintedTime - sample.inputTime);
        } else {
          stillWaiting.push(sample);
        }
      }
      pendingSamplesRef.current = stillWaiting;
      // The stroke is released and this paint shows all of its points: it ends here.
      if (
        finishingStrokeRef.current === strokeId &&
        paintedPointCount >= finalPointCountRef.current
      ) {
        finishLagRun(strokeId, 'all points painted');
      }
    }
    layer.on('draw.lag', handleDraw);
    return () => layer.off('draw.lag');
  }, [finishLagRun]);

  function addReport(newLines) {
    setReport((current) => [...current, ...newLines]);
  }

  function resetLagRuns() {
    pendingSamplesRef.current = [];
    strokeLagsRef.current = [];
    finishingStrokeRef.current = null;
    warmUpDoneRef.current = false;
    lagRunsRef.current = [];
  }

  // Changing the setup starts a fresh set of results, so numbers from two setups never mix.
  function resetMeasurements() {
    resetLagRuns();
    setReport([]);
  }

  function resetToSetupA() {
    if (cacheOn) stressLayerRef.current.clearCache();
    setCacheOn(false);
    setListeningOff(false);
    resetMeasurements();
  }

  function handleGenerate() {
    resetToSetupA();
    setStressStrokes(generateStressStrokes());
  }

  function handleClearStress() {
    resetToSetupA();
    setStressStrokes([]);
  }

  // Clears only the hand-drawn strokes: the stress strokes, the setup and the results stay.
  function handleClearDrawing() {
    if (finishingStrokeRef.current !== null) {
      finishLagRun(finishingStrokeRef.current, 'closed early by a new action');
    }
    setLines([]);
  }

  function handleListeningChange(event) {
    resetMeasurements();
    setListeningOff(event.target.checked);
  }

  function handleCacheChange(event) {
    const layer = stressLayerRef.current;
    resetMeasurements();
    if (event.target.checked) {
      // Building the cache is a one-time cost, recorded apart from the redraw times.
      const cacheCost = timeMs(() => layer.cache());
      // Konva builds the cached hit canvas only on the first hit draw after cache(), so the
      // first draw is timed too: with listening on, it includes building that hit cache.
      const firstDraw = timeOneRedraw(layer);
      const letter = setupLetter(listeningOff, true);
      setCacheOn(true);
      addReport([
        `Setup ${letter} layer cache() took ${formatMs(cacheCost)} (one-time cost)`,
        `Setup ${letter} first draw after caching took ${formatMs(firstDraw)} (one-time cost; ` +
          `includes building the hit cache when listening is on)`,
      ]);
    } else {
      layer.clearCache();
      setCacheOn(false);
      layer.batchDraw();
    }
  }

  function handleRecordingChange(event) {
    resetLagRuns();
    setRecordingLag(event.target.checked);
  }

  function handleMeasureRedraw() {
    const layer = stressLayerRef.current;
    const warmUp = timeRedrawBatch(layer);
    const batches = [];
    for (let run = 0; run < MEASURED_RUNS; run += 1) {
      batches.push(timeRedrawBatch(layer));
    }
    const perDrawValues = batches.map((batch) => batch.perDraw);
    addReport([
      `Setup ${setup} redraw warm-up batch (not counted): ${batchText(warmUp)}`,
      ...batches.map(
        (batch, index) => `Setup ${setup} redraw batch ${index + 1}: ${batchText(batch)}`,
      ),
      `Setup ${setup} redraw summary of ${MEASURED_RUNS} batches, per-draw batched average: ` +
        summaryText(perDrawValues, 2),
    ]);
  }

  // Pointer events cover the mouse, touch and pen with one set of handlers.
  function handlePointerDown(event) {
    isDrawing.current = true;
    const { x, y } = event.target.getStage().getPointerPosition();
    const id = nextStrokeIdRef.current;
    nextStrokeIdRef.current += 1;
    if (recordingLag) {
      // Close the previous stroke first if it is still waiting for its last paint.
      if (finishingStrokeRef.current !== null) {
        finishLagRun(finishingStrokeRef.current, 'closed early by a new action');
      }
      activeStrokeRef.current = id;
      activePointCountRef.current = 1;
      strokeSetupRef.current = setup;
      pendingSamplesRef.current = [];
      strokeLagsRef.current = [];
      mergedMovesRef.current = 0;
    }
    // Start a new stroke at the pointer position.
    setLines((current) => [...current, { id, points: [x, y] }]);
  }

  function handlePointerMove(event) {
    if (!isDrawing.current) return;
    const { x, y } = event.target.getStage().getPointerPosition();
    if (recordingLag) {
      // The stroke will show this many points once this move is painted.
      activePointCountRef.current += 1;
      pendingSamplesRef.current.push({
        strokeId: activeStrokeRef.current,
        pointCount: activePointCountRef.current,
        inputTime: event.evt.timeStamp,
      });
      // Diagnostic only: does the browser merge several pointer readings into this event?
      // This call adds a very small cost to every recorded move, the same in setups A-D.
      const merged = event.evt.getCoalescedEvents ? event.evt.getCoalescedEvents().length : 0;
      if (merged > 1) mergedMovesRef.current += 1;
    }
    // Add the new point to the last stroke only; earlier strokes stay unchanged.
    setLines((current) => {
      const last = current[current.length - 1];
      return [...current.slice(0, -1), { ...last, points: [...last.points, x, y] }];
    });
  }

  // Releasing the pointer, or leaving the canvas, finishes the current stroke.
  function finishStroke() {
    if (!isDrawing.current) return;
    isDrawing.current = false;
    if (recordingLag) {
      const strokeId = activeStrokeRef.current;
      finishingStrokeRef.current = strokeId;
      finalPointCountRef.current = activePointCountRef.current;
      if (pendingSamplesRef.current.length === 0) {
        // Every point is already painted, so the confirming paint has already happened.
        finishLagRun(strokeId, 'all points painted');
        return;
      }
      // Normally the draw event closes the stroke first; this is only the safety net.
      waitFrames(FALLBACK_FRAMES_AFTER_RELEASE, () =>
        finishLagRun(strokeId, `safety net after ${FALLBACK_FRAMES_AFTER_RELEASE} frames`),
      );
    }
  }

  const hasStressStrokes = stressStrokes.length > 0;
  const header = [
    `Setup ${setup} | seed ${STRESS_SEED} | stress strokes ${stressStrokes.length} | ` +
      `devicePixelRatio ${window.devicePixelRatio} | window ${window.innerWidth} x ${window.innerHeight}`,
    `Timer step ${TIMER_STEP_MS.toFixed(3)} ms, so single timings use ${TIMER_DECIMALS} decimal(s).`,
    'Redraw = main-thread time to issue the canvas drawing commands (not GPU completion or display),',
    `timed as batches of ${DRAWS_PER_BATCH} draws; "per draw" is a batched average, not one timed draw.`,
    'Lag = input to canvas paint (not display); includes a small getCoalescedEvents() diagnostic cost.',
  ];

  return (
    <main className="min-h-screen bg-paper p-4 text-ink">
      <h1 className="text-xl font-bold">Canvas spike (tasks 6.1 and 6.2)</h1>
      <p className="mb-4 text-sm">Press and drag to draw. This page is temporary.</p>

      <section className="mb-4 flex max-w-3xl flex-col gap-2 text-sm">
        <div className="flex flex-wrap gap-2">
          <button type="button" className={BUTTON_CLASS} onClick={handleGenerate}>
            Generate 2,000 strokes
          </button>
          <button
            type="button"
            className={BUTTON_CLASS}
            onClick={handleClearStress}
            disabled={!hasStressStrokes}
          >
            Clear stress strokes
          </button>
          <button type="button" className={BUTTON_CLASS} onClick={handleClearDrawing}>
            Clear my drawing
          </button>
          <button
            type="button"
            className={BUTTON_CLASS}
            onClick={handleMeasureRedraw}
            disabled={!hasStressStrokes}
          >
            Measure redraw
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-1">
            <input
              type="checkbox"
              checked={listeningOff}
              onChange={handleListeningChange}
              disabled={!hasStressStrokes}
            />
            listening(false)
          </label>
          <label className="flex items-center gap-1">
            <input
              type="checkbox"
              checked={cacheOn}
              onChange={handleCacheChange}
              disabled={!hasStressStrokes}
            />
            Layer cache
          </label>
          <label className="flex items-center gap-1">
            <input type="checkbox" checked={recordingLag} onChange={handleRecordingChange} />
            Record drawing lag
          </label>
          <strong>Setup {setup}</strong>
        </div>
        <p>
          Test order A, C, B, D: turn the layer cache on last. Press &quot;Clear my drawing&quot;
          before every stroke. &quot;Measure redraw&quot; runs 600 draws, so the page can freeze for
          a few seconds without the cache.
        </p>
        {/* Plain text, so the results can be copied into the decision log exactly as measured. */}
        <textarea
          readOnly
          aria-label="Stress test results"
          className="h-48 w-full border border-ink bg-white p-2 font-mono text-xs"
          value={[...header, ...report].join('\n')}
        />
      </section>

      {/* touch-none stops the page from scrolling while drawing with a finger. */}
      <div className="inline-block touch-none border border-ink bg-white">
        <Stage
          width={PANEL_WIDTH}
          height={PANEL_HEIGHT}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={finishStroke}
          onPointerLeave={finishStroke}
        >
          {/* Stress layer: the 2,000 generated strokes, which setups B-D optimise. */}
          <Layer ref={stressLayerRef} listening={!listeningOff}>
            <StressStrokes strokes={stressStrokes} />
          </Layer>
          {/* Drawing layer: hand-drawn strokes, exactly as in task 6.1. */}
          <Layer ref={drawingLayerRef}>
            {lines.map((line) => (
              // The unique id is the key, and lets the lag recorder find the stroke Konva has just painted.
              <Line
                key={line.id}
                id={`stroke-${line.id}`}
                points={line.points}
                stroke={DRAWN_STROKE_COLOR}
                strokeWidth={BRUSH_SIZE}
                lineCap="round"
                lineJoin="round"
              />
            ))}
          </Layer>
        </Stage>
      </div>
    </main>
  );
}

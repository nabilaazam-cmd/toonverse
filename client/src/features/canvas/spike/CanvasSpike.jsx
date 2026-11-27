import { useRef, useState } from 'react';
import { Layer, Line, Stage } from 'react-konva';

// Temporary spike for task 6.1: proves that freehand drawing works with React-Konva.
// It lives at /dev/canvas-spike and is replaced by the real canvas editor later in Phase 6.

// Size of one webtoon panel in pixels (800 wide, as every canvas in Toonverse).
const PANEL_WIDTH = 800;
const PANEL_HEIGHT = 1200;

export default function CanvasSpike() {
  // Every stroke is one flat list of points: [x1, y1, x2, y2, ...], the format Konva's Line uses.
  const [lines, setLines] = useState([]);
  // A ref, not state: knowing whether the pointer is pressed must not redraw the page.
  const isDrawing = useRef(false);

  // Pointer events cover the mouse, touch and pen with one set of handlers.
  function handlePointerDown(event) {
    isDrawing.current = true;
    const { x, y } = event.target.getStage().getPointerPosition();
    // Start a new stroke at the pointer position.
    setLines((current) => [...current, [x, y]]);
  }

  function handlePointerMove(event) {
    if (!isDrawing.current) return;
    const { x, y } = event.target.getStage().getPointerPosition();
    // Add the new point to the last stroke only; earlier strokes stay unchanged.
    setLines((current) => {
      const last = current[current.length - 1];
      return [...current.slice(0, -1), [...last, x, y]];
    });
  }

  // Releasing the pointer, or leaving the canvas, finishes the current stroke.
  function finishStroke() {
    isDrawing.current = false;
  }

  return (
    <main className="min-h-screen bg-paper p-4 text-ink">
      <h1 className="text-xl font-bold">Canvas spike (task 6.1)</h1>
      <p className="mb-4 text-sm">Press and drag to draw. This page is temporary.</p>
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
          <Layer>
            {lines.map((points, index) => (
              // Strokes are only ever added, never reordered, so the index is a stable key.
              <Line
                key={index}
                points={points}
                stroke="#111111"
                strokeWidth={4}
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

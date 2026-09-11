import type { GraphConfig, Point, SafeFunctionSpec } from './types';

export const normalizeGraphConfig = (partial: Partial<GraphConfig> = {}): GraphConfig => ({
  x: partial.x ?? 140,
  y: partial.y ?? 90,
  width: partial.width ?? 820,
  height: partial.height ?? 540,
  xMin: partial.xMin ?? -5,
  xMax: partial.xMax ?? 5,
  yMin: partial.yMin ?? -5,
  yMax: partial.yMax ?? 5,
  xStep: partial.xStep ?? 1,
  yStep: partial.yStep ?? 1,
  xLabel: partial.xLabel ?? 'x',
  yLabel: partial.yLabel ?? 'y',
});

export const mathToCanvas = (graph: GraphConfig, xValue: number, yValue: number): Point => {
  const xRatio = (xValue - graph.xMin) / (graph.xMax - graph.xMin || 1);
  const yRatio = (yValue - graph.yMin) / (graph.yMax - graph.yMin || 1);
  return {
    x: graph.x + xRatio * graph.width,
    y: graph.y + graph.height - yRatio * graph.height,
  };
};

export const canvasToMath = (graph: GraphConfig, point: Point): Point => ({
  x: graph.xMin + ((point.x - graph.x) / graph.width) * (graph.xMax - graph.xMin),
  y: graph.yMin + ((graph.y + graph.height - point.y) / graph.height) * (graph.yMax - graph.yMin),
});

export const evaluateSafeFunction = (fn: SafeFunctionSpec, x: number) => {
  if (fn.kind === 'linear') return fn.m * x + fn.b;
  return fn.a * x * x + fn.b * x + fn.c;
};

export const sampleSafeFunction = (
  graph: GraphConfig,
  fn: SafeFunctionSpec,
  domain = { min: graph.xMin, max: graph.xMax },
  samples = 96,
): Point[] => {
  const count = Math.max(8, Math.min(240, Math.round(samples)));
  const min = Math.max(graph.xMin, Math.min(domain.min, domain.max));
  const max = Math.min(graph.xMax, Math.max(domain.min, domain.max));
  const points: Point[] = [];
  for (let index = 0; index <= count; index += 1) {
    const x = min + ((max - min) * index) / count;
    const y = evaluateSafeFunction(fn, x);
    if (Number.isFinite(y) && y >= graph.yMin - 0.5 && y <= graph.yMax + 0.5) {
      points.push(mathToCanvas(graph, x, y));
    }
  }
  return points;
};

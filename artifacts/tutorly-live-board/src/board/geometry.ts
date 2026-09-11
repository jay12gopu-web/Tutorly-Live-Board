import type { AnyBoardObject, Point } from './types';

export const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);

export const angleOf = (center: Point, point: Point) =>
  Math.atan2(point.y - center.y, point.x - center.x) * 180 / Math.PI;

export const polarPoint = (center: Point, radius: number, angle: number): Point => {
  const radians = angle * Math.PI / 180;
  return { x: center.x + radius * Math.cos(radians), y: center.y + radius * Math.sin(radians) };
};

export const arcPath = (cx: number, cy: number, r: number, startAngle: number, endAngle: number) => {
  const start = polarPoint({ x: cx, y: cy }, r, endAngle);
  const end = polarPoint({ x: cx, y: cy }, r, startAngle);
  const largeArc = Math.abs(endAngle - startAngle) > 180 ? 1 : 0;
  const sweep = endAngle > startAngle ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} ${sweep} ${end.x} ${end.y}`;
};

const pointToSegmentDistance = (point: Point, a: Point, b: Point) => {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lengthSquared = dx * dx + dy * dy;
  if (lengthSquared === 0) return distance(point, a);
  const t = Math.max(0, Math.min(1, ((point.x - a.x) * dx + (point.y - a.y) * dy) / lengthSquared));
  return distance(point, { x: a.x + t * dx, y: a.y + t * dy });
};

export const hitTest = (object: AnyBoardObject, point: Point, tolerance = 14) => {
  const c: any = object.coordinates;
  if (object.type === 'point') return distance(point, c) <= tolerance + 5;
  if (object.type === 'line' || object.type === 'arrow') {
    return pointToSegmentDistance(point, { x: c.x1, y: c.y1 }, { x: c.x2, y: c.y2 }) <= tolerance;
  }
  if (object.type === 'ray') {
    const endpoint = { x: c.x1 + (c.x2 - c.x1) * 100, y: c.y1 + (c.y2 - c.y1) * 100 };
    return pointToSegmentDistance(point, { x: c.x1, y: c.y1 }, endpoint) <= tolerance;
  }
  if (object.type === 'circle') return Math.abs(distance(point, { x: c.cx, y: c.cy }) - c.r) <= tolerance;
  if (object.type === 'arc') {
    const radialDistance = Math.abs(distance(point, { x: c.cx, y: c.cy }) - c.r);
    const pointAngle = (angleOf({ x: c.cx, y: c.cy }, point) + 360) % 360;
    const start = (c.startAngle + 360) % 360;
    const end = (c.endAngle + 360) % 360;
    const inSweep = c.startAngle <= c.endAngle ? pointAngle >= start && pointAngle <= end : pointAngle >= start || pointAngle <= end;
    return radialDistance <= tolerance && inSweep;
  }
  if (object.type === 'rectangle') {
    const insideX = point.x >= c.x - tolerance && point.x <= c.x + c.width + tolerance;
    const insideY = point.y >= c.y - tolerance && point.y <= c.y + c.height + tolerance;
    const nearEdge = Math.min(Math.abs(point.x - c.x), Math.abs(point.x - (c.x + c.width)), Math.abs(point.y - c.y), Math.abs(point.y - (c.y + c.height))) <= tolerance;
    return insideX && insideY && nearEdge;
  }
  if (object.type === 'text' || object.type === 'equation') {
    return Math.abs(point.x - c.x) < Math.max(40, c.text.length * 8) && Math.abs(point.y - c.y) < 25;
  }
  if (object.type === 'path' || object.type === 'highlight') {
    return c.points.some((p: Point, index: number) => index > 0 && pointToSegmentDistance(point, c.points[index - 1], p) <= tolerance);
  }
  return false;
};

export const translateObject = (object: AnyBoardObject, dx: number, dy: number): AnyBoardObject => {
  const next = { ...object, coordinates: { ...object.coordinates } } as AnyBoardObject;
  if (next.type === 'point' || next.type === 'text' || next.type === 'equation') {
    next.coordinates.x += dx;
    next.coordinates.y += dy;
  } else if (next.type === 'line' || next.type === 'ray' || next.type === 'arrow') {
    next.coordinates.x1 += dx;
    next.coordinates.y1 += dy;
    next.coordinates.x2 += dx;
    next.coordinates.y2 += dy;
  } else if (next.type === 'circle' || next.type === 'arc') {
    next.coordinates.cx += dx;
    next.coordinates.cy += dy;
  } else if (next.type === 'rectangle' || next.type === 'axes' || next.type === 'graph') {
    next.coordinates.x += dx;
    next.coordinates.y += dy;
  } else if (next.type === 'path' || next.type === 'highlight') {
    next.coordinates.points = next.coordinates.points.map((p) => ({ x: p.x + dx, y: p.y + dy }));
  }
  return next;
};
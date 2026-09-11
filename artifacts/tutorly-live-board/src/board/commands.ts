import type { AnyBoardObject, BoardCommand, BoardState, BoardStyle, CreatedBy, FocusArea, GraphConfig } from './types';
import { mathToCanvas, normalizeGraphConfig, sampleSafeFunction } from './graph';
import { translateObject } from './geometry';

let idCounter = 0;
const nextId = (type: string) => `${type}-${Date.now().toString(36)}-${(++idCounter).toString(36)}`;

const defaults = (type: string, createdBy: CreatedBy, label: string, animation?: any, style?: BoardStyle): any => ({
  id: nextId(type),
  type,
  createdBy,
  layer: createdBy === 'tutorly' ? 'TutorlyLayer' : 'StudentLayer',
  label,
  stroke: style?.stroke ?? (createdBy === 'tutorly' ? '#6874e8' : '#45979b'),
  strokeWidth: style?.strokeWidth ?? (type === 'highlight' ? 15 : 2.5),
  opacity: style?.opacity ?? (type === 'highlight' ? .28 : 1),
  animation,
});

const animationFor = (type: string, createdBy: CreatedBy, kind?: any) =>
  createdBy === 'tutorly'
    ? { kind: kind ?? (type === 'arc' ? 'arc' : type === 'point' ? 'point' : type === 'text' || type === 'equation' ? 'label' : type === 'highlight' ? 'highlight' : type === 'path' ? 'plot' : 'line'), duration: type === 'point' ? 450 : 950 }
    : undefined;

const boundsFor = (objects: AnyBoardObject[], area?: FocusArea) => {
  if (area) return area;
  if (!objects.length) return { x: 0, y: 0, width: 1200, height: 760 };
  const xs: number[] = [];
  const ys: number[] = [];
  objects.forEach((object) => {
    const c: any = object.coordinates;
    if (object.type === 'point' || object.type === 'text' || object.type === 'equation') { xs.push(c.x); ys.push(c.y); }
    else if (object.type === 'line' || object.type === 'ray' || object.type === 'arrow') { xs.push(c.x1, c.x2); ys.push(c.y1, c.y2); }
    else if (object.type === 'circle' || object.type === 'arc') { xs.push(c.cx - c.r, c.cx + c.r); ys.push(c.cy - c.r, c.cy + c.r); }
    else if (object.type === 'rectangle' || object.type === 'axes' || object.type === 'graph') { xs.push(c.x, c.x + c.width); ys.push(c.y, c.y + c.height); }
    else if (object.type === 'path' || object.type === 'highlight') { c.points.forEach((p: any) => { xs.push(p.x); ys.push(p.y); }); }
  });
  if (!xs.length || !ys.length) return { x: 0, y: 0, width: 1200, height: 760 };
  return { x: Math.min(...xs), y: Math.min(...ys), width: Math.max(...xs) - Math.min(...xs), height: Math.max(...ys) - Math.min(...ys) };
};

export class BoardCommandEngine {
  private state: BoardState;

  constructor(initialState?: Partial<BoardState>) {
    this.state = { objects: initialState?.objects ?? [], viewport: initialState?.viewport ?? { zoom: 1, panX: 0, panY: 0 } };
  }

  getState(): BoardState {
    return { objects: [...this.state.objects], viewport: { ...this.state.viewport } };
  }

  setState(state: BoardState) {
    this.state = { objects: [...state.objects], viewport: { ...state.viewport } };
    return this.getState();
  }

  private append(object: AnyBoardObject) {
    this.state.objects = [...this.state.objects, object];
  }

  private appendLine(x1: number, y1: number, x2: number, y2: number, createdBy: CreatedBy, label = 'line', style?: BoardStyle, animation = true) {
    this.append({
      ...defaults('line', createdBy, label, animation ? animationFor('line', createdBy) : undefined, style),
      coordinates: { x1, y1, x2, y2 },
    } as AnyBoardObject);
  }

  execute(command: BoardCommand): BoardState {
    const payload = (command as any).payload;
    switch (command.type) {
      case 'draw_point': {
        const createdBy = payload.createdBy ?? 'student';
        this.append({ ...defaults('point', createdBy, payload.label ?? 'Point', animationFor('point', createdBy), payload.style), coordinates: { x: payload.x, y: payload.y } } as AnyBoardObject);
        break;
      }
      case 'draw_line':
      case 'draw_ray':
      case 'draw_arrow': {
        const createdBy = payload.createdBy ?? 'student';
        const type = command.type.replace('draw_', '');
        this.append({ ...defaults(type, createdBy, payload.label ?? type, animationFor(type, createdBy), payload.style), coordinates: { x1: payload.x1, y1: payload.y1, x2: payload.x2, y2: payload.y2 } } as AnyBoardObject);
        break;
      }
      case 'draw_circle': {
        const createdBy = payload.createdBy ?? 'student';
        this.append({ ...defaults('circle', createdBy, payload.label ?? 'Circle', animationFor('circle', createdBy), payload.style), coordinates: { cx: payload.cx, cy: payload.cy, r: payload.r } } as AnyBoardObject);
        break;
      }
      case 'draw_arc': {
        const createdBy = payload.createdBy ?? 'student';
        this.append({ ...defaults('arc', createdBy, payload.label ?? 'Arc', animationFor('arc', createdBy), payload.style), coordinates: { cx: payload.cx, cy: payload.cy, r: payload.r, startAngle: payload.startAngle, endAngle: payload.endAngle } } as AnyBoardObject);
        break;
      }
      case 'draw_rectangle': {
        const createdBy = payload.createdBy ?? 'student';
        this.append({ ...defaults('rectangle', createdBy, payload.label ?? 'Rectangle', animationFor('rectangle', createdBy), payload.style), coordinates: { x: payload.x, y: payload.y, width: payload.width, height: payload.height } } as AnyBoardObject);
        break;
      }
      case 'draw_text': {
        const createdBy = payload.createdBy ?? 'student';
        const type = payload.equation ? 'equation' : 'text';
        this.append({ ...defaults(type, createdBy, payload.text, animationFor(type, createdBy), payload.style), coordinates: { x: payload.x, y: payload.y, text: payload.text, fontSize: payload.fontSize ?? 18 } } as AnyBoardObject);
        break;
      }
      case 'draw_axes':
      case 'draw_graph': {
        const p = payload ?? {};
        const createdBy = p.createdBy ?? 'student';
        const type = command.type.replace('draw_', '');
        const graph = normalizeGraphConfig(p);
        this.append({ ...defaults(type, createdBy, type, animationFor(type, createdBy, 'plot'), p.style), coordinates: { ...graph, step: p.step } } as AnyBoardObject);
        break;
      }
      case 'plot_point': {
        const createdBy = payload.createdBy ?? 'tutorly';
        const point = mathToCanvas(payload.graph, payload.xValue, payload.yValue);
        const label = payload.label ?? `(${payload.xValue}, ${payload.yValue})`;
        this.append({ ...defaults('point', createdBy, label, animationFor('point', createdBy), payload.style), coordinates: point } as AnyBoardObject);
        break;
      }
      case 'plot_function': {
        const createdBy = payload.createdBy ?? 'tutorly';
        const points = sampleSafeFunction(payload.graph, payload.fn, payload.domain, payload.samples);
        this.append({ ...defaults('path', createdBy, payload.label ?? 'function', animationFor('path', createdBy, 'plot'), payload.style), coordinates: { points } } as AnyBoardObject);
        break;
      }
      case 'draw_number_line': {
        const createdBy = payload.createdBy ?? 'tutorly';
        const min = Math.min(payload.min, payload.max);
        const max = Math.max(payload.min, payload.max);
        const step = Math.max(0.0001, payload.step ?? 1);
        const valueToX = (value: number) => payload.x + ((value - min) / (max - min || 1)) * payload.width;
        this.appendLine(payload.x, payload.y, payload.x + payload.width, payload.y, createdBy, payload.label ?? 'number line', payload.style);
        const count = Math.min(40, Math.floor((max - min) / step));
        for (let i = 0; i <= count; i += 1) {
          const value = min + i * step;
          if (value > max + 1e-8) break;
          const x = valueToX(value);
          this.appendLine(x, payload.y - 11, x, payload.y + 11, createdBy, 'tick', { stroke: '#9298b8', strokeWidth: 1.5 }, false);
          this.append({ ...defaults('text', createdBy, String(Number(value.toFixed(6))), animationFor('text', createdBy), { stroke: '#6f7598' }), coordinates: { x: x - 7, y: payload.y + 36, text: String(Number(value.toFixed(6))), fontSize: 14 } } as AnyBoardObject);
        }
        if (payload.interval) {
          const from = Math.max(min, Math.min(max, payload.interval.from));
          const to = Math.max(min, Math.min(max, payload.interval.to));
          const x1 = valueToX(Math.min(from, to));
          const x2 = valueToX(Math.max(from, to));
          this.appendLine(x1, payload.y, x2, payload.y, createdBy, 'solution interval', { stroke: '#6874e8', strokeWidth: 8, opacity: .86 });
          const leftValue = Math.min(from, to);
          const rightValue = Math.max(from, to);
          const leftClosed = from <= to ? payload.interval.fromClosed : payload.interval.toClosed;
          const rightClosed = from <= to ? payload.interval.toClosed : payload.interval.fromClosed;
          if (leftClosed) this.append({ ...defaults('point', createdBy, String(leftValue), animationFor('point', createdBy), { stroke: '#6874e8' }), coordinates: { x: x1, y: payload.y } } as AnyBoardObject);
          else this.append({ ...defaults('circle', createdBy, String(leftValue), animationFor('circle', createdBy), { stroke: '#6874e8', strokeWidth: 3 }), coordinates: { cx: x1, cy: payload.y, r: 8 } } as AnyBoardObject);
          if (rightClosed) this.append({ ...defaults('point', createdBy, String(rightValue), animationFor('point', createdBy), { stroke: '#6874e8' }), coordinates: { x: x2, y: payload.y } } as AnyBoardObject);
          else this.append({ ...defaults('circle', createdBy, String(rightValue), animationFor('circle', createdBy), { stroke: '#6874e8', strokeWidth: 3 }), coordinates: { cx: x2, cy: payload.y, r: 8 } } as AnyBoardObject);
        }
        break;
      }
      case 'highlight':
      case 'draw_path': {
        const createdBy = payload.createdBy ?? 'student';
        const type = command.type === 'highlight' ? 'highlight' : 'path';
        this.append({ ...defaults(type, createdBy, payload.label ?? command.type, animationFor(type, createdBy), payload.style), coordinates: { points: payload.points } } as AnyBoardObject);
        break;
      }
      case 'move_object':
        this.state.objects = this.state.objects.map((object) => object.id === payload.id ? translateObject(object, payload.dx, payload.dy) : object);
        break;
      case 'delete_object':
        this.state.objects = this.state.objects.filter((object) => object.id !== payload.id);
        break;
      case 'clear_board':
        this.state.objects = [];
        break;
      case 'clear_student_layer':
        this.state.objects = this.state.objects.filter((object) => object.createdBy !== 'student');
        break;
      case 'zoom_to':
        this.state.viewport = { ...this.state.viewport, ...payload, zoom: Math.max(.55, Math.min(2.4, payload.zoom ?? this.state.viewport.zoom)) };
        break;
      case 'focus_objects': {
        const selected = payload.objectIds?.length ? this.state.objects.filter((object) => payload.objectIds?.includes(object.id)) : this.state.objects;
        const bounds = boundsFor(selected, payload.area);
        const padding = payload.padding ?? bounds.padding ?? 90;
        const width = Math.max(80, bounds.width) + padding * 2;
        const height = Math.max(80, bounds.height) + padding * 2;
        const zoom = Math.max(.55, Math.min(2.4, Math.min(1200 / width, 760 / height) * .82));
        this.state.viewport = { zoom, panX: 600 - (bounds.x + bounds.width / 2) * zoom, panY: 380 - (bounds.y + bounds.height / 2) * zoom };
        break;
      }
    }
    return this.getState();
  }
}

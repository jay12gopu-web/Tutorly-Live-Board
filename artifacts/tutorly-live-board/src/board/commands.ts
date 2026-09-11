import type { AnyBoardObject, BoardCommand, BoardState, CreatedBy, FocusArea } from './types';
import { translateObject } from './geometry';

let idCounter = 0;
const nextId = (type: string) => `${type}-${Date.now().toString(36)}-${(++idCounter).toString(36)}`;

const defaults = (type: string, createdBy: CreatedBy, label: string, animation?: any): any => ({
  id: nextId(type), type, createdBy, layer: createdBy === 'tutorly' ? 'TutorlyLayer' : 'StudentLayer', label, stroke: createdBy === 'tutorly' ? '#6874e8' : '#45979b',
  strokeWidth: type === 'highlight' ? 15 : 2.5, opacity: type === 'highlight' ? .28 : 1,
  animation,
});

const animationFor = (type: string, createdBy: CreatedBy, kind?: any) =>
  createdBy === 'tutorly' ? { kind: kind ?? (type === 'arc' ? 'arc' : type === 'point' ? 'point' : type === 'text' || type === 'equation' ? 'label' : type === 'highlight' ? 'highlight' : 'line'), duration: type === 'point' ? 450 : 950 } : undefined;

const boundsFor = (objects: AnyBoardObject[], area?: FocusArea) => {
  if (area) return area;
  if (!objects.length) return { x: 0, y: 0, width: 1200, height: 760 };
  const xs: number[] = [], ys: number[] = [];
  objects.forEach((object) => {
    const c: any = object.coordinates;
    if (object.type === 'point' || object.type === 'text' || object.type === 'equation') { xs.push(c.x); ys.push(c.y); }
    else if (object.type === 'line' || object.type === 'ray' || object.type === 'arrow') { xs.push(c.x1, c.x2); ys.push(c.y1, c.y2); }
    else if (object.type === 'circle' || object.type === 'arc') { xs.push(c.cx - c.r, c.cx + c.r); ys.push(c.cy - c.r, c.cy + c.r); }
    else if (object.type === 'rectangle' || object.type === 'axes' || object.type === 'graph') { xs.push(c.x, c.x + c.width); ys.push(c.y, c.y + c.height); }
    else if (object.type === 'path' || object.type === 'highlight') { c.points.forEach((p: any) => { xs.push(p.x); ys.push(p.y); }); }
  });
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

  execute(command: BoardCommand): BoardState {
    const payload = (command as any).payload;
    switch (command.type) {
      case 'draw_point':
        this.state.objects = [...this.state.objects, { ...defaults('point', payload.createdBy ?? 'student', payload.label ?? 'Point', animationFor('point', payload.createdBy ?? 'student')), coordinates: { x: payload.x, y: payload.y } }];
        break;
      case 'draw_line':
      case 'draw_ray':
      case 'draw_arrow':
         this.state.objects = [...this.state.objects, { ...defaults(command.type.replace('draw_', ''), payload.createdBy ?? 'student', payload.label ?? command.type.replace('draw_', ''), animationFor(command.type.replace('draw_', ''), payload.createdBy ?? 'student')), coordinates: { x1: payload.x1, y1: payload.y1, x2: payload.x2, y2: payload.y2 } }];
        break;
      case 'draw_circle':
         this.state.objects = [...this.state.objects, { ...defaults('circle', payload.createdBy ?? 'student', payload.label ?? 'Circle', animationFor('circle', payload.createdBy ?? 'student')), coordinates: { cx: payload.cx, cy: payload.cy, r: payload.r } }];
        break;
      case 'draw_arc':
         this.state.objects = [...this.state.objects, { ...defaults('arc', payload.createdBy ?? 'student', payload.label ?? 'Arc', animationFor('arc', payload.createdBy ?? 'student')), coordinates: { cx: payload.cx, cy: payload.cy, r: payload.r, startAngle: payload.startAngle, endAngle: payload.endAngle } }];
        break;
      case 'draw_rectangle':
         this.state.objects = [...this.state.objects, { ...defaults('rectangle', payload.createdBy ?? 'student', payload.label ?? 'Rectangle'), coordinates: { x: payload.x, y: payload.y, width: payload.width, height: payload.height } }];
        break;
      case 'draw_text':
         this.state.objects = [...this.state.objects, { ...defaults(payload.equation ? 'equation' : 'text', payload.createdBy ?? 'student', payload.text, animationFor(payload.equation ? 'equation' : 'text', payload.createdBy ?? 'student')), coordinates: { x: payload.x, y: payload.y, text: payload.text, fontSize: payload.fontSize ?? 18 } }];
        break;
      case 'draw_axes':
      case 'draw_graph': {
        const p = payload ?? {};
         this.state.objects = [...this.state.objects, { ...defaults(command.type.replace('draw_', ''), p.createdBy ?? 'student', command.type.replace('draw_', ''), animationFor(command.type.replace('draw_', ''), p.createdBy ?? 'student', 'plot')), coordinates: { x: p.x ?? 110, y: p.y ?? 90, width: p.width ?? 920, height: p.height ?? 560, step: p.step ?? 40 } }];
        break;
      }
      case 'highlight':
      case 'draw_path':
         this.state.objects = [...this.state.objects, { ...defaults(command.type === 'highlight' ? 'highlight' : 'path', payload.createdBy ?? 'student', payload.label ?? command.type, animationFor(command.type === 'highlight' ? 'highlight' : 'path', payload.createdBy ?? 'student')), coordinates: { points: payload.points } }];
        break;
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
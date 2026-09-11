import type { AnyBoardObject, BoardCommand, BoardState, CreatedBy } from './types';
import { translateObject } from './geometry';

let idCounter = 0;
const nextId = (type: string) => `${type}-${Date.now().toString(36)}-${(++idCounter).toString(36)}`;

const defaults = (type: string, createdBy: CreatedBy, label: string): any => ({
  id: nextId(type), type, createdBy, label, stroke: createdBy === 'tutorly' ? '#6874e8' : '#45979b',
  strokeWidth: type === 'highlight' ? 15 : 2.5, opacity: type === 'highlight' ? .28 : 1,
});

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
        this.state.objects = [...this.state.objects, { ...defaults('point', payload.createdBy ?? 'student', payload.label ?? 'Point'), coordinates: { x: payload.x, y: payload.y } }];
        break;
      case 'draw_line':
      case 'draw_ray':
      case 'draw_arrow':
        this.state.objects = [...this.state.objects, { ...defaults(command.type.replace('draw_', ''), payload.createdBy ?? 'student', payload.label ?? command.type.replace('draw_', '')), coordinates: { x1: payload.x1, y1: payload.y1, x2: payload.x2, y2: payload.y2 } }];
        break;
      case 'draw_circle':
        this.state.objects = [...this.state.objects, { ...defaults('circle', payload.createdBy ?? 'student', payload.label ?? 'Circle'), coordinates: { cx: payload.cx, cy: payload.cy, r: payload.r } }];
        break;
      case 'draw_arc':
        this.state.objects = [...this.state.objects, { ...defaults('arc', payload.createdBy ?? 'student', payload.label ?? 'Arc'), coordinates: { cx: payload.cx, cy: payload.cy, r: payload.r, startAngle: payload.startAngle, endAngle: payload.endAngle } }];
        break;
      case 'draw_rectangle':
        this.state.objects = [...this.state.objects, { ...defaults('rectangle', payload.createdBy ?? 'student', payload.label ?? 'Rectangle'), coordinates: { x: payload.x, y: payload.y, width: payload.width, height: payload.height } }];
        break;
      case 'draw_text':
        this.state.objects = [...this.state.objects, { ...defaults(payload.equation ? 'equation' : 'text', payload.createdBy ?? 'student', payload.text), coordinates: { x: payload.x, y: payload.y, text: payload.text, fontSize: payload.fontSize ?? 18 } }];
        break;
      case 'draw_axes':
      case 'draw_graph': {
        const p = payload ?? {};
        this.state.objects = [...this.state.objects, { ...defaults(command.type.replace('draw_', ''), p.createdBy ?? 'student', command.type.replace('draw_', '')), coordinates: { x: p.x ?? 110, y: p.y ?? 90, width: p.width ?? 920, height: p.height ?? 560, step: p.step ?? 40 } }];
        break;
      }
      case 'highlight':
      case 'draw_path':
        this.state.objects = [...this.state.objects, { ...defaults(command.type === 'highlight' ? 'highlight' : 'path', payload.createdBy ?? 'student', payload.label ?? command.type), coordinates: { points: payload.points } }];
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
      case 'zoom_to':
        this.state.viewport = { ...this.state.viewport, ...payload, zoom: Math.max(.55, Math.min(2.4, payload.zoom ?? this.state.viewport.zoom)) };
        break;
    }
    return this.getState();
  }
}
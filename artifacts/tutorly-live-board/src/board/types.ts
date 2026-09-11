export type CreatedBy = 'student' | 'tutorly';
export type ToolId =
  | 'select' | 'pen' | 'highlighter' | 'point' | 'line' | 'ray' | 'arrow'
  | 'circle' | 'arc' | 'rectangle' | 'text' | 'equation' | 'eraser' | 'axes' | 'graph';

export type Point = { x: number; y: number };
export type CoordinateMap = Record<string, any>;

export type BoardObject = {
  id: string;
  type: string;
  createdBy: CreatedBy;
  coordinates: CoordinateMap;
  label: string;
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
};

export type PointObject = BoardObject & { type: 'point'; coordinates: { x: number; y: number } };
export type SegmentObject = BoardObject & { type: 'line' | 'ray' | 'arrow'; coordinates: { x1: number; y1: number; x2: number; y2: number } };
export type CircleObject = BoardObject & { type: 'circle'; coordinates: { cx: number; cy: number; r: number } };
export type ArcObject = BoardObject & { type: 'arc'; coordinates: { cx: number; cy: number; r: number; startAngle: number; endAngle: number } };
export type RectangleObject = BoardObject & { type: 'rectangle'; coordinates: { x: number; y: number; width: number; height: number } };
export type PathObject = BoardObject & { type: 'path' | 'highlight'; coordinates: { points: Point[] } };
export type TextObject = BoardObject & { type: 'text' | 'equation'; coordinates: { x: number; y: number; text: string; fontSize: number } };
export type AxesObject = BoardObject & { type: 'axes' | 'graph'; coordinates: { x: number; y: number; width: number; height: number; step: number } };

export type AnyBoardObject =
  | PointObject | SegmentObject | CircleObject | ArcObject | RectangleObject
  | PathObject | TextObject | AxesObject;

export type BoardViewport = { zoom: number; panX: number; panY: number };

export type BoardState = {
  objects: AnyBoardObject[];
  viewport: BoardViewport;
};

export type BoardCommand =
  | { type: 'draw_point'; payload: { x: number; y: number; label?: string; createdBy?: CreatedBy } }
  | { type: 'draw_line' | 'draw_ray' | 'draw_arrow'; payload: { x1: number; y1: number; x2: number; y2: number; label?: string; createdBy?: CreatedBy } }
  | { type: 'draw_circle'; payload: { cx: number; cy: number; r: number; label?: string; createdBy?: CreatedBy } }
  | { type: 'draw_arc'; payload: { cx: number; cy: number; r: number; startAngle: number; endAngle: number; label?: string; createdBy?: CreatedBy } }
  | { type: 'draw_rectangle'; payload: { x: number; y: number; width: number; height: number; label?: string; createdBy?: CreatedBy } }
  | { type: 'draw_text'; payload: { x: number; y: number; text: string; fontSize?: number; equation?: boolean; createdBy?: CreatedBy } }
  | { type: 'draw_axes' | 'draw_graph'; payload?: { x?: number; y?: number; width?: number; height?: number; step?: number; createdBy?: CreatedBy } }
  | { type: 'highlight'; payload: { points: Point[]; label?: string; createdBy?: CreatedBy } }
  | { type: 'draw_path'; payload: { points: Point[]; label?: string; createdBy?: CreatedBy } }
  | { type: 'move_object'; payload: { id: string; dx: number; dy: number } }
  | { type: 'delete_object'; payload: { id: string } }
  | { type: 'clear_board' }
  | { type: 'zoom_to'; payload: { zoom?: number; panX?: number; panY?: number } };

export const isDrawableObject = (object: AnyBoardObject) =>
  !['axes', 'graph'].includes(object.type);
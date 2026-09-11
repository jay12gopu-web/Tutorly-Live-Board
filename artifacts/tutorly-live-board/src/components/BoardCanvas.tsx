import { useRef, useState, type PointerEvent, type WheelEvent } from 'react';
import { Crosshair, Minus, Move, Plus, RotateCcw } from 'lucide-react';
import { angleOf, arcPath, distance, hitTest } from '@/board/geometry';
import type { AnyBoardObject, BoardCommand, BoardState, Point, ToolId } from '@/board/types';

type BoardCanvasProps = {
  state: BoardState;
  activeTool: ToolId;
  selectedId: string | null;
  panMode: boolean;
  onSelect: (id: string | null) => void;
  onCommand: (command: BoardCommand) => void;
  onViewport: (viewport: BoardState['viewport']) => void;
  onStudentAction: (objectType: string) => void;
  onTogglePan: () => void;
};

type Draft = { start: Point; current: Point; points?: Point[] };

const colorFor = (object: AnyBoardObject) => object.stroke ?? (object.createdBy === 'tutorly' ? '#6874e8' : '#45979b');

const lineEnd = (c: { x1: number; y1: number; x2: number; y2: number }) => {
  const length = Math.hypot(c.x2 - c.x1, c.y2 - c.y1) || 1;
  return { x: c.x1 + ((c.x2 - c.x1) / length) * 100, y: c.y1 + ((c.y2 - c.y1) / length) * 100 };
};

function ObjectShape({ object, selected, dragOffset }: { object: AnyBoardObject; selected: boolean; dragOffset: Point }) {
  const c: any = object.coordinates;
  const stroke = colorFor(object);
  const common = { className: `board-object ${object.createdBy} ${selected ? 'selected-object' : ''}`, stroke, strokeWidth: selected ? Math.max(4, (object.strokeWidth ?? 2.5) + 1.5) : object.strokeWidth ?? 2.5, opacity: object.opacity ?? 1, fill: 'none' };
  const transform = dragOffset.x || dragOffset.y ? `translate(${dragOffset.x} ${dragOffset.y})` : undefined;
  const label = object.label && !['highlight', 'path', 'axes', 'graph', 'text', 'equation'].includes(object.type);
  const labelPoint = object.type === 'point' ? { x: c.x + 10, y: c.y - 10 } :
    object.type === 'circle' || object.type === 'arc' ? { x: c.cx + c.r + 9, y: c.cy } :
    object.type === 'text' || object.type === 'equation' ? { x: c.x, y: c.y - 10 } : undefined;

  return (
    <g key={object.id} transform={transform} data-object-id={object.id}>
      {object.type === 'point' && <circle {...common} cx={c.x} cy={c.y} r={selected ? 7 : 5} fill={stroke} />}
      {(object.type === 'line' || object.type === 'ray' || object.type === 'arrow') && (
        <line {...common} x1={c.x1} y1={c.y1} x2={object.type === 'ray' ? lineEnd(c).x : c.x2} y2={object.type === 'ray' ? lineEnd(c).y : c.y2} markerEnd={object.type === 'arrow' || object.type === 'ray' ? 'url(#arrowhead)' : undefined} />
      )}
      {object.type === 'circle' && <circle {...common} cx={c.cx} cy={c.cy} r={c.r} />}
      {object.type === 'arc' && <path {...common} d={arcPath(c.cx, c.cy, c.r, c.startAngle, c.endAngle)} />}
      {object.type === 'rectangle' && <rect {...common} x={c.x} y={c.y} width={c.width} height={c.height} rx="3" />}
      {(object.type === 'path' || object.type === 'highlight') && <polyline {...common} points={c.points.map((p: Point) => `${p.x},${p.y}`).join(' ')} strokeLinecap="round" strokeLinejoin="round" />}
      {(object.type === 'text' || object.type === 'equation') && <text className={`board-object ${object.createdBy}`} x={c.x} y={c.y} fontSize={c.fontSize} fill={stroke} fontFamily="Space Grotesk, sans-serif" fontWeight={object.type === 'equation' ? 600 : 500}>{c.text}</text>}
      {object.type === 'axes' && <g className="board-object" stroke="#a5a9c6" strokeWidth="1.5" opacity=".8"><line x1={c.x} y1={c.y + c.height / 2} x2={c.x + c.width} y2={c.y + c.height / 2} /><line x1={c.x + c.width / 2} y1={c.y} x2={c.x + c.width / 2} y2={c.y + c.height} /><path d={`M ${c.x + c.width - 10} ${c.y + c.height / 2 - 5} L ${c.x + c.width} ${c.y + c.height / 2} L ${c.x + c.width - 10} ${c.y + c.height / 2 + 5}`} fill="none" /><path d={`M ${c.x + c.width / 2 - 5} ${c.y + 10} L ${c.x + c.width / 2} ${c.y} L ${c.x + c.width / 2 + 5} ${c.y + 10}`} fill="none" /></g>}
      {object.type === 'graph' && <g className="board-object" stroke="#e1e4f1" strokeWidth="1">{Array.from({ length: Math.floor(c.width / c.step) + 1 }, (_, i) => <line key={`v-${i}`} x1={c.x + i * c.step} y1={c.y} x2={c.x + i * c.step} y2={c.y + c.height} />)}{Array.from({ length: Math.floor(c.height / c.step) + 1 }, (_, i) => <line key={`h-${i}`} x1={c.x} y1={c.y + i * c.step} x2={c.x + c.width} y2={c.y + i * c.step} />)}</g>}
      {label && labelPoint && <text className="board-label" x={labelPoint.x} y={labelPoint.y}>{object.label}</text>}
    </g>
  );
}

export function BoardCanvas({ state, activeTool, selectedId, panMode, onSelect, onCommand, onViewport, onStudentAction, onTogglePan }: BoardCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const draftRef = useRef<Draft | null>(null);
  const dragRef = useRef<{ id: string; start: Point } | null>(null);
  const panRef = useRef<{ start: Point; panX: number; panY: number } | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [dragOffset, setDragOffset] = useState<Point>({ x: 0, y: 0 });

  const toSvgPoint = (event: PointerEvent<SVGSVGElement>) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return { x: ((event.clientX - rect.left) / rect.width) * 1200, y: ((event.clientY - rect.top) / rect.height) * 760 };
  };

  const toBoardPoint = (event: PointerEvent<SVGSVGElement>) => {
    const raw = toSvgPoint(event);
    return { x: (raw.x - state.viewport.panX) / state.viewport.zoom, y: (raw.y - state.viewport.panY) / state.viewport.zoom };
  };

  const objectAt = (point: Point) => [...state.objects].reverse().find((object) => hitTest(object, point));
  const finishDrawing = (point: Point) => {
    const current = draftRef.current;
    if (!current) return;
    const { start } = current;
    if (activeTool === 'pen' || activeTool === 'highlighter') {
      const points = current.points ?? [];
      if (points.length > 1) {
        onCommand(activeTool === 'highlighter' ? { type: 'highlight', payload: { points } } : { type: 'draw_path', payload: { points } });
        onStudentAction(activeTool === 'highlighter' ? 'highlight' : 'path');
      }
    } else if (activeTool === 'line' || activeTool === 'ray' || activeTool === 'arrow') {
      onCommand({ type: activeTool === 'line' ? 'draw_line' : activeTool === 'ray' ? 'draw_ray' : 'draw_arrow', payload: { x1: start.x, y1: start.y, x2: point.x, y2: point.y } });
      onStudentAction(activeTool);
    } else if (activeTool === 'circle') {
      onCommand({ type: 'draw_circle', payload: { cx: start.x, cy: start.y, r: Math.max(8, distance(start, point)) } });
      onStudentAction(activeTool);
    } else if (activeTool === 'arc') {
      onCommand({ type: 'draw_arc', payload: { cx: start.x, cy: start.y, r: Math.max(8, distance(start, point)), startAngle: angleOf(start, { x: start.x + 1, y: start.y }), endAngle: angleOf(start, point) } });
      onStudentAction(activeTool);
    } else if (activeTool === 'rectangle') {
      onCommand({ type: 'draw_rectangle', payload: { x: Math.min(start.x, point.x), y: Math.min(start.y, point.y), width: Math.abs(point.x - start.x), height: Math.abs(point.y - start.y) } });
      onStudentAction(activeTool);
    }
    draftRef.current = null;
    setDraft(null);
  };

  const onPointerDown = (event: PointerEvent<SVGSVGElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    const point = toBoardPoint(event);
    if (panMode) {
      panRef.current = { start: toSvgPoint(event), panX: state.viewport.panX, panY: state.viewport.panY };
      return;
    }
    if (activeTool === 'select') {
      const hit = objectAt(point);
      onSelect(hit?.id ?? null);
      if (hit) dragRef.current = { id: hit.id, start: point };
      return;
    }
    if (activeTool === 'eraser') {
      const hit = objectAt(point);
      if (hit) {
        onCommand({ type: 'delete_object', payload: { id: hit.id } });
        onSelect(null);
      }
      return;
    }
    if (activeTool === 'point') {
      onCommand({ type: 'draw_point', payload: { x: point.x, y: point.y } });
      onStudentAction('point');
      return;
    }
    if (activeTool === 'text' || activeTool === 'equation') {
      const text = window.prompt(activeTool === 'equation' ? 'Enter an equation' : 'Enter a label');
      if (text?.trim()) {
        onCommand({ type: 'draw_text', payload: { x: point.x, y: point.y, text: text.trim(), equation: activeTool === 'equation' } });
        onStudentAction(activeTool);
      }
      return;
    }
    if (activeTool === 'axes' || activeTool === 'graph') {
      onCommand({ type: activeTool === 'axes' ? 'draw_axes' : 'draw_graph', payload: { createdBy: 'student' } });
      onStudentAction(activeTool);
      return;
    }
    draftRef.current = { start: point, current: point, points: activeTool === 'pen' || activeTool === 'highlighter' ? [point] : undefined };
    setDraft(draftRef.current);
  };

  const onPointerMove = (event: PointerEvent<SVGSVGElement>) => {
    const point = toBoardPoint(event);
    if (panRef.current) {
      const pan = panRef.current;
      const raw = toSvgPoint(event);
      onViewport({ ...state.viewport, panX: pan.panX + (raw.x - pan.start.x), panY: pan.panY + (raw.y - pan.start.y) });
      return;
    }
    if (dragRef.current) {
      setDragOffset({ x: point.x - dragRef.current.start.x, y: point.y - dragRef.current.start.y });
      return;
    }
    if (!draftRef.current) return;
    draftRef.current.current = point;
    if (draftRef.current.points) draftRef.current.points = [...draftRef.current.points, point];
    setDraft({ ...draftRef.current, points: draftRef.current.points ? [...draftRef.current.points] : undefined });
  };

  const onPointerUp = (event: PointerEvent<SVGSVGElement>) => {
    const point = toBoardPoint(event);
    if (panRef.current) { panRef.current = null; return; }
    if (dragRef.current) {
      const drag = dragRef.current;
      if (Math.abs(point.x - drag.start.x) > 2 || Math.abs(point.y - drag.start.y) > 2) onCommand({ type: 'move_object', payload: { id: drag.id, dx: point.x - drag.start.x, dy: point.y - drag.start.y } });
      dragRef.current = null;
      setDragOffset({ x: 0, y: 0 });
      return;
    }
    finishDrawing(point);
  };

  const onWheel = (event: WheelEvent<SVGSVGElement>) => {
    event.preventDefault();
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const raw = { x: ((event.clientX - rect.left) / rect.width) * 1200, y: ((event.clientY - rect.top) / rect.height) * 760 };
    const oldZoom = state.viewport.zoom;
    const zoom = Math.max(.55, Math.min(2.4, oldZoom + (event.deltaY > 0 ? -.08 : .08)));
    const boardPoint = { x: (raw.x - state.viewport.panX) / oldZoom, y: (raw.y - state.viewport.panY) / oldZoom };
    onViewport({ zoom, panX: raw.x - boardPoint.x * zoom, panY: raw.y - boardPoint.y * zoom });
  };

  const renderDraft = () => {
    if (!draft) return null;
    const { start, current, points } = draft;
    const stroke = activeTool === 'highlighter' ? '#d6ae50' : '#45979b';
    const props = { fill: 'none', stroke, strokeWidth: activeTool === 'highlighter' ? 15 : 2.5, opacity: activeTool === 'highlighter' ? .28 : .7, strokeLinecap: 'round' as const };
    if (points) return <polyline points={points.map((p) => `${p.x},${p.y}`).join(' ')} {...props} />;
    if (activeTool === 'circle') return <circle cx={start.x} cy={start.y} r={distance(start, current)} {...props} />;
    if (activeTool === 'arc') return <path d={arcPath(start.x, start.y, distance(start, current), 0, angleOf(start, current))} {...props} />;
    if (activeTool === 'rectangle') return <rect x={Math.min(start.x, current.x)} y={Math.min(start.y, current.y)} width={Math.abs(current.x - start.x)} height={Math.abs(current.y - start.y)} {...props} />;
    return <line x1={start.x} y1={start.y} x2={current.x} y2={current.y} {...props} />;
  };

  return (
    <div className="board-wrap">
      <div className="object-tag" data-testid="status-selected-object">{selectedId ? <><strong>Selected</strong> · {state.objects.find((object) => object.id === selectedId)?.label ?? 'Object'} <span>({state.objects.find((object) => object.id === selectedId)?.type ?? 'object'})</span></> : <>Canvas ready · {state.objects.length} objects</>}</div>
      <svg ref={svgRef} className="board-svg" viewBox="0 0 1200 760" role="application" aria-label="Interactive geometry whiteboard" onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={() => { draftRef.current = null; dragRef.current = null; panRef.current = null; setDraft(null); setDragOffset({ x: 0, y: 0 }); }} onWheel={onWheel}>
        <defs>
          <pattern id="board-grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" className="board-grid" /></pattern>
          <marker id="arrowhead" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto"><path d="M 0 0 L 9 4.5 L 0 9 z" fill="#6874e8" /></marker>
        </defs>
        <g transform={`translate(${state.viewport.panX} ${state.viewport.panY}) scale(${state.viewport.zoom})`}>
          <rect width="1200" height="760" fill="url(#board-grid)" opacity=".7" />
          {state.objects.map((object) => <ObjectShape key={object.id} object={object} selected={object.id === selectedId} dragOffset={dragRef.current?.id === object.id ? dragOffset : { x: 0, y: 0 }} />)}
          {renderDraft()}
        </g>
      </svg>
      <div className="canvas-help">{panMode ? 'Drag to pan · scroll to zoom' : 'Scroll to zoom · choose a tool to begin'}</div>
      <div className="board-toolbar" style={{ position: 'absolute', right: 14, top: 14, zIndex: 3 }}>
        <button className="view-control" type="button" data-testid="button-pan-mode" aria-pressed={panMode} title="Pan board" onClick={onTogglePan}><Move size={14} /> {panMode ? 'Panning' : 'Pan'}</button>
        <button className="view-control" type="button" data-testid="button-zoom-out" aria-label="Zoom out" onClick={() => onViewport({ ...state.viewport, zoom: Math.max(.55, state.viewport.zoom - .12) })}><Minus size={14} /></button>
        <span className="zoom-readout" data-testid="text-zoom-level">{Math.round(state.viewport.zoom * 100)}%</span>
        <button className="view-control" type="button" data-testid="button-zoom-in" aria-label="Zoom in" onClick={() => onViewport({ ...state.viewport, zoom: Math.min(2.4, state.viewport.zoom + .12) })}><Plus size={14} /></button>
        <button className="view-control" type="button" data-testid="button-reset-view" aria-label="Reset board view" title="Reset view" onClick={() => onViewport({ zoom: 1, panX: 0, panY: 0 })}><RotateCcw size={14} /></button>
        <Crosshair size={14} color="#9298b8" aria-hidden="true" />
      </div>
    </div>
  );
}
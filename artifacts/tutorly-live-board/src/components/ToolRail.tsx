import type { LucideIcon } from 'lucide-react';
import {
  Axis3D, Circle, Eraser, Highlighter, LineChart, MousePointer2, MoveUpRight, Pencil,
  PenLine, Plus, RectangleHorizontal, Shapes, Square, TextCursorInput, Type, WandSparkles,
} from 'lucide-react';
import type { ToolId } from '@/board/types';

type ToolDefinition = { id: ToolId; label: string; icon: LucideIcon; divider?: boolean };

const tools: ToolDefinition[] = [
  { id: 'select', label: 'Select', icon: MousePointer2 },
  { id: 'pen', label: 'Pen', icon: PenLine },
  { id: 'highlighter', label: 'Highlight', icon: Highlighter },
  { id: 'point', label: 'Point', icon: Plus },
  { id: 'line', label: 'Line', icon: LineChart },
  { id: 'ray', label: 'Ray', icon: MoveUpRight },
  { id: 'arrow', label: 'Arrow', icon: WandSparkles },
  { id: 'circle', label: 'Circle', icon: Circle },
  { id: 'arc', label: 'Arc', icon: Shapes },
  { id: 'rectangle', label: 'Rectangle', icon: RectangleHorizontal },
  { id: 'text', label: 'Text', icon: Type },
  { id: 'equation', label: 'Equation', icon: TextCursorInput },
  { id: 'eraser', label: 'Eraser', icon: Eraser },
  { id: 'axes', label: 'Axes', icon: Axis3D },
  { id: 'graph', label: 'Graph', icon: Square },
];

type ToolRailProps = { activeTool: ToolId; onToolChange: (tool: ToolId) => void; mobile?: boolean };

export function ToolRail({ activeTool, onToolChange, mobile = false }: ToolRailProps) {
  return (
    <nav className={mobile ? 'mobile-tools' : 'tool-rail'} aria-label={mobile ? 'Drawing tools tray' : 'Drawing tools'}>
      {tools.map(({ id, label, icon: Icon, divider }) => (
        <span key={id} style={{ display: 'contents' }}>
          {divider && <span className="rail-separator" />}
          <button
            type="button"
            className={`tool-btn ${activeTool === id ? 'active' : ''}`}
            data-testid={`tool-${id}`}
            aria-label={label}
            aria-pressed={activeTool === id}
            title={label}
            onClick={() => onToolChange(id)}
          >
            <Icon size={mobile ? 17 : 18} strokeWidth={1.8} />
            <span>{label}</span>
          </button>
        </span>
      ))}
    </nav>
  );
}
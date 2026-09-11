import { ArrowLeft, Eraser, Redo2, RotateCcw, Undo2 } from 'lucide-react';

type TopBarProps = {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  onExit: () => void;
};

export function TopBar({ canUndo, canRedo, onUndo, onRedo, onClear, onExit }: TopBarProps) {
  return (
    <header className="topbar" aria-label="Tutorly Live Board header">
      <div className="brand-mark" aria-hidden="true"><span className="display-font" style={{ fontWeight: 700 }}>T</span></div>
      <span className="brand-name">Tutorly</span>
      <div className="topbar-divider" />
      <div className="topbar-context">
        <span className="eyebrow">Live Board</span>
        <span className="context-title">Construct an Angle Bisector</span>
      </div>
      <div className="topbar-actions">
        <button className="icon-btn" type="button" data-testid="button-undo" aria-label="Undo last action" title="Undo" disabled={!canUndo} onClick={onUndo}><Undo2 size={17} /></button>
        <button className="icon-btn" type="button" data-testid="button-redo" aria-label="Redo last action" title="Redo" disabled={!canRedo} onClick={onRedo}><Redo2 size={17} /></button>
        <button className="text-btn" type="button" data-testid="button-clear-board" aria-label="Clear board" title="Clear board" onClick={onClear}><Eraser size={15} /> Clear</button>
        <button className="text-btn exit" type="button" data-testid="button-exit-board" aria-label="Exit live board" onClick={onExit}><ArrowLeft size={15} /> Exit</button>
      </div>
    </header>
  );
}
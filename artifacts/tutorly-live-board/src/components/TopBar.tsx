import { ArrowLeft, Eraser, Redo2, Undo2 } from 'lucide-react';

type TopBarProps = {
  lessonTitle: string;
  subject: string;
  studentWorkMode: boolean;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  onExit: () => void;
  onMyWork: () => void;
  onReturnToLesson: () => void;
};

export function TopBar({ lessonTitle, subject, canUndo, canRedo, onUndo, onRedo, onClear, onExit, studentWorkMode, onMyWork, onReturnToLesson }: TopBarProps) {
  return (
    <header className="topbar" aria-label="Tutorly Live Board header">
      <div className="brand-mark" aria-hidden="true"><span className="display-font" style={{ fontWeight: 700 }}>T</span></div>
      <span className="brand-name">Tutorly</span>
      <div className="topbar-divider" />
      <div className="topbar-context">
        <span className="eyebrow">{studentWorkMode ? 'StudentLayer' : `${subject} · Live lesson`}</span>
        <span className="context-title">{lessonTitle}</span>
      </div>
      <div className="topbar-actions">
        {studentWorkMode ? <><button className="icon-btn" type="button" data-testid="button-undo" aria-label="Undo last action" title="Undo" disabled={!canUndo} onClick={onUndo}><Undo2 size={17} /></button><button className="icon-btn" type="button" data-testid="button-redo" aria-label="Redo last action" title="Redo" disabled={!canRedo} onClick={onRedo}><Redo2 size={17} /></button><button className="text-btn" type="button" data-testid="button-clear-board" aria-label="Clear my work" title="Clear my work" onClick={onClear}><Eraser size={15} /> Clear</button><button className="text-btn" type="button" data-testid="button-return-lesson" onClick={onReturnToLesson}>Lesson</button></> : <button className="text-btn" type="button" data-testid="button-my-work" onClick={onMyWork}>My work</button>}
        <button className="text-btn exit" type="button" data-testid="button-exit-board" aria-label="Exit live board" onClick={onExit}><ArrowLeft size={15} /> Exit</button>
      </div>
    </header>
  );
}

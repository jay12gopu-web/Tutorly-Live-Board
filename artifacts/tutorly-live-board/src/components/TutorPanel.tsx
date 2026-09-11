import { ChevronDown, ChevronUp, Lightbulb, MessageCircle, Mic, Pencil, Sparkles } from 'lucide-react';
import type { LessonStep } from '@/board/lesson';

type TutorPanelProps = {
  step: number;
  totalSteps: number;
  lessonStep: LessonStep;
  feedback: string;
  waitingForStudent: boolean;
  collapsed?: boolean;
  onCollapse: () => void;
  onLetMeTry: () => void;
  onHint: () => void;
  onExplain: () => void;
  onVoice: () => void;
};

export function TutorPanel({ step, totalSteps, lessonStep, feedback, waitingForStudent, collapsed = false, onCollapse, onLetMeTry, onHint, onExplain, onVoice }: TutorPanelProps) {
  if (collapsed) return <aside className="tutor-panel collapsed-panel" aria-label="Collapsed Tutorly guide"><div className="panel-head"><div className="tutor-avatar" aria-hidden="true"><Sparkles size={17} /></div><button className="collapse-btn" type="button" data-testid="button-open-tutor" aria-label="Open Tutorly guide" onClick={onCollapse}><ChevronUp size={18} /></button></div></aside>;
  return (
    <aside className="tutor-panel" aria-label="Tutorly lesson guide">
      <div className="panel-head"><div className="tutor-avatar" aria-hidden="true"><Sparkles size={17} /></div><div><div className="panel-title">Tutorly</div><div className="panel-subtitle">A visual lesson, one idea at a time</div></div><button className="collapse-btn" type="button" data-testid="button-collapse-tutor" aria-label="Collapse lesson guide" onClick={onCollapse}><ChevronDown size={18} /></button></div>
      <div className="panel-scroll">
        <div className="lesson-kicker"><span>Angle bisector</span><span className="step-counter" data-testid="text-step-counter">Step {Math.min(step + 1, totalSteps)} of {totalSteps}</span></div>
        <div className="progress-track" aria-label={`${step} of ${totalSteps} lesson steps complete`}><div className="progress-bar" style={{ width: `${Math.min(100, ((step + 1) / totalSteps) * 100)}%` }} /></div>
        <div className="instruction-card"><h2 data-testid="text-lesson-title">{lessonStep.title}</h2><p data-testid="text-lesson-instruction">{waitingForStudent ? `Your turn: ${lessonStep.instruction}` : lessonStep.instruction}</p></div>
        <div className="panel-section-title">What to notice</div>
        <div className="feedback" data-testid="text-lesson-explanation">{feedback || lessonStep.explanation}</div>
        <div className="panel-section-title">Make it yours</div>
        <div className="action-stack">
          <button className="primary-action" type="button" data-testid="button-let-me-try" onClick={onLetMeTry}><Pencil size={15} /> Let me try</button>
          <button className="secondary-action" type="button" data-testid="button-talk-through" onClick={onVoice}><Mic size={15} /> Talk it through</button>
          <button className="quiet-action" type="button" data-testid="button-hint" onClick={onHint}><Lightbulb size={15} /> Hint</button>
          <button className="quiet-action" type="button" data-testid="button-explain" onClick={onExplain}><MessageCircle size={15} /> Explain this</button>
        </div>
        {waitingForStudent && <div className="work-mode-banner"><Pencil size={14} /> StudentLayer is ready <button type="button" data-testid="button-work-mode-note" onClick={onLetMeTry}>Tools are open</button></div>}
      </div>
    </aside>
  );
}
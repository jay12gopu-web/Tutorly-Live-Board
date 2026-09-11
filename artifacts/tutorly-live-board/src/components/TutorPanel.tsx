import { ChevronDown, ChevronUp, Lightbulb, MessageCircle, Mic, Pencil, Play, Sparkles } from 'lucide-react';

export type LessonStep = {
  title: string;
  instruction: string;
  hint: string;
  expectedTool: string;
};

type TutorPanelProps = {
  step: number;
  totalSteps: number;
  lessonStep: LessonStep;
  feedback: string;
  waitingForStudent: boolean;
  collapsed?: boolean;
  onCollapse: () => void;
  onShowMe: () => void;
  onLetMeTry: () => void;
  onHint: () => void;
  onExplain: () => void;
  onVoice: () => void;
};

export function TutorPanel({
  step, totalSteps, lessonStep, feedback, waitingForStudent, collapsed = false, onCollapse,
  onShowMe, onLetMeTry, onHint, onExplain, onVoice,
}: TutorPanelProps) {
  if (collapsed) {
    return (
      <aside className="tutor-panel collapsed-panel" aria-label="Collapsed tutor panel">
        <div className="panel-head">
          <div className="tutor-avatar" aria-hidden="true"><Sparkles size={17} /></div>
          <button className="collapse-btn" type="button" data-testid="button-open-tutor" aria-label="Open Tutorly guide" title="Open tutor guide" onClick={onCollapse}><ChevronUp size={18} /></button>
        </div>
      </aside>
    );
  }

  return (
    <aside className="tutor-panel" aria-label="Tutorly guide">
      <div className="panel-head">
        <div className="tutor-avatar" aria-hidden="true"><Sparkles size={17} /></div>
        <div>
          <div className="panel-title">Tutorly guide</div>
          <div className="panel-subtitle">Patient, precise, beside you</div>
        </div>
        <button className="collapse-btn" type="button" data-testid="button-collapse-tutor" aria-label="Collapse tutor panel" title="Collapse guide" onClick={onCollapse}><ChevronDown size={18} /></button>
      </div>
      <div className="panel-scroll">
        <div className="lesson-kicker">
          <span>Construction lesson</span>
          <span className="step-counter">Step {Math.min(step + 1, totalSteps)} of {totalSteps}</span>
        </div>
        <div className="progress-track" aria-label={`${step} of ${totalSteps} steps complete`}><div className="progress-bar" style={{ width: `${Math.min(100, (step / totalSteps) * 100)}%` }} /></div>
        <div className="instruction-card">
          <h2>{lessonStep.title}</h2>
          <p>{waitingForStudent ? `Your turn: ${lessonStep.instruction}` : lessonStep.instruction}</p>
        </div>
        <div className="panel-section-title">Guide the construction</div>
        <div className="action-stack">
          <button className="primary-action" type="button" data-testid="button-show-me" onClick={onShowMe}><Play size={15} fill="currentColor" /> Show me</button>
          <button className="secondary-action" type="button" data-testid="button-let-me-try" onClick={onLetMeTry}><Pencil size={15} /> Let me try</button>
          <button className="quiet-action" type="button" data-testid="button-hint" onClick={onHint}><Lightbulb size={15} /> Hint</button>
          <button className="quiet-action" type="button" data-testid="button-explain" onClick={onExplain}><MessageCircle size={15} /> Explain this</button>
        </div>
        {feedback && <div className="feedback" data-testid="status-tutor-feedback">{feedback}</div>}
        <div className="voice-card">
          <button type="button" data-testid="button-voice-chat" aria-label="Start voice chat" title="Voice chat" onClick={onVoice}><Mic size={16} /></button>
          <div><strong>Talk it through</strong><p>Ask Tutorly out loud when you want another way in.</p></div>
        </div>
      </div>
    </aside>
  );
}
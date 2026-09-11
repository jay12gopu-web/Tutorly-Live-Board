import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw, PanelRight } from 'lucide-react';
import { BoardHistory } from '@/board/history';
import { emitLiveBoardEvent, loadLiveBoardHandoff } from '@/board/integration';
import { resolveLesson } from '@/board/lessonLoader';
import type { BoardCommand, BoardState, ToolId } from '@/board/types';
import { BoardCanvas } from '@/components/BoardCanvas';
import { ToolRail } from '@/components/ToolRail';
import { TopBar } from '@/components/TopBar';
import { TutorPanel } from '@/components/TutorPanel';

export default function LiveBoardPage() {
  const handoff = useMemo(() => loadLiveBoardHandoff(), []);
  const lesson = useMemo(() => resolveLesson(handoff.lesson, handoff.lessonId), [handoff.lesson, handoff.lessonId]);
  const historyRef = useRef(new BoardHistory());
  const startedRef = useRef(false);
  const completionSentRef = useRef(false);
  const [boardState, setBoardState] = useState<BoardState>(historyRef.current.engine.getState());
  const [activeTool, setActiveTool] = useState<ToolId>('select');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [panMode, setPanMode] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [waitingForStudent, setWaitingForStudent] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [collapsed, setCollapsed] = useState(false);
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  const [studentWorkMode, setStudentWorkMode] = useState(false);
  const currentLessonStep = lesson.steps[activeStep] ?? lesson.steps[0];
  const integrationConnected = Boolean(handoff.conversationId || handoff.returnUrl || window.parent !== window);

  const focusForStep = (index: number): BoardCommand | null => {
    const focus = lesson.steps[index]?.focus;
    return focus ? { type: 'focus_objects', payload: { area: focus, padding: focus.padding } } : null;
  };

  const applyTutorStep = (index: number) => {
    const step = lesson.steps[index];
    if (!step) return;
    step.commands.forEach((command) => historyRef.current.execute(command, false));
    const focusCommand = focusForStep(index);
    if (focusCommand) historyRef.current.execute(focusCommand, false);
    setBoardState(historyRef.current.engine.getState());
    setActiveStep(index);
    setSelectedId(null);
    setFeedback(step.explanation);
    emitLiveBoardEvent('step-changed', { lessonId: lesson.id, stepId: step.id, stepIndex: index, conversationId: handoff.conversationId });
  };

  const resetLessonTo = (index: number) => {
    historyRef.current = new BoardHistory();
    for (let stepIndex = 0; stepIndex <= index; stepIndex += 1) {
      lesson.steps[stepIndex].commands.forEach((command) => historyRef.current.execute(command, false));
      const focusCommand = focusForStep(stepIndex);
      if (focusCommand) historyRef.current.execute(focusCommand, false);
    }
    setBoardState(historyRef.current.engine.getState());
    setActiveStep(index);
    setSelectedId(null);
    setFeedback(lesson.steps[index].explanation);
    emitLiveBoardEvent('step-changed', { lessonId: lesson.id, stepId: lesson.steps[index].id, stepIndex: index, conversationId: handoff.conversationId });
  };

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    emitLiveBoardEvent('ready', { lessonId: lesson.id, conversationId: handoff.conversationId, sourceQuestion: handoff.sourceQuestion });
    applyTutorStep(0);
  }, []);

  useEffect(() => {
    if (!isPlaying || isPaused || studentWorkMode) return;
    const duration = currentLessonStep.durationMs ?? 5000;
    const timer = window.setTimeout(() => {
      if (activeStep < lesson.steps.length - 1) {
        applyTutorStep(activeStep + 1);
      } else {
        setIsPlaying(false);
        if (!completionSentRef.current) {
          completionSentRef.current = true;
          emitLiveBoardEvent('lesson-complete', { lessonId: lesson.id, conversationId: handoff.conversationId });
        }
      }
    }, duration);
    return () => window.clearTimeout(timer);
  }, [activeStep, isPlaying, isPaused, studentWorkMode, currentLessonStep.durationMs, lesson.id, lesson.steps.length, handoff.conversationId]);

  const commit = (command: BoardCommand) => setBoardState(historyRef.current.execute(command));
  const updateViewport = (viewport: BoardState['viewport']) => setBoardState(historyRef.current.engine.setState({ ...historyRef.current.engine.getState(), viewport }));

  const handleNext = () => {
    if (studentWorkMode) return;
    setIsPaused(false);
    setIsPlaying(true);
    if (activeStep < lesson.steps.length - 1) applyTutorStep(activeStep + 1);
  };

  const handlePrevious = () => {
    if (studentWorkMode) return;
    setIsPaused(false);
    setIsPlaying(true);
    completionSentRef.current = false;
    resetLessonTo(Math.max(0, activeStep - 1));
  };

  const handleReplay = () => {
    setStudentWorkMode(false);
    setWaitingForStudent(false);
    setIsPaused(false);
    setIsPlaying(true);
    completionSentRef.current = false;
    historyRef.current = new BoardHistory();
    applyTutorStep(0);
  };

  const enterWorkMode = () => {
    setStudentWorkMode(true);
    setWaitingForStudent(true);
    setIsPlaying(false);
    setIsPaused(false);
    setActiveTool(currentLessonStep.expectedTool ?? 'pen');
    setFeedback(currentLessonStep.expectedTool
      ? `Your turn. Tutorly's lesson stays locked; use the ${currentLessonStep.expectedTool} tool on your StudentLayer.`
      : 'Your turn. Add your own marks on StudentLayer while Tutorly’s lesson stays locked.');
    setMobileSheetOpen(false);
  };

  const returnToLesson = () => {
    setStudentWorkMode(false);
    setWaitingForStudent(false);
    setActiveTool('select');
    setIsPlaying(true);
    setIsPaused(false);
    setFeedback(currentLessonStep.explanation);
  };

  const handleStudentAction = (objectType: string) => {
    if (!studentWorkMode || !waitingForStudent) return;
    if (!currentLessonStep.expectedTool || objectType === currentLessonStep.expectedTool) {
      setWaitingForStudent(false);
      setFeedback('Nice — your work is saved separately. Compare it with Tutorly’s visual, then continue when you are ready.');
    } else {
      setFeedback(`Saved to StudentLayer. For this step, try the ${currentLessonStep.expectedTool} tool.`);
    }
  };

  const handleClear = () => {
    if (window.confirm('Clear only your marks? Tutorly’s lesson will stay in place.')) {
      commit({ type: 'clear_student_layer' });
      setSelectedId(null);
      setFeedback('Your StudentLayer is clear. Tutorly’s lesson is still here.');
    }
  };

  const handleUndo = () => setBoardState(historyRef.current.undo());
  const handleRedo = () => setBoardState(historyRef.current.redo());
  const handleExit = () => {
    emitLiveBoardEvent('exit', { lessonId: lesson.id, conversationId: handoff.conversationId });
    if (handoff.returnUrl) {
      try {
        const destination = new URL(handoff.returnUrl, window.location.origin);
        if (destination.origin === window.location.origin) {
          window.location.assign(destination.href);
          return;
        }
      } catch { /* fall back to browser history */ }
    }
    if (window.history.length > 1) window.history.back();
    else setFeedback('This lesson is ready to close.');
  };

  const handleVoice = () => {
    const delivered = emitLiveBoardEvent('voice-request', {
      lessonId: lesson.id,
      lessonTitle: lesson.title,
      stepId: currentLessonStep.id,
      stepTitle: currentLessonStep.title,
      conversationId: handoff.conversationId,
      preferredVoice: handoff.preferredVoice,
    });
    setFeedback(delivered || handoff.conversationId
      ? 'Keeping this exact lesson step as Tutorly Voice Chat takes over.'
      : 'Voice handoff is wired. When this board runs inside Tutorly, it sends this exact step to the existing Voice Chat.');
  };

  const handleAskTutorly = () => {
    emitLiveBoardEvent('chat-request', {
      lessonId: lesson.id,
      lessonTitle: lesson.title,
      stepId: currentLessonStep.id,
      stepTitle: currentLessonStep.title,
      stepExplanation: currentLessonStep.explanation,
      conversationId: handoff.conversationId,
      sourceQuestion: handoff.sourceQuestion,
    });
    setFeedback('Sent the current visual step back to Tutorly chat context.');
  };

  const handleHint = () => setFeedback(currentLessonStep.hint);
  const handleExplain = () => setFeedback(currentLessonStep.explanation);
  const selectTool = (tool: ToolId) => { setActiveTool(tool); setPanMode(false); };

  const tutorPanelProps = {
    lesson,
    step: activeStep,
    totalSteps: lesson.steps.length,
    lessonStep: currentLessonStep,
    feedback,
    waitingForStudent,
    chatConnected: integrationConnected,
    onLetMeTry: enterWorkMode,
    onHint: handleHint,
    onExplain: handleExplain,
    onVoice: handleVoice,
    onAskTutorly: handleAskTutorly,
  };

  return (
    <main className="app-shell">
      <TopBar lessonTitle={lesson.title} subject={lesson.subject} canUndo={historyRef.current.canUndo()} canRedo={historyRef.current.canRedo()} onUndo={handleUndo} onRedo={handleRedo} onClear={handleClear} onExit={handleExit} studentWorkMode={studentWorkMode} onMyWork={enterWorkMode} onReturnToLesson={returnToLesson} />
      <div className={`workspace ${studentWorkMode ? 'work-mode' : ''}`}>
        {studentWorkMode && <ToolRail activeTool={activeTool} onToolChange={selectTool} />}
        <section className="board-stage" aria-label={`${lesson.title} visual lesson`}>
          <div className="board-toolbar">
            <div className="board-status"><span className="status-dot" /> {studentWorkMode ? 'Your marks · StudentLayer' : `Tutorly is teaching · ${lesson.topic}`}</div>
            <div className="playback-bar" aria-label="Lesson playback controls">
              <button type="button" data-testid="button-previous-step" aria-label="Previous step" title="Previous" onClick={handlePrevious}><ChevronLeft size={16} /></button>
              <button className="primary" type="button" data-testid="button-pause-resume" aria-label={isPaused || !isPlaying ? 'Resume lesson' : 'Pause lesson'} title={isPaused || !isPlaying ? 'Resume' : 'Pause'} onClick={() => { if (!studentWorkMode) { setIsPaused((value) => !value); setIsPlaying(true); } }}>{isPaused || !isPlaying ? <Play size={14} fill="currentColor" /> : <Pause size={14} />}</button>
              <button type="button" data-testid="button-next-step" aria-label="Next step" title="Next" onClick={handleNext}><ChevronRight size={16} /></button>
              <button type="button" data-testid="button-replay-lesson" aria-label="Replay lesson" title="Replay" onClick={handleReplay}><RotateCcw size={14} /></button>
              <span>{studentWorkMode ? 'My work' : isPlaying && !isPaused ? `Step ${activeStep + 1} · playing` : `Step ${activeStep + 1} · paused`}</span>
            </div>
          </div>
          <BoardCanvas state={boardState} activeTool={activeTool} selectedId={selectedId} panMode={panMode} studentWorkMode={studentWorkMode} ariaLabel={`${lesson.title} interactive visual`} showBaseGrid={lesson.showBaseGrid} onSelect={setSelectedId} onCommand={commit} onViewport={updateViewport} onStudentAction={handleStudentAction} onTogglePan={() => setPanMode((value) => !value)} />
        </section>
        <TutorPanel {...tutorPanelProps} collapsed={collapsed} onCollapse={() => setCollapsed((value) => !value)} />
      </div>
      {studentWorkMode && <ToolRail activeTool={activeTool} onToolChange={selectTool} mobile />}
      <button className="mobile-panel-trigger" type="button" data-testid="button-open-tutor-mobile" aria-label="Open Tutorly guide" onClick={() => setMobileSheetOpen(true)}><PanelRight size={15} /> Guide</button>
      {mobileSheetOpen && <><button className="sheet-backdrop" type="button" data-testid="button-close-tutor-backdrop" aria-label="Close Tutorly guide" onClick={() => setMobileSheetOpen(false)} /><div className="mobile-sheet"><TutorPanel {...tutorPanelProps} onCollapse={() => setMobileSheetOpen(false)} /></div></>}
      <span className="sr-only" data-testid="status-lesson-progress">{activeStep + 1} of {lesson.steps.length} lesson steps shown</span>
    </main>
  );
}

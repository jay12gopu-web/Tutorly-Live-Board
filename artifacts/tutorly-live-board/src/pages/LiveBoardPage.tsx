import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw, PanelRight, Sparkles } from 'lucide-react';
import { BoardHistory } from '@/board/history';
import { lessonCommands, lessonSteps } from '@/board/lesson';
import type { BoardCommand, BoardState, ToolId } from '@/board/types';
import { BoardCanvas } from '@/components/BoardCanvas';
import { ToolRail } from '@/components/ToolRail';
import { TopBar } from '@/components/TopBar';
import { TutorPanel } from '@/components/TutorPanel';

const expectedToolToId: Record<string, ToolId> = { ray: 'ray', arc: 'arc', point: 'point' };

export default function LiveBoardPage() {
  const historyRef = useRef(new BoardHistory());
  const startedRef = useRef(false);
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
  const currentLessonStep = lessonSteps[activeStep];

  const focusForStep = (index: number): BoardCommand => ({ type: 'focus_objects', payload: { area: lessonSteps[index].focus, padding: lessonSteps[index].focus.padding } });
  const applyTutorStep = (index: number) => {
    lessonCommands[index].forEach((command) => historyRef.current.execute(command));
    historyRef.current.execute(focusForStep(index));
    setBoardState(historyRef.current.engine.getState());
    setActiveStep(index);
    setSelectedId(null);
    setFeedback(lessonSteps[index].explanation);
  };
  const resetLessonTo = (index: number) => {
    historyRef.current = new BoardHistory();
    for (let step = 0; step <= index; step += 1) {
      lessonCommands[step].forEach((command) => historyRef.current.execute(command));
      historyRef.current.execute(focusForStep(step));
    }
    setBoardState(historyRef.current.engine.getState());
    setActiveStep(index);
    setSelectedId(null);
    setFeedback(lessonSteps[index].explanation);
  };
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    applyTutorStep(0);
  }, []);
  useEffect(() => {
    if (!isPlaying || isPaused || studentWorkMode) return;
    const timer = window.setTimeout(() => {
      if (activeStep < lessonSteps.length - 1) applyTutorStep(activeStep + 1);
      else setIsPlaying(false);
    }, 5000);
    return () => window.clearTimeout(timer);
  }, [activeStep, isPlaying, isPaused, studentWorkMode]);

  const commit = (command: BoardCommand) => setBoardState(historyRef.current.execute(command));
  const updateViewport = (viewport: BoardState['viewport']) => setBoardState(historyRef.current.engine.setState({ ...historyRef.current.engine.getState(), viewport }));
  const handleNext = () => {
    if (studentWorkMode) return;
    setIsPaused(false);
    setIsPlaying(true);
    if (activeStep < lessonSteps.length - 1) applyTutorStep(activeStep + 1);
  };
  const handlePrevious = () => {
    if (studentWorkMode) return;
    setIsPaused(false);
    setIsPlaying(true);
    resetLessonTo(Math.max(0, activeStep - 1));
  };
  const handleReplay = () => {
    setStudentWorkMode(false);
    setWaitingForStudent(false);
    setIsPaused(false);
    setIsPlaying(true);
    historyRef.current = new BoardHistory();
    applyTutorStep(0);
  };
  const enterWorkMode = () => {
    setStudentWorkMode(true);
    setWaitingForStudent(true);
    setIsPlaying(false);
    setIsPaused(false);
    setActiveTool(expectedToolToId[currentLessonStep.expectedTool] ?? 'select');
    setFeedback('Your work stays on StudentLayer. Tutorly’s construction remains visible and locked.');
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
    if (objectType === currentLessonStep.expectedTool) {
      setWaitingForStudent(false);
      setFeedback('That is the move. Compare your mark with the construction, then keep exploring.');
    } else setFeedback(`Saved to StudentLayer. For this moment, try a ${currentLessonStep.expectedTool}.`);
  };
  const handleClear = () => {
    if (window.confirm('Clear only your marks? Tutorly’s construction will stay in place.')) {
      commit({ type: 'clear_student_layer' });
      setSelectedId(null);
      setFeedback('Your StudentLayer is clear. The lesson construction is still here.');
    }
  };
  const handleUndo = () => setBoardState(historyRef.current.undo());
  const handleRedo = () => setBoardState(historyRef.current.redo());
  const handleExit = () => { if (window.history.length > 1) window.history.back(); else setFeedback('This lesson is ready to close.'); };
  const handleVoice = () => setFeedback('Talk it through: explain why P and Q use the same radius, then predict where R must land.');
  const handleHint = () => setFeedback(currentLessonStep.hint);
  const handleExplain = () => setFeedback(currentLessonStep.explanation);
  const selectTool = (tool: ToolId) => { setActiveTool(tool); setPanMode(false); };

  return (
    <main className="app-shell">
      <TopBar canUndo={historyRef.current.canUndo()} canRedo={historyRef.current.canRedo()} onUndo={handleUndo} onRedo={handleRedo} onClear={handleClear} onExit={handleExit} studentWorkMode={studentWorkMode} onMyWork={enterWorkMode} onReturnToLesson={returnToLesson} />
      <div className={`workspace ${studentWorkMode ? 'work-mode' : ''}`}>
        {studentWorkMode && <ToolRail activeTool={activeTool} onToolChange={selectTool} />}
        <section className="board-stage" aria-label="Live geometry lesson">
          <div className="board-toolbar">
            <div className="board-status"><span className="status-dot" /> {studentWorkMode ? 'Your marks · StudentLayer' : 'Tutorly is walking through the construction'}</div>
            <div className="playback-bar" aria-label="Lesson playback controls">
              <button type="button" data-testid="button-previous-step" aria-label="Previous step" title="Previous" onClick={handlePrevious}><ChevronLeft size={16} /></button>
              <button className="primary" type="button" data-testid="button-pause-resume" aria-label={isPaused || !isPlaying ? 'Resume lesson' : 'Pause lesson'} title={isPaused || !isPlaying ? 'Resume' : 'Pause'} onClick={() => { if (!studentWorkMode) { setIsPaused((value) => !value); setIsPlaying(true); } }}>{isPaused || !isPlaying ? <Play size={14} fill="currentColor" /> : <Pause size={14} />}</button>
              <button type="button" data-testid="button-next-step" aria-label="Next step" title="Next" onClick={handleNext}><ChevronRight size={16} /></button>
              <button type="button" data-testid="button-replay-lesson" aria-label="Replay lesson" title="Replay" onClick={handleReplay}><RotateCcw size={14} /></button>
              <span>{studentWorkMode ? 'My work' : isPlaying && !isPaused ? `Step ${activeStep + 1} · playing` : `Step ${activeStep + 1} · paused`}</span>
            </div>
          </div>
          <BoardCanvas state={boardState} activeTool={activeTool} selectedId={selectedId} panMode={panMode} studentWorkMode={studentWorkMode} onSelect={setSelectedId} onCommand={commit} onViewport={updateViewport} onStudentAction={handleStudentAction} onTogglePan={() => setPanMode((value) => !value)} />
        </section>
        <TutorPanel step={activeStep} totalSteps={lessonSteps.length} lessonStep={currentLessonStep} feedback={feedback} waitingForStudent={waitingForStudent} collapsed={collapsed} onCollapse={() => setCollapsed((value) => !value)} onLetMeTry={enterWorkMode} onHint={handleHint} onExplain={handleExplain} onVoice={handleVoice} />
      </div>
      {studentWorkMode && <ToolRail activeTool={activeTool} onToolChange={selectTool} mobile />}
      <button className="mobile-panel-trigger" type="button" data-testid="button-open-tutor-mobile" aria-label="Open Tutorly guide" onClick={() => setMobileSheetOpen(true)}><PanelRight size={15} /> Guide</button>
      {mobileSheetOpen && <><button className="sheet-backdrop" type="button" data-testid="button-close-tutor-backdrop" aria-label="Close Tutorly guide" onClick={() => setMobileSheetOpen(false)} /><div className="mobile-sheet"><TutorPanel step={activeStep} totalSteps={lessonSteps.length} lessonStep={currentLessonStep} feedback={feedback} waitingForStudent={waitingForStudent} onCollapse={() => setMobileSheetOpen(false)} onLetMeTry={enterWorkMode} onHint={handleHint} onExplain={handleExplain} onVoice={handleVoice} /></div></>}
      <span className="sr-only" data-testid="status-lesson-progress">{activeStep + 1} of {lessonSteps.length} lesson steps shown</span>
    </main>
  );
}
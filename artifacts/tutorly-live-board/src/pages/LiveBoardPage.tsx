import { useMemo, useRef, useState } from 'react';
import { PanelRight } from 'lucide-react';
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
  const [boardState, setBoardState] = useState<BoardState>(historyRef.current.engine.getState());
  const [activeTool, setActiveTool] = useState<ToolId>('select');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [panMode, setPanMode] = useState(false);
  const [completedSteps, setCompletedSteps] = useState(0);
  const [waitingForStudent, setWaitingForStudent] = useState(false);
  const [feedback, setFeedback] = useState('I will keep the construction clear and editable. Start with Show me, or take the first step yourself.');
  const [collapsed, setCollapsed] = useState(false);
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);

  const currentStepIndex = Math.min(completedSteps, lessonSteps.length - 1);
  const currentLessonStep = lessonSteps[currentStepIndex];
  const currentCommands = useMemo(() => lessonCommands[currentStepIndex], [currentStepIndex]);

  const commit = (command: BoardCommand) => {
    const next = historyRef.current.execute(command);
    setBoardState(next);
  };

  const updateViewport = (viewport: BoardState['viewport']) => {
    const next = historyRef.current.engine.setState({ ...historyRef.current.engine.getState(), viewport });
    setBoardState(next);
  };

  const handleShowMe = () => {
    if (completedSteps >= lessonSteps.length) {
      setFeedback('The bisector is complete. You can still select, move, label, or erase any object on the board.');
      return;
    }
    currentCommands.forEach((command) => historyRef.current.execute(command));
    setBoardState(historyRef.current.engine.getState());
    setCompletedSteps((value) => Math.min(lessonSteps.length, value + 1));
    setWaitingForStudent(false);
    setFeedback(completedSteps === lessonSteps.length - 1 ? 'Beautifully done. The final ray splits the original angle into two equal angles.' : 'That step is in place. Look closely, then continue when you are ready.');
    setActiveTool('select');
  };

  const handleLetMeTry = () => {
    if (completedSteps >= lessonSteps.length) return;
    setWaitingForStudent(true);
    setActiveTool(expectedToolToId[currentLessonStep.expectedTool]);
    setFeedback(`Your turn. Use the ${currentLessonStep.expectedTool} tool; I will watch for the relevant construction.`);
    setMobileSheetOpen(false);
  };

  const handleStudentAction = (objectType: string) => {
    if (!waitingForStudent || completedSteps >= lessonSteps.length) return;
    if (objectType === currentLessonStep.expectedTool) {
      const nextStep = completedSteps + 1;
      setCompletedSteps(nextStep);
      setWaitingForStudent(false);
      setActiveTool('select');
      setFeedback(nextStep >= lessonSteps.length ? 'You completed the construction. The final ray is the angle bisector.' : 'Nice work. That construction step is correct. Take a look at the next instruction.');
    } else {
      setFeedback(`That mark is saved. For this step, Tutorly is looking for a ${currentLessonStep.expectedTool}.`);
    }
  };

  const handleClear = () => {
    if (window.confirm('Clear every object from the board?')) {
      commit({ type: 'clear_board' });
      setSelectedId(null);
      setFeedback('The board is clear. Your lesson progress is still here whenever you want to continue.');
    }
  };

  const handleUndo = () => setBoardState(historyRef.current.undo());
  const handleRedo = () => setBoardState(historyRef.current.redo());
  const handleExit = () => {
    if (window.history.length > 1) window.history.back();
    else setFeedback('Exit is ready for the Tutorly lesson host.');
  };
  const handleVoice = () => window.alert('Voice Chat will connect here.');
  const handleHint = () => setFeedback(currentLessonStep.hint);
  const handleExplain = () => setFeedback('A classical construction uses equal radii: points on the first arc establish matching centers, then their arcs meet on the angle bisector.');

  return (
    <main className="app-shell">
      <TopBar canUndo={historyRef.current.canUndo()} canRedo={historyRef.current.canRedo()} onUndo={handleUndo} onRedo={handleRedo} onClear={handleClear} onExit={handleExit} />
      <div className="workspace">
        <ToolRail activeTool={activeTool} onToolChange={(tool) => { setActiveTool(tool); setPanMode(false); }} />
        <section className="board-stage" aria-label="Live geometry board">
          <div className="board-toolbar">
            <div className="board-status"><span className="status-dot" /> Local board · edits are saved in this session</div>
            {selectedId && <span className="eyebrow" data-testid="text-selection-status">Object selected</span>}
          </div>
          <BoardCanvas state={boardState} activeTool={activeTool} selectedId={selectedId} panMode={panMode} onSelect={setSelectedId} onCommand={commit} onViewport={updateViewport} onStudentAction={handleStudentAction} onTogglePan={() => setPanMode((value) => !value)} />
        </section>
        <TutorPanel step={completedSteps} totalSteps={lessonSteps.length} lessonStep={currentLessonStep} feedback={feedback} waitingForStudent={waitingForStudent} collapsed={collapsed} onCollapse={() => setCollapsed((value) => !value)} onShowMe={handleShowMe} onLetMeTry={handleLetMeTry} onHint={handleHint} onExplain={handleExplain} onVoice={handleVoice} />
      </div>
      <ToolRail activeTool={activeTool} onToolChange={(tool) => { setActiveTool(tool); setPanMode(false); }} mobile />
      <button className="mobile-panel-trigger" type="button" data-testid="button-open-tutor-mobile" aria-label="Open Tutorly guide" onClick={() => setMobileSheetOpen(true)}><PanelRight size={15} /> Guide</button>
      {mobileSheetOpen && <><button className="sheet-backdrop" type="button" data-testid="button-close-tutor-backdrop" aria-label="Close tutor guide" onClick={() => setMobileSheetOpen(false)} /><div className="mobile-sheet"><TutorPanel step={completedSteps} totalSteps={lessonSteps.length} lessonStep={currentLessonStep} feedback={feedback} waitingForStudent={waitingForStudent} onCollapse={() => setMobileSheetOpen(false)} onShowMe={handleShowMe} onLetMeTry={handleLetMeTry} onHint={handleHint} onExplain={handleExplain} onVoice={handleVoice} /></div></>}
      <span className="sr-only" data-testid="status-lesson-progress">{completedSteps} of {lessonSteps.length} lesson steps complete</span>
    </main>
  );
}
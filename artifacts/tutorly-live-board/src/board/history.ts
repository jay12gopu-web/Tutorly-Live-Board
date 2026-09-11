import { BoardCommandEngine } from './commands';
import type { BoardCommand, BoardState } from './types';

export class BoardHistory {
  readonly engine: BoardCommandEngine;
  private past: BoardState[] = [];
  private future: BoardState[] = [];

  constructor(initial?: Partial<BoardState>) {
    this.engine = new BoardCommandEngine(initial);
  }

  execute(command: BoardCommand) {
    this.past.push(this.engine.getState());
    this.future = [];
    return this.engine.execute(command);
  }

  undo() {
    const previous = this.past.pop();
    if (!previous) return this.engine.getState();
    this.future.push(this.engine.getState());
    return this.engine.setState(previous);
  }

  redo() {
    const next = this.future.pop();
    if (!next) return this.engine.getState();
    this.past.push(this.engine.getState());
    return this.engine.setState(next);
  }

  canUndo() { return this.past.length > 0; }
  canRedo() { return this.future.length > 0; }
}
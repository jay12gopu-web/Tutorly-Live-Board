import type { LessonDefinition } from './lesson';

export const LIVE_BOARD_HANDOFF_KEY = 'tutorly.liveBoard.handoff';

export type LiveBoardHandoff = {
  lessonId?: string;
  lesson?: LessonDefinition;
  conversationId?: string;
  sourceQuestion?: string;
  returnUrl?: string;
  preferredVoice?: string;
};

export type LiveBoardEventType =
  | 'ready'
  | 'step-changed'
  | 'lesson-complete'
  | 'voice-request'
  | 'chat-request'
  | 'exit';

const safeSessionStorage = () => {
  try { return window.sessionStorage; } catch { return null; }
};

export const loadLiveBoardHandoff = (): LiveBoardHandoff => {
  const params = new URLSearchParams(window.location.search);
  const fallback: LiveBoardHandoff = {
    lessonId: params.get('lesson') ?? undefined,
    conversationId: params.get('conversationId') ?? undefined,
    returnUrl: params.get('return') ?? undefined,
    sourceQuestion: params.get('question') ?? undefined,
  };

  const storage = safeSessionStorage();
  const raw = storage?.getItem(LIVE_BOARD_HANDOFF_KEY);
  if (!raw) return fallback;
  try {
    const stored = JSON.parse(raw) as LiveBoardHandoff;
    return {
      ...stored,
      lessonId: fallback.lessonId ?? stored.lessonId,
      conversationId: fallback.conversationId ?? stored.conversationId,
      returnUrl: fallback.returnUrl ?? stored.returnUrl,
      sourceQuestion: fallback.sourceQuestion ?? stored.sourceQuestion,
    };
  } catch {
    return fallback;
  }
};

export const saveLiveBoardHandoff = (handoff: LiveBoardHandoff) => {
  safeSessionStorage()?.setItem(LIVE_BOARD_HANDOFF_KEY, JSON.stringify(handoff));
};

export const emitLiveBoardEvent = (type: LiveBoardEventType, payload: Record<string, unknown> = {}) => {
  const detail = { type: `tutorly:live-board:${type}`, ...payload };
  window.dispatchEvent(new CustomEvent(detail.type, { detail }));
  if (window.parent !== window) {
    window.parent.postMessage(detail, window.location.origin);
    return true;
  }
  return false;
};

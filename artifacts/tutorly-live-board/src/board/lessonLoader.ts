import type { BoardCommand } from './types';
import { defaultLessonId, getBuiltInLesson, type LessonDefinition, type LessonStep } from './lesson';

const supportedCommands = new Set<BoardCommand['type']>([
  'draw_point', 'draw_line', 'draw_ray', 'draw_arrow', 'draw_circle', 'draw_arc', 'draw_rectangle',
  'draw_text', 'draw_axes', 'draw_graph', 'plot_point', 'plot_function', 'draw_number_line',
  'highlight', 'draw_path', 'move_object', 'delete_object', 'clear_board', 'clear_student_layer',
  'zoom_to', 'focus_objects',
]);

const isFiniteNumber = (value: unknown) => typeof value === 'number' && Number.isFinite(value);
const isPlainObject = (value: unknown): value is Record<string, unknown> => Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const isFocusArea = (value: unknown) => {
  if (!isPlainObject(value)) return false;
  return ['x', 'y', 'width', 'height'].every((key) => isFiniteNumber(value[key])) && (!('padding' in value) || isFiniteNumber(value.padding));
};

const isCommand = (value: unknown): value is BoardCommand => {
  if (!isPlainObject(value) || typeof value.type !== 'string' || !supportedCommands.has(value.type as BoardCommand['type'])) return false;
  if (value.type === 'clear_board' || value.type === 'clear_student_layer') return true;
  return !('payload' in value) || isPlainObject(value.payload);
};

const isStep = (value: unknown): value is LessonStep => {
  if (!isPlainObject(value)) return false;
  if (typeof value.id !== 'string' || typeof value.title !== 'string' || typeof value.instruction !== 'string' || typeof value.explanation !== 'string' || typeof value.hint !== 'string') return false;
  if (!Array.isArray(value.commands) || value.commands.length > 80 || !value.commands.every(isCommand)) return false;
  if ('durationMs' in value && (!isFiniteNumber(value.durationMs) || (value.durationMs as number) < 1200 || (value.durationMs as number) > 15000)) return false;
  if ('focus' in value && value.focus !== undefined && !isFocusArea(value.focus)) return false;
  return true;
};

export const validateLessonDefinition = (value: unknown): value is LessonDefinition => {
  if (!isPlainObject(value)) return false;
  if (typeof value.id !== 'string' || value.id.length > 100) return false;
  if (typeof value.title !== 'string' || value.title.length > 160) return false;
  if (typeof value.subject !== 'string' || typeof value.topic !== 'string' || typeof value.description !== 'string') return false;
  if (!['geometry', 'graph', 'number-line', 'science', 'process'].includes(String(value.kind))) return false;
  if (!Array.isArray(value.steps) || value.steps.length < 1 || value.steps.length > 50 || !value.steps.every(isStep)) return false;
  return true;
};

export const parseExternalLesson = (raw: unknown): LessonDefinition | null => {
  try {
    const value = typeof raw === 'string' ? JSON.parse(raw) : raw;
    return validateLessonDefinition(value) ? value : null;
  } catch {
    return null;
  }
};

export const resolveLesson = (externalLesson?: unknown, lessonId?: string | null) => {
  const parsed = parseExternalLesson(externalLesson);
  if (parsed) return parsed;
  return getBuiltInLesson(lessonId || defaultLessonId);
};

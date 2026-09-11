import type { BoardCommand } from './types';

export type LessonAnimation = { sequence: 'construction' | 'plot'; objectKinds?: string[] };
export type LessonStep = {
  title: string;
  instruction: string;
  explanation: string;
  hint: string;
  expectedTool: string;
  focus: { x: number; y: number; width: number; height: number; padding?: number };
  animation?: LessonAnimation;
};

export const lessonCommands: BoardCommand[][] = [
  [
    { type: 'draw_point', payload: { x: 390, y: 380, label: 'V', createdBy: 'tutorly' } },
    { type: 'draw_ray', payload: { x1: 390, y1: 380, x2: 760, y2: 170, label: 'ray VA', createdBy: 'tutorly' } },
    { type: 'draw_ray', payload: { x1: 390, y1: 380, x2: 760, y2: 590, label: 'ray VB', createdBy: 'tutorly' } },
  ],
  [
    { type: 'draw_arc', payload: { cx: 390, cy: 380, r: 76, startAngle: -30, endAngle: 30, label: 'vertex arc', createdBy: 'tutorly' } },
  ],
  [
    { type: 'draw_point', payload: { x: 456, y: 342, label: 'P', createdBy: 'tutorly' } },
    { type: 'draw_point', payload: { x: 456, y: 418, label: 'Q', createdBy: 'tutorly' } },
  ],
  [
    { type: 'draw_arc', payload: { cx: 456, cy: 342, r: 132, startAngle: 24, endAngle: 100, label: 'arc from P', createdBy: 'tutorly' } },
    { type: 'draw_arc', payload: { cx: 456, cy: 418, r: 132, startAngle: -100, endAngle: -24, label: 'arc from Q', createdBy: 'tutorly' } },
  ],
  [
    { type: 'draw_point', payload: { x: 685, y: 380, label: 'R', createdBy: 'tutorly' } },
  ],
  [
    { type: 'draw_ray', payload: { x1: 390, y1: 380, x2: 730, y2: 380, label: 'bisector VR', createdBy: 'tutorly' } },
    { type: 'draw_text', payload: { x: 530, y: 365, text: 'angle bisector', fontSize: 16, createdBy: 'tutorly' } },
  ],
];

export const lessonSteps: LessonStep[] = [
  { title: 'Start with the angle', instruction: 'Every construction begins at one vertex. Watch the two rays open the angle.', explanation: 'Two rays share V, giving us the angle we will divide into two equal parts.', hint: 'Choose Ray, click the vertex, then drag outward. Repeat for the second side.', expectedTool: 'ray', focus: { x: 350, y: 145, width: 450, height: 470, padding: 22 }, animation: { sequence: 'construction', objectKinds: ['line'] } },
  { title: 'Mark the vertex arc', instruction: 'A small arc centered at V crosses both sides of the angle.', explanation: 'The arc gives us two matching points without measuring the angle itself.', hint: 'The arc tool starts at its center. Drag outward to set its radius and sweep.', expectedTool: 'arc', focus: { x: 315, y: 305, width: 165, height: 155, padding: 42 }, animation: { sequence: 'construction', objectKinds: ['arc'] } },
  { title: 'Name the intersections', instruction: 'The arc meets the rays at P and Q. Those points become our matching centers.', explanation: 'P and Q are equally far from V because they lie on one circle.', hint: 'Select Point and tap each ray where the small arc crosses it.', expectedTool: 'point', focus: { x: 395, y: 300, width: 125, height: 165, padding: 55 }, animation: { sequence: 'construction', objectKinds: ['point'] } },
  { title: 'Draw two matching arcs', instruction: 'From P and Q, draw equal-radius arcs toward the middle.', explanation: 'Using the same radius makes every point on these arcs equally far from P and Q.', hint: 'Start each arc at one of the marked points and use a similar radius.', expectedTool: 'arc', focus: { x: 325, y: 205, width: 315, height: 350, padding: 42 }, animation: { sequence: 'construction', objectKinds: ['arc'] } },
  { title: 'Find their intersection', instruction: 'The two arcs meet at R inside the angle.', explanation: 'R is the point that is equally far from P and Q, so it sits on the bisector.', hint: 'The new point should sit between the rays, above the vertex.', expectedTool: 'point', focus: { x: 620, y: 315, width: 130, height: 130, padding: 52 }, animation: { sequence: 'construction', objectKinds: ['point'] } },
  { title: 'Draw the bisector', instruction: 'Connect V to R. The new ray splits the angle exactly in two.', explanation: 'The final ray is the angle bisector: both smaller angles are equal.', hint: 'Use Ray from the original vertex through the arc intersection.', expectedTool: 'ray', focus: { x: 350, y: 145, width: 450, height: 470, padding: 22 }, animation: { sequence: 'construction', objectKinds: ['line', 'label'] } },
];
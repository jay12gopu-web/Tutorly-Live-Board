import type { BoardCommand } from './types';

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

export const lessonSteps = [
  { title: 'Start with the angle', instruction: 'Draw two rays from the same vertex. This gives us the angle we will bisect.', hint: 'Choose Ray, click the vertex, then drag outward. Repeat for the second side.', expectedTool: 'ray' },
  { title: 'Mark the vertex arc', instruction: 'Draw a small arc centered at the vertex so it crosses both sides of the angle.', hint: 'The arc tool starts at its center. Drag outward to set its radius and sweep.', expectedTool: 'arc' },
  { title: 'Name the intersections', instruction: 'Place a point where the vertex arc meets each ray.', hint: 'Select Point and tap each ray where the small arc crosses it.', expectedTool: 'point' },
  { title: 'Draw two matching arcs', instruction: 'From each intersection point, draw an arc with the same radius. Let the arcs reach toward one another.', hint: 'Start each arc at one of the marked points and use a similar radius.', expectedTool: 'arc' },
  { title: 'Find their intersection', instruction: 'Mark the point where those two arcs meet inside the angle.', hint: 'The new point should sit between the rays, above the vertex.', expectedTool: 'point' },
  { title: 'Draw the bisector', instruction: 'Connect the vertex to the new point. That ray is the angle bisector.', hint: 'Use Ray from the original vertex through the arc intersection.', expectedTool: 'ray' },
];
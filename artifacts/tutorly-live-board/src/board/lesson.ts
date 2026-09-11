import type { BoardCommand, FocusArea, GraphConfig, ToolId } from './types';

export type LessonKind = 'geometry' | 'graph' | 'number-line' | 'science' | 'process';

export type LessonStep = {
  id: string;
  title: string;
  instruction: string;
  explanation: string;
  hint: string;
  expectedTool?: ToolId;
  durationMs?: number;
  focus?: FocusArea;
  commands: BoardCommand[];
};

export type LessonDefinition = {
  id: string;
  title: string;
  subject: string;
  topic: string;
  kind: LessonKind;
  description: string;
  showBaseGrid?: boolean;
  steps: LessonStep[];
};

const tutorly = { createdBy: 'tutorly' as const };
const indigo = { stroke: '#6874e8' };
const teal = { stroke: '#45979b' };
const gold = { stroke: '#d2a640' };
const slate = { stroke: '#7a809f' };

const angleFocus: FocusArea = { x: 330, y: 130, width: 500, height: 500, padding: 30 };

export const angleBisectorLesson: LessonDefinition = {
  id: 'angle-bisector',
  title: 'Construct an Angle Bisector',
  subject: 'Mathematics',
  topic: 'Angle Bisector',
  kind: 'geometry',
  description: 'A compass-style construction that divides an angle into two equal parts.',
  showBaseGrid: false,
  steps: [
    {
      id: 'angle-start',
      title: 'Start with the angle',
      instruction: 'Every construction begins at one vertex. Watch the two rays open the angle.',
      explanation: 'Two rays share V, giving us the angle we will divide into two equal parts.',
      hint: 'Choose Ray, click the vertex, then drag outward. Repeat for the second side.',
      expectedTool: 'ray',
      durationMs: 5000,
      focus: angleFocus,
      commands: [
        { type: 'draw_point', payload: { x: 390, y: 380, label: 'V', ...tutorly } },
        { type: 'draw_ray', payload: { x1: 390, y1: 380, x2: 760, y2: 170, label: 'ray VA', ...tutorly } },
        { type: 'draw_ray', payload: { x1: 390, y1: 380, x2: 760, y2: 590, label: 'ray VB', ...tutorly } },
      ],
    },
    {
      id: 'angle-vertex-arc',
      title: 'Mark the vertex arc',
      instruction: 'A small arc centered at V crosses both sides of the angle.',
      explanation: 'The arc gives us two matching points without measuring the angle itself.',
      hint: 'The arc tool starts at its center. Drag outward to set its radius and sweep.',
      expectedTool: 'arc',
      durationMs: 4500,
      focus: { x: 315, y: 300, width: 180, height: 170, padding: 45 },
      commands: [
        { type: 'draw_arc', payload: { cx: 390, cy: 380, r: 76, startAngle: -30, endAngle: 30, label: 'vertex arc', ...tutorly } },
      ],
    },
    {
      id: 'angle-intersections',
      title: 'Name the intersections',
      instruction: 'The arc meets the rays at P and Q. Those points become our matching centers.',
      explanation: 'P and Q are equally far from V because they lie on one circle.',
      hint: 'Select Point and tap each ray where the small arc crosses it.',
      expectedTool: 'point',
      durationMs: 4200,
      focus: { x: 395, y: 295, width: 140, height: 175, padding: 55 },
      commands: [
        { type: 'draw_point', payload: { x: 456, y: 342, label: 'P', ...tutorly } },
        { type: 'draw_point', payload: { x: 456, y: 418, label: 'Q', ...tutorly } },
      ],
    },
    {
      id: 'angle-matching-arcs',
      title: 'Draw two matching arcs',
      instruction: 'From P and Q, draw equal-radius arcs toward the middle.',
      explanation: 'Using the same radius makes every point on these arcs equally far from P and Q.',
      hint: 'Start each arc at one of the marked points and use the same radius.',
      expectedTool: 'arc',
      durationMs: 5200,
      focus: { x: 325, y: 205, width: 390, height: 350, padding: 40 },
      commands: [
        { type: 'draw_arc', payload: { cx: 456, cy: 342, r: 132, startAngle: 24, endAngle: 100, label: 'arc from P', ...tutorly } },
        { type: 'draw_arc', payload: { cx: 456, cy: 418, r: 132, startAngle: -100, endAngle: -24, label: 'arc from Q', ...tutorly } },
      ],
    },
    {
      id: 'angle-r',
      title: 'Find their intersection',
      instruction: 'The two arcs meet at R inside the angle.',
      explanation: 'R is equally far from P and Q, so it lies on the angle bisector.',
      hint: 'The new point should sit between the rays.',
      expectedTool: 'point',
      durationMs: 4200,
      focus: { x: 610, y: 305, width: 150, height: 150, padding: 55 },
      commands: [{ type: 'draw_point', payload: { x: 685, y: 380, label: 'R', ...tutorly } }],
    },
    {
      id: 'angle-finish',
      title: 'Draw the bisector',
      instruction: 'Connect V to R. The new ray splits the angle exactly in two.',
      explanation: 'VR is the angle bisector, so the two smaller angles are equal.',
      hint: 'Use Ray from the original vertex through the arc intersection.',
      expectedTool: 'ray',
      durationMs: 6000,
      focus: angleFocus,
      commands: [
        { type: 'draw_ray', payload: { x1: 390, y1: 380, x2: 730, y2: 380, label: 'bisector VR', ...tutorly, style: indigo } },
        { type: 'draw_text', payload: { x: 535, y: 362, text: 'angle bisector', fontSize: 16, ...tutorly, style: indigo } },
      ],
    },
  ],
};

const linearGraph: GraphConfig = { x: 180, y: 95, width: 760, height: 540, xMin: -5, xMax: 5, yMin: -5, yMax: 7, xStep: 1, yStep: 1, xLabel: 'x', yLabel: 'y' };
const graphFocus: FocusArea = { x: 125, y: 55, width: 880, height: 630, padding: 20 };

export const linearGraphLesson: LessonDefinition = {
  id: 'linear-graph',
  title: 'Graph y = 2x + 1',
  subject: 'Mathematics',
  topic: 'Linear Graphs',
  kind: 'graph',
  description: 'See the y-intercept, slope and plotted points build into a straight line.',
  showBaseGrid: false,
  steps: [
    {
      id: 'linear-plane', title: 'Build the coordinate plane',
      instruction: 'First we need x- and y-axes with equal graph intervals.',
      explanation: 'The horizontal axis tracks x; the vertical axis tracks y.',
      hint: 'Keep the scale consistent on both axes.', expectedTool: 'axes', durationMs: 3500, focus: graphFocus,
      commands: [
        { type: 'draw_graph', payload: { ...linearGraph, ...tutorly, style: { stroke: '#dfe3f2', strokeWidth: 1 } } },
        { type: 'draw_axes', payload: { ...linearGraph, ...tutorly, style: { stroke: '#8e95b5', strokeWidth: 1.7 } } },
      ],
    },
    {
      id: 'linear-equation', title: 'Read the equation',
      instruction: 'In y = 2x + 1, the +1 tells us where the line crosses the y-axis.',
      explanation: 'The y-intercept is 1, so the first key point is (0, 1).',
      hint: 'For y = mx + c, c is the y-intercept.', expectedTool: 'equation', durationMs: 4300, focus: graphFocus,
      commands: [
        { type: 'draw_text', payload: { x: 970, y: 150, text: 'y = 2x + 1', fontSize: 25, equation: true, ...tutorly } },
        { type: 'draw_text', payload: { x: 970, y: 185, text: 'm = 2   c = 1', fontSize: 16, ...tutorly, style: slate } },
      ],
    },
    {
      id: 'linear-intercept', title: 'Plot the y-intercept',
      instruction: 'Start at x = 0 and y = 1.',
      explanation: 'This point is fixed by the +1 in the equation.',
      hint: 'Find 0 on the x-axis, then move up to 1.', expectedTool: 'point', durationMs: 4200, focus: graphFocus,
      commands: [{ type: 'plot_point', payload: { graph: linearGraph, xValue: 0, yValue: 1, label: '(0, 1)', ...tutorly } }],
    },
    {
      id: 'linear-slope', title: 'Use the slope',
      instruction: 'Slope 2 means rise 2 for every run 1.',
      explanation: 'From (0, 1), move right 1 and up 2 to reach (1, 3).',
      hint: 'Slope = rise/run = 2/1.', expectedTool: 'point', durationMs: 5200, focus: graphFocus,
      commands: [
        { type: 'plot_point', payload: { graph: linearGraph, xValue: 1, yValue: 3, label: '(1, 3)', ...tutorly } },
        { type: 'draw_text', payload: { x: 970, y: 235, text: 'rise 2', fontSize: 15, ...tutorly, style: teal } },
        { type: 'draw_text', payload: { x: 970, y: 260, text: 'run 1', fontSize: 15, ...tutorly, style: teal } },
      ],
    },
    {
      id: 'linear-more-points', title: 'Check more points',
      instruction: 'A few extra points confirm the same pattern.',
      explanation: '(-1, -1), (2, 5) and the earlier points all sit on one straight line.',
      hint: 'Substitute x-values into y = 2x + 1.', expectedTool: 'point', durationMs: 4600, focus: graphFocus,
      commands: [
        { type: 'plot_point', payload: { graph: linearGraph, xValue: -1, yValue: -1, label: '(-1, -1)', ...tutorly } },
        { type: 'plot_point', payload: { graph: linearGraph, xValue: 2, yValue: 5, label: '(2, 5)', ...tutorly } },
      ],
    },
    {
      id: 'linear-line', title: 'Draw the line',
      instruction: 'Now connect the pattern into one continuous straight line.',
      explanation: 'Every point on this line satisfies y = 2x + 1.',
      hint: 'The line should cross the y-axis at 1 and keep the same steepness.', expectedTool: 'line', durationMs: 6500, focus: graphFocus,
      commands: [{ type: 'plot_function', payload: { graph: linearGraph, fn: { kind: 'linear', m: 2, b: 1 }, domain: { min: -3, max: 3 }, label: 'y = 2x + 1', ...tutorly, style: { stroke: '#6874e8', strokeWidth: 4 } } }],
    },
  ],
};

const quadraticGraph: GraphConfig = { x: 190, y: 90, width: 760, height: 550, xMin: -4, xMax: 4, yMin: -1, yMax: 9, xStep: 1, yStep: 1, xLabel: 'x', yLabel: 'y' };

export const quadraticGraphLesson: LessonDefinition = {
  id: 'quadratic-graph',
  title: 'Graph y = x²',
  subject: 'Mathematics',
  topic: 'Quadratic Graphs',
  kind: 'graph',
  description: 'Plot symmetric points and watch them form a parabola.',
  showBaseGrid: false,
  steps: [
    {
      id: 'quad-plane', title: 'Set up the graph', instruction: 'Start with a coordinate plane that gives enough room above the x-axis.', explanation: 'Because x² is never negative, the curve will sit on or above y = 0.', hint: 'Use equal x intervals so symmetry is easy to see.', expectedTool: 'axes', durationMs: 3500, focus: graphFocus,
      commands: [
        { type: 'draw_graph', payload: { ...quadraticGraph, ...tutorly, style: { stroke: '#dfe3f2', strokeWidth: 1 } } },
        { type: 'draw_axes', payload: { ...quadraticGraph, ...tutorly, style: { stroke: '#8e95b5', strokeWidth: 1.7 } } },
        { type: 'draw_text', payload: { x: 975, y: 150, text: 'y = x²', fontSize: 27, equation: true, ...tutorly } },
      ],
    },
    {
      id: 'quad-vertex', title: 'Plot the vertex', instruction: 'When x = 0, y = 0.', explanation: '(0, 0) is the lowest point of y = x², called the vertex.', hint: 'Substitute 0 for x.', expectedTool: 'point', durationMs: 4000, focus: graphFocus,
      commands: [{ type: 'plot_point', payload: { graph: quadraticGraph, xValue: 0, yValue: 0, label: '(0, 0)', ...tutorly } }],
    },
    {
      id: 'quad-near', title: 'Add symmetric points', instruction: 'x = 1 and x = -1 both give y = 1.', explanation: 'The graph mirrors across the y-axis.', hint: 'Squaring a positive or negative 1 gives the same result.', expectedTool: 'point', durationMs: 4500, focus: graphFocus,
      commands: [
        { type: 'plot_point', payload: { graph: quadraticGraph, xValue: -1, yValue: 1, label: '(-1, 1)', ...tutorly } },
        { type: 'plot_point', payload: { graph: quadraticGraph, xValue: 1, yValue: 1, label: '(1, 1)', ...tutorly } },
      ],
    },
    {
      id: 'quad-far', title: 'Move farther out', instruction: 'At x = ±2, y becomes 4.', explanation: 'As |x| grows, x² rises faster, making the curve bend upward.', hint: '2² and (-2)² are both 4.', expectedTool: 'point', durationMs: 4500, focus: graphFocus,
      commands: [
        { type: 'plot_point', payload: { graph: quadraticGraph, xValue: -2, yValue: 4, label: '(-2, 4)', ...tutorly } },
        { type: 'plot_point', payload: { graph: quadraticGraph, xValue: 2, yValue: 4, label: '(2, 4)', ...tutorly } },
      ],
    },
    {
      id: 'quad-curve', title: 'Draw the parabola', instruction: 'Connect the pattern with a smooth curve instead of straight segments.', explanation: 'The result is a U-shaped parabola symmetric about the y-axis.', hint: 'The curve should be smooth and pass through all plotted points.', expectedTool: 'graph', durationMs: 6500, focus: graphFocus,
      commands: [{ type: 'plot_function', payload: { graph: quadraticGraph, fn: { kind: 'quadratic', a: 1, b: 0, c: 0 }, domain: { min: -3, max: 3 }, label: 'y = x²', ...tutorly, style: { stroke: '#6874e8', strokeWidth: 4 } } }],
    },
  ],
};

export const inequalityLesson: LessonDefinition = {
  id: 'inequality-number-line',
  title: 'Show −3 < x ≤ 2',
  subject: 'Mathematics',
  topic: 'Inequalities on a Number Line',
  kind: 'number-line',
  description: 'See open and closed endpoints and the interval between them.',
  showBaseGrid: false,
  steps: [
    {
      id: 'ineq-line', title: 'Draw the number line', instruction: 'Lay out values from −5 to 5.', explanation: 'The line gives us a visual scale for the possible values of x.', hint: 'Keep equal distances between consecutive numbers.', expectedTool: 'line', durationMs: 3800, focus: { x: 130, y: 250, width: 900, height: 270, padding: 25 },
      commands: [{ type: 'draw_number_line', payload: { x: 180, y: 380, width: 780, min: -5, max: 5, step: 1, ...tutorly, style: { stroke: '#8e95b5', strokeWidth: 2 } } }],
    },
    {
      id: 'ineq-left', title: 'Read the left boundary', instruction: '−3 < x means x is greater than −3, but −3 itself is not included.', explanation: 'That is why the point at −3 must be open.', hint: 'Strict < or > uses an open endpoint.', expectedTool: 'circle', durationMs: 4300, focus: { x: 260, y: 300, width: 620, height: 180, padding: 30 },
      commands: [{ type: 'draw_circle', payload: { cx: 336, cy: 380, r: 9, label: '−3 not included', ...tutorly, style: { stroke: '#6874e8', strokeWidth: 3 } } }],
    },
    {
      id: 'ineq-right', title: 'Read the right boundary', instruction: 'x ≤ 2 includes the value 2.', explanation: 'That is why the point at 2 is filled.', hint: '≤ or ≥ uses a closed endpoint.', expectedTool: 'point', durationMs: 4200, focus: { x: 260, y: 300, width: 620, height: 180, padding: 30 },
      commands: [{ type: 'draw_point', payload: { x: 726, y: 380, label: '2 included', ...tutorly } }],
    },
    {
      id: 'ineq-interval', title: 'Shade the solution', instruction: 'Every value between −3 and 2 is allowed.', explanation: 'The final interval is open at −3 and closed at 2.', hint: 'Shade only between the two endpoints.', expectedTool: 'highlighter', durationMs: 6200, focus: { x: 220, y: 270, width: 650, height: 230, padding: 30 },
      commands: [
        { type: 'draw_path', payload: { points: [{ x: 336, y: 380 }, { x: 726, y: 380 }], label: 'solution interval', ...tutorly, style: { stroke: '#6874e8', strokeWidth: 8, opacity: .86 } } },
        { type: 'draw_text', payload: { x: 455, y: 300, text: '−3 < x ≤ 2', fontSize: 24, equation: true, ...tutorly } },
      ],
    },
  ],
};

export const waterCycleLesson: LessonDefinition = {
  id: 'water-cycle',
  title: 'The Water Cycle',
  subject: 'Science',
  topic: 'Water Cycle',
  kind: 'process',
  description: 'A deterministic schematic that builds evaporation, condensation, precipitation and collection step by step.',
  showBaseGrid: false,
  steps: [
    {
      id: 'water-scene', title: 'Start with water and energy', instruction: 'The cycle begins with a water body receiving heat from the Sun.', explanation: 'Solar energy warms surface water and gives some molecules enough energy to escape.', hint: 'Look for the energy source first.', durationMs: 4300, focus: { x: 110, y: 80, width: 930, height: 580, padding: 20 },
      commands: [
        { type: 'draw_circle', payload: { cx: 250, cy: 180, r: 55, label: 'Sun', ...tutorly, style: gold } },
        { type: 'draw_text', payload: { x: 226, y: 187, text: 'SUN', fontSize: 17, ...tutorly, style: gold } },
        { type: 'draw_path', payload: { points: [{ x: 180, y: 570 }, { x: 260, y: 550 }, { x: 340, y: 570 }, { x: 420, y: 550 }, { x: 500, y: 570 }, { x: 580, y: 550 }, { x: 660, y: 570 }, { x: 740, y: 550 }, { x: 820, y: 570 }], label: 'water', ...tutorly, style: { stroke: '#45979b', strokeWidth: 7 } } },
        { type: 'draw_text', payload: { x: 420, y: 615, text: 'Collection: lake / ocean', fontSize: 19, ...tutorly, style: teal } },
      ],
    },
    {
      id: 'water-evaporation', title: 'Evaporation', instruction: 'Heated water changes into water vapour and rises.', explanation: 'Evaporation moves water from the surface into the atmosphere.', hint: 'Follow the arrows upward from the water.', durationMs: 5000, focus: { x: 280, y: 250, width: 480, height: 360, padding: 40 },
      commands: [
        { type: 'draw_arrow', payload: { x1: 430, y1: 535, x2: 410, y2: 365, label: 'evaporation', ...tutorly, style: teal } },
        { type: 'draw_arrow', payload: { x1: 535, y1: 535, x2: 540, y2: 340, label: 'water vapour', ...tutorly, style: teal } },
        { type: 'draw_text', payload: { x: 385, y: 320, text: 'EVAPORATION', fontSize: 18, ...tutorly, style: teal } },
      ],
    },
    {
      id: 'water-condensation', title: 'Condensation', instruction: 'Higher up, water vapour cools and forms tiny droplets in clouds.', explanation: 'This change from gas to liquid is condensation.', hint: 'Cooling turns invisible vapour into tiny water droplets.', durationMs: 5200, focus: { x: 470, y: 90, width: 420, height: 320, padding: 30 },
      commands: [
        { type: 'draw_circle', payload: { cx: 620, cy: 235, r: 55, ...tutorly, style: slate } },
        { type: 'draw_circle', payload: { cx: 680, cy: 215, r: 70, ...tutorly, style: slate } },
        { type: 'draw_circle', payload: { cx: 755, cy: 240, r: 52, ...tutorly, style: slate } },
        { type: 'draw_text', payload: { x: 600, y: 330, text: 'CONDENSATION', fontSize: 18, ...tutorly, style: slate } },
      ],
    },
    {
      id: 'water-precipitation', title: 'Precipitation', instruction: 'When cloud droplets become heavy enough, water falls back to Earth.', explanation: 'Rain, snow or hail are forms of precipitation.', hint: 'Now follow the movement downward.', durationMs: 5200, focus: { x: 540, y: 180, width: 390, height: 410, padding: 25 },
      commands: [
        { type: 'draw_arrow', payload: { x1: 635, y1: 290, x2: 620, y2: 470, label: 'rain', ...tutorly, style: { stroke: '#596ec8' } } },
        { type: 'draw_arrow', payload: { x1: 700, y1: 285, x2: 710, y2: 480, label: 'rain', ...tutorly, style: { stroke: '#596ec8' } } },
        { type: 'draw_arrow', payload: { x1: 760, y1: 290, x2: 785, y2: 470, label: 'rain', ...tutorly, style: { stroke: '#596ec8' } } },
        { type: 'draw_text', payload: { x: 610, y: 515, text: 'PRECIPITATION', fontSize: 18, ...tutorly, style: { stroke: '#596ec8' } } },
      ],
    },
    {
      id: 'water-return', title: 'Collection and return', instruction: 'Water gathers in rivers, lakes, oceans and the ground, ready to cycle again.', explanation: 'The water cycle is continuous: collection feeds the next round of evaporation.', hint: 'Trace the cycle back to the water body.', durationMs: 6500, focus: { x: 110, y: 80, width: 930, height: 580, padding: 20 },
      commands: [
        { type: 'draw_arrow', payload: { x1: 850, y1: 520, x2: 720, y2: 565, label: 'runoff / collection', ...tutorly, style: { stroke: '#45979b' } } },
        { type: 'draw_text', payload: { x: 820, y: 600, text: 'The cycle repeats', fontSize: 17, ...tutorly, style: indigo } },
      ],
    },
  ],
};

export const circuitLesson: LessonDefinition = {
  id: 'simple-circuit',
  title: 'A Simple Electric Circuit',
  subject: 'Science',
  topic: 'Electric Circuits',
  kind: 'science',
  description: 'Build a battery-switch-bulb circuit and see why a complete path matters.',
  showBaseGrid: false,
  steps: [
    {
      id: 'circuit-battery', title: 'Start with the cell', instruction: 'A cell provides the potential difference that can drive charge around a circuit.', explanation: 'The long line is the positive terminal and the short line is the negative terminal.', hint: 'A source is needed before current can flow.', durationMs: 4200, focus: { x: 190, y: 250, width: 760, height: 300, padding: 30 },
      commands: [
        { type: 'draw_line', payload: { x1: 280, y1: 330, x2: 280, y2: 430, ...tutorly, style: { stroke: '#6874e8', strokeWidth: 4 } } },
        { type: 'draw_line', payload: { x1: 310, y1: 350, x2: 310, y2: 410, ...tutorly, style: { stroke: '#6874e8', strokeWidth: 4 } } },
        { type: 'draw_text', payload: { x: 245, y: 465, text: 'CELL', fontSize: 17, ...tutorly } },
      ],
    },
    {
      id: 'circuit-wires', title: 'Add the conducting path', instruction: 'Wires create a route from one terminal toward the rest of the circuit.', explanation: 'Current needs a continuous conducting path.', hint: 'Follow the wire around the loop.', expectedTool: 'line', durationMs: 4600, focus: { x: 190, y: 210, width: 780, height: 360, padding: 30 },
      commands: [
        { type: 'draw_line', payload: { x1: 280, y1: 330, x2: 280, y2: 250, ...tutorly, style: slate } },
        { type: 'draw_line', payload: { x1: 280, y1: 250, x2: 475, y2: 250, ...tutorly, style: slate } },
        { type: 'draw_line', payload: { x1: 570, y1: 250, x2: 780, y2: 250, ...tutorly, style: slate } },
        { type: 'draw_line', payload: { x1: 310, y1: 410, x2: 310, y2: 510, ...tutorly, style: slate } },
        { type: 'draw_line', payload: { x1: 310, y1: 510, x2: 780, y2: 510, ...tutorly, style: slate } },
      ],
    },
    {
      id: 'circuit-switch', title: 'Place the switch', instruction: 'The switch controls whether the path is open or closed.', explanation: 'An open switch breaks the circuit, so current cannot complete the loop.', hint: 'A visible gap means the circuit is open.', durationMs: 4700, focus: { x: 390, y: 180, width: 350, height: 180, padding: 35 },
      commands: [
        { type: 'draw_point', payload: { x: 475, y: 250, label: '', ...tutorly, style: slate } },
        { type: 'draw_point', payload: { x: 570, y: 250, label: '', ...tutorly, style: slate } },
        { type: 'draw_line', payload: { x1: 475, y1: 250, x2: 550, y2: 210, label: 'open switch', ...tutorly, style: slate } },
        { type: 'draw_text', payload: { x: 465, y: 190, text: 'SWITCH', fontSize: 16, ...tutorly, style: slate } },
      ],
    },
    {
      id: 'circuit-bulb', title: 'Add the bulb', instruction: 'The bulb changes electrical energy into light and heat.', explanation: 'It will light only when the circuit is complete.', hint: 'The bulb sits in series with the rest of this simple loop.', durationMs: 4500, focus: { x: 650, y: 230, width: 260, height: 310, padding: 30 },
      commands: [
        { type: 'draw_circle', payload: { cx: 780, cy: 380, r: 62, label: 'bulb', ...tutorly, style: gold } },
        { type: 'draw_line', payload: { x1: 740, y1: 340, x2: 820, y2: 420, ...tutorly, style: gold } },
        { type: 'draw_line', payload: { x1: 820, y1: 340, x2: 740, y2: 420, ...tutorly, style: gold } },
        { type: 'draw_line', payload: { x1: 780, y1: 250, x2: 780, y2: 318, ...tutorly, style: slate } },
        { type: 'draw_line', payload: { x1: 780, y1: 442, x2: 780, y2: 510, ...tutorly, style: slate } },
      ],
    },
    {
      id: 'circuit-closed', title: 'Close the circuit', instruction: 'Close the switch and the conducting path becomes continuous.', explanation: 'Now charge can move around the complete loop, so the bulb can light.', hint: 'Look for an unbroken route from one cell terminal back to the other.', durationMs: 6500, focus: { x: 190, y: 180, width: 760, height: 390, padding: 30 },
      commands: [
        { type: 'draw_line', payload: { x1: 475, y1: 250, x2: 570, y2: 250, label: 'closed switch', ...tutorly, style: { stroke: '#45979b', strokeWidth: 4 } } },
        { type: 'draw_text', payload: { x: 450, y: 575, text: 'CLOSED CIRCUIT → bulb can glow', fontSize: 20, ...tutorly, style: teal } },
      ],
    },
  ],
};

export const convexLensLesson: LessonDefinition = {
  id: 'convex-lens',
  title: 'Convex Lens Ray Diagram',
  subject: 'Science',
  topic: 'Light and Lenses',
  kind: 'science',
  description: 'Build the two principal rays and locate the inverted real image.',
  showBaseGrid: false,
  steps: [
    {
      id: 'lens-axis', title: 'Set the optical axis and lens', instruction: 'Start with the principal axis and place the convex lens at the center.', explanation: 'The optical center lies where the lens crosses the principal axis.', hint: 'Keep the axis horizontal and the lens vertical.', durationMs: 4200, focus: { x: 150, y: 130, width: 880, height: 500, padding: 25 },
      commands: [
        { type: 'draw_line', payload: { x1: 160, y1: 380, x2: 1030, y2: 380, label: 'principal axis', ...tutorly, style: slate } },
        { type: 'draw_arc', payload: { cx: 545, cy: 380, r: 205, startAngle: -35, endAngle: 35, label: 'convex lens', ...tutorly, style: indigo } },
        { type: 'draw_arc', payload: { cx: 655, cy: 380, r: 205, startAngle: 145, endAngle: 215, label: '', ...tutorly, style: indigo } },
        { type: 'draw_point', payload: { x: 600, y: 380, label: 'O', ...tutorly } },
        { type: 'draw_point', payload: { x: 470, y: 380, label: 'F₁', ...tutorly, style: teal } },
        { type: 'draw_point', payload: { x: 730, y: 380, label: 'F₂', ...tutorly, style: teal } },
      ],
    },
    {
      id: 'lens-object', title: 'Place the object', instruction: 'Put the object on the left, beyond the focal point.', explanation: 'We will trace rays from the top of this object.', hint: 'Ray diagrams usually start from the top of the object arrow.', expectedTool: 'arrow', durationMs: 4300, focus: { x: 230, y: 170, width: 440, height: 340, padding: 30 },
      commands: [
        { type: 'draw_arrow', payload: { x1: 300, y1: 380, x2: 300, y2: 220, label: 'object', ...tutorly, style: { stroke: '#45979b', strokeWidth: 4 } } },
        { type: 'draw_text', payload: { x: 260, y: 205, text: 'OBJECT', fontSize: 16, ...tutorly, style: teal } },
      ],
    },
    {
      id: 'lens-parallel-ray', title: 'Trace a parallel ray', instruction: 'A ray parallel to the principal axis reaches the lens first.', explanation: 'After refraction through a convex lens, this ray passes through F₂.', hint: 'Parallel before the lens → through the far focus after the lens.', expectedTool: 'ray', durationMs: 5200, focus: { x: 230, y: 150, width: 650, height: 430, padding: 25 },
      commands: [
        { type: 'draw_arrow', payload: { x1: 300, y1: 220, x2: 600, y2: 220, label: 'parallel ray', ...tutorly, style: gold } },
        { type: 'draw_arrow', payload: { x1: 600, y1: 220, x2: 860, y2: 540, label: 'refracted through F₂', ...tutorly, style: gold } },
      ],
    },
    {
      id: 'lens-center-ray', title: 'Trace the center ray', instruction: 'A ray through the optical center continues approximately straight.', explanation: 'Where this ray meets the first refracted ray is where the image forms.', hint: 'Aim through O without bending the ray.', expectedTool: 'ray', durationMs: 5200, focus: { x: 230, y: 150, width: 720, height: 460, padding: 25 },
      commands: [{ type: 'draw_arrow', payload: { x1: 300, y1: 220, x2: 860, y2: 540, label: 'center ray', ...tutorly, style: { stroke: '#596ec8' } } }],
    },
    {
      id: 'lens-image', title: 'Locate the image', instruction: 'The refracted rays meet on the right side of the lens.', explanation: 'The real image is inverted because the rays cross before reaching the image.', hint: 'Draw the image from the axis to the ray intersection.', expectedTool: 'arrow', durationMs: 6500, focus: { x: 520, y: 170, width: 430, height: 420, padding: 35 },
      commands: [
        { type: 'draw_arrow', payload: { x1: 860, y1: 380, x2: 860, y2: 540, label: 'inverted image', ...tutorly, style: { stroke: '#6874e8', strokeWidth: 4 } } },
        { type: 'draw_text', payload: { x: 875, y: 535, text: 'IMAGE', fontSize: 16, ...tutorly } },
      ],
    },
  ],
};

export const lessonCatalog: Record<string, LessonDefinition> = {
  [angleBisectorLesson.id]: angleBisectorLesson,
  [linearGraphLesson.id]: linearGraphLesson,
  [quadraticGraphLesson.id]: quadraticGraphLesson,
  [inequalityLesson.id]: inequalityLesson,
  [waterCycleLesson.id]: waterCycleLesson,
  [circuitLesson.id]: circuitLesson,
  [convexLensLesson.id]: convexLensLesson,
};

export const defaultLessonId = angleBisectorLesson.id;
export const getBuiltInLesson = (id?: string | null) => lessonCatalog[id ?? ''] ?? lessonCatalog[defaultLessonId];

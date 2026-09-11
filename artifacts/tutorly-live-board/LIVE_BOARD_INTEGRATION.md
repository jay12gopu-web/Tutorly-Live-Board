# Tutorly Live Board integration contract

The Live Board can now load either a built-in lesson or a lesson supplied by Tutorly Chat.

## Built-in lesson testing

Use the `lesson` query parameter:

- `?lesson=angle-bisector`
- `?lesson=linear-graph`
- `?lesson=quadratic-graph`
- `?lesson=inequality-number-line`
- `?lesson=water-cycle`
- `?lesson=simple-circuit`
- `?lesson=convex-lens`

## Chat → Live Board handoff

Before navigating to the Live Board, store a handoff in `sessionStorage`:

```ts
sessionStorage.setItem('tutorly.liveBoard.handoff', JSON.stringify({
  conversationId: 'conversation_123',
  sourceQuestion: 'Show me how y = 2x + 1 works',
  returnUrl: '/chat/conversation_123',
  lesson: lessonDefinition,
}));
```

`lesson` is optional. If it is missing, use `lessonId` to select a built-in lesson.

The lesson definition is validated before execution. Unknown command types or malformed lesson data are rejected and the default built-in lesson is used instead.

## Live Board → Tutorly events

The board emits browser `CustomEvent`s and, when embedded in a same-origin parent, `postMessage` events:

- `tutorly:live-board:ready`
- `tutorly:live-board:step-changed`
- `tutorly:live-board:lesson-complete`
- `tutorly:live-board:voice-request`
- `tutorly:live-board:chat-request`
- `tutorly:live-board:exit`

Voice and chat requests carry the current lesson/step and conversation context. The production Tutorly app can listen for these events and hand them to the existing ElevenLabs Voice Chat or normal Tutorly chat pipeline.

## Safe function plots

The board does not evaluate arbitrary JavaScript equations. `plot_function` currently accepts only structured safe functions:

```ts
{ kind: 'linear', m: 2, b: 1 }
{ kind: 'quadratic', a: 1, b: 0, c: 0 }
```

This keeps AI-generated lesson commands deterministic and safe.

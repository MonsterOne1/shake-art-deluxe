# Shake Art Deluxe - React Version

This is a React implementation of Shake Art Deluxe, a drawing application inspired by PS1-style vertex jitter effects.

## Features

- **Drawing Tools**: Freehand, line tool, and line without shake
- **Editing Tools**: Eraser, fill, and eyedropper
- **PS1 Vertex Jitter**: Adjustable shake effect with offset and speed controls
- **Color Controls**: HSV sliders for precise color selection
- **Undo/Redo System**: Full history support
- **GIF Recording**: Export your drawings as animated GIFs
- **Background Music**: Ambient soundtrack with volume controls

## Development

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## Project Structure

```
src/
├── components/          # React components
│   ├── DrawingCanvas.tsx   # Main canvas component
│   ├── Toolbar.tsx         # Tool selection
│   ├── ControlsPanel.tsx   # Color and shake controls
│   ├── RecordingControls.tsx # GIF recording
│   └── AudioManager.tsx    # Background music
├── contexts/           # React contexts
│   └── DrawingContext.tsx  # Global drawing state
├── types/              # TypeScript definitions
└── App.tsx             # Main application component
```

## Technologies Used

- React 19 with TypeScript
- Vite for build tooling
- HTML5 Canvas for drawing
- gif.js for GIF encoding
- Howler.js for audio playback

## Notes

- The shake effect is achieved by randomly offsetting vertex positions during animation
- Canvas size is fixed at 640x480 to match the original
- Mouse coordinates are transformed to match the original coordinate system

## License

GNU AGPLv3 (matching the original project)

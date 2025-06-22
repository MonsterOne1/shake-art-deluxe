# Audio Files

Place the `chill2.ogg` audio file from the original GameMaker project in this directory.

You can find it at: `/sounds/chill2/chill2.ogg`

The AudioManager component will look for:
- `/audio/chill2.ogg` (primary)
- `/audio/chill2.mp3` (fallback)

If you want to use a different audio file, update the path in `src/components/AudioManager.tsx`.
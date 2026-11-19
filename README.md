# Parlance

Parlance pairs the interface from [Manan-2007/testing1](https://github.com/Manan-2007/testing1/tree/0305de29875abc96b2eec0a7554b2905f6046d9f) with the Remy avatar and the English/Hindi signing engine carried over from the local project.

## Run locally

Requires Node.js 22.12 or newer.

```sh
npm ci
npm run dev
```

Open [the local app](http://127.0.0.1:4173). Use the landing-page demo or open the **Speech → Sign** studio. The studio supports typed English and Hindi, browser voice input, replay, speed, mirroring, and a sign timeline.

Text translation runs locally by default. To enable Gemini, copy `.env.example` to `.env`, add `GEMINI_API_KEY`, and restart. The key stays on the server.

The **Sign → Text** camera workspace is from the reference UI. Camera tracking runs in the browser. Recognition requires the compatible VOX WebSocket service. Set its address in Settings, under Camera and microphone.

## Build and test

- `npm run build` typechecks the project and builds web assets into `dist/`.
- `npm run start` previews the built app.
- `npm test` checks gloss output and animation joint coverage for both Remy and YBot.

## Project layout

- `src/features/` and `src/components/` contain the imported Parlance UI.
- `src/avatar/` renders Remy and maps the existing YBot-relative word, letter and digit animations onto Remy’s rig. `public/assets/remy.glb` was converted from the supplied Mixamo FBX, scaled to the signing stage and packaged with its textures. `public/assets/ybot.glb` is the reference rig.
- `src/translation/` and `src/services/signs/prepareSpeech.ts` turn text into the UI queue.
- `server/` provides the optional translation API in local dev and preview.
- `public/signs/` contains the reference camera vocabulary, recognition metadata, and the ISLRTC motion samples used in the landing walkthrough and welcome intro.

The sign animations still need linguistic review on Remy.

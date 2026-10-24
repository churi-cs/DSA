# Happy Birthday Sumu

A mobile-first birthday story built with plain HTML, CSS, and JavaScript. The only local requirement is Python 3 for the preview server.

## Preview locally

From this folder, start the project preview:

```bash
python3 tools/preview.py
```

Open [http://localhost:8000/#open](http://localhost:8000/#open). The `#open` shortcut unlocks the story for preview. Keep the server running while you use the page, then press **Ctrl+C** in the terminal to stop it. To use another port, add `--port 8001`.

### Add memory photos

Put `.jpg`, `.jpeg`, `.png`, `.webp`, `.avif`, or `.gif` images in `pic/`, then reload the page. Section 2 presents them in a calm Anime.js photo wall that changes pages automatically. Section 3 keeps its separate memories in `js/config.js`. Photos are shown in alphabetical filename order; rename files to change their order. The wall uses larger, tilted photos without number labels.

`assets/photos/memories.json` is generated from `pic/` whenever the preview page requests it. Before publishing to static hosting such as GitHub Pages, refresh the committed manifest with:

```bash
python3 tools/build_memory_manifest.py
```

After adding photos, include both the new `pic/` files and the updated manifest when publishing.

The microphone scene needs permission. Localhost is supported by modern browsers; deployed versions should use HTTPS. Google Fonts and Anime.js load from CDNs, so those visual extras need an internet connection.

## Where to edit

- `js/config.js` — birthday date, age, Section 3 polaroid memories, letter, and other personal content.
- `index.html` — page structure and the text attached to each scene.
- `css/styles.css` — base layout, themes, and scene styling.
- `css/features.css` — feature styling and the cake finale design.
- `js/script.js` — scene navigation, animations, sound, and candle/cake interactions.
- `js/features.js` — flower, private note, and reaction features.
- `pic/` — add or remove Section 2 ribbon photos here.
- `assets/photos/memories.json` — generated photo list for Section 2. Do not edit it by hand.
- `tools/encrypt-note.html` — local helper for creating the encrypted private note used by `js/config.js`.
- `docs/references/scene-7-gift-chat.md` — original gift-chat design notes.

## Project layout

```text
.
├── .gitignore
├── index.html
├── assets/
│   ├── gifts/
│   └── photos/
│       ├── memories.json
│       ├── memory-1.jpeg
│       └── memory-5.jpg
├── css/
│   ├── features.css
│   └── styles.css
├── docs/
│   └── references/
│       └── scene-7-gift-chat.md
├── js/
│   ├── config.js
│   ├── features.js
│   └── script.js
├── tools/
│   ├── build_memory_manifest.py
│   ├── encrypt-note.html
│   └── preview.py
├── pic/
│   └── ... memory photos ...
└── README.md
```

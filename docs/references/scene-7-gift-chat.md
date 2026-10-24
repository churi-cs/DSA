# Scene 7: "Where's my gift?!" Animated Chat (Idea + Instructions)

For: Sumu's birthday site | Placement: right after the cake scene and the letter | Language on the site: English | No code in this doc, only the idea and the steps

## 1. The idea

After the cake and the letter, a cute chat begins. Sumu acts "angry" and asks for her gift, you reply "wait", and the gift turns out to be a flower. This scene connects to your flower memory (polaroid #5, the rose painting), so the whole story closes the loop.

## 2. Conversation script (all in English)

| Who | Message | Effect |
| --- | --- | --- |
| Sumu | "Excuse me… where's my gift? 😤" | bubble shake, steam puff |
| Sumu | "It's my BIRTHDAY!! 😡💢" | anger mark pops, speed lines |
| Sumu | "Helloooo?? 👀" | "Seen" tick appears |
| You | typing dots… then "Wait wait wait 😅" | sweat drop 💧 |
| Sumu | "WAIT?? 💢💢💢" | screen shake |
| You | "Okay okay… close your eyes… 🙈" | calm, soft sparkle |
| Gift | countdown 3… 2… 1… | box shakes, lid pops |
| Gift | "🌸 A flower, just for you." | petals burst, flower blooms |
| Sumu | "…" typing, then "Aww 🥹" | angry emoji turns into 😍 |

You can keep the word **Phool** as an inside joke, for example: *"a flower (a phool 😌)"*. That is your choice.

## 3. Anime-style effects (cute and pastel)

- **Manga anger mark 💢:** pops at the corner of the bubble and pulses.
- **Steam puffs:** two small clouds rise from the 😤 emoji.
- **Text shake:** the letters tremble when she is angry and settle when she calms down.
- **Speed lines:** a small manga-style radial burst when she shouts "BIRTHDAY!!".
- **Mood avatar (the best twist):** Sumu's small emoji avatar changes mood: 😡 → 😤 → 🤨 → 🥺 → 😍.
- **Bouncy typing dots, "Seen 👀" tick, spring squish on every bubble** (a rubber-band feel).
- **Sound and haptics:** a soft pop for each bubble, a short vibration when she is angry, a sparkle when the gift opens.
- **Gift reveal:** box shakes, lid pops, petals burst, the flower blooms, then the rose painting polaroid slides in. If the painting is your own artwork, add the caption "Painted just for you". Otherwise use "A flower, just for you."

## 4. Optional extra: anger meter

Sumu taps "Ask again 😤" three times and an anger meter fills to 100%. Then you say "Wait!" and the gift appears. She plays the angry girl herself, which is fun. If time is short, skip this.

## 5. Good placement idea

Your reaction bar (WhatsApp reply) and the secret 🌸 lock are currently in the letter. Move them to the **end of this new scene**. The emotional peak is right after "Aww 🥹", so replying then feels most natural.

## 6. Instructions (no code)

1. **Fix the flow.** Add a "Continue 💌" button in the letter modal that goes to scene 7. The progress dots change from 6 to 7. "Restart" still goes back to scene 1.
2. **Add the new scene (HTML).** Create a new `scene-6` after the cake scene. Inside: a chat header (avatar, "Sumu", status), the message list, the mood avatar, the gift box area, and a continue hint at the bottom.
3. **Keep all text in config.** In `js/config.js` add a `gift` section: the list of messages (who sends it, the text, which effect), the gift caption, the painting path, and the final line. Then you only edit the config to change any text later.
4. **Style (CSS).** Bubbles (left and right), anger mark, shake, speed lines, steam, typing dots, gift box, mood avatar. Reuse your existing color variables so the UI and dark mode stay the same.
5. **Logic (JavaScript).** Create a new file `js/gift-chat.js` (loaded last, like `cake3d.js`) or add an `initScene6` function in `script.js`. The message player shows typing dots first, then the bubble and its effect. Effect names (shake, anger, seen, big, and so on) choose the animation. Tapping fast-forwards so it never feels slow. Respect `prefers-reduced-motion` by using gentler animations.
6. **Reuse your existing tools:** the anime.js timeline for sequencing, `sound` (pop and sparkle), `vibrateDevice`, `fx` (petals and confetti), and the flower bloom function in `features.js`.
7. **Wire the navigation.** Add a scene 6 case in `goToScene`, and clean up animation timers when leaving the scene. If you move the reaction bar and secret flower, move them to the end of scene 6.
8. **Cache bust and test.** Use `?v=3` on the script and style links. Test on a small phone, in dark mode, and check that the console has no errors.

## 7. Prompt for Claude Code (paste it)

> Add a new scene after the cake and letter: an animated chat where Sumu angrily asks where her gift is, with anime-style effects (anger mark, steam, text shake, speed lines, mood-emoji avatar), then a gift box reveals a flower and the rose painting. All text in English and stored in config.js. Keep the existing colors and style. Plan first, one step at a time, and move the reaction bar and secret flower to the end of this scene.

## 8. Time plan

Today is 24 Oct, so if time is short build the **minimum version**: 6 messages, the mood avatar, and the gift reveal. Leave speed lines and the anger meter for later.

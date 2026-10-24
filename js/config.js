/* ==========================================================================
   config.js: EVERYTHING you personalize lives here.
   Loaded first (before script.js). Search for "TODO" before you deploy.
   ========================================================================== */
const CONFIG = {
  /* ---------- The basics ---------- */
  name: 'Sumu',
  age: 17,                                   // her age (count-up on scene 2)
  birthday: new Date(2026, 9, 25, 0, 0, 0), // 25 Oct 2026 00:00 (month is 0-based: 9 = October)

  /* ---------- Scene 3: memories (polaroids) ----------
     e: emoji shown on the polaroid, c: typewriter caption.
     flower: true -> show the blooming SVG flower.
     img: 'path' -> show an image from assets/photos/. */
  memories: [
    { e: '📸', img: 'pic/1%23.jpeg', c: 'The day we became friends… that date.' },
    { e: '🎵', c: 'That song we couldn\'t stop singing…' },
    { e: '😂', c: 'When we laughed until we cried…' },
    { e: '🌟', c: 'The moment I knew you were special…' },
    { e: '🌸', flower: true, img: 'assets/photos/memory-5.jpg', c: 'Your thoughtful little gifts and kind advice mean so much to me. 💗' },
    { e: '💌', c: 'A little note from you can brighten my whole day…' },
    { e: '🎂', c: 'Celebrating all the small, happy moments together…' },
    { e: '🧁', c: 'The sweetest memories are always the ones we share…' },
    { e: '🌷', c: 'Keep being thoughtful, brave, and wonderfully you…' },
    { e: '✨', c: 'Here is to many more memories, laughs, and dreams…' }
  ],

  /* ---------- Scene 4: prescription ---------- */
  metDateLabel: 'DD Mon YYYY',               // TODO: the date you two met, e.g. '12 Mar 2025' (shown on the card)

  /* ---------- Scene 5: secret memory lock ----------
     The note is ENCRYPTED. Create "pack" with tools/encrypt-note.html.
     TODO: use a private code that is NOT the date printed on the prescription. */
  secret: {
    hint: 'DEMO: enter 123456',              // TODO: a cryptic hint only she understands, e.g. 'Enter the day it all began'
    length: 6,                               // number of digits in the code
    pack: '{"s":"Nq8YqrHex3oHQBEw/F5FZA==","i":"rHLBsDLEUn+y7IS/","c":"pIxwW8fUdKI6KxBcV4xf/VaYH8ehNj6ejgEvo6jnqoufHX1sj4m4EbzD+SYNAaA0vjnYdwTk5v+jHJEoVRzdUdk1duRWClS29CNOatRT479rqT+OhTm/bp0Bs/e1hPiT2TKGfUnRxT9Ah2Qo5fwcEHY="}'                           // TODO: replace the demo note with your own encrypted note
  },

  /* ---------- Scene 5: reaction bar -> WhatsApp ---------- */
  reply: {
    number: '8801XXXXXXXXX',                 // TODO: your WhatsApp number, country code, no + or spaces (it will be public!)
    toName: 'me',
    text: (emoji) => `${emoji} Loved the birthday surprise!`
  },

  /* ---------- Scene 6: gift chat ---------- */
  gift: {
    chatName: 'Sumu',
    readyStatus: 'online',
    typingStatus: 'typing…',
    continueLabel: 'Relive the magic ↺',
    card: {
      artworkPath: 'assets/gifts/birthday-gift-card-v2.jpeg',
      message: 'A little something chosen just for you. I hope it makes your birthday feel even more beautiful. 💗',
      claimCode: '',
      claimLabel: 'Claim & copy gift code ✨',
      claimedLabel: 'Gift code copied 💗'
    },
    messages: [
      { who: 'Sumu', text: 'Excuse me… where\'s my gift? 😤', effect: 'anger' },
      { who: 'Sumu', text: 'It\'s my BIRTHDAY!! 😡💢', effect: 'rage' },
      { who: 'Sumu', text: 'Helloooo?? 👀', effect: 'seen' },
      { who: 'You', effect: 'typing' },
      { who: 'You', text: 'Wait wait wait 😅', effect: 'sweat' },
      { who: 'Sumu', text: 'WAIT?? 💢💢💢', effect: 'shake' },
      { who: 'You', text: 'Okay okay… close your eyes… 🙈', effect: 'soft' },
      { who: 'Gift', text: '3… 2… 1…', effect: 'countdown' },
      { who: 'Gift', text: '🌸 A flower, just for you.', effect: 'reveal' },
      { who: 'Sumu', text: 'Aww 🥹', effect: 'happy' }
    ]
  },

  /* ---------- Scene 5: the letter ---------- */
  letter: 'Dear Sumu,\n\nHappy Birthday! 🎂\n\nYou are one of the most amazing people I know. Your kindness, your laughter, your determination to become a doctor — everything about you inspires me.\n\nI hope this year brings you everything you deserve and more. Keep shining, future Dr. Sumu! 🩺✨\n\nWith all my love,\nYour friend 💗'
};

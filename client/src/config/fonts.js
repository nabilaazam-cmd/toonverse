// The comic lettering fonts creators can choose for speech bubbles and text.
// They are loaded from Google Fonts in index.html. The text tool's font picker (task 7.12)
// and the "wait for fonts" step (task 7.13) both read this list.
//
// name:   the font name shown to creators and saved with the text.
// family: the CSS font family, with a fallback if the font has not loaded.
//
// The first font is the default. Saved panels store the font name, so do not rename
// or remove a font without planning for existing work.
//
// Future consideration (not part of task 1.13): these fonts have no Urdu letters.
// Urdu text in a bubble falls back to a system font until an Urdu font is chosen.
export const LETTERING_FONTS = [
  { name: 'Comic Neue', family: "'Comic Neue', cursive" },
  { name: 'Bangers', family: "'Bangers', cursive" },
  { name: 'Patrick Hand', family: "'Patrick Hand', cursive" },
];

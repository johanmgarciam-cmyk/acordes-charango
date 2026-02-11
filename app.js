// ==============================
// VARIABLES PRINCIPALES
// ==============================
const notes = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
const frets = 18;

// Afinación estándar: G4, C5, E4/E5, A4, E5
const tuning = [
  { note: 'G4', octave: 4 },
  { note: 'C5', octave: 5 },
  { note: 'E4', octave: 4, octave2: 5 },
  { note: 'A4', octave: 4 },
  { note: 'E5', octave: 5 }
];

let selected = [];
const charangoDiv = document.getElementById('charango');

// ==============================
// POLISINTETIZADOR CON FILTRO
// ==============================
const synth = new Tone.PolySynth(Tone.Synth, {
  oscillator: { type: "triangle" },
  envelope: { attack: 0.005, decay: 0.2, sustain: 0.2, release: 1 }
}).toDestination();

const filter = new Tone.Filter(1200, "lowpass").toDestination();
synth.connec


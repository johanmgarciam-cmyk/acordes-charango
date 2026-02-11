// ==============================
// VARIABLES PRINCIPALES
// ==============================
const notes = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
const frets = 18;

const tuning = [
  { name: 'G', freqs: [391.99] },
  { name: 'C', freqs: [523.25] },
  { name: 'E', freqs: [329.63, 659.25] },
  { name: 'A', freqs: [440.00] },
  { name: 'E', freqs: [659.25] }
];

let selected = [];
const charangoDiv = document.getElementById('charango');

// ==============================
// CREAR DIAPASÓN
// ==============================
tuning.forEach((string, s) => {
  for (let f = 0; f <= frets; f++) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    const note = notes[(notes.indexOf(string.name) + f) % 12];
    cell.dataset.string = s;
    cell.dataset.fret = f;
    cell.innerHTML = `O ${5-s}<br>T${f}<br>${note}`;
    cell.onclick = () => toggleCell(cell, s, f, note);
    charangoDiv.appendChild(cell);
  }
});

// ==============================
// FUNCIONES DE INTERACCIÓN
// ==============================
function toggleCell(cell, s, f, note) {
  const idx = selected.findIndex(n => n.s === s && n.f === f);
  if (idx >= 0) {
    selected.splice(idx,1);
    cell.classList.remove('active');
  } else {
    selected.push({ s,f,note });
    cell.classList.add('active');
    playFreqs(freqsAt(s,f));
  }
  renderSelected();
}

function freqsAt(stringIndex, fret) {
  return tuning[stringIndex].freqs.map(f => f * Math.pow(2, fret / 12));
}

// ==============================
// AUDIO CON TONE.JS
// ==============================
function playFreqs(freqs) {
  freqs.forEach(freq => {
    const osc = new Tone.Oscillator(freq, "triangle").toDestination();
    osc.start();
    osc.stop("+0.8");
  });
}

// ==============================
// RENDER NOTAS SELECCIONADAS
// ==============================
function renderSelected() {
  const ul = document.getElementById('selectedNotes');
  ul.innerHTML = '';
  selected.forEach(n => {
    const li = document.createElement('li');
    li.textContent = `O ${5 - n.s}, traste ${n.f} → ${n.note}`;
    ul.appendChild(li);
  });
}

// ==============================
// EVENTOS DE BOTONES
// ==============================
document.getElementById('playChordBtn').onclick = () => {
  selected.forEach(n => playFreqs(freqsAt(n.s,n.f)));
};

document.getElementById('saveChordBtn').onclick = () => {
  const name = document.getElementById('chordName').value || 'Sin nombre';
  const data = { name, positions: selected };
  const saved = JSON.parse(localStorage.getItem('charangoChords') || '[]');
  saved.push(data);
  localStorage.setItem('charangoChords', JSON.stringify(saved,null,2));
  document.getElementById('saved').textContent = JSON.stringify(saved,null,2);
  alert('Acorde guardado');
};

// ==============================
// INICIALIZACIÓN
// ==============================
document.getElementById('saved').textContent = localStorage.getItem('charangoChords') || '';

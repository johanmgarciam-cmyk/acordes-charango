// ==============================
// VARIABLES PRINCIPALES
// ==============================
const notes = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
const frets = 18;

const tuning = ['G','C','E','A','E']; // cuerdas del charango
let selected = [];
const charangoDiv = document.getElementById('charango');

// ==============================
// SINTETIZADOR REALISTA
// ==============================
const synth = new Tone.PolySynth(Tone.Synth, {
  oscillator: { type: "triangle" },  // base
  envelope: { attack: 0.005, decay: 0.2, sustain: 0.2, release: 1 }
}).toDestination();

// Un filtro para dar más calidez (como cuerda de charango)
const filter = new Tone.Filter(1200, "lowpass").toDestination();
synth.connect(filter);

// ==============================
// FUNCIONES AUXILIARES
// ==============================
function noteAt(stringIndex, fret) {
  const baseIndex = notes.indexOf(tuning[stringIndex]);
  return notes[(baseIndex + fret) % 12] + (stringIndex === 0 ? '4' : stringIndex === 1 ? '5' : stringIndex === 2 ? '4' : stringIndex === 3 ? '4' : '5'); 
}

// ==============================
// CREAR DIAPASÓN
// ==============================
tuning.forEach((string, s) => {
  for (let f = 0; f <= frets; f++) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    const note = noteAt(s,f);
    cell.dataset.string = s;
    cell.dataset.fret = f;
    cell.innerHTML = `O ${5-s}<br>T${f}<br>${note}`;
    cell.onclick = () => toggleCell(cell,s,f,note);
    charangoDiv.appendChild(cell);
  }
});

// ==============================
// INTERACCIÓN CELDAS
// ==============================
function toggleCell(cell,s,f,note){
  const idx = selected.findIndex(n => n.s===s && n.f===f);
  if(idx>=0){
    selected.splice(idx,1);
    cell.classList.remove('active');
  } else {
    selected.push({s,f,note});
    cell.classList.add('active');
    playNote(note);
  }
  renderSelected();
}

// ==============================
// REPRODUCIR NOTA REALISTA
// ==============================
function playNote(noteName){
  synth.triggerAttackRelease(noteName, "1"); // duración 1 segundo
}

// ==============================
// RENDER NOTAS SELECCIONADAS
// ==============================
function renderSelected(){
  const ul = document.getElementById('selectedNotes');
  ul.innerHTML = '';
  selected.forEach(n=>{
    const li = document.createElement('li');
    li.textContent = `O ${5-n.s}, traste ${n.f} → ${n.note}`;
    ul.appendChild(li);
  });
}

// ==============================
// BOTONES
// ==============================
document.getElementById('playChordBtn').onclick = () => {
  selected.forEach(n=>playNote(n.note));
};

document.getElementById('saveChordBtn').onclick = ()=>{
  const name = document.getElementById('chordName').value || 'Sin nombre';
  const data = {name, positions: selected};
  const saved = JSON.parse(localStorage.getItem('charangoChords')||'[]');
  saved.push(data);
  localStorage.setItem('charangoChords',JSON.stringify(saved,null,2));
  document.getElementById('saved').textContent = JSON.stringify(saved,null,2);
  alert('Acorde guardado');
};

// ==============================
// INICIALIZACIÓN
// ==============================
document.getElementById('saved').textContent = localStorage.getItem('charangoChords')||'';

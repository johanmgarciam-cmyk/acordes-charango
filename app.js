// ==============================
// VARIABLES PRINCIPALES
// ==============================
const notes = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
const frets = 18;

const tuning = [
  { note: 'G4', octave: 4 },
  { note: 'C5', octave: 5 },
  { note: 'E4', octave: 4, octave2: 5 },
  { note: 'A4', octave: 4 },
  { note: 'E5', octave: 5 }
];

let selected = [];
let barre = null;
const charangoDiv = document.getElementById('charango');

// ==============================
// SINTETIZADOR REALISTA
// ==============================
const synth = new Tone.PolySynth(Tone.Synth, {
  oscillator: { type: "triangle" },
  envelope: { attack: 0.005, decay: 0.2, sustain: 0.2, release: 1 }
}).toDestination();

const filter = new Tone.Filter(1200, "lowpass").toDestination();
synth.connect(filter);

// ==============================
// FUNCIONES AUXILIARES
// ==============================
function noteAt(stringIndex, fret){
  const baseNote = tuning[stringIndex].note.replace(/\d/,'');
  const baseOct = tuning[stringIndex].octave;
  let noteIndex = (notes.indexOf(baseNote)+fret)%12;
  let octaveShift = Math.floor((notes.indexOf(baseNote)+fret)/12);
  let note = notes[noteIndex] + (baseOct+octaveShift);
  if(tuning[stringIndex].octave2 && fret % 2 === 1) note = notes[noteIndex] + tuning[stringIndex].octave2;
  return note;
}

// ==============================
// CREAR DIAPASÓN
// ==============================
function createFretboard(){
  charangoDiv.innerHTML = '';
  tuning.forEach((string,s)=>{
    for(let f=0; f<=frets; f++){
      const cell = document.createElement('div');
      cell.className = 'cell';
      const note = noteAt(s,f);
      cell.dataset.string = s;
      cell.dataset.fret = f;
      cell.innerHTML = `O ${5-s}<br>T${f}<br>${note}`;
      cell.onclick = ()=>toggleCell(cell,s,f,note);
      if(barre && f===barre.fret) cell.classList.add('barre');
      charangoDiv.appendChild(cell);
    }
  });
}
createFretboard();

// ==============================
// INTERACCIÓN CELDAS
// ==============================
function toggleCell(cell,s,f,note){
  const idx = selected.findIndex(n=>n.s===s && n.f===f);
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
  const velocity = 0.2 + Math.random()*0.3;
  const detune = (Math.random()-0.5)*10;
  synth.triggerAttackRelease(noteName,"0.8",undefined,velocity);
  synth.set({detune});
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
// Cejilla / Barre
// ==============================
document.getElementById('applyBarreBtn').onclick = () => {
  const fret = parseInt(document.getElementById('barreFret').value);
  if(isNaN(fret) || fret<0 || fret>frets) return;
  barre = { fret };
  selected = [];
  createFretboard();
  renderSelected();
};

document.getElementById('clearBarreBtn').onclick = () => {
  barre = null;
  selected = [];
  createFretboard();
  renderSelected();
};

// ==============================
// BOTONES
// ==============================
document.getElementById('playChordBtn').onclick = () => {
  selected.forEach(n=>playNote(n.note));
};

document.getElementById('saveChordBtn').onclick = ()=>{
  const name = document.getElementById('chordName').value || 'Sin nombre';
  const data = { name, positions: selected };
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

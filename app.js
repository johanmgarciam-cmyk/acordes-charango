// ==============================
// VARIABLES PRINCIPALES
// ==============================
const notes = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
const frets = 18;

const tuning = [
  { notes: ['G4','G4'] },           // 5ª cuerda
  { notes: ['C5','C5'] },           // 4ª cuerda
  { notes: ['E4','E5'] },           // 3ª cuerda octavada
  { notes: ['A4','A4'] },           // 2ª cuerda
  { notes: ['E5','E5'] }            // 1ª cuerda
];

let selected = [];
let barre = null;

// ==============================
// SINTETIZADOR POLIFÓNICO
// ==============================
const synth = new Tone.PolySynth(Tone.Synth, {
  oscillator: { type: "triangle" },
  envelope: { attack: 0.005, decay: 0.2, sustain: 0.2, release: 1 }
}).toDestination();

// ==============================
// FUNCIONES AUXILIARES
// ==============================
function noteAt(stringIndex,fret){
  const stringNotes = tuning[stringIndex].notes;
  return stringNotes.map(n=>{
    const noteBase = n.replace(/\d/,'');
    const octave = parseInt(n.match(/\d/)[0]);
    const idx = (notes.indexOf(noteBase)+fret)%12;
    const octShift = Math.floor((notes.indexOf(noteBase)+fret)/12);
    return notes[idx]+(octave+octShift);
  });
}

// ==============================
// CREAR DIAPASÓN
// ==============================
function createFretboard(){
  const charangoDiv = document.getElementById('charango');
  charangoDiv.innerHTML = '';
  tuning.forEach((string,s)=>{
    for(let f=0; f<=frets; f++){
      const cell = document.createElement('div');
      cell.className = 'cell';
      const noteNames = noteAt(s,f).join('/');
      cell.dataset.string = s;
      cell.dataset.fret = f;
      cell.innerHTML = `O ${5-s}<br>T${f}<br>${noteNames}`;
      cell.onclick = ()=>toggleCell(cell,s,f);
      if(barre && f===barre.fret) cell.classList.add('barre');
      charangoDiv.appendChild(cell);
    }
  });
}

// ==============================
// INTERACCIÓN CELDAS
// ==============================
function toggleCell(cell,s,f){
  const idx = selected.findIndex(n=>n.s===s && n.f===f);
  if(idx>=0){
    selected.splice(idx,1);
    cell.classList.remove('active');
  } else {
    const notesToPlay = noteAt(s,f);
    selected.push({s,f,notes: notesToPlay});
    cell.classList.add('active');
    playNotes(notesToPlay);
  }
  renderSelected();
  recognizeChord();
}

// ==============================
// REPRODUCIR NOTAS
// ==============================
function playNotes(notesArr){
  notesArr.forEach(n=>{
    const velocity = 0.2 + Math.random()*0.3;
    synth.triggerAttackRelease(n,"0.8",undefined,velocity);
  });
}

// ==============================
// RENDER NOTAS SELECCIONADAS
// ==============================
function renderSelected(){
  const ul = document.getElementById('selectedNotes');
  ul.innerHTML = '';
  selected.forEach(n=>{
    const li = document.createElement('li');
    li.textContent = `O ${5-n.s}, traste ${n.f} → ${n.notes.join('/')}`;
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
  recognizeChord();
};

document.getElementById('clearBarreBtn').onclick = () => {
  barre = null;
  selected = [];
  createFretboard();
  renderSelected();
  recognizeChord();
};

// ==============================
// BOTONES
// ==============================
document.getElementById('playChordBtn').onclick = () => {
  selected.forEach(n=>playNotes(n.notes));
};

document.getElementById('saveChordBtn').onclick = ()=>{
  const name = document.getElementById('chordName').value || 'Sin nombre';
  const data = { name, positions: selected.map(n=>({s:n.s,f:n.f,notes:n.notes})) };
  const saved = JSON.parse(localStorage.getItem('charangoChords')||'[]');
  saved.push(data);
  localStorage.setItem('charangoChords',JSON.stringify(saved,null,2));
  document.getElementById('saved').textContent = JSON.stringify(saved,null,2);
  alert('Acorde guardado');
};

document.getElementById('downloadBtn').onclick = ()=>{
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(localStorage.getItem('charangoChords')||'[]');
  const dlAnchor = document.createElement('a');
  dlAnchor.setAttribute("href", dataStr);
  dlAnchor.setAttribute("download","charango_chords.json");
  dlAnchor.click();
};

// ==============================
// RECONOCIMIENTO DE ACORDES
// ==============================
const chordFormulas = {
  'C': ['C','E','G'],
  'Cm': ['C','D#','G'],
  'C7': ['C','E','G','A#'],
  'D': ['D','F#','A'],
  'Dm': ['D','F','A'],
  'D7': ['D','F#','A','C'],
  'E': ['E','G#','B'],
  'Em': ['E','G','B'],
  'F': ['F','A','C'],
  'Fm': ['F','G#','C'],
  'G': ['G','B','D'],
  'Gm': ['G','A#','D'],
  'A': ['A','C#','E'],
  'Am': ['A','C','E'],
  'B': ['B','D#','F#'],
  'Bm': ['B','D','F#']
};

function recognizeChord(){
  const selectedNotes = [...new Set(selected.flatMap(n=>n.notes.map(n=>n.replace(/\d/,''))))];
  const recognizedDiv = document.getElementById('recognizedChord');
  recognizedDiv.innerHTML = '';
  for(let chord in chordFormulas){
    const formula = chordFormulas[chord];
    if(formula.every(note=>selectedNotes.includes(note)) && formula.length===selectedNotes.length){
      recognizedDiv.innerHTML = `<strong>Acorde detectado:</strong> ${chord}`;
      return;
    }
  }
  recognizedDiv.innerHTML = `<strong>Acorde detectado:</strong> Ninguno`;
}

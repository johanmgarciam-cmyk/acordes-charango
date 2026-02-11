// ==============================
// VARIABLES PRINCIPALES
// ==============================
const notes = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
const frets = 18;

// 10 cuerdas / 5 órdenes
const tuning = [
  { notes: ['G4','G4'] },           // 5ª cuerda (grave)
  { notes: ['C5','C5'] },           // 4ª cuerda
  { notes: ['E4','E5'] },           // 3ª cuerda octavada
  { notes: ['A4','A4'] },           // 2ª cuerda
  { notes: ['E5','E5'] }            // 1ª cuerda (aguda)
];

let selected = [];
let barre = null;

// ==============================
// SINTETIZADOR REALISTA
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
  // subimos octava por semitono
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
// CARGAR DIAPASÓN DESPUÉS DEL DOM
// ==============================
document.addEventListener('DOMContentLoaded', ()=>{
    createFretboard();
    document.getElementById('saved').textContent = localStorage.getItem('charangoChords')||'';
});

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
}

// ==============================
// REPRODUCIR NOTAS
// ==============================
function playNotes(notesArr){
  notesArr.forEach(n=>{
    const velocity = 0.2 + Math.random()*0.3;
    const detune = (Math.random()-0.5)*10;
    synth.triggerAttackRelease(n,"0.8",undefined,velocity);
    synth.set({detune});
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
  selected.forEach(n=>playNotes(n.notes));
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

// ====================
// VARIABLES
// ====================
const notes = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
const frets = 18;

const tuning = [
  ['G4','G4'],   // 5ª cuerda
  ['C5','C5'],   // 4ª cuerda
  ['E4','E5'],   // 3ª cuerda octavada
  ['A4','A4'],   // 2ª cuerda
  ['E5','E5']    // 1ª cuerda
];

let selected = [];
let barre = null;

// ====================
// SINTETIZADOR
// ====================
const synth = new Tone.PolySynth(Tone.Synth, {
  oscillator: { type: "triangle" },
  envelope: { attack:0.01, decay:0.2, sustain:0.3, release:1 }
}).toDestination();

// ====================
// FUNCIONES AUX
// ====================
function noteAt(stringIndex,fret){
  return tuning[stringIndex].map(n=>{
    const noteBase = n.replace(/\d/,'');
    const octave = parseInt(n.match(/\d/)[0]);
    const idx = (notes.indexOf(noteBase)+fret)%12;
    const octShift = Math.floor((notes.indexOf(noteBase)+fret)/12);
    return notes[idx]+(octave+octShift);
  });
}

// ====================
// CREAR DIAPASÓN
// ====================
function createFretboard(){
  const charangoDiv = document.getElementById('charango');
  charangoDiv.innerHTML='';
  for(let s=0; s<5; s++){
    for(let stringRep=0; stringRep<2; stringRep++){  // dos cuerdas por orden
      for(let f=0; f<=frets; f++){
        const cell=document.createElement('div');
        cell.className='cell';
        const notesNames = noteAt(s,f)[stringRep];
        cell.dataset.string = s+'-'+stringRep;
        cell.dataset.fret = f;
        cell.innerHTML = `O${5-s}<br>T${f}<br>${notesNames}`;
        cell.onclick = ()=>toggleCell(cell,s,stringRep,f);
        if(barre && f===barre.fret) cell.classList.add('barre');
        charangoDiv.appendChild(cell);
      }
    }
  }
}

// ====================
// TOGGLE CELDA
// ====================
function toggleCell(cell,s,stringRep,f){
  const idx = selected.findIndex(n=>n.s===s && n.r===stringRep && n.f===f);
  if(idx>=0){
    selected.splice(idx,1);
    cell.classList.remove('active');
  } else {
    const note = noteAt(s,f)[stringRep];
    selected.push({s,r:stringRep,f,notes:[note]});
    cell.classList.add('active');
    playNotes([note]);
  }
  renderSelected();
  recognizeChord();
}

// ====================
// REPRODUCIR NOTAS
// ====================
function playNotes(notesArr){
  notesArr.forEach(n=>{
    synth.triggerAttackRelease(n,"0.8");
  });
}

// ====================
// RENDER SELECCION
// ====================
function renderSelected(){
  const ul=document.getElementById('selectedNotes');
  ul.innerHTML='';
  selected.forEach(n=>{
    const li=document.createElement('li');
    li.textContent=`O${5-n.s}, cuerda ${n.r+1}, traste ${n.f} → ${n.notes.join('/')}`;
    ul.appendChild(li);
  });
}

// ====================
// CEJILLA / BARRE
// ====================
document.getElementById('applyBarreBtn').onclick=()=>{
  const fret=parseInt(document.getElementById('barreFret').value);
  if(isNaN(fret) || fret<0 || fret>frets) return;
  barre={fret};
  selected=[];
  createFretboard();
  renderSelected();
  recognizeChord();
};

document.getElementById('clearBarreBtn').onclick=()=>{
  barre=null;
  selected=[];
  createFretboard();
  renderSelected();
  recognizeChord();
};

// ====================
// BOTONES
// ====================
document.getElementById('playChordBtn').onclick = ()=>selected.forEach(n=>playNotes(n.notes));
document.getElementById('saveChordBtn').onclick = ()=>{
  const name = document.getElementById('chordName').value || 'Sin nombre';
  const data = {name, positions:selected.map(n=>({s:n.s,r:n.r,f:n.f,notes:n.notes}))};
  const saved = JSON.parse(localStorage.getItem('charangoChords')||'[]');
  saved.push(data);
  localStorage.setItem('charangoChords',JSON.stringify(saved,null,2));
  document.getElementById('saved').textContent = JSON.stringify(saved,null,2);
  alert('Acorde guardado');
};
document.getElementById('downloadBtn').onclick=()=>{
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(localStorage.getItem('charangoChords')||'[]');
  const dlAnchor = document.createElement('a');
  dlAnchor.setAttribute("href",dataStr);
  dlAnchor.setAttribute("download","charango_chords.json");
  dlAnchor.click();
};

// ====================
// RECONOCIMIENTO ACORDES
// ====================
const chordFormulas={
  'C':['C','E','G'],
  'Cm':['C','D#','G'],
  'C7':['C','E','G','A#'],
  'D':['D','F#','A'],
  'Dm':['D','F','A'],
  'D7':['D','F#','A','C'],
  'E':['E','G#','B'],
  'Em':['E','G','B'],
  'F':['F','A','C'],
  'Fm':['F','G#','C'],
  'G':['G','B','D'],
  'Gm':['G','A#','D'],
  'A':['A','C#','E'],
  'Am':['A','C','E'],
  'B':['B','D#','F#'],
  'Bm':['B','D','F#']
};

function recognizeChord(){
  const selectedNotes = [...new Set(selected.flatMap(n=>n.notes.map(n=>n.replace(/\d/,''))))];
  const recognizedDiv = document.getElementById('recognizedChord');
  recognizedDiv.innerHTML='';
  for(let chord in chordFormulas){
    const formula = chordFormulas[chord];
    if(formula.every(note=>selectedNotes.includes(note)) && formula.length===selectedNotes.length){
      recognizedDiv.innerHTML=`<strong>Acorde detectado:</strong> ${chord}`;
      return;
    }
  }
  recognizedDiv.innerHTML=`<strong>Acorde detectado:</strong> Ninguno`;
}

// ====================
// INICIALIZAR
// ====================
createFretboard();
document.getElementById('saved').textContent = localStorage.getItem('charangoChords')||'';

const frets = 18;
const tuning = [
  ['G4','G4'],
  ['C5','C5'],
  ['E4','E5'],
  ['A4','A4'],
  ['E5','E5']
];

let selected = [];
let barre = null;

const container = document.getElementById('charango-container');

// SINTETIZADOR
const synth = new Tone.PolySynth(Tone.Synth, {
  oscillator: { type:"triangle" },
  envelope: { attack:0.01, decay:0.2, sustain:0.3, release:1 }
}).toDestination();

// FORMULAS DE ACORDES
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

// CREAR DIAPASÓN
function createFretboard(){
  container.innerHTML='';
  for(let order=0; order<5; order++){
    const row = document.createElement('div');
    row.className='charango-row';

    for(let stringRep=0; stringRep<2; stringRep++){
      for(let fret=0; fret<=frets; fret++){
        const cell = document.createElement('div');
        cell.className='cell';
        const note = tuning[order][stringRep];
        cell.dataset.order = order;
        cell.dataset.rep = stringRep;
        cell.dataset.fret = fret;
        cell.textContent = `O${5-order}\nT${fret}\n${note}`;

        if(barre && fret===barre.fret) cell.classList.add('barre');

        cell.onclick = ()=>toggleCell(cell,order,stringRep,fret,note);

        row.appendChild(cell);
      }
    }

    container.appendChild(row);
  }
}

// TOGGLE CELDA
function toggleCell(cell,order,rep,fret,note){
  const idx = selected.findIndex(n=>n.order===order && n.rep===rep && n.fret===fret);
  if(idx>=0){
    selected.splice(idx,1);
    cell.classList.remove('active');
  }else{
    selected.push({order,rep,fret,note});
    cell.classList.add('active');
    synth.triggerAttackRelease(note,"0.8");
  }
  renderSelected();
  recognizeChord();
}

// RENDER SELECCION
function renderSelected(){
  const ul = document.getElementById('selectedNotes');
  ul.innerHTML='';
  selected.forEach(n=>{
    const li = document.createElement('li');
    li.textContent = `O${5-n.order}, cuerda ${n.rep+1}, T${n.fret} → ${n.note}`;
    ul.appendChild(li);
  });
}

// CEJILLA / BARRE
document.getElementById('applyBarreBtn').onclick = ()=>{
  const fret = parseInt(document.getElementById('barreFret').value);
  if(isNaN(fret)||fret<0||fret>frets) return;
  barre={fret};
  selected=[];
  createFretboard();
  renderSelected();
  recognizeChord();
};

document.getElementById('clearBarreBtn').onclick = ()=>{
  barre=null;
  selected=[];
  createFretboard();
  renderSelected();
  recognizeChord();
};

// BOTONES
document.getElementById('playChordBtn').onclick = ()=>selected.forEach(n=>synth.triggerAttackRelease(n.note,"0.8"));

document.getElementById('saveChordBtn').onclick = ()=>{
  const name = document.getElementById('chordName').value || 'Sin nombre';
  const data = {name,positions:selected.map(n=>({order:n.order,rep:n.rep,fret:n.fret,note:n.note}))};
  const saved = JSON.parse(localStorage.getItem('charangoChords')||'[]');
  saved.push(data);
  localStorage.setItem('charangoChords',JSON.stringify(saved,null,2));
  document.getElementById('saved').textContent = JSON.stringify(saved,null,2);
  alert('Acorde guardado');
};

document.getElementById('downloadBtn').onclick=()=>{
  const dataStr = "data:text/json;charset=utf-8,"+encodeURIComponent(localStorage.getItem('charangoChords')||'[]');
  const dlAnchor = document.createElement('a');
  dlAnchor.setAttribute("href",dataStr);
  dlAnchor.setAttribute("download","charango_chords.json");
  dlAnchor.click();
};

// RECONOCIMIENTO ACORDES
function recognizeChord(){
  const selNotes = [...new Set(selected.map(n=>n.note.replace(/\d/,'')))];
  const div = document.getElementById('recognizedChord');
  div.innerHTML='';
  for(let chord in chordFormulas){
    const formula = chordFormulas[chord];
    if(formula.every(note=>selNotes.includes(note)) && formula.length===selNotes.length){
      div.innerHTML = `<strong>Acorde detectado:</strong> ${chord}`;
      return;
    }
  }
  div.innerHTML = `<strong>Acorde detectado:</strong> Ninguno`;
}

// INICIALIZAR
createFretboard();
document.getElementById('saved').textContent = localStorage.getItem('charangoChords')||'';

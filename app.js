document.addEventListener('DOMContentLoaded', ()=>{

// Sintetizador
const synth = new Tone.PolySynth(Tone.Synth, {
  oscillator: { type:"triangle" },
  envelope: { attack:0.01, decay:0.2, sustain:0.3, release:1 }
}).toDestination();

// Formulas acordes básicos
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
  'G':['G','B','D'],
  'Am':['A','C','E']
};

// Escalas básicas
const scales = {
  'C':['C','D','E','F','G','A','B'],
  'G':['G','A','B','C','D','E','F#'],
  'D':['D','E','F#','G','A','B','C#']
};

const noteInput = document.getElementById('noteInput');
const chordNameInput = document.getElementById('chordName');
const recognizedChord = document.getElementById('recognizedChord');
const savedDisplay = document.getElementById('saved');
const scaleCheckDiv = document.getElementById('scaleCheck');

// Escuchar acorde
document.getElementById('playBtn').onclick = ()=>{
  const notes = getNotes();
  if(!notes.length) return;
  synth.triggerAttackRelease(notes,"1");
  recognizeChord(notes);
  validateScale(notes);
};

// Guardar acorde
document.getElementById('saveBtn').onclick = ()=>{
  const name = chordNameInput.value || 'Sin nombre';
  const notes = getNotes();
  if(!notes.length) return alert("Ingresa las notas");
  const data = {name, notes};
  const saved = JSON.parse(localStorage.getItem('charangoChords')||'[]');
  saved.push(data);
  localStorage.setItem('charangoChords',JSON.stringify(saved,null,2));
  renderSaved();
};

// Descargar biblioteca
document.getElementById('downloadBtn').onclick = ()=>{
  const dataStr = "data:text/json;charset=utf-8,"+encodeURIComponent(localStorage.getItem('charangoChords')||'[]');
  const dlAnchor = document.createElement('a');
  dlAnchor.setAttribute("href",dataStr);
  dlAnchor.setAttribute("download","charango_chords.json");
  dlAnchor.click();
};

// Renderizar guardados
function renderSaved(){
  savedDisplay.textContent = localStorage.getItem('charangoChords')||'';
}

// Obtener notas ingresadas
function getNotes(){
  return noteInput.value.toUpperCase().trim().split(/\s+/);
}

// Reconocer acorde
function recognizeChord(notes){
  const selNotes = [...new Set(notes.map(n=>n.replace(/\d/,"")))];
  for(let chord in chordFormulas){
    const formula = chordFormulas[chord];
    if(formula.every(note=>selNotes.includes(note)) && formula.length===selNotes.length){
      recognizedChord.textContent = chord;
      return;
    }
  }
  recognizedChord.textContent = "Ninguno";
}

// Validar notas en la escala
function validateScale(notes){
  const selNotes = [...new Set(notes.map(n=>n.replace(/\d/,"")))];
  let validNotes = [];
  for(let note of selNotes){
    for(let scale in scales){
      if(scales[scale].includes(note)) validNotes.push(`${note} en ${scale}`);
    }
  }
  scaleCheckDiv.textContent = validNotes.length? validNotes.join(", "): "Ninguna";
}

// Inicializar
renderSaved();

});

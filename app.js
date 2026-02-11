document.addEventListener('DOMContentLoaded', ()=>{

const noteInput = document.getElementById('noteInput');
const chordNameInput = document.getElementById('chordName');
const savedDisplay = document.getElementById('saved');

const validNotes = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];

// Convertir nota a frecuencia
const noteFrequencies = {
  'C':261.63,'C#':277.18,'D':293.66,'D#':311.13,'E':329.63,
  'F':349.23,'F#':369.99,'G':392.00,'G#':415.30,'A':440.00,'A#':466.16,'B':493.88
};

function getNotes() {
  return noteInput.value.toUpperCase().trim().split(/\s+/)
             .filter(n=>validNotes.includes(n));
}

// Reproducir acorde
function playChord() {
  const notes = getNotes();
  if(!notes.length) return alert("Ingresa notas válidas");
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  notes.forEach(n=>{
    const osc = audioCtx.createOscillator();
    osc.type = 'triangle';
    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1);
    osc.frequency.value = noteFrequencies[n];
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 1);
  });
}

// Guardar acorde
function saveChord() {
  const name = chordNameInput.value || 'Sin nombre';
  const notes = getNotes();
  if(!notes.length) return alert("Ingresa notas válidas");
  const data = {name, notes};
  const saved = JSON.parse(localStorage.getItem('charangoChords')||'[]');
  saved.push(data);
  localStorage.setItem('charangoChords', JSON.stringify(saved,null,2));
  renderSaved();
}

// Descargar biblioteca
function downloadLibrary() {
  const dataStr = "data:text/json;charset=utf-8,"+encodeURIComponent(localStorage.getItem('charangoChords')||'[]');
  const dlAnchor = document.createElement('a');
  dlAnchor.setAttribute("href",dataStr);
  dlAnchor.setAttribute("download","charango_chords.json");
  dlAnchor.click();
}

// Mostrar guardados
function renderSaved() {
  savedDisplay.textContent = localStorage.getItem('charangoChords')||'[]';
}

// Eventos
document.getElementById('playBtn').onclick = playChord;
document.getElementById('saveBtn').onclick = saveChord;
document.getElementById('downloadBtn').onclick = downloadLibrary;

// Inicializar
renderSaved();

});

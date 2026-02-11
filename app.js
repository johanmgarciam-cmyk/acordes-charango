const frets = 18;

// Afinación 5 órdenes × 2 cuerdas (10 cuerdas)
const tuning = [
  ['G4','G4'],
  ['C5','C5'],
  ['E4','E5'],
  ['A4','A4'],
  ['E5','E5']
];

const charangoDiv = document.getElementById('charango');

function createFretboard(){
  charangoDiv.innerHTML=''; // limpiar

  for(let order=0; order<5; order++){
    for(let stringRep=0; stringRep<2; stringRep++){
      for(let fret=0; fret<=frets; fret++){
        const cell = document.createElement('div');
        cell.className = 'cell';
        const note = tuning[order][stringRep];
        cell.innerHTML = `O${5-order}<br>T${fret}<br>${note}`;
        charangoDiv.appendChild(cell);
      }
    }
  }
}

createFretboard();

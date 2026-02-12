document.addEventListener("DOMContentLoaded", function () {

  const saveBtn = document.getElementById("saveChordBtn");

  saveBtn.addEventListener("click", function () {

    if (!selected || selected.length === 0) {
      alert("No notes selected");
      return;
    }

    const chordName = document.getElementById("chordName").value || "Sin nombre";

    const chordData = {
      name: chordName,
      positions: selected
    };

    let stored = JSON.parse(localStorage.getItem("charangoChords")) || [];

    stored.push(chordData);

    localStorage.setItem("charangoChords", JSON.stringify(stored));

    console.log("Saved:", chordData);
    alert("Chord saved successfully");

  });

});

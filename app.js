// ===============================
// CHARANGO APP - STORAGE FIX
// ===============================

// Aseguramos que selected exista
if (typeof selected === "undefined") {
  var selected = {};
}

// Esperar que cargue el DOM
document.addEventListener("DOMContentLoaded", function () {

  const saveBtn = document.getElementById("saveChordBtn");

  if (!saveBtn) {
    console.log("saveChordBtn not found");
    return;
  }

  saveBtn.addEventListener("click", function () {

    if (!selected || Object.keys(selected).length === 0) {
      alert("No chord selected");
      return;
    }

    try {
      let stored = JSON.parse(localStorage.getItem("charangoChords")) || [];

      stored.push(selected);

      localStorage.setItem("charangoChords", JSON.stringify(stored));

      console.log("Saved:", selected);
      alert("Chord saved successfully");

    } catch (error) {
      console.error("Storage error:", error);
      alert("Error saving chord");
    }

  });

});


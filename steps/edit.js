//THIS IS A TEMPORARY JS FILE TO SEE IF THE UI WILL WORK
export function initStage() {
  console.log("RVE Edit Tab Loaded!");
  console.log("This is on the edit-functions branch, stuff could break here");
  console.log("have issues? go to https://github.com/rutwik-stuff/rve/issues for bug reporting");
  console.error("x009888r67 Please refer to https://rutwik-stuff.github.io/rve/errors");

  const timeline = document.getElementById("timeline-container");
  if (timeline) {
    timeline.innerHTML += `<p>The timeline will be here... sometime in the next year (hopefully)</p>`;
  }

  document.getElementById("split-btn")?.addEventListener("click", () => {
    console.log("You clicked the snip button, it doesn't work yet.");
  });

  document.getElementById("trim-btn")?.addEventListener("click", () => {
    console.log("You clicked the trim button, it doesnt work yet.");
  });

  document.getElementById("delete-btn")?.addEventListener("click", () => {
    console.log("oof you tried to delete something, it's not here yet.");
  });

  document.getElementById("next-btn")?.addEventListener("click", () => {
    console.log("🍭 Next button clicked from Edit tab");
    // Placeholder for stage-loader transition or redirect
  });
}

initStage();

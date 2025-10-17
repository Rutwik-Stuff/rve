// stage-loader.js
// Detects current stage and loads corresponding logic module

document.addEventListener("DOMContentLoaded", () => {
  const stageButtons = document.querySelectorAll(".progress-step");
  const currentStage = getCurrentStage();

  console.log("stage-loader.js has loaded!");
  console.log("(c) 2025 Rutwik Stuff Branding Umbrella, Rutwik Video Editor");
  console.log(`Stage Loader: Current stage is ${currentStage}`);
  loadStage(currentStage);

  // Optional: Listen for stage changes
  stageButtons.forEach(button => {
    button.addEventListener("click", () => {
      const stage = button.dataset.step;
      console.log(`Switching to stage: ${stage}`);
      loadStage(stage);
    });
  });
});

/**
 * Gets the current stage from active button or default to "Import"
 */
function getCurrentStage() {
  const active = document.querySelector(".progress-step.active");
  return active ? active.dataset.step : "Import";
}

/**
 * Loads the corresponding JS module for the given stage
 * @param {string} stage - The name of the stage (e.g., "Import", "Edit")
 */
function loadStage(stage) {
  switch (stage) {
    case "Import":
      import("./steps/import.js");
      break;
    case "Edit":
      import("./steps/edit.js");
      break;
    case "Music":
      import("./steps/music.js");
      break;
    case "Final Checks":
      import("./steps/final.js");
      break;
    case "Export":
      import("./steps/export.js");
      break;
    case "Upload":
      import("./steps/upload.js");
      break;
    default:
      console.warn(`Unknown stage: ${stage}`);
  }
}

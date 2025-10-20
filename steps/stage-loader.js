// stage-loader.js
// Handles dynamic stage switching for RVE

document.addEventListener("DOMContentLoaded", () => {
  const stageButtons = document.querySelectorAll(".progress-step");
  const currentStage = getActiveStage();

  console.log("Stage Loader has loaded!");
  console.log("©2025 Rutwik Stuff Branding Umbrella. All Rights Reserved");
  console.log("Rutwik Video Editor (RVE)")
  console.log(`Current Stage: ${currentStage}`);
  loadStage(currentStage);

  stageButtons.forEach(button => {
    button.addEventListener("click", () => {
      const stage = button.dataset.step;
      console.log(`Switching to stage: ${stage}`);
      setActiveStage(stage);
      loadStage(stage);
    });
  });
});

/**
 * Gets the active stage from progress bar
 */
function getActiveStage() {
  const active = document.querySelector(".progress-step.active");
  return active ? active.dataset.step : "Import";
}

/**
 * Sets the active stage visually
 */
function setActiveStage(stageName) {
  document.querySelectorAll(".progress-step").forEach(step => {
    step.classList.toggle("active", step.dataset.step === stageName);
  });
}

/**
 * Dynamically loads the module for the given stage
 */
function loadStage(stage) {
  const basePath = "/rve/steps/";
  const stageMap = {
    "Import": "import.js",
    "Edit": "edit.js",
    "Music": "music.js",
    "Final Checks": "final-checks.js",
    "Export": "export.js",
    "Upload": "upload.js"
  };

  const modulePath = stageMap[stage];
  if (!modulePath) {
    console.warn(`⚠️ Unknown stage: ${stage}`);
    return;
  }

  import(`${basePath}${modulePath}`)
    .then(mod => {
      console.log(`✅ ${stage} module loaded`);
      if (mod.initStage) mod.initStage(); // optional hook
    })
    .catch(err => {
      console.error(`❌ Failed to load ${stage} module`, err);
    });
}

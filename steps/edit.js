export function initStage() {
  console.log("🧬 RVE Edit Tab Initialized (edit-functions branch)");

  // Timeline container setup (placeholder removed)
  const timeline = document.getElementById("timeline-container");
  if (timeline) {
    timeline.innerHTML = ""; // Ready for actual timeline rendering
  }

  // Button listeners (logic to be implemented later)
  document.getElementById("split-btn")?.addEventListener("click", () => {
    console.warn("Split function not implemented yet.");
  });

  document.getElementById("trim-btn")?.addEventListener("click", () => {
    console.warn("Trim function not implemented yet.");
  });

  document.getElementById("delete-btn")?.addEventListener("click", () => {
    console.warn("Delete function not implemented yet.");
  });

  document.getElementById("next-btn")?.addEventListener("click", () => {
    console.log("🍭 Next button clicked from Edit tab");
    // TODO: Implement stage-loader transition

    //aspect ratios
    const aspectDropdown = document.getElementById("aspect-dropdown");
const previewZone = document.querySelector(".preview-zone");

aspectDropdown.addEventListener("change", () => {
  const selected = aspectDropdown.value;

  // Remove all aspect classes
  previewZone.classList.remove("aspect-16-9", "aspect-4-3", "aspect-1-1", "aspect-9-16");

  // Add the selected one
  previewZone.classList.add(`aspect-${selected}`);

  console.log(`📐 Aspect ratio changed to ${selected}`);
});

  });
}

initStage();

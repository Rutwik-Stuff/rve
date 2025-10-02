//for testing purposes to make sure the JS has loaded
console.log("The JavaScript file for the RVE editor has loaded");

window.addEventListener("DOMContentLoaded", () => {
      const urlParams = new URLSearchParams(window.location.search);
      const projectId = urlParams.get("id");

      if (!projectId) {
        document.getElementById("project-title").textContent = "No project ID found.";
        return;
      }

      const project = {
        id: projectId,
        title: "Untitled Project",
        createdAt: new Date().toISOString(),
        lastEdited: new Date().toISOString()
      };

      document.getElementById("project-title").textContent = `Editing: ${project.title}`;
      document.getElementById("title-input").value = project.title;

      document.getElementById("save-btn").addEventListener("click", () => {
  const newTitle = document.getElementById("title-input").value;
  project.title = newTitle;
  project.lastEdited = new Date().toISOString();

  // Update header
  document.getElementById("project-title").textContent = `Editing: ${newTitle}`;

  //Update <title> tag
  document.title = `${newTitle} - Rutwik Video Editor`;

  console.log("Project saved locally:", project);
  alert("Project saved locally!");
});

      const videoUpload = document.getElementById("video-upload");
const videoPreview = document.getElementById("video-preview");
const uploadBtn = document.getElementById("upload-btn");

// Trigger hidden input when button is clicked
uploadBtn.addEventListener("click", () => {
  videoUpload.click();
});

// Handle multiple file uploads
videoUpload.addEventListener("change", () => {
  const files = Array.from(videoUpload.files);
  if (files.length === 0) {
    console.warn("No files selected");
    return;
  }

  // Preview the first clip
  const firstFile = files[0];
  const firstURL = URL.createObjectURL(firstFile);
  videoPreview.src = firstURL;
  videoPreview.load();

  // Log all clips for future timeline use
  files.forEach((file, index) => {
    const url = URL.createObjectURL(file);
    console.log(`Clip ${index + 1}: ${file.name}`, url);
    // Future: push to timeline array
    // clips.push({ name: file.name, url });
  });
});

      function setProgressStep(stepName) {
  document.querySelectorAll(".progress-step").forEach((step) => {
    step.classList.remove("active");
    if (step.dataset.step === stepName) {
      step.classList.add("active");
    }
  });
}

// Initialize to Import
setProgressStep("Import");

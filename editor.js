// --- Global Variables (Application State) ---
// These variables store the *state* of our video editor application.
let mediaLibrary = []; // Array to hold details of all uploaded files (like clips on the timeline).
let currentObjectURL = null; // Stores the temporary, local URL for the clip currently shown in the video player.
let project = {}; // Object to hold project metadata (title, ID, dates).
let isProjectIdValid = false; // A boolean flag to check if we loaded a project from the URL.

// --- DOM Element Variables (Declared, but NOT initialized here) ---
// IMPORTANT: We cannot use document.getElementById() yet because the HTML hasn't fully loaded.
let currentMediaTitle;
let videoPreview;
let videoUpload;
let mediaListContainer;
let projectTitleDisplay;
let projectTitleInput;
let navTitleInput;
let uploadBtn; 
let dropArea;


// --- Utility Functions ---

/**
 * Displays a non-disruptive, temporary error message to the user.
 * This is better than the ugly, blocking `alert()` function.
 * It uses the 'rve-error-alert' element we added to the HTML.
 * @param {string} message - The error message text.
 */
function displayVisualError(message) {
    let errorBox = document.getElementById("rve-error-alert");
    if (errorBox) { // Always check to make sure the element exists (null check).
        errorBox.textContent = message;
        errorBox.style.display = 'block';
        // After 6 seconds (6000ms), hide the box using a timer function.
        setTimeout(() => errorBox.style.display = 'none', 6000); 
    }
}

/**
 * Revokes the current Object URL to prevent memory leaks.
 * Concept: When you use URL.createObjectURL(), the browser reserves memory for that file.
 * This function releases that memory when the file is no longer in use.
 */
function revokeCurrentURL() {
    if (currentObjectURL) {
        URL.revokeObjectURL(currentObjectURL); // This is the crucial memory cleanup step!
        currentObjectURL = null;
    }
}

/**
 * Placeholder function for updating the UI progress bar at the bottom.
 * In a real application, this would update the CSS class for active steps.
 * @param {string} stepName - The name of the step (e.g., "Import", "Edit").
 */
function setProgressStep(stepName) {
    console.log(`Progress Step set to: ${stepName}`);
}

/**
 * Handles media loading errors (like unsupported video codecs).
 * This function is called directly from the HTML's `<video onerror="handleGlobalMediaError(this)">`.
 * @param {HTMLMediaElement} mediaElement - The video element that encountered the error.
 */
window.handleGlobalMediaError = function(mediaElement) {
    mediaElement.classList.remove('media-error');
    let errorCode = mediaElement.error ? `(Code ${mediaElement.error.code})` : '';
    displayVisualError(`Playback failed for file. Format or codec not supported. ${errorCode}`);
    
    // Visually mark the video box as broken (using the 'media-error' CSS style).
    mediaElement.classList.add('media-error');
    mediaElement.innerHTML = `
        <div style="padding: 20px;">
            <p style="font-size: 1.2em;">Playback Error ⚠️</p>
            <p>File format or codec is not supported by the browser.</p>
        </div>
    `;
};


/**
 * The DOMContentLoaded event listener is the entry point for all application logic.
 * It guarantees that the entire HTML structure (the DOM) is ready before we try to manipulate it.
 */window.addEventListener("DOMContentLoaded", () => {
  console.log("RVE editor.js loaded!");

  // --- Initialize DOM Elements ---
  currentMediaTitle = document.getElementById("current-media-title");
  videoPreview = document.getElementById("video-preview");
  videoUpload = document.getElementById("video-upload");
  mediaListContainer = document.getElementById("media-list");
  projectTitleDisplay = document.getElementById("project-title");
  projectTitleInput = document.getElementById("title-input");
  navTitleInput = document.getElementById("project-title-input");
  uploadBtn = document.getElementById("upload-btn");
  dropArea = document.getElementById("drag-drop-area");

  // --- Upload Button Logic ---
  if (uploadBtn && videoUpload) {
    uploadBtn.addEventListener("click", () => {
      videoUpload.click(); // Opens file dialog
    });

    videoUpload.addEventListener("change", () => {
      const files = Array.from(videoUpload.files);
      handleMediaUpload(files); // Uploads selected files
    });
  }

  // --- Drag and Drop Logic ---
  if (dropArea) {
    ["dragenter", "dragover"].forEach((event) => {
      dropArea.addEventListener(event, (e) => {
        e.preventDefault();
        dropArea.classList.add("hover");
      });
    });

    ["dragleave", "drop"].forEach((event) => {
      dropArea.addEventListener(event, (e) => {
        e.preventDefault();
        dropArea.classList.remove("hover");
      });
    });

    dropArea.addEventListener("drop", (e) => {
      const files = Array.from(e.dataTransfer.files);
      handleMediaUpload(files); // Uploads dropped files
    });
  }


// --- Media Upload Handler ---
function handleMediaUpload(files) {
  if (!files || files.length === 0) return;

  revokeCurrentURL(); // Clean up previous preview
  let lastFile = null;

  files.forEach((file) => {
    const canPlay = videoPreview.canPlayType(file.type);
    if (canPlay === "" || canPlay === "no") {
      displayVisualError(`Unsupported file: ${file.name}`);
      return;
    }

    const url = URL.createObjectURL(file);
    const newMedia = { name: file.name, url, file };
    mediaLibrary.push(newMedia);
    lastFile = newMedia;
  });

  if (lastFile && lastFile.file.type.startsWith("video")) {
    videoPreview.src = lastFile.url;
    videoPreview.load();
    currentObjectURL = lastFile.url;
    currentMediaTitle.textContent = lastFile.name;
  }

  renderMediaLibrary();
}

// --- Media Library Renderer ---
function renderMediaLibrary() {
  mediaListContainer.innerHTML = "";

  mediaLibrary.forEach((media) => {
    const item = document.createElement("li");
    item.textContent = media.name;
    item.addEventListener("click", () => {
      if (media.file.type.startsWith("video")) {
        videoPreview.src = media.url;
        videoPreview.load();
        currentMediaTitle.textContent = media.name;
      } else if (media.file.type.startsWith("audio")) {
        const audio = new Audio(media.url);
        audio.play();
        currentMediaTitle.textContent = `Playing: ${media.name}`;
      }
    });
    mediaListContainer.appendChild(item);
  });
}

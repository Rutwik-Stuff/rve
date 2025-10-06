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
 */
window.addEventListener("DOMContentLoaded", () => {
    console.log("RVE editor.js loaded!"); //shows this once loaded
    // --- 0. INITIALIZE DOM ELEMENTS (First thing we do after the DOM is ready!) ---
    // Now that the HTML is loaded, we can safely grab elements by their ID.
    currentMediaTitle = document.getElementById('current-media-title');
    videoPreview = document.getElementById("video-preview");
    videoUpload = document.getElementById("video-upload");
    mediaListContainer = document.getElementById('media-list');
    projectTitleDisplay = document.getElementById("project-title");
    projectTitleInput = document.getElementById("title-input");
    navTitleInput = document.getElementById("project-title-input");
    uploadBtn = document.getElementById("upload-btn");
    dropArea = document.getElementById("drag-drop-area"); 
    

    // 1. PROJECT ID CHECK & INITIAL STATE SETUP
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get("id"); // Tries to get the project ID from the URL (e.g., ?id=12345).

    if (!projectId) {
        // If no ID is found, we assume a new project and generate a random ID.
        displayVisualError("WARNING: No project ID found in URL. Using a temporary ID.");
        project.id = crypto.randomUUID(); // CSP concept: Generating unique IDs using cryptography APIs.
    } else {
        project.id = projectId;
        isProjectIdValid = true;
    }

    // Set default project metadata
    project.title = "Untitled Project";
    project.createdAt = new Date().toISOString();
    project.lastEdited = new Date().toISOString();

    // Update the UI with the initial project state
    if(projectTitleDisplay) projectTitleDisplay.textContent = `Editing: ${project.title}`;
    if(projectTitleInput) projectTitleInput.value = project.title;
    if(navTitleInput) navTitleInput.value = project.title;
    if(currentMediaTitle) currentMediaTitle.textContent = "No Media Selected";


    //save the project
    const saveBtn = document.getElementById("save-btn");
    if (saveBtn) {
        // Attach the event listener for the 'Save Project' button.
        saveBtn.addEventListener("click", () => {
            const newTitle = projectTitleInput.value.trim();
            
            if (!newTitle) {
                displayVisualError("Project title cannot be empty!");
                return;
            }

            // Update the project object with new data
            project.title = newTitle;
            project.lastEdited = new Date().toISOString();

            // Update UI elements using DOM manipulation
            if(projectTitleDisplay) projectTitleDisplay.textContent = `Editing: ${newTitle}`;
            if(navTitleInput) navTitleInput.value = newTitle;
            document.title = `${newTitle} - Rutwik Video Editor`; // Change the browser tab title

            console.log("Project saved locally:", project);
            displayVisualError(`Project "${newTitle}" saved locally!`);
        });
    }
    
    // Sync logic: Makes sure the title input fields stay the same when typing in either one.
    if (projectTitleInput && navTitleInput) {
        projectTitleInput.addEventListener('input', (e) => navTitleInput.value = e.target.value);
        navTitleInput.addEventListener('input', (e) => projectTitleInput.value = e.target.value);
    }


    if (uploadBtn && videoUpload) {
        // Step A: Make the visible button click the hidden file input element.
        // This solves the core bug where the button does nothing.
        uploadBtn.addEventListener("click", () => {
            videoUpload.click(); 
        });
        
        videoUpload.addEventListener("change", () => {
            const files = Array.from(videoUpload.files); // Convert the list of files into a true Array.
            handleMediaUpload(files); //handles multiple file uploads

            if (files.length === 0) { //if statement saying if there are no files
                console.warn("No files selected, drag and drop or click the button to start building your media library");
                return;
            }

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
      handleMediaUpload(files);
    });
  

            revokeCurrentURL(); // Clean up memory from the previously previewed clip.

            let lastFile = null;

            // Iterate (loop) through all selected files.
            files.forEach((file) => {
                // Check if the browser can even play this file type.
                const canPlay = videoPreview.canPlayType(file.type);
                if (canPlay === "" || canPlay === "no") {
                     displayVisualError(`Skipping unsupported file: ${file.name}`);
                     return;
                }

                // Create a temporary local URL for the file data.
                const url = URL.createObjectURL(file); 
                const newMedia = { name: file.name, url: url, file: file };
                mediaLibrary.push(newMedia);
                lastFile = newMedia;
            });

            // Update the preview player with the last file uploaded.
            if (lastFile) {
                videoPreview.src = lastFile.url;
                videoPreview.load(); // Tells the video element to prepare the new source.
                currentObjectURL = lastFile.url; // Save the new URL for future cleanup.
                if(currentMediaTitle) currentMediaTitle.textContent = lastFile.name;
            }
        });
    }

    // Set the initial step on the progress bar.
    setProgressStep("Import");

});
]

// --- Media Upload Handler ---
function handleMediaUpload(files) {
  if (!files || files.length === 0) return;

  revokeCurrentURL();
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

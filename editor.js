//Global Variables
let mediaLibrary = [];
let currentObjectURL = null; //Used for memory management (URL.revokeObjectURL)
let project = {}; 
let isProjectIdValid = false; //New state tracker

//DOM Elements
// Note: These must be accessed after DOMContentLoaded
const currentMediaTitle = document.getElementById('current-media-title');
const videoPreview = document.getElementById("video-preview");
const videoUpload = document.getElementById("video-upload");
const mediaListContainer = document.getElementById('media-list');
const projectTitleDisplay = document.getElementById("project-title");
const projectTitleInput = document.getElementById("title-input");
const navTitleInput = document.getElementById("project-title-input");

// Placeholder for the element that your original snippet tried to use
const uploadLabel = document.getElementById("upload-label");


// The visual alert function is necessary to replace the alert() calls.
function displayVisualError(message) {
    let errorBox = document.getElementById("rve-error-alert");
    if (errorBox) {
        errorBox.textContent = message;
        errorBox.style.display = 'block';
        // Fade out after 6 seconds
        setTimeout(() => errorBox.style.display = 'none', 6000); 
    }
}

function revokeCurrentURL() {
    if (currentObjectURL) {
        URL.revokeObjectURL(currentObjectURL);
        currentObjectURL = null;
    }
}

// Since setProgressStep was not defined, we add a placeholder to prevent crashes
function setProgressStep(stepName) {
    console.log(`Progress Step set to: ${stepName}`);
}

// Global media error handler (must be defined globally or in the <head>)
window.handleGlobalMediaError = function(mediaElement) {
    mediaElement.classList.remove('media-error');
    let errorCode = mediaElement.error ? `(Code ${mediaElement.error.code})` : '';
    displayVisualError(`Playback failed for file. Format or codec not supported. ${errorCode}`);
    
    mediaElement.classList.add('media-error');
    mediaElement.innerHTML = `
        <div style="padding: 20px;">
            <p style="font-size: 1.2em;">Playback Error ⚠️</p>
            <p>File format or codec is not supported by the browser.</p>
        </div>
    `;
};


// --- Core Initialization and Event Handlers ---

//for testing purposes to make sure the JS has loaded
console.log("The JavaScript file for the RVE editor has loaded");

window.addEventListener("DOMContentLoaded", () => {
    // 1. PROJECT ID CHECK
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get("id");

    if (!projectId) {
        // Set a default state and warn the user using the non-disruptive system
        displayVisualError("WARNING: No project ID found in URL. Using a temporary ID.");
        project.id = crypto.randomUUID();
    } else {
        project.id = projectId;
        isProjectIdValid = true;
    }

    // Initialize project object
    project.title = "Untitled Project";
    project.createdAt = new Date().toISOString();
    project.lastEdited = new Date().toISOString();

    // Set initial UI state
    projectTitleDisplay.textContent = `Editing: ${project.title}`;
    projectTitleInput.value = project.title;
    navTitleInput.value = project.title; // Sync the nav bar input

    // 2. PROJECT SAVE LOGIC
    document.getElementById("save-btn").addEventListener("click", () => {
        const newTitle = projectTitleInput.value.trim(); // Use title-input
        
        if (!newTitle) {
            displayVisualError("Project title cannot be empty!");
            return;
        }

        project.title = newTitle;
        project.lastEdited = new Date().toISOString();

        // Update UI elements
        projectTitleDisplay.textContent = `Editing: ${newTitle}`;
        navTitleInput.value = newTitle; // Sync nav title
        document.title = `${newTitle} - Rutwik Video Editor`;

        console.log("Project saved locally:", project);
        displayVisualError(`Project "${newTitle}" saved locally!`); // Use the non-disruptive message
    });
    
    // Sync logic between the two title fields
    projectTitleInput.addEventListener('input', (e) => navTitleInput.value = e.target.value);
    navTitleInput.addEventListener('input', (e) => projectTitleInput.value = e.target.value);


    // 3. FILE UPLOAD LOGIC
    // We rely on the HTML label for triggering the input. We don't need 'uploadBtn'
    // but the HTML structure must have <label for="video-upload" class="rve-button primary-button" id="upload-label">
    if (videoUpload) {
        videoUpload.addEventListener("change", () => {
            const files = Array.from(videoUpload.files);
            if (files.length === 0) {
                console.warn("No files selected");
                return;
            }

            // Cleanup memory before loading new files
            revokeCurrentURL();

            let lastFile = null;

            // Log and prepare all clips
            files.forEach((file) => {
                const canPlay = videoPreview.canPlayType(file.type);
                if (canPlay === "" || canPlay === "no") {
                     displayVisualError(`Skipping unsupported file: ${file.name}`);
                     return;
                }

                const url = URL.createObjectURL(file);
                console.log(`Clip added: ${file.name}`, url);
                
                // Add to the media library
                const newMedia = { name: file.name, url: url, file: file };
                mediaLibrary.push(newMedia);
                lastFile = newMedia;
            });

            // Preview the last clip added
            if (lastFile) {
                videoPreview.src = lastFile.url;
                videoPreview.load();
                currentObjectURL = lastFile.url; // Track the current URL for memory cleanup
                // Future: call renderMediaLibrary(lastFile.name);
            }
        });
    }

    // Initialize to Import
    setProgressStep("Import");

});

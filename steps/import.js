//import.js file 
// This file is used to import media
// --- Global Variables (Application State) ---
// These variables store the *state* of our video editor application.
let mediaLibrary = []; // Array to hold details of all uploaded files (like clips on the timeline).
let currentObjectURL = null; // Stores the temporary, local URL for the clip currently shown in the video player.
let project = {}; // Object to hold project metadata (title, ID, dates).
let isProjectIdValid = false; // A boolean flag to check if we loaded a project from the URL.

// --- DOM Element Variables (Declared, but NOT initialized here) ---
let currentMediaTitle;
let videoPreview;
let imagePreview;
let videoUpload;
let mediaListContainer;
let projectTitleDisplay;
let projectTitleInput;
let navTitleInput;
let uploadBtn; 
let dropArea;
let mediaCountDisplay; // Added for the clip counter
// let isLoggedIn; //this variable will let us display a message if the user is editing without logging in.


// --- Utility Functions ---

/**
 * Displays a non-disruptive, temporary error message to the user.
 * It uses the global 'rve-error-alert' element.
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
 */
function revokeCurrentURL() {
    if (currentObjectURL) {
        URL.revokeObjectURL(currentObjectURL); // This is the crucial memory cleanup step!
        currentObjectURL = null;
    }
}

/**
 * Placeholder function for updating the UI progress bar at the bottom.
 * @param {string} stepName - The name of the step (e.g., "Import", "Edit").
 */
function setProgressStep(stepName) {
    console.log(`Progress Step set to: ${stepName}`);
}

/**
 * Handles media loading errors (like unsupported video codecs).
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


// --- Media Upload Handler (MOVED TO GLOBAL SCOPE) ---
/**
 * Processes a list of uploaded files, validates them, and adds them to the mediaLibrary.
 * @param {File[]} files - An array of File objects selected by the user.
 */
function handleMediaUpload(files) {
    if (!files || files.length === 0) return;

    // CRITICAL FIX: Check for initialized elements before proceeding.
    if (!videoPreview || !currentMediaTitle) {
        displayVisualError("Editor initialization error. Please try refreshing.");
        return;
    }

    revokeCurrentURL(); 
    let lastFile = null;

    files.forEach((file) => {
        const fileType = file.type;

        // this checks what file it is
        if (
            !fileType.startsWith("video/") &&
            !fileType.startsWith("audio/") &&
            !fileType.startsWith("image/")
        ) {
        displayVisualError(`Skipping unsupported file: ${file.name}`); //shows the error if file can't be played
        return;
    }

        // Only run canPlayType for video/audio
        if (fileType.startsWith("video/") || fileType.startsWith("audio/")) {
            const canPlay = videoPreview.canPlayType(fileType);
            if (canPlay === "" || canPlay === "no") {
                displayVisualError(`Playback not supported for file: ${file.name}`);
                return;
    }
}


        const url = URL.createObjectURL(file);
        const type = fileType.split('/')[0]; // 'video' or 'audio'
        const newMedia = { name: file.name, url, file, type };
        mediaLibrary.push(newMedia);
        lastFile = newMedia;
    });

    if (lastFile) {
        // Automatically set the preview to the last uploaded file
        if (lastFile.type === "video") {
            videoPreview.src = lastFile.url;
            videoPreview.load();
            videoPreview.controls = true;
            currentMediaTitle.textContent = lastFile.name;
        } else if (lastFile.type === "audio") {
            videoPreview.src = "";
            videoPreview.controls = false;
            currentMediaTitle.textContent = `Ready: ${lastFile.name} (Audio)`;
        }
        
        currentObjectURL = lastFile.url;
    }

    renderMediaLibrary();
}

// --- Media Library Renderer (MOVED TO GLOBAL SCOPE) ---
/**
 * Clears and redraws the list of media clips in the sidebar.
 */
function renderMediaLibrary() {
    // CRITICAL FIX: Check for initialized elements before proceeding.
    if (!mediaListContainer) return;
    
    // Update media count display
    if (mediaCountDisplay) mediaCountDisplay.textContent = mediaLibrary.length;

    mediaListContainer.innerHTML = "";

    if (mediaLibrary.length === 0) {
        const placeholder = document.createElement("li");
        placeholder.textContent = "No clips imported yet.";
        placeholder.classList.add("media-placeholder"); // Add special class for styling
        mediaListContainer.appendChild(placeholder);
        return;
    }

    mediaLibrary.forEach((media) => {
        const item = document.createElement("li");
        // Use an icon for better visual distinction
        const icon = media.type === 'video' ? '📹' : '🎧';
        item.innerHTML = `<span class="media-icon">${icon}</span>${media.name}`;
        item.setAttribute('data-type', media.type);

        item.addEventListener("click", () => {
            revokeCurrentURL();
            
            // Highlight the active item
            Array.from(mediaListContainer.children).forEach(child => child.classList.remove('active'));
            item.classList.add('active');

            // Set the new preview
            if (media.type === "video" && videoPreview && currentMediaTitle) {
                videoPreview.src = media.url;
                videoPreview.load();
                videoPreview.controls = true;
                currentMediaTitle.textContent = media.name;
                currentObjectURL = media.url;
            } else if (media.type === "audio" && videoPreview && currentMediaTitle) {
                const audio = new Audio(media.url);
                audio.play().catch(e => {
                    displayVisualError("Could not play audio automatically. Click 'play' on the item.");
                });
                
                // Clear video preview area
                videoPreview.src = "";
                videoPreview.controls = false;
                currentMediaTitle.textContent = `Playing: ${media.name} (Audio)`;
                currentObjectURL = media.url;
            }
        });
        mediaListContainer.appendChild(item);
    });
}


/**
 * The DOMContentLoaded event listener is the entry point for all application logic.
 */
window.addEventListener("DOMContentLoaded", () => {
    console.log("RVE editor.js loaded!");

    // --- Initialize DOM Elements (CRITICAL STEP) ---
    currentMediaTitle = document.getElementById("current-media-title");
    videoPreview = document.getElementById("video-preview");
    videoUpload = document.getElementById("video-upload");
    imagePreview = document.getElementById("image-preview");
    mediaListContainer = document.getElementById("media-list");
    projectTitleDisplay = document.getElementById("project-title-input");
    projectTitleInput = document.getElementById("project-title-input");
    navTitleInput = document.getElementById("project-title-input");
    uploadBtn = document.getElementById("upload-btn");
    dropArea = document.getElementById("drag-drop-area");
    mediaCountDisplay = document.getElementById("media-count"); // Initialize the new element


    //Showing the Untiltied Project placeholder
    if (projectTitleDisplay) {
        project.title = "Untitled Project";
        projectTitleDisplay.textContent = `Project: ${project.title}`;
    }
    
    // Initial render call to show "No clips"
    renderMediaLibrary();


    
    // --- Upload Button Logic ---
    if (uploadBtn && videoUpload) {
        uploadBtn.addEventListener("click", () => {
            videoUpload.click(); // Opens file dialog
        });

        videoUpload.addEventListener("change", () => {
            const files = Array.from(videoUpload.files);
            handleMediaUpload(files); // Calls global function
        });
    }

    // --- Drag and Drop Logic ---
    if (dropArea) {
        // Drag Over/Enter: Add 'hover' class
        ["dragenter", "dragover"].forEach((event) => {
            dropArea.addEventListener(event, (e) => {
                e.preventDefault();
                dropArea.classList.add("hover");
            });
        });

        // Drag Leave/Drop: Remove 'hover' class and handle drop
        ["dragleave", "drop"].forEach((event) => {
            dropArea.addEventListener(event, (e) => {
                e.preventDefault();
                dropArea.classList.remove("hover");

                if (event === "drop") {
                    const files = Array.from(e.dataTransfer.files);
                    handleMediaUpload(files); // Calls global function
                }
            });
        });
    }

    // Save button logic
    const saveBtn = document.getElementById("save-btn");
if (saveBtn) {
    saveBtn.addEventListener("click", () => {
        if (!project.title || project.title.trim() === "") {
            displayVisualError("Please enter a project title before saving.");
            return;
        }
        //  Title change logic
        console.log(`Saving project: ${project.title}`);
        displayVisualError(`Project "${project.title}" saved successfully.`);
    });
}

    
    // Logic for the title sync
    if (projectTitleInput) {
        projectTitleInput.addEventListener("input", () => {
        project.title = projectTitleInput.value;
        console.log(`Project title updated: ${project.title}`);
        });
    }

    //update the title tag after the project is saved
    const pageTitle = document.getElementById("page-title");

    if (projectTitleInput && pageTitle) {
        projectTitleInput.addEventListener("input", () => {
        project.title = projectTitleInput.value;
        const suffix = " - Rutwik Video Editor";
        pageTitle.textContent = (project.title.trim() || "Untitled Project") + suffix;
    });
}


    setProgressStep("Import");
});

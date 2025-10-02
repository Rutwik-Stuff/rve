// Global library to store all imported media assets
let mediaLibrary = [];
let currentObjectURL = null; // Memory management variable

/**
 * Helper function to show a visual error message in the dedicated UI box.
 * @param {string} message - The error message to display.
 */
function displayVisualError(message) {
    let errorBox = document.getElementById("rve-error-alert");
    if (errorBox) {
        errorBox.textContent = message;
        errorBox.style.display = 'block';
        // Fade out after 6 seconds
        setTimeout(() => errorBox.style.display = 'none', 6000); 
    }
}

/**
 * Revokes the URL of the current media object to free memory.
 */
function revokeCurrentURL() {
    if (currentObjectURL) {
        // Free up memory associated with the previous blob URL
        URL.revokeObjectURL(currentObjectURL);
        currentObjectURL = null;
    }
}

/**
 * GLOBAL ERROR HANDLER FUNCTION (Callable from HTML onerror attribute).
 * Handles media loading errors (codec issues, corrupted files)
 * and displays a user-friendly error state on the video player.
 * * NOTE: This function only fires when the browser fails to load the media 
 * stream at runtime (e.g., codec failure), NOT on click.
 * * @param {HTMLMediaElement} mediaElement - The video or audio element that failed.
 */
window.handleGlobalMediaError = function(mediaElement) {
    // 1. Clear previous error state
    mediaElement.style.backgroundColor = 'transparent'; 
    mediaElement.classList.remove('media-error');
    
    // Get a brief error code for logging/debugging
    let errorCode = mediaElement.error ? `(Code ${mediaElement.error.code})` : '';

    // 2. Display simplified, non-disruptive error in the visual alert box
    const visualAlert = `Playback failed for this file. Format or codec not supported. ${errorCode}`;
    displayVisualError(visualAlert);
    
    // 3. Set the error style on the video element itself, keeping the project title clean
    mediaElement.classList.add('media-error');
    mediaElement.innerHTML = `
        <div style="padding: 20px;">
            <p style="font-size: 1.2em;">Playback Error ⚠️</p>
            <p>File format or codec is not supported by the browser.</p>
        </div>
    `;
};

/**
 * Function to handle loading media into the preview player.
 * @param {object} media - The media object from the library.
 * @param {HTMLVideoElement} videoPreview - The preview element.
 * @param {HTMLElement} currentMediaTitle - The title element above the player.
 */
function loadMediaPreview(media, videoPreview, currentMediaTitle) {
    // 1. Memory cleanup
    revokeCurrentURL();
    
    const newURL = media.url;
    currentObjectURL = newURL; // Update tracking variable

    // 2. CRITICAL STEP: Reset player attributes and state
    videoPreview.classList.remove('media-error');
    videoPreview.style.backgroundColor = '#000';
    videoPreview.innerHTML = '';
    videoPreview.removeAttribute('poster'); 
    
    // 3. Set the source and title
    videoPreview.src = newURL;
    // Calling .load() starts the media stream process, which will trigger onerror if needed.
    videoPreview.load(); 
    
    currentMediaTitle.textContent = media.name;
}

/**
 * Function to render the list of uploaded files in the media library panel.
 * @param {HTMLVideoElement} videoPreview - The preview element.
 * @param {HTMLElement} currentMediaTitle - The title element.
 * @param {string | null} activeMediaName - The name of the media to highlight as active (used after upload).
 */
function renderMediaLibrary(videoPreview, currentMediaTitle, activeMediaName = null) {
    const mediaListContainer = document.getElementById('media-list');
    mediaListContainer.innerHTML = ''; // Clear existing list

    if (mediaLibrary.length === 0) {
         mediaListContainer.innerHTML = `<p class="text-sm text-gray-500 p-2">
            Upload a video or audio file to start editing.
        </p>`;
        return;
    }

    // Clear all previously active states
    document.querySelectorAll('.media-list-item').forEach(el => el.removeAttribute('data-active'));

    mediaLibrary.forEach((media) => {
        const item = document.createElement('div');
        item.className = 'media-list-item';
        // Use emojis for video and audio icons
        const icon = media.type.startsWith('video') ? '🎬' : '🎵'; 

        item.innerHTML = `
            <span class="media-icon">${icon}</span>
            <span class="media-name">${media.name}</span>
        `;

        // Check if this item should be the active one right now
        if (media.name === activeMediaName) {
            item.setAttribute('data-active', 'true');
        }

        item.addEventListener('click', () => {
            // 1. Set active state on the clicked item
            document.querySelectorAll('.media-list-item').forEach(el => el.removeAttribute('data-active'));
            item.setAttribute('data-active', 'true');

            // 2. Load media
            loadMediaPreview(media, videoPreview, currentMediaTitle);
        });

        mediaListContainer.appendChild(item);
    });
}


document.addEventListener("DOMContentLoaded", () => {
    // Get all necessary DOM elements
    const currentMediaTitle = document.getElementById('current-media-title');
    const videoPreview = document.getElementById("video-preview");
    const videoUpload = document.getElementById("video-upload");
    const projectTitleDisplay = document.getElementById("project-title");
    const projectTitleInput = document.getElementById("title-input");
    const navTitleInput = document.getElementById("project-title-input");
    
    // --- Project Initialization (Placeholder data) ---
    const project = {
        id: crypto.randomUUID(), 
        title: navTitleInput.value || "Untitled Project",
        createdAt: new Date().toISOString(),
        lastEdited: new Date().toISOString()
    };

    projectTitleDisplay.textContent = `Project: ${project.title}`;
    projectTitleInput.value = project.title;
    navTitleInput.value = project.title;

    // --- Save Button Handler ---
    document.getElementById("save-btn").addEventListener("click", () => {
        const newTitle = projectTitleInput.value.trim() || "Untitled Project";
        project.title = newTitle;
        project.lastEdited = new Date().toISOString();

        // Update all UI elements
        projectTitleDisplay.textContent = `Project: ${newTitle}`;
        navTitleInput.value = newTitle;
        document.title = `${newTitle} - Rutwik Video Editor`;

        console.log("Project data updated locally:", project);
        displayVisualError(`Project "${newTitle}" saved successfully!`); 
    });

    // Sync input changes between the two title fields
    projectTitleInput.addEventListener('input', (e) => navTitleInput.value = e.target.value);
    navTitleInput.addEventListener('input', (e) => projectTitleInput.value = e.target.value);


    // --- File Upload & Playback Logic ---
    if (!videoUpload || !videoPreview) {
        displayVisualError("CRITICAL RVE ERROR: Editor elements missing (x00003).");
        return;
    }
    
    videoUpload.addEventListener("change", () => {
        const files = Array.from(videoUpload.files);
        if (files.length === 0) {
            displayVisualError("No files selected.");
            return;
        }

        revokeCurrentURL();
        let lastMedia = null; 

        files.forEach((file) => {
            // CRITICAL CHECK: Use canPlayType to see if the browser supports the file's codec/mime type
            const canPlay = videoPreview.canPlayType(file.type);
            
            // We only block files if the browser says it absolutely cannot play them.
            if (canPlay === "" || canPlay === "no") {
                const fileExtension = file.name.split('.').pop().toUpperCase();
                const warningMsg = `UNSUPPORTED FILE: Skipping "${file.name}" (Codec/Format: ${fileExtension}).`;
                console.warn(warningMsg);
                displayVisualError(warningMsg);
                return; // Skips this file
            }

            const newURL = URL.createObjectURL(file);
            
            const newMedia = {
                name: file.name,
                type: file.type,
                url: newURL,
                file: file 
            };

            mediaLibrary.push(newMedia);
            lastMedia = newMedia; 
            
            console.log(`Clip Added to Library: ${file.name}`);
        });

        if (lastMedia) {
            renderMediaLibrary(videoPreview, currentMediaTitle, lastMedia.name);
            loadMediaPreview(lastMedia, videoPreview, currentMediaTitle);
        }
    });
    
    // Initial render of the media list on load
    renderMediaLibrary(videoPreview, currentMediaTitle);
});

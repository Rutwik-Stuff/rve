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
        setTimeout(() => errorBox.style.display = 'none', 10000); // Hide after 10 seconds
    }
}

/**
 * Revokes the URL of the current media object to free memory.
 */
function revokeCurrentURL() {
    if (currentObjectURL) {
        URL.revokeObjectURL(currentObjectURL);
        currentObjectURL = null;
    }
}

/**
 * GLOBAL ERROR HANDLER FUNCTION (Callable from HTML onerror attribute).
 * This function handles media loading errors (codec issues, corrupted files)
 * and displays a user-friendly error state on the video player.
 * @param {HTMLMediaElement} mediaElement - The video or audio element that failed.
 */
window.handleGlobalMediaError = function(mediaElement) {
    mediaElement.style.backgroundColor = 'transparent'; 
    mediaElement.classList.remove('media-error');
    
    let errorText = "MEDIA LOAD FAILED: Codec Unsupported or Corrupted!";
    let errorCode = "(Unknown)";
    let errorMessage = "";
    
    if (mediaElement.error) {
         errorCode = `Code ${mediaElement.error.code}`;
         if (mediaElement.error.message) {
             errorMessage = `: ${mediaElement.error.message}`;
         }
    }

    const fullMessage = `!! ${errorText}${errorMessage} (${errorCode}) !!`;
    document.getElementById("project-title").textContent = fullMessage;
    displayVisualError(fullMessage);
    
    // Set the error style for visual feedback
    mediaElement.classList.add('media-error');
    // Note: We don't try to maintain height here, the CSS will handle the styling.
    mediaElement.innerHTML = `ERROR: Cannot Play Media.<br>The browser codec check failed.`;
};

/**
 * Function to handle loading media into the preview player.
 * @param {object} media - The media object from the library.
 * @param {HTMLVideoElement} videoPreview - The preview element.
 * @param {HTMLElement} currentMediaTitle - The title element above the player.
 */
function loadMediaPreview(media, videoPreview, currentMediaTitle) {
    // Revoke the URL of the previously loaded file to prevent memory leaks
    revokeCurrentURL();
    
    const newURL = media.url;
    currentObjectURL = newURL; // Update tracking variable

    // --- CRITICAL STEP: Reset player attributes ---
    videoPreview.classList.remove('media-error');
    videoPreview.style.backgroundColor = '#000';
    videoPreview.innerHTML = '';
    
    // If it's audio, reset video-specific attributes
    if (media.type.startsWith('audio')) {
        videoPreview.setAttribute('poster', ''); 
    }
    
    // Set the source and title
    videoPreview.src = newURL;
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
         mediaListContainer.innerHTML = `<p style="color: #999; opacity: 0.7; font-size: 0.9em; padding: 10px;">
            Upload a video or audio file to begin building your project library.
        </p>`;
        return;
    }

    mediaLibrary.forEach((media) => {
        const item = document.createElement('div');
        item.className = 'media-list-item';
        // Use symbols based on media type
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
            // 1. Remove active state from all items
            document.querySelectorAll('.media-list-item').forEach(el => el.removeAttribute('data-active'));
            
            // 2. Set active state on the clicked item
            item.setAttribute('data-active', 'true');

            // 3. Load media
            loadMediaPreview(media, videoPreview, currentMediaTitle);
        });

        mediaListContainer.appendChild(item);
    });
}


document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get("id");

    const currentMediaTitle = document.getElementById('current-media-title');
    const videoPreview = document.getElementById("video-preview");
    const videoUpload = document.getElementById("video-upload");
    
    // --- Project Initialization ---
    if (!projectId) {
        document.getElementById("project-title").textContent = "No project ID found (using default).";
    }

    const project = {
        id: projectId || 'default-project-id',
        title: "Untitled Project",
        createdAt: new Date().toISOString(),
        lastEdited: new Date().toISOString()
    };

    document.getElementById("project-title").textContent = `Editing: ${project.title}`;
    document.getElementById("title-input").value = project.title;
    document.getElementById("project-title-input").value = project.title;

    // --- Save Button Handler ---
    document.getElementById("save-btn").addEventListener("click", () => {
        const newTitle = document.getElementById("title-input").value;
        project.title = newTitle;
        project.lastEdited = new Date().toISOString();

        document.getElementById("project-title").textContent = `Editing: ${newTitle}`;
        document.getElementById("project-title-input").value = newTitle;
        document.title = `${newTitle} - Rutwik Video Editor`;

        console.log("Project saved locally:", project);
        displayVisualError("Project saved successfully!"); 
    });

    // --- Video Upload & Playback Logic ---

    if (!videoUpload || !videoPreview) {
        displayVisualError("CRITICAL RVE ERROR: Editor elements missing (x00003).");
        return;
    }
    
    // Handle the file selection (Change Handler)
    videoUpload.addEventListener("change", () => {
        const files = Array.from(videoUpload.files);
        if (files.length === 0) {
            displayVisualError("No files selected.");
            return;
        }

        // Revoke the URL of the previously loaded file for immediate memory cleanup
        revokeCurrentURL();
        
        let lastMedia = null; // Track the last media added for automatic loading

        // Process all new files
        files.forEach((file) => {
            // CRITICAL CHECK: Use canPlayType to see if the browser supports the file's codec/mime type
            const canPlay = videoPreview.canPlayType(file.type);
            
            if (canPlay === "" || canPlay === "no") {
                const fileExtension = file.name.split('.').pop().toUpperCase();
                const warningMsg = `UNSUPPORTED FILE: The browser cannot play "${file.name}" (Codec/Format: ${fileExtension}). Try converting to H.264 MP4.`;
                console.warn(warningMsg);
                displayVisualError(warningMsg);
                return; // Skips this file, allowing other files in the selection to process
            }

            const newURL = URL.createObjectURL(file);
            
            const newMedia = {
                name: file.name,
                type: file.type,
                url: newURL,
                file: file 
            };

            mediaLibrary.push(newMedia);
            lastMedia = newMedia; // Update the last media uploaded
            
            console.log(`Clip Added to Library: ${file.name}`);
        });

        if (lastMedia) {
            // Render the library, passing the name of the last uploaded item to set it active during render.
            renderMediaLibrary(videoPreview, currentMediaTitle, lastMedia.name);

            // Automatically load the LAST uploaded file into the preview
            setTimeout(() => {
                loadMediaPreview(lastMedia, videoPreview, currentMediaTitle);
            }, 0);
        }
    });
    
    // Initialize the list display
    renderMediaLibrary(videoPreview, currentMediaTitle);
});

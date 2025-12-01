//global variables
const importedVideos = []; //nah bro, the videos popup broke without this array, don't remove it.

export function initStage() {
  console.log("🧬 RVE Edit Tab Initialized (edit-functions branch)");

  // Timeline container setup (placeholder removed)
  const timeline = document.getElementById("timeline-container");
  if (timeline) {
    timeline.innerHTML = ""; // Ready for actual timeline rendering
  }

  //aspect ratio logic
  function setAspect(ratio) {
    const video = document.getElementById('video-preview');
    const image = document.getElementById('image-preview');

    const classes = ['aspect-16-9', 'aspect-4-3', 'aspect-1-1', 'aspect-21-9', 'aspect-9-16'];

    video.classList.remove(...classes);
    image.classList.remove(...classes);

    video.classList.add(`aspect-${ratio}`);
    image.classList.add(`aspect-${ratio}`);

    console.log(`Aspect ratio changed to ${ratio} succsefully!`);
}


  //dropdown logic for the aspect ratios
  document.querySelectorAll('.dropdown-toggle').forEach(toggle => {
    toggle.addEventListener('click', () => {
      const menu = toggle.nextElementSibling;
      menu.style.display = (menu.style.display === 'block') ? 'none' : 'block';
    });
  });

   window.setAspect = setAspect; //so that in-line HTML will still work.
  
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

  // inside initStage()
document.querySelector(".videos-tool-btn")?.addEventListener("click", () => {
  const popup = document.getElementById("add-video-view");
  const content = popup.querySelector(".popup-content");
  content.innerHTML = "";

  if (importedVideos.length === 0) {
    content.innerHTML = "<p>No videos imported yet.</p>";
  } else {
    importedVideos.forEach(video => {
      const item = document.createElement("div");
      item.className = "video-item";
      item.innerHTML = `
        <p>${video.name}</p>
        <video src="${video.url}" controls width="200"></video>
      `;
      content.appendChild(item);
    });
  }

  popup.classList.remove("hidden");
  console.log("🎬 Videos popup opened");
});

document.getElementById("close-popup")?.addEventListener("click", () => {
  document.getElementById("add-video-view").classList.add("hidden");
  console.log("❌ Videos popup closed");
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

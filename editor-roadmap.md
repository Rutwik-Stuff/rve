# 🧠 RVE Stage System To-Do

Tracking the implementation of modular JS per stage inside `editor.html`.

---

## ✅ Core Setup
- [x] Create `editor.html` as the unified shell
- [x] Add `?stage=Import` or `data-stage="Import"` to control initial stage
- [ ] Create shared layout: nav, import zone, editor content, progress bar
- [x] Fix RVE from almost breaking using the `rve-backup ` branch

---

## 🧩 Stage Modules
- [x] Create `import.js` for Import logic
- [ ] Create `edit.js` for Edit logic
- [ ] Create `music.js` for Music logic
- [ ] Create `final-checks.js` for Final Checks logic
- [ ] Create `export.js` for Export logic
- [ ] Create `upload.js` for Upload logic

---

## 🔄 Stage Loader
- [x] Create `stage-loader.js` to detect current stage
- [x] Dynamically load correct JS file based on `?stage=` or `data-stage`
- [ ] Show error message in console if unknown or can't switch

---

## 📦 Shared State
- [ ] Create `project.js` to store project ID, title, media list, current stage
- [ ] Ensure all stage modules can read/write shared state

---

## 🖱️ Progress Bar Interactivity
- [x] Convert progress steps to `<button>` elements
- [x] Add click listeners to update active step
- [ ]  Trigger stage transitions on click

---

## 🧪 Testing & Validation
- [ ] Test each stage module independently
- [x] Test import.js
- [ ] Confirm shared state persists across stage switches
- [ ] Validate error handling and unsupported formats (e.g. `.mkv`)
- [ ] Confirm layout integrity across all stages

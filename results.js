"use strict";

const conditions = {
  blur: { label: "Injected motion blur", baseline: [1, 2], restored: [19, 16] },
  dim: { label: "Physically dim room + Gaussian noise", baseline: [0, 0], restored: [18, 15] }
};

const tasks = [
  { key: "blue", label: "Cube into blue box", result: "The cube lands in the blue box with ACO-MoE." },
  { key: "cup", label: "Cup on coaster", result: "The arm places the cup on the coaster with ACO-MoE." }
];

const taskSelect = document.querySelector("#task");
const conditionSelect = document.querySelector("#condition");
const videoHost = document.querySelector("#trial-video");
const clipNote = document.querySelector("#clip-note");

function videoElement(slug, label, ratio) {
  const video = document.createElement("video");
  video.src = `assets/${slug}.mp4`;
  video.poster = `assets/${slug}.jpg`;
  video.setAttribute("aria-label", label);
  video.style.setProperty("--ratio", ratio);
  video.controls = true;
  video.playsInline = true;
  video.preload = "metadata";
  return video;
}

function showTrial() {
  const condition = conditionSelect.value;
  const result = conditions[condition];
  const index = tasks.findIndex((task) => task.key === taskSelect.value);
  const task = tasks[index];
  const slug = `${task.key}-${condition}`;
  const figure = document.createElement("figure");
  const video = videoElement(slug, `${task.label}, ${result.label}. Left: without restoration. Right: ACO-MoE.`, "960/500");
  const caption = document.createElement("figcaption");
  caption.textContent = task.result;
  video.addEventListener("error", () => {
    const still = document.createElement("img");
    still.src = `assets/${condition}-stills.webp`;
    still.className = "still";
    still.alt = `Paper rollout frames for both tasks under ${result.label}.`;
    video.replaceWith(still);
    caption.textContent = "Rollout frames from the published paper.";
  }, { once: true });
  figure.append(video, caption);
  videoHost.replaceChildren(figure);
  clipNote.textContent = "Global-camera snapshots played at 2× time scale. Insets show the policy inputs."
    + (condition === "dim" ? " Main views are brightened ×5 for display." : "");
  const baseline = result.baseline.reduce((sum, count) => sum + count, 0);
  const restored = result.restored.reduce((sum, count) => sum + count, 0);
  document.querySelector("#count-context").textContent = `${task.label} · successes per 20 trials`;
  document.querySelector("#paired-counts").textContent = `${result.baseline[index]}/20 → ${result.restored[index]}/20`;
  document.querySelector("#pooled-context").textContent = "Blue-box and cup tasks · successes per 40 trials";
  document.querySelector("#pooled-counts").textContent = `${baseline}/40 → ${restored}/40`;
}

taskSelect.addEventListener("change", showTrial);
conditionSelect.addEventListener("change", showTrial);
showTrial();

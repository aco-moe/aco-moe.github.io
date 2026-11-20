"use strict";

const degradationModes = [
  ["clean", "Clean", "Reference"],
  ["haze", "Haze", "0.60"],
  ["rain", "Rain", "0.60"],
  ["snow", "Snow", "0.60"],
  ["low-light", "Low light", "0.70"],
  ["noise", "Gaussian noise", "0.50"],
  ["blur", "Motion blur", "0.35"],
  ["jpeg", "JPEG", "0.70"]
];

function el(tag, text, className) {
  const element = document.createElement(tag);
  if (text !== undefined) element.textContent = text;
  if (className) element.className = className;
  return element;
}

const vdcsTask = document.querySelector("#vdcs-task");
const vdcsExamples = document.querySelector("#vdcs-examples");

function showDegradationExamples() {
  const task = vdcsTask.value;
  const taskLabel = vdcsTask.options[vdcsTask.selectedIndex].text;
  const figures = degradationModes.map(([slug, label, severity]) => {
    const image = el("img");
    image.src = `assets/vdcs/${task}-${slug}.webp`;
    image.width = 238;
    image.height = 238;
    image.loading = "lazy";
    image.alt = `${taskLabel}, ${label.toLowerCase()} observation`;
    const caption = el("figcaption");
    caption.append(el("strong", label), el("span", severity));
    const figure = el("figure");
    figure.append(image, caption);
    return figure;
  });
  vdcsExamples.replaceChildren(...figures);
}

function formatTableCell(value) {
  const cell = el("td");
  if (typeof value === "string") {
    cell.textContent = value || "—";
    return cell;
  }
  if (value.rank) cell.classList.add(`rank-${value.rank}`);
  cell.append(el("span", value.mean, "mean"));
  if (value.std) cell.append(el("span", ` ± ${value.std}`, "std"));
  if (value.detail) cell.append(el("span", value.detail, "delta"));
  return cell;
}

function createExperimentTable(spec) {
  const shell = el("details", undefined, "evidence");
  shell.open = spec.open;
  shell.append(el("summary", spec.title), el("p", spec.description));
  const wrapper = el("div", undefined, "table-scroll");
  wrapper.tabIndex = 0;
  wrapper.setAttribute("role", "region");
  wrapper.setAttribute("aria-label", spec.title);
  const table = el("table", undefined, "experiment-table");
  const headerRow = el("tr");
  for (const name of ["Task / setting", ...spec.headers]) {
    const cell = el("th", name);
    cell.scope = "col";
    headerRow.append(cell);
  }
  const head = el("thead");
  head.append(headerRow);
  const body = el("tbody");
  for (const row of spec.rows) {
    const tr = el("tr", undefined, row.aggregate ? "aggregate" : "");
    const label = el("th", row.name);
    label.scope = "row";
    tr.append(label, ...row.values.map(formatTableCell));
    body.append(tr);
  }
  table.append(head, body);
  wrapper.append(table);
  shell.append(wrapper);
  return shell;
}

vdcsTask.addEventListener("change", showDegradationExamples);
showDegradationExamples();
document.querySelector("#experiment-tables").append(...window.experimentTables.map(createExperimentTable));

const citationStatus = document.querySelector("#citation-status");
document.querySelector("#copy-citation").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(document.querySelector("#bibtex").textContent.trim());
    citationStatus.textContent = "Copied";
  } catch {
    citationStatus.textContent = "Use Download .bib to save the citation.";
  }
});

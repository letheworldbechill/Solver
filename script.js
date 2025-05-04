/* ---------- Daten‑Schicht ---------- */
const STORAGE_KEY = "pps_problems";
let problems = loadProblems();

function loadProblems() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}
function saveProblems() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(problems));
}

/* ---------- DOM‑Helfer ---------- */
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);
const listEl = $("#problem-list");
const tplCard = $("#tpl-problem-card").content;
const emptyMsg = $("#empty-msg");

/* ---------- Initial Rendering ---------- */
renderList();

/* ---------- List View ---------- */
function renderList() {
  listEl.innerHTML = "";
  if (problems.length === 0) {
    emptyMsg.classList.remove("hide");
    return;
  }
  emptyMsg.classList.add("hide");
  problems.forEach((p, idx) => {
    const clone = tplCard.cloneNode(true);
    clone.querySelector(".card-title").textContent = p.title || "(Entwurf)";
    clone.querySelector("small").textContent =
      `Schritt ${p.currentStep}/8 • ${new Date(p.createdAt).toLocaleDateString("de-DE")}`;
    clone.querySelector(".btn-resume").onclick = () => openWizard(idx);
    listEl.appendChild(clone);
  });
}

/* ---------- Wizard‑Logik ---------- */
const STEP_DEFS = [
  { title: "1 – Gefühle wahrnehmen", html: '<textarea placeholder="Wie fühle ich mich?"></textarea>' },
  { title: "2 – Problem in einen Satz pressen", html: '<input type="text" placeholder="Ich habe das Problem, dass …">' },
  { title: "3 – Ziel klären", html: '<textarea placeholder="Wie sieht gelöst aus?"></textarea>' },
  { title: "4 – Ideen sammeln (5 Min)", html: '<textarea placeholder="Ideen, getrennt durch Zeilen"></textarea>' },
  { title: "5 – Aufwand/Nutzen grob bewerten", html: '<textarea placeholder="Kurz bewerten …"></textarea>' },
  { title: "6 – Kleinsten nächsten Schritt festlegen", html: '<input type="text" placeholder="If 19 Uhr, dann …">' },
  { title: "7 – Mini‑Test planen", html: '<input type="date">' },
  { title: "8 – Feiern & Lernen", html: '<textarea placeholder="Was lief gut?"></textarea>' },
];

const wizard = $("#wizard");
const stepTitle = $("#step-title");
const stepContent = $("#step-content");
const progress = $("#progress");
const btnPrev = $("#btn-prev");
const btnNext = $("#btn-next");
const btnDone = $("#btn-done");
let activeIdx, activeProblem;

$("#btn-new").onclick = () => {
  problems.push({
    title: "",
    steps: Array(8).fill(""),
    currentStep: 1,
    createdAt: Date.now(),
    done: false,
  });
  saveProblems();
  openWizard(problems.length - 1);
};

function openWizard(idx) {
  activeIdx = idx;
  activeProblem = problems[idx];
  wizard.showModal();
  renderStep();
}

function renderStep() {
  const n = activeProblem.currentStep;
  const def = STEP_DEFS[n - 1];
  stepTitle.textContent = def.title;
  stepContent.innerHTML = def.html;
  const field = stepContent.querySelector("input,textarea");
  field.value = activeProblem.steps[n - 1] || "";
  field.oninput = (e) => {
    activeProblem.steps[n - 1] = e.target.value.trim();
  };

  progress.value = n;
  btnPrev.disabled = n === 1;
  btnNext.classList.toggle("hide", n === 8);
  btnDone.classList.toggle("hide", n !== 8);
}

btnPrev.onclick = () => {
  activeProblem.currentStep--;
  renderStep();
};
btnNext.onclick = () => {
  activeProblem.currentStep++;
  renderStep();
};
wizard.addEventListener("close", () => {
  saveProblems();
  renderList();
});

btnDone.onclick = () => {
  activeProblem.done = true;
  wizard.close();
  alert("🎉 Problem abgeschlossen! Super gemacht.");
};

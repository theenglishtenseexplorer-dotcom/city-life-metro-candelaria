/* CITY LIFE | Metro Candelaria — Milestone 2 */
const SAVE_KEY = "cityLifeSave";
const SAVE_VERSION = 2;

const freshState = () => ({
  version: SAVE_VERSION,
  player: null,
  money: 35000,
  energy: 100,
  health: 100,
  happiness: 75,
  confidence: 65,
  day: 1,
  period: "Morning",
  district: "Residential Heights",
  location: "Studio Apartment",
  chapter: 1,
  sceneIndex: 0,
  storyStarted: false,
  storyComplete: false,
  flags: {},
  choiceHistory: [],
  relationships: { "Mara": 0 },
  contacts: [],
  log: ["You arrived in Metro Candelaria."],
  createdAt: null
});

let state = freshState();
let toastTimer;

const storyScenes = [
  {
    id: "arrival",
    location: "Residential Heights · Studio Apartment",
    title: "A city of your own",
    speaker: "Narration",
    text: "The taxi pulls away, leaving you in front of a modest apartment building. The city hums around you—jeepneys in the distance, vendors setting up, and unfamiliar voices drifting through the morning air. Metro Candelaria. This is where your next chapter begins.",
    choices: [
      { label: "Take a moment to look around.", next: 1, effects: { happiness: 3 }, flag: "paused_to_observe" },
      { label: "Head inside. There's no time to waste.", next: 2, effects: { confidence: 3 }, flag: "eager_to_start" }
    ]
  },
  {
    id: "neighbor",
    location: "Residential Heights · Apartment Lobby",
    title: "A friendly face",
    speaker: "Mara",
    text: "A young woman carrying a paper bag notices you struggling with your keys. “Hey! New tenant? I'm Mara. Welcome to the building.” She gives you an easy smile. “If you need directions, just ask. This neighborhood can be a maze at first.”",
    choices: [
      { label: "“Thanks! I'm glad to meet someone already.”", next: 3, effects: { happiness: 3, relationship: 2 }, flag: "met_mara_warmly" },
      { label: "“I think I'll figure things out. But thanks.”", next: 3, effects: { confidence: 2 }, flag: "met_mara_reserved" }
    ]
  },
  {
    id: "inside",
    location: "Residential Heights · Studio Apartment",
    title: "A fresh start",
    speaker: "Narration",
    text: "You unlock the door and step into your new studio. It's small, but it's yours. The boxes can wait. For now, you take in the quiet and let the reality of your fresh start settle in.",
    choices: [
      { label: "Unpack the essentials first.", next: 3, effects: { confidence: 2 }, flag: "settled_in" },
      { label: "Check your phone for messages.", next: 3, effects: { happiness: 2 }, flag: "checked_phone_first" }
    ]
  },
  {
    id: "next_step",
    location: "Residential Heights · Studio Apartment",
    title: "What comes next?",
    speaker: "Narration",
    text: "Your first morning in Metro Candelaria is underway. There are errands to run, places to discover, and people you haven't met yet. You open your phone and look at the day ahead. This city is yours to explore—but where will you begin?",
    choices: [
      { label: "Explore the neighborhood.", next: 4, flag: "first_plan_explore" },
      { label: "Look for work opportunities.", next: 4, flag: "first_plan_work" },
      { label: "Get settled and take it one step at a time.", next: 4, flag: "first_plan_settle" }
    ]
  },
  {
    id: "chapter_end",
    location: "Residential Heights · Studio Apartment",
    title: "The beginning",
    speaker: "Narration",
    text: "You have taken your first steps. Metro Candelaria is no longer just a place on a map—it's the setting of your story. From here, you can follow the next chapter or step out into the city and make your own day.",
    choices: [
      { label: "Finish Chapter 1 and enter free roam →", finish: true, flag: "chapter_1_complete" }
    ]
  }
];

const $ = id => document.getElementById(id);
const clamp = n => Math.max(0, Math.min(100, Number(n) || 0));

function showToast(message) {
  const toast = $("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
}

function saveGame(showMessage = false) {
  try {
    state.version = SAVE_VERSION;
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    $("save-indicator").textContent = "● SAVED";
    if (showMessage) showToast("Game saved successfully.");
  } catch (error) {
    $("save-indicator").textContent = "SAVE ERROR";
    showToast("Unable to save. Check browser storage.");
  }
}

function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return false;
    const saved = JSON.parse(raw);
    state = { ...freshState(), ...saved };
    state.flags ||= {};
    state.choiceHistory ||= [];
    state.relationships ||= { Mara: 0 };
    state.contacts ||= [];
    state.log ||= [];
    state.version = SAVE_VERSION;
    return Boolean(state.player);
  } catch (error) {
    console.warn("Save could not be loaded:", error);
    state = freshState();
    return false;
  }
}

function showScreen(id) {
  document.querySelectorAll(".screen").forEach(screen => screen.classList.remove("active"));
  $(id).classList.add("active");
}

function avatarMarkup(player, sizeClass = "avatar-small") {
  return `<div class="avatar ${sizeClass} ${player.skinTone || "tone-2"} ${player.hairColor || "hair-dark"} ${player.outfit || "outfit-blue"} ${player.hairStyle || "short"}">
    <div class="avatar-hair"></div><div class="avatar-face"><span class="eyes">••</span><span class="mouth"></span></div><div class="avatar-neck"></div><div class="avatar-body"></div></div>`;
}

function updateAvatarPreview() {
  const avatar = $("avatar-preview");
  avatar.className = `avatar avatar-medium ${$("skin-tone").value} ${$("hair-color").value} ${$("outfit").value} ${$("hair-style").value}`;
  $("preview-name").textContent = $("player-name").value.trim() || "Your character";
  $("preview-meta").textContent = `${$("player-gender").value} · ${$("player-background").value === "Custom" ? "Your own background" : $("player-background").value}`;
}

function updateClock() {
  $("game-clock").textContent = `DAY ${state.day} · ${state.period.toUpperCase()}`;
  $("day-number").textContent = state.day;
}

function updateDashboard() {
  if (!state.player) return;
  $("greeting").textContent = `Welcome, ${state.player.name}!`;
  $("player-description").textContent = `${state.player.age} years old · ${state.player.gender} · ${state.player.background}`;
  $("money").textContent = `₱${state.money.toLocaleString("en-PH")}`;
  $("energy").textContent = state.energy;
  $("health").textContent = state.health;
  $("happiness").textContent = state.happiness;
  $("energy-meter").style.width = `${state.energy}%`;
  $("health-meter").style.width = `${state.health}%`;
  $("happiness-meter").style.width = `${state.happiness}%`;
  $("current-location").textContent = state.location;
  $("current-district").textContent = `${state.district}, Metro Candelaria`;
  $("dashboard-avatar").outerHTML = avatarMarkup(state.player, "avatar-small").replace('class="avatar avatar-small', 'id="dashboard-avatar" class="avatar avatar-small');
  $("chapter-title").textContent = state.storyComplete ? "Chapter 1: Completed" : "Welcome to the City";
  $("chapter-summary").textContent = state.storyComplete ? "Your first chapter is complete. Your city life is now yours to shape." : "A new address, a new beginning, and a city full of possibilities.";
  updateClock();
}

function setFlag(flag) {
  if (flag) state.flags[flag] = true;
}

function applyEffects(effects = {}) {
  if (effects.money) state.money = Math.max(0, state.money + effects.money);
  ["energy", "health", "happiness", "confidence"].forEach(key => {
    if (effects[key]) state[key] = clamp(state[key] + effects[key]);
  });
  if (effects.relationship) state.relationships.Mara = (state.relationships.Mara || 0) + effects.relationship;
}

function renderStory() {
  const scene = storyScenes[state.sceneIndex];
  if (!scene) return;
  $("section-content").innerHTML = `
    <div class="story-shell">
      <p class="eyebrow">SEASON 1 · CHAPTER 1 · ${state.sceneIndex + 1} / ${storyScenes.length}</p>
      <div class="story-scene"><div class="scene-sun"></div><div class="scene-building"></div>
        <div class="scene-copy"><div class="scene-location">${scene.location.toUpperCase()}</div><h2>${scene.title}</h2><p>${scene.text}</p></div>
      </div>
      <div class="dialogue-box"><div class="speaker">${scene.speaker.toUpperCase()}</div><div class="dialogue-text">${scene.speaker === "Narration" ? " " : scene.speaker + " speaks..."}</div>
        <div class="choice-list">${scene.choices.map((choice, index) => `<button class="choice-btn" data-choice="${index}">${choice.label}</button>`).join("")}</div>
      </div>
      <div class="story-controls"><span>Choices shape your story and are saved automatically.</span><button id="story-exit">RETURN TO DASHBOARD</button></div>
    </div>`;
  $("section-content").querySelectorAll("[data-choice]").forEach(button => {
    button.addEventListener("click", () => chooseStoryOption(Number(button.dataset.choice)));
  });
  $("story-exit").addEventListener("click", () => {
    updateDashboard();
    renderPage("story");
  });
}

function chooseStoryOption(index) {
  const scene = storyScenes[state.sceneIndex];
  const choice = scene?.choices[index];
  if (!choice) return;
  state.choiceHistory.push({ scene: scene.id, choice: choice.label, day: state.day });
  setFlag(choice.flag);
  applyEffects(choice.effects);
  if (choice.finish) {
    state.storyComplete = true;
    state.storyStarted = true;
    state.log.push("Completed Season 1, Chapter 1: Welcome to the City.");
    showToast("Chapter 1 completed! Free roam unlocked.");
    saveGame();
    updateDashboard();
    renderPage("city");
    return;
  }
  state.sceneIndex = choice.next;
  state.storyStarted = true;
  saveGame();
  renderStory();
  updateDashboard();
}

function renderPage(page) {
  document.querySelectorAll(".bottom-nav button").forEach(button => button.classList.toggle("nav-active", button.dataset.page === page));
  const content = $("section-content");
  if (page === "story") {
    if (!state.storyComplete) {
      renderStory();
    } else {
      content.innerHTML = `<p class="eyebrow">SEASON 1 · CHAPTER 1</p><h2>Welcome to the City</h2><p>Chapter completed. Your choices have been recorded. You can revisit your story history below.</p><h3>Decision history</h3><ul class="log-list">${state.choiceHistory.map(item => `<li>${item.choice}</li>`).join("") || "<li>No choices recorded yet.</li>"}</ul><button class="primary-btn" id="free-roam-from-story">EXPLORE THE CITY →</button>`;
      $("free-roam-from-story").addEventListener("click", () => renderPage("city"));
    }
  } else if (page === "city") {
    content.innerHTML = `<p class="eyebrow">METRO CANDELARIA</p><h2>Explore the city</h2><p>Your new home is in Residential Heights. The wider city will open up as development continues.</p>
      <div class="city-card"><span class="tag">YOUR NEIGHBORHOOD</span><h3>🏡 Residential Heights</h3><p>Studio Apartment · Community Park · Neighborhood Market · Fitness Center</p><button class="choice-btn" id="visit-park">Visit Community Park (demo)</button></div>
      <div class="city-card"><span class="tag">COMING DISTRICTS</span><h3>🏙️ Eight districts to discover</h3><p>Central Business District · Commercial Square · Old Town · Coastal District · Industrial Zone · Greenfield · Southpoint</p></div>`;
    $("visit-park").addEventListener("click", () => {
      state.location = "Community Park";
      state.energy = clamp(state.energy - 5);
      state.happiness = clamp(state.happiness + 5);
      advanceTime();
      state.log.push("Visited Community Park.");
      saveGame(); updateDashboard(); showToast("You spent some time at the park.");
    });
  } else if (page === "people") {
    const met = state.flags.met_mara_warmly || state.flags.met_mara_reserved;
    content.innerHTML = `<p class="eyebrow">YOUR SOCIAL CIRCLE</p><h2>People</h2><div class="people-card"><span class="tag">RESIDENTIAL HEIGHTS · NEIGHBOR</span><h3>👩 Mara ${met ? "· Acquaintance" : "· Not yet met"}</h3><p>${met ? "You met Mara at your apartment building." : "You may meet Mara during your first chapter."}</p><p>Relationship: ${state.relationships.Mara || 0}</p></div>`;
  } else if (page === "phone") {
    content.innerHTML = `<p class="eyebrow">YOUR PHONE</p><h2>Messages & contacts</h2><p>Your phone is quiet for now. New messages and contacts will appear as you meet people and progress through the story.</p><div class="people-card">📱 <strong>Contacts:</strong> ${state.contacts.length ? state.contacts.join(", ") : "No contacts yet"}</div>`;
  } else if (page === "profile") {
    const p = state.player;
    content.innerHTML = `<p class="eyebrow">PLAYER PROFILE</p><h2>${escapeHTML(p.name)}</h2><div class="profile-row">${avatarMarkup(p, "avatar-medium")}<div><h3>${escapeHTML(p.background)}</h3><p>${p.age} · ${escapeHTML(p.gender)}</p><p>Confidence: ${state.confidence}/100</p></div></div><p>Chapter 1: ${state.storyComplete ? "Completed" : "In progress"}</p><button class="secondary-btn" id="manual-save">SAVE GAME</button> <button class="secondary-btn" id="reset-game">RESET GAME</button>`;
    $("manual-save").addEventListener("click", () => saveGame(true));
    $("reset-game").addEventListener("click", resetGame);
  }
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
}

function advanceTime() {
  const periods = ["Morning", "Afternoon", "Evening", "Night"];
  const index = periods.indexOf(state.period);
  if (index < 3) state.period = periods[index + 1];
  else {
    state.period = "Morning";
    state.day += 1;
    state.energy = clamp(state.energy + 20);
  }
}

$("start-button").addEventListener("click", () => showScreen("creation-screen"));
$("back-welcome").addEventListener("click", () => showScreen("welcome-screen"));
$("brand-home").addEventListener("click", event => {
  event.preventDefault();
  if (state.player) { updateDashboard(); showScreen("dashboard-screen"); }
  else showScreen("welcome-screen");
});
$("continue-button").addEventListener("click", () => {
  if (state.player) { updateDashboard(); showScreen("dashboard-screen"); renderPage("story"); }
});
$("player-name").addEventListener("input", updateAvatarPreview);
["player-gender", "player-background", "skin-tone", "hair-style", "hair-color", "outfit"].forEach(id => $(id).addEventListener("change", () => {
  if (id === "player-background") $("custom-background-wrap").classList.toggle("hidden", $("player-background").value !== "Custom");
  updateAvatarPreview();
}));
$("character-form").addEventListener("submit", event => {
  event.preventDefault();
  const name = $("player-name").value.trim();
  const age = Number($("player-age").value);
  if (!name || age < 18 || age > 80) { showToast("Enter a name and an age between 18 and 80."); return; }
  const selectedBackground = $("player-background").value;
  const background = selectedBackground === "Custom" ? $("custom-background").value.trim() : selectedBackground;
  if (!background) { showToast("Please describe your character's background."); return; }
  state = freshState();
  state.player = {
    name, age, gender: $("player-gender").value, background,
    skinTone: $("skin-tone").value, hairStyle: $("hair-style").value,
    hairColor: $("hair-color").value, outfit: $("outfit").value
  };
  state.createdAt = new Date().toISOString();
  state.log.push(`${name} began a new life in Metro Candelaria.`);
  saveGame();
  updateDashboard();
  showScreen("dashboard-screen");
  renderPage("story");
  showToast(`Welcome to Metro Candelaria, ${name}!`);
});
$("story-button").addEventListener("click", () => {
  state.storyStarted = true;
  saveGame();
  renderPage("story");
});
document.querySelectorAll(".bottom-nav button").forEach(button => button.addEventListener("click", () => renderPage(button.dataset.page)));
document.querySelectorAll("[data-goto]").forEach(button => button.addEventListener("click", () => renderPage(button.dataset.goto)));

function resetGame() {
  if (!confirm("Reset your CITY LIFE save and create a new character? This cannot be undone.")) return;
  localStorage.removeItem(SAVE_KEY);
  state = freshState();
  $("continue-button").classList.add("hidden");
  showScreen("welcome-screen");
  showToast("Save reset. Start a new life!");
}

if (loadGame()) {
  $("continue-button").classList.remove("hidden");
  updateDashboard();
} else {
  $("continue-button").classList.add("hidden");
}
updateAvatarPreview();

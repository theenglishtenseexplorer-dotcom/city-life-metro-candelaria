/* CITY LIFE | Metro Candelaria
   Complete Milestone 2 game controller
   Works with the supplied index.html and style.css.
*/
(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const SAVE_KEY = "cityLifeSave";

  const defaultState = {
    version: 2,
    started: false,
    player: {
      name: "", age: 22, gender: "Woman", background: "New Graduate",
      customBackground: "", skinTone: "tone-2", hairStyle: "short",
      hairColor: "hair-dark", outfit: "outfit-blue"
    },
    stats: { money: 35000, energy: 100, health: 100, happiness: 75 },
    day: 1,
    time: "MORNING",
    location: "Studio Apartment",
    district: "Residential Heights, Metro Candelaria",
    storyIndex: 0,
    storyComplete: false,
    flags: {},
    relationships: { Mara: 0 },
    history: []
  };

  let state = loadState();

  const story = [
    {
      location: "Residential Heights · Apartment Entrance",
      title: "A New Address",
      text: "The ride drops you in front of a modest apartment building. The city hums around you—jeepneys passing, vendors calling out, and unfamiliar streets stretching in every direction. This is it. Your new life in Metro Candelaria begins today.",
      speaker: "YOU",
      dialogue: "You take a deep breath. Where should you go first?",
      choices: [
        { label: "Look around and take in the neighborhood", next: 1, effect: { happiness: 5 }, flag: "lookedAround" },
        { label: "Head straight inside and find your apartment", next: 1, effect: { energy: 3 }, flag: "wentInside" }
      ]
    },
    {
      location: "Residential Heights · Apartment Hallway",
      title: "A Friendly Face",
      text: "As you struggle with your bags, a neighbor steps out of the apartment across the hall. She gives you a welcoming smile.",
      speaker: "MARA",
      dialogue: "“Hey! You must be the new neighbor. I'm Mara. Need a hand with those bags?”",
      choices: [
        { label: "Smile and introduce yourself warmly", next: 2, effect: { happiness: 5 }, relationship: 2, flag: "friendlyToMara" },
        { label: "Thank her politely but say you can manage", next: 2, effect: {}, relationship: 0, flag: "reservedWithMara" }
      ]
    },
    {
      location: "Your Studio Apartment",
      title: "A Place to Call Home",
      text: "The apartment is small, but it is yours. A few boxes sit beside the couch. Through the window, you can see the rooftops and busy streets of Metro Candelaria.",
      speaker: "YOU",
      dialogue: "There is a lot to do, but you finally have a moment to settle in.",
      choices: [
        { label: "Unpack a few essentials", next: 3, effect: { energy: -5, happiness: 4 }, flag: "unpacked" },
        { label: "Check your phone for messages", next: 3, effect: {}, flag: "checkedPhone" }
      ]
    },
    {
      location: "Your Studio Apartment",
      title: "What's the Plan?",
      text: "Your bags are still half-unpacked, and tomorrow is a blank page. You open your notes and think about what you want from this new beginning.",
      speaker: "YOU",
      dialogue: "How will you spend your first day in the city?",
      choices: [
        { label: "Explore Metro Candelaria", next: 4, effect: { energy: -5, happiness: 8 }, flag: "firstPlanExplore" },
        { label: "Start looking for work opportunities", next: 4, effect: { happiness: 2 }, flag: "firstPlanWork" },
        { label: "Stay in and get properly settled", next: 4, effect: { energy: 8, health: 2 }, flag: "firstPlanRest" }
      ]
    },
    {
      location: "Metro Candelaria",
      title: "The Beginning",
      text: "The first day has given you a glimpse of what life here might become. There are people to meet, places to discover, opportunities to pursue, and choices waiting around every corner.",
      speaker: "NARRATOR",
      dialogue: "Your story is only just beginning. The city is yours to explore.",
      choices: [
        { label: "Step into your new life →", finish: true }
      ]
    }
  ];

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function loadState() {
    try {
      const saved = localStorage.getItem(SAVE_KEY);
      if (!saved) return clone(defaultState);
      const parsed = JSON.parse(saved);
      return {
        ...clone(defaultState),
        ...parsed,
        player: { ...defaultState.player, ...(parsed.player || {}) },
        stats: { ...defaultState.stats, ...(parsed.stats || {}) },
        relationships: { ...defaultState.relationships, ...(parsed.relationships || {}) },
        flags: parsed.flags || {},
        history: parsed.history || []
      };
    } catch (error) {
      console.warn("Could not load CITY LIFE save:", error);
      return clone(defaultState);
    }
  }

  function saveState() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(state));
      const indicator = $("save-indicator");
      if (indicator) indicator.textContent = "● SAVED";
    } catch (error) {
      console.warn("Could not save CITY LIFE:", error);
      showToast("Unable to save in this browser.");
    }
  }

  function showToast(message) {
    const toast = $("toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    window.setTimeout(() => toast.classList.remove("show"), 2200);
  }

  function showScreen(screenId) {
    document.querySelectorAll(".screen").forEach((screen) => {
      screen.classList.toggle("active", screen.id === screenId);
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function readPlayerFromForm() {
    state.player = {
      name: $("player-name").value.trim(),
      age: Number($("player-age").value),
      gender: $("player-gender").value,
      background: $("player-background").value,
      customBackground: $("custom-background").value.trim(),
      skinTone: $("skin-tone").value,
      hairStyle: $("hair-style").value,
      hairColor: $("hair-color").value,
      outfit: $("outfit").value
    };
  }

  function fillFormFromState() {
    const p = state.player;
    $("player-name").value = p.name || "";
    $("player-age").value = p.age || 22;
    $("player-gender").value = p.gender || "Woman";
    $("player-background").value = p.background || "New Graduate";
    $("custom-background").value = p.customBackground || "";
    $("skin-tone").value = p.skinTone || "tone-2";
    $("hair-style").value = p.hairStyle || "short";
    $("hair-color").value = p.hairColor || "hair-dark";
    $("outfit").value = p.outfit || "outfit-blue";
    $("custom-background-wrap").classList.toggle("hidden", p.background !== "Custom");
    updateAvatarPreview();
  }

  function updateAvatarPreview() {
    const avatar = $("avatar-preview");
    if (!avatar) return;

    avatar.innerHTML = `
      <div class="avatar-hair"></div>
      <div class="avatar-face"><span class="eyes">••</span><span class="mouth"></span></div>
      <div class="avatar-neck"></div>
      <div class="avatar-body"></div>
    `;
    avatar.className = `avatar avatar-medium ${$("skin-tone").value} ${$("hair-color").value} ${$("outfit").value} ${$("hair-style").value}`;

    $("preview-name").textContent = $("player-name").value.trim() || "Your character";
    const background = $("player-background").value === "Custom"
      ? "Your own background"
      : $("player-background").selectedOptions[0].textContent;
    $("preview-meta").textContent = `${$("player-gender").value} · ${background}`;
  }

  function updateClock() {
    $("game-clock").textContent = `DAY ${state.day} · ${state.time}`;
    $("day-number").textContent = state.day;
  }

  function updateDashboard() {
    const p = state.player;
    $("greeting").textContent = `Welcome, ${p.name || "new resident"}!`;
    const background = p.background === "Custom" ? p.customBackground : p.background;
    $("player-description").textContent = `${p.age} · ${p.gender} · ${background}`;
    $("money").textContent = `₱${state.stats.money.toLocaleString("en-PH")}`;
    $("energy").textContent = state.stats.energy;
    $("health").textContent = state.stats.health;
    $("happiness").textContent = state.stats.happiness;
    $("energy-meter").style.width = `${state.stats.energy}%`;
    $("health-meter").style.width = `${state.stats.health}%`;
    $("happiness-meter").style.width = `${state.stats.happiness}%`;
    $("current-location").textContent = state.location;
    $("current-district").textContent = state.district;

    const avatar = $("dashboard-avatar");
    avatar.innerHTML = `
      <div class="avatar-hair"></div>
      <div class="avatar-face"><span class="eyes">••</span><span class="mouth"></span></div>
      <div class="avatar-neck"></div>
      <div class="avatar-body"></div>
    `;
    avatar.className = `avatar avatar-small ${p.skinTone} ${p.hairColor} ${p.outfit} ${p.hairStyle}`;

    $("chapter-title").textContent = state.storyComplete ? "Your New Life" : "Welcome to the City";
    $("chapter-summary").textContent = state.storyComplete
      ? "Your first chapter is complete. Explore the city and decide what comes next."
      : "A new address, a new beginning, and a city full of possibilities.";
    updateClock();
  }

  function clampStats() {
    Object.keys(state.stats).forEach((key) => {
      if (key !== "money") state.stats[key] = Math.max(0, Math.min(100, state.stats[key]));
    });
    state.stats.money = Math.max(0, state.stats.money);
  }

  function renderStory() {
    const content = $("section-content");
    if (state.storyComplete) {
      content.innerHTML = `
        <div class="story-shell">
          <p class="eyebrow">SEASON 1 · CHAPTER 1 COMPLETE</p>
          <h2 class="story-title">Your New Life</h2>
          <p>Your first chapter in Metro Candelaria is complete. Your choices have been saved. There is a whole city waiting outside.</p>
          <button class="primary-btn" id="story-explore-city">EXPLORE THE CITY →</button>
          <h3>YOUR CHOICES</h3>
          <ul class="log-list">${state.history.map(item => `<li>${escapeHTML(item)}</li>`).join("")}</ul>
        </div>`;
      $("story-explore-city").addEventListener("click", () => renderPage("city"));
      return;
    }

    const scene = story[Math.min(state.storyIndex, story.length - 1)];
    content.innerHTML = `
      <div class="story-shell">
        <p class="eyebrow">SEASON 1 · CHAPTER 1</p>
        <div class="story-scene">
          <div class="scene-sun"></div><div class="scene-building"></div>
          <div class="scene-copy">
            <span class="scene-location">${escapeHTML(scene.location)}</span>
            <h2>${escapeHTML(scene.title)}</h2>
            <p>${escapeHTML(scene.text)}</p>
          </div>
        </div>
        <div class="dialogue-box">
          <div class="speaker">${escapeHTML(scene.speaker)}</div>
          <div class="dialogue-text">${escapeHTML(scene.dialogue)}</div>
          <div class="choice-list">
            ${scene.choices.map((choice, index) => `<button class="choice-btn" data-choice="${index}">${escapeHTML(choice.label)}</button>`).join("")}
          </div>
        </div>
        <div class="story-controls"><span>Chapter 1 · Scene ${state.storyIndex + 1} of ${story.length}</span><button id="story-save-button">SAVE GAME</button></div>
      </div>`;

    content.querySelectorAll("[data-choice]").forEach(button => {
      button.addEventListener("click", () => chooseStory(Number(button.dataset.choice)));
    });
    $("story-save-button").addEventListener("click", () => {
      saveState();
      showToast("Your progress has been saved.");
    });
  }

  function chooseStory(choiceIndex) {
    const scene = story[state.storyIndex];
    const choice = scene.choices[choiceIndex];
    if (!choice) return;

    state.history.push(`${scene.title}: ${choice.label}`);
    Object.entries(choice.effect || {}).forEach(([key, value]) => {
      state.stats[key] += value;
    });
    if (choice.relationship) state.relationships.Mara += choice.relationship;
    if (choice.flag) state.flags[choice.flag] = true;
    clampStats();

    if (choice.finish) {
      state.storyComplete = true;
      state.location = "Studio Apartment";
      state.district = "Residential Heights, Metro Candelaria";
      showToast("Chapter 1 complete! Welcome to the city.");
    } else {
      state.storyIndex = choice.next;
    }

    saveState();
    updateDashboard();
    renderStory();
  }

  function renderPage(page) {
    document.querySelectorAll("[data-page]").forEach(button => {
      button.classList.toggle("nav-active", button.dataset.page === page);
    });
    const content = $("section-content");

    if (page === "story") {
      renderStory();
    } else if (page === "city") {
      content.innerHTML = `
        <p class="eyebrow">METRO CANDELARIA</p><h2>Explore the City</h2>
        <p>Choose a place to visit. Your city life is just getting started.</p>
        <div class="city-card"><span class="tag">GREEN SPACE</span><h3>🌳 Community Park</h3><p>A neighborhood park where residents walk, exercise, and unwind.</p><button class="primary-btn" id="visit-park">VISIT COMMUNITY PARK</button></div>
        <div class="city-card"><span class="tag">YOUR HOME</span><h3>🏠 Studio Apartment</h3><p>Return to your own place in Residential Heights.</p><button class="secondary-btn" id="visit-home">GO HOME</button></div>`;
      $("visit-park").addEventListener("click", () => visitLocation("Community Park", "Central District"));
      $("visit-home").addEventListener("click", () => visitLocation("Studio Apartment", "Residential Heights, Metro Candelaria"));
    } else if (page === "people") {
      const relation = state.relationships.Mara;
      content.innerHTML = `
        <p class="eyebrow">YOUR SOCIAL CIRCLE</p><h2>People</h2>
        <div class="people-card"><span class="tag">NEIGHBOR</span><h3>👩 Mara</h3><p>Your friendly neighbor at the apartment building. ${relation > 0 ? "You made a warm first impression." : "You have only just met."}</p><p>Relationship: ${relation >= 2 ? "Friendly" : "Acquaintance"}</p></div>`;
    } else if (page === "phone") {
      content.innerHTML = `
        <p class="eyebrow">YOUR PHONE</p><h2>Messages</h2>
        <div class="people-card"><h3>📱 Welcome to Metro Candelaria</h3><p>Your phone is ready. New messages, contacts, and opportunities will appear here as your story develops.</p></div>`;
    } else if (page === "profile") {
      const p = state.player;
      content.innerHTML = `
        <p class="eyebrow">YOUR LIFE</p><h2>${escapeHTML(p.name)}</h2>
        <div class="people-card"><p>Age: ${p.age}</p><p>Gender: ${escapeHTML(p.gender)}</p><p>Background: ${escapeHTML(p.background === "Custom" ? p.customBackground : p.background)}</p><p>Day ${state.day} · ${state.time}</p></div>
        <button class="secondary-btn" id="save-profile">SAVE GAME</button>
        <button class="secondary-btn" id="reset-game">RESET GAME</button>`;
      $("save-profile").addEventListener("click", () => { saveState(); showToast("Game saved."); });
      $("reset-game").addEventListener("click", resetGame);
    }
  }

  function visitLocation(location, district) {
    state.location = location;
    state.district = district;
    state.stats.energy = Math.max(0, state.stats.energy - 3);
    saveState();
    updateDashboard();
    showToast(`You visited ${location}.`);
    renderPage("city");
  }

  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[char]));
  }

  function startNewGame(event) {
    if (event) event.preventDefault();
    readPlayerFromForm();

    if (!state.player.name) {
      $("player-name").focus();
      showToast("Please enter your character's name.");
      return;
    }
    if (state.player.age < 18 || state.player.age > 80) {
      $("player-age").focus();
      showToast("Please choose an age between 18 and 80.");
      return;
    }
    if (state.player.background === "Custom" && !state.player.customBackground) {
      $("custom-background").focus();
      showToast("Please write your character's background.");
      return;
    }

    state.started = true;
    state.storyIndex = 0;
    state.storyComplete = false;
    state.day = 1;
    state.time = "MORNING";
    state.location = "Studio Apartment";
    state.district = "Residential Heights, Metro Candelaria";
    state.stats = clone(defaultState.stats);
    state.flags = {};
    state.relationships = { Mara: 0 };
    state.history = [];
    saveState();
    updateDashboard();
    showScreen("dashboard-screen");
    renderPage("story");
    showToast(`Welcome to Metro Candelaria, ${state.player.name}!`);
  }

  function continueGame() {
    if (!state.started) return;
    updateDashboard();
    showScreen("dashboard-screen");
    renderPage("story");
  }

  function resetGame() {
    if (!window.confirm("Start over? This will erase your saved CITY LIFE progress in this browser.")) return;
    localStorage.removeItem(SAVE_KEY);
    state = clone(defaultState);
    fillFormFromState();
    $("continue-button").classList.add("hidden");
    showScreen("welcome-screen");
    showToast("A fresh start awaits.");
  }

  function bindEvents() {
    $("start-button").addEventListener("click", () => {
      fillFormFromState();
      showScreen("creation-screen");
    });

    $("continue-button").addEventListener("click", continueGame);
    $("back-welcome").addEventListener("click", () => showScreen("welcome-screen"));
    $("character-form").addEventListener("submit", startNewGame);

    ["player-name", "player-gender", "player-background", "skin-tone", "hair-style", "hair-color", "outfit"].forEach(id => {
      $(id).addEventListener(id === "player-name" ? "input" : "change", updateAvatarPreview);
    });

    $("player-background").addEventListener("change", () => {
      $("custom-background-wrap").classList.toggle("hidden", $("player-background").value !== "Custom");
      updateAvatarPreview();
    });

    document.querySelectorAll("[data-page]").forEach(button => {
      button.addEventListener("click", () => renderPage(button.dataset.page));
    });
    document.querySelectorAll("[data-goto]").forEach(button => {
      button.addEventListener("click", () => renderPage(button.dataset.goto));
    });
    $("story-button").addEventListener("click", () => renderPage("story"));
    $("brand-home").addEventListener("click", event => {
      event.preventDefault();
      if (state.started) continueGame();
      else showScreen("welcome-screen");
    });
    $("save-indicator").addEventListener("click", () => {
      saveState();
      showToast("Your game is saved in this browser.");
    });
  }

  function init() {
    bindEvents();
    fillFormFromState();
    if (state.started) {
      $("continue-button").classList.remove("hidden");
    }
    showScreen("welcome-screen");
    updateDashboard();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

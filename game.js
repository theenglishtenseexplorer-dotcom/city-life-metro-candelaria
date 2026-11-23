
const state = {
  player: null,
  money: 35000,
  energy: 100,
  health: 100,
  happiness: 75,
  day: 1,
  period: "Morning",
  district: "Residential Heights",
  location: "Studio Apartment",
  chapter: 1,
  storyStarted: false
};

function saveGame() {
  localStorage.setItem("cityLifeSave", JSON.stringify(state));
}

function loadGame() {
  const saved = localStorage.getItem("cityLifeSave");
  if (!saved) return false;

  try {
    Object.assign(state, JSON.parse(saved));
    return !!state.player;
  } catch {
    return false;
  }
}

function showScreen(id) {
  document.querySelectorAll(".screen").forEach(screen => {
    screen.classList.remove("active");
  });
  document.getElementById(id).classList.add("active");
}

function updateDashboard() {
  document.getElementById("greeting").textContent =
    `Welcome, ${state.player.name}!`;

  document.getElementById("player-description").textContent =
    `${state.player.age} years old · ${state.player.background}`;

  document.getElementById("money").textContent =
    `₱${state.money.toLocaleString("en-PH")}`;

  document.getElementById("energy").textContent = state.energy;
  document.getElementById("health").textContent = state.health;
  document.getElementById("happiness").textContent = state.happiness;

  document.getElementById("game-clock").textContent =
    `DAY ${state.day} · ${state.period.toUpperCase()}`;
}

document.getElementById("start-button").addEventListener("click", () => {
  showScreen("creation-screen");
});

document.getElementById("character-form").addEventListener("submit", event => {
  event.preventDefault();

  state.player = {
    name: document.getElementById("player-name").value.trim(),
    age: Number(document.getElementById("player-age").value),
    background: document.getElementById("player-background").value
  };

  saveGame();
  updateDashboard();
  showScreen("dashboard-screen");
});

document.getElementById("story-button").addEventListener("click", () => {
  document.getElementById("section-content").innerHTML =
    `<p class="eyebrow">SEASON 1 · CHAPTER 1</p>
     <h3>Welcome to the City</h3>
     <p>Your journey in Metro Candelaria begins today. A new home, new faces, and endless possibilities await.</p>
     <p><em>More story scenes coming in the next development milestone.</em></p>`;
  state.storyStarted = true;
  saveGame();
});

document.querySelectorAll(".bottom-nav button").forEach(button => {
  button.addEventListener("click", () => {
    const pages = {
      story: "📖 Your story and chapter progress.",
      city: "🏙️ Explore the eight districts of Metro Candelaria.",
      people: "👥 Meet residents and build relationships.",
      phone: "📱 Your messages and contacts will appear here.",
      profile: "👤 Your character and personal statistics."
    };

    document.getElementById("section-content").textContent =
      pages[button.dataset.page];
  });
});

if (loadGame()) {
  updateDashboard();
  showScreen("dashboard-screen");
}

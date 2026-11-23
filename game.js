
(() => {
"use strict";

const $ = id => document.getElementById(id);
const KEY = "cityLifeSave";

const base = {
  version: 5,
  started: false,
  player: {
    name: "", age: 22, gender: "Woman",
    background: "New Graduate", customBackground: "",
    skinTone: "tone-2", hairStyle: "short",
    hairColor: "hair-dark", outfit: "outfit-blue"
  },
  stats: { money: 35000, energy: 100, health: 100, happiness: 75 },
  day: 1, period: 0,
  location: "Studio Apartment",
  district: "Residential Heights",
  relationships: { Mara: 0 },
  tasks: [], messages: [], eventSeen: {},
  lastEvent: "", inventory: []
};

function load() {
  try {
    const v = JSON.parse(localStorage.getItem(KEY));
    if (!v) return structuredClone(base);
    return {
      ...structuredClone(base), ...v,
      player: { ...base.player, ...v.player },
      stats: { ...base.stats, ...v.stats },
      relationships: { ...base.relationships, ...v.relationships },
      tasks: v.tasks || [],
      messages: v.messages || [],
      eventSeen: v.eventSeen || {},
      inventory: v.inventory || []
    };
  } catch {
    return structuredClone(base);
  }
}

let s = load();
let mapX = 18, mapY = 70;

const periods = ["MORNING", "AFTERNOON", "EVENING", "NIGHT"];

const places = {
  "Studio Apartment": {
    district: "Residential Heights",
    desc: "Your personal space in Metro Candelaria. Unpack, relax, cook, and prepare for another day.",
    scene: "apartment",
    actions: [
      ["Unpack your things", "unpack"],
      ["Rest for a while", "rest"],
      ["Prepare a simple meal", "cook"],
      ["Check your phone", "phone"],
      ["Go to the apartment hallway", "outside"]
    ]
  },

  "Apartment Hallway": {
    district: "Residential Heights",
    desc: "A shared hallway with apartment doors, mailboxes, an elevator, and familiar neighbors.",
    scene: "hallway",
    actions: [
      ["Knock on Mara's door", "mara"],
      ["Check the mailboxes", "mail"],
      ["Go downstairs", "street"]
    ]
  },

  "Residential Street": {
    district: "Residential Heights",
    desc: "A neighborhood street lined with homes, small shops, parked motorcycles, and local vendors.",
    scene: "street",
    actions: [
      ["Visit the sari-sari store", "sari"],
      ["Greet a neighbor", "neighbor"],
      ["Walk to the Sakayan Terminal", "terminal"]
    ]
  },

  "Sunrise Café": {
    district: "Central District",
    desc: "A cozy neighborhood café where students, workers, and friends gather.",
    scene: "cafe",
    actions: [
      ["Buy a coffee · ₱150", "coffee"],
      ["Look for a seat", "seat"],
      ["Chat with someone nearby", "cafeNpc"]
    ]
  },

  "Market Street": {
    district: "Market Quarter",
    desc: "A lively public market with vegetable, fish, meat, and household-goods stalls.",
    scene: "market",
    actions: [
      ["Browse the market", "browse"],
      ["Buy a snack · ₱80", "snack"],
      ["Talk to a vendor", "vendor"]
    ]
  },

  "Delivery Office": {
    district: "Market Quarter",
    desc: "Parcels, delivery riders, and sorting tables fill this neighborhood delivery center.",
    scene: "delivery",
    actions: [
      ["Ask about Mara's package", "package"],
      ["Check the parcel shelves", "parcels"]
    ]
  },

  "Community Park": {
    district: "Central District",
    desc: "A neighborhood park with gardens, benches, a gazebo, and an active basketball court.",
    scene: "park",
    actions: [
      ["Take a relaxing walk", "walk"],
      ["Talk to a park regular", "parkNpc"],
      ["Watch the basketball game", "basketball"]
    ]
  },

  "Sakayan Terminal": {
    district: "Residential Heights",
    desc: "A busy neighborhood transport hub. Choose an affordable shared ride or pay more for a quicker trip.",
    scene: "terminal",
    actions: [
      ["View jeepney routes", "jeepBoard"],
      ["Hire a tricycle", "trikeBoard"],
      ["Open my phone", "phone"]
    ]
  }
};

const destinations = [
  "Studio Apartment",
  "Apartment Hallway",
  "Residential Street",
  "Sunrise Café",
  "Market Street",
  "Delivery Office",
  "Community Park",
  "Sakayan Terminal"
];

const districts = [
  {
    name: "Residential Heights",
    icon: "🏘️",
    places: ["Studio Apartment", "Apartment Hallway", "Residential Street", "Sakayan Terminal"]
  },
  {
    name: "Central District",
    icon: "🌳",
    places: ["Sunrise Café", "Community Park"]
  },
  {
    name: "Market Quarter",
    icon: "🛍️",
    places: ["Market Street", "Delivery Office"]
  }
];

const sceneArt = {
  apartment: `
    <div class="scene-window">☀️<small>YOUR WINDOW</small></div>
    <div class="scene-object sofa">🛋️<small>SOFA</small></div>
    <div class="scene-object bed">🛏️<small>BED</small></div>
    <div class="scene-object kitchen">🍳<small>KITCHEN</small></div>
    <div class="scene-object desk">💻<small>YOUR DESK</small></div>
    <div class="scene-floor"></div>`,

  hallway: `
    <div class="hall-door">🚪<small>UNIT 01</small></div>
    <div class="hall-door">🚪<small>MARA</small></div>
    <div class="hall-mail">📬<small>MAILBOXES</small></div>
    <div class="hall-elevator">🛗<small>ELEVATOR</small></div>
    <div class="scene-floor"></div>`,

  street: `
    <div class="street-house">🏠</div>
    <div class="street-shop">🏪<small>SARI-SARI STORE</small></div>
    <div class="street-motor">🏍️</div>
    <div class="street-vendor">🛒</div>
    <div class="street-road">RESIDENTIAL STREET</div>`,

  cafe: `
    <div class="cafe-window">☀️</div>
    <div class="cafe-counter">☕<small>ORDER HERE</small></div>
    <div class="cafe-table">🪑</div>
    <div class="cafe-table second">🪑</div>
    <div class="cafe-plant">🪴</div>
    <div class="scene-floor"></div>`,

  market: `
    <div class="market-stall">🥬<small>VEGETABLES</small></div>
    <div class="market-stall second">🐟<small>FRESH FISH</small></div>
    <div class="market-stall third">🥩<small>MEAT</small></div>
    <div class="market-aisle">MARKET AISLE</div>`,

  delivery: `
    <div class="delivery-counter">📦<small>SERVICE COUNTER</small></div>
    <div class="delivery-shelves">📦 📦 📦<small>PARCEL SHELVES</small></div>
    <div class="delivery-desk">🖥️<small>STAFF AREA</small></div>
    <div class="scene-floor"></div>`,

  park: `
    <div class="park-tree">🌳</div>
    <div class="park-tree second">🌳</div>
    <div class="park-gazebo">🏡<small>GAZEBO</small></div>
    <div class="park-bench">🪑</div>
    <div class="park-ball">🏀</div>
    <div class="scene-floor"></div>`,

  terminal: `
    <div class="terminal-sign">🛺 SAKAYAN TERMINAL</div>
    <div class="terminal-jeep">🚐<small>CANDELARIA TRANSIT</small></div>
    <div class="terminal-trike">🛺<small>SAKAY EXPRESS</small></div>
    <div class="terminal-board">ROUTES · FARES · DESTINATIONS</div>
    <div class="scene-floor"></div>`
};

function save() {
  localStorage.setItem(KEY, JSON.stringify(s));
  $("save-indicator").textContent = "● SAVED";
}

function toast(message) {
  $("toast").textContent = message;
  $("toast").classList.add("show");
  setTimeout(() => $("toast").classList.remove("show"), 2200);
}

function screen(id) {
  document.querySelectorAll(".screen").forEach(x =>
    x.classList.toggle("active", x.id === id)
  );
}

function avatar(el, p, cls = "") {
  if (!el) return;
  el.className = `avatar ${cls} ${p.skinTone} ${p.hairColor} ${p.outfit} ${p.hairStyle}`;
  el.innerHTML = '<div class="hair"></div><div class="face"><i>••</i><em></em></div><div class="neck"></div><div class="body"></div>';
}

function preview() {
  avatar($("avatar-preview"), {
    skinTone: $("skin-tone").value,
    hairColor: $("hair-color").value,
    outfit: $("outfit").value,
    hairStyle: $("hair-style").value
  });
  $("preview-name").textContent = $("player-name").value.trim() || "Your character";
  $("preview-meta").textContent = $("player-gender").value + " · " + $("player-background").value;
}

function update() {
  const p = s.player;
  const place = places[s.location] || places["Studio Apartment"];

  $("game-clock").textContent = `DAY ${s.day} · ${periods[s.period]}`;
  $("day-label").textContent = `METRO CANDELARIA · DAY ${s.day}`;
  $("greeting").textContent = `Hello, ${p.name}!`;
  $("player-description").textContent =
    `${p.age} · ${p.gender} · ${p.background === "Custom" ? p.customBackground : p.background}`;

  $("money").textContent = "₱" + s.stats.money.toLocaleString("en-PH");

  ["energy", "health", "happiness"].forEach(k => {
    $(k).textContent = s.stats[k];
    $(`${k}-meter`).style.width = s.stats[k] + "%";
  });

  avatar($("mini-avatar"), p, "small-avatar");

  $("location-name").textContent = s.location;
  $("district-name").textContent = place.district;
  $("location-title").textContent =
    s.location === "Studio Apartment" ? "Your place in the city" : s.location;
  $("location-crumb").textContent = place.district + " · Metro Candelaria";
  $("location-description").textContent = place.desc;

  renderScene();

  let actions = [...place.actions];

  if (s.location === "Apartment Hallway" &&
      s.inventory.includes("Mara's package")) {
    actions.push(["Deliver Mara's package", "packageReturn"]);
  }

  $("location-actions").innerHTML = actions.map(([label, action]) =>
    `<button class="action-btn" data-action="${action}">${label} →</button>`
  ).join("");

  $("location-actions").querySelectorAll("[data-action]").forEach(b => {
    b.onclick = () => act(b.dataset.action);
  });

  renderTasks();
  save();
}

function renderScene() {
  const place = places[s.location];
  const world = document.querySelector(".world-scene");
  if (!world) return;

  world.className = `world-scene scene-${place.scene}`;
  world.innerHTML = `
    <div class="scene-art">${sceneArt[place.scene]}</div>
    <div class="scene-label">
      <span>${s.location}</span>
      <small>${place.district}</small>
    </div>`;
}

function task(id, title, desc, steps, reward) {
  if (s.tasks.some(t => t.id === id)) return;
  s.tasks.push({ id, title, desc, steps, progress: 0, reward, done: false });
  toast("New task: " + title);
}

function renderTasks() {
  $("task-count").textContent =
    s.tasks.filter(t => !t.done).length + " active";

  $("task-list").innerHTML = s.tasks.length
    ? s.tasks.map(t => `
      <div class="task-item">
        <b>${t.done ? "✓ " : ""}${esc(t.title)}</b>
        <p>${esc(t.desc)}</p>
        <p>${t.progress}/${t.steps} objectives</p>
      </div>`).join("")
    : '<p class="muted">No tasks right now. Explore the city and see what happens.</p>';
}

function moment(title, text, choices = []) {
  $("event-title").textContent = title;
  $("event-text").textContent = text;
  $("event-choices").innerHTML = "";

  choices.forEach(c => {
    const b = document.createElement("button");
    b.className = "choice-btn";
    b.textContent = c.label;
    b.onclick = () => {
      c.run();
      $("event-choices").innerHTML = "";
      update();
    };
    $("event-choices").append(b);
  });
}

function advance(amount = 1) {
  s.period += amount;
  while (s.period >= 4) {
    s.period -= 4;
    s.day++;
    s.stats.energy = Math.min(100, s.stats.energy + 25);
  }
}

function sameDistrict(a, b) {
  return places[a]?.district === places[b]?.district;
}

function move(place, mode = "walk") {
  if (!places[place]) return;

  const old = s.location;
  let fare = 0;
  let travel = 1;
  let description = "";

  if (mode === "walk") {
    travel = sameDistrict(old, place) ? 1 : 2;
    description = "You walk through the city streets.";
  } else {
    const info = transportInfo(mode, old, place);
    if (!info) return;
    fare = info.fare;
    travel = info.time;

    if (s.stats.money < fare) {
      toast(`You need ₱${fare} for this ride.`);
      return;
    }

    s.stats.money -= fare;
    description = info.description;
  }

  s.location = place;
  s.district = places[place].district;
  advance(travel);
  s.stats.energy = Math.max(0, s.stats.energy - (mode === "walk" ? 3 : 1));

  moment(
    mode === "walk" ? "You arrive at " + place : "Your ride has arrived",
    `${description} ${places[place].desc}`,
    []
  );

  if (fare) toast(`Fare paid: ₱${fare}`);

  checkEvents();
  showScene();
  update();
}

function transportInfo(mode, from, to) {
  const rush = s.period === 0 || s.period === 1;
  const rain = false;

  const routes = {
    jeepney: { fare: 20, time: 2, name: "Candelaria Transit" },
    jeepneyMarket: { fare: 25, time: 2, name: "Candelaria Transit" },
    tricycle: { fare: 60, time: 1, name: "Sakay Express" },
    tricycleMarket: { fare: 70, time: 1, name: "Sakay Express" },
    moto: { fare: 60, time: 1, name: "ZipMoto" },
    car: { fare: 150, time: 1, name: "LuxeRide" }
  };

  const r = routes[mode];
  if (!r) return null;

  let fare = r.fare;
  if ((mode === "moto" || mode === "car") && rush) {
    fare = Math.round(fare * 1.2);
  }
  if (rain && mode !== "jeepney" && mode !== "jeepneyMarket") {
    fare = Math.round(fare * 1.15);
  }

  return {
    fare,
    time: r.time,
    description: `You traveled with ${r.name} from ${from} to ${to}.`
  };
}

function checkEvents() {
  if (s.location === "Apartment Hallway" && !s.eventSeen.mara) {
    s.eventSeen.mara = true;

    moment(
      "A familiar face",
      "Your neighbor Mara steps out carrying a small tote bag. “Hey! You must be the new neighbor. I'm Mara. Welcome!”",
      [
        {
          label: "Introduce yourself warmly",
          run: () => {
            s.relationships.Mara += 2;
            task("mara-favor", "A Small Favor",
              "Mara asks you to collect a package before the office closes.", 2, 250);
            s.messages.unshift("Mara: Thanks for being so friendly! Could I ask a small favor?");
            moment("Mara has a favor",
              "She needs a package collected from the Delivery Office in the Market Quarter. You can do it whenever it suits you.", []);
          }
        },
        {
          label: "Say hello, but keep moving",
          run: () => {
            s.relationships.Mara++;
            s.messages.unshift("Mara: Nice meeting you! See you around.");
          }
        }
      ]
    );
  }

  if (s.location === "Sunrise Café" && !s.eventSeen.cafe) {
    s.eventSeen.cafe = true;
    moment("A message from Mara",
      "Your phone buzzes. Mara sent you a message: “No rush on that favor. The delivery office closes this evening.”",
      [
        {
          label: "Reply: I'll see what I can do",
          run: () => s.messages.unshift("You: I'll see what I can do!")
        },
        {
          label: "Leave it for later",
          run: () => toast("You can reply anytime from your phone.")
        }
      ]
    );
  }
}

function complete(id) {
  const t = s.tasks.find(x => x.id === id);
  if (!t || t.done) return;

  t.progress++;

  if (t.progress >= t.steps) {
    t.done = true;
    s.stats.money += t.reward;
    s.stats.happiness = Math.min(100, s.stats.happiness + 5);
    s.relationships.Mara += 2;
    moment("Task completed!",
      `You completed ${t.title}. You earned ₱${t.reward} and strengthened your friendship with Mara.`,
      []);
  }
}

function act(a) {
  switch (a) {
    case "outside":
      move("Apartment Hallway"); break;
    case "street":
      move("Residential Street"); break;
    case "terminal":
      move("Sakayan Terminal"); break;
    case "phone":
      tab("phone"); break;

    case "unpack":
      s.stats.energy = Math.max(0, s.stats.energy - 5);
      s.stats.happiness = Math.min(100, s.stats.happiness + 4);
      advance();
      moment("A little more at home", "You unpacked a few essentials. Your apartment already feels more like yours.", []);
      break;

    case "rest":
      s.stats.energy = Math.min(100, s.stats.energy + 25);
      advance();
      moment("A moment to rest", "You take a break and recover some energy.", []);
      break;

    case "cook":
      if (s.stats.money < 50) {
        toast("You need ₱50 for groceries.");
        break;
      }
      s.stats.money -= 50;
      s.stats.energy = Math.min(100, s.stats.energy + 15);
      advance();
      moment("A home-cooked meal", "You prepare a simple meal in your kitchenette.", []);
      break;

    case "mara":
      s.relationships.Mara++;
      moment("Mara",
        "“It's nice having a new neighbor. How are you settling in?”",
        [
          {
            label: "I'm getting settled",
            run: () => s.stats.happiness = Math.min(100, s.stats.happiness + 3)
          },
          {
            label: "Ask if she needs anything",
            run: () => task("mara-favor", "A Small Favor",
              "Collect Mara's package from the Delivery Office.", 2, 250)
          }
        ]);
      break;

    case "mail":
      moment("The mailbox", "You check your mailbox. There is a community notice about activities in the park.", []);
      break;

    case "neighbor":
      moment("A neighborly hello", "A resident waves as they pass. “Good morning! Welcome to our neighborhood!”", [
        { label: "Greet them back", run: () => s.stats.happiness = Math.min(100, s.stats.happiness + 2) }
      ]);
      break;

    case "sari":
      moment("Sari-sari store", "The store owner greets you. You can pick up snacks and everyday essentials here.", [
        {
          label: "Buy a snack · ₱80",
          run: () => {
            if (s.stats.money >= 80) {
              s.stats.money -= 80;
              s.stats.energy = Math.min(100, s.stats.energy + 8);
              toast("Snack purchased.");
            } else toast("Not enough money.");
          }
        },
        { label: "Just browse", run: () => toast("You look around the store.") }
      ]);
      break;

    case "walk":
      s.stats.happiness = Math.min(100, s.stats.happiness + 6);
      s.stats.energy = Math.max(0, s.stats.energy - 4);
      advance();
      moment("A peaceful walk", "The park is full of life. The fresh air clears your head.", []);
      break;

    case "parkNpc":
      moment("A park regular", "An older resident smiles. “New around here? This city has a way of surprising you.”", [
        { label: "Ask for recommendations", run: () => s.messages.unshift("Park regular: Try the Sunrise Café and Market Street.") },
        { label: "Enjoy the quiet", run: () => s.stats.happiness = Math.min(100, s.stats.happiness + 2) }
      ]);
      break;

    case "basketball":
      s.stats.happiness = Math.min(100, s.stats.happiness + 3);
      moment("A neighborhood game", "A group of residents are playing basketball. Someone invites you to watch.", []);
      break;

    case "coffee":
      if (s.stats.money < 150) {
        toast("Not enough money.");
        break;
      }
      s.stats.money -= 150;
      s.stats.happiness = Math.min(100, s.stats.happiness + 5);
      advance();
      moment("Coffee break", "You enjoy a cup of coffee and watch the busy café.", []);
      break;

    case "seat":
      moment("A quiet corner", "You find a seat near the window. People pass by outside.", []);
      break;

    case "cafeNpc":
      moment("Someone catches your eye", "A person at the next table asks whether the café is always this busy.", [
        { label: "Start a conversation", run: () => s.stats.happiness = Math.min(100, s.stats.happiness + 3) },
        { label: "Smile and return to your coffee", run: () => toast("Maybe another time.") }
      ]);
      break;

    case "vendor":
      moment("A friendly vendor", "The vendor recommends the freshest produce of the day.", []);
      break;

    case "browse":
      moment("Market Street", "Colorful stalls line the market. You spot snacks, clothes, and household goods.", [
        { label: "Buy a snack · ₱80", run: () => buySnack() },
        { label: "Just look around", run: () => toast("You browse the stalls.") }
      ]);
      break;

    case "snack":
      buySnack(); break;

    case "package":
      if (!s.tasks.some(t => t.id === "mara-favor" && !t.done)) {
        toast("There is no package to collect.");
        break;
      }
      if (s.inventory.includes("Mara's package")) {
        toast("You already collected the package.");
        break;
      }
      s.inventory.push("Mara's package");
      complete("mara-favor");
      moment("Package collected", "The clerk hands you a small parcel addressed to Mara. Return it to her at the apartment hallway.", []);
      break;

    case "packageReturn":
      if (!s.inventory.includes("Mara's package")) {
        toast("You do not have Mara's package.");
        break;
      }
      s.inventory = s.inventory.filter(x => x !== "Mara's package");
      complete("mara-favor");
      moment("Mara is grateful", "You deliver the package to Mara. She thanks you warmly.", []);
      break;

    case "parcels":
      moment("Parcel shelves", "You see stacks of packages waiting to be collected or sent.", []);
      break;

    case "jeepBoard":
      openTerminalBoard("jeepney");
      break;

    case "trikeBoard":
      openTerminalBoard("tricycle");
      break;
  }

  update();
}

function buySnack() {
  if (s.stats.money < 80) {
    toast("Not enough money.");
    return;
  }
  s.stats.money -= 80;
  s.stats.energy = Math.min(100, s.stats.energy + 8);
  toast("Snack purchased.");
}

function openTerminalBoard(type) {
  const options = destinations.filter(p => p !== s.location);
  const company = type === "jeepney" ? "Candelaria Transit" : "Sakay Express";

  const choices = options.map(place => ({
    label: `${place} · ${type === "jeepney" ? "₱20–₱25" : "₱60–₱70"}`,
    run: () => {
      const mode = type === "jeepney"
        ? (places[place].district === "Market Quarter" ? "jeepneyMarket" : "jeepney")
        : (places[place].district === "Market Quarter" ? "tricycleMarket" : "tricycle");
      move(place, mode);
    }
  }));

  moment(company, "Choose your destination. Fares depend on the route.", choices);
}

function bookRide(type) {
  const select = $("ride-destination");
  if (!select) return;

  const place = select.value;
  if (!places[place]) return;

  const mode = type === "moto" ? "moto" : "car";
  const info = transportInfo(mode, s.location, place);
  if (!info) return;

  if (s.stats.money < info.fare) {
    toast("You don't have enough money for this ride.");
    return;
  }

  moment(
    type === "moto" ? "ZipMoto booked!" : "LuxeRide booked!",
    `${type === "moto" ? "A motorcycle rider" : "A private car"} is on the way. Estimated fare: ₱${info.fare}.`,
    [
      {
        label: "Confirm ride",
        run: () => move(place, mode)
      },
      {
        label: "Cancel booking",
        run: () => toast("Booking cancelled.")
      }
    ]
  );
}

function renderMap() {
  const positions = {
    "Studio Apartment": [18, 70],
    "Apartment Hallway": [18, 70],
    "Residential Street": [18, 49],
    "Sunrise Café": [54, 28],
    "Market Street": [81, 69],
    "Delivery Office": [80, 37],
    "Community Park": [36, 25],
    "Sakayan Terminal": [43, 76]
  };

  const pos = positions[s.location] || [18, 70];
  mapX = pos[0];
  mapY = pos[1];
  updateMapPlayer();
  $("map-current-location").textContent = s.location;

  document.querySelectorAll(".map-building").forEach(b => {
    b.classList.toggle("current", b.dataset.place === s.location);
    b.onclick = () => {
      if (b.dataset.place === s.location) showScene();
      else move(b.dataset.place);
    };
  });
}

function updateMapPlayer() {
  const p = $("map-player");
  if (p) {
    p.style.left = mapX + "%";
    p.style.top = mapY + "%";
  }
}

function mapKey(e) {
  if ($("map-view").classList.contains("hidden")) return;

  const k = e.key.toLowerCase();
  if (!["arrowup", "arrowdown", "arrowleft", "arrowright", "w", "a", "s", "d", "e"].includes(k)) return;

  if (k.startsWith("arrow")) e.preventDefault();

  if (k === "e") {
    const spots = {
      "Studio Apartment": [18, 70],
      "Residential Street": [18, 49],
      "Sunrise Café": [54, 28],
      "Market Street": [81, 69],
      "Delivery Office": [80, 37],
      "Community Park": [36, 25],
      "Sakayan Terminal": [43, 76]
    };

    const nearest = Object.entries(spots)
      .map(([n, p]) => ({ n, d: Math.hypot(mapX - p[0], mapY - p[1]) }))
      .sort((a, b) => a.d - b.d)[0];

    if (nearest && nearest.d < 12) {
      move(nearest.n);
    } else {
      toast("Move closer to a building to enter.");
    }
    return;
  }

  const step = 2.3;
  if (k === "arrowup" || k === "w") mapY -= step;
  if (k === "arrowdown" || k === "s") mapY += step;
  if (k === "arrowleft" || k === "a") mapX -= step;
  if (k === "arrowright" || k === "d") mapX += step;

  mapX = Math.max(5, Math.min(95, mapX));
  mapY = Math.max(8, Math.min(92, mapY));
  updateMapPlayer();
}

function showMap() {
  $("scene-view").classList.add("hidden");
  $("map-view").classList.remove("hidden");
  renderMap();
  document.querySelectorAll("[data-tab]").forEach(b =>
    b.classList.toggle("active", b.dataset.tab === "city")
  );
  $("tab-content").classList.add("hidden");
}

function showScene() {
  $("map-view").classList.add("hidden");
  $("scene-view").classList.remove("hidden");
  document.querySelectorAll("[data-tab]").forEach(b =>
    b.classList.toggle("active", b.dataset.tab === "city")
  );
}

function renderPhone() {
  return `
    <p class="eyebrow">YOUR PHONE</p>
    <h2>Messages & transport</h2>
    <div class="phone-section">
      <h3>🚗 Book a ride</h3>
      <p class="muted">Book a motorcycle or private car from anywhere in Metro Candelaria.</p>
      <label for="ride-destination">Where do you want to go?</label>
      <select id="ride-destination">
        ${destinations.filter(p => p !== s.location).map(p =>
          `<option value="${p}">${p}</option>`
        ).join("")}
      </select>
      <div class="ride-options">
        <button class="action-btn" id="book-moto">
          🏍️ ZipMoto <small>Motorcycle taxi · From ₱60</small>
        </button>
        <button class="action-btn" id="book-car">
          🚘 LuxeRide <small>Private car · From ₱150</small>
        </button>
      </div>
    </div>
    <div class="phone-section">
      <h3>💬 Messages</h3>
      ${s.messages.length
        ? s.messages.map(m => `<div class="task-item">${esc(m)}</div>`).join("")
        : '<p class="muted">No new messages. People may contact you as your life unfolds.</p>'}
    </div>`;
}

function tab(name) {
  const box = $("tab-content");

  if (name === "city") {
    showScene();
    box.classList.add("hidden");
    return;
  }

  showScene();
  document.querySelectorAll("[data-tab]").forEach(b =>
    b.classList.toggle("active", b.dataset.tab === name)
  );
  box.classList.remove("hidden");

  if (name === "tasks") {
    box.innerHTML = `
      <p class="eyebrow">YOUR OBJECTIVES</p>
      <h2>Tasks & opportunities</h2>
      ${$("task-list").innerHTML}
      <p class="muted">Some tasks appear naturally as you explore and meet people.</p>`;
  }

  if (name === "people") {
    box.innerHTML = `
      <p class="eyebrow">YOUR SOCIAL CIRCLE</p>
      <h2>People</h2>
      <div class="task-item">
        <b>👩 Mara · Neighbor</b>
        <p>Relationship: ${
          s.relationships.Mara >= 4 ? "Good friends" :
          s.relationships.Mara >= 2 ? "Friendly" : "Acquaintance"
        }</p>
      </div>`;
  }

  if (name === "phone") {
    box.innerHTML = renderPhone();
    $("book-moto").onclick = () => bookRide("moto");
    $("book-car").onclick = () => bookRide("car");
  }

  if (name === "profile") {
    box.innerHTML = `
      <p class="eyebrow">YOUR LIFE</p>
      <h2>${esc(s.player.name)}</h2>
      <p>Age ${s.player.age} · ${esc(s.player.gender)} · ${esc(s.player.background)}</p>
      <p>Inventory: ${s.inventory.length ? s.inventory.map(esc).join(", ") : "Empty"}</p>
      <button class="secondary" id="reset-game">RESET GAME</button>`;
    $("reset-game").onclick = () => {
      if (confirm("Erase your saved game and start over?")) {
        localStorage.removeItem(KEY);
        location.reload();
      }
    };
  }
}

function esc(x) {
  return String(x).replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;",
    '"': "&quot;", "'": "&#39;"
  })[c]);
}

function start(e) {
  e.preventDefault();

  const p = {
    name: $("player-name").value.trim(),
    age: +$("player-age").value,
    gender: $("player-gender").value,
    background: $("player-background").value,
    customBackground: $("custom-background").value.trim(),
    skinTone: $("skin-tone").value,
    hairStyle: $("hair-style").value,
    hairColor: $("hair-color").value,
    outfit: $("outfit").value
  };

  if (!p.name || p.age < 18 || p.age > 80) {
    toast("Enter a name and an age from 18 to 80.");
    return;
  }

  if (p.background === "Custom" && !p.customBackground) {
    toast("Please write your character's background.");
    return;
  }

  s = {
    ...structuredClone(base),
    started: true,
    player: p
  };

  screen("game-screen");
  update();

  moment("A new beginning",
    "You arrive at your studio apartment in Residential Heights. The city stretches beyond your window. Unpack, rest, or step into the hallway when you're ready.",
    []);
}

function init() {
  document.addEventListener("keydown", mapKey);

  $("start-button").onclick = () => {
    screen("creation-screen");
    preview();
  };

  $("continue-button").onclick = () => {
    screen("game-screen");
    update();
    checkEvents();
  };

  $("character-form").onsubmit = start;

  ["player-name", "player-gender", "player-background",
    "skin-tone", "hair-style", "hair-color", "outfit"]
    .forEach(id => $(id).addEventListener("input", preview));

  $("player-background").onchange = () => {
    $("custom-wrap").classList.toggle(
      "hidden", $("player-background").value !== "Custom"
    );
    preview();
  };

  document.querySelectorAll("[data-tab]").forEach(b => {
    b.onclick = () => tab(b.dataset.tab);
  });

  $("open-map").onclick = showMap;
  $("close-map").onclick = showScene;

  $("brand-home").onclick = e => {
    e.preventDefault();
    if (s.started) {
      screen("game-screen");
      showScene();
      update();
    } else {
      screen("welcome-screen");
    }
  };

  if (s.started) $("continue-button").classList.remove("hidden");

  screen("welcome-screen");
}

init();
})();

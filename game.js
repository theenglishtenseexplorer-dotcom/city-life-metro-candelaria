(() => {
"use strict";
const $=id=>document.getElementById(id), KEY="cityLifeSave";
const base={version:4,started:false,player:{name:"",age:22,gender:"Woman",background:"New Graduate",customBackground:"",skinTone:"tone-2",hairStyle:"short",hairColor:"hair-dark",outfit:"outfit-blue"},stats:{money:35000,energy:100,health:100,happiness:75},day:1,period:0,location:"Studio Apartment",district:"Residential Heights",relationships:{Mara:0},tasks:[],messages:[],eventSeen:{},lastEvent:"",inventory:[]};
let s=load();
const places={
"Studio Apartment":{district:"Residential Heights",desc:"Your small apartment is a quiet base between city adventures.",actions:[["Unpack your things","unpack"],["Rest for a while","rest"],["Go to the apartment hallway","outside"]]},
"Apartment Hallway":{district:"Residential Heights",desc:"Neighbors come and go. You might run into someone familiar.",actions:[["Knock on Mara's door","mara"],["Walk to the neighborhood","street"]]},
"Community Park":{district:"Central District",desc:"A green pocket in the middle of the busy city. People exercise, relax, and meet friends.",actions:[["Take a relaxing walk","walk"],["Talk to the park regular","parkNpc"]]},
"Sunrise Café":{district:"Central District",desc:"The smell of fresh coffee drifts onto the sidewalk. Students and office workers fill the tables.",actions:[["Buy a coffee · ₱150","coffee"],["Look for a seat","seat"],["Chat with someone nearby","cafeNpc"]]},
"Delivery Office":{district:"Market Quarter",desc:"A busy neighborhood delivery counter. Parcels are stacked behind the service desk.",actions:[["Ask about Mara's package","package"]]},
"Market Street":{district:"Market Quarter",desc:"A lively strip of stalls, groceries, and small shops.",actions:[["Browse the stalls","browse"],["Buy a snack · ₱80","snack"]]},"Sakayan Terminal":{district:"Residential Heights",desc:"A neighborhood transport stop. Jeepneys connect you to busy districts, while tricycles can take you directly to nearby destinations.",actions:[["Ride jeepney to Sunrise Café · ₱20","jeepCentral"],["Ride jeepney to Market Street · ₱25","jeepMarket"],["Hire a tricycle to the café · ₱60","trikeCafe"],["Hire a tricycle to the market · ₱70","trikeMarket"]]}
};
const districts=[
{name:"Residential Heights",icon:"🏘️",desc:"Quiet streets, apartment buildings, and familiar neighbors.",places:["Studio Apartment","Apartment Hallway"]},
{name:"Central District",icon:"🌳",desc:"A lively public park and popular neighborhood café.",places:["Community Park","Sunrise Café"]},
{name:"Market Quarter",icon:"🛍️",desc:"Local shops, street stalls, and the delivery office.",places:["Market Street","Delivery Office"]}
];
function load(){try{let v=JSON.parse(localStorage.getItem(KEY));return v?{...structuredClone(base),...v,player:{...base.player,...v.player},stats:{...base.stats,...v.stats},relationships:{...base.relationships,...v.relationships},tasks:v.tasks||[],messages:v.messages||[],eventSeen:v.eventSeen||{}}:structuredClone(base)}catch{return structuredClone(base)}}
function save(){localStorage.setItem(KEY,JSON.stringify(s));$("save-indicator").textContent="● SAVED"}
function toast(t){$("toast").textContent=t;$("toast").classList.add("show");setTimeout(()=>$("toast").classList.remove("show"),2100)}
function screen(id){document.querySelectorAll(".screen").forEach(x=>x.classList.toggle("active",x.id===id))}
function avatar(el,p,cls=""){el.className=`avatar ${cls} ${p.skinTone} ${p.hairColor} ${p.outfit} ${p.hairStyle}`;el.innerHTML='<div class="hair"></div><div class="face"><i>••</i><em></em></div><div class="neck"></div><div class="body"></div>'}
function preview(){avatar($("avatar-preview"),{skinTone:$("skin-tone").value,hairColor:$("hair-color").value,outfit:$("outfit").value,hairStyle:$("hair-style").value},"");$("preview-name").textContent=$("player-name").value.trim()||"Your character";$("preview-meta").textContent=$("player-gender").value+" · "+$("player-background").value}
function update(){
let p=s.player, place=places[s.location]||places["Studio Apartment"];
$("game-clock").textContent=`DAY ${s.day} · ${["MORNING","AFTERNOON","EVENING","NIGHT"][s.period%4]}`;
$("day-label").textContent=`METRO CANDELARIA · DAY ${s.day}`;$("greeting").textContent=`Hello, ${p.name}!`;
$("player-description").textContent=`${p.age} · ${p.gender} · ${p.background==="Custom"?p.customBackground:p.background}`;
$("money").textContent="₱"+s.stats.money.toLocaleString("en-PH");
["energy","health","happiness"].forEach(k=>{$(k).textContent=s.stats[k];$(`${k}-meter`).style.width=s.stats[k]+"%"});
avatar($("mini-avatar"),p,"small-avatar");
$("location-name").textContent=s.location;$("district-name").textContent=place.district;
$("location-title").textContent=s.location==="Studio Apartment"?"Your place in the city":s.location;
$("location-crumb").textContent=place.district+" · Metro Candelaria";
$("location-description").textContent=place.desc;
let sceneActions=[...place.actions];if(s.location==="Apartment Hallway"&&s.inventory.includes("Mara's package")&&!sceneActions.some(x=>x[1]==="packageReturn"))sceneActions.push(["Deliver Mara's package","packageReturn"]);$("location-actions").innerHTML=sceneActions.map(([label,act])=>`<button class="action-btn" data-action="${act}">${label} →</button>`).join("");
$("location-actions").querySelectorAll("button").forEach(b=>b.onclick=()=>act(b.dataset.action));
renderTasks();save();
}
function task(id,title,desc,steps,reward){if(s.tasks.some(t=>t.id===id))return;s.tasks.push({id,title,desc,steps,progress:0,reward,done:false});toast("New task: "+title)}
function renderTasks(){$("task-count").textContent=s.tasks.filter(t=>!t.done).length+" active";$("task-list").innerHTML=s.tasks.length?s.tasks.map(t=>`<div class="task-item"><b>${t.done?"✓ ":""}${esc(t.title)}</b><p>${esc(t.desc)}</p><p>${t.progress}/${t.steps} objectives</p></div>`).join(""):'<p class="muted">No tasks right now. Explore the city and see what happens.</p>'}
function moment(title,text,choices){$("event-title").textContent=title;$("event-text").textContent=text;$("event-choices").innerHTML="";(choices||[]).forEach(c=>{let b=document.createElement("button");b.className="choice-btn";b.textContent=c.label;b.onclick=()=>{c.run();$("event-choices").innerHTML="";update()};$("event-choices").append(b)})}
function advance(){s.period++;if(s.period>=4){s.period=0;s.day++;s.stats.energy=Math.min(100,s.stats.energy+25)}}
function move(place,mode="walk"){if(!places[place])return;let old=places[s.location]?.district,next=places[place].district,cross=old&&old!==next;if(cross){let fare=mode==="tricycleMarket"?70:mode==="tricycle"?60:mode==="jeepMarket"?25:20;if(s.stats.money<fare){toast("You need ₱"+fare+" for the trip. Visit the sakayan or choose a nearby place.");return}s.stats.money-=fare;}s.location=place;advance();s.stats.energy=Math.max(0,s.stats.energy-(cross?1:2));moment(cross?(mode.startsWith("tricycle")?"Tricycle ride":"Jeepney ride"):"You arrive at "+place,cross?("You travel to "+next+". "+places[place].desc):places[place].desc,[]);if(cross)toast("Travel fare paid: ₱"+(mode==="tricycleMarket"?70:mode==="tricycle"?60:mode==="jeepMarket"?25:20));checkEvents();showScene();update()}
function checkEvents(){
if(s.location==="Apartment Hallway"&&!s.eventSeen.mara){s.eventSeen.mara=true;moment("A familiar face","Your neighbor Mara steps out carrying a small tote bag. “Hey! You must be the new neighbor. I'm Mara. Welcome!”",[{label:"Introduce yourself warmly",run:()=>{s.relationships.Mara+=2;task("mara-favor","A Small Favor","Mara asks you to collect a package before the office closes.",2,250);s.messages.unshift("Mara: Thanks for being so friendly! Could I ask a small favor?");moment("Mara has a favor","She needs a package collected from the Delivery Office in the Market Quarter. You can do it now or whenever it suits you.",[])}},{label:"Say hello, but keep moving",run:()=>{s.relationships.Mara++;s.messages.unshift("Mara: Nice meeting you! See you around.");moment("A quick hello","You exchange a polite greeting. Perhaps you'll talk again another day.",[])}}])}
else if(s.location==="Sunrise Café"&&!s.eventSeen.cafe){s.eventSeen.cafe=true;moment("A message from Mara","Your phone buzzes. Mara sent you a message: “No rush on that favor. The delivery office closes this evening.”",[{label:"Reply: I'll see what I can do",run:()=>{s.messages.unshift("You: I'll see what I can do!");toast("Message sent.")}},{label:"Leave it for later",run:()=>toast("You can reply anytime from your phone.")}])}
}
function complete(id){let t=s.tasks.find(x=>x.id===id);if(!t||t.done)return;t.progress++;if(t.progress>=t.steps){t.done=true;s.stats.money+=t.reward;s.stats.happiness=Math.min(100,s.stats.happiness+5);s.relationships.Mara+=2;moment("Task completed!",`You completed ${t.title}. You earned ₱${t.reward} and strengthened your friendship with Mara.`,[])}}
function act(a){switch(a){
case"outside":move("Apartment Hallway");break;case"street":move("Community Park");break;
case"mara":s.relationships.Mara++;moment("Mara","“It's nice having a new neighbor. How are you settling in?”",[{label:"I'm getting settled",run:()=>{s.stats.happiness=Math.min(100,s.stats.happiness+3);toast("Mara appreciates the chat.")}},{label:"Ask if she needs anything",run:()=>task("mara-favor","A Small Favor","Collect Mara's package from the Delivery Office.",2,250)}]);break;
case"unpack":s.stats.energy=Math.max(0,s.stats.energy-5);s.stats.happiness=Math.min(100,s.stats.happiness+4);moment("A little more at home","You unpacked a few essentials. The apartment already feels more like yours.",[]);advance();break;
case"rest":s.stats.energy=Math.min(100,s.stats.energy+25);moment("A moment to rest","You take a break and recover some energy.",[]);advance();break;
case"walk":s.stats.happiness=Math.min(100,s.stats.happiness+6);s.stats.energy=Math.max(0,s.stats.energy-4);moment("A peaceful walk","The park is full of life. The fresh air clears your head.",[]);advance();break;
case"parkNpc":moment("A park regular","An older resident smiles. “New around here? This city has a way of surprising you.”",[{label:"Ask for local recommendations",run:()=>{s.messages.unshift("Park regular: Try the Sunrise Café and Market Street.");toast("You learned about nearby places.")}},{label:"Enjoy the quiet",run:()=>s.stats.happiness=Math.min(100,s.stats.happiness+2)}]);break;
case"coffee":if(s.stats.money<150){toast("Not enough money.");break}s.stats.money-=150;s.stats.happiness=Math.min(100,s.stats.happiness+5);moment("Coffee break","You enjoy a cup of coffee and watch the busy café.",[]);advance();break;
case"seat":moment("A quiet corner","You find a seat near the window. People pass by outside.",[]);break;
case"cafeNpc":moment("Someone catches your eye","A person at the next table asks whether the café is always this busy.",[{label:"Start a conversation",run:()=>{s.stats.happiness=Math.min(100,s.stats.happiness+3);toast("You made a new acquaintance.")}},{label:"Smile and return to your coffee",run:()=>toast("Maybe another time.")}]);break;
case"packageReturn":if(!s.inventory.includes("Mara's package")){toast("You do not have Mara's package.");break}s.inventory=s.inventory.filter(x=>x!=="Mara's package");complete("mara-favor");moment("Mara is grateful","You deliver the package to Mara. She thanks you warmly.",[]);break;
case"package":if(!s.tasks.some(t=>t.id==="mara-favor"&&!t.done)){toast("There is no package to collect.");break}if(s.inventory.includes("Mara's package")){toast("You already collected the package.");break}s.inventory.push("Mara's package");complete("mara-favor");moment("Package collected","The clerk hands you a small parcel addressed to Mara. Return it to her at the apartment hallway.",[]);break;
case"browse":moment("Market Street","Colorful stalls line the street. You spot snacks, clothes, and household goods.",[{label:"Buy a snack · ₱80",run:()=>{if(s.stats.money>=80){s.stats.money-=80;s.stats.energy=Math.min(100,s.stats.energy+8);toast("Snack purchased.")}else toast("Not enough money.")}},{label:"Just look around",run:()=>toast("You browse the stalls.")}]);break;
case"snack":if(s.stats.money>=80){s.stats.money-=80;s.stats.energy=Math.min(100,s.stats.energy+8);toast("You bought a snack.")}else toast("Not enough money.");break;
case"jeepCentral":move("Sunrise Café","jeepney");break;case"jeepMarket":move("Market Street","jeepMarket");break;case"trikeCafe":move("Sunrise Café","tricycle");break;case"trikeMarket":move("Market Street","tricycleMarket");break;
case"phone":tab("phone");break;
}}
function renderMap(){
const pos={"Studio Apartment":[18,70],"Sunrise Café":[54,28],"Market Street":[81,69],"Delivery Office":[80,37],"Community Park":[36,25],"Sakayan Terminal":[43,76],"Apartment Hallway":[18,70]}[s.location]||[18,70];
mapX=pos[0];mapY=pos[1];updateMapPlayer();$("map-current-location").textContent=s.location;
document.querySelectorAll(".map-building").forEach(b=>{b.classList.toggle("current",b.dataset.place===s.location);b.onclick=()=>{if(b.dataset.place===s.location)showScene();else move(b.dataset.place)}});
$("city-map").focus({preventScroll:true});
}
let mapX=18,mapY=70;
function updateMapPlayer(){const p=$("map-player");if(p){p.style.left=mapX+"%";p.style.top=mapY+"%"}}
function mapKey(e){
if($("map-view").classList.contains("hidden"))return;
const k=e.key.toLowerCase();if(!["arrowup","arrowdown","arrowleft","arrowright","w","a","s","d","e"].includes(k))return;
if(k.startsWith("arrow"))e.preventDefault();
if(k==="e"){
const spots={"Studio Apartment":[18,70],"Sunrise Café":[54,28],"Market Street":[81,69],"Delivery Office":[80,37],"Community Park":[36,25],"Sakayan Terminal":[43,76]};
const nearest=Object.entries(spots).map(([n,p])=>({n,d:Math.hypot(mapX-p[0],mapY-p[1])})).sort((a,b)=>a.d-b.d)[0];
if(nearest&&nearest.d<12){if(nearest.n===s.location)showScene();else move(nearest.n)}else toast("Move closer to a building to enter.");return;
}
const step=2.3;if(k==="arrowup"||k==="w")mapY-=step;if(k==="arrowdown"||k==="s")mapY+=step;if(k==="arrowleft"||k==="a")mapX-=step;if(k==="arrowright"||k==="d")mapX+=step;
mapX=Math.max(5,Math.min(95,mapX));mapY=Math.max(8,Math.min(92,mapY));updateMapPlayer();
}
function showMap(){$("scene-view").classList.add("hidden");$("map-view").classList.remove("hidden");renderMap();document.querySelectorAll("[data-tab]").forEach(b=>b.classList.toggle("active",b.dataset.tab==="city"));$("tab-content").classList.add("hidden")}
function showScene(){$("map-view").classList.add("hidden");$("scene-view").classList.remove("hidden");document.querySelectorAll("[data-tab]").forEach(b=>b.classList.toggle("active",b.dataset.tab==="city"))}
function tab(name){let box=$("tab-content");if(name==="city"){showScene();box.classList.add("hidden");return}showScene();document.querySelectorAll("[data-tab]").forEach(b=>b.classList.toggle("active",b.dataset.tab===name));box.classList.remove("hidden");
if(name==="tasks")box.innerHTML="<p class='eyebrow'>YOUR OBJECTIVES</p><h2>Tasks & opportunities</h2>"+$("task-list").innerHTML+"<p class='muted'>Some tasks appear naturally as you explore, meet people, and receive messages.</p>";
if(name==="people")box.innerHTML=`<p class="eyebrow">YOUR SOCIAL CIRCLE</p><h2>People</h2><div class="task-item"><b>👩 Mara · Neighbor</b><p>Relationship: ${s.relationships.Mara>=4?"Good friends":s.relationships.Mara>=2?"Friendly":"Acquaintance"}</p><p>Meet her around Residential Heights or visit her at the apartment hallway.</p></div>`;
if(name==="phone")box.innerHTML="<p class='eyebrow'>YOUR PHONE</p><h2>Messages</h2>"+(s.messages.length?s.messages.map(m=>`<div class="task-item">${esc(m)}</div>`).join(""):"<p class='muted'>No new messages. People may contact you as your life unfolds.</p>");
if(name==="profile")box.innerHTML=`<p class="eyebrow">YOUR LIFE</p><h2>${esc(s.player.name)}</h2><p>Age ${s.player.age} · ${esc(s.player.gender)} · ${esc(s.player.background)}</p><p>Inventory: ${s.inventory.length?s.inventory.map(esc).join(", "):"Empty"}</p><button class="secondary" id="reset-game">RESET GAME</button>`;$("reset-game")?.addEventListener("click",()=>{if(confirm("Erase your saved game and start over?")){localStorage.removeItem(KEY);location.reload()}});
}
function esc(x){return String(x).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function start(e){e.preventDefault();let p={name:$("player-name").value.trim(),age:+$("player-age").value,gender:$("player-gender").value,background:$("player-background").value,customBackground:$("custom-background").value.trim(),skinTone:$("skin-tone").value,hairStyle:$("hair-style").value,hairColor:$("hair-color").value,outfit:$("outfit").value};if(!p.name||p.age<18||p.age>80){toast("Enter a name and an age from 18 to 80.");return}if(p.background==="Custom"&&!p.customBackground){toast("Please write your character's background.");return}s={...structuredClone(base),started:true,player:p};screen("game-screen");update();moment("A new beginning","You arrive at your studio apartment in Residential Heights. The city stretches beyond your window. Unpack, rest, or step into the hallway when you're ready.",[])}
function init(){
document.addEventListener("keydown",mapKey);
$("start-button").onclick=()=>{screen("creation-screen");preview()};
$("continue-button").onclick=()=>{screen("game-screen");update();checkEvents()};
$("character-form").onsubmit=start;
["player-name","player-gender","player-background","skin-tone","hair-style","hair-color","outfit"].forEach(id=>$(id).addEventListener("input",preview));
$("player-background").onchange=()=>{$("custom-wrap").classList.toggle("hidden",$("player-background").value!=="Custom");preview()};
document.querySelectorAll("[data-tab]").forEach(b=>b.onclick=()=>tab(b.dataset.tab));
$("open-map").onclick=showMap;$("close-map").onclick=showScene;
$("brand-home").onclick=e=>{e.preventDefault();if(s.started){screen("game-screen");showScene();update()}else screen("welcome-screen")};
if(s.started)$("continue-button").classList.remove("hidden");screen("welcome-screen");
}
init();
})();

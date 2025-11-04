import { reactionMessages } from "../data/messages.js";
import { DataLayer } from "./dataLayer.js";

const storage = new DataLayer();
const fmtFt = (v) => new Intl.NumberFormat("hu-HU",{style:"currency",currency:"HUF",maximumFractionDigits:0}).format(Number(v||0));

document.addEventListener("DOMContentLoaded", () => {
  const page = (window.location.pathname.split('/').pop() || "index.html").toLowerCase();
  if (page === "" || page === "index.html") initProfile();
  if (page === "calculator.html") initCalculator();
  if (page === "results.html") initResults();
});

function initProfile(){
  const name = document.querySelector("#name");
  const age = document.querySelector("#age");
  const salary = document.querySelector("#salary");
  const hours = document.querySelector("#hours");
  const saveBtn = document.querySelector("#saveProfile");
  const delBtn = document.querySelector("#deleteProfile");

  const profile = storage.get("profile");
  if (profile){
    name.value = profile.name || "";
    age.value = profile.age || "";
    salary.value = profile.salary || "";
    hours.value = profile.hours || "";
  }

  saveBtn.addEventListener("click", () => {
    const data = {
      name: name.value.trim(),
      age: Number(age.value),
      salary: Number(salary.value),
      hours: Number(hours.value),
    };
    if (!data.name || !data.age || !data.salary || !data.hours){
      alert("Töltsd ki az összes mezőt, kérlek."); return;
    }
    storage.set("profile", data);
    if(!storage.get("saved")) storage.set("saved", []);
    if(!storage.get("spent")) storage.set("spent", []);
    window.location.href = "calculator.html";
  });

  delBtn.addEventListener("click", () => {
    if(!confirm("Biztos törlöd a profilodat?")) return;
    storage.clear(); window.location.reload();
  });
}

function initCalculator(){
  const profile = storage.get("profile");
  if (!profile){ window.location.href = "index.html"; return; }
  document.querySelector("#userName").textContent = profile.name || "";

  const productName = document.querySelector("#productName");
  const productPrice = document.querySelector("#productPrice");
  const calcBtn = document.querySelector("#calculateBtn");
  const resultSection = document.querySelector("#resultSection");
  const hoursText = document.querySelector("#workHoursText");
  const saveBtn = document.querySelector("#saveBtn");
  const buyBtn = document.querySelector("#buyBtn");
  resultSection.classList.add("hidden");

  calcBtn.addEventListener("click", () => {
    const name = productName.value.trim();
    const price = Number(productPrice.value);
    if (!name || !price || price <= 0){ alert("Add meg a termék nevét és az árát!"); return; }
    const hourly = profile.salary / (profile.hours * 4);
    if (!hourly || hourly <= 0){ alert("Érvénytelen profil adatok."); return; }
    const hoursNeeded = price / hourly;
    hoursText.textContent = `Ez kb. ${hoursNeeded.toFixed(1)} munkaórádba kerülne.`;
    resultSection.dataset.name = name;
    resultSection.dataset.price = String(price);
    resultSection.dataset.hours = String(hoursNeeded);
    resultSection.classList.remove("hidden");
  });

  saveBtn.addEventListener("click", () => handleDecision("saved", resultSection));
  buyBtn.addEventListener("click", () => handleDecision("spent", resultSection));
}

function handleDecision(type, resultSection){
  const name = resultSection.dataset.name;
  const price = Number(resultSection.dataset.price);
  const hours = Number(resultSection.dataset.hours);
  if (!name || !price){ alert("Előbb számoljunk!"); return; }

  const list = storage.get(type) || [];
  list.unshift({ name, price, hours, type, at: Date.now() });
  storage.set(type, list);

  if (type === "spent" && hours > 10){
    showCoachMessage();
  } else {
    window.location.href = "results.html";
  }
}

function showCoachMessage(){
  const bubble = document.querySelector("#messageBubble");
  if (!bubble) { window.location.href = "results.html"; return; }
  const msg = reactionMessages[Math.floor(Math.random() * reactionMessages.length)];
  bubble.textContent = `Apádhelyett Anyád: ${msg}`;
  bubble.classList.remove("hidden");
  setTimeout(() => {
    bubble.classList.add("hidden");
    window.location.href = "results.html";
  }, 2500);
}

function initResults(){
  const saved = storage.get("saved") || [];
  const spent = storage.get("spent") || [];
  const savedList = document.querySelector("#savedList");
  const spentList = document.querySelector("#spentList");
  const totalSaved = document.querySelector("#totalSaved");
  const totalSpent = document.querySelector("#totalSpent");
  const net = document.querySelector("#net");
  const clearAll = document.querySelector("#clearAll");

  savedList.innerHTML = ""; spentList.innerHTML = "";
  let sumSaved = 0, sumSpent = 0;

  saved.forEach(it => {
    const li = document.createElement("li");
    li.textContent = f`${it.name} — ${fmtFt(it.price)}`
    savedList.appendChild(li);
    sumSaved += Number(it.price);
  });

  spent.forEach(it => {
    const li = document.createElement("li");
    li.textContent = f`${it.name} — ${fmtFt(it.price)}`
    spentList.appendChild(li);
    sumSpent += Number(it.price);
  });

  totalSaved.textContent = fmtFt(sumSaved);
  totalSpent.textContent = fmtFt(sumSpent);
  net.textContent = fmtFt(sumSaved - sumSpent);

  clearAll?.addEventListener("click", () => {
    if(!confirm("Biztos üríted a listát?")) return;
    storage.set("saved", []);
    storage.set("spent", []);
    initResults();
  });
}

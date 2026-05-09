const API_URL = "https://devprep-backend-jze5.onrender.com/api";
let selectedConfidence = null;

const show = (id) => document.getElementById(id).style.display = "block";
const hide = (id) => document.getElementById(id).style.display = "none";

const init = async () => {
  const { token } = await chrome.storage.local.get("token");
  if (!token) {
    show("login-view");
    return;
  }
  show("main-view");
  loadProblem();
};

const updateUI = (details) => {
  document.getElementById("problem-title").innerText = details.title;
  document.getElementById("problem-topic").innerText = details.topic;
  const diffEl = document.getElementById("problem-difficulty");
  diffEl.innerText = details.difficulty;
  diffEl.className = `badge badge-${details.difficulty.toLowerCase()}`;
  document.getElementById("save-btn").dataset.problem = JSON.stringify(details);
};

const loadProblem = async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!tab.url || !tab.url.includes("leetcode.com/problems")) {
    hide("problem-section");
    show("not-leetcode");
    return;
  }

  show("problem-section");
  document.getElementById("problem-title").innerText = "Loading...";

  chrome.tabs.sendMessage(tab.id, { action: "getProblemDetails" }, (details) => {
    if (chrome.runtime.lastError || !details) {
      chrome.scripting.executeScript(
        { target: { tabId: tab.id }, files: ["content.js"] },
        () => {
          setTimeout(() => {
            chrome.tabs.sendMessage(tab.id, { action: "getProblemDetails" }, (details) => {
              if (details) updateUI(details);
              else document.getElementById("problem-title").innerText = "Could not load problem";
            });
          }, 600);
        }
      );
      return;
    }
    updateUI(details);
  });
};

document.querySelectorAll(".star").forEach(star => {
  star.addEventListener("click", () => {
    selectedConfidence = parseInt(star.dataset.value);
    document.querySelectorAll(".star").forEach(s => s.classList.remove("active"));
    document.querySelectorAll(".star").forEach(s => {
      if (parseInt(s.dataset.value) <= selectedConfidence) s.classList.add("active");
    });
    document.getElementById("save-btn").disabled = false;
  });
});

document.getElementById("save-btn").addEventListener("click", async () => {
  const btn = document.getElementById("save-btn");
  const statusEl = document.getElementById("save-status");
  const problem = JSON.parse(btn.dataset.problem);
  const { token } = await chrome.storage.local.get("token");

  btn.disabled = true;
  btn.innerText = "Saving...";

  try {
    const res = await fetch(`${API_URL}/problems`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ ...problem, confidence: selectedConfidence })
    });

    if (res.ok) {
      statusEl.className = "status success";
      statusEl.innerText = "✓ Problem saved!";
      btn.innerText = "Saved!";
    } else {
      throw new Error("Failed");
    }
  } catch {
    statusEl.className = "status error";
    statusEl.innerText = "✗ Failed to save. Try again.";
    btn.disabled = false;
    btn.innerText = "Save Problem";
  }
});

document.getElementById("login-btn")?.addEventListener("click", async () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const statusEl = document.getElementById("login-status");

  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (data.token) {
      await chrome.storage.local.set({ token: data.token });
      hide("login-view");
      show("main-view");
      loadProblem();
    } else {
      statusEl.className = "status error";
      statusEl.innerText = data.message || "Login failed";
    }
  } catch {
    statusEl.className = "status error";
    statusEl.innerText = "Connection failed";
  }
});

document.getElementById("logout-btn")?.addEventListener("click", async () => {
  await chrome.storage.local.remove("token");
  selectedConfidence = null;
  document.querySelectorAll(".star").forEach(s => s.classList.remove("active"));
  hide("main-view");
  show("login-view");
  const statusEl = document.getElementById("login-status");
  if (statusEl) statusEl.innerText = "";
});

document.getElementById("token-btn")?.addEventListener("click", async () => {
  const token = document.getElementById("token-input").value.trim();
  const statusEl = document.getElementById("login-status");
  if (!token) {
    statusEl.className = "status error";
    statusEl.innerText = "Please paste a token";
    return;
  }
  await chrome.storage.local.set({ token });
  hide("login-view");
  show("main-view");
  loadProblem();
});

init();
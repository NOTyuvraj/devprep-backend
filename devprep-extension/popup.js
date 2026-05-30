const API_URL = "https://devprep-backend-jze5.onrender.com/api";
const SITE_URL = "https://dev-prep-black.vercel.app"; // TODO: replace with your actual Vercel URL
let selectedConfidence = null;

const show = (id) => document.getElementById(id).style.display = "block";
const hide = (id) => document.getElementById(id).style.display = "none";

// Try to grab token directly from the DevPrep site's localStorage
const grabTokenFromSite = async () => {
  const statusEl = document.getElementById("login-status");

  // Check if user already has a DevPrep tab open
  const tabs = await chrome.tabs.query({ url: `${SITE_URL}/*` });

  if (tabs.length > 0) {
    // Site is already open — silently read token from it
    try {
      const [{ result }] = await chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: () => localStorage.getItem("token"),
      });

      if (result) {
        await chrome.storage.local.set({ token: result });
        hide("login-view");
        show("main-view");
        loadProblem();
        return;
      }
    } catch (e) {
      // scripting failed — fall through to open site
    }
  }

  // Site not open or not logged in — open it for them
  chrome.tabs.create({ url: `${SITE_URL}/login` });
  if (statusEl) {
    statusEl.className = "status info";
    statusEl.innerText = "Log in to DevPrep, then click the extension again.";
  }
};

const init = async () => {
  const { token } = await chrome.storage.local.get("token");

  if (!token) {
    // No token stored — try to auto-grab from site first
    await grabTokenFromSite();
    return;
  }

  // Token exists but might be stale — try to refresh it from site silently
  const tabs = await chrome.tabs.query({ url: `${SITE_URL}/*` });
  if (tabs.length > 0) {
    try {
      const [{ result }] = await chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: () => localStorage.getItem("token"),
      });
      if (result && result !== token) {
        await chrome.storage.local.set({ token: result });
      }
    } catch (e) {
      // silently ignore — use existing stored token
    }
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

document.querySelectorAll(".star").forEach((star) => {
  star.addEventListener("click", () => {
    selectedConfidence = parseInt(star.dataset.value);
    document.querySelectorAll(".star").forEach((s) => s.classList.remove("active"));
    document.querySelectorAll(".star").forEach((s) => {
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
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ ...problem, confidence: selectedConfidence }),
    });

    if (res.ok) {
      statusEl.className = "status success";
      statusEl.innerText = "Problem saved!";
      btn.innerText = "Saved!";
    } else if (res.status === 401) {
      // Token expired — clear it and re-auth
      await chrome.storage.local.remove("token");
      statusEl.className = "status error";
      statusEl.innerText = "Session expired. Click the extension again.";
      setTimeout(() => {
        hide("main-view");
        show("login-view");
      }, 1500);
    } else {
      throw new Error("Failed");
    }
  } catch {
    statusEl.className = "status error";
    statusEl.innerText = "Failed to save. Try again.";
    btn.disabled = false;
    btn.innerText = "Save Problem";
  }
});

// Logout — clear token and try to grab fresh one next time
document.getElementById("logout-btn")?.addEventListener("click", async () => {
  await chrome.storage.local.remove("token");
  selectedConfidence = null;
  document.querySelectorAll(".star").forEach((s) => s.classList.remove("active"));
  hide("main-view");
  show("login-view");
  const statusEl = document.getElementById("login-status");
  if (statusEl) statusEl.innerText = "";
});

// "Connect to DevPrep" button in login-view — manual fallback trigger
document.getElementById("connect-btn")?.addEventListener("click", async () => {
  await grabTokenFromSite();
});

init();
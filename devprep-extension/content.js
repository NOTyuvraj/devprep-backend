const extractProblemDetails = () => {
  const title =
    document.querySelector("[data-cy='question-title']")?.innerText ||
    document.querySelector("div.text-title-large a")?.innerText ||
    document.querySelector("div[class*='text-title-large']")?.innerText ||
    document.title.replace("- LeetCode", "").trim();

  const difficultyEl =
    document.querySelector("div.text-difficulty-easy") ||
    document.querySelector("div.text-difficulty-medium") ||
    document.querySelector("div.text-difficulty-hard") ||
    document.querySelector("[class*='text-difficulty']");

  const difficulty = difficultyEl?.innerText?.trim() || "Medium";

  const topicEls = document.querySelectorAll("a[href*='/tag/']");
  const topic = topicEls.length > 0
    ? topicEls[0].innerText.trim()
    : "General";

  const url = window.location.href.split("?")[0];

  return { title, difficulty, topic, url };
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getProblemDetails") {
    setTimeout(() => {
      sendResponse(extractProblemDetails());
    }, 500);
    return true;
  }
});
let blockedSites = ['example.com', 'inappropriate.com'];
let filterEnabled = true;
let inappropriateKeywords = ['inappropriate', 'nsfw', 'adult'];

// Load settings
function loadSettings() {
  chrome.storage.sync.get(['filterEnabled', 'blockedSites', 'inappropriateKeywords'], function(data) {
    filterEnabled = data.filterEnabled !== undefined ? data.filterEnabled : true;
    blockedSites = data.blockedSites || blockedSites;
    inappropriateKeywords = data.inappropriateKeywords || inappropriateKeywords;
    console.log('Settings loaded:', {filterEnabled, blockedSites, inappropriateKeywords});
  });
}

loadSettings();

// Listen for changes to filter status
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "toggleFilter") {
    filterEnabled = request.enabled;
    chrome.storage.sync.set({filterEnabled: filterEnabled});
    console.log('Filter toggled:', filterEnabled);
  } else if (request.action === "getFilterStatus") {
    sendResponse({filterEnabled: filterEnabled});
  } else if (request.action === "settingsUpdated") {
    loadSettings();
  }
});

// Web request listener
chrome.webRequest.onBeforeRequest.addListener(
  function(details) {
    if (!filterEnabled) return;

    const url = new URL(details.url);
    if (blockedSites.some(site => url.hostname.includes(site))) {
      console.log('Site blocked:', url.hostname);
      incrementBlockCount();
      return {redirectUrl: chrome.runtime.getURL("blocked.html")};
    }
  },
  {urls: ["<all_urls>"]},
  ["blocking"]
);

// Listen for content script messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "analyzeContent") {
    if (filterEnabled && shouldBlockContent(request.content)) {
      console.log('Content blocked on:', sender.tab.url);
      incrementBlockCount();
      chrome.tabs.update(sender.tab.id, {url: chrome.runtime.getURL("blocked.html")});
    }
  }
});

function shouldBlockContent(content) {
  return inappropriateKeywords.some(keyword => content.toLowerCase().includes(keyword));
}

// Increment block count
function incrementBlockCount() {
  chrome.storage.sync.get(['blockedToday', 'totalBlocked'], function(data) {
    let blockedToday = data.blockedToday || 0;
    let totalBlocked = data.totalBlocked || 0;

    blockedToday++;
    totalBlocked++;

    chrome.storage.sync.set({blockedToday: blockedToday, totalBlocked: totalBlocked});
    console.log('Block count incremented:', {blockedToday, totalBlocked});
  });
}

// Reset daily count at midnight
function resetDailyCount() {
  const now = new Date();
  if (now.getHours() === 0 && now.getMinutes() === 0) {
    chrome.storage.sync.set({blockedToday: 0});
    console.log('Daily count reset');
  }
}

// Check to reset count every hour
setInterval(resetDailyCount, 3600000);
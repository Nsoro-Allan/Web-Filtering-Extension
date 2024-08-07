function analyzePageContent() {
  const bodyText = document.body.innerText;
  console.log('Analyzing content on:', window.location.href);
  chrome.runtime.sendMessage({action: "analyzeContent", content: bodyText});
}

analyzePageContent();
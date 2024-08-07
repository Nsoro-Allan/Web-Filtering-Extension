document.addEventListener('DOMContentLoaded', function() {
    const blockedSitesTextarea = document.getElementById('blockedSites');
    const inappropriateKeywordsTextarea = document.getElementById('inappropriateKeywords');
    const saveBtn = document.getElementById('saveBtn');
    const status = document.getElementById('status');

    // Load saved settings
    chrome.storage.sync.get(['blockedSites', 'inappropriateKeywords'], function(data) {
        blockedSitesTextarea.value = data.blockedSites ? data.blockedSites.join('\n') : '';
        inappropriateKeywordsTextarea.value = data.inappropriateKeywords ? data.inappropriateKeywords.join('\n') : '';
    });

    // Save settings
    saveBtn.addEventListener('click', function() {
        const blockedSites = blockedSitesTextarea.value.split('\n').filter(site => site.trim() !== '');
        const inappropriateKeywords = inappropriateKeywordsTextarea.value.split('\n').filter(keyword => keyword.trim() !== '');

        chrome.storage.sync.set({
            blockedSites: blockedSites,
            inappropriateKeywords: inappropriateKeywords
        }, function() {
            status.textContent = 'Settings saved.';
            setTimeout(() => {
                status.textContent = '';
            }, 2000);
            
            // Notify background script that settings were updated
            chrome.runtime.sendMessage({action: "settingsUpdated"});
        });
    });
});
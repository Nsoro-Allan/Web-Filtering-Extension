document.addEventListener('DOMContentLoaded', function() {
    const filterToggle = document.getElementById('filterToggle');
    const statusText = document.getElementById('statusText');
    const blockedCount = document.getElementById('blockedCount');
    const totalBlocked = document.getElementById('totalBlocked');
    const settingsBtn = document.getElementById('settingsBtn');

    // Load saved state
    function loadState() {
        chrome.storage.sync.get(['filterEnabled', 'blockedToday', 'totalBlocked'], function(data) {
            filterToggle.checked = data.filterEnabled !== undefined ? data.filterEnabled : true;
            statusText.textContent = filterToggle.checked ? 'Filter is ON' : 'Filter is OFF';
            blockedCount.textContent = data.blockedToday || 0;
            totalBlocked.textContent = data.totalBlocked || 0;
            console.log('Popup state loaded:', data);
        });
    }

    loadState();

    // Toggle filter
    filterToggle.addEventListener('change', function() {
        const isEnabled = filterToggle.checked;
        statusText.textContent = isEnabled ? 'Filter is ON' : 'Filter is OFF';
        chrome.storage.sync.set({filterEnabled: isEnabled});
        
        // Notify background script
        chrome.runtime.sendMessage({action: "toggleFilter", enabled: isEnabled});
        console.log('Filter toggled:', isEnabled);
    });

    // Open settings page
    settingsBtn.addEventListener('click', function() {
        chrome.runtime.openOptionsPage();
    });

    // Update stats
    function updateStats() {
        loadState();
    }

    // Update stats every 5 seconds
    setInterval(updateStats, 5000);
});
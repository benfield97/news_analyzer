chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.url) {
        // The tab's URL has changed, clear the data for this tab
        chrome.storage.local.remove(tabId.toString(), () => {
            if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError);
            } else {
                console.log('Data cleared for tab', tabId);
            }
        });
    }
});




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


chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: 'analyzeText',
        title: 'Analyze Sentiment',
        contexts: ['selection']
    });
});

chrome.contextMenus.onClicked.addListener(function(info, tab) {
    if (info.menuItemId == 'analyzeText') {
        chrome.tabs.sendMessage(tab.id, {action: 'getSelectedText'}, function(response) {
            let data = {text: response.selectedText};
            fetch(ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            })
            .then(response => response.json())
            .then(data => {
                chrome.storage.local.set({[tab.id.toString()]: data}, () => {
                    chrome.tabs.sendMessage(tab.id, {action: 'updateUI', data: data});
                });
            })
            .catch((error) => {
                console.log('Error:', error);
            });
        });
    }
});
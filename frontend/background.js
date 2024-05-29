const ENDPOINT = 'http://127.0.0.1:5000/analyze'; // Add this line to define the ENDPOINT constant

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.url) {
        // The tab's URL has changed, clear the data for this tab
        chrome.storage.local.remove(tabId.toString(), () => {
            if (chrome.runtime.lastError) {
                console.error('Error clearing data:', chrome.runtime.lastError);
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
    console.log('Context menu created'); // Add this line
});

chrome.contextMenus.onClicked.addListener(function(info, tab) {
    if (info.menuItemId == 'analyzeText') {
        console.log('Context menu clicked');
        chrome.tabs.sendMessage(tab.id, {action: 'getSelectedText'}, function(response) {
            if (response && response.selectedText) {
                console.log('Selected text:', response.selectedText);
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
                    console.log('Sentiment analysis results:', data);
                    chrome.storage.local.set({[tab.id.toString()]: data}, () => {
                        console.log('Data stored for tab', tab.id);
                        chrome.tabs.sendMessage(tab.id, {action: 'updateUI', data: data}, function(response) {
                            if (chrome.runtime.lastError) {
                                console.error('Error sending message:', chrome.runtime.lastError);
                            } else {
                                console.log('UI update message sent');
                            }
                        });
                    });
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
            } else {
                console.error('No selected text received from content script');
            }
        });
    }
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action == 'updateBadge') {
        console.log('Updating badge for tab', sender.tab.id); // Add this line
        chrome.browserAction.setBadgeText({text: request.data.political_rating.toString(), tabId: sender.tab.id});
        chrome.browserAction.setBadgeBackgroundColor({color: [0, 255, 0, 255], tabId: sender.tab.id});
    }
});
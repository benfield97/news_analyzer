
document.addEventListener('DOMContentLoaded', async (event) => {
    console.log("Script loaded");

    // DOM elements
    const cards = document.getElementById('cards');
    const loading = document.getElementById('loading');
    const message = document.getElementById('invalid');

    // Global data
    let globalData = null;

    const updateUI = (data) => {
        loading.style.display = 'none'; // Hide loading icon
    
        if (data.is_article) {
            cards.style.display = 'block'; // Show cards
    
            // Update odometer values
            document.getElementById('political_lean').innerText = data.political_rating;
            document.getElementById('establishment_score').innerText = data.establishment_bias_rating;
            document.getElementById('emotiveness').innerText = data.emotive_rating;
        } else {
            cards.style.display = 'none'; // Hide card
            message.style.display = 'inline-block'; // Show the message
        }
    };

    // Add event listeners to the card elements
    const addCardEventListeners = () => {
        const politicalLeanCard = document.getElementById('1');
        const establishmentScoreCard = document.getElementById('2');
        const emotivenessCard = document.getElementById('3');
    
        politicalLeanCard.addEventListener('click', () => {
            toggleHighlight(globalData.political_list, 'political', '#99FF99');
            politicalLeanCard.classList.toggle('clicked');
        });

        emotivenessCard.addEventListener('click', () => {
            toggleHighlight(globalData.emotive_list, 'emotive', '#FFFF00)');
            emotivenessCard.classList.toggle('clicked');
        });

        establishmentScoreCard.addEventListener('click', () => {
            toggleHighlight(globalData.establishment_list, 'establishment','#00FFFF');
            establishmentScoreCard.classList.toggle('clicked');
        });
    };

    function toggleHighlight(list, type, color) {
        if (globalData && list) {
            console.log('Sending message:', list);
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                chrome.tabs.sendMessage(tabs[0].id, {texts: list, type: type, color: color}, function(response) {
                    if (chrome.runtime.lastError) {
                        console.error(chrome.runtime.lastError.message);
                    } else {
                        console.log('Message sent, response:', response);
                    }
                });
            });
        }
    }

    // Listen for messages from the background script
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        if (request.action == 'updateUI') {
            globalData = request.data;
            updateUI(request.data);
            addCardEventListeners();
        }
    });

    // Get the current tab ID
    const tabs = await chrome.tabs.query({active: true, currentWindow: true});
    const tabId = tabs[0].id;

    // Check if data for this tab already exists in storage
    chrome.storage.local.get([tabId.toString()], (result) => {
        if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError);
        } else if (result[tabId]) {
            // Data for this tab already exists, use it instead of fetching
            console.log('Data from storage:', result[tabId]);
            globalData = result[tabId]; // Retrieve the data from storage
            updateUI(result[tabId]);
            addCardEventListeners();
        }
    });

    document.getElementById('company-link').addEventListener('click', function(event) {
        event.preventDefault();
        chrome.tabs.create({url: event.target.href});
    });
    
});
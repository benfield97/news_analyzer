import { getActiveTabURL } from './utils.js';

document.addEventListener('DOMContentLoaded', async (event) => {
    console.log("Script loaded");
    let areEventListenersAdded = false;

    // DOM elements
    const analyze_btn = document.getElementById('analyzeButton');
    const cards = document.getElementById('cards');
    const loading = document.getElementById('loading');

    // API endpoint
    const ENDPOINT = 'http://127.0.0.1:5000/analyze';

    // Global data
    let globalData = null;

    // Update UI function
    const updateUI = (data) => {
        loading.style.display = 'none'; // Hide loading icon
        cards.style.display = 'block'; // Show cards

        // Update odometer values
        document.getElementById('political_lean').innerText = data.political_rating;
        document.getElementById('establishment_score').innerText = data.establishment_bias_rating;
        document.getElementById('emotiveness').innerText = data.emotive_rating;
    };

    // Fetch data function
    const fetchData = async () => {
        analyze_btn.style.display = 'none';
        loading.style.display = 'inline-block';
        let url = await getActiveTabURL();
        console.log("Current tab URL: ", url); // This will log the current tab URL
        let data = {url: url};

        // Fetch the data
        fetch(ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            globalData = data;
            // Store the data in chrome.storage.local
            chrome.storage.local.set({[tabId.toString()]: data}, () => {
                if (chrome.runtime.lastError) {
                    console.error(chrome.runtime.lastError);
                } else {
                    console.log('Data saved');
                }
            });
            updateUI(data);
            // Add event listeners to the card elements
            //addCardEventListeners();
        })
        .catch((error) => {
            console.log('Error:', error);
            loading.style.display = 'none';
        });
    };

    // Add event listeners to the card elements
    const addCardEventListeners = () => {
        const politicalLeanCard = document.getElementById('1');
        const establishmentScoreCard = document.getElementById('2');
        const emotivenessCard = document.getElementById('3');
    
        politicalLeanCard.addEventListener('click', () => {
            toggleHighlight(globalData.political_list, 'political', 'red');
            politicalLeanCard.classList.toggle('clicked');
        });

        emotivenessCard.addEventListener('click', () => {
            toggleHighlight(globalData.emotive_list, 'emotive', 'blue');
            emotivenessCard.classList.toggle('clicked');
        });

        establishmentScoreCard.addEventListener('click', () => {
            toggleHighlight(globalData.establishment_list, 'establishment','green');
            establishmentScoreCard.classList.toggle('clicked');
        });

        areEventListenersAdded = true;
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

    // Check if cards are present and add event listeners
    const politicalLeanCard = document.getElementById('1');
    const establishmentScoreCard = document.getElementById('2');
    const emotivenessCard = document.getElementById('3');

    if (!areEventListenersAdded && politicalLeanCard && establishmentScoreCard && emotivenessCard) {
        addCardEventListeners();
    }

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
            analyze_btn.style.display = 'none'; // Hide the "Analyze Sentiment" button
        } else {
            analyze_btn.style.display = 'block'; // Show the "Analyze Sentiment" button
        }
    });

    analyze_btn.addEventListener('click', fetchData);

    // Listen for URL changes
    chrome.tabs.onUpdated.addListener((updatedTabId, changeInfo, tab) => {
        if (updatedTabId === tabId && changeInfo.url) {
            // The URL of the current tab has changed, show the "Analyze Sentiment" button and hide the cards
            analyze_btn.style.display = 'block';
            cards.style.display = 'none';
        }
    });
});
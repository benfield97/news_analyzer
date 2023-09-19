console.log('contentScript.js loaded');

let currentHighlights = {};

function highlightTexts(texts, type, color) {
    if (currentHighlights[type]) {
        clearHighlights(type); // Clear existing highlights before setting new ones
        currentHighlights[type] = false;
    } else {
        const instance = new Mark(document.body);
        texts.forEach(text => { // Iterate over each text in the array
            instance.mark(text, {
                separateWordSearch: false, // This option ensures the entire phrase is searched
                accuracy: "exactly", // This option ensures only exact matches are highlighted
                className: type // This option sets the color of the highlight
            });
        });
        currentHighlights[type] = true;
    }
}

function clearHighlights(type) {
    const instance = new Mark(document.body);
    instance.unmark({
        className: type
    }); // Use the unmark() method from mark.js to remove highlights of a specific type
    currentHighlights[type] = false; // Update the currentHighlights// Use the unmark() method from mark.js to remove highlights
}

function addMessageListener() {
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        if (request.texts) {
            console.log('Received message:', request.texts);
            highlightTexts(request.texts, request.type, request.color); // Highlight new texts
            sendResponse({status: "success"}); 
        }
        return true; 
    });
}

// Add the message listener when the script loads
addMessageListener();

// Re-add the message listener when the tab becomes visible
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        addMessageListener();
    }
});
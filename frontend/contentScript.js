console.log('contentScript.js loaded');

let currentHighlights = {};

function highlightTexts(texts, type, color) {
    console.log(type)
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

        // Inject a style element to change the background color of the marks
        const styleElement = document.createElement('style');
        styleElement.textContent = `mark.${type} { background-color: ${color}; }`;
        document.head.append(styleElement);
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
            console.log('Received type:', request.type);
            highlightTexts(request.texts, request.type, request.color); // Highlight new texts
            sendResponse({status: "success"}); 
        }
        return true; 
    });
}

// Add the message listener when the script loads
addMessageListener();
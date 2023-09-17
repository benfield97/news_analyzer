console.log('contentScript.js loaded');

let currentHighlights = null;

function highlightTexts(texts, type) {
    clearHighlights(); // Clear existing highlights before setting new ones
    if (currentHighlights !== type) {
        const wordsToHighlight = texts[0]; // Use the array of texts received from the listener
        const instance = new Mark(document.body);
        instance.mark(wordsToHighlight);
        currentHighlights = type;
    } else {
        currentHighlights = null;
    }
}

function clearHighlights() {
    const instance = new Mark(document.body);
    instance.unmark(); // Use the unmark() method from mark.js to remove highlights
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.texts) {
    console.log('Received message:', request.texts);
    highlightTexts(request.texts, request.type); // Highlight new texts
    sendResponse({status: "success"}); 
  }
  return true; 
});
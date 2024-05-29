console.log('contentScript.js loaded');

let currentHighlights = {};

function highlightTexts(texts, type, color) {
  console.log(type);
  if (currentHighlights[type]) {
    clearHighlights(type); // Clear existing highlights before setting new ones
    currentHighlights[type] = false;
  } else {
    const instance = new Mark(document.body);
    texts.forEach(text => {
      // Iterate over each text in the array
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
  instance.unmark({ className: type });
  currentHighlights[type] = false;
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action == 'getSelectedText') {
        const selectedText = window.getSelection().toString();
        console.log('Sending selected text:', selectedText); // Add this line
        sendResponse({selectedText: selectedText});
    } else if (request.action == 'updateUI') {
        console.log('Received UI update message:', request.data); // Add this line
        highlightTexts(request.data.political_list, 'political', '#99FF99');
        highlightTexts(request.data.emotive_list, 'emotive', '#FFFF00');
        highlightTexts(request.data.establishment_list, 'establishment', '#00FFFF');

        chrome.runtime.sendMessage({action: 'updateBadge', data: request.data});
    }
});
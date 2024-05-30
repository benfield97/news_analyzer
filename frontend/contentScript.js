console.log('contentScript.js loaded');
console.log('mark.min.js loaded');

let currentHighlights = {};

function highlightTexts(texts, type, color) {
    console.log(type);
    if (currentHighlights[type]) {
        clearHighlights(type);
        currentHighlights[type] = false;
    } else {
        const instance = new Mark(document.body);
        texts.forEach(text => {
            instance.mark(text, {
                separateWordSearch: false,
                accuracy: "exactly",
                className: type
            });
        });
        currentHighlights[type] = true;
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
        console.log('Sending selected text:', selectedText);
        sendResponse({selectedText: selectedText});
    } else if (request.action == 'updateUI') {
        console.log('Received message:', request.data);
        highlightTexts(request.data.political_list, 'political', '#99FF99');
        highlightTexts(request.data.emotive_list, 'emotive', '#FFFF00');
        highlightTexts(request.data.establishment_list, 'establishment', '#00FFFF');
    }
    return true; // Add this line to keep the message channel open
});
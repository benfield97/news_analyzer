let highlightedTexts = [];
console.log('contentScript.js loaded')

function highlightTexts(texts) {
    let bodyText = document.body.innerHTML;
    for (let text of texts) {
        const highlightedText = `<mark>${text}</mark>`;
        const newBodyText = bodyText.includes(highlightedText) ? 
            bodyText.replace(new RegExp(highlightedText, 'g'), text) : 
            bodyText.replace(new RegExp(text, 'g'), highlightedText);
        bodyText = newBodyText;
    }
    document.body.innerHTML = bodyText;
}

function toggleHighlightTexts(texts) {
    if (highlightedTexts.toString() === texts.toString()) {
        // If the texts are already highlighted, remove the highlights
        highlightTexts(highlightedTexts);
        highlightedTexts = [];
    } else {
        // If the texts are not highlighted, highlight them
        if (highlightedTexts.length > 0) {
            // If there are other texts highlighted, remove their highlights
            highlightTexts(highlightedTexts);
        }
        highlightTexts(texts);
        highlightedTexts = texts;
    }
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.texts) {
        console.log('Received message:', request.texts);
        //toggleHighlightTexts(request.texts);
        sendResponse({status: "success"}); // Send a response back to the sender
    }
    return true; // Keeps the message channel open until sendResponse is called
});
chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.get("geminiApiKey", (data) => {
        if (!data.geminiApiKey) {
            chrome.runtime.openOptionsPage();
        }
    });
});
document.addEventListener("DOMContentLoaded", () => {
    chrome.storage.sync.get(["geminiApiKey"], ({geminiApiKey}) => {
        if (geminiApiKey) {
            document.getElementById("gemini-api-key-input").value = geminiApiKey;
        }
    });
    document.getElementById("save-api-key").addEventListener("click", () => {
        const geminiApiKey = document.getElementById("gemini-api-key-input").value;
        if(!geminiApiKey) {
            document.getElementById("status-message").textContent = "Please enter an API key";
            return;
        }
        chrome.storage.sync.set({geminiApiKey}, () => {
            document.getElementById("status-message").textContent = "API key saved successfully";
        })
    })
})
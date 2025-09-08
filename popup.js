document.getElementById("summarise").addEventListener("click", async () => {
    const result = document.getElementById("result");
    result.textContent = "Generating summary...";
    const summaryType = document.getElementById("summary-type").value;

    chrome.storage.sync.get(["geminiApiKey"], async ({geminiApiKey}) => {
        if (!geminiApiKey) {
            chrome.runtime.openOptionsPage();
            return;
        }

        chrome.tabs.query({active: true, currentWindow: true}, async (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, {action: "getArticleContent"}, async (response) => {
                try{
                    const summary = await getGeminiApiResponse(response.content, summaryType, geminiApiKey);
                    result.innerHTML = formatSummary(summary);
                }
                catch(error){
                    console.error(error);
                    result.textContent = "Failed to generate summary";
                }
            });
        });
    });
});

async function getGeminiApiResponse(text, type, geminiApiKey){
    const propMap = {
        "4-points": "Summarise in brief 4 points, no header",
        "10-points": "Summarise in brief 10 points, no header"
    }
    const promptText = propMap[type] || "Summarise in breif 4 points, no header";
    
    const requestBody = {
        contents: [{
            parts: [{
                text: `${promptText}:\n\n${text}`
            }]
        }]
    };

    const res = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + geminiApiKey,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(requestBody)
        }
    );
    
    if(!res.ok){
        throw new Error("Failed to generate summary");
    }
    
    const data = await res.json();
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        return data.candidates[0].content.parts[0].text;
    } else {
        throw new Error("Failed to generate summary");
    }
}

function formatSummary(summary) {
    return summary.replace(/^\s*[*\-]\s+/gm, '• ')
                  .replace(/\n/g, '<br>');
}
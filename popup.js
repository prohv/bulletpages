document.getElementById("summarise").addEventListener("click", async () => {
    const result = document.getElementById("result");
    result.textContent = "Generating summary...";
    const summaryType = document.getElementById("summary-type").value;

    document.getElementById("export").classList.add("hidden");

    chrome.storage.sync.get(["geminiApiKey"], async ({geminiApiKey}) => {
        if (!geminiApiKey) {
            chrome.runtime.openOptionsPage();
            return;
        }

        chrome.tabs.query({active: true, currentWindow: true}, async (tabs) => {
            if (!tabs || tabs.length === 0) {
                result.textContent = "No active tab found";
                return;
            }
            
            if (!tabs[0].id) {
                result.textContent = "Unable to access the active tab";
                return;
            }
            
            chrome.tabs.sendMessage(tabs[0].id, {action: "getArticleContent"}, async (response) => {
                try{
                    if (!response || !response.content) {
                        result.textContent = "No content found on this page";
                        return;
                    }
                    
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 30000);
                    
                    const summary = await getGeminiApiResponse(response.content, summaryType, geminiApiKey, controller);
                    clearTimeout(timeoutId);
                    result.innerHTML = formatSummary(summary);
                    
                    setTimeout(() => {
                        document.getElementById("export").classList.remove("hidden");
                    }, 100);
                }
                catch(error){
                    console.error(error);
                    if (error.name === 'AbortError') {
                        result.textContent = "Request timed out. Please try again.";
                    } else {
                        result.textContent = "Failed to generate summary: " + error.message;
                    }
                }
            });
        });
    });
});

document.getElementById("export").addEventListener("click", () => {
    const exportButton = document.getElementById("export");
    const originalText = exportButton.textContent;
    
    exportButton.disabled = true;
    
    const resultElement = document.getElementById("result");
    let summaryText = resultElement.innerText || resultElement.textContent;
    
    if (resultElement.innerHTML.includes('<br>')) {
        summaryText = resultElement.innerHTML.replace(/<br\s*\/?>/gi, '\n');
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = summaryText;
        summaryText = tempDiv.textContent || tempDiv.innerText || '';
    }
    
    if (!summaryText || summaryText.trim() === "" || summaryText.includes("Click to Generate Summary") || summaryText.includes("Generating summary...")) {
        console.error("No summary content to export");
        // Reset button
        exportButton.textContent = originalText;
        exportButton.disabled = false;
        return;
    }
    
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        const tab = tabs[0];
        let pageTitle = tab.title ? tab.title.replace(/[^a-zA-Z0-9]/g, '_') : 'summary';
        
        if (pageTitle.length > 50) {
            pageTitle = pageTitle.substring(0, 50);
        }
        
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        const filename = `${pageTitle}_summary_${timestamp}.txt`;
        
        downloadTextFile(summaryText, filename);
        
        setTimeout(() => {
            exportButton.textContent = originalText;
            exportButton.disabled = false;
        }, 1000);
    });
});

async function getGeminiApiResponse(text, type, geminiApiKey, controller){
    const propMap = {
        "4-points": "Summarise in brief 4 points, no header",
        "10-points": "Summarise in brief 10 points, no header"
    }
    const promptText = propMap[type] || "Summarise in brief 4 points, no header";

    let processedText = text.trim().replace(/\s+/g, ' ');
    
    const maxLength = 20000;
    if (processedText.length > maxLength) {
        processedText = processedText.substring(0, maxLength) + "... (content truncated for performance)";
    }

    await new Promise(resolve => setTimeout(resolve, 10));

    const requestBody = {
        contents: [{
            parts: [{
                text: `${promptText}:\n\n${processedText}`
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
            body: JSON.stringify(requestBody),
            signal: controller.signal
        }
    );
    
    if(!res.ok){
        throw new Error(`API request failed with status ${res.status}`);
    }
    
    const data = await res.json();
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        return data.candidates[0].content.parts[0].text;
    } else {
        throw new Error("No summary generated by the AI model");
    }
}

function formatSummary(summary) {
    return summary.replace(/^\s*[*\-]\s+/gm, '• ')
                  .replace(/\n/g, '<br>');
}

function downloadTextFile(text, filename) {
    try {
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename || 'summary.txt';
        
        document.body.appendChild(a);
        a.click();
        
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
    } catch (error) {
        console.error("Failed to export summary:", error);
    }
}
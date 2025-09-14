function getArticleContent() {
    // Cache commonly used elements
    const articleSelectors = [
        "article",
        "[role='article']",
        ".post-content",
        ".article-content",
        ".entry-content",
        ".post-body",
        ".content"
    ];
    
    // Try to find the main article content container first
    for (const selector of articleSelectors) {
        const element = document.querySelector(selector);
        if (element && element.textContent.trim().length > 100) {
            // Filter out invisible or hidden content
            const walker = document.createTreeWalker(
                element,
                NodeFilter.SHOW_TEXT,
                {
                    acceptNode: function(node) {
                        // Skip empty or whitespace-only nodes
                        if (!node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
                        
                        // Skip nodes that are likely ads, navigation, or UI elements
                        const parent = node.parentElement;
                        if (parent) {
                            const computedStyle = window.getComputedStyle(parent);
                            // Skip hidden elements
                            if (computedStyle.display === 'none' || computedStyle.visibility === 'hidden') {
                                return NodeFilter.FILTER_REJECT;
                            }
                        }
                        return NodeFilter.FILTER_ACCEPT;
                    }
                }
            );
            
            let text = '';
            let node;
            let paragraphCount = 0;
            
            while (node = walker.nextNode()) {
                const parent = node.parentElement;
                // Skip script and style tags
                if (parent && (parent.tagName === 'SCRIPT' || parent.tagName === 'STYLE')) {
                    continue;
                }
                
                text += node.nodeValue + ' ';
                
                // Roughly estimate paragraphs by counting newlines
                if (node.nodeValue.includes('\n')) {
                    paragraphCount++;
                }
                
                // Limit content to prevent oversized requests
                if (text.length > 30000) {
                    break;
                }
            }
            
            return text.trim();
        }
    }
    
    // Fallback: collect paragraphs with better filtering
    const paragraphs = [];
    const paragraphElements = document.querySelectorAll("p");
    
    for (let i = 0; i < Math.min(paragraphElements.length, 40); i++) {
        const p = paragraphElements[i];
        const text = p.textContent.trim();
        
        // Skip very short paragraphs that are likely navigation or UI elements
        if (text.length > 30) {
            // Check if element is visible
            const computedStyle = window.getComputedStyle(p);
            if (computedStyle.display !== 'none' && computedStyle.visibility !== 'hidden') {
                paragraphs.push(text);
            }
        }
        
        // Stop if we have enough content
        if (paragraphs.join('\n').length > 20000) {
            break;
        }
    }
    
    return paragraphs.join("\n");
}

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
    if (request.action === "getArticleContent") {
        const content = getArticleContent();
        sendResponse({content});
    }
});okk
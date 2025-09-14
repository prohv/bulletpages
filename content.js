function getArticleContent() {
    const articleSelectors = [
        "article",
        "[role='article']",
        ".post-content",
        ".article-content",
        ".entry-content",
        ".post-body",
        ".content"
    ];
    
    for (const selector of articleSelectors) {
        const element = document.querySelector(selector);
        if (element && element.textContent.trim().length > 100) {
            const walker = document.createTreeWalker(
                element,
                NodeFilter.SHOW_TEXT,
                {
                    acceptNode: function(node) {
                        if (!node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
                        
                        const parent = node.parentElement;
                        if (parent) {
                            const computedStyle = window.getComputedStyle(parent);
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
                if (parent && (parent.tagName === 'SCRIPT' || parent.tagName === 'STYLE')) {
                    continue;
                }
                
                text += node.nodeValue + ' ';

                if (node.nodeValue.includes('\n')) {
                    paragraphCount++;
                }

                if (text.length > 30000) {
                    break;
                }
            }
            
            return text.trim();
        }
    }

    const paragraphs = [];
    const paragraphElements = document.querySelectorAll("p");
    
    for (let i = 0; i < Math.min(paragraphElements.length, 40); i++) {
        const p = paragraphElements[i];
        const text = p.textContent.trim();
        
        if (text.length > 30) {
            const computedStyle = window.getComputedStyle(p);
            if (computedStyle.display !== 'none' && computedStyle.visibility !== 'hidden') {
                paragraphs.push(text);
            }
        }

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
});
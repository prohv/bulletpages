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
                            // Check for potential null values before using .includes()
                            const tagName = parent.tagName ? parent.tagName.toLowerCase() : '';
                            const className = parent.className != null ? parent.className : '';
                            const id = parent.id != null ? parent.id : '';
                            
                            // Skip unwanted elements
                            if (tagName === 'nav' || tagName === 'aside' || tagName === 'footer' || tagName === 'header' ||
                                className.includes('nav') || className.includes('sidebar') ||
                                className.includes('ad') || className.includes('widget') ||
                                id.includes('nav') || id.includes('sidebar') ||
                                className.includes('advertisement') || className.includes('menu') ||
                                className.includes('adsbygoogle')) {
                                return NodeFilter.FILTER_REJECT;
                            }
                            
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
        
        // Check if paragraph is inside unwanted elements
        let insideUnwanted = false;
        let parent = p.parentElement;
        while (parent && parent !== document.body) {
            const tagName = parent.tagName ? parent.tagName.toLowerCase() : '';
            const className = parent.className != null ? parent.className : '';
            const id = parent.id != null ? parent.id : '';
            
            if (tagName === 'nav' || tagName === 'aside' || tagName === 'footer' || tagName === 'header' ||
                className.includes('nav') || className.includes('sidebar') ||
                className.includes('ad') || className.includes('widget') ||
                id.includes('nav') || id.includes('sidebar') ||
                className.includes('advertisement') || className.includes('menu')) {
                insideUnwanted = true;
                break;
            }
            parent = parent.parentElement;
        }
        
        if (!insideUnwanted) {
            const text = p.textContent.trim();
            if (text.length > 30) {
                const computedStyle = window.getComputedStyle(p);
                if (computedStyle.display !== 'none' && computedStyle.visibility !== 'hidden') {
                    paragraphs.push(text);
                }
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
    return true;
});
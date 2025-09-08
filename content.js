function getArticleContent() {
    const article = document.querySelector("article");
    if (article) return article.textContent;

    const paragraphs = Array.from(document.querySelectorAll("p")).map(p => p.textContent);
    return paragraphs.join("\n");
}

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
    if (request.action === "getArticleContent") {
        const content = getArticleContent();
        sendResponse({content});
    }
});
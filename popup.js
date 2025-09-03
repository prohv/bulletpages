// Get a reference to the Gemini API key button
const geminiApiKeyButton = document.getElementById('gemini-api-key');

// Add an event listener to the button
if (geminiApiKeyButton) {
    geminiApiKeyButton.addEventListener('click', () => {
        // Open the geminiapipage.html in the same window/tab
        window.location.href = 'geminiapipage.html';
    });
}

// Existing code for summary-type dropdown (if any, keeping it here for context)
const summaryTypeSelect = document.getElementById('summary-type');
const resultDiv = document.getElementById('result');

if (summaryTypeSelect && resultDiv) {
    summaryTypeSelect.addEventListener('change', () => {
        const selectedValue = summaryTypeSelect.value;
        // You would typically add logic here to generate a summary
        // based on the selectedValue (e.g., "4-points" or "10-points").
        // For demonstration, let's just display the selected option.
        resultDiv.textContent = `Selected: ${selectedValue}`;
    });
}


// Get a reference to the H1 title element
const bulletPagesTitle = document.querySelector('h1');

// Add an event listener to the H1 title
if (bulletPagesTitle) {
    bulletPagesTitle.addEventListener('click', () => {
        // Renavigate to popup.html when the title is clicked
        window.location.href = 'popup.html';
    });
    // Optional: Add a cursor style to indicate it's clickable
    bulletPagesTitle.style.cursor = 'pointer';
}

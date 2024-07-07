function replaceItalics(markdown) {
    // Regular expression to match *italic* text, but not **bold**
    const italicRegex = /(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/g;

    // Split the markdown by newlines
    const lines = markdown.split('\n');

    // Process each line
    const processedLines = lines.map(line => {
        const trimmedLine = line.trim();
        // Check if the line doesn't start with "* "
        if (!trimmedLine.startsWith('* ')) {
            // Replace *italic* with <i>italic</i> in the line
            return line.replace(italicRegex, (match, p1) => `<i>${p1}</i>`);
        }
        // Return the line as is if it starts with "* "
        return line;
    });

    // Join the lines back together
    return processedLines.join('\n');
}

async function loadMarkdownContent(element, markdownUrl) {
    // Step 1: Fill the element with a loading message
    const loadingMessage = document.createElement('p');
    loadingMessage.className = 'doc-action-loading';
    loadingMessage.textContent = 'Loading...';
    element.appendChild(loadingMessage);

    try {
        // Step 2: Fetch the content of the Markdown file
        const response = await fetch(markdownUrl);

        if (!response.ok) {
            // Handle non-OK response without throwing an error
            displayErrorMessage(element, `Network response was not ok: ${response.statusText}`);
            return;
        }

        const text = await response.text();

        // Step 3: Remove loading message and display the content
        element.innerHTML = ''; // Clear the previous content
        //const contentParagraph = document.createElement('p');
        //contentParagraph.textContent = text;
        //element.appendChild(contentParagraph);

        renderMarkdownToHtml(element, replaceItalics(text) );

    } catch (error) {
        // Step 4: Handle fetch error and display error message with refresh link
        displayErrorMessage(element, `An error occurred: ${error.message}`);
    }
}

// Function to display error message with a refresh link
function displayErrorMessage(element, errorMessage) {
    element.innerHTML = ''; // Clear the previous content
    const errorParagraph = document.createElement('p');
    errorParagraph.className = 'doc-action-error';
    errorParagraph.textContent = errorMessage;

    const refreshLink = document.createElement('a');
    refreshLink.href = 'javascript:window.location.reload()';
    refreshLink.textContent = 'Refresh';

    errorParagraph.appendChild(refreshLink);
    element.appendChild(errorParagraph);
}

// Render to HTML
function renderMarkdownToHtml(element, markdownText) {
    // Use the marked library to convert Markdown to HTML
    const htmlContent = marked.parse(markdownText, { gfm: true });

    // Fill the element with the rendered HTML content
    element.innerHTML = htmlContent;
}
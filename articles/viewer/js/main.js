async function wrapp(docWrapper,markdown) {
    await loadMarkdownContent(docWrapper,markdown);
    await initializeCollapsibles(docWrapper);
    await handleMeta();
}

window.onload = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const markdown = urlParams.get('markdown');

    const docWrapper = document.getElementById("doc");

    wrapp(docWrapper,markdown);

    docWrapper.removeAttribute('hidden');
}
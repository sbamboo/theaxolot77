async function wrapp(docWrapper,markdown) {
    await loadMarkdownContent(docWrapper,markdown);
    await initializeCollapsibles(docWrapper);
    await handleMeta();
}

window.onload = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const markdown = decodeURIComponent(urlParams.get('markdown'));

    const docWrapper = document.getElementById("doc");

    wrapp(docWrapper,markdown);

    docWrapper.removeAttribute('hidden');

    const retUrlParam = urlParams.get('return-url');
    const retUrl = decodeURIComponent(retUrlParam);
    if (retUrlParam) {
        const topbar = document.getElementById("topbar");
        const returnContainer = document.createElement("div");
        const returnBtn = document.createElement("a");
        returnContainer.classList.add("returnbtn-wrapper");
        returnBtn.classList.add("returnbtn");
        if (retUrl === "history-back") {
            returnBtn.onclick = () => { window.history.back(); };
        } else if (retUrl && retUrl !== null && retUrl !== "null") {
            returnBtn.href = retUrl;
        }
        returnBtn.innerText = "« Back";
        returnBtn.style.fontSize = "16px"
        returnContainer.appendChild(returnBtn);
        topbar.appendChild(returnContainer);
    }
}
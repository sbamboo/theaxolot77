// Constants for toggle symbols
const TOGGLE_DOWN = '˅'; // Down arrow symbol
const TOGGLE_RIGHT = '>'; // Right arrow symbol

async function pSpanToSpan(paramElement) {
    // Select all <p> elements under the paramElement
    const pElements = paramElement.querySelectorAll('p');

    pElements.forEach(pElement => {
        if (pElement.innerHTML.trim().startsWith("&lt;span")) {
            pElement.insertAdjacentHTML('afterend', he.decode(pElement.innerHTML));
            pElement.remove();
        }
    });
}

async function modifyArrow(detailsElement) {
    //Modify arrow
    const summary = detailsElement.querySelectorAll('summary')[0];

    summary.style.listStyle = 'none';

    const saved = summary.innerHTML;

    const wrapper = document.createElement("div");
        const arrow = document.createElement('p');
        arrow.classList.add("collapsible-arrow");
        arrow.textContent = detailsElement.open ? '˅' : '>';
        wrapper.appendChild(arrow);
    wrapper.innerHTML += saved;
    wrapper.classList.add("collapsible-summary-wrapper");

    summary.innerHTML = '';
    summary.appendChild(wrapper);

    detailsElement.addEventListener('toggle', function() {
        const arrow = detailsElement.querySelectorAll(".collapsible-arrow")[0];
        arrow.textContent = detailsElement.open ? '˅' : '>';
    });
}

async function wrap(element,markdown,detailsElement) {
    await renderMarkdownToHtml(element,markdown);
    await pSpanToSpan(element);
    await modifyArrow(detailsElement);
}

// Function to initialize collapsible elements with toggle buttons
function initializeCollapsibles(parentElement) {
    // Select all <details> elements under the parentElement
    const detailsElements = parentElement.querySelectorAll('details');

    // Iterate through each <details> element
    detailsElements.forEach(detailsElement => {
        // Select all <pre> elements under the current <details> element
        const preElements = detailsElement.querySelectorAll('pre');

        // Iterate through each <pre> element
        preElements.forEach(preElement => {
            // Select all <code> elements under the current <pre> element
            const codeElements = preElement.querySelectorAll('code');

            // Iterate through each <code> element
            codeElements.forEach(codeElement => {
                // Append the innerHTML of the <code> element to the <details> element
                wrap(codeElement,codeElement.innerHTML,detailsElement);
            });
        });
    });
}
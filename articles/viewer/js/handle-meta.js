
const originPathAddition = "/theaxolot77";

function resolveRelativePath(relativePath) {
    const currentUrl = new URL(window.location.href);

    if (relativePath.startsWith("/")) {
        return currentUrl.origin+originPathAddition+relativePath;
    } else if (relativePath.startsWith("./")) {
        let pathSegments = currentUrl.pathname.split("/");
        pathSegments.pop();
        const newPath = relativePath.substring(2);
        pathSegments.push(newPath);
        return currentUrl.origin+originPathAddition + pathSegments.join("/");
    } else {
        return relativePath;
    }
}

async function handleMeta() {
    const doc = document.getElementById("doc");
    const metaData = {};
    
    [...doc.children].forEach(child => {
        if (child.hasAttribute("meta")) {
            const lines = child.innerText.trim().split('\n');
            lines.forEach(line => {
                const [key, value] = line.split(':').map(part => part.trim());
                metaData[key] = resolveRelativePath(value);
            });
            return true;
        };
        return false;
    });

    //Title
    if (metaData.hasOwnProperty("Title")) {
        document.title = metaData["Title"];
    }

    //Favicon
    if (metaData.hasOwnProperty("Favicon")) {
        let favicon = document.createElement('link');
        favicon.rel = 'shortcut icon';
        favicon.href = metaData["Favicon"];

        let existingFavicon = document.querySelector('link[rel="shortcut icon"]');
        if (existingFavicon) {
            document.head.removeChild(existingFavicon);
        }

        document.head.appendChild(favicon);
    }

    //Banner
    if (metaData.hasOwnProperty("Banner")) {
        const banner = document.getElementById("banner-img");
        banner.src = metaData["Banner"];
    }

    //Author Img
    if (metaData.hasOwnProperty("AuthorImg")) {
        const image = document.getElementById("author-img");
        image.src = metaData["AuthorImg"];
    }

    //Author
    if (metaData.hasOwnProperty("Author")) {
        const author = document.getElementById("author-name");
        var authorText = `<p id="article-author-name">${metaData["Author"]}</p>`;
        if (metaData.hasOwnProperty("AuthorTitle")) {
            authorText += `<p id="article-author-title">&nbsp;(${metaData["AuthorTitle"]})</p>`;
        }
        author.style.display = "flex";
        author.style.flexDirection = "row";
        author.innerHTML = authorText;
    }

    //Date
    if (metaData.hasOwnProperty("Date")) {
        const date = document.getElementById("article-date");
        date.innerText = metaData["Date"];
    }

}

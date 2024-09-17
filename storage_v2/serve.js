var baseUrl = "https://raw.githubusercontent.com/sbamboo/theaxolot77/main/storage/chibits/"

function updateUrlParameter(url, paramName, paramValue) {
    // Create a URL object
    let urlObj = new URL(url);

    // Get the search parameters
    let params = urlObj.searchParams;

    // Set the new value for the parameter (it will replace the existing one if it exists)
    params.set(paramName, paramValue);

    // Return the updated URL as a string
    return urlObj.toString();
}

function convertBytesToLargestUnit(bytesSize) {
    const units = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
    let unitIndex = 0;
    while (bytesSize >= 1024 && unitIndex < units.length - 1) {
        bytesSize /= 1024;
        unitIndex++;
    }
    return bytesSize.toFixed(2) + ' ' + units[unitIndex];
}

function capitalizeString(inputString, first = true, delim = " ") {
    if (first) {
        // Capitalize the first letter of the first word
        return inputString.charAt(0).toUpperCase() + inputString.slice(1);
    } else {
        // Capitalize the first letter of each word
        let words = inputString.split(delim);
        for (let i = 0; i < words.length; i++) {
            words[i] = words[i].charAt(0).toUpperCase() + words[i].slice(1);
        }
        return words.join(delim);
    }
}

async function processFile(url,fileid) {
    if ((!url || url == null) && (fileid && fileid != null)) {
        urlObj = new URL(window.location.href);
        url = baseUrl + fileid + ".json";
    }

    if (!url) {
        console.error('URL parameter is missing.');
        return;
    }

    console.log(`Init on '${url}' with id '${fileid}'!`) //DEBUG

    try {
        // Fetch JSON file
        const response = await fetch(url);
        const jsonData = await response.json();

        

    } catch (error) {
        console.error('Error:', error);
    }
}

window.onload = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const url = urlParams.get('url');
    const fileid = urlParams.get('fileid');

    const downloadDisplay = document.getElementById('download-display');
    const storeDisplay = document.getElementById('store-display');

    var _showStore = true;
    if (url || fileid) {
        _showStore = false;
    }

    if (_showStore == true) {
        downloadDisplay.style.display = 'none';
        storeDisplay.style.display = 'block';
    } else {
        downloadDisplay.style.display = 'flex';
        storeDisplay.style.display = 'none';
        processFile(url,fileid)
    }
};

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

// Function to fetch JSON file and download parts or output checksum
async function processFile(url,fileid,skipClick=false) {
    if ((!url || url == null) && (fileid && fileid != null)) {
        urlObj = new URL(window.location.href);
        url = baseUrl + fileid + ".json";
    }

    if (!url) {
        console.error('URL parameter is missing.');
        return;
    }

    try {
        // Fetch JSON file
        const response = await fetch(url);
        const jsonData = await response.json();

        // Download file
        const filename = jsonData.filename;
        const chunks = jsonData.chunks;
        const parts = [];

        // Get ui parts
        const downloadinfo = document.getElementById('download-info');
        const download_filename = document.getElementById('download-info-filen');
        const download_filesize = document.getElementById('download-info-size');
        const download_checksum = document.getElementById('download-info-checks');
        const download_linkinfo = document.getElementById('download-info-url');

        // Fill in known info
        download_filename.innerHTML = download_filename.innerHTML.replace("FILENAME",filename);
        download_filesize.innerHTML = download_filesize.innerHTML.replace("FILESIZE",convertBytesToLargestUnit(jsonData.size));
        download_checksum.innerHTML = download_checksum.innerHTML.replace("HASH_ALGORITHM",jsonData.checksum.hash + " (" + jsonData.checksum.algorithm + ")");

        if (skipClick != false) {
            downloadinfo.innerText = "Downloading Chibit...";
            download_linkinfo.innerHTML = `Download not starting? <a class="link-label" id="download-info-link">Click here</a>`;
        } else {
            downloadinfo.innerText = "Chibit Download:";
            download_linkinfo.innerHTML = `To download: <a class="link-label" id="download-info-link">Click here</a>`;
        }
        
        const download_linktag  = document.getElementById('download-info-link');
        download_linktag.innerHTML = 'Generating download link...';

        // Fetch each part
        for (let i = 0; i < chunks.length; i++) {
            const partUrl = chunks[i];
            const partResponse = await fetch(partUrl);
            const partBlob = await partResponse.blob();
            parts.push(partBlob);
        }

        // Combine parts into a single Blob
        const combinedBlob = new Blob(parts);

        // Create download link
        download_linktag.href = URL.createObjectURL(combinedBlob);
        download_linktag.download = filename;
        download_linktag.innerHTML = 'Click here';
        
        if (skipClick != false) {
            download_linktag.click();
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

async function fillInPlaceholder(fileid, filename, chunks) {
    const parts = [];

    // Fetch each part
    for (let i = 0; i < chunks.length; i++) {
        const partUrl = chunks[i];
        const partResponse = await fetch(partUrl);
        const partBlob = await partResponse.blob();
        parts.push(partBlob);
    }

    // Combine parts into a single Blob
    const combinedBlob = new Blob(parts);

    // Create download link
    const downloadLink = document.getElementById(`placehold_${fileid}`);
    
    downloadLink.href = URL.createObjectURL(combinedBlob);
    downloadLink.download = filename;
    downloadLink.innerHTML = "Download Blob";
    downloadLink.classList.remove("temp-link-label");
    downloadLink.classList.add("link-label");
}

function onCopyBtnClick(event) {
    const button = event.target.closest(".copybtn")
    const textToCopy = button.getAttribute('data-text');
    navigator.clipboard.writeText(textToCopy).then(() => {
        console.log('Text copied to clipboard successfully!');
        //alert('Text copied to clipboard successfully!');
        
        // Change to check icon
        const copyIcon = button.querySelector('.copyIcon');
        const checkIcon = button.querySelector('.checkIcon');
        const failIcon = button.querySelector('.failIcon');
        copyIcon.classList.add('hidden');
        failIcon.classList.add('hidden');
        checkIcon.classList.remove('hidden');
        
        // Optionally, revert back to the original icon after a timeout
        setTimeout(() => {
            copyIcon.classList.remove('hidden');
            checkIcon.classList.add('hidden');
        }, 1500); // Change back after 1.5 seconds
    }).catch(err => {
        console.error('Failed to copy text: ', err);
        //alert('Failed to copy text.');
        
        // Change to fail icon
        const copyIcon = button.querySelector('.copyIcon');
        const checkIcon = button.querySelector('.checkIcon');
        const failIcon = button.querySelector('.failIcon');
        copyIcon.classList.add('hidden');
        checkIcon.classList.add('hidden');
        failIcon.classList.remove('hidden');
        
        // Optionally, revert back to the original icon after a timeout
        setTimeout(() => {
            copyIcon.classList.remove('hidden');
            failIcon.classList.add('hidden');
        }, 1500); // Change back after 1.5 seconds
    });
}

function showStore(debug=false) {
    if (debug == true || debug == "true") {
        fetchurl = 'https://sbamboo.github.io/theaxolot77/storage/chibits/chibits.json'
    } else {
        fetchurl = './chibits/chibits.json'
    }
    fetch(fetchurl)
        .then(response => response.json())
        .then(data => {
            hasMadeKeys = false;
            for (let id in data) {
                value = data[id];
                fetch(value)
                    .then(response => response.json())
                    .then(data => {
                        tableHeaders = document.getElementById("store-down-heads");
                        tableBody = document.getElementById("store-down-data");

                        const keys = Object.keys(data);
                        var orderedKeys = ['chunks', ...keys.filter(key => key !== 'chunks')];
                        var reorderedObject = {};
                        orderedKeys.forEach(key => {
                        if (data.hasOwnProperty(key)) {
                            reorderedObject[key] = data[key];
                        }
                        });

                        if (hasMadeKeys == false) {
                            for (let key in reorderedObject) {
                                if (key == "chunks") {
                                    tableHeaders.innerHTML += `<th>Blobs</th>`;
                                } else {
                                    var _first = true
                                    var _delim = " "
                                    if (key.includes("-")) {
                                        _first = false
                                        _delim = "-"
                                    } else if (key.includes(" ")) {
                                        _first = false
                                        _delim = " "
                                    }
                                    key = capitalizeString(key,first=_first, delim=_delim)
                                    tableHeaders.innerHTML += `<th>${key}</th>`;
                                }
                            }
                            tableHeaders.innerHTML += `<th>Chunks</th>`;
                            tableHeaders.innerHTML += `<th>FileID</th>`;
                            tableHeaders.innerHTML += `<th>Store-Page</th>`;
                            hasMadeKeys = true;
                        }
                        stringBuild = "<tr>"
                        for (let key in reorderedObject) {
                            value = reorderedObject[key];
                            if (key == "checksum") {
                                stringBuild += `<td><i>${value.algorithm}</i>: ${value.hash}</td>`;
                            } else if (key == "chunks") {
                                stringBuild += `<td><a class="temp-link-label" id="placehold_${id}">Generating link...</a></td>`;
                            } else if (["size","max-size"].includes(key)) {
                                stringBuild += `<td>${convertBytesToLargestUnit(value)}</td>`;
                            } else {
                                stringBuild += `<td>${value}</td>`;
                            }
                        }
                        stringBuild += `<td>Qty: ${data.chunks.length}</td>`;
                        stringBuild += `
                        <td class="minsized-box-1">
                        ${id}
                        <button class="copybtn" id="copybtn-for-${id}" data-text="${id}" onclick="onCopyBtnClick(event);">
                            <svg class="copyIcon" width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M8 8V5.2C8 4.0799 8 3.51984 8.21799 3.09202C8.40973 2.71569 8.71569 2.40973 9.09202 2.21799C9.51984 2 10.0799 2 11.2 2H18.8C19.9201 2 20.4802 2 20.908 2.21799C21.2843 2.40973 21.5903 2.71569 21.782 3.09202C22 3.51984 22 4.0799 22 5.2V12.8C22 13.9201 22 14.4802 21.782 14.908C21.5903 15.2843 21.2843 15.5903 20.908 15.782C20.4802 16 19.9201 16 18.8 16H16M5.2 22H12.8C13.9201 22 14.4802 22 14.908 21.782C15.2843 21.5903 15.5903 21.2843 15.782 20.908C16 20.4802 16 19.9201 16 18.8V11.2C16 10.0799 16 9.51984 15.782 9.09202C15.5903 8.71569 15.2843 8.40973 14.908 8.21799C14.4802 8 13.9201 8 12.8 8H5.2C4.0799 8 3.51984 8 3.09202 8.21799C2.71569 8.40973 2.40973 8.71569 2.21799 9.09202C2 9.51984 2 10.0799 2 11.2V18.8C2 19.9201 2 20.4802 2.21799 20.908C2.40973 21.2843 2.71569 21.5903 3.09202 21.782C3.51984 22 4.07989 22 5.2 22Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            <svg class="checkIcon hidden" width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6 15L8 17L12.5 12.5M8 8V5.2C8 4.0799 8 3.51984 8.21799 3.09202C8.40973 2.71569 8.71569 2.40973 9.09202 2.21799C9.51984 2 10.0799 2 11.2 2H18.8C19.9201 2 20.4802 2 20.908 2.21799C21.2843 2.40973 21.5903 2.71569 21.782 3.09202C22 3.51984 22 4.0799 22 5.2V12.8C22 13.9201 22 14.4802 21.782 14.908C21.5903 15.2843 21.2843 15.5903 20.908 15.782C20.4802 16 19.9201 16 18.8 16H16M5.2 22H12.8C13.9201 22 14.4802 22 14.908 21.782C15.2843 21.5903 15.5903 21.2843 15.782 20.908C16 20.4802 16 19.9201 16 18.8V11.2C16 10.0799 16 9.51984 15.782 9.09202C15.5903 8.71569 15.2843 8.40973 14.908 8.21799C14.4802 8 13.9201 8 12.8 8H5.2C4.0799 8 3.51984 8 3.09202 8.21799C2.71569 8.40973 2.40973 8.71569 2.21799 9.09202C2 9.51984 2 10.0799 2 11.2V18.8C2 19.9201 2 20.4802 2.21799 20.908C2.40973 21.2843 2.71569 21.5903 3.09202 21.782C3.51984 22 4.07989 22 5.2 22Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            <svg class="failIcon hidden" width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M16 4C16.93 4 17.395 4 17.7765 4.10222C18.8117 4.37962 19.6204 5.18827 19.8978 6.22354C20 6.60504 20 7.07003 20 8V17.2C20 18.8802 20 19.7202 19.673 20.362C19.3854 20.9265 18.9265 21.3854 18.362 21.673C17.7202 22 16.8802 22 15.2 22H8.8C7.11984 22 6.27976 22 5.63803 21.673C5.07354 21.3854 4.6146 20.9265 4.32698 20.362C4 19.7202 4 18.8802 4 17.2V8C4 7.07003 4 6.60504 4.10222 6.22354C4.37962 5.18827 5.18827 4.37962 6.22354 4.10222C6.60504 4 7.07003 4 8 4M9.5 12L14.5 17M14.5 12L9.5 17M9.6 6H14.4C14.9601 6 15.2401 6 15.454 5.89101C15.6422 5.79513 15.7951 5.64215 15.891 5.45399C16 5.24008 16 4.96005 16 4.4V3.6C16 3.03995 16 2.75992 15.891 2.54601C15.7951 2.35785 15.6422 2.20487 15.454 2.10899C15.2401 2 14.9601 2 14.4 2H9.6C9.03995 2 8.75992 2 8.54601 2.10899C8.35785 2.20487 8.20487 2.35785 8.10899 2.54601C8 2.75992 8 3.03995 8 3.6V4.4C8 4.96005 8 5.24008 8.10899 5.45399C8.20487 5.64215 8.35785 5.79513 8.54601 5.89101C8.75992 6 9.03995 6 9.6 6Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </button>
                        </td>`;
                        stringBuild += `<td><a class="store-page-link" href=${updateUrlParameter(window.location.href,"fileid",id)+"&manual"}>Store-Page / Manual Download</a></td>`;
                        stringBuild += "</tr>";
                        tableBody.innerHTML += stringBuild;
                        fillInPlaceholder(id, data.filename, data.chunks)
                    });
            }
        });
}

// Call processFile function when the page loads
window.onload = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const url = urlParams.get('url');
    const fileid = urlParams.get('fileid');
    const skipClick = urlParams.get('manual');
    const dev_dot_debug = urlParams.get('dev_dot_debug_fetch');

    const downloadDisplay = document.getElementById('download-display');
    const storeDisplay = document.getElementById('store-display');

    var _showStore = true;
    if (url || fileid) {
        _showStore = false;
    }

    if (_showStore == true) {
        downloadDisplay.style.display = 'none';
        storeDisplay.style.display = 'block';
        showStore(dev_dot_debug);
    } else {
        downloadDisplay.style.display = 'flex';
        storeDisplay.style.display = 'none';
        processFile(url,fileid,skipClick);
    }
};


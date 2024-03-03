var baseUrl = "https://raw.githubusercontent.com/sbamboo/theaxolot77/main/storage/chibits/"

function convertBytesToLargestUnit(bytesSize) {
    const units = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
    let unitIndex = 0;
    while (bytesSize >= 1024 && unitIndex < units.length - 1) {
        bytesSize /= 1024;
        unitIndex++;
    }
    return bytesSize.toFixed(2) + ' ' + units[unitIndex];
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
        const download_filename = document.getElementById('download-info-filen');
        const download_filesize = document.getElementById('download-info-size');
        const download_checksum = document.getElementById('download-info-checks');
        const download_linkinfo = document.getElementById('download-info-url');

        // Fill in known info
        download_filename.innerHTML = download_filename.innerHTML.replace("FILENAME",filename);
        download_filesize.innerHTML = download_filesize.innerHTML.replace("FILESIZE",convertBytesToLargestUnit(jsonData.size));
        download_checksum.innerHTML = download_checksum.innerHTML.replace("HASH_ALGORITHM",jsonData.checksum.hash + " (" + jsonData.checksum.algorithm + ")");

        if (skipClick != false) {
            download_linkinfo.innerHTML = `Dosen't redirect? <a class="link-label" id="download-info-link">Click here</a>`;
        } else {
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

function showStore() {
    fetch('./chibits/chibits.json')
    //fetch('https://sbamboo.github.io/theaxolot77/storage/chibits/chibits.json')
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
                        const orderedKeys = ['chunks', ...keys.filter(key => key !== 'chunks')];
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
                                    tableHeaders.innerHTML += `<th>${key}</th>`;
                                }
                            }
                            tableHeaders.innerHTML += `<th>FileID</th>`;
                            hasMadeKeys = true;
                        }
                        stringBuild = "<tr>"
                        for (let key in reorderedObject) {
                            value = reorderedObject[key];
                            if (key == "checksum") {
                                stringBuild += `<td>${value.algorithm}: ${value.hash}</td>`;
                            } else if (key == "chunks") {
                                stringBuild += `<td><a class="temp-link-label" id="placehold_${id}">Generating link...</a></td>`;
                            } else if (["size","max-size"].includes(key)) {
                                stringBuild += `<td>${convertBytesToLargestUnit(value)}</td>`;
                            } else {
                                stringBuild += `<td>${value}</td>`;
                            }
                        }
                        stringBuild += `<td>${id}</td>`;
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

    const downloadDisplay = document.getElementById('download-display');
    const storeDisplay = document.getElementById('store-display');

    var _showStore = true;
    if (url || fileid) {
        _showStore = false;
    }

    if (_showStore == true) {
        downloadDisplay.style.display = 'none';
        storeDisplay.style.display = 'block';
        showStore();
    } else {
        downloadDisplay.style.display = 'flex';
        storeDisplay.style.display = 'none';
        processFile(url,fileid,skipClick);
    }
};
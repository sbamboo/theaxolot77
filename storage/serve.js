// Function to fetch JSON file and download parts or output checksum
async function processFile(url) {
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
        const downloadLink = document.createElement('a');
        const checksum = jsonData.checksum.hash;
        
        downloadLink.href = URL.createObjectURL(combinedBlob);
        downloadLink.download = filename;
        downloadLink.innerHTML = 'Click here to download the file';
        
        hashTxt = document.createElement('p');
        hashTxt.innerHTML = 'Checksum: ' + checksum;
        
        document.body.appendChild(downloadLink);
        document.body.appendChild(hashTxt);


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

    const downloadDisplay = document.getElementById('download-display');
    const storeDisplay = document.getElementById('store-display');

    if (!url) {
        downloadDisplay.style.display = 'none';
        storeDisplay.style.display = 'block';
        showStore();
    } else {
        downloadDisplay.style.display = 'block';
        storeDisplay.style.display = 'none';
        processFile(url);
    }
};
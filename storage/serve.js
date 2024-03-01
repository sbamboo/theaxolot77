// Function to fetch JSON file and download parts or output checksum
async function processFile() {
    const urlParams = new URLSearchParams(window.location.search);
    const url = urlParams.get('url');
    const giveChecksum = urlParams.has('givechecksum');
    const autoDownload = urlParams.has('auto');

    if (!url) {
        console.error('URL parameter is missing.');
        return;
    }

    try {
        // Fetch JSON file
        const response = await fetch(url);
        const jsonData = await response.json();

        if (giveChecksum) {
            // Output checksum
            const checksumOutput = document.getElementById('checksumOutput');
            const checksum = jsonData.checksum.hash;
            checksumOutput.innerHTML = `${checksum}`;
        } else {
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

            if (autoDownload) {
                // Auto-download the file
                const blobUrl = URL.createObjectURL(combinedBlob);
                //window.location.href = blobUrl;
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = blobUrl;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                URL.revokeObjectURL(blobUrl);
            } else {
                // Create download link
                const downloadLink = document.createElement('a');
                downloadLink.href = URL.createObjectURL(combinedBlob);
                downloadLink.download = filename;
                downloadLink.innerHTML = 'Click here to download the file';
                document.body.appendChild(downloadLink);
            }
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// Call processFile function when the page loads
window.onload = processFile;
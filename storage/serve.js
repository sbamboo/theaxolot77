// Function to fetch JSON file and download parts or output checksum
async function processFile() {
    const urlParams = new URLSearchParams(window.location.search);
    const url = urlParams.get('url');

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

// Call processFile function when the page loads
window.onload = processFile;
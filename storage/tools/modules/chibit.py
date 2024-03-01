import requests, zlib

class ChibitConnector():
    def __init__(self, hostUrl):
        if hostUrl[-1] == '/':
            self.hostUrl = hostUrl[:-1]
        self.hostUrl = hostUrl

    def _downloadChunks(self, urlList, verbose=False):
        chunks = []
        if verbose: print(f"Downloading {len(urlList)} chunks from url...")
        ind = 0
        for url in urlList:
            response = requests.get(url)
            if response.status_code == 200:
                chunks.append(response.content)
                if verbose: print(f"Downloaded chunk {ind+1}/{len(urlList)}")
                ind += 1
            else:
                raise Exception(f"Failed to download chunk from {url}! Status code: {response.status_code}")
        return chunks

    def _joinChunksData(self, chunkContents, verbose=False):
        joinedContent = b''
        if verbose: print(f"Joining {len(chunkContents)} chunks...")
        for chunk in chunkContents:
            joinedContent += chunk
        return joinedContent

    def _joinChunksFile(self, chunkContents, filepath):
        with open(output_file, 'wb') as f:
            for chunk in chunks:
                f.write(chunk)

    def _calculate_crc32(self, data):
        crc32Value = zlib.crc32(data)
        return crc32Value

    def getChibit(self, fileid):
        chibitUrl = f"{self.hostUrl}/chibits/{fileid}.json"

        response = requests.get(chibitUrl)

        return response.json()

    def getRaw(self, fileid, safe=True, verbose=False):
        chibitData = self.getChibit(fileid)

        chunks = chibitData['chunks']

        chunkContents = self._downloadChunks(chunks,verbose=verbose)
        joinedContent = self._joinChunksData(chunkContents,verbose=verbose)

        if safe:
            algor = chibitData["checksum"]["algorithm"]
            hash_ = chibitData["checksum"]["hash"]
            if algor == "crc32":
                calculatedHash = self._calculate_crc32(joinedContent)
                if calculatedHash != hash_:
                    print(f"Checksum mismatch for {fileid}")
                    return None
                else:
                    return joinedContent
        else:
            return joinedContent

    def getRawFile(self, fileid, output_file, safe=True, verbose=False):
        chibitData = self.getChibit(fileid)

        chunks = chibitData['chunks']

        chunkContents = self._downloadChunks(chunks,verbose=verbose)
        joinedContent = self._joinChunksFile(chunkContents,filepath=output_file, verbose=verbose)

        # make safe checking return


res = ChibitConnector("http://sbamboo.github.io/theaxolot77/storage/").getRaw("4b660488-7151-48a4-be3e-72a587d951ed",verbose=True)
print(res)
# Chibit Module 1.0 made by Simon Kalmi Claesson
#
# Modules for interacting with a chibit-store
# 


# Imports
import requests, zlib, os

# def downloadFile_HandleGdriveVirWarn(url,filepath=str,handleGdriveVirWarn=True, loadingBar=False, title="Downloading...", postDownText="", handleGdriveVirWarnText="Found gdrive scan warning, attempting to extract link and download from there...", raise_for_status=True, encoding="utf-8", onFileExiError="raise", yieldResp=False)

# Main clas
class ChibitConnector():
    def __init__(self, hostUrl, reqType="requests", fancyPantsFuncs=None):
        """
        If 'reqType' is set to 'fancyPants', 'fancyPantsFuncs' must be given with a list of [<forDataFunc>,<forFileFunc>]
        """
        if hostUrl[-1] == '/':
            self.hostUrl = hostUrl[:-1]

        if reqType.lower() not in ["requests","fancypants"]:
            raise ValueError("reqType must be either 'requests' or 'fancypants'!")
        reqType = reqType.lower()

        if fancyPantsFuncs != None:
            valid = True
            for o in fancyPantsFuncs:
                if type(o) in [str,list,float,int,tuple,dict]:
                    valid = False
            if type(fancyPantsFuncs) != list or valid == False:
                raise ValueError("Given function instances for fancypants must be a list of objects")
        
        if reqType == "fancypants" and fancyPantsFuncs in [ None, [] ]:
            raise ValueError("For reqType = fancyPants, the fancypants functions must be given in order of [<forDataFunc>,<forFileFunc>].")
        
        self.reqType = reqType
        self.fancyPantsFuncs = fancyPantsFuncs

        self.hostUrl = hostUrl

    def _downloadChunks(self, urlList, verbose=False):
        chunks = []
        max = len(urlList)
        if verbose: print(f"Downloading {max} chunks from urls...")
        ind = 0
        for url in urlList:
            if self.reqType == "requests":
                response = requests.get(url)
            else:
                if verbose: titleTx = f"Downloading {ind+1}/{max}..."
                else: titleTx = ""
                response = self.fancyPantsFuncs[0](
                    url = url,
                    handleGdriveVirWarn = True,
                    loadingBar = verbose,
                    title = titleTx,
                    postDownText = "",
                    handleGdriveVirWarnText = "Found gdrive scan warning, attempting to extract link and download from there...",
                    raise_for_status = False,
                    yieldResp = True
                )
            if response.status_code == 200:
                chunks.append(response.content)
                if verbose == True and self.reqType == "requests": print(f"Downloaded chunk {ind+1}/{max}")
                ind += 1
            else:
                raise Exception(f"Failed to download chunk from {url}! Status code: {response.status_code}")
        return chunks

    def _downloadChunksToTemp(self, fileid, urlList, tempDir, verbose=False, encoding="utf-8"):
        chunks = []
        max = len(urlList)
        if verbose: print(f"Downloading {max} chunks from urls...")
        ind = 0
        for url in urlList:
            filepath = os.path.join(tempDir,f"{fileid}_{ind+1}.chunk")
            if self.reqType == "requests":
                response = requests.get(url)
            else:
                if verbose:
                    titleTx = f"Downloading {ind+1}/{max}..."
                    onFileExiError = "ignore-with-warn"
                else:
                    titleTx = ""
                    onFileExiError = "ignore"
                response = self.fancyPantsFuncs[1](
                    url = url,
                    filepath = filepath,
                    handleGdriveVirWarn = True,
                    loadingBar = verbose,
                    title = titleTx,
                    postDownText = "",
                    handleGdriveVirWarnText = "Found gdrive scan warning, attempting to extract link and download from there...",
                    raise_for_status = False,
                    encoding = encoding,
                    onFileExiError = onFileExiError,
                    yieldResp = True
                )
            if response.status_code == 200:
                chunks.append(filepath)
                if verbose == True and self.reqType == "requests": print(f"Downloaded chunk {ind+1}/{max}")
                ind += 1
            else:
                raise Exception(f"Failed to download chunk from {url}! Status code: {response.status_code}")
        return chunks

    def _downloadChunksToJoin(self, fileid, urlList, outputFile, verbose=False, encoding="utf-8") {
        max = len(urlList)
        if verbose: print(f"Downloading {max} chunks from urls...")
        with open(outputFile, 'ab') as f:
            ind = 0
            for url in urlList:
                if self.reqType == "requests":
                    response = requests.get(url)
                else:
                    if verbose:
                        titleTx = f"Downloading {ind+1}/{max}..."
                        onFileExiError = "ignore-with-warn"
                    else:
                        titleTx = ""
                        onFileExiError = "ignore"
                    response = self.fancyPantsFuncs[1](
                        url = url,
                        filepath = filepath,
                        handleGdriveVirWarn = True,
                        loadingBar = verbose,
                        title = titleTx,
                        postDownText = "",
                        handleGdriveVirWarnText = "Found gdrive scan warning, attempting to extract link and download from there...",
                        raise_for_status = False,
                        encoding = encoding,
                        onFileExiError = onFileExiError,
                        yieldResp = True
                    )
                if response.status_code == 200:
                    f.write(response.content)
                    if verbose == True and self.reqType == "requests": print(f"Downloaded chunk {ind+1}/{max}")
                    ind += 1
                else:
                    raise Exception(f"Failed to download chunk from {url}! Status code: {response.status_code}")
    }

    def _joinChunksData(self, chunkContents, verbose=False):
        joinedContent = b''
        if verbose: print(f"Joining {len(chunkContents)} chunks...")
        for chunk in chunkContents:
            joinedContent += chunk
        return joinedContent

    def _appendByteFiles(self, firstFile, fileList, verbose=False):
        try:
            # Open the first file in append mode
            with open(firstFile, 'ab') as f:
                for filePath in fileList:
                    try:
                        # Open each file in binary mode
                        with open(filePath, 'rb') as otherFile:
                            # Read the byte content of the other file
                            content = otherFile.read()
                            # Append the content to the first file
                            f.write(content)
                            otherFile.close()
                    except FileNotFoundError:
                        if verbose: print(f"File '{filePath}' not found. Skipping...")
                    except Exception as e:
                        if verbose: print(f"Error while reading '{filePath}': {e}")
                f.close()
        except Exception as e:
            if verbose: print(f"Error while opening '{firstFile}' for appending: {e}")

    def _joinChunksFile(self, chunkFiles, filepath, verbose=False):
        if verbose: print(f"Joining {len(chunkFiles)} chunk-files to 1...")
        self._appendByteFiles(filepath,chunkFiles,verbose)

    def _calculate_crc32(self, data):
        crc32Value = zlib.crc32(data)
        return crc32Value
    
    def _calculate_crc32_file(self, filepath):
        crc32Value = zlib.crc32(open(filepath, "rb").read())
        return crc32Value

    def getChibit(self, fileid, verbose=False):
        chibitUrl = f"{self.hostUrl}/chibits/{fileid}.json"

        if self.reqType == "requests":
            response = requests.get(chibitUrl)
        else:
            response = self.fancyPantsFuncs[0](
                url = chibitUrl,
                handleGdriveVirWarn = True,
                loadingBar = verbose,
                title = "Fetching chibit...",
                postDownText = "",
                handleGdriveVirWarnText = "Found gdrive scan warning, attempting to extract link and download from there...",
                raise_for_status = False,
                yieldResp = True
            )
        return response.json()

    def getRaw(self, fileid, safe=True, verbose=False):
        chibitData = self.getChibit(fileid, verbose)

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

    def getRawFile(self, fileid, outputFile=None, safe=True, verbose=False, tempDir=None, check_encoding="utf-8"):

        if tempDir == None: tempDir = os.path.join(os.getcwd(),".chibitTemp")
        if os.path.exists(tempDir): os.remove(tempDir)
        os.mkdir(tempDir)

        chibitData = self.getChibit(fileid, verbose)

        chunks = chibitData['chunks']

        if outputFile == None or outputFile == "" or not os.path.exists(outputFile):
            outputFile = chibitData["filename"]

        chunkFiles = self._downloadChunksToTemp(fileid, chunks, tempDir=tempDir, verbose=verbose, encoding=check_encoding)
        self._joinChunksFile(chunkFiles, outputFile, verbose)
        if os.path.exists(tempDir): os.remove(tempDir)

        if safe:
            algor = chibitData["checksum"]["algorithm"]
            hash_ = chibitData["checksum"]["hash"]
            if algor == "crc32":
                calculatedHash = self._calculate_crc32_file(outputFile)
                if calculatedHash != hash_:
                    print(f"Checksum mismatch for {fileid}")
                    return None
                else:
                    return outputFile
        else:
            return outputFile


from _libfancyPants import getUrlContent_HandleGdriveVirWarn as gurl, downloadFile_HandleGdriveVirWarn as df
res = ChibitConnector("http://sbamboo.github.io/theaxolot77/storage/",reqType="fancypants",fancyPantsFuncs=[gurl,df]).getRawFile("4b660488-7151-48a4-be3e-72a587d951ed",verbose=True)
print(res)
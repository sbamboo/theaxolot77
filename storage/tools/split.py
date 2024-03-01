import sys
import os
import zlib
import json
import uuid

# Get parent
parent = os.path.dirname(os.path.abspath(__file__))

# Define constants
CHIBITSVER = "1.0"
CHUNKS_DIR = f"{parent}/../chunks"
CHIBITS_DIR = f"{parent}/../chibits"
MAX_CHUNK_SIZE = 100_000_000  # 100 milion bytes (yes not 100MB)
BASE_URL = "https://sbamboo.github.io/theaxolot77/storage"
CHIBITS_LIST = f"{parent}/../chibits/chibits.json"

def generate_chunks(filepath, file_id):
    # Create folder for storing chunks
    chunk_folder = os.path.join(CHUNKS_DIR, file_id)
    os.makedirs(chunk_folder, exist_ok=True)

    # Get file name and calculate checksum
    filename = os.path.basename(filepath)
    checksum = zlib.crc32(open(filepath, "rb").read())

    # Split the file into chunks
    with open(filepath, "rb") as file:
        part_number = 1
        while True:
            chunk_data = file.read(MAX_CHUNK_SIZE)
            if not chunk_data:
                break
            chunk_filename = f"{part_number}.chunk"
            chunk_filepath = os.path.join(chunk_folder, chunk_filename)
            with open(chunk_filepath, "wb") as chunk_file:
                chunk_file.write(chunk_data)
            part_number += 1

    # Generate list of chunk URLs
    chunk_urls = [f"{BASE_URL}/chunks/{file_id}/{chunk_filename}" for chunk_filename in os.listdir(chunk_folder)]

    # Create reference dictionary
    reference_data = {
        "filename": filename,
        "checksum": {
            "algorithm": "crc32",
            "hash": checksum
        },
        "size": os.path.getsize(filepath),
        "type": "split",
        "chunks": chunk_urls,
        "max-size": MAX_CHUNK_SIZE,
        "chibit-version": CHIBITSVER
    }

    # Save reference dictionary as JSON
    reference_filename = os.path.join(CHIBITS_DIR, f"{file_id}.json")
    with open(reference_filename, "w") as json_file:
        json.dump(reference_data, json_file, indent=4)

    print(f"\nAdded \033[34m{filename}\033[0m to storage with chibit-id \033[35m{file_id}\033[0m using \033[33m{len(chunk_urls)}\033[0m chunks.")

def addFileIdToList(fileid):
    # Load the chibits list
    with open(CHIBITS_LIST, "r") as json_file:
        chibits_list = json.load(json_file)

    # Add the new file ID to the list
    if fileid not in chibits_list.keys():
        chibits_list[fileid] = f"{BASE_URL}/chibits/{fileid}.json"

    # Save the updated chibits list
    with open(CHIBITS_LIST, "w") as json_file:
        json.dump(chibits_list, json_file, indent=4)

if __name__ == "__main__":
    # Check if filepath is provided as an argument
    if len(sys.argv) != 2:
        print("Usage: python3 split.py <filepath>")
        sys.exit(1)

    filepath = sys.argv[1]

    # Generate a unique file ID
    file_id = str(uuid.uuid4())

    # Generate chunks and create reference
    generate_chunks(filepath, file_id)
    addFileIdToList(file_id)
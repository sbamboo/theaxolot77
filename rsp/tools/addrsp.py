import os
import json
import hashlib

# Function to calculate CRC32 checksum
def calculate_crc32(filename):
    with open(filename, 'rb') as f:
        return hashlib.crc32(f.read()) & 0xFFFFFFFF

# Function to split file into chunks
def split_file(filename, chunk_size=100 * 1024 * 1024):
    file_chunks = []
    with open(filename, 'rb') as f:
        index = 0
        while True:
            chunk = f.read(chunk_size)
            if not chunk:
                break
            chunk_filename = f"{filename}.part{index}"
            with open(chunk_filename, 'wb') as chunk_file:
                chunk_file.write(chunk)
            file_chunks.append(chunk_filename)
            index += 1
    return file_chunks

# Function to create JSON file
def create_json(filename, chunks):
    checksum = calculate_crc32(filename)
    json_data = {
        "filename": filename,
        "checksum": {
            "algorithm": "crc32",
            "hash": checksum
        },
        "chunks": chunks
    }
    with open(f"{filename}.json", 'w') as json_file:
        json.dump(json_data, json_file, indent=4)

# Main function
def main():
    filename = "example.zip"
    max_chunk_size = 100 * 1024 * 1024
    chunks = split_file(filename, max_chunk_size)
    create_json(filename, chunks)

if __name__ == "__main__":
    main()

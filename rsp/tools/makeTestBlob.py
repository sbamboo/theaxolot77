import os
import random
import string

# Define the size of the file in bytes (210MB)
file_size_bytes = 210 * 1024 * 1024

# Define the path for the output text file
file_path = "output.txt"

# Function to generate random text
def generate_random_text(size):
    # Generate random text using uppercase and lowercase letters
    return ''.join(random.choice(string.ascii_letters) for _ in range(size))

# Open the file in write mode
with open(file_path, 'w') as f:
    # Write random text until the file size reaches the desired size
    while os.path.getsize(file_path) < file_size_bytes:
        print(" "+ (" "*(len(str(file_size_bytes))-len(str(os.path.getsize(file_path))))) +f"\033[35m{os.path.getsize(file_path)}\033[0m / \033[35m{file_size_bytes}\033[0m\033[F")
        # Generate random text with a buffer size of 1024 bytes
        random_text = generate_random_text(1024)
        # Write the random text to the file
        f.write(random_text)

print(f" \033[32m{file_size_bytes}\033[0m / \033[35m{file_size_bytes}\033[0m")
print("\n")

print(f"File created: {file_path}")
print(f"File size: {os.path.getsize(file_path) / (1024 * 1024)} MB")

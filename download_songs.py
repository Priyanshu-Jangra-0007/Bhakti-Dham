import os
import urllib.request

songs = [
    {
        "filename": "Om Namah Shivaya.mp3",
        "url": "https://archive.org/download/ShivaStotrasAndMantras/39Om%20Nammah%20Shivaya.mp3"
    },
    {
        "filename": "Shiv Aarti.mp3",
        "url": "https://archive.org/download/ShivaStotrasAndMantras/42Om%20Jai%20Shiv%20Omkara.mp3"
    }
]

dest_dir = "public/songs"
os.makedirs(dest_dir, exist_ok=True)

for song in songs:
    dest_path = os.path.join(dest_dir, song["filename"])
    if os.path.exists(dest_path):
        print(f"'{song['filename']}' already exists. Skipping download.")
    else:
        print(f"Downloading '{song['filename']}' from {song['url']}...")
        try:
            urllib.request.urlretrieve(song["url"], dest_path)
            print(f"Successfully downloaded to '{dest_path}'")
        except Exception as e:
            print(f"Error downloading '{song['filename']}': {e}")

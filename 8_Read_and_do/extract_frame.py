import sys
from PIL import Image

def extract_first_frame(gif_path, png_path):
    with Image.open(gif_path) as im:
        im.seek(0)
        im.save(png_path)

if __name__ == "__main__":
    extract_first_frame(sys.argv[1], sys.argv[2])

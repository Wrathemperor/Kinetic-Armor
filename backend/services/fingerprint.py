from PIL import Image
import imagehash

def generate_phash(filepath):
    """
    Generate a perceptual hash for an image file.
    Tolerates compression, resizing, and minor color shifts.
    """
    try:
        img = Image.open(filepath)
        # Compute phash (64-bit hash)
        hash_val = imagehash.phash(img)
        return str(hash_val)
    except Exception as e:
        print(f"Error generating phash: {e}")
        return None

def calculate_distance(hash1_str, hash2_str):
    """
    Calculate Hamming distance between two hash strings.
    """
    h1 = imagehash.hex_to_hash(hash1_str)
    h2 = imagehash.hex_to_hash(hash2_str)
    return h1 - h2

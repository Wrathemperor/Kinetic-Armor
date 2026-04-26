import os
from PIL import Image, ImageDraw, ImageOps

def create_samples():
    out_dir = os.path.join(os.path.dirname(__file__), 'test_samples')
    os.makedirs(out_dir, exist_ok=True)

    colors = [
        'red', 'blue', 'green', 'yellow', 'purple', 
        'orange', 'pink', 'cyan', 'magenta', 'brown'
    ]

    for i, color in enumerate(colors):
        # Original
        img = Image.new('RGB', (300, 300), color=color)
        d = ImageDraw.Draw(img)
        d.text((20, 20), f"Asset #{i+1}", fill=(255,255,255) if color != 'yellow' else (0,0,0))
        orig_name = f'asset_{i+1}_orig.jpg'
        img.save(os.path.join(out_dir, orig_name))

        # Altered (Testcase)
        # 1. Grayscale
        # 2. Crop
        # 3. Add noise/rectangle
        altered = img.copy()
        if i % 3 == 0:
            altered = ImageOps.grayscale(altered).convert('RGB')
        elif i % 3 == 1:
            altered = altered.crop((20, 20, 280, 280)).resize((300, 300))
        
        ad = ImageDraw.Draw(altered)
        ad.rectangle([100, 100, 150, 150], fill='black' if i % 2 == 0 else 'white')
        
        alt_name = f'asset_{i+1}_violation.jpg'
        altered.save(os.path.join(out_dir, alt_name))

    print(f"Created 20 images (10 pairs) in {out_dir}")

if __name__ == '__main__':
    create_samples()

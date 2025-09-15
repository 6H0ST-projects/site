#!/usr/bin/env python3
"""
Generate Open Graph images for each page
"""
from PIL import Image, ImageDraw, ImageFont
import os

# Page configurations
pages = [
    {
        "name": "ghost-projects",
        "bg_color": "#000000",
        "text_color": "#ffffff",
        "text": "ghost-projects"
    },
    {
        "name": "project-014", 
        "bg_color": "#E7EAEE",
        "text_color": "#000000",
        "text": "014"
    },
    {
        "name": "about-us",
        "bg_color": "#FF680A", 
        "text_color": "#ffffff",
        "text": "about-us"
    },
    {
        "name": "blog",
        "bg_color": "#5C5C5C",
        "text_color": "#ffffff", 
        "text": "blog"
    },
    {
        "name": "special-projects",
        "bg_color": "#006FFF",
        "text_color": "#ffffff",
        "text": "sp"
    }
]

def hex_to_rgb(hex_color):
    """Convert hex color to RGB tuple"""
    hex_color = hex_color.lstrip('#')
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

def create_og_image(page):
    """Create Open Graph image for a page"""
    # Create image
    width, height = 1200, 630
    image = Image.new('RGB', (width, height), hex_to_rgb(page['bg_color']))
    draw = ImageDraw.Draw(image)
    
    # Try to use a system font, fallback to default
    try:
        font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 72)
    except:
        try:
            font = ImageFont.truetype("arial.ttf", 72)
        except:
            font = ImageFont.load_default()
    
    # Draw text in top-left
    text_x, text_y = 60, 120
    draw.text((text_x, text_y), page['text'], fill=hex_to_rgb(page['text_color']), font=font)
    
    # Save image
    filename = f"static/og-image-{page['name']}.png"
    image.save(filename)
    print(f"Generated {filename}")

def main():
    """Generate all Open Graph images"""
    # Create static directory if it doesn't exist
    os.makedirs("static", exist_ok=True)
    
    for page in pages:
        create_og_image(page)
    
    print("All Open Graph images generated successfully!")

if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""
Icon Generator for MHCQMS
This script helps generate various icon sizes from the SVG file.
You'll need to install cairosvg: pip install cairosvg
"""

import os
import subprocess
import sys

def check_dependencies():
    try:
        import cairosvg
        return True
    except ImportError:
        print("cairosvg not found. Installing...")
        subprocess.run([sys.executable, "-m", "pip", "install", "cairosvg"])
        return True

def generate_icons():
    if not check_dependencies():
        return
    
    import cairosvg
    
    # Create icons directory if it doesn't exist
    icons_dir = "frontend/public"
    os.makedirs(icons_dir, exist_ok=True)
    
    # Generate PNG icons from SVG
    svg_file = os.path.join(icons_dir, "icon.svg")
    
    if os.path.exists(svg_file):
        # Generate different sizes
        sizes = [16, 32, 192, 512]
        
        for size in sizes:
            output_file = os.path.join(icons_dir, f"logo{size}.png")
            cairosvg.svg2png(url=svg_file, write_to=output_file, output_width=size, output_height=size)
            print(f"Generated {output_file}")
        
        # Generate favicon files
        cairosvg.svg2png(url=svg_file, write_to=os.path.join(icons_dir, "favicon-16x16.png"), output_width=16, output_height=16)
        cairosvg.svg2png(url=svg_file, write_to=os.path.join(icons_dir, "favicon-32x32.png"), output_width=32, output_height=32)
        print("Generated favicon PNG files")
        
        print("\nNote: To create favicon.ico, use an online converter or ImageMagick:")
        print("convert favicon-16x16.png favicon-32x32.png favicon.ico")
    else:
        print(f"SVG file not found at {svg_file}")

if __name__ == "__main__":
    generate_icons()

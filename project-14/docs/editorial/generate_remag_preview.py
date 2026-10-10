"""Render REMAG's social card from the actual REMAG panel of Figure 1.

Requires Pillow and Node.js with sharp. The SVG supplies every diagram shape
and label; Pillow uses the site's fonts for consistent high-resolution text.
"""
from pathlib import Path
import argparse
import copy
import os
import subprocess
import tempfile
import xml.etree.ElementTree as ET
from PIL import Image, ImageDraw, ImageFont

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--site', type=Path, default=Path(__file__).resolve().parents[2])
parser.add_argument('--output', type=Path)
parser.add_argument('--node', default='node')
parser.add_argument('--node-modules', type=Path)
args = parser.parse_args()
output = args.output or args.site / 'static/og-image-remag.png'
scale = 3
ns = 'http://www.w3.org/2000/svg'
ET.register_namespace('', ns)
diagram = ET.parse(args.site / 'assets/remag/resident-state-after.svg').getroot()
labels = [copy.deepcopy(t) for t in diagram.iter(f'{{{ns}}}text')]
for parent in diagram.iter():
    for child in list(parent):
        if child.tag == f'{{{ns}}}text':
            parent.remove(child)

# The Figure 1 panel stays at its original aspect ratio and retains its arrows,
# colors, labels and geometry. No benchmark or schematic content is redrawn.
x, y, factor = 600, 65, 2
diagram.attrib.update(x=str(x), y=str(y), width='560', height='500')
root = ET.Element(f'{{{ns}}}svg', width='1200', height='630', viewBox='0 0 1200 630')
ET.SubElement(root, f'{{{ns}}}rect', width='1200', height='630', fill='white')
root.append(diagram)
env = os.environ.copy()
if args.node_modules:
    env['NODE_PATH'] = str(args.node_modules)
with tempfile.TemporaryDirectory(prefix='remag-preview-') as folder:
    svg = Path(folder) / 'shapes.svg'
    png = Path(folder) / 'shapes.png'
    svg.write_bytes(ET.tostring(root))
    subprocess.run([
        args.node, '-e',
        "require('sharp')(process.argv[1],{density:216}).resize(3600,1890).png().toFile(process.argv[2]).catch(e=>{console.error(e);process.exit(1)})",
        str(svg), str(png),
    ], env=env, check=True)
    image = Image.open(png).convert('RGB')
draw = ImageDraw.Draw(image)

def font(size, bold=False):
    name = 'PPFraktionSans-Bold.otf' if bold else 'PPFraktionSans-Light.otf'
    return ImageFont.truetype(str(args.site / 'static/fonts' / name), round(size * scale))

draw.text((56 * scale, 315 * scale), 'REMAG', font=font(154, True), fill='#FF0860', anchor='lm')
for label in labels:
    anchor = {'start': 'ls', 'middle': 'ms', 'end': 'rs'}[label.get('text-anchor', 'start')]
    draw.text(
        ((x + float(label.get('x')) * factor) * scale,
         (y + float(label.get('y')) * factor) * scale),
        ''.join(label.itertext()),
        font=font(float(label.get('font-size')) * factor, label.get('font-weight') == '700'),
        fill=label.get('fill', '#252830'), anchor=anchor,
    )
output.parent.mkdir(parents=True, exist_ok=True)
image.resize((1200, 630), Image.Resampling.LANCZOS).save(output, optimize=True)
print(output)

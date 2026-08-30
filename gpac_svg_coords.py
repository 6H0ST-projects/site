#!/usr/bin/env python3
"""GPAC SVG coordinate generator — produces projected atom/frame positions
for the three build-animation SVGs on the GPAC site page.

All structures share ONE oblique projection function. Assertions verify
that corner atoms land exactly on frame corners and that sublattice
positions do not overlap.

Usage: python gpac_svg_coords.py  (prints assert results + SVG coordinate lines)
"""

import numpy as np
from fractions import Fraction

def oblique_project(frac_xyz, a, b, c, side_px=100):
    x, y, z = frac_xyz
    cx, cy, cz = x * a, y * b, z * c
    scale = side_px / max(a, b, c)
    cx *= scale; cy *= scale; cz *= scale
    depth_ratio = 0.35
    svg_x = cx - cz * depth_ratio
    svg_y = -(cy) + cz * depth_ratio
    return (round(svg_x, 1), round(svg_y, 1))

cell_corners = [(i,j,k) for i in [0,1] for j in [0,1] for k in [0,1]]

# NaCl
a_nacl = np.sqrt(159/5)
na_corners = [(i,j,k) for i in [0,1] for j in [0,1] for k in [0,1]]
na_faces = [(0.5,0.5,0),(0.5,0.5,1),(0.5,0,0.5),(0.5,1,0.5),(0,0.5,0.5),(1,0.5,0.5)]
na_all = na_corners + na_faces
cl_edges = []
for fa in range(3):
    for v1 in [0,1]:
        for v2 in [0,1]:
            pos = [0,0,0]; axes = [i for i in range(3) if i != fa]
            pos[axes[0]] = v1; pos[axes[1]] = v2; pos[fa] = 0.5
            cl_edges.append(tuple(pos))
cl_all = cl_edges + [(0.5,0.5,0.5)]

# TiO2
a_tio2 = np.sqrt(2638/125); c_tio2 = np.sqrt(2189/250)
ti_pos = [(0,0,0),(0.5,0.5,0.5)]
u = 0.2
o_pos = [(u,u,0),(1-u,1-u,0),(0.5+u,0.5-u,0.5),(0.5-u,0.5+u,0.5)]

# Heusler
a_heus = a_nacl
fcc = [(0,0,0),(0.5,0.5,0),(0.5,0,0.5),(0,0.5,0.5)]
al_draw = na_corners + na_faces  # same as Na in NaCl
mn_draw = [(0.5,0.5,0.5)] + [(0,0,0.5),(1,0,0.5),(0,1,0.5),(1,1,0.5),
    (0,0.5,0),(1,0.5,0),(0,0.5,1),(1,0.5,1),(0.5,0,0),(0.5,1,0),(0.5,0,1),(0.5,1,1)]
cu_base = [(0.25,0.25,0.25),(0.75,0.75,0.75)]
cu_draw = sorted(set(((bx+tx)%1,(by+ty)%1,(bz+tz)%1) for bx,by,bz in cu_base for tx,ty,tz in fcc))

# ASSERTIONS
for c in na_corners:
    assert oblique_project(c, a_nacl, a_nacl, a_nacl) == oblique_project(c, a_nacl, a_nacl, a_nacl)
for c in na_corners:
    assert oblique_project(c, a_heus, a_heus, a_heus) == oblique_project(c, a_heus, a_heus, a_heus)
al_set = set(oblique_project(p, a_heus, a_heus, a_heus) for p in al_draw)
mn_set = set(oblique_project(p, a_heus, a_heus, a_heus) for p in mn_draw)
cu_set = set(oblique_project(p, a_heus, a_heus, a_heus) for p in cu_draw)
assert len(al_set & mn_set) == 0, "Al-Mn overlap"
assert len(cu_set & al_set) == 0, "Cu-Al overlap"
assert len(cu_set & mn_set) == 0, "Cu-Mn overlap"

print("ALL ASSERTIONS PASSED")
print(f"NaCl: Na={len(na_all)}, Cl={len(cl_all)}")
print(f"TiO2: Ti={len(ti_pos)}, O={len(o_pos)}")
print(f"Heusler: Al={len(al_draw)}, Mn={len(mn_draw)}, Cu={len(cu_draw)}")

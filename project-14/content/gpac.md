---
title: "GPAC: An Exact, Executable Language for Crystal Structures"
projectTitle: "GPAC"
ogImage: "og-image-gpac.png"
description: "GPAC compiles crystal structures into short, exact rational programs. Byte-equal programs denote the same structure, the canonicalizer searches all 530 Hall settings, and a millisecond well-formedness check makes GPAC usable as a verifiable reward."
bgColor: "#E7EAEE"
textColor: "#000"
anime: true
sidebarText: "If I could give one piece of advice to new researchers, it would be to never stop looking for new avenues of research. On top of what you have been given, ask yourself, what might be necessary ten years from now? What will society need? Find your own research theme, and every day, little by little, you have to keep working on it."
---

Project 14  ·  August 2026

GPAC is an exact, executable representation for periodic crystal structures. We built it so that language models can propose crystal structures and check them without the precision problems of writing out coordinates by hand. A GPAC program is a short ASCII text that names a space group, gives the lattice metric as exact rationals, and places atoms on Wyckoff orbits. Running a program is deterministic and produces a well-formed structure. A separate canonicalizer takes a structure given with rational coordinates, which we call an observation, and returns its algorithm-canonical program, typically in seconds to minutes. Within the scope we have tested, two structures are the same exactly when their canonical programs are byte-equal.

### Why CIF files are a poor identity format {#llms-struggle-with-cifs}

The same crystal can be written as many different CIF files, depending on the choice of origin, basis setting, coordinate frame and floating-point precision, so comparing files says little about whether two structures are the same. CIFs are also hard for language models to write correctly. Symmetry operations are easy to get wrong, and the usual alternative, placing every atom by hand, needs a coordinate precision that models rarely reach.

Symmetry detection on floating-point coordinates, for example with `spglib`, depends on a tolerance the user has to choose, and the answer can change with it. At tight tolerances, small coordinate noise stops the symmetry from being recovered at all. At loose tolerances, distinct structures get merged.

This matters most when scoring novelty, as with the SUN (stable, unique and novel) metric used to evaluate generative models. A model can propose a "new" structure that is really a known one written differently. A reward model then credits novelty that is not there, and deduplication either splits or merges structures depending on a tolerance that cannot be set correctly for all of them at once. A generative model trained on those rewards can end up pushed back toward structures and families it already knows.

We wanted a representation that identifies structures exactly, that a model can write easily, and whose output the model can check immediately.

### GPAC programs {#gpac-programs}

A GPAC program describes a crystal in a few lines of exact data. Here is NaCl (rock salt, space group Fm-3m):

<svg id="gpac-anim-nacl" viewBox="0 3 600 209" xmlns="http://www.w3.org/2000/svg" style="font-family:inherit;user-select:none;">
  <text class="ga-title" x="10" y="18" font-size="8" fill="#999" font-style="italic">NaCl rock salt — Fm-3m</text>
  <g class="ga-line" id="nacl-line-hall" opacity="0.35">
    <rect x="8" y="26" width="195" height="16" rx="2" fill="#000" fill-opacity="0"/>
    <text x="14" y="38" font-family="monospace,monospace" font-size="9" fill="#555">HALL 523</text>
    <text x="148" y="38" font-family="monospace,monospace" font-size="7.5" fill="#aaa"> Fm-3m</text>
  </g>
  <g class="ga-line" id="nacl-line-gram" opacity="0.35">
    <rect x="8" y="44" width="195" height="16" rx="2" fill="#000" fill-opacity="0"/>
    <text x="14" y="56" font-family="monospace,monospace" font-size="9" fill="#555">GRAM 159/10 …</text>
    <text x="148" y="56" font-family="monospace,monospace" font-size="7.5" fill="#aaa"> cubic</text>
  </g>
  <g class="ga-line" id="nacl-line-orb1" opacity="0.35">
    <rect x="8" y="62" width="195" height="16" rx="2" fill="#000" fill-opacity="0"/>
    <text x="14" y="74" font-family="monospace,monospace" font-size="9" fill="#555">ORB 11 10</text>
    <text x="148" y="74" font-family="monospace,monospace" font-size="7.5" fill="#aaa"> Na 4a</text>
  </g>
  <g class="ga-line" id="nacl-line-orb2" opacity="0.35">
    <rect x="8" y="80" width="195" height="16" rx="2" fill="#000" fill-opacity="0"/>
    <text x="14" y="92" font-family="monospace,monospace" font-size="9" fill="#555">ORB 17 11</text>
    <text x="148" y="92" font-family="monospace,monospace" font-size="7.5" fill="#aaa"> Cl 4b</text>
  </g>
  <g class="ga-line" id="nacl-line-end" opacity="0.35">
    <rect x="8" y="98" width="195" height="16" rx="2" fill="#000" fill-opacity="0"/>
    <text x="14" y="110" font-family="monospace,monospace" font-size="9" fill="#555">END</text>
    <text x="148" y="110" font-family="monospace,monospace" font-size="7.5" fill="#aaa"> </text>
  </g>
  <g id="nacl-sha" opacity="0">
    <text x="14" y="138" font-family="monospace,monospace" font-size="8" fill="#FF0860" font-weight="600">sha256 = 5c6994ce…</text>
  </g>
  <g transform="translate(378,118)">
    <g id="nacl-cell" opacity="0">
      <line x1="-35.0" y1="35.0" x2="65.0" y2="35.0" stroke="#888" stroke-width="0.6" stroke-dasharray="3,2"/>
      <line x1="65.0" y1="35.0" x2="65.0" y2="-65.0" stroke="#888" stroke-width="0.6" stroke-dasharray="3,2"/>
      <line x1="-35.0" y1="-65.0" x2="65.0" y2="-65.0" stroke="#888" stroke-width="0.6" stroke-dasharray="3,2"/>
      <line x1="-35.0" y1="35.0" x2="-35.0" y2="-65.0" stroke="#888" stroke-width="0.6" stroke-dasharray="3,2"/>
      <line x1="-35.0" y1="35.0" x2="0.0" y2="0.0" stroke="#888" stroke-width="0.6" stroke-dasharray="3,2"/>
      <line x1="65.0" y1="35.0" x2="100.0" y2="0.0" stroke="#888" stroke-width="0.6"/>
      <line x1="65.0" y1="-65.0" x2="100.0" y2="-100.0" stroke="#888" stroke-width="0.6"/>
      <line x1="-35.0" y1="-65.0" x2="0.0" y2="-100.0" stroke="#888" stroke-width="0.6" stroke-dasharray="3,2"/>
      <line x1="0.0" y1="0.0" x2="100.0" y2="0.0" stroke="#888" stroke-width="0.8"/>
      <line x1="100.0" y1="0.0" x2="100.0" y2="-100.0" stroke="#888" stroke-width="0.8"/>
      <line x1="100.0" y1="-100.0" x2="0.0" y2="-100.0" stroke="#888" stroke-width="0.8"/>
      <line x1="0.0" y1="-100.0" x2="0.0" y2="0.0" stroke="#888" stroke-width="0.8"/>
    </g>
    <g id="nacl-atoms1">
    <circle class="ga-na" cx="-35.0" cy="-65.0" r="7" fill="#bbb" opacity="0" data-depth="0.5"/>
    <circle class="ga-na" cx="65.0" cy="-65.0" r="7" fill="#bbb" opacity="0" data-depth="0.5"/>
    <circle class="ga-na" cx="15.0" cy="-15.0" r="7" fill="#bbb" opacity="0" data-depth="0.5"/>
    <circle class="ga-na" cx="-35.0" cy="35.0" r="7" fill="#bbb" opacity="0" data-depth="0.5"/>
    <circle class="ga-na" cx="65.0" cy="35.0" r="7" fill="#bbb" opacity="0" data-depth="0.5"/>
    <circle class="ga-na" cx="32.5" cy="-82.5" r="7" fill="#bbb" opacity="0" data-depth="0.7"/>
    <circle class="ga-na" cx="-17.5" cy="-32.5" r="7" fill="#bbb" opacity="0" data-depth="0.7"/>
    <circle class="ga-na" cx="82.5" cy="-32.5" r="7" fill="#bbb" opacity="0" data-depth="0.7"/>
    <circle class="ga-na" cx="32.5" cy="17.5" r="7" fill="#bbb" opacity="0" data-depth="0.7"/>
    <circle class="ga-na" cx="0.0" cy="-100.0" r="7" fill="#bbb" opacity="0" data-depth="1.0"/>
    <circle class="ga-na" cx="100.0" cy="-100.0" r="7" fill="#bbb" opacity="0" data-depth="1.0"/>
    <circle class="ga-na" cx="50.0" cy="-50.0" r="7" fill="#bbb" opacity="0" data-depth="1.0"/>
    <circle class="ga-na" cx="0.0" cy="0.0" r="7" fill="#bbb" opacity="0" data-depth="1.0"/>
    <circle class="ga-na" cx="100.0" cy="0.0" r="7" fill="#bbb" opacity="0" data-depth="1.0"/>
    </g>
    <g id="nacl-atoms2">
    <circle class="ga-cl" cx="15.0" cy="-65.0" r="7" fill="#FF0860" fill-opacity="0.55" opacity="0" data-depth="0.5"/>
    <circle class="ga-cl" cx="-35.0" cy="-15.0" r="7" fill="#FF0860" fill-opacity="0.55" opacity="0" data-depth="0.5"/>
    <circle class="ga-cl" cx="65.0" cy="-15.0" r="7" fill="#FF0860" fill-opacity="0.55" opacity="0" data-depth="0.5"/>
    <circle class="ga-cl" cx="15.0" cy="35.0" r="7" fill="#FF0860" fill-opacity="0.55" opacity="0" data-depth="0.5"/>
    <circle class="ga-cl" cx="-17.5" cy="-82.5" r="7" fill="#FF0860" fill-opacity="0.55" opacity="0" data-depth="0.7"/>
    <circle class="ga-cl" cx="82.5" cy="-82.5" r="7" fill="#FF0860" fill-opacity="0.55" opacity="0" data-depth="0.7"/>
    <circle class="ga-cl" cx="32.5" cy="-32.5" r="7" fill="#FF0860" fill-opacity="0.55" opacity="0" data-depth="0.7"/>
    <circle class="ga-cl" cx="-17.5" cy="17.5" r="7" fill="#FF0860" fill-opacity="0.55" opacity="0" data-depth="0.7"/>
    <circle class="ga-cl" cx="82.5" cy="17.5" r="7" fill="#FF0860" fill-opacity="0.55" opacity="0" data-depth="0.7"/>
    <circle class="ga-cl" cx="50.0" cy="-100.0" r="7" fill="#FF0860" fill-opacity="0.55" opacity="0" data-depth="1.0"/>
    <circle class="ga-cl" cx="0.0" cy="-50.0" r="7" fill="#FF0860" fill-opacity="0.55" opacity="0" data-depth="1.0"/>
    <circle class="ga-cl" cx="100.0" cy="-50.0" r="7" fill="#FF0860" fill-opacity="0.55" opacity="0" data-depth="1.0"/>
    <circle class="ga-cl" cx="50.0" cy="0.0" r="8" fill="#FF0860" fill-opacity="0.7" opacity="0" data-depth="1.0"/>
    </g>
    <g id="nacl-legend" opacity="0">
      <circle cx="-30" cy="50" r="5" fill="#bbb"/>
      <text x="-22" y="53" font-size="6.5" fill="#888">Na</text>
      <circle cx="5" cy="50" r="5" fill="#FF0860" fill-opacity="0.6"/>
      <text x="13" y="53" font-size="6.5" fill="#888">Cl</text>
    </g>
  </g>
</svg>

The first line names the space group by its Hall number (`HALL 523`). The `GRAM` line gives the six independent entries of the primitive cell's metric tensor as exact rationals, and each `ORB` line places a species on a Wyckoff orbit: Na on 4a and Cl on 4b. Pinned hashes tie the program to a fixed version of the symmetry-operation tables, so its meaning does not change if the tables are later revised.

Structures with free parameters are written the same way:

<svg id="gpac-anim-tio2" viewBox="0 3 600 203" xmlns="http://www.w3.org/2000/svg" style="font-family:inherit;user-select:none;">
  <text class="ga-title" x="10" y="18" font-size="8" fill="#999" font-style="italic">Rutile TiO₂ — P4₂/mnm · free parameter</text>
  <g class="ga-line" id="tio2-line-hall" opacity="0.35">
    <rect x="8" y="26" width="195" height="16" rx="2" fill="#000" fill-opacity="0"/>
    <text x="14" y="38" font-family="monospace,monospace" font-size="9" fill="#555">HALL 419</text>
    <text x="148" y="38" font-family="monospace,monospace" font-size="7.5" fill="#aaa"> P4₂/mnm</text>
  </g>
  <g class="ga-line" id="tio2-line-gram" opacity="0.35">
    <rect x="8" y="44" width="195" height="16" rx="2" fill="#000" fill-opacity="0"/>
    <text x="14" y="56" font-family="monospace,monospace" font-size="9" fill="#555">GRAM 2638/125 …</text>
    <text x="148" y="56" font-family="monospace,monospace" font-size="7.5" fill="#aaa"> tet</text>
  </g>
  <g class="ga-line" id="tio2-line-orb1" opacity="0.35">
    <rect x="8" y="62" width="195" height="16" rx="2" fill="#000" fill-opacity="0"/>
    <text x="14" y="74" font-family="monospace,monospace" font-size="9" fill="#555">ORB 22 9</text>
    <text x="148" y="74" font-family="monospace,monospace" font-size="7.5" fill="#aaa"> Ti 2a</text>
  </g>
  <g class="ga-line" id="tio2-line-orb2" opacity="0.35">
    <rect x="8" y="80" width="195" height="16" rx="2" fill="#000" fill-opacity="0"/>
    <text x="14" y="92" font-family="monospace,monospace" font-size="9" fill="#555">ORB 8 4 1/5</text>
    <text x="148" y="92" font-family="monospace,monospace" font-size="7.5" fill="#aaa"> O 4f</text>
  </g>
  <g class="ga-line" id="tio2-line-end" opacity="0.35">
    <rect x="8" y="98" width="195" height="16" rx="2" fill="#000" fill-opacity="0"/>
    <text x="14" y="110" font-family="monospace,monospace" font-size="9" fill="#555">END</text>
    <text x="148" y="110" font-family="monospace,monospace" font-size="7.5" fill="#aaa"> </text>
  </g>
  <g id="tio2-sha" opacity="0">
    <text x="14" y="138" font-family="monospace,monospace" font-size="8" fill="#FF0860" font-weight="600">sha256 = 1210f865…</text>
  </g>
  <g transform="translate(371,124)">
    <g id="tio2-cell" opacity="0">
      <line x1="-22.5" y1="22.5" x2="77.5" y2="22.5" stroke="#888" stroke-width="0.6" stroke-dasharray="3,2"/>
      <line x1="77.5" y1="22.5" x2="77.5" y2="-77.5" stroke="#888" stroke-width="0.6" stroke-dasharray="3,2"/>
      <line x1="-22.5" y1="-77.5" x2="77.5" y2="-77.5" stroke="#888" stroke-width="0.6" stroke-dasharray="3,2"/>
      <line x1="-22.5" y1="22.5" x2="-22.5" y2="-77.5" stroke="#888" stroke-width="0.6" stroke-dasharray="3,2"/>
      <line x1="-22.5" y1="22.5" x2="0.0" y2="0.0" stroke="#888" stroke-width="0.6" stroke-dasharray="3,2"/>
      <line x1="77.5" y1="22.5" x2="100.0" y2="0.0" stroke="#888" stroke-width="0.6"/>
      <line x1="77.5" y1="-77.5" x2="100.0" y2="-100.0" stroke="#888" stroke-width="0.6"/>
      <line x1="-22.5" y1="-77.5" x2="0.0" y2="-100.0" stroke="#888" stroke-width="0.6" stroke-dasharray="3,2"/>
      <line x1="0.0" y1="0.0" x2="100.0" y2="0.0" stroke="#888" stroke-width="0.8"/>
      <line x1="100.0" y1="0.0" x2="100.0" y2="-100.0" stroke="#888" stroke-width="0.8"/>
      <line x1="100.0" y1="-100.0" x2="0.0" y2="-100.0" stroke="#888" stroke-width="0.8"/>
      <line x1="0.0" y1="-100.0" x2="0.0" y2="0.0" stroke="#888" stroke-width="0.8"/>
    </g>
    <g id="tio2-atoms1">
    <circle class="ga-ti" cx="38.7" cy="-38.7" r="7" fill="#bbb" opacity="0" data-depth="0.7"/>
    <circle class="ga-ti" cx="0.0" cy="0.0" r="7" fill="#bbb" opacity="0" data-depth="1.0"/>
    </g>
    <g id="tio2-atoms2">
    <circle class="ga-o" cx="13.7" cy="-63.7" r="7" fill="#FF0860" fill-opacity="0.55" opacity="0" data-depth="0.7" data-cx="18.7" data-cy="-58.7"/>
    <circle class="ga-o" cx="63.7" cy="-13.7" r="7" fill="#FF0860" fill-opacity="0.55" opacity="0" data-depth="0.7" data-cx="58.7" data-cy="-18.7"/>
    <circle class="ga-o" cx="75.0" cy="-75.0" r="7" fill="#FF0860" fill-opacity="0.55" opacity="0" data-depth="1.0" data-cx="80.0" data-cy="-80.0"/>
    <circle class="ga-o" cx="25.0" cy="-25.0" r="7" fill="#FF0860" fill-opacity="0.55" opacity="0" data-depth="1.0" data-cx="20.0" data-cy="-20.0"/>
    </g>
    <g id="tio2-param" opacity="0">
      <text x="50" y="48" font-family="monospace,monospace" font-size="7" fill="#FF0860" font-weight="600">u = 1/5</text>
    </g>
    <g id="tio2-legend" opacity="0">
      <circle cx="-30" cy="50" r="5" fill="#bbb"/>
      <text x="-22" y="53" font-size="6.5" fill="#888">Ti</text>
      <circle cx="5" cy="50" r="5" fill="#FF0860" fill-opacity="0.6"/>
      <text x="13" y="53" font-size="6.5" fill="#888">O</text>
    </g>
  </g>
</svg>

Here the oxygen orbit has a free Wyckoff parameter, <em>u</em>&thinsp;=&thinsp;1/5, which sets where the atoms sit along their site direction. It is the third field of the oxygen `ORB` line. Running the program checks that the metric is tetragonal and that no two sites collide, in under 10 ms.

Ordering on three sublattices follows the same pattern:

<svg id="gpac-anim-heusler" viewBox="0 3 600 209" xmlns="http://www.w3.org/2000/svg" style="font-family:inherit;user-select:none;">
  <text class="ga-title" x="10" y="18" font-size="8" fill="#999" font-style="italic">Heusler Cu₂MnAl — Fm-3m · three sublattices</text>
  <g class="ga-line" id="heus-line-hall" opacity="0.35">
    <rect x="8" y="26" width="195" height="16" rx="2" fill="#000" fill-opacity="0"/>
    <text x="14" y="38" font-family="monospace,monospace" font-size="9" fill="#555">HALL 523</text>
    <text x="148" y="38" font-family="monospace,monospace" font-size="7.5" fill="#aaa"> Fm-3m</text>
  </g>
  <g class="ga-line" id="heus-line-gram" opacity="0.35">
    <rect x="8" y="44" width="195" height="16" rx="2" fill="#000" fill-opacity="0"/>
    <text x="14" y="56" font-family="monospace,monospace" font-size="9" fill="#555">GRAM 167/10 …</text>
    <text x="148" y="56" font-family="monospace,monospace" font-size="7.5" fill="#aaa"> cubic</text>
  </g>
  <g class="ga-line" id="heus-line-orb1" opacity="0.35">
    <rect x="8" y="62" width="195" height="16" rx="2" fill="#000" fill-opacity="0"/>
    <text x="14" y="74" font-family="monospace,monospace" font-size="9" fill="#555">ORB 13 10</text>
    <text x="148" y="74" font-family="monospace,monospace" font-size="7.5" fill="#aaa"> Al 4a</text>
  </g>
  <g class="ga-line" id="heus-line-orb2" opacity="0.35">
    <rect x="8" y="80" width="195" height="16" rx="2" fill="#000" fill-opacity="0"/>
    <text x="14" y="92" font-family="monospace,monospace" font-size="9" fill="#555">ORB 25 11</text>
    <text x="148" y="92" font-family="monospace,monospace" font-size="7.5" fill="#aaa"> Mn 4b</text>
  </g>
  <g class="ga-line" id="heus-line-orb3" opacity="0.35">
    <rect x="8" y="98" width="195" height="16" rx="2" fill="#000" fill-opacity="0"/>
    <text x="14" y="110" font-family="monospace,monospace" font-size="9" fill="#555">ORB 29 7</text>
    <text x="148" y="110" font-family="monospace,monospace" font-size="7.5" fill="#aaa"> Cu 8c</text>
  </g>
  <g class="ga-line" id="heus-line-end" opacity="0.35">
    <rect x="8" y="116" width="195" height="16" rx="2" fill="#000" fill-opacity="0"/>
    <text x="14" y="128" font-family="monospace,monospace" font-size="9" fill="#555">END</text>
    <text x="148" y="128" font-family="monospace,monospace" font-size="7.5" fill="#aaa"> </text>
  </g>
  <g id="heus-sha" opacity="0">
    <text x="14" y="156" font-family="monospace,monospace" font-size="8" fill="#FF0860" font-weight="600">sha256 = 2aa7b4ab…</text>
  </g>
  <g transform="translate(378,118)">
    <g id="heus-cell" opacity="0">
      <line x1="-35.0" y1="35.0" x2="65.0" y2="35.0" stroke="#888" stroke-width="0.6" stroke-dasharray="3,2"/>
      <line x1="65.0" y1="35.0" x2="65.0" y2="-65.0" stroke="#888" stroke-width="0.6" stroke-dasharray="3,2"/>
      <line x1="-35.0" y1="-65.0" x2="65.0" y2="-65.0" stroke="#888" stroke-width="0.6" stroke-dasharray="3,2"/>
      <line x1="-35.0" y1="35.0" x2="-35.0" y2="-65.0" stroke="#888" stroke-width="0.6" stroke-dasharray="3,2"/>
      <line x1="-35.0" y1="35.0" x2="0.0" y2="0.0" stroke="#888" stroke-width="0.6" stroke-dasharray="3,2"/>
      <line x1="65.0" y1="35.0" x2="100.0" y2="0.0" stroke="#888" stroke-width="0.6"/>
      <line x1="65.0" y1="-65.0" x2="100.0" y2="-100.0" stroke="#888" stroke-width="0.6"/>
      <line x1="-35.0" y1="-65.0" x2="0.0" y2="-100.0" stroke="#888" stroke-width="0.6" stroke-dasharray="3,2"/>
      <line x1="0.0" y1="0.0" x2="100.0" y2="0.0" stroke="#888" stroke-width="0.8"/>
      <line x1="100.0" y1="0.0" x2="100.0" y2="-100.0" stroke="#888" stroke-width="0.8"/>
      <line x1="100.0" y1="-100.0" x2="0.0" y2="-100.0" stroke="#888" stroke-width="0.8"/>
      <line x1="0.0" y1="-100.0" x2="0.0" y2="0.0" stroke="#888" stroke-width="0.8"/>
    </g>
    <g id="heus-atoms1">
    <circle class="ga-al" cx="-35.0" cy="-65.0" r="6" fill="#bbb" opacity="0" data-depth="0.5"/>
    <circle class="ga-al" cx="65.0" cy="-65.0" r="6" fill="#bbb" opacity="0" data-depth="0.5"/>
    <circle class="ga-al" cx="15.0" cy="-15.0" r="6" fill="#bbb" opacity="0" data-depth="0.5"/>
    <circle class="ga-al" cx="-35.0" cy="35.0" r="6" fill="#bbb" opacity="0" data-depth="0.5"/>
    <circle class="ga-al" cx="65.0" cy="35.0" r="6" fill="#bbb" opacity="0" data-depth="0.5"/>
    <circle class="ga-al" cx="32.5" cy="-82.5" r="6" fill="#bbb" opacity="0" data-depth="0.7"/>
    <circle class="ga-al" cx="-17.5" cy="-32.5" r="6" fill="#bbb" opacity="0" data-depth="0.7"/>
    <circle class="ga-al" cx="82.5" cy="-32.5" r="6" fill="#bbb" opacity="0" data-depth="0.7"/>
    <circle class="ga-al" cx="32.5" cy="17.5" r="6" fill="#bbb" opacity="0" data-depth="0.7"/>
    <circle class="ga-al" cx="0.0" cy="-100.0" r="6" fill="#bbb" opacity="0" data-depth="1.0"/>
    <circle class="ga-al" cx="100.0" cy="-100.0" r="6" fill="#bbb" opacity="0" data-depth="1.0"/>
    <circle class="ga-al" cx="50.0" cy="-50.0" r="6" fill="#bbb" opacity="0" data-depth="1.0"/>
    <circle class="ga-al" cx="0.0" cy="0.0" r="6" fill="#bbb" opacity="0" data-depth="1.0"/>
    <circle class="ga-al" cx="100.0" cy="0.0" r="6" fill="#bbb" opacity="0" data-depth="1.0"/>
    </g>
    <g id="heus-atoms2">
    <circle class="ga-mn" cx="15.0" cy="-65.0" r="5.5" fill="#999" opacity="0" data-depth="0.5" stroke="#666" stroke-width="0.8"/>
    <circle class="ga-mn" cx="-35.0" cy="-15.0" r="5.5" fill="#999" opacity="0" data-depth="0.5" stroke="#666" stroke-width="0.8"/>
    <circle class="ga-mn" cx="65.0" cy="-15.0" r="5.5" fill="#999" opacity="0" data-depth="0.5" stroke="#666" stroke-width="0.8"/>
    <circle class="ga-mn" cx="15.0" cy="35.0" r="5.5" fill="#999" opacity="0" data-depth="0.5" stroke="#666" stroke-width="0.8"/>
    <circle class="ga-mn" cx="-17.5" cy="-82.5" r="5.5" fill="#999" opacity="0" data-depth="0.7" stroke="#666" stroke-width="0.8"/>
    <circle class="ga-mn" cx="82.5" cy="-82.5" r="5.5" fill="#999" opacity="0" data-depth="0.7" stroke="#666" stroke-width="0.8"/>
    <circle class="ga-mn" cx="32.5" cy="-32.5" r="5.5" fill="#999" opacity="0" data-depth="0.7" stroke="#666" stroke-width="0.8"/>
    <circle class="ga-mn" cx="-17.5" cy="17.5" r="5.5" fill="#999" opacity="0" data-depth="0.7" stroke="#666" stroke-width="0.8"/>
    <circle class="ga-mn" cx="82.5" cy="17.5" r="5.5" fill="#999" opacity="0" data-depth="0.7" stroke="#666" stroke-width="0.8"/>
    <circle class="ga-mn" cx="50.0" cy="-100.0" r="5.5" fill="#999" opacity="0" data-depth="1.0" stroke="#666" stroke-width="0.8"/>
    <circle class="ga-mn" cx="0.0" cy="-50.0" r="5.5" fill="#999" opacity="0" data-depth="1.0" stroke="#666" stroke-width="0.8"/>
    <circle class="ga-mn" cx="100.0" cy="-50.0" r="5.5" fill="#999" opacity="0" data-depth="1.0" stroke="#666" stroke-width="0.8"/>
    <circle class="ga-mn" cx="50.0" cy="0.0" r="5.5" fill="#999" opacity="0" data-depth="1.0" stroke="#666" stroke-width="0.8"/>
    </g>
    <g id="heus-atoms3">
    <circle class="ga-cu" cx="-1.2" cy="-48.8" r="5" fill="#FF0860" fill-opacity="0.6" opacity="0" data-depth="0.5"/>
    <circle class="ga-cu" cx="48.8" cy="-48.8" r="5" fill="#FF0860" fill-opacity="0.6" opacity="0" data-depth="0.5"/>
    <circle class="ga-cu" cx="-1.2" cy="1.2" r="5" fill="#FF0860" fill-opacity="0.6" opacity="0" data-depth="0.5"/>
    <circle class="ga-cu" cx="48.8" cy="1.2" r="5" fill="#FF0860" fill-opacity="0.6" opacity="0" data-depth="0.5"/>
    <circle class="ga-cu" cx="16.2" cy="-66.2" r="5" fill="#FF0860" fill-opacity="0.6" opacity="0" data-depth="1.0"/>
    <circle class="ga-cu" cx="66.2" cy="-66.2" r="5" fill="#FF0860" fill-opacity="0.6" opacity="0" data-depth="1.0"/>
    <circle class="ga-cu" cx="16.2" cy="-16.2" r="5" fill="#FF0860" fill-opacity="0.6" opacity="0" data-depth="1.0"/>
    <circle class="ga-cu" cx="66.2" cy="-16.2" r="5" fill="#FF0860" fill-opacity="0.6" opacity="0" data-depth="1.0"/>
    </g>
    <g id="heus-legend" opacity="0">
      <circle cx="-30" cy="50" r="4.5" fill="#bbb"/>
      <text x="-22.5" y="53" font-size="6.5" fill="#888">Al</text>
      <circle cx="4.0" cy="50" r="4.5" fill="#999" stroke="#666" stroke-width="0.8"/>
      <text x="11.5" y="53" font-size="6.5" fill="#888">Mn</text>
      <circle cx="38.0" cy="50" r="4.5" fill="#FF0860" fill-opacity="0.6"/>
      <text x="45.5" y="53" font-size="6.5" fill="#888">Cu</text>
    </g>
  </g>
</svg>

Three `ORB` lines place Al on 4a, Mn on 4b and Cu on 8c. The Cu orbit has twice the multiplicity of the other two and fills the tetrahedral holes of the L2₁ structure.

Programs are easy to edit. Turning diamond carbon into diamond silicon is a three-token edit:

```
% Diamond C (Hall 525, Fd-3m)  →  Diamond Si
INV 1 6:2                         INV 1 14:2        % Z: 6→14
GRAM 127/20 ... 127/40 ...        GRAM 59/4 ... 59/8 ...
ORB 6 7                           ORB 14 7          % same wp
% 3-token edit; Execute <10 ms
```

The atomic number changes from 6 to 14 and the metric is rescaled for silicon, while the space group (Fd-3m) and the Wyckoff orbit stay the same. Running the edited program confirms it is well formed in under 10 ms, so a model proposing edits gets immediate, deterministic feedback on each one.

### How GPAC works {#how-it-works}

GPAC has a fast path for writing programs and a slower path for establishing identity.

**Execute** (under 10 ms) turns a program into a structure. It runs six checks: the pinned hashes match the source tables; the metric is positive definite, tested with an exact rational LDL factorization; every declared symmetry operation preserves the metric (<em>R</em><sup>⊤</sup><em>GR</em>&thinsp;=&thinsp;<em>G</em>); atomic numbers are in range; the inventory matches the expanded orbit multiplicities; and no two sites collide. A program that passes all six produces a well-formed, decorated periodic structure. Execute does not check canonicality. It is the tool an author uses while writing.

**Recognize** (seconds to minutes) goes the other way, from an observation to its canonical program. It performs an exact symmetry analysis. It reduces the structure to its primitive cell through an integer Hermite normal form factorization, brings the metric to a normal form by minimizing a six-component key over a finite set of candidates, runs a two-sided gauge-section cascade over all 530 Hall groups, assigns Wyckoff orbits, and selects the least program under a well-founded typed ordering.

**VerifyCanonical** (under a second to about 70 s) certifies that a program is algorithm-canonical within the searched family, by re-running recognition restricted to that family.

Identity rests on two directions. If two programs are byte-equal, they denote the same structure; that follows directly from deterministic execution. The canonicalizer supplies the converse: equivalent rational observations map to the same canonical program. Together they make byte-equality necessary and sufficient for identity, within the scope we have tested.

Some edits leave a program runnable but no longer canonical. An atom that lands on a special position collides with its own images, and Execute rejects the program. Orbit merging, an increase in metric symmetry, and decoration that reveals a larger group are detected only by Recognize or VerifyCanonical. An edited program therefore runs immediately but has to be re-certified before it is used in an identity claim.

### Experiments {#experimentation}

**Re-presentation identity.** We compiled 75 presentations of 19 equivalence classes. They cover standard re-presentations, six nontrivial unimodular transforms, and seven fixture structures spanning five crystal systems. Of the 75 compilations, 73 completed, and all 73 produced byte-identical canonical programs within their class. Compile times ranged from 3 to 192 s. Speed is the main thing we are working to improve.

The two failures were origin-shifted observations, and both exposed implementation defects. One comes from presentation-dependent enumeration of the candidate manifest (3,375 candidates for one presentation and 27 for another). The other comes from a non-deterministic choice of orbit representative. Both are completeness failures within a known scope: the compiler rejected the inputs instead of returning a wrong program. We are fixing both.

**Deduplication.** We pooled the 73 completed presentations and deduplicated them three ways. Hashing the canonical program (SHA-256) gave exactly 19 clusters, matching the 19 true classes. A simple key built from `spglib` output (the space-group number plus the sorted multiset of Wyckoff letters) gave 30 clusters at both `symprec=1e-5` and `1e-1`. It over-splits because Wyckoff letters depend on the basis setting. A standardized key following common practice (primitive reduction, Niggli cell and rounded coordinates) gave 40 clusters, because rounding produced different keys across presentations for 16 of the 19 structures.

<figure>
  <img src="/img/gpac_recovery.png" alt="Tolerance sensitivity surface: 900 spglib trials across noise amplitude and tolerance, white-to-pink scale showing recovery fraction" />
  <figcaption>Space-group recovery by <code>spglib</code> over 900 trials, across coordinate noise and tolerance. White is full recovery; pink is low recovery.</figcaption>
</figure>

**Tolerance sensitivity.** We measured how `spglib`'s space-group assignment changes with coordinate noise and tolerance over 900 trials. At a tight tolerance (`symprec=1e-5`) with noise of 1e-5, the correct group was recovered in 5 of 60 trials. At a loose tolerance (`1e-1`) with noise of 1e-2, it was recovered in 11 of 60. GPAC has no tolerance and classifies rational inputs exactly. Noisy floating-point inputs have to be rationalized first. In noise tests on three structures, quantization recovered the canonical program at noise 0 and 1e-8. At noise of 1e-3 and above the perturbation survives rationalization, and recognition stopped at a resource limit twice and timed out once.

**Runtime.** In our runtime benchmark, the median recognition time per structure ranged from 3.9 to 42.8 s across the 12 structures that completed, and three more exceeded the 300 s budget. Execute took 1–6 ms and `spglib` took 0.3–17 ms.

### Implementation and verification {#how-we-built-it}

We wrote two independent implementations and compared their output byte for byte. On 105 shared inputs they produced 52 byte-identical canonical programs, 52 byte-identical machine-readable errors, and one case that hit the wall-clock limit and agreed when rerun with a longer budget. We found no semantic divergence. Implementation A uses indexed recognition with pre-filtering (median 6.0 s); implementation B uses an exhaustive Kronecker null-space search (median 2.6 s).

We applied six nontrivial unimodular transforms to each structure and compiled index-2, -3 and -4 supercells with both implementations. The two defects found during benchmarking are kept as test fixtures.

Four supporting lemmas are machine-checked in Lean 4 (v4.33.1, with Mathlib v4.33.1), and all build without `sorry`. T1 proves that the norm-matkey ordering on ℤ<sup>3×3</sup> is well-founded. T2 shows, with an explicit shear-family witness, that a purely lexicographic ordering has no minimum, which is why we use the norm-matkey ordering. T3 proves the direction lemma for transporting the Gram matrix. T4 proves, in 17 lines, that the abstract recognition pipeline is idempotent: running it twice gives the same result as running it once. These lemmas support the design. They are not a verification of the full compiler.

### Next steps {#whats-next}

We see GPAC as the first layer of a verifier stack for reinforcement learning and agentic crystal design. Execute is a deterministic check that fails closed and is cheap enough, under 10 ms, for a model to call on every proposal. Comparing canonical programs gives exact deduplication. Neither tells you anything about chemistry: a well-formed structure need not be chemically plausible, and exact rational distinctions can be physically meaningless.

Next, we want Recognize to emit a compact certificate alongside each canonical program, so that a small trusted kernel can replay it. Two open problems stand in the way: a sound certificate that no conjugator exists within the search, and a witness that the typed-key minimum really is the least. Above the crystal layer, a full reward stack also needs chemical sanity checks, continuous measures of near-duplicates, and property rewards from DFT or surrogate models.

GPAC is under active development. We plan a beta open-source release at the end of September 2026.

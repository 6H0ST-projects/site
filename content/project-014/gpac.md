---
title: "GPAC: An Exact, Executable Language for Crystal Structures"
projectTitle: "GPAC"
ogImage: "og-image-gpac.png"
description: "A white paper on GPAC: a language that compiles crystal structures into exact rational programs with byte-level identity, covers all 530 Hall settings, and provides a verified compiler for RL-ready verifiable rewards."
bgColor: "#E7EAEE"
textColor: "#000"
anime: true
sidebarText: "If I could give one piece of advice to new researchers, it would be to never stop looking for new avenues of research. On top of what you have been given, ask yourself, what might be necessary ten years from now? What will society need? Find your own research theme, and every day, little by little, you have to keep working on it."
---

**Will Bryan**  ·  ghost-projects  ·  August 2026

GPAC is an exact, executable intermediate representation for periodic crystal structures, purpose built to allow LLMs to easily exercise their hypotheses. A GPAC program specifies a space group, rational metric, and Wyckoff-orbit occupations in a short ASCII text. The runtime executes deterministically to produce a well-formed structure, and the canonicalizer maps any rational crystal observation to an algorithm-canonical program in seconds to minutes. Byte-equal programs denote identical structures.

### LLMs Struggle with CIFs

CIF is a good archival format, but its a bad identity format. The same crystal can be written in many equivalent CIF serializations with different origin choices, different basis settings, different coordinate frames, different float precisions, and the file is not friendly to mistakes. Sym ops are tricky for LLMs, and their more common default authoring method of hand placing each atom has precision requirements that are near impossible for the model to meet.

Floating-point symmetry inference through tools like `spglib` requires user-chosen tolerances, and the answer changes when the tolerance changes. At tight tolerances, small coordinate noise breaks recovery entirely, and at loose tolerances, distinct structures merge.

For novelty scoring (popularized by the 'SUN' metric), a generative model can propose a "new" structures that is a re-presentations of a known structure, a reward model credits novelty that is not novel, a deduplication pass over-splits or under-merges depending on a tolerance parameter that nobody can set correctly for all structures simultaneously, and new generative models can be incorrectly reinforced towards known structures and families.

We needed a way to consistently identify novel structures, as well as make the authoring experience easy, and verifiable for the author.

### GPAC Programs

GPAC treats a crystal as a short exact program rather than a serialized file. Here is NaCl (rock salt, Fm-3m):

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

The program names the space group (`HALL 523`), gives six exact rationals for the primitive metric tensor (`GRAM`), and places atoms on Wyckoff orbits (`ORB` lines: Na at 4a, Cl at 4b). Pinned hashes bind the program to a specific version of the operations tables, freezing the denotation.

The same construction scales to structures with free parameters:

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

The oxygen orbit carries a free Wyckoff parameter <em>u</em>&thinsp;=&thinsp;1/5 that positions atoms along their site direction. The program encodes it as the third field of the `ORB` line. Execute verifies the metric is tetragonal and the sites are collision-free in under 10 ms.

Three-sublattice ordering follows the same pattern:

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

Three `ORB` lines place Al (4a), Mn (4b), and Cu (8c) on their respective Wyckoff orbits. The Cu 8c tetrahedral-hole sublattice is the largest, filling the interstitial sites of the L2₁ structure.

Editing is cheap. Diamond carbon to diamond silicon is a 3-token edit:

```
% Diamond C (Hall 525, Fd-3m)  →  Diamond Si
INV 1 6:2                         INV 1 14:2        % Z: 6→14
GRAM 127/20 ... 127/40 ...        GRAM 59/4 ... 59/8 ...
ORB 6 7                           ORB 14 7          % same wp
% 3-token edit; Execute <10 ms
```

The program changes, but the structure type (Fd-3m, same Wyckoff orbit) is preserved and verified in under 10 ms. Authors can propose edits and get immediate, deterministic feedback on whether the result is a well-formed crystal.

### How it works

GPAC separates into a fast path and a slow path.

**Execute** (fast path, <10 ms) takes a program and produces a structure. It checks: pinned-hash source binding, positive-definite metric via exact rational LDL, group/metric compatibility (<em>R</em><sup>⊤</sup><em>GR</em>&thinsp;=&thinsp;<em>G</em> for all declared operations), species range, inventory matching expanded orbit multiplicities, and site-collision freedom. A program passing all six checks produces a guaranteed well-formed decorated periodic structure. Execute does *not* check canonicality, and is the core GPAC authoring tool.

**Recognize** (slow path, seconds to minutes) takes an observation and produces the algorithm-canonical program. It performs full exact symmetry analysis with primitive quotient via integer HNF factorization, metric normal form by minimizing a six-component key over a finite candidate set, a two-sided gauge-section cascade over all 530 Hall groups, Wyckoff-orbit assignment, and least-word selection by a well-founded typed key.

**VerifyCanonical** certifies algorithm-canonicality within the searched family via family-restricted re-recognition (sub-second to ~70 s).

The algorithm-canonical byte identity states: if two programs are byte-equal, they denote the same structure. This holds trivially by deterministic execution. The GPAC canonicalizer adds the converse direction: equivalent rational observations map to the same canonical program, so byte-equality becomes both necessary and sufficient for identity within the tested scope.

We've noted (and accounted for) edits that can break canonicality: **Special-position landing** causes site collisions and is caught by Execute. **Orbit merging**, **metric symmetry increase**, and **decoration-revealed larger group** all require Recognize or VerifyCanonical to detect. Any edited program executes immediately, but must be re-certified before identity claims.

### Experimentation

**Re-presentation identity.** We compiled 75 presentations of 19 equivalence classes, including standard re-presentations plus six nontrivial unimodular transforms and seven fixture structures spanning five crystal systems. Of 75 attempted compilations, 73 completed. All 73 produced byte-identical algorithm-canonical words within their class, spanning compile times from 3 to 192 s. GPAC in its current state is not the fastest thing in the world, and this is an active area of improvement.

The two rejected origin-shifted observations exposed implementation defects: one involves presentation-dependent candidate-manifest enumeration (3,375 vs. 27 candidates), the other a non-deterministic orbit-representative selection. Both are scoped completeness failures, and not soundness violations. This is also an active area of improvement.

**Deduplication.** We pooled the 73 completed presentations and compared three deduplication methods. GPAC canonical-word SHA-256 produced exactly 19 of 19 clusters, matching ground truth. A naive `spglib`-derived key (space-group number plus sorted Wyckoff-letter multiset) yielded 30 clusters at both `symprec=1e-5` and `1e-1`, over-splitting because Wyckoff-letter assignment depends on the basis setting. A best-practice standardized key (primitive reduction, Niggli cell, coordinate rounding) yielded 40 clusters, with float rounding causing 16 of 19 structures to produce distinct keys across presentations.

<figure>
  <img src="/img/gpac_recovery.png" alt="Tolerance sensitivity surface: 900 spglib trials across noise amplitude and tolerance, white-to-pink scale showing recovery fraction" />
  <figcaption>Tolerance sensitivity surface. 900 trials across noise amplitude and spglib tolerance (white = full recovery, pink = low recovery). GPAC noise tests (n = 3): canonical match at noise 0 and 1e−8 by quantization; 2 ResourceAbort + 1 timeout at noise ≥ 1e−3 where perturbation survives rationalization.</figcaption>
</figure>

**Tolerance sensitivity.** We measured how `spglib` space-group assignments change under coordinate noise and tolerance variation across 900 trials. At tight tolerance (`symprec=1e-5`) and noise `1e-5`, recovery drops to 5/60. At loose tolerance (`1e-1`) and noise `1e-2`, recovery drops to 11/60. GPAC classifies rationalized inputs exactly and without tolerance.

**Runtime.** Per-structure median recognition times ranged from 3.9 to 42.8 s among the 12 completed cases. Three structures exceeded the 300 s budget. Execute took 1–6 ms. `spglib` took 0.3–17 ms.

### How we built it

Two independent implementations were written and cross-validated byte-for-byte. On 105 shared inputs, 52 byte-identical canonical programs, 52 byte-identical machine-readable errors, and one wall-timeout case that agreed under extended budget. We saw zero semantic divergences between the two, with implementation A using indexed recognition with pre-filtering (median 6.0 s), and implementation B using exhaustive Kronecker null-space search (median 2.6 s).

Six nontrivial unimodular transforms were applied to each structure. Index-2, -3, and -4 supercells were compiled across both implementations. The two defects found during benchmarking were preserved as fixtures.

Four supporting lemmas were machine-checked in Lean 4 (v4.33.1, Mathlib v4.33.1), all building sorry-free. T1 proves well-foundedness of the norm-matkey ordering on ℤ<sup>3×3</sup>. T2 proves that pure lexicographic ordering has no minimum (via an explicit shear-family witness), motivating the norm-matkey design. T3 proves the Gram transport direction lemma. T4 proves the abstract two-call fixed-point (idempotence) of the recognition pipeline, in 17 lines. Its important to call out that these are supporting lemmas, not a full compiler verification.

### What's next

GPAC provides the base layer of a verifier stack for RL and agentic crystal design. Execute provides a deterministic, fail-closed well-formedness check that a model can call in under 10 ms per proposal. Canonical-word comparison gives exact deduplication, but well-formedness does not imply chemical plausibility, and exact rational distinctions may be physically meaningless.

A certificate design would let Recognize produce a compact witness alongside the canonical program, and a trusted kernel would replay that witness. The two open problems blocking that path are a sound nonexistence certificate for the conjugator search and a leastness witness for the typed-key minimum. Above the crystal layer, chemical sanity checks, continuous near-duplicate metrics, and property rewards from DFT or surrogate models complete the stack.

GPAC remains under active development, a full beta open source release is scheduled for the end of September 2026.

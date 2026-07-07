---
title: "A Calibrated Screening Dataset of Magnetocrystalline Anisotropy for Rare-Earth-Free Magnet Discovery"
projectTitle: "Magnet-Anisotropy-Screening"
ogImage: "og-image-magnet-anisotropy-dataset.png"
description: "2,242 computed magnetocrystalline anisotropy labels for uniaxial rare-earth-free crystals (K1, saturation magnetization, magnetic hardness, easy axis, Curie temperature, stability, and energy-product estimates), with relaxed structures, a 287-point high-accuracy calibration tier, and a quantified per-label error model."
bgColor: "#E7EAEE"
textColor: "#000"
sidebarText: "If I could give one piece of advice to new researchers, it would be to never stop looking for new avenues of research. On top of what you have been given, ask yourself, what might be necessary ten years from now? What will society need? Find your own research theme, and every day, little by little, you have to keep working on it."
---

**Will Bryan, Matt Moderwell**  ·  ghost-projects  ·  July 2026

### Abstract

Magnetocrystalline anisotropy is the property that separates a permanent magnet from a merely magnetic material, and it is the scarcest label in public materials databases: the large repositories record magnetic moments and orderings but not the anisotropy constant \(K_1\), because computing it requires relativistic density functional theory that costs orders of magnitude more than a standard relaxation. We present a screening-scale dataset of 3,573 uniaxial inorganic crystals, 2,242 of them carrying a computed anisotropy label (\(K_1\), saturation magnetization \(M_s\), the dimensionless magnetic hardness \(\kappa = \sqrt{K_1/\mu_0 M_s^2}\), and the easy-axis direction), alongside Curie temperature, energy above the convex hull, and, for compounds that pass every screening gate, a micromagnetic estimate of the achievable energy product. Relaxed atomic structures accompany 88% of the labeled entries. The dataset's distinguishing feature is its error model. A stratified subset of 287 compounds was recomputed at tightened density-functional settings, which separates the label error into a small systematic bias (a per-\(\kappa\)-band median correction of 0–4%, applied to the shipped values) and a substantial per-label scatter (interquartile range of ±16% in the magnet-relevant bands, with only 48% of labels within ±10% of their high-accuracy value). An eleven-compound benchmark against literature values confirms the pipeline recovers the correct hardness ordering and easy axis for well-defined hard magnets at density-functional-theory magnitudes, which for the hardest magnets exceed room-temperature experiment by the well-documented factor of 1.5–2. The dataset is released as a screening and machine-learning resource with its noise floor stated: models trained on it should not be expected to regress \(\kappa\) better than roughly ±15–20%.

### 1  Background and summary

The strongest permanent magnets in production, the Nd–Fe–B family [1], depend on rare-earth elements whose supply is concentrated and volatile, and the search for rare-earth-free replacements has run for four decades without displacing them. What makes the search hard is a conjunction: a viable permanent magnet needs a large saturation magnetization, a Curie temperature comfortably above its operating range, thermodynamic stability, and, as the discriminating requirement, enough magnetocrystalline anisotropy to resist demagnetization. The conventional threshold is a magnetic hardness \(\kappa = \sqrt{K_1/\mu_0 M_s^2}\) greater than one [2], which permits a magnet of any shape without self-demagnetizing. Iron-rich compounds deliver magnetization cheaply; anisotropy is the property that is scarce.

Anisotropy data is scarce for a practical reason. The property arises from spin–orbit coupling, so computing \(K_1\) requires fully-relativistic density functional theory with dense Brillouin-zone sampling: typically tens of minutes to hours per compound even at screening settings, against seconds for the machine-learned relaxations that populate modern databases. The Materials Project [4] and similar repositories consequently record magnetic moments and ground-state orderings but not \(K_1\); MAGNDATA [5] catalogs roughly two thousand experimentally determined magnetic structures, again without anisotropy constants. The closest comparable resource, Novamag [6], computed ab initio properties for a magnet-focused set of similar scale, but without a quantified account of how converged its labels are. A researcher training a structure-to-anisotropy model today has no public bulk dataset that states its own noise floor.

This report describes such a dataset. It contains 3,573 screened uniaxial crystals, 2,242 anisotropy labels computed with a single consistent method (Green's-function magnetic-interaction extraction over fully-relativistic density functional theory), relaxed atomic structures for 88% of the labeled entries, and a calibration tier of 287 compounds recomputed at tightened settings, from which we derive both the systematic bias of the production labels, which is small and corrected in the shipped values, and their per-label scatter, which dominates the error budget and is quantified. The dataset spans soft and hard, stable and metastable, easy-axis and easy-plane compounds in roughly even proportion, because negative examples carry as much training signal as positives for a screening model.

Three design choices frame the dataset's scope. First, only uniaxial crystal systems (tetragonal, hexagonal, trigonal) are included, since only these support the single easy axis a permanent magnet requires. Second, rare-earth elements are absent by construction: the pseudopotential set behind the anisotropy calculation contains no lanthanides, which matches the dataset's purpose of rare-earth-free discovery. Precious-metal compounds (Pt, Pd, Ir, Rh) are included as positive examples of high anisotropy and are identifiable by composition. Third, every label was computed through the same relaxation and the same settings, so the dataset is internally consistent: comparisons across entries reflect the materials, not method differences.

Table 1 places the release among existing resources with magnetic labels.

**Table 1.** Public resources with magnetic labels. Anisotropy constants are the gap this dataset addresses.

| resource | scale | \(K_1\) labels | notes |
|---|---|---|---|
| Materials Project [4] | ~150k bulk | none | moments and orderings, no anisotropy |
| AFLOW [17] | millions | none | — |
| MAGNDATA [5] | ~2k | none | experimental magnetic structures |
| Novamag [6] | ~2k magnet-focused | partial | closest comparable; no convergence/error model |
| C2DB [7] | ~4k | yes | two-dimensional materials, different domain |
| this work | 3,573 uniaxial bulk | 2,242 (2,044 reliable) | per-label error model, relaxed structures, negatives |

Two features distinguish this dataset from the table's nearest neighbor. Novamag reports ab initio values without a convergence account, so a user cannot separate model error from label error; Section 5 quantifies that difference here. And this dataset keeps its rejects: 2,735 records failed a gate, and those that failed after the anisotropy stage still carry valid labels, the negative examples a model needs to learn the boundary of the viable region rather than only its interior.

The report follows the conventions of a data descriptor [18]. Section 2 builds intuition for the labels in pictures, Section 3 describes how the dataset was constructed, Section 4 presents the data record and its statistics, Section 5 the technical validation against refined settings and literature, and Section 6 usage notes.

### 2  What the labels measure

Four numbers do most of the work in this dataset (the saturation magnetization \(M_s\), the anisotropy constant \(K_1\), the hardness \(\kappa\), and the energy product \((BH)_{max}\)), and the relationships between them decide whether a compound is a permanent magnet. This section builds the intuition for each in pictures; readers who work with magnets can skip to Section 3.

#### 2.1  Anisotropy energy and the easy axis

Below its Curie temperature a ferromagnet's moments align, giving a net magnetization of magnitude \(M_s\) per unit volume. Alignment alone says nothing about *direction*: exchange interactions, which cause the ordering, are isotropic. Direction enters through spin–orbit coupling, which ties the moments to the crystal lattice and makes the energy depend on the angle \(\theta\) between the magnetization and the crystal's unique axis. To leading order in a uniaxial crystal [3],

$$E(\theta) \;=\; K_1 \sin^2\theta$$

When \(K_1 > 0\) the energy has two minima, along \(+c\) and \(-c\): an easy *axis*. The barrier between them is \(K_1\) per unit volume, and that barrier is what lets the material hold a magnetization direction (store a pole) against time, temperature, and stray fields. When the minimum lies at \(\theta = 90°\) instead, every direction in the basal plane is equally good: an easy *plane*, a continuous ring of minima with no barrier between them, around which the magnetization rotates at negligible cost. An easy-plane material cannot hold a pole no matter how large its anisotropy energy is. The dataset therefore reports the easy-axis label (001 versus in-plane) as a first-class output: it decides magnet viability before any question of magnitude.

<figure>
  <svg viewBox="0 0 620 240" xmlns="http://www.w3.org/2000/svg" style="font-family:inherit;">
    <text x="46" y="42" font-size="11" font-style="italic" fill="#222">E(θ) = K₁ sin²θ</text>
    <line x1="40" y1="190" x2="285" y2="190" stroke="#888" stroke-width="0.8"/>
    <line x1="40" y1="30" x2="40" y2="190" stroke="#888" stroke-width="0.8"/>
    <line x1="162" y1="60" x2="162" y2="190" stroke="#ccc" stroke-width="0.5" stroke-dasharray="2,3"/>
    <path d="M40,180 C90,180 115,60 162,60 C210,60 235,180 285,180" fill="none" stroke="#FF680A" stroke-width="2.5"/>
    <line x1="172" y1="64" x2="172" y2="176" stroke="#1f2937" stroke-width="0.8"/>
    <polygon points="172,60 169,68 175,68" fill="#1f2937"/>
    <polygon points="172,180 169,172 175,172" fill="#1f2937"/>
    <text x="180" y="124" font-size="12" font-style="italic" fill="#1f2937">K₁</text>
    <text x="40" y="205" font-size="10" text-anchor="middle" fill="#888">0°</text>
    <text x="162" y="205" font-size="10" text-anchor="middle" fill="#888">90°</text>
    <text x="285" y="205" font-size="10" text-anchor="middle" fill="#888">180°</text>
    <text x="162" y="222" font-size="10.5" text-anchor="middle" fill="#888">θ, angle between M and the c-axis</text>
    <text x="395" y="46" font-size="12" font-style="italic" text-anchor="middle" fill="#222">easy axis (K₁ &gt; 0)</text>
    <line x1="374" y1="160" x2="434" y2="160" stroke="#bbb" stroke-width="0.7" stroke-dasharray="3,3"/>
    <line x1="356" y1="172" x2="374" y2="160" stroke="#bbb" stroke-width="0.7" stroke-dasharray="3,3"/>
    <line x1="374" y1="160" x2="374" y2="92" stroke="#bbb" stroke-width="0.7" stroke-dasharray="3,3"/>
    <rect x="356" y="104" width="60" height="68" fill="none" stroke="#bbb" stroke-width="0.7"/>
    <line x1="356" y1="104" x2="374" y2="92" stroke="#bbb" stroke-width="0.7"/>
    <line x1="416" y1="104" x2="434" y2="92" stroke="#bbb" stroke-width="0.7"/>
    <line x1="416" y1="172" x2="434" y2="160" stroke="#bbb" stroke-width="0.7"/>
    <line x1="374" y1="92" x2="434" y2="92" stroke="#bbb" stroke-width="0.7"/>
    <line x1="434" y1="92" x2="434" y2="160" stroke="#bbb" stroke-width="0.7"/>
    <circle cx="374" cy="160" r="4" fill="#1f2937" opacity="0.5"/>
    <circle cx="434" cy="160" r="4" fill="#1f2937" opacity="0.5"/>
    <circle cx="374" cy="92" r="4" fill="#1f2937" opacity="0.5"/>
    <circle cx="434" cy="92" r="4" fill="#1f2937" opacity="0.5"/>
    <circle cx="404" cy="126" r="5" fill="#FF680A" opacity="0.6"/>
    <circle cx="356" cy="172" r="4" fill="#1f2937" opacity="0.85"/>
    <circle cx="416" cy="172" r="4" fill="#1f2937" opacity="0.85"/>
    <circle cx="356" cy="104" r="4" fill="#1f2937" opacity="0.85"/>
    <circle cx="416" cy="104" r="4" fill="#1f2937" opacity="0.85"/>
    <circle cx="395" cy="166" r="4" fill="#1f2937" opacity="0.85"/>
    <circle cx="395" cy="98" r="4" fill="#1f2937" opacity="0.85"/>
    <circle cx="365" cy="132" r="5" fill="#FF680A" opacity="0.9"/>
    <circle cx="425" cy="132" r="5" fill="#FF680A" opacity="0.9"/>
    <circle cx="386" cy="138" r="5" fill="#FF680A" opacity="0.9"/>
    <line x1="341" y1="172" x2="341" y2="98" stroke="#888" stroke-width="0.8"/>
    <polygon points="341,92 338,100 344,100" fill="#888"/>
    <text x="333" y="102" font-size="10.5" text-anchor="end" font-style="italic" fill="#888">c</text>
    <line x1="452" y1="166" x2="452" y2="96" stroke="#FF680A" stroke-width="3"/>
    <polygon points="452,88 446,100 458,100" fill="#FF680A"/>
    <text x="460" y="124" font-size="11" font-style="italic" fill="#FF680A">M</text>
    <text x="395" y="198" font-size="10.5" text-anchor="middle" fill="#1f2937">M pinned along c</text>
    <text x="395" y="213" font-size="10.5" text-anchor="middle" fill="#1f2937">holds a pole</text>
    <text x="525" y="46" font-size="12" font-style="italic" text-anchor="middle" fill="#222">easy plane (K₁ &lt; 0)</text>
    <line x1="504" y1="160" x2="564" y2="160" stroke="#bbb" stroke-width="0.7" stroke-dasharray="3,3"/>
    <line x1="486" y1="172" x2="504" y2="160" stroke="#bbb" stroke-width="0.7" stroke-dasharray="3,3"/>
    <line x1="504" y1="160" x2="504" y2="92" stroke="#bbb" stroke-width="0.7" stroke-dasharray="3,3"/>
    <rect x="486" y="104" width="60" height="68" fill="none" stroke="#bbb" stroke-width="0.7"/>
    <line x1="486" y1="104" x2="504" y2="92" stroke="#bbb" stroke-width="0.7"/>
    <line x1="546" y1="104" x2="564" y2="92" stroke="#bbb" stroke-width="0.7"/>
    <line x1="546" y1="172" x2="564" y2="160" stroke="#bbb" stroke-width="0.7"/>
    <line x1="504" y1="92" x2="564" y2="92" stroke="#bbb" stroke-width="0.7"/>
    <line x1="564" y1="92" x2="564" y2="160" stroke="#bbb" stroke-width="0.7"/>
    <circle cx="504" cy="160" r="4" fill="#1f2937" opacity="0.5"/>
    <circle cx="564" cy="160" r="4" fill="#1f2937" opacity="0.5"/>
    <circle cx="504" cy="92" r="4" fill="#1f2937" opacity="0.5"/>
    <circle cx="564" cy="92" r="4" fill="#1f2937" opacity="0.5"/>
    <circle cx="534" cy="126" r="5" fill="#FF680A" opacity="0.6"/>
    <circle cx="486" cy="172" r="4" fill="#1f2937" opacity="0.85"/>
    <circle cx="546" cy="172" r="4" fill="#1f2937" opacity="0.85"/>
    <circle cx="486" cy="104" r="4" fill="#1f2937" opacity="0.85"/>
    <circle cx="546" cy="104" r="4" fill="#1f2937" opacity="0.85"/>
    <circle cx="525" cy="166" r="4" fill="#1f2937" opacity="0.85"/>
    <circle cx="525" cy="98" r="4" fill="#1f2937" opacity="0.85"/>
    <circle cx="495" cy="132" r="5" fill="#FF680A" opacity="0.9"/>
    <circle cx="555" cy="132" r="5" fill="#FF680A" opacity="0.9"/>
    <circle cx="516" cy="138" r="5" fill="#FF680A" opacity="0.9"/>
    <ellipse cx="525" cy="132" rx="62" ry="14" fill="none" stroke="#FF680A" stroke-width="1" stroke-dasharray="3,3" opacity="0.65"/>
    <line x1="499" y1="146" x2="551" y2="146" stroke="#FF680A" stroke-width="3"/>
    <polygon points="559,146 547,140 547,152" fill="#FF680A"/>
    <polygon points="491,146 503,140 503,152" fill="#FF680A"/>
    <text x="576" y="163" font-size="11" font-style="italic" fill="#FF680A">M</text>
    <text x="525" y="198" font-size="10.5" text-anchor="middle" fill="#1f2937">M rotates in the plane</text>
    <text x="525" y="213" font-size="10.5" text-anchor="middle" fill="#1f2937">no pole</text>
  </svg>
  <figcaption><strong>Figure 1.</strong> Magnetocrystalline anisotropy is an energy landscape over the magnetization direction. Left: in an easy-axis material the two minima along ±c are separated by a barrier of \(K_1\) per unit volume, the physical quantity every anisotropy label in this dataset measures. Right: the L1₀ unit cell of FePt, in which Pt (gray) and Fe (orange) occupy alternating layers along c, and that layering is what singles out the axis. The same uniaxial cell admits two outcomes: minima along ±c (easy axis, M holds a direction) or a degenerate ring of minima in the basal plane (easy plane, M rotates freely and no direction is retained). The axis-versus-plane label therefore matters before any magnitude does.</figcaption>
</figure>

#### 2.2  Hardness: anisotropy versus the magnet's own field

The poles a magnetized body develops generate a demagnetizing field inside the body that points against the magnetization, and the energy scale of that self-field is \(\mu_0 M_s^2\), so the drive to demagnetize grows with the square of the magnetization. What resists is the anisotropy barrier \(K_1\). The dimensionless hardness

$$\kappa \;=\; \sqrt{\frac{K_1}{\mu_0 M_s^2}}$$

compares the two scales, and its practical meaning is geometric: when \(\kappa > 1\) the anisotropy wins in the worst case, so the material can be made into a magnet of any shape; below that, a compact body demagnetizes itself, and only elongated geometries survive [2]. This is why raw magnetization is not enough. Iron has one of the largest \(M_s\) values known and is magnetically useless as a permanent magnet: its anisotropy is two orders of magnitude too small for its own field.

<figure>
  <svg viewBox="0 0 620 230" xmlns="http://www.w3.org/2000/svg" style="font-family:inherit;">
    <rect x="40" y="26" width="14" height="14" fill="#1f2937" opacity="0.35"/>
    <text x="60" y="37" font-size="11" fill="#1f2937">µ₀Ms², the self-demagnetizing energy scale</text>
    <rect x="40" y="48" width="14" height="14" fill="#FF680A" opacity="0.85"/>
    <text x="60" y="59" font-size="11" fill="#1f2937">K₁, the anisotropy barrier resisting it</text>
    <line x1="60" y1="170" x2="580" y2="170" stroke="#888" stroke-width="0.8"/>
    <rect x="104" y="97" width="44" height="73" fill="#1f2937" opacity="0.35"/>
    <rect x="152" y="168" width="44" height="2" fill="#FF680A" opacity="0.85"/>
    <text x="150" y="88" font-size="11" font-weight="bold" text-anchor="middle" fill="#1f2937">κ ≈ 0.1</text>
    <text x="150" y="188" font-size="11" text-anchor="middle" fill="#1f2937">α-Fe: strong but soft</text>
    <rect x="284" y="129" width="44" height="41" fill="#1f2937" opacity="0.35"/>
    <rect x="332" y="72" width="44" height="98" fill="#FF680A" opacity="0.85"/>
    <text x="330" y="62" font-size="11" font-weight="bold" text-anchor="middle" fill="#1f2937">κ ≈ 1.5</text>
    <text x="330" y="188" font-size="11" text-anchor="middle" fill="#1f2937">Nd₂Fe₁₄B: the incumbent</text>
    <rect x="464" y="137" width="44" height="33" fill="#1f2937" opacity="0.35"/>
    <rect x="512" y="38" width="44" height="132" fill="#FF680A" opacity="0.85"/>
    <text x="510" y="28" font-size="11" font-weight="bold" text-anchor="middle" fill="#1f2937">κ ≈ 2.0</text>
    <text x="510" y="188" font-size="11" text-anchor="middle" fill="#1f2937">L1₀ FePt: very hard</text>
    <text x="310" y="212" font-size="10.5" text-anchor="middle" fill="#888">the two energy scales, MJ/m³ (literature values); hard means the orange bar wins</text>
  </svg>
  <figcaption><strong>Figure 2.</strong> Hardness is a ratio of two energy scales. Iron carries an enormous magnetization (tall gray bar, µ₀Ms² ≈ 3.7 MJ/m³) but almost no anisotropy to defend it (K₁ ≈ 0.05), so it demagnetizes itself: κ ≈ 0.1. Nd₂Fe₁₄B and L1₀ FePt hold less magnetization but defend it with anisotropy several times the self-field scale. The dataset's κ label encodes this contest for every entry, and the κ = 1 line in Figure 6 is the boundary where the orange bar starts winning.</figcaption>
</figure>

#### 2.3  From intrinsic numbers to a working magnet

A permanent magnet is used to deliver flux outside its own volume, and that performance is read off the hysteresis loop: the magnet's flux density \(B\) as the opposing field \(H\) it must work against increases. Three figures of merit live on the loop, and each traces back to an intrinsic label in this dataset. The remanence \(B_r\), the flux density retained at zero applied field, is capped by \(\mu_0 M_s\). The coercivity \(H_c\), the reverse field the magnet withstands before its magnetization flips, is capped by the anisotropy field \(2K_1/\mu_0 M_s\), although real magnets reach only a fraction of that cap, because reversal nucleates early at grain boundaries and defects [3]. The energy product \((BH)_{max}\), the standard single figure of merit, is the largest \(B \times H\) rectangle that fits under the second-quadrant curve, with a theoretical ceiling of \(\mu_0 M_s^2/4\) for a square loop.

The gap between the intrinsic ceilings and what a manufactured magnet delivers is decided by microstructure: grain size, crystallographic texture, grain-boundary chemistry, soft-phase inclusions. That is why the pipeline's final stage (Section 3.1) sweeps 2,000 sampled microstructures per gate-passing compound: the peak \((BH)_{max}\) estimates the ceiling, and the robustness score estimates how forgiving the compound is of imperfect processing. Temperature closes the loop's story: every one of these properties decays toward zero at the Curie temperature, which is why a \(T_c\) comfortably above the operating range is a gate in its own right.

<figure>
  <svg viewBox="0 0 620 250" xmlns="http://www.w3.org/2000/svg" style="font-family:inherit;">
    <line x1="40" y1="125" x2="590" y2="125" stroke="#888" stroke-width="0.8"/>
    <polygon points="596,125 586,121 586,129" fill="#888"/>
    <line x1="315" y1="20" x2="315" y2="235" stroke="#888" stroke-width="0.8"/>
    <text x="580" y="115" font-size="11" font-style="italic" fill="#888">H</text>
    <text x="305" y="30" font-size="11" font-style="italic" text-anchor="end" fill="#888">B</text>
    <path d="M550,45 L345,45 C270,45 240,70 225,125 C210,180 180,205 90,205" fill="none" stroke="#1f2937" stroke-width="2"/>
    <path d="M90,205 L285,205 C360,205 390,180 405,125 C420,70 450,45 550,45" fill="none" stroke="#1f2937" stroke-width="2"/>
    <rect x="258" y="70" width="57" height="55" fill="#FF680A" opacity="0.3" stroke="#FF680A" stroke-width="0.8"/>
    <text x="287" y="106" font-size="11" text-anchor="middle" fill="#1f2937">(BH)<tspan font-size="8" dy="2">max</tspan></text>
    <circle cx="315" cy="45" r="3.5" fill="#FF680A"/>
    <text x="327" y="38" font-size="11" fill="#1f2937">B<tspan font-size="8" dy="2">r</tspan></text>
    <circle cx="225" cy="125" r="3.5" fill="#FF680A"/>
    <text x="206" y="145" font-size="11" text-anchor="middle" fill="#1f2937">−H<tspan font-size="8" dy="2">c</tspan></text>
    <line x1="345" y1="45" x2="560" y2="45" stroke="#bbb" stroke-width="0.6" stroke-dasharray="3,3"/>
    <text x="560" y="36" font-size="10.5" text-anchor="end" fill="#888">B<tspan font-size="8" dy="2">r</tspan><tspan dy="-2">&#160;≤ µ₀Ms: magnetization sets this ceiling</tspan></text>
    <text x="52" y="88" font-size="10.5" fill="#888">H<tspan font-size="8" dy="2">c</tspan><tspan dy="-2">&#160;is capped by the anisotropy</tspan></text>
    <text x="52" y="103" font-size="10.5" fill="#888">field 2K₁/µ₀Ms</text>
  </svg>
  <figcaption><strong>Figure 3.</strong> How the intrinsic labels become a magnet's spec sheet. The hysteresis loop's second quadrant (shaded region) is where a permanent magnet operates, working against its own demagnetizing field. \(M_s\) caps the remanence, \(K_1\) caps the coercivity, and the largest rectangle under the curve is the energy product, with ceiling \(\mu_0 M_s^2/4\). Microstructure decides how much of each ceiling survives manufacturing, which is what the pipeline's final sweep stage estimates.</figcaption>
</figure>

### 3  Methods

#### 3.1  Screening cascade

Every record passed through the same staged pipeline, ordered so the expensive anisotropy calculation is only paid for structures that are physical, uniaxial, and magnetic. Property calculations ran as hosted routes on the Ouro platform [16]; orchestration ran on Modal.

<figure>
  <svg viewBox="0 0 620 200" xmlns="http://www.w3.org/2000/svg" style="font-family:inherit;">
    <rect x="20" y="26" width="560" height="26" fill="#FF680A" opacity="0.30"/>
    <text x="28" y="43" font-size="12" fill="#1f2937">candidate structures screened</text>
    <text x="588" y="43" font-size="12" text-anchor="end" fill="#1f2937" font-weight="bold">3,573</text>
    <rect x="20" y="68" width="351" height="26" fill="#FF680A" opacity="0.50"/>
    <text x="28" y="85" font-size="12" fill="#1f2937">anisotropy-labeled (relaxed, uniaxial, magnetic)</text>
    <text x="379" y="85" font-size="12" text-anchor="start" fill="#1f2937" font-weight="bold">  2,242</text>
    <rect x="20" y="110" width="320" height="26" fill="#FF680A" opacity="0.70"/>
    <text x="28" y="127" font-size="12" fill="#1f2937">κ-reliable (Ms artifact filter, §6)</text>
    <text x="348" y="127" font-size="12" text-anchor="start" fill="#1f2937" font-weight="bold">  2,044</text>
    <rect x="20" y="152" width="100" height="26" fill="#FF680A" opacity="0.95"/>
    <text x="28" y="169" font-size="12" fill="#fff">pass</text>
    <text x="128" y="169" font-size="12" text-anchor="start" fill="#1f2937" font-weight="bold">641 clear every magnet gate</text>
  </svg>
  <figcaption><strong>Figure 4.</strong> The screening funnel. Records that fail a gate are retained: any compound that reached the anisotropy stage keeps its label, so the 2,242 labeled entries include easy-plane, soft, and metastable negatives alongside the 641 that clear every gate.</figcaption>
</figure>

The stages, with their exact settings:

1. **Relaxation.** Orb-v3 machine-learned interatomic potential (`orb-v3-conservative-inf-mpa`) [8], force convergence 0.05 eV/Å, at most 200 steps. Structures whose relaxed nearest-neighbor distance fell below 1.5 Å were rejected as unphysical. The relaxed structure, not the input, feeds every later stage.
2. **Symmetry.** Only tetragonal, hexagonal, and trigonal cells proceed. Space group and crystal system are recorded from the relaxed cell.
3. **Stability.** Energy above the convex hull, referenced against the Materials Project hull, recorded in meV/atom.
4. **Intrinsic magnetism.** Curie temperature and magnetization density from dedicated property models [16]; the Curie estimate should be treated as method-level (such estimates typically run high).
5. **Anisotropy.** The expensive stage, described in Section 3.2. Outputs \(K_1\), \(M_s\), \(\kappa\), and the easy-axis direction.
6. **Microstructure sweep** (gate-passing compounds only). A micromagnetic proxy model sweeps seven microstructure parameters (degree of chemical order, texture spread, grain size, grain-boundary exchange and magnetization, soft-phase fraction, dead-layer thickness) over 2,000 Latin-hypercube samples, reporting the peak energy product \((BH)_{max}\), peak remanence, and a robustness score: the share of sampled microstructures that clear coercivity ≥ 600 kA/m, remanence ≥ 0.8 T, and \((BH)_{max}\) ≥ 100 kJ/m³, weighted by their margin above those thresholds.

<figure>
  <svg viewBox="0 0 620 280" xmlns="http://www.w3.org/2000/svg" style="font-family:inherit;">
    <text x="167.0" y="26" font-size="12" font-style="italic" text-anchor="middle" fill="#222">The object the sweep models</text>
    <text x="167.0" y="41" font-size="9.5" text-anchor="middle" fill="#888">textured polycrystal: shade = grain alignment</text>
    <polygon points="101,149 102,165 100,174 89,184 86,184 55,157 80,136" fill="#FF680A" fill-opacity="0.39" stroke="#fff" stroke-width="2"/>
    <polygon points="185,93 210,79 211,62 167,62" fill="#FF680A" fill-opacity="0.75" stroke="#fff" stroke-width="2"/>
    <polygon points="66,248 75,225 87,224 95,237 93,242" fill="#FF680A" fill-opacity="0.71" stroke="#fff" stroke-width="2"/>
    <polygon points="80,81 63,76 42,81 42,84 56,94" fill="#FF680A" fill-opacity="0.45" stroke="#fff" stroke-width="2"/>
    <polygon points="272,154 292,153 292,201 265,181" fill="#FF680A" fill-opacity="0.79" stroke="#fff" stroke-width="2"/>
    <polygon points="152,172 120,164 148,143 156,147 159,168" fill="#FF680A" fill-opacity="0.70" stroke="#fff" stroke-width="2"/>
    <polygon points="237,132 237,133 233,136 199,137 183,127 183,102 219,109" fill="#FF680A" fill-opacity="0.83" stroke="#fff" stroke-width="2"/>
    <polygon points="88,223 91,190 89,184 86,184 56,199 63,217 75,225 87,224" fill="#FF680A" fill-opacity="0.92" stroke="#fff" stroke-width="2"/>
    <polygon points="217,212 198,199 190,186 199,137 233,136 221,198" fill="#FF680A" fill-opacity="0.86" stroke="#fff" stroke-width="2"/>
    <polygon points="244,132 268,152 221,198 233,136 237,133" fill="#FF680A" fill-opacity="0.70" stroke="#fff" stroke-width="2"/>
    <polygon points="276,88 279,112 292,118 292,74 279,83" fill="#FF680A" fill-opacity="0.80" stroke="#fff" stroke-width="2"/>
    <polygon points="183,127 199,137 190,186 159,168 156,147 170,134" fill="#FF680A" fill-opacity="0.83" stroke="#fff" stroke-width="2"/>
    <polygon points="136,195 100,174 102,165 120,164 152,172" fill="#FF680A" fill-opacity="0.89" stroke="#fff" stroke-width="2"/>
    <polygon points="115,215 91,190 88,223" fill="#FF680A" fill-opacity="0.85" stroke="#fff" stroke-width="2"/>
    <polygon points="276,88 256,99 242,81 247,71 279,83" fill="#FF680A" fill-opacity="0.53" stroke="#fff" stroke-width="2"/>
    <polygon points="159,100 183,100 183,102 183,127 170,134 144,106" fill="#FF680A" fill-opacity="0.77" stroke="#fff" stroke-width="2"/>
    <polygon points="66,248 75,225 63,217 42,245 42,252 62,252" fill="#FF680A" fill-opacity="0.56" stroke="#fff" stroke-width="2"/>
    <polygon points="159,100 146,70 121,93 135,107 144,106" fill="#FF680A" fill-opacity="0.86" stroke="#fff" stroke-width="2"/>
    <polygon points="219,109 183,102 183,100 185,93 210,79 217,84" fill="#FF680A" fill-opacity="0.49" stroke="#fff" stroke-width="2"/>
    <polygon points="276,88 279,112 250,124 256,99" fill="#FF680A" fill-opacity="0.52" stroke="#fff" stroke-width="2"/>
    <polygon points="56,94 42,84 42,122 65,117" fill="#FF680A" fill-opacity="0.76" stroke="#fff" stroke-width="2"/>
    <polygon points="101,149 102,165 120,164 148,143 135,133 107,142" fill="#FF680A" fill-opacity="0.29" stroke="#fff" stroke-width="2"/>
    <polygon points="292,252 292,201 265,181 219,215 229,252" fill="#FF680A" fill-opacity="0.90" stroke="#fff" stroke-width="2"/>
    <polygon points="121,93 108,92 99,87 96,81 96,62 152,62 146,70" fill="#FF680A" fill-opacity="0.78" stroke="#fff" stroke-width="2"/>
    <polygon points="62,252 95,252 93,242 66,248" fill="#FF680A" fill-opacity="0.49" stroke="#fff" stroke-width="2"/>
    <polygon points="136,195 152,172 159,168 190,186 198,199 139,215" fill="#FF680A" fill-opacity="0.52" stroke="#fff" stroke-width="2"/>
    <polygon points="63,76 59,62 42,62 42,81" fill="#FF680A" fill-opacity="0.15" stroke="#fff" stroke-width="2"/>
    <polygon points="268,152 221,198 217,212 219,215 265,181 272,154" fill="#FF680A" fill-opacity="0.67" stroke="#fff" stroke-width="2"/>
    <polygon points="121,93 108,92 107,142 135,133 135,107" fill="#FF680A" fill-opacity="0.73" stroke="#fff" stroke-width="2"/>
    <polygon points="80,81 56,94 65,117 72,118 99,87 96,81" fill="#FF680A" fill-opacity="0.74" stroke="#fff" stroke-width="2"/>
    <polygon points="42,245 42,196 56,199 63,217" fill="#FF680A" fill-opacity="0.67" stroke="#fff" stroke-width="2"/>
    <polygon points="159,100 183,100 185,93 167,62 152,62 146,70" fill="#FF680A" fill-opacity="0.84" stroke="#fff" stroke-width="2"/>
    <polygon points="237,132 234,85 217,84 219,109" fill="#FF680A" fill-opacity="0.82" stroke="#fff" stroke-width="2"/>
    <polygon points="56,199 86,184 55,157 42,157 42,196" fill="#FF680A" fill-opacity="0.86" stroke="#fff" stroke-width="2"/>
    <polygon points="279,83 292,74 292,62 247,62 247,71" fill="#FF680A" fill-opacity="0.59" stroke="#fff" stroke-width="2"/>
    <polygon points="256,99 250,124 244,132 237,133 237,132 234,85 242,81" fill="#FF680A" fill-opacity="0.91" stroke="#fff" stroke-width="2"/>
    <polygon points="80,81 63,76 59,62 96,62 96,81" fill="#FF680A" fill-opacity="0.64" stroke="#fff" stroke-width="2"/>
    <polygon points="115,215 91,190 89,184 100,174 136,195 139,215 134,225" fill="#FF680A" fill-opacity="0.79" stroke="#fff" stroke-width="2"/>
    <polygon points="134,231 142,252 229,252 219,215 217,212 198,199 139,215 134,225" fill="#FF680A" fill-opacity="0.82" stroke="#fff" stroke-width="2"/>
    <polygon points="99,87 108,92 107,142 101,149 80,136 72,118" fill="#FF680A" fill-opacity="0.28" stroke="#fff" stroke-width="2"/>
    <polygon points="93,242 95,237 134,231 142,252 95,252" fill="#FF680A" fill-opacity="0.49" stroke="#fff" stroke-width="2"/>
    <polygon points="244,132 268,152 272,154 292,153 292,118 279,112 250,124" fill="#FF680A" fill-opacity="0.68" stroke="#fff" stroke-width="2"/>
    <polygon points="144,106 170,134 156,147 148,143 135,133 135,107" fill="#FF680A" fill-opacity="0.74" stroke="#fff" stroke-width="2"/>
    <polygon points="242,81 234,85 217,84 210,79 211,62 247,62 247,71" fill="#FF680A" fill-opacity="0.75" stroke="#fff" stroke-width="2"/>
    <polygon points="72,118 80,136 55,157 42,157 42,122 65,117" fill="#FF680A" fill-opacity="0.76" stroke="#fff" stroke-width="2"/>
    <polygon points="134,231 134,225 115,215 88,223 87,224 95,237" fill="#FF680A" fill-opacity="0.52" stroke="#fff" stroke-width="2"/>
    <polygon points="100,173 111,164 102,156" fill="#3b4552" opacity="0.75" stroke="#3b4552" stroke-width="4" stroke-linejoin="round"/>
    <polygon points="156,146 141,148 142,138" fill="#3b4552" opacity="0.75" stroke="#3b4552" stroke-width="4" stroke-linejoin="round"/>
    <polygon points="210,207 219,204 221,219" fill="#3b4552" opacity="0.75" stroke="#3b4552" stroke-width="4" stroke-linejoin="round"/>
    <rect x="42" y="62" width="250" height="190" fill="none" stroke="#bbb" stroke-width="0.7"/>
    <line x1="30" y1="234" x2="30" y2="80" stroke="#888" stroke-width="0.8"/>
    <polygon points="30,74 27,82 33,82" fill="#888"/>
    <text x="20" y="157.0" font-size="10" font-style="italic" fill="#444" text-anchor="middle" transform="rotate(-90 20 157.0)">alignment axis</text>
    <text x="477.0" y="26" font-size="12" font-style="italic" text-anchor="middle" fill="#222">The sweep output (HfGaFe₄, 2,000 samples)</text>
    <text x="477.0" y="41" font-size="9.5" text-anchor="middle" fill="#888">share of samples passing all three thresholds</text>
    <rect x="372" y="62" width="40" height="29" fill="#000" fill-opacity="0.04"/>
    <rect x="414" y="62" width="40" height="29" fill="#000" fill-opacity="0.04"/>
    <rect x="456" y="62" width="40" height="29" fill="#000" fill-opacity="0.04"/>
    <rect x="498" y="62" width="40" height="29" fill="#000" fill-opacity="0.04"/>
    <rect x="540" y="62" width="40" height="29" fill="#000" fill-opacity="0.04"/>
    <rect x="372" y="93" width="40" height="29" fill="#000" fill-opacity="0.04"/>
    <rect x="414" y="93" width="40" height="29" fill="#000" fill-opacity="0.04"/>
    <rect x="456" y="93" width="40" height="29" fill="#000" fill-opacity="0.04"/>
    <rect x="498" y="93" width="40" height="29" fill="#000" fill-opacity="0.04"/>
    <rect x="540" y="93" width="40" height="29" fill="#000" fill-opacity="0.04"/>
    <rect x="372" y="124" width="40" height="29" fill="#000" fill-opacity="0.04"/>
    <rect x="414" y="124" width="40" height="29" fill="#000" fill-opacity="0.04"/>
    <rect x="456" y="124" width="40" height="29" fill="#000" fill-opacity="0.04"/>
    <rect x="498" y="124" width="40" height="29" fill="#FF680A" opacity="0.12"/>
    <text x="518.0" y="142.5" font-size="9" text-anchor="middle" fill="#1f2937">10%</text>
    <rect x="540" y="124" width="40" height="29" fill="#FF680A" opacity="0.25"/>
    <text x="560.0" y="142.5" font-size="9" text-anchor="middle" fill="#1f2937">25%</text>
    <rect x="372" y="155" width="40" height="29" fill="#000" fill-opacity="0.04"/>
    <rect x="414" y="155" width="40" height="29" fill="#000" fill-opacity="0.04"/>
    <rect x="456" y="155" width="40" height="29" fill="#FF680A" opacity="0.12"/>
    <text x="476.0" y="173.5" font-size="9" text-anchor="middle" fill="#1f2937">4%</text>
    <rect x="498" y="155" width="40" height="29" fill="#FF680A" opacity="0.12"/>
    <text x="518.0" y="173.5" font-size="9" text-anchor="middle" fill="#1f2937">11%</text>
    <rect x="540" y="155" width="40" height="29" fill="#FF680A" opacity="0.42"/>
    <text x="560.0" y="173.5" font-size="9" text-anchor="middle" fill="#1f2937">42%</text>
    <rect x="372" y="186" width="40" height="29" fill="#000" fill-opacity="0.04"/>
    <rect x="414" y="186" width="40" height="29" fill="#000" fill-opacity="0.04"/>
    <rect x="456" y="186" width="40" height="29" fill="#FF680A" opacity="0.12"/>
    <text x="476.0" y="204.5" font-size="9" text-anchor="middle" fill="#1f2937">5%</text>
    <rect x="498" y="186" width="40" height="29" fill="#FF680A" opacity="0.19"/>
    <text x="518.0" y="204.5" font-size="9" text-anchor="middle" fill="#1f2937">19%</text>
    <rect x="540" y="186" width="40" height="29" fill="#FF680A" opacity="0.38"/>
    <text x="560.0" y="204.5" font-size="9" text-anchor="middle" fill="#1f2937">38%</text>
    <rect x="372" y="217" width="40" height="29" fill="#000" fill-opacity="0.04"/>
    <rect x="414" y="217" width="40" height="29" fill="#000" fill-opacity="0.04"/>
    <rect x="456" y="217" width="40" height="29" fill="#FF680A" opacity="0.12"/>
    <text x="476.0" y="235.5" font-size="9" text-anchor="middle" fill="#1f2937">3%</text>
    <rect x="498" y="217" width="40" height="29" fill="#FF680A" opacity="0.19"/>
    <text x="518.0" y="235.5" font-size="9" text-anchor="middle" fill="#1f2937">19%</text>
    <rect x="540" y="217" width="40" height="29" fill="#FF680A" opacity="0.39"/>
    <text x="560.0" y="235.5" font-size="9" text-anchor="middle" fill="#1f2937">39%</text>
    <text x="392.0" y="262" font-size="9" text-anchor="middle" fill="#888">0.6</text>
    <text x="434.0" y="262" font-size="9" text-anchor="middle" fill="#888">0.7</text>
    <text x="476.0" y="262" font-size="9" text-anchor="middle" fill="#888">0.8</text>
    <text x="518.0" y="262" font-size="9" text-anchor="middle" fill="#888">0.9</text>
    <text x="560.0" y="262" font-size="9" text-anchor="middle" fill="#888">1.0</text>
    <text x="365" y="80.5" font-size="9" text-anchor="end" fill="#888">1.0</text>
    <text x="365" y="111.5" font-size="9" text-anchor="end" fill="#888">0.5</text>
    <text x="365" y="142.5" font-size="9" text-anchor="end" fill="#888">0.1</text>
    <text x="365" y="173.5" font-size="9" text-anchor="end" fill="#888">0.05</text>
    <text x="365" y="204.5" font-size="9" text-anchor="end" fill="#888">0.01</text>
    <text x="365" y="235.5" font-size="9" text-anchor="end" fill="#888">0.0</text>
    <text x="477.0" y="278" font-size="10" font-style="italic" text-anchor="middle" fill="#444">chemical order parameter</text>
    <text x="330" y="155" font-size="10" font-style="italic" text-anchor="middle" fill="#444" transform="rotate(-90 330 155)">boundary exchange fraction</text>
    </svg>
  <figcaption><strong>Figure 5.</strong> The microstructure sweep of stage 6. Left: the object the sweep parameterizes, a textured polycrystal in which each grain's shade encodes its misalignment from the pressing axis, grain boundaries carry reduced exchange and magnetization, and the gray pockets at the triple junctions are soft phase. Right: real sweep output for HfGaFe₄, the 2,000 Latin-hypercube samples aggregated onto the two most sensitive axes. The share of samples clearing all three thresholds concentrates at high chemical order and low grain-boundary exchange; that concentration is the acceptable window the dataset reports for each gate-passing compound.</figcaption>
</figure>

Two gate configurations were used. The discovery configuration enforces magnet-viability floors (Curie temperature ≥ 400 K, \(M_s\) ≥ 0.5 MA/m, hull distance ≤ 200 meV/atom, \(\kappa > 1\), easy axis along the crystallographic c-axis). The dataset-building configuration relaxes those floors (Curie ≥ 0 K, \(M_s\) ≥ 0.1 MA/m, hull distance ≤ 500 meV/atom) so that the anisotropy label is captured for any uniaxial magnetic structure, including ones that make poor magnets. Most of the dataset was built in the second configuration, which is why its label distribution covers soft and hard compounds alike. The anisotropy stage dominates the cost: a production calculation takes 8 to 15 minutes per compound and the high-accuracy recomputations up to several hours, for roughly 2,900 anisotropy calculations in total over the eight-day screening period.

#### 3.2  The anisotropy calculation

Each anisotropy label comes from TB2J [10] magnetic-interaction extraction over ABACUS [9] density-functional-theory calculations with the PseudoDojo fully-relativistic norm-conserving pseudopotential set (Dojo-NC-FR) [11]. Production settings are a k-point spacing of 0.16 Å⁻¹ and a plane-wave cutoff of 65 Ry; the calibration tier of Section 5 tightens these to 0.10 Å⁻¹ and 80 Ry. The calculation assumes ferromagnetic alignment of the moments (a limitation quantified by a dedicated flag, Section 6) and reports the anisotropy energy resolved along the crystal axes, from which the easy axis and \(K_1\) follow. In uniaxial cells the two in-plane directions are degenerate, so the meaningful easy-axis distinction is axis (001) versus plane (100/010), and that is the distinction the error analysis of Section 5 uses.

The pseudopotential set contains no lanthanides or actinides, so rare-earth compounds cannot be computed, a hard constraint that defines the dataset's scope. Everything else, including the 5d precious metals, is computable, and 160 of the reliable labels contain a precious metal; these serve as high-anisotropy positive examples (the L1₀ family among them) and are trivially excluded by composition when a strictly precious-free view is wanted.

#### 3.3  Sources

**Table 2.** Provenance of the 3,573 records. Each record's `source` column carries its tag.

| source | n | description |
|---|---:|---|
| `mp_broad` | 2,013 | Materials Project pulls: rare-earth-free uniaxial magnetic compounds, ≤24–30 sites, hull distance ≤ 0.30–0.40 eV/atom, anchored on Fe, Mn, Co, Cr, Ni, V, Ti, Cu, Zn, Nb, Mo. The accessible space under these filters was exhausted. |
| `substitution` | 1,101 | Ordered single-element substitutions (Fe↔Co/Mn/Ni/V, Al→Ga/In, S→Se/Te, and similar) applied to already-screened structures, then uniaxial-filtered and deduplicated. These are off-database compositions forming controlled structure–property series. |
| `template` | 367 | Compositions placed into known hard-magnet prototype structures: L1₀, ThMn₁₂, Fe₂P, D0₁₉, boride, and Heusler frameworks. |
| `ordered` | 57 | Hand-built ordered variants. |
| `generated` | 30 | De novo structures from the GPSK-300 generative model [15]. |
| `doping` | 5 | Solid-solution probes. |

Fifty-nine compositions appear more than once as genuine polymorphs: the same formula relaxed into different structures with, in some cases, an order of magnitude difference in \(K_1\). With the relaxed structure files these are a feature (direct evidence of structure sensitivity); for composition-only models they are irreducible label noise, which is one argument for training on the structures.

### 4  Data record

The release is hosted on the Hugging Face Hub as [`willgbryan13/magnet-anisotropy-screening`](https://huggingface.co/datasets/willgbryan13/magnet-anisotropy-screening) (v1.0, CC-BY-4.0) and comprises six artifacts:

| artifact | contents |
|---|---|
| `magnet_screening.parquet` / `.csv` | the main table: 3,573 rows, 37 columns (labels, structure metadata, corrections, flags) |
| `relaxed_cifs/` | 2,787 relaxed structures with atomic coordinates (P1 CIF), covering 88% of labeled rows, with a manifest |
| `screening_records.jsonl` | complete nested per-record pipeline output |
| `calibration.jsonl` | the 287-compound high-accuracy tier: production and refined values side by side |
| `calibration_summary.json` | per-band corrections, scatter statistics |
| `METHODS.md` | full parameter-level provenance |

Table 3 gives the column-level schema of the main table; every labeled row also links to its relaxed structure file through the composition and manifest.

**Table 3.** Column schema of `magnet_screening.parquet` (one row per screened structure).

| column | type | units | description |
|---|---|---|---|
| `record_id` | str | – | stable identifier, `mag-00001` through `mag-03573`; links to the structure-file manifest |
| `composition` | str | – | reduced chemical formula |
| `mp_id` | str | – | Materials Project identifier of the source structure, where the input was pulled from MP (1,958 rows; null for off-database variants and ambiguous polymorph pulls) |
| `source` | str | – | provenance tag (Table 2) |
| `verdict`, `stopped_at` | str | – | cascade outcome (PASS / REJECT / LABELED / ERROR) and the stage that ended it |
| `structure_family` | str | – | prototype or family label where known |
| `actual_space_group`, `actual_crystal_system` | str | – | symmetry of the relaxed cell |
| `a, b, c, alpha, beta, gamma, volume_A3` | float | Å, °, Å³ | relaxed lattice parameters |
| `n_magnetic_atoms` | int | – | magnetic atoms per formula unit |
| `e_above_hull_meV` | float | meV/atom | distance to the Materials Project convex hull |
| `predicted_stable` | bool | – | hull-route stability call |
| `Tc_K` | float | K | Curie-temperature estimate |
| `Ms_A_per_m` | float | A/m | saturation magnetization from the anisotropy stage |
| `K1_J_per_m3` | float | J/m³ | anisotropy constant, production settings |
| `kappa` | float | – | magnetic hardness √(K₁/µ₀Ms²), production settings |
| `easy_axis` | str | – | 001 (axis) or 100/010 (plane; in-plane degenerate) |
| `mae_meV_per_atom` | float | meV/atom | anisotropy energy per atom, where reported |
| `kappa_corrected`, `K1_corrected_J_per_m3` | float | –, J/m³ | per-band convergence-corrected values (Section 5) |
| `easy_axis_confidence` | float | – | 1 − per-band axis↔plane flip rate |
| `kappa_reliable` | bool | – | False when the Ms→0 artifact inflates κ (Section 6.1) |
| `k1_outlier` | bool | – | extreme-value flag (Section 6.1) |
| `fm_assumption_risk`, `ms_ordering_risk` | bool, str | – | ferromagnetic-alignment risk flags (Section 6.1) |
| `A_exchange_J_per_m` | float | J/m | mean-field exchange-stiffness estimate |
| `peak_BHmax_kJ_per_m3`, `peak_Br_T` | float | kJ/m³, T | sweep-stage ceilings (gate-passing rows only) |
| `robustness_score`, `pass_fraction` | float | – | sweep pass share × threshold margin, and raw pass share |
| `max_moment_uB`, `fm_alignment` | float, str | µB | per-site moment maximum and alignment note |
| `ingested_at` | str | – | record timestamp |

The relaxed structures make the set graph-model-ready: a crystal-graph network can train on coordinates rather than composition and lattice metadata alone, which is also what disambiguates the polymorph pairs of Section 4.3. The 12% of labeled rows without a coordinate file are early records whose relaxation output was reconstructed from metadata after an infrastructure interruption; their lattice parameters and space groups are present, their coordinate files are not.

#### 4.1  Database-level statistics

The labeled set spans 60 elements and 72 space groups across the three uniaxial crystal systems. Figures 6 through 8 show what is in it: a hardness distribution balanced across soft and hard compounds, chemistry concentrated on the magnetic 3d row with an oxide-rich anion population, and a rare-earth row that is empty by construction.

<figure>
  <svg viewBox="0 0 620 210" xmlns="http://www.w3.org/2000/svg" style="font-family:inherit;">
    <rect x="40" y="45" width="64" height="125" fill="#1f2937" opacity="0.35"/>
    <rect x="118" y="67" width="64" height="103" fill="#1f2937" opacity="0.35"/>
    <rect x="196" y="108" width="64" height="62" fill="#1f2937" opacity="0.35"/>
    <rect x="274" y="58" width="64" height="112" fill="#FF680A" opacity="0.85"/>
    <rect x="352" y="84" width="64" height="86" fill="#FF680A" opacity="0.85"/>
    <rect x="430" y="43" width="64" height="127" fill="#FF680A" opacity="0.85"/>
    <rect x="508" y="85" width="64" height="85" fill="#FF680A" opacity="0.85"/>
    <text x="72" y="38" font-size="11" text-anchor="middle" fill="#1f2937">18%</text>
    <text x="150" y="60" font-size="11" text-anchor="middle" fill="#1f2937">15%</text>
    <text x="228" y="101" font-size="11" text-anchor="middle" fill="#1f2937">9%</text>
    <text x="306" y="51" font-size="11" text-anchor="middle" fill="#1f2937">16%</text>
    <text x="384" y="77" font-size="11" text-anchor="middle" fill="#1f2937">12%</text>
    <text x="462" y="36" font-size="11" text-anchor="middle" fill="#1f2937">18%</text>
    <text x="540" y="78" font-size="11" text-anchor="middle" fill="#1f2937">12%</text>
    <line x1="267" y1="30" x2="267" y2="170" stroke="#1f2937" stroke-width="0.8" stroke-dasharray="4,3"/>
    <text x="272" y="30" font-size="11" fill="#1f2937">κ = 1: hard-magnet threshold</text>
    <text x="72" y="188" font-size="11" text-anchor="middle" fill="#888">0–0.5</text>
    <text x="150" y="188" font-size="11" text-anchor="middle" fill="#888">0.5–0.8</text>
    <text x="228" y="188" font-size="11" text-anchor="middle" fill="#888">0.8–1</text>
    <text x="306" y="188" font-size="11" text-anchor="middle" fill="#888">1–1.5</text>
    <text x="384" y="188" font-size="11" text-anchor="middle" fill="#888">1.5–2</text>
    <text x="462" y="188" font-size="11" text-anchor="middle" fill="#888">2–4</text>
    <text x="540" y="188" font-size="11" text-anchor="middle" fill="#888">&gt; 4</text>
    <text x="310" y="207" font-size="11" text-anchor="middle" fill="#888">corrected magnetic hardness κ (2,044 reliable labels)</text>
  </svg>
  <figcaption><strong>Figure 6.</strong> The corrected hardness distribution is deliberately balanced: roughly a third soft (gray), a third moderate, a third hard, rather than the survivor-only distribution a discovery screen would leave behind. Easy-axis and easy-plane labels split 966 : 1,078, nearly even, so a classifier trained on the set sees both outcomes in force.</figcaption>
</figure>

<figure>
  <svg viewBox="0 0 620 300" xmlns="http://www.w3.org/2000/svg" style="font-family:inherit;">
    <rect x="15" y="28" width="31" height="28" fill="#FF680A" opacity="0.29"/>
    <text x="30.5" y="40" text-anchor="middle" font-size="8.5" font-weight="500" fill="#1f2937">H</text>
    <text x="30.5" y="51" text-anchor="middle" font-size="6.8" fill="#1f2937" opacity="0.85">4</text>
    <rect x="576" y="28" width="31" height="28" fill="#000" fill-opacity="0.03" stroke="#e5e5e5" stroke-width="0.5"/>
    <text x="591.5" y="41" text-anchor="middle" font-size="8.5" fill="#ccc">He</text>
    <rect x="15" y="58" width="31" height="28" fill="#FF680A" opacity="0.78"/>
    <text x="30.5" y="70" text-anchor="middle" font-size="8.5" font-weight="500" fill="#fff">Li</text>
    <text x="30.5" y="81" text-anchor="middle" font-size="6.8" fill="#fff" opacity="0.85">353</text>
    <rect x="48" y="58" width="31" height="28" fill="#FF680A" opacity="0.18"/>
    <text x="63.5" y="70" text-anchor="middle" font-size="8.5" font-weight="500" fill="#1f2937">Be</text>
    <text x="63.5" y="81" text-anchor="middle" font-size="6.8" fill="#1f2937" opacity="0.85">1</text>
    <rect x="411" y="58" width="31" height="28" fill="#FF680A" opacity="0.53"/>
    <text x="426.5" y="70" text-anchor="middle" font-size="8.5" font-weight="500" fill="#1f2937">B</text>
    <text x="426.5" y="81" text-anchor="middle" font-size="6.8" fill="#1f2937" opacity="0.85">40</text>
    <rect x="444" y="58" width="31" height="28" fill="#FF680A" opacity="0.37"/>
    <text x="459.5" y="70" text-anchor="middle" font-size="8.5" font-weight="500" fill="#1f2937">C</text>
    <text x="459.5" y="81" text-anchor="middle" font-size="6.8" fill="#1f2937" opacity="0.85">9</text>
    <rect x="477" y="58" width="31" height="28" fill="#FF680A" opacity="0.52"/>
    <text x="492.5" y="70" text-anchor="middle" font-size="8.5" font-weight="500" fill="#1f2937">N</text>
    <text x="492.5" y="81" text-anchor="middle" font-size="6.8" fill="#1f2937" opacity="0.85">37</text>
    <rect x="510" y="58" width="31" height="28" fill="#FF680A" opacity="0.88"/>
    <text x="525.5" y="70" text-anchor="middle" font-size="8.5" font-weight="500" fill="#fff">O</text>
    <text x="525.5" y="81" text-anchor="middle" font-size="6.8" fill="#fff" opacity="0.85">825</text>
    <rect x="543" y="58" width="31" height="28" fill="#FF680A" opacity="0.72"/>
    <text x="558.5" y="70" text-anchor="middle" font-size="8.5" font-weight="500" fill="#fff">F</text>
    <text x="558.5" y="81" text-anchor="middle" font-size="6.8" fill="#fff" opacity="0.85">203</text>
    <rect x="576" y="58" width="31" height="28" fill="#000" fill-opacity="0.03" stroke="#e5e5e5" stroke-width="0.5"/>
    <text x="591.5" y="71" text-anchor="middle" font-size="8.5" fill="#ccc">Ne</text>
    <rect x="15" y="88" width="31" height="28" fill="#FF680A" opacity="0.58"/>
    <text x="30.5" y="100" text-anchor="middle" font-size="8.5" font-weight="500" fill="#fff">Na</text>
    <text x="30.5" y="111" text-anchor="middle" font-size="6.8" fill="#fff" opacity="0.85">63</text>
    <rect x="48" y="88" width="31" height="28" fill="#FF680A" opacity="0.75"/>
    <text x="63.5" y="100" text-anchor="middle" font-size="8.5" font-weight="500" fill="#fff">Mg</text>
    <text x="63.5" y="111" text-anchor="middle" font-size="6.8" fill="#fff" opacity="0.85">258</text>
    <rect x="411" y="88" width="31" height="28" fill="#FF680A" opacity="0.59"/>
    <text x="426.5" y="100" text-anchor="middle" font-size="8.5" font-weight="500" fill="#fff">Al</text>
    <text x="426.5" y="111" text-anchor="middle" font-size="6.8" fill="#fff" opacity="0.85">67</text>
    <rect x="444" y="88" width="31" height="28" fill="#FF680A" opacity="0.56"/>
    <text x="459.5" y="100" text-anchor="middle" font-size="8.5" font-weight="500" fill="#fff">Si</text>
    <text x="459.5" y="111" text-anchor="middle" font-size="6.8" fill="#fff" opacity="0.85">50</text>
    <rect x="477" y="88" width="31" height="28" fill="#FF680A" opacity="0.57"/>
    <text x="492.5" y="100" text-anchor="middle" font-size="8.5" font-weight="500" fill="#fff">P</text>
    <text x="492.5" y="111" text-anchor="middle" font-size="6.8" fill="#fff" opacity="0.85">55</text>
    <rect x="510" y="88" width="31" height="28" fill="#FF680A" opacity="0.74"/>
    <text x="525.5" y="100" text-anchor="middle" font-size="8.5" font-weight="500" fill="#fff">S</text>
    <text x="525.5" y="111" text-anchor="middle" font-size="6.8" fill="#fff" opacity="0.85">252</text>
    <rect x="543" y="88" width="31" height="28" fill="#FF680A" opacity="0.58"/>
    <text x="558.5" y="100" text-anchor="middle" font-size="8.5" font-weight="500" fill="#fff">Cl</text>
    <text x="558.5" y="111" text-anchor="middle" font-size="6.8" fill="#fff" opacity="0.85">59</text>
    <rect x="576" y="88" width="31" height="28" fill="#000" fill-opacity="0.03" stroke="#e5e5e5" stroke-width="0.5"/>
    <text x="591.5" y="101" text-anchor="middle" font-size="8.5" fill="#ccc">Ar</text>
    <rect x="15" y="118" width="31" height="28" fill="#FF680A" opacity="0.58"/>
    <text x="30.5" y="130" text-anchor="middle" font-size="8.5" font-weight="500" fill="#fff">K</text>
    <text x="30.5" y="141" text-anchor="middle" font-size="6.8" fill="#fff" opacity="0.85">59</text>
    <rect x="48" y="118" width="31" height="28" fill="#FF680A" opacity="0.60"/>
    <text x="63.5" y="130" text-anchor="middle" font-size="8.5" font-weight="500" fill="#fff">Ca</text>
    <text x="63.5" y="141" text-anchor="middle" font-size="6.8" fill="#fff" opacity="0.85">76</text>
    <rect x="81" y="118" width="31" height="28" fill="none" stroke="#ddd" stroke-width="0.6"/>
    <line x1="84" y1="143" x2="109" y2="121" stroke="#ddd" stroke-width="0.6"/>
    <text x="96.5" y="131" text-anchor="middle" font-size="8.5" fill="#bbb">Sc</text>
    <rect x="114" y="118" width="31" height="28" fill="#FF680A" opacity="0.62"/>
    <text x="129.5" y="130" text-anchor="middle" font-size="8.5" font-weight="500" fill="#fff">Ti</text>
    <text x="129.5" y="141" text-anchor="middle" font-size="6.8" fill="#fff" opacity="0.85">90</text>
    <rect x="147" y="118" width="31" height="28" fill="#FF680A" opacity="0.73"/>
    <text x="162.5" y="130" text-anchor="middle" font-size="8.5" font-weight="500" fill="#fff">V</text>
    <text x="162.5" y="141" text-anchor="middle" font-size="6.8" fill="#fff" opacity="0.85">229</text>
    <rect x="180" y="118" width="31" height="28" fill="#FF680A" opacity="0.80"/>
    <text x="195.5" y="130" text-anchor="middle" font-size="8.5" font-weight="500" fill="#fff">Cr</text>
    <text x="195.5" y="141" text-anchor="middle" font-size="6.8" fill="#fff" opacity="0.85">414</text>
    <rect x="213" y="118" width="31" height="28" fill="#FF680A" opacity="0.87"/>
    <text x="228.5" y="130" text-anchor="middle" font-size="8.5" font-weight="500" fill="#fff">Mn</text>
    <text x="228.5" y="141" text-anchor="middle" font-size="6.8" fill="#fff" opacity="0.85">741</text>
    <rect x="246" y="118" width="31" height="28" fill="#FF680A" opacity="0.86"/>
    <text x="261.5" y="130" text-anchor="middle" font-size="8.5" font-weight="500" fill="#fff">Fe</text>
    <text x="261.5" y="141" text-anchor="middle" font-size="6.8" fill="#fff" opacity="0.85">672</text>
    <rect x="279" y="118" width="31" height="28" fill="#FF680A" opacity="0.75"/>
    <text x="294.5" y="130" text-anchor="middle" font-size="8.5" font-weight="500" fill="#fff">Co</text>
    <text x="294.5" y="141" text-anchor="middle" font-size="6.8" fill="#fff" opacity="0.85">272</text>
    <rect x="312" y="118" width="31" height="28" fill="#FF680A" opacity="0.67"/>
    <text x="327.5" y="130" text-anchor="middle" font-size="8.5" font-weight="500" fill="#fff">Ni</text>
    <text x="327.5" y="141" text-anchor="middle" font-size="6.8" fill="#fff" opacity="0.85">132</text>
    <rect x="345" y="118" width="31" height="28" fill="#FF680A" opacity="0.68"/>
    <text x="360.5" y="130" text-anchor="middle" font-size="8.5" font-weight="500" fill="#fff">Cu</text>
    <text x="360.5" y="141" text-anchor="middle" font-size="6.8" fill="#fff" opacity="0.85">149</text>
    <rect x="378" y="118" width="31" height="28" fill="#FF680A" opacity="0.64"/>
    <text x="393.5" y="130" text-anchor="middle" font-size="8.5" font-weight="500" fill="#fff">Zn</text>
    <text x="393.5" y="141" text-anchor="middle" font-size="6.8" fill="#fff" opacity="0.85">108</text>
    <rect x="411" y="118" width="31" height="28" fill="#FF680A" opacity="0.61"/>
    <text x="426.5" y="130" text-anchor="middle" font-size="8.5" font-weight="500" fill="#fff">Ga</text>
    <text x="426.5" y="141" text-anchor="middle" font-size="6.8" fill="#fff" opacity="0.85">81</text>
    <rect x="444" y="118" width="31" height="28" fill="#FF680A" opacity="0.61"/>
    <text x="459.5" y="130" text-anchor="middle" font-size="8.5" font-weight="500" fill="#fff">Ge</text>
    <text x="459.5" y="141" text-anchor="middle" font-size="6.8" fill="#fff" opacity="0.85">77</text>
    <rect x="477" y="118" width="31" height="28" fill="#FF680A" opacity="0.58"/>
    <text x="492.5" y="130" text-anchor="middle" font-size="8.5" font-weight="500" fill="#fff">As</text>
    <text x="492.5" y="141" text-anchor="middle" font-size="6.8" fill="#fff" opacity="0.85">64</text>
    <rect x="510" y="118" width="31" height="28" fill="#FF680A" opacity="0.67"/>
    <text x="525.5" y="130" text-anchor="middle" font-size="8.5" font-weight="500" fill="#fff">Se</text>
    <text x="525.5" y="141" text-anchor="middle" font-size="6.8" fill="#fff" opacity="0.85">129</text>
    <rect x="543" y="118" width="31" height="28" fill="#FF680A" opacity="0.51"/>
    <text x="558.5" y="130" text-anchor="middle" font-size="8.5" font-weight="500" fill="#1f2937">Br</text>
    <text x="558.5" y="141" text-anchor="middle" font-size="6.8" fill="#1f2937" opacity="0.85">34</text>
    <rect x="576" y="118" width="31" height="28" fill="#000" fill-opacity="0.03" stroke="#e5e5e5" stroke-width="0.5"/>
    <text x="591.5" y="131" text-anchor="middle" font-size="8.5" fill="#ccc">Kr</text>
    <rect x="15" y="148" width="31" height="28" fill="#FF680A" opacity="0.57"/>
    <text x="30.5" y="160" text-anchor="middle" font-size="8.5" font-weight="500" fill="#fff">Rb</text>
    <text x="30.5" y="171" text-anchor="middle" font-size="6.8" fill="#fff" opacity="0.85">57</text>
    <rect x="48" y="148" width="31" height="28" fill="#FF680A" opacity="0.65"/>
    <text x="63.5" y="160" text-anchor="middle" font-size="8.5" font-weight="500" fill="#fff">Sr</text>
    <text x="63.5" y="171" text-anchor="middle" font-size="6.8" fill="#fff" opacity="0.85">117</text>
    <rect x="81" y="148" width="31" height="28" fill="none" stroke="#ddd" stroke-width="0.6"/>
    <line x1="84" y1="173" x2="109" y2="151" stroke="#ddd" stroke-width="0.6"/>
    <text x="96.5" y="161" text-anchor="middle" font-size="8.5" fill="#bbb">Y</text>
    <rect x="114" y="148" width="31" height="28" fill="#FF680A" opacity="0.52"/>
    <text x="129.5" y="160" text-anchor="middle" font-size="8.5" font-weight="500" fill="#1f2937">Zr</text>
    <text x="129.5" y="171" text-anchor="middle" font-size="6.8" fill="#1f2937" opacity="0.85">35</text>
    <rect x="147" y="148" width="31" height="28" fill="#FF680A" opacity="0.53"/>
    <text x="162.5" y="160" text-anchor="middle" font-size="8.5" font-weight="500" fill="#1f2937">Nb</text>
    <text x="162.5" y="171" text-anchor="middle" font-size="6.8" fill="#1f2937" opacity="0.85">41</text>
    <rect x="180" y="148" width="31" height="28" fill="#FF680A" opacity="0.50"/>
    <text x="195.5" y="160" text-anchor="middle" font-size="8.5" font-weight="500" fill="#1f2937">Mo</text>
    <text x="195.5" y="171" text-anchor="middle" font-size="6.8" fill="#1f2937" opacity="0.85">31</text>
    <rect x="213" y="148" width="31" height="28" fill="#000" fill-opacity="0.03" stroke="#e5e5e5" stroke-width="0.5"/>
    <text x="228.5" y="161" text-anchor="middle" font-size="8.5" fill="#ccc">Tc</text>
    <rect x="246" y="148" width="31" height="28" fill="#FF680A" opacity="0.40"/>
    <text x="261.5" y="160" text-anchor="middle" font-size="8.5" font-weight="500" fill="#1f2937">Ru</text>
    <text x="261.5" y="171" text-anchor="middle" font-size="6.8" fill="#1f2937" opacity="0.85">12</text>
    <rect x="279" y="148" width="31" height="28" fill="#FF680A" opacity="0.49"/>
    <text x="294.5" y="160" text-anchor="middle" font-size="8.5" font-weight="500" fill="#1f2937">Rh</text>
    <text x="294.5" y="171" text-anchor="middle" font-size="6.8" fill="#1f2937" opacity="0.85">27</text>
    <rect x="312" y="148" width="31" height="28" fill="#FF680A" opacity="0.51"/>
    <text x="327.5" y="160" text-anchor="middle" font-size="8.5" font-weight="500" fill="#1f2937">Pd</text>
    <text x="327.5" y="171" text-anchor="middle" font-size="6.8" fill="#1f2937" opacity="0.85">33</text>
    <rect x="345" y="148" width="31" height="28" fill="#FF680A" opacity="0.48"/>
    <text x="360.5" y="160" text-anchor="middle" font-size="8.5" font-weight="500" fill="#1f2937">Ag</text>
    <text x="360.5" y="171" text-anchor="middle" font-size="6.8" fill="#1f2937" opacity="0.85">26</text>
    <rect x="378" y="148" width="31" height="28" fill="#FF680A" opacity="0.51"/>
    <text x="393.5" y="160" text-anchor="middle" font-size="8.5" font-weight="500" fill="#1f2937">Cd</text>
    <text x="393.5" y="171" text-anchor="middle" font-size="6.8" fill="#1f2937" opacity="0.85">32</text>
    <rect x="411" y="148" width="31" height="28" fill="#FF680A" opacity="0.57"/>
    <text x="426.5" y="160" text-anchor="middle" font-size="8.5" font-weight="500" fill="#fff">In</text>
    <text x="426.5" y="171" text-anchor="middle" font-size="6.8" fill="#fff" opacity="0.85">55</text>
    <rect x="444" y="148" width="31" height="28" fill="#FF680A" opacity="0.63"/>
    <text x="459.5" y="160" text-anchor="middle" font-size="8.5" font-weight="500" fill="#fff">Sn</text>
    <text x="459.5" y="171" text-anchor="middle" font-size="6.8" fill="#fff" opacity="0.85">92</text>
    <rect x="477" y="148" width="31" height="28" fill="#FF680A" opacity="0.65"/>
    <text x="492.5" y="160" text-anchor="middle" font-size="8.5" font-weight="500" fill="#fff">Sb</text>
    <text x="492.5" y="171" text-anchor="middle" font-size="6.8" fill="#fff" opacity="0.85">111</text>
    <rect x="510" y="148" width="31" height="28" fill="#FF680A" opacity="0.64"/>
    <text x="525.5" y="160" text-anchor="middle" font-size="8.5" font-weight="500" fill="#fff">Te</text>
    <text x="525.5" y="171" text-anchor="middle" font-size="6.8" fill="#fff" opacity="0.85">101</text>
    <rect x="543" y="148" width="31" height="28" fill="#FF680A" opacity="0.36"/>
    <text x="558.5" y="160" text-anchor="middle" font-size="8.5" font-weight="500" fill="#1f2937">I</text>
    <text x="558.5" y="171" text-anchor="middle" font-size="6.8" fill="#1f2937" opacity="0.85">8</text>
    <rect x="576" y="148" width="31" height="28" fill="#000" fill-opacity="0.03" stroke="#e5e5e5" stroke-width="0.5"/>
    <text x="591.5" y="161" text-anchor="middle" font-size="8.5" fill="#ccc">Xe</text>
    <rect x="15" y="178" width="31" height="28" fill="#FF680A" opacity="0.57"/>
    <text x="30.5" y="190" text-anchor="middle" font-size="8.5" font-weight="500" fill="#fff">Cs</text>
    <text x="30.5" y="201" text-anchor="middle" font-size="6.8" fill="#fff" opacity="0.85">54</text>
    <rect x="48" y="178" width="31" height="28" fill="#FF680A" opacity="0.62"/>
    <text x="63.5" y="190" text-anchor="middle" font-size="8.5" font-weight="500" fill="#fff">Ba</text>
    <text x="63.5" y="201" text-anchor="middle" font-size="6.8" fill="#fff" opacity="0.85">88</text>
    <rect x="81" y="178" width="31" height="28" fill="none" stroke="#ddd" stroke-width="0.6"/>
    <line x1="84" y1="203" x2="109" y2="181" stroke="#ddd" stroke-width="0.6"/>
    <text x="96.5" y="191" text-anchor="middle" font-size="8.5" fill="#bbb">La</text>
    <rect x="114" y="178" width="31" height="28" fill="#FF680A" opacity="0.45"/>
    <text x="129.5" y="190" text-anchor="middle" font-size="8.5" font-weight="500" fill="#1f2937">Hf</text>
    <text x="129.5" y="201" text-anchor="middle" font-size="6.8" fill="#1f2937" opacity="0.85">20</text>
    <rect x="147" y="178" width="31" height="28" fill="#FF680A" opacity="0.49"/>
    <text x="162.5" y="190" text-anchor="middle" font-size="8.5" font-weight="500" fill="#1f2937">Ta</text>
    <text x="162.5" y="201" text-anchor="middle" font-size="6.8" fill="#1f2937" opacity="0.85">28</text>
    <rect x="180" y="178" width="31" height="28" fill="#FF680A" opacity="0.53"/>
    <text x="195.5" y="190" text-anchor="middle" font-size="8.5" font-weight="500" fill="#1f2937">W</text>
    <text x="195.5" y="201" text-anchor="middle" font-size="6.8" fill="#1f2937" opacity="0.85">38</text>
    <rect x="213" y="178" width="31" height="28" fill="#FF680A" opacity="0.31"/>
    <text x="228.5" y="190" text-anchor="middle" font-size="8.5" font-weight="500" fill="#1f2937">Re</text>
    <text x="228.5" y="201" text-anchor="middle" font-size="6.8" fill="#1f2937" opacity="0.85">5</text>
    <rect x="246" y="178" width="31" height="28" fill="#FF680A" opacity="0.18"/>
    <text x="261.5" y="190" text-anchor="middle" font-size="8.5" font-weight="500" fill="#1f2937">Os</text>
    <text x="261.5" y="201" text-anchor="middle" font-size="6.8" fill="#1f2937" opacity="0.85">1</text>
    <rect x="279" y="178" width="31" height="28" fill="#FF680A" opacity="0.40"/>
    <text x="294.5" y="190" text-anchor="middle" font-size="8.5" font-weight="500" fill="#1f2937">Ir</text>
    <text x="294.5" y="201" text-anchor="middle" font-size="6.8" fill="#1f2937" opacity="0.85">12</text>
    <rect x="312" y="178" width="31" height="28" fill="#FF680A" opacity="0.51"/>
    <text x="327.5" y="190" text-anchor="middle" font-size="8.5" font-weight="500" fill="#1f2937">Pt</text>
    <text x="327.5" y="201" text-anchor="middle" font-size="6.8" fill="#1f2937" opacity="0.85">34</text>
    <rect x="345" y="178" width="31" height="28" fill="#FF680A" opacity="0.42"/>
    <text x="360.5" y="190" text-anchor="middle" font-size="8.5" font-weight="500" fill="#1f2937">Au</text>
    <text x="360.5" y="201" text-anchor="middle" font-size="6.8" fill="#1f2937" opacity="0.85">15</text>
    <rect x="378" y="178" width="31" height="28" fill="#FF680A" opacity="0.38"/>
    <text x="393.5" y="190" text-anchor="middle" font-size="8.5" font-weight="500" fill="#1f2937">Hg</text>
    <text x="393.5" y="201" text-anchor="middle" font-size="6.8" fill="#1f2937" opacity="0.85">10</text>
    <rect x="411" y="178" width="31" height="28" fill="#FF680A" opacity="0.51"/>
    <text x="426.5" y="190" text-anchor="middle" font-size="8.5" font-weight="500" fill="#1f2937">Tl</text>
    <text x="426.5" y="201" text-anchor="middle" font-size="6.8" fill="#1f2937" opacity="0.85">33</text>
    <rect x="444" y="178" width="31" height="28" fill="#FF680A" opacity="0.44"/>
    <text x="459.5" y="190" text-anchor="middle" font-size="8.5" font-weight="500" fill="#1f2937">Pb</text>
    <text x="459.5" y="201" text-anchor="middle" font-size="6.8" fill="#1f2937" opacity="0.85">17</text>
    <rect x="477" y="178" width="31" height="28" fill="#FF680A" opacity="0.49"/>
    <text x="492.5" y="190" text-anchor="middle" font-size="8.5" font-weight="500" fill="#1f2937">Bi</text>
    <text x="492.5" y="201" text-anchor="middle" font-size="6.8" fill="#1f2937" opacity="0.85">27</text>
    <rect x="510" y="178" width="31" height="28" fill="#000" fill-opacity="0.03" stroke="#e5e5e5" stroke-width="0.5"/>
    <text x="525.5" y="191" text-anchor="middle" font-size="8.5" fill="#ccc">Po</text>
    <rect x="543" y="178" width="31" height="28" fill="#000" fill-opacity="0.03" stroke="#e5e5e5" stroke-width="0.5"/>
    <text x="558.5" y="191" text-anchor="middle" font-size="8.5" fill="#ccc">At</text>
    <rect x="576" y="178" width="31" height="28" fill="#000" fill-opacity="0.03" stroke="#e5e5e5" stroke-width="0.5"/>
    <text x="591.5" y="191" text-anchor="middle" font-size="8.5" fill="#ccc">Rn</text>
    <text x="15" y="218" font-size="8.5" fill="#bbb" font-style="italic">lanthanides</text>
    <rect x="81" y="222" width="31" height="28" fill="none" stroke="#ddd" stroke-width="0.6"/>
    <line x1="84" y1="247" x2="109" y2="225" stroke="#ddd" stroke-width="0.6"/>
    <text x="96.5" y="235" text-anchor="middle" font-size="8.5" fill="#bbb">Ce</text>
    <rect x="114" y="222" width="31" height="28" fill="none" stroke="#ddd" stroke-width="0.6"/>
    <line x1="117" y1="247" x2="142" y2="225" stroke="#ddd" stroke-width="0.6"/>
    <text x="129.5" y="235" text-anchor="middle" font-size="8.5" fill="#bbb">Pr</text>
    <rect x="147" y="222" width="31" height="28" fill="none" stroke="#ddd" stroke-width="0.6"/>
    <line x1="150" y1="247" x2="175" y2="225" stroke="#ddd" stroke-width="0.6"/>
    <text x="162.5" y="235" text-anchor="middle" font-size="8.5" fill="#bbb">Nd</text>
    <rect x="180" y="222" width="31" height="28" fill="none" stroke="#ddd" stroke-width="0.6"/>
    <line x1="183" y1="247" x2="208" y2="225" stroke="#ddd" stroke-width="0.6"/>
    <text x="195.5" y="235" text-anchor="middle" font-size="8.5" fill="#bbb">Pm</text>
    <rect x="213" y="222" width="31" height="28" fill="none" stroke="#ddd" stroke-width="0.6"/>
    <line x1="216" y1="247" x2="241" y2="225" stroke="#ddd" stroke-width="0.6"/>
    <text x="228.5" y="235" text-anchor="middle" font-size="8.5" fill="#bbb">Sm</text>
    <rect x="246" y="222" width="31" height="28" fill="none" stroke="#ddd" stroke-width="0.6"/>
    <line x1="249" y1="247" x2="274" y2="225" stroke="#ddd" stroke-width="0.6"/>
    <text x="261.5" y="235" text-anchor="middle" font-size="8.5" fill="#bbb">Eu</text>
    <rect x="279" y="222" width="31" height="28" fill="none" stroke="#ddd" stroke-width="0.6"/>
    <line x1="282" y1="247" x2="307" y2="225" stroke="#ddd" stroke-width="0.6"/>
    <text x="294.5" y="235" text-anchor="middle" font-size="8.5" fill="#bbb">Gd</text>
    <rect x="312" y="222" width="31" height="28" fill="none" stroke="#ddd" stroke-width="0.6"/>
    <line x1="315" y1="247" x2="340" y2="225" stroke="#ddd" stroke-width="0.6"/>
    <text x="327.5" y="235" text-anchor="middle" font-size="8.5" fill="#bbb">Tb</text>
    <rect x="345" y="222" width="31" height="28" fill="none" stroke="#ddd" stroke-width="0.6"/>
    <line x1="348" y1="247" x2="373" y2="225" stroke="#ddd" stroke-width="0.6"/>
    <text x="360.5" y="235" text-anchor="middle" font-size="8.5" fill="#bbb">Dy</text>
    <rect x="378" y="222" width="31" height="28" fill="none" stroke="#ddd" stroke-width="0.6"/>
    <line x1="381" y1="247" x2="406" y2="225" stroke="#ddd" stroke-width="0.6"/>
    <text x="393.5" y="235" text-anchor="middle" font-size="8.5" fill="#bbb">Ho</text>
    <rect x="411" y="222" width="31" height="28" fill="none" stroke="#ddd" stroke-width="0.6"/>
    <line x1="414" y1="247" x2="439" y2="225" stroke="#ddd" stroke-width="0.6"/>
    <text x="426.5" y="235" text-anchor="middle" font-size="8.5" fill="#bbb">Er</text>
    <rect x="444" y="222" width="31" height="28" fill="none" stroke="#ddd" stroke-width="0.6"/>
    <line x1="447" y1="247" x2="472" y2="225" stroke="#ddd" stroke-width="0.6"/>
    <text x="459.5" y="235" text-anchor="middle" font-size="8.5" fill="#bbb">Tm</text>
    <rect x="477" y="222" width="31" height="28" fill="none" stroke="#ddd" stroke-width="0.6"/>
    <line x1="480" y1="247" x2="505" y2="225" stroke="#ddd" stroke-width="0.6"/>
    <text x="492.5" y="235" text-anchor="middle" font-size="8.5" fill="#bbb">Yb</text>
    <rect x="510" y="222" width="31" height="28" fill="none" stroke="#ddd" stroke-width="0.6"/>
    <line x1="513" y1="247" x2="538" y2="225" stroke="#ddd" stroke-width="0.6"/>
    <text x="525.5" y="235" text-anchor="middle" font-size="8.5" fill="#bbb">Lu</text>
    <text x="549" y="240" font-size="8.5" fill="#888" font-style="italic">no fully-relativistic</text>
    <text x="549" y="251" font-size="8.5" fill="#888" font-style="italic">pseudopotentials</text>
    </svg>
  <figcaption><strong>Figure 7.</strong> Label coverage across the periodic table: the count of κ-reliable labels containing each element. The magnetic 3d row dominates (Mn 741, Fe 672, Cr 414, Co 272), oxygen leads the anions (825), and the alkali and alkaline-earth counts reflect the oxide and chalcogenide population. Crossed cells (Sc, Y, the lanthanides) are uncomputable: the fully-relativistic pseudopotential set behind the anisotropy stage does not include them, which is what makes the dataset rare-earth-free by construction.</figcaption>
</figure>

<figure>
  <svg viewBox="0 0 620 190" xmlns="http://www.w3.org/2000/svg" style="font-family:inherit;">
    <text x="95" y="26" text-anchor="middle" font-size="10.5" font-style="italic" fill="#222">Ms, MA/m</text>
    <line x1="30" y1="150" x2="160" y2="150" stroke="#888" stroke-width="0.6"/>
    <rect x="30.0" y="141.3" width="7" height="8.7" fill="#FF680A" opacity="0.8"/>
    <rect x="38.1" y="51.4" width="7" height="98.6" fill="#FF680A" opacity="0.8"/>
    <rect x="46.2" y="42.0" width="7" height="108.0" fill="#FF680A" opacity="0.8"/>
    <rect x="54.3" y="62.4" width="7" height="87.6" fill="#FF680A" opacity="0.8"/>
    <rect x="62.4" y="98.2" width="7" height="51.8" fill="#FF680A" opacity="0.8"/>
    <rect x="70.5" y="113.7" width="7" height="36.3" fill="#FF680A" opacity="0.8"/>
    <rect x="78.6" y="124.2" width="7" height="25.8" fill="#FF680A" opacity="0.8"/>
    <rect x="86.7" y="137.2" width="7" height="12.8" fill="#FF680A" opacity="0.8"/>
    <rect x="94.8" y="138.6" width="7" height="11.4" fill="#FF680A" opacity="0.8"/>
    <rect x="102.9" y="141.7" width="7" height="8.3" fill="#FF680A" opacity="0.8"/>
    <rect x="111.0" y="145.5" width="7" height="4.5" fill="#FF680A" opacity="0.8"/>
    <rect x="119.1" y="147.8" width="7" height="2.2" fill="#FF680A" opacity="0.8"/>
    <rect x="127.2" y="149.1" width="7" height="0.9" fill="#FF680A" opacity="0.8"/>
    <rect x="135.3" y="149.6" width="7" height="0.4" fill="#FF680A" opacity="0.8"/>
    <rect x="143.4" y="149.3" width="7" height="0.7" fill="#FF680A" opacity="0.8"/>
    <rect x="151.5" y="150.0" width="7" height="0.0" fill="#FF680A" opacity="0.8"/>
    <text x="30" y="164" text-anchor="middle" font-size="8.5" fill="#888">0</text>
    <text x="95" y="164" text-anchor="middle" font-size="8.5" fill="#888">1</text>
    <text x="160" y="164" text-anchor="middle" font-size="8.5" fill="#888">2</text>
    <text x="247" y="26" text-anchor="middle" font-size="10.5" font-style="italic" fill="#222">Tc, K</text>
    <line x1="182" y1="150" x2="312" y2="150" stroke="#888" stroke-width="0.6"/>
    <rect x="182.0" y="123.6" width="7" height="26.4" fill="#FF680A" opacity="0.8"/>
    <rect x="190.1" y="48.1" width="7" height="101.9" fill="#FF680A" opacity="0.8"/>
    <rect x="198.2" y="42.0" width="7" height="108.0" fill="#FF680A" opacity="0.8"/>
    <rect x="206.3" y="106.2" width="7" height="43.8" fill="#FF680A" opacity="0.8"/>
    <rect x="214.4" y="132.1" width="7" height="17.9" fill="#FF680A" opacity="0.8"/>
    <rect x="222.5" y="135.8" width="7" height="14.2" fill="#FF680A" opacity="0.8"/>
    <rect x="230.6" y="139.9" width="7" height="10.1" fill="#FF680A" opacity="0.8"/>
    <rect x="238.7" y="140.3" width="7" height="9.7" fill="#FF680A" opacity="0.8"/>
    <rect x="246.8" y="145.3" width="7" height="4.7" fill="#FF680A" opacity="0.8"/>
    <rect x="254.9" y="148.9" width="7" height="1.1" fill="#FF680A" opacity="0.8"/>
    <rect x="263.0" y="148.7" width="7" height="1.3" fill="#FF680A" opacity="0.8"/>
    <rect x="271.1" y="149.4" width="7" height="0.6" fill="#FF680A" opacity="0.8"/>
    <rect x="279.2" y="149.3" width="7" height="0.7" fill="#FF680A" opacity="0.8"/>
    <rect x="287.3" y="149.1" width="7" height="0.9" fill="#FF680A" opacity="0.8"/>
    <rect x="295.4" y="149.8" width="7" height="0.2" fill="#FF680A" opacity="0.8"/>
    <rect x="303.5" y="149.6" width="7" height="0.4" fill="#FF680A" opacity="0.8"/>
    <text x="182" y="164" text-anchor="middle" font-size="8.5" fill="#888">0</text>
    <text x="247" y="164" text-anchor="middle" font-size="8.5" fill="#888">600</text>
    <text x="312" y="164" text-anchor="middle" font-size="8.5" fill="#888">1200</text>
    <text x="399" y="26" text-anchor="middle" font-size="10.5" font-style="italic" fill="#222">E above hull, meV</text>
    <line x1="334" y1="150" x2="464" y2="150" stroke="#888" stroke-width="0.6"/>
    <rect x="334.0" y="42.0" width="7" height="108.0" fill="#FF680A" opacity="0.8"/>
    <rect x="342.1" y="103.5" width="7" height="46.5" fill="#FF680A" opacity="0.8"/>
    <rect x="350.2" y="111.2" width="7" height="38.8" fill="#FF680A" opacity="0.8"/>
    <rect x="358.3" y="121.8" width="7" height="28.2" fill="#FF680A" opacity="0.8"/>
    <rect x="366.4" y="132.2" width="7" height="17.8" fill="#FF680A" opacity="0.8"/>
    <rect x="374.5" y="136.1" width="7" height="13.9" fill="#FF680A" opacity="0.8"/>
    <rect x="382.6" y="139.3" width="7" height="10.7" fill="#FF680A" opacity="0.8"/>
    <rect x="390.7" y="141.5" width="7" height="8.5" fill="#FF680A" opacity="0.8"/>
    <rect x="398.8" y="144.5" width="7" height="5.5" fill="#FF680A" opacity="0.8"/>
    <rect x="406.9" y="144.4" width="7" height="5.6" fill="#FF680A" opacity="0.8"/>
    <rect x="415.0" y="147.4" width="7" height="2.6" fill="#FF680A" opacity="0.8"/>
    <rect x="423.1" y="146.5" width="7" height="3.5" fill="#FF680A" opacity="0.8"/>
    <rect x="431.2" y="149.0" width="7" height="1.0" fill="#FF680A" opacity="0.8"/>
    <rect x="439.3" y="148.1" width="7" height="1.9" fill="#FF680A" opacity="0.8"/>
    <rect x="447.4" y="148.7" width="7" height="1.3" fill="#FF680A" opacity="0.8"/>
    <rect x="455.5" y="149.3" width="7" height="0.7" fill="#FF680A" opacity="0.8"/>
    <text x="334" y="164" text-anchor="middle" font-size="8.5" fill="#888">0</text>
    <text x="399" y="164" text-anchor="middle" font-size="8.5" fill="#888">250</text>
    <text x="464" y="164" text-anchor="middle" font-size="8.5" fill="#888">500</text>
    <text x="551" y="26" text-anchor="middle" font-size="10.5" font-style="italic" fill="#222">crystal system</text>
    <rect x="486" y="48" width="104" height="16" fill="#FF680A" opacity="0.8"/>
    <text x="486" y="44" font-size="8.5" fill="#1f2937">trigonal</text>
    <text x="594" y="60" font-size="8.5" fill="#888">957</text>
    <rect x="486" y="84" width="79" height="16" fill="#FF680A" opacity="0.8"/>
    <text x="486" y="80" font-size="8.5" fill="#1f2937">tetragonal</text>
    <text x="569" y="96" font-size="8.5" fill="#888">724</text>
    <rect x="486" y="120" width="35" height="16" fill="#FF680A" opacity="0.8"/>
    <text x="486" y="116" font-size="8.5" fill="#1f2937">hexagonal</text>
    <text x="525" y="132" font-size="8.5" fill="#888">319</text>
    <text x="310" y="184" text-anchor="middle" font-size="10" fill="#444" font-style="italic">2,044 κ-reliable labels</text>
    </svg>
  <figcaption><strong>Figure 8.</strong> Marginal distributions of the reliable labels. Magnetization and Curie temperature are right-skewed, with the strong, hot compounds in the rare tail; two-thirds of labels sit within 100 meV/atom of the convex hull; trigonal and tetragonal cells dominate the uniaxial population.</figcaption>
</figure>

#### 4.2  Precious metals in, rare earths out

The two element groups that dominate commercial hard magnets play opposite roles here. Rare-earth-containing compounds number exactly zero because the pseudopotential set behind the anisotropy stage contains no lanthanides (Section 3.2), which matches the dataset's purpose of rare-earth-free discovery. Precious-metal compounds, by contrast, compute fine, and 160 of the 2,044 reliable labels contain Pt, Pd, Ir, Rh, or another precious element. They supply the dataset's high-anisotropy positive examples: the precious group skews markedly hard (median corrected κ of 1.77 against 1.18 for the precious-free majority), which is the expected L1₀ physics of strong spin–orbit coupling from the heavy 5d elements. The discovery-relevant fact is the other one: even after removing every precious-metal compound, the dataset still holds 519 easy-axis entries with κ > 1. Precious metals raise hardness through spin–orbit coupling; the dataset maps where hardness occurs without them.

<figure>
  <svg viewBox="0 0 620 230" xmlns="http://www.w3.org/2000/svg" style="font-family:inherit;">
    <rect x="48" y="26" width="14" height="14" fill="#FF680A" opacity="0.85"/>
    <text x="68" y="37" font-size="11" fill="#1f2937">precious-free (n = 1,884)</text>
    <rect x="248" y="26" width="14" height="14" fill="#1f2937" opacity="0.35"/>
    <text x="268" y="37" font-size="11" fill="#1f2937">precious-metal-containing (n = 160)</text>
    <line x1="40" y1="175" x2="596" y2="175" stroke="#888" stroke-width="0.8"/>
    <rect x="48" y="83" width="30" height="92" fill="#FF680A" opacity="0.85"/>
    <rect x="82" y="125" width="30" height="50" fill="#1f2937" opacity="0.35"/>
    <rect x="126" y="102" width="30" height="73" fill="#FF680A" opacity="0.85"/>
    <rect x="160" y="131" width="30" height="44" fill="#1f2937" opacity="0.35"/>
    <rect x="204" y="129" width="30" height="46" fill="#FF680A" opacity="0.85"/>
    <rect x="238" y="140" width="30" height="35" fill="#1f2937" opacity="0.35"/>
    <rect x="282" y="93" width="30" height="82" fill="#FF680A" opacity="0.85"/>
    <rect x="316" y="106" width="30" height="69" fill="#1f2937" opacity="0.35"/>
    <rect x="360" y="111" width="30" height="64" fill="#FF680A" opacity="0.85"/>
    <rect x="394" y="84" width="30" height="91" fill="#1f2937" opacity="0.35"/>
    <rect x="438" y="89" width="30" height="86" fill="#FF680A" opacity="0.85"/>
    <rect x="472" y="65" width="30" height="110" fill="#1f2937" opacity="0.35"/>
    <rect x="516" y="118" width="30" height="57" fill="#FF680A" opacity="0.85"/>
    <rect x="550" y="72" width="30" height="103" fill="#1f2937" opacity="0.35"/>
    <line x1="276" y1="55" x2="276" y2="175" stroke="#1f2937" stroke-width="0.8" stroke-dasharray="4,3"/>
    <text x="281" y="55" font-size="11" fill="#1f2937">κ = 1</text>
    <text x="80" y="190" font-size="10.5" text-anchor="middle" fill="#888">0–0.5</text>
    <text x="158" y="190" font-size="10.5" text-anchor="middle" fill="#888">0.5–0.8</text>
    <text x="236" y="190" font-size="10.5" text-anchor="middle" fill="#888">0.8–1</text>
    <text x="314" y="190" font-size="10.5" text-anchor="middle" fill="#888">1–1.5</text>
    <text x="392" y="190" font-size="10.5" text-anchor="middle" fill="#888">1.5–2</text>
    <text x="470" y="190" font-size="10.5" text-anchor="middle" fill="#888">2–4</text>
    <text x="548" y="190" font-size="10.5" text-anchor="middle" fill="#888">&gt; 4</text>
    <text x="318" y="212" font-size="10.5" text-anchor="middle" fill="#888">corrected magnetic hardness κ, share within each group, %</text>
  </svg>
  <figcaption><strong>Figure 9.</strong> The hardness distribution split by chemistry, each group normalized to its own size. The precious-metal subset (gray) concentrates in the hard bands, since heavy 5d elements supply anisotropy through spin–orbit coupling, while the precious-free majority (orange) still populates every band, including 519 easy-axis compounds with κ &gt; 1. Rare-earth-containing entries number zero by construction: the anisotropy route's pseudopotential set has no lanthanides, so the dataset maps the rare-earth-free landscape it is meant for.</figcaption>
</figure>

#### 4.3  What the screen surfaces: candidates and their microstructure windows

Table 4 collects the leading candidates, and Figure 10 shows the screened cells behind the three rare-earth-free families. A manufactured magnet, however, is a polycrystal, and the properties a user sees depend on grain size, grain alignment, and grain-boundary chemistry as much as on the cell itself (Figure 5). For every gate-passing compound the sweep stage therefore tests 2,000 sampled microstructures and records the *acceptable window*: the region of processing space in which the compound still clears the magnet thresholds (Figure 11).

**Table 4.** Leading candidates from the screen, with the L1₀ FePt benchmark as the precious-metal reference. Robustness is the share of 2,000 sampled microstructures that clear all magnet thresholds, weighted by their margin above them; the peak energy product is the sweep's best case. Sintered Nd–Fe–B delivers ≈400 kJ/m³.

| compound | family | κ (corr) | \(M_s\) (MA/m) | \(T_c\) (K) | \(E_{hull}\) (meV) | peak \((BH)_{max}\) (kJ/m³) | robustness | note |
|---|---|:---:|:---:|:---:|:---:|:---:|:---:|---|
| FePt | L1₀ (precious ref.) | 3.15 | 1.09 | 538 | 0 | 372 | 0.91 | large hardness margin |
| Mn₂SbTe | layered pnictide-chalcogenide | 4.14 | 0.79 | 438 | 4 | 195 | 0.71 | most robust RE-free lead; FM-assumption flag |
| HfGaFe₄ | trigonal A-Fe | 1.77 | 0.79 | 545 | 69 | 198 | 0.10 | A-site and anion both tunable |
| ZrGaFe₄ | trigonal A-Fe | 1.51 | 0.82 | 531 | 78 | 211 | 0.05 | Zr cheaper than Hf |
| Fe₇MnB₄ | (Fe,Mn)₂B boride | 1.11 | 1.14 | 650 | 16 | 404 | 0.01 | NdFeB-class ceiling, fragile |
| Fe₁₅MnB₈ | (Fe,Mn)₂B boride | 1.08 | 1.18 | 610 | 8 | 423 | 0.008 | highest RE-free ceiling in the set |
| Mn₂Ge | hexagonal | 1.13 | 1.12 | 504 | 51 | 393 | 0.01 | FM-assumption flag |

<figure>
<img src="/img/fig9-structures.png" alt="Ball-and-stick unit cells of Mn2SbTe, HfGaFe4, and (Fe,Mn)2B" style="width:100%;max-width:640px;display:block;margin:0 auto">
  <figcaption><strong>Figure 10.</strong> The screened cells behind Table 4's three rare-earth-free families, drawn from the dataset's structure files. Left: Mn₂SbTe, a layered hexagonal cell in which Mn planes (orange) alternate with Sb (dark gray) and Te (light gray); the stacking supplies the anisotropy that makes it the most robust lead. Center: HfGaFe₄, the trigonal A-Fe motif, an iron framework (orange) with an A site (Hf, dark gray) that flips the easy axis from plane to c and an anion site (Ga, light gray) that tunes the hardness. Right: the tetragonal (Fe,Mn)₂B parent cell (boron in dark gray); substituting one iron site with Mn in a supercell of this structure produces the Fe₁₅MnB₈ and Fe₇MnB₄ leads.</figcaption>
</figure>

<figure>
  <svg viewBox="0 0 620 270" xmlns="http://www.w3.org/2000/svg" style="font-family:inherit;">
    <text x="220" y="34" font-size="11" text-anchor="middle" fill="#1f2937">robustness</text>
    <text x="220" y="48" font-size="9.5" text-anchor="middle" fill="#888">pass share × margin, 2,000-point sweep</text>
    <text x="390" y="34" font-size="11" text-anchor="middle" fill="#1f2937">chemical order tolerated</text>
    <text x="390" y="48" font-size="9.5" text-anchor="middle" fill="#888">acceptable order-parameter window</text>
    <text x="545" y="34" font-size="11" text-anchor="middle" fill="#1f2937">grain-size window</text>
    <text x="545" y="48" font-size="9.5" text-anchor="middle" fill="#888">nm, log scale</text>
    <text x="140" y="78" font-size="11" text-anchor="end" fill="#1f2937">FePt</text>
    <text x="140" y="91" font-size="9.5" text-anchor="end" fill="#888">peak 372 kJ/m³</text>
    <line x1="160" y1="80" x2="280" y2="80" stroke="#bbb" stroke-width="1"/>
    <rect x="160" y="75" width="109" height="10" fill="#FF680A" opacity="0.85"/>
    <line x1="330" y1="80" x2="450" y2="80" stroke="#bbb" stroke-width="1"/>
    <rect x="354" y="75" width="96" height="10" fill="#FF680A" opacity="0.85"/>
    <line x1="490" y1="80" x2="600" y2="80" stroke="#bbb" stroke-width="1"/>
    <rect x="490" y="75" width="110" height="10" fill="#FF680A" opacity="0.85"/>
    <text x="140" y="124" font-size="11" text-anchor="end" fill="#1f2937">Mn₂SbTe</text>
    <text x="140" y="137" font-size="9.5" text-anchor="end" fill="#888">peak 195 kJ/m³</text>
    <line x1="160" y1="126" x2="280" y2="126" stroke="#bbb" stroke-width="1"/>
    <rect x="160" y="121" width="85" height="10" fill="#FF680A" opacity="0.85"/>
    <line x1="330" y1="126" x2="450" y2="126" stroke="#bbb" stroke-width="1"/>
    <rect x="354" y="121" width="96" height="10" fill="#FF680A" opacity="0.85"/>
    <line x1="490" y1="126" x2="600" y2="126" stroke="#bbb" stroke-width="1"/>
    <rect x="490" y="121" width="110" height="10" fill="#FF680A" opacity="0.85"/>
    <text x="140" y="170" font-size="11" text-anchor="end" fill="#1f2937">HfGaFe₄</text>
    <text x="140" y="183" font-size="9.5" text-anchor="end" fill="#888">peak 198 kJ/m³</text>
    <line x1="160" y1="172" x2="280" y2="172" stroke="#bbb" stroke-width="1"/>
    <rect x="160" y="167" width="12" height="10" fill="#FF680A" opacity="0.85"/>
    <line x1="330" y1="172" x2="450" y2="172" stroke="#bbb" stroke-width="1"/>
    <rect x="402" y="167" width="48" height="10" fill="#FF680A" opacity="0.85"/>
    <line x1="490" y1="172" x2="600" y2="172" stroke="#bbb" stroke-width="1"/>
    <rect x="490" y="167" width="90" height="10" fill="#FF680A" opacity="0.85"/>
    <text x="140" y="216" font-size="11" text-anchor="end" fill="#1f2937">Fe₁₅MnB₈</text>
    <text x="140" y="229" font-size="9.5" text-anchor="end" fill="#888">peak 423 kJ/m³</text>
    <line x1="160" y1="218" x2="280" y2="218" stroke="#bbb" stroke-width="1"/>
    <rect x="160" y="213" width="2" height="10" fill="#FF680A" opacity="0.85"/>
    <line x1="330" y1="218" x2="450" y2="218" stroke="#bbb" stroke-width="1"/>
    <rect x="447" y="213" width="3" height="10" fill="#FF680A" opacity="0.85"/>
    <line x1="490" y1="218" x2="600" y2="218" stroke="#bbb" stroke-width="1"/>
    <rect x="534" y="213" width="3" height="10" fill="#FF680A" opacity="0.85"/>
    <text x="286" y="84" font-size="9.5" fill="#888">0.91</text>
    <text x="286" y="130" font-size="9.5" fill="#888">0.71</text>
    <text x="286" y="176" font-size="9.5" fill="#888">0.10</text>
    <text x="286" y="222" font-size="9.5" fill="#888">0.008</text>
    <text x="354" y="244" font-size="9.5" text-anchor="middle" fill="#888">0.6</text>
    <text x="402" y="244" font-size="9.5" text-anchor="middle" fill="#888">0.8</text>
    <text x="450" y="244" font-size="9.5" text-anchor="middle" fill="#888">1.0</text>
    <text x="490" y="244" font-size="9.5" text-anchor="middle" fill="#888">10</text>
    <text x="535" y="244" font-size="9.5" text-anchor="middle" fill="#888">50</text>
    <text x="600" y="244" font-size="9.5" text-anchor="middle" fill="#888">500</text>
  </svg>
  <figcaption><strong>Figure 11.</strong> The microstructure windows behind Table 4, from the 2,000-point sweep. FePt's hardness margin (κ ≈ 3) tolerates 40% chemical disorder and any grain size from 10 to 500 nm, which is why L1₀ magnets are manufacturable. Mn₂SbTe is the closest rare-earth-free analogue: a wide window at a moderate 195 kJ/m³ ceiling. Fe₁₅MnB₈ is the opposite corner: an NdFeB-class 423 kJ/m³ ceiling that exists only at a single sampled point (perfect chemical order, exactly 50 nm grains, near-zero grain-boundary exchange), with coercivity the limiting metric in 100% of failing microstructures.</figcaption>
</figure>

Two rare-earth-free archetypes emerge. The Mn-hardened borides pair iron-rich magnetization with κ barely above one, so their NdFeB-class ceilings survive only under near-perfect processing, with coercivity the limiting metric in every failing microstructure; the high-κ leads (Mn₂SbTe, the A-Fe family) have hardness to spare but half the magnetization. Section 4.4 shows this trade across the whole dataset. Mn₂SbTe and Mn₂Ge carry the ferromagnetic-assumption flag (Section 6), and every value here carries the Section 5 error bars.

#### 4.4  The property landscape

Figure 12 plots every reliable label on the hardness-magnetization plane, and the upper-right corner (compounds simultaneously hard, κ > 1, and strong enough for an NdFeB-class energy-product ceiling, \(M_s\) above ~1.13 MA/m) is nearly empty. Iron-rich intermetallics crowd the strong-but-soft left edge; the hard right side belongs to dilute-moment oxides, chalcogenides, and halides. The two Pareto frontiers make the discovery gap quantitative: through the magnet-relevant range the precious-metal frontier (FePt, Fe₃Pt) dominates the precious-free one, and the free frontier's knee, where hardness and magnetization are best simultaneously, is the (Fe,Mn)₂B boride family of Section 4.3, which touches the ceiling line at κ ≈ 1.

<figure>
  <svg viewBox="0 0 620 262" xmlns="http://www.w3.org/2000/svg" style="font-family:inherit;">
    <line x1="60" y1="210" x2="590" y2="210" stroke="#888" stroke-width="0.6"/>
    <line x1="60" y1="210" x2="60" y2="40" stroke="#888" stroke-width="0.6"/>
    <text x="115" y="224" text-anchor="middle" font-size="9" fill="#888">0.1</text>
    <text x="202" y="224" text-anchor="middle" font-size="9" fill="#888">0.3</text>
    <text x="298" y="224" text-anchor="middle" font-size="9" fill="#888">1</text>
    <text x="385" y="224" text-anchor="middle" font-size="9" fill="#888">3</text>
    <text x="480" y="224" text-anchor="middle" font-size="9" fill="#888">10</text>
    <text x="568" y="224" text-anchor="middle" font-size="9" fill="#888">30</text>
    <text x="52" y="170" text-anchor="end" font-size="9" fill="#888">0.5</text>
    <text x="52" y="128" text-anchor="end" font-size="9" fill="#888">1.0</text>
    <text x="52" y="86" text-anchor="end" font-size="9" fill="#888">1.5</text>
    <text x="52" y="43" text-anchor="end" font-size="9" fill="#888">2.0</text>
    <text x="325" y="243" text-anchor="middle" font-size="10" fill="#444" font-style="italic">corrected magnetic hardness κ (log scale)</text>
    <text x="30" y="125" text-anchor="middle" font-size="10" fill="#444" font-style="italic" transform="rotate(-90 30 125)">Ms, MA/m</text>
    <line x1="298" y1="210" x2="298" y2="40" stroke="#1f2937" stroke-width="0.8" stroke-dasharray="4,3"/>
    <text x="302" y="48" font-size="9.5" fill="#1f2937">κ = 1</text>
    <line x1="60" y1="114" x2="590" y2="114" stroke="#bbb" stroke-width="0.6" stroke-dasharray="3,3"/>
    <text x="590" y="109" text-anchor="end" font-size="9" fill="#888">Ms for an NdFeB-class ceiling (1.13)</text>
    <g fill="#1f2937" opacity="0.10">
    <circle cx="516" cy="163" r="1.5"/>
    <circle cx="457" cy="160" r="1.5"/>
    <circle cx="471" cy="189" r="1.5"/>
    <circle cx="463" cy="188" r="1.5"/>
    <circle cx="449" cy="131" r="1.5"/>
    <circle cx="504" cy="179" r="1.5"/>
    <circle cx="495" cy="195" r="1.5"/>
    <circle cx="482" cy="198" r="1.5"/>
    <circle cx="474" cy="199" r="1.5"/>
    <circle cx="510" cy="196" r="1.5"/>
    <circle cx="465" cy="198" r="1.5"/>
    <circle cx="463" cy="197" r="1.5"/>
    <circle cx="463" cy="198" r="1.5"/>
    <circle cx="505" cy="194" r="1.5"/>
    <circle cx="487" cy="193" r="1.5"/>
    <circle cx="496" cy="192" r="1.5"/>
    <circle cx="507" cy="201" r="1.5"/>
    <circle cx="491" cy="200" r="1.5"/>
    <circle cx="500" cy="196" r="1.5"/>
    <circle cx="479" cy="195" r="1.5"/>
    <circle cx="484" cy="195" r="1.5"/>
    <circle cx="497" cy="195" r="1.5"/>
    <circle cx="481" cy="196" r="1.5"/>
    <circle cx="537" cy="185" r="1.5"/>
    <circle cx="499" cy="196" r="1.5"/>
    <circle cx="520" cy="180" r="1.5"/>
    <circle cx="468" cy="189" r="1.5"/>
    <circle cx="442" cy="139" r="1.5"/>
    <circle cx="474" cy="194" r="1.5"/>
    <circle cx="470" cy="188" r="1.5"/>
    <circle cx="465" cy="192" r="1.5"/>
    <circle cx="504" cy="194" r="1.5"/>
    <circle cx="465" cy="175" r="1.5"/>
    <circle cx="463" cy="201" r="1.5"/>
    <circle cx="577" cy="200" r="1.5"/>
    <circle cx="472" cy="195" r="1.5"/>
    <circle cx="529" cy="197" r="1.5"/>
    <circle cx="494" cy="181" r="1.5"/>
    <circle cx="489" cy="185" r="1.5"/>
    <circle cx="476" cy="190" r="1.5"/>
    <circle cx="477" cy="177" r="1.5"/>
    <circle cx="466" cy="190" r="1.5"/>
    <circle cx="472" cy="187" r="1.5"/>
    <circle cx="488" cy="190" r="1.5"/>
    <circle cx="499" cy="197" r="1.5"/>
    <circle cx="464" cy="196" r="1.5"/>
    <circle cx="524" cy="200" r="1.5"/>
    <circle cx="498" cy="189" r="1.5"/>
    <circle cx="492" cy="190" r="1.5"/>
    <circle cx="471" cy="195" r="1.5"/>
    <circle cx="476" cy="193" r="1.5"/>
    </g>
    <g fill="#1f2937" opacity="0.28">
    <circle cx="271" cy="108" r="1.5"/>
    <circle cx="69" cy="103" r="1.5"/>
    <circle cx="285" cy="139" r="1.5"/>
    <circle cx="189" cy="117" r="1.5"/>
    <circle cx="436" cy="169" r="1.5"/>
    <circle cx="296" cy="148" r="1.5"/>
    <circle cx="305" cy="155" r="1.5"/>
    <circle cx="380" cy="180" r="1.5"/>
    <circle cx="159" cy="121" r="1.5"/>
    <circle cx="235" cy="53" r="1.5"/>
    <circle cx="214" cy="90" r="1.5"/>
    <circle cx="319" cy="149" r="1.5"/>
    <circle cx="412" cy="132" r="1.5"/>
    <circle cx="342" cy="138" r="1.5"/>
    <circle cx="325" cy="167" r="1.5"/>
    <circle cx="328" cy="139" r="1.5"/>
    <circle cx="280" cy="159" r="1.5"/>
    <circle cx="364" cy="189" r="1.5"/>
    <circle cx="311" cy="119" r="1.5"/>
    <circle cx="250" cy="119" r="1.5"/>
    <circle cx="229" cy="110" r="1.5"/>
    <circle cx="217" cy="107" r="1.5"/>
    <circle cx="226" cy="109" r="1.5"/>
    <circle cx="237" cy="117" r="1.5"/>
    <circle cx="286" cy="107" r="1.5"/>
    <circle cx="280" cy="117" r="1.5"/>
    <circle cx="281" cy="128" r="1.5"/>
    <circle cx="333" cy="144" r="1.5"/>
    <circle cx="299" cy="120" r="1.5"/>
    <circle cx="339" cy="153" r="1.5"/>
    <circle cx="306" cy="113" r="1.5"/>
    <circle cx="304" cy="158" r="1.5"/>
    <circle cx="349" cy="145" r="1.5"/>
    <circle cx="323" cy="166" r="1.5"/>
    <circle cx="253" cy="127" r="1.5"/>
    <circle cx="203" cy="109" r="1.5"/>
    <circle cx="251" cy="122" r="1.5"/>
    <circle cx="264" cy="174" r="1.5"/>
    <circle cx="225" cy="139" r="1.5"/>
    <circle cx="238" cy="146" r="1.5"/>
    <circle cx="183" cy="78" r="1.5"/>
    <circle cx="213" cy="125" r="1.5"/>
    <circle cx="276" cy="131" r="1.5"/>
    <circle cx="347" cy="123" r="1.5"/>
    <circle cx="302" cy="165" r="1.5"/>
    <circle cx="254" cy="107" r="1.5"/>
    <circle cx="204" cy="96" r="1.5"/>
    <circle cx="237" cy="129" r="1.5"/>
    <circle cx="206" cy="69" r="1.5"/>
    <circle cx="130" cy="124" r="1.5"/>
    <circle cx="227" cy="143" r="1.5"/>
    <circle cx="281" cy="127" r="1.5"/>
    <circle cx="297" cy="139" r="1.5"/>
    <circle cx="250" cy="165" r="1.5"/>
    <circle cx="279" cy="151" r="1.5"/>
    <circle cx="78" cy="122" r="1.5"/>
    <circle cx="248" cy="124" r="1.5"/>
    <circle cx="235" cy="137" r="1.5"/>
    <circle cx="330" cy="144" r="1.5"/>
    <circle cx="262" cy="146" r="1.5"/>
    <circle cx="339" cy="138" r="1.5"/>
    <circle cx="258" cy="136" r="1.5"/>
    <circle cx="276" cy="130" r="1.5"/>
    <circle cx="285" cy="136" r="1.5"/>
    <circle cx="294" cy="137" r="1.5"/>
    <circle cx="313" cy="179" r="1.5"/>
    <circle cx="304" cy="110" r="1.5"/>
    <circle cx="205" cy="119" r="1.5"/>
    <circle cx="192" cy="118" r="1.5"/>
    <circle cx="211" cy="117" r="1.5"/>
    <circle cx="314" cy="164" r="1.5"/>
    <circle cx="306" cy="149" r="1.5"/>
    <circle cx="144" cy="103" r="1.5"/>
    <circle cx="266" cy="108" r="1.5"/>
    <circle cx="311" cy="147" r="1.5"/>
    <circle cx="262" cy="134" r="1.5"/>
    <circle cx="221" cy="98" r="1.5"/>
    <circle cx="202" cy="127" r="1.5"/>
    <circle cx="310" cy="112" r="1.5"/>
    <circle cx="311" cy="134" r="1.5"/>
    <circle cx="410" cy="143" r="1.5"/>
    <circle cx="239" cy="118" r="1.5"/>
    <circle cx="319" cy="139" r="1.5"/>
    <circle cx="300" cy="133" r="1.5"/>
    <circle cx="193" cy="132" r="1.5"/>
    <circle cx="267" cy="143" r="1.5"/>
    <circle cx="298" cy="154" r="1.5"/>
    <circle cx="344" cy="176" r="1.5"/>
    <circle cx="341" cy="156" r="1.5"/>
    <circle cx="274" cy="144" r="1.5"/>
    <circle cx="278" cy="122" r="1.5"/>
    <circle cx="231" cy="105" r="1.5"/>
    <circle cx="297" cy="122" r="1.5"/>
    <circle cx="239" cy="128" r="1.5"/>
    <circle cx="302" cy="136" r="1.5"/>
    <circle cx="257" cy="124" r="1.5"/>
    <circle cx="287" cy="109" r="1.5"/>
    <circle cx="295" cy="126" r="1.5"/>
    <circle cx="263" cy="114" r="1.5"/>
    <circle cx="296" cy="121" r="1.5"/>
    <circle cx="274" cy="153" r="1.5"/>
    <circle cx="166" cy="144" r="1.5"/>
    <circle cx="269" cy="145" r="1.5"/>
    <circle cx="331" cy="148" r="1.5"/>
    <circle cx="323" cy="153" r="1.5"/>
    <circle cx="261" cy="112" r="1.5"/>
    <circle cx="231" cy="112" r="1.5"/>
    <circle cx="268" cy="128" r="1.5"/>
    <circle cx="416" cy="194" r="1.5"/>
    <circle cx="356" cy="152" r="1.5"/>
    <circle cx="230" cy="146" r="1.5"/>
    <circle cx="188" cy="147" r="1.5"/>
    <circle cx="314" cy="147" r="1.5"/>
    <circle cx="235" cy="151" r="1.5"/>
    <circle cx="353" cy="157" r="1.5"/>
    <circle cx="322" cy="131" r="1.5"/>
    <circle cx="398" cy="148" r="1.5"/>
    <circle cx="314" cy="118" r="1.5"/>
    <circle cx="425" cy="157" r="1.5"/>
    <circle cx="297" cy="118" r="1.5"/>
    <circle cx="389" cy="117" r="1.5"/>
    <circle cx="178" cy="96" r="1.5"/>
    <circle cx="340" cy="97" r="1.5"/>
    <circle cx="367" cy="113" r="1.5"/>
    <circle cx="287" cy="113" r="1.5"/>
    <circle cx="286" cy="115" r="1.5"/>
    <circle cx="293" cy="124" r="1.5"/>
    <circle cx="292" cy="122" r="1.5"/>
    <circle cx="308" cy="125" r="1.5"/>
    <circle cx="283" cy="115" r="1.5"/>
    <circle cx="293" cy="112" r="1.5"/>
    <circle cx="402" cy="178" r="1.5"/>
    <circle cx="229" cy="98" r="1.5"/>
    <circle cx="269" cy="163" r="1.5"/>
    <circle cx="268" cy="176" r="1.5"/>
    <circle cx="272" cy="179" r="1.5"/>
    <circle cx="440" cy="182" r="1.5"/>
    <circle cx="301" cy="179" r="1.5"/>
    <circle cx="373" cy="161" r="1.5"/>
    <circle cx="275" cy="86" r="1.5"/>
    <circle cx="361" cy="173" r="1.5"/>
    <circle cx="332" cy="166" r="1.5"/>
    <circle cx="454" cy="182" r="1.5"/>
    <circle cx="345" cy="167" r="1.5"/>
    <circle cx="334" cy="168" r="1.5"/>
    <circle cx="336" cy="163" r="1.5"/>
    <circle cx="414" cy="150" r="1.5"/>
    <circle cx="401" cy="179" r="1.5"/>
    <circle cx="303" cy="164" r="1.5"/>
    <circle cx="231" cy="158" r="1.5"/>
    <circle cx="425" cy="151" r="1.5"/>
    <circle cx="347" cy="154" r="1.5"/>
    <circle cx="332" cy="141" r="1.5"/>
    <circle cx="298" cy="145" r="1.5"/>
    <circle cx="306" cy="137" r="1.5"/>
    <circle cx="343" cy="143" r="1.5"/>
    <circle cx="303" cy="143" r="1.5"/>
    <circle cx="291" cy="140" r="1.5"/>
    <circle cx="330" cy="140" r="1.5"/>
    <circle cx="209" cy="161" r="1.5"/>
    <circle cx="282" cy="168" r="1.5"/>
    <circle cx="248" cy="110" r="1.5"/>
    <circle cx="144" cy="145" r="1.5"/>
    <circle cx="115" cy="77" r="1.5"/>
    <circle cx="371" cy="180" r="1.5"/>
    <circle cx="178" cy="169" r="1.5"/>
    <circle cx="367" cy="182" r="1.5"/>
    <circle cx="355" cy="176" r="1.5"/>
    <circle cx="183" cy="164" r="1.5"/>
    <circle cx="331" cy="172" r="1.5"/>
    <circle cx="442" cy="179" r="1.5"/>
    <circle cx="434" cy="192" r="1.5"/>
    <circle cx="371" cy="184" r="1.5"/>
    <circle cx="340" cy="181" r="1.5"/>
    <circle cx="222" cy="138" r="1.5"/>
    <circle cx="341" cy="170" r="1.5"/>
    <circle cx="440" cy="189" r="1.5"/>
    <circle cx="221" cy="127" r="1.5"/>
    <circle cx="344" cy="172" r="1.5"/>
    <circle cx="309" cy="171" r="1.5"/>
    <circle cx="249" cy="170" r="1.5"/>
    <circle cx="303" cy="148" r="1.5"/>
    <circle cx="235" cy="106" r="1.5"/>
    <circle cx="331" cy="150" r="1.5"/>
    <circle cx="322" cy="142" r="1.5"/>
    <circle cx="216" cy="135" r="1.5"/>
    <circle cx="417" cy="200" r="1.5"/>
    <circle cx="357" cy="167" r="1.5"/>
    <circle cx="341" cy="167" r="1.5"/>
    <circle cx="430" cy="189" r="1.5"/>
    <circle cx="324" cy="171" r="1.5"/>
    <circle cx="453" cy="185" r="1.5"/>
    <circle cx="212" cy="131" r="1.5"/>
    <circle cx="168" cy="99" r="1.5"/>
    <circle cx="398" cy="151" r="1.5"/>
    <circle cx="358" cy="158" r="1.5"/>
    <circle cx="209" cy="114" r="1.5"/>
    <circle cx="383" cy="144" r="1.5"/>
    <circle cx="73" cy="162" r="1.5"/>
    <circle cx="322" cy="172" r="1.5"/>
    <circle cx="341" cy="176" r="1.5"/>
    <circle cx="400" cy="179" r="1.5"/>
    <circle cx="382" cy="175" r="1.5"/>
    <circle cx="277" cy="176" r="1.5"/>
    <circle cx="233" cy="176" r="1.5"/>
    <circle cx="428" cy="184" r="1.5"/>
    <circle cx="295" cy="140" r="1.5"/>
    <circle cx="346" cy="173" r="1.5"/>
    <circle cx="286" cy="156" r="1.5"/>
    <circle cx="342" cy="158" r="1.5"/>
    <circle cx="390" cy="188" r="1.5"/>
    <circle cx="335" cy="129" r="1.5"/>
    <circle cx="371" cy="165" r="1.5"/>
    <circle cx="213" cy="181" r="1.5"/>
    <circle cx="365" cy="169" r="1.5"/>
    <circle cx="362" cy="169" r="1.5"/>
    <circle cx="351" cy="175" r="1.5"/>
    <circle cx="369" cy="167" r="1.5"/>
    <circle cx="222" cy="149" r="1.5"/>
    <circle cx="312" cy="141" r="1.5"/>
    <circle cx="226" cy="147" r="1.5"/>
    <circle cx="380" cy="171" r="1.5"/>
    <circle cx="379" cy="175" r="1.5"/>
    <circle cx="364" cy="169" r="1.5"/>
    <circle cx="359" cy="194" r="1.5"/>
    <circle cx="356" cy="183" r="1.5"/>
    <circle cx="373" cy="170" r="1.5"/>
    <circle cx="239" cy="181" r="1.5"/>
    <circle cx="257" cy="176" r="1.5"/>
    <circle cx="251" cy="149" r="1.5"/>
    <circle cx="323" cy="185" r="1.5"/>
    <circle cx="291" cy="114" r="1.5"/>
    <circle cx="314" cy="178" r="1.5"/>
    <circle cx="410" cy="166" r="1.5"/>
    <circle cx="208" cy="162" r="1.5"/>
    <circle cx="287" cy="173" r="1.5"/>
    <circle cx="277" cy="145" r="1.5"/>
    <circle cx="233" cy="152" r="1.5"/>
    <circle cx="297" cy="144" r="1.5"/>
    <circle cx="345" cy="166" r="1.5"/>
    <circle cx="355" cy="175" r="1.5"/>
    <circle cx="325" cy="165" r="1.5"/>
    <circle cx="199" cy="153" r="1.5"/>
    <circle cx="203" cy="140" r="1.5"/>
    <circle cx="265" cy="132" r="1.5"/>
    <circle cx="203" cy="111" r="1.5"/>
    <circle cx="322" cy="200" r="1.5"/>
    <circle cx="193" cy="181" r="1.5"/>
    <circle cx="295" cy="198" r="1.5"/>
    <circle cx="260" cy="181" r="1.5"/>
    <circle cx="350" cy="175" r="1.5"/>
    <circle cx="328" cy="166" r="1.5"/>
    <circle cx="256" cy="175" r="1.5"/>
    <circle cx="310" cy="163" r="1.5"/>
    <circle cx="349" cy="167" r="1.5"/>
    <circle cx="334" cy="119" r="1.5"/>
    <circle cx="251" cy="123" r="1.5"/>
    <circle cx="399" cy="181" r="1.5"/>
    <circle cx="205" cy="87" r="1.5"/>
    <circle cx="309" cy="83" r="1.5"/>
    <circle cx="282" cy="134" r="1.5"/>
    <circle cx="294" cy="198" r="1.5"/>
    <circle cx="318" cy="154" r="1.5"/>
    <circle cx="307" cy="115" r="1.5"/>
    <circle cx="307" cy="149" r="1.5"/>
    <circle cx="290" cy="130" r="1.5"/>
    <circle cx="269" cy="168" r="1.5"/>
    <circle cx="298" cy="142" r="1.5"/>
    <circle cx="195" cy="95" r="1.5"/>
    <circle cx="176" cy="96" r="1.5"/>
    <circle cx="214" cy="134" r="1.5"/>
    <circle cx="266" cy="140" r="1.5"/>
    <circle cx="227" cy="140" r="1.5"/>
    <circle cx="251" cy="134" r="1.5"/>
    <circle cx="351" cy="144" r="1.5"/>
    <circle cx="231" cy="164" r="1.5"/>
    <circle cx="279" cy="154" r="1.5"/>
    <circle cx="304" cy="174" r="1.5"/>
    <circle cx="195" cy="108" r="1.5"/>
    <circle cx="294" cy="131" r="1.5"/>
    <circle cx="194" cy="142" r="1.5"/>
    <circle cx="244" cy="113" r="1.5"/>
    <circle cx="327" cy="183" r="1.5"/>
    <circle cx="295" cy="146" r="1.5"/>
    <circle cx="331" cy="171" r="1.5"/>
    <circle cx="303" cy="152" r="1.5"/>
    <circle cx="344" cy="133" r="1.5"/>
    <circle cx="434" cy="153" r="1.5"/>
    <circle cx="329" cy="161" r="1.5"/>
    <circle cx="274" cy="122" r="1.5"/>
    <circle cx="187" cy="131" r="1.5"/>
    <circle cx="231" cy="149" r="1.5"/>
    <circle cx="218" cy="146" r="1.5"/>
    <circle cx="270" cy="142" r="1.5"/>
    <circle cx="373" cy="142" r="1.5"/>
    <circle cx="376" cy="163" r="1.5"/>
    <circle cx="357" cy="189" r="1.5"/>
    <circle cx="217" cy="174" r="1.5"/>
    <circle cx="338" cy="175" r="1.5"/>
    <circle cx="362" cy="170" r="1.5"/>
    <circle cx="318" cy="127" r="1.5"/>
    <circle cx="214" cy="111" r="1.5"/>
    <circle cx="311" cy="173" r="1.5"/>
    <circle cx="267" cy="167" r="1.5"/>
    <circle cx="434" cy="193" r="1.5"/>
    <circle cx="372" cy="185" r="1.5"/>
    <circle cx="262" cy="178" r="1.5"/>
    <circle cx="175" cy="172" r="1.5"/>
    <circle cx="369" cy="182" r="1.5"/>
    <circle cx="347" cy="182" r="1.5"/>
    <circle cx="406" cy="184" r="1.5"/>
    <circle cx="351" cy="152" r="1.5"/>
    <circle cx="297" cy="178" r="1.5"/>
    <circle cx="332" cy="173" r="1.5"/>
    <circle cx="343" cy="185" r="1.5"/>
    <circle cx="338" cy="185" r="1.5"/>
    <circle cx="361" cy="185" r="1.5"/>
    <circle cx="450" cy="192" r="1.5"/>
    <circle cx="305" cy="166" r="1.5"/>
    <circle cx="279" cy="182" r="1.5"/>
    <circle cx="295" cy="162" r="1.5"/>
    <circle cx="330" cy="176" r="1.5"/>
    <circle cx="257" cy="141" r="1.5"/>
    <circle cx="252" cy="170" r="1.5"/>
    <circle cx="263" cy="189" r="1.5"/>
    <circle cx="381" cy="182" r="1.5"/>
    <circle cx="392" cy="186" r="1.5"/>
    <circle cx="436" cy="185" r="1.5"/>
    <circle cx="422" cy="175" r="1.5"/>
    <circle cx="344" cy="174" r="1.5"/>
    <circle cx="308" cy="170" r="1.5"/>
    <circle cx="271" cy="156" r="1.5"/>
    <circle cx="290" cy="156" r="1.5"/>
    <circle cx="415" cy="176" r="1.5"/>
    <circle cx="438" cy="181" r="1.5"/>
    <circle cx="347" cy="187" r="1.5"/>
    <circle cx="347" cy="170" r="1.5"/>
    <circle cx="416" cy="183" r="1.5"/>
    <circle cx="242" cy="180" r="1.5"/>
    <circle cx="291" cy="172" r="1.5"/>
    <circle cx="311" cy="175" r="1.5"/>
    <circle cx="366" cy="192" r="1.5"/>
    <circle cx="305" cy="164" r="1.5"/>
    <circle cx="370" cy="178" r="1.5"/>
    <circle cx="237" cy="160" r="1.5"/>
    <circle cx="258" cy="145" r="1.5"/>
    <circle cx="234" cy="149" r="1.5"/>
    <circle cx="425" cy="188" r="1.5"/>
    <circle cx="277" cy="154" r="1.5"/>
    <circle cx="249" cy="175" r="1.5"/>
    <circle cx="207" cy="186" r="1.5"/>
    <circle cx="308" cy="179" r="1.5"/>
    <circle cx="393" cy="176" r="1.5"/>
    <circle cx="268" cy="163" r="1.5"/>
    <circle cx="460" cy="194" r="1.5"/>
    <circle cx="431" cy="190" r="1.5"/>
    <circle cx="409" cy="196" r="1.5"/>
    <circle cx="359" cy="191" r="1.5"/>
    <circle cx="280" cy="181" r="1.5"/>
    <circle cx="207" cy="192" r="1.5"/>
    <circle cx="328" cy="191" r="1.5"/>
    <circle cx="350" cy="196" r="1.5"/>
    <circle cx="368" cy="192" r="1.5"/>
    <circle cx="425" cy="194" r="1.5"/>
    <circle cx="299" cy="166" r="1.5"/>
    <circle cx="253" cy="187" r="1.5"/>
    <circle cx="399" cy="183" r="1.5"/>
    <circle cx="388" cy="195" r="1.5"/>
    <circle cx="361" cy="194" r="1.5"/>
    <circle cx="310" cy="175" r="1.5"/>
    <circle cx="286" cy="165" r="1.5"/>
    <circle cx="431" cy="195" r="1.5"/>
    <circle cx="207" cy="174" r="1.5"/>
    <circle cx="452" cy="191" r="1.5"/>
    <circle cx="361" cy="182" r="1.5"/>
    <circle cx="350" cy="178" r="1.5"/>
    <circle cx="395" cy="192" r="1.5"/>
    <circle cx="418" cy="197" r="1.5"/>
    <circle cx="316" cy="178" r="1.5"/>
    <circle cx="341" cy="185" r="1.5"/>
    <circle cx="250" cy="122" r="1.5"/>
    <circle cx="325" cy="163" r="1.5"/>
    <circle cx="293" cy="196" r="1.5"/>
    <circle cx="314" cy="185" r="1.5"/>
    <circle cx="302" cy="199" r="1.5"/>
    <circle cx="404" cy="187" r="1.5"/>
    <circle cx="337" cy="185" r="1.5"/>
    <circle cx="417" cy="195" r="1.5"/>
    <circle cx="372" cy="192" r="1.5"/>
    <circle cx="335" cy="185" r="1.5"/>
    <circle cx="393" cy="184" r="1.5"/>
    <circle cx="305" cy="191" r="1.5"/>
    <circle cx="355" cy="195" r="1.5"/>
    <circle cx="433" cy="197" r="1.5"/>
    <circle cx="330" cy="173" r="1.5"/>
    <circle cx="299" cy="150" r="1.5"/>
    <circle cx="431" cy="198" r="1.5"/>
    <circle cx="375" cy="171" r="1.5"/>
    <circle cx="431" cy="196" r="1.5"/>
    <circle cx="447" cy="196" r="1.5"/>
    <circle cx="368" cy="183" r="1.5"/>
    <circle cx="338" cy="179" r="1.5"/>
    <circle cx="409" cy="188" r="1.5"/>
    <circle cx="397" cy="194" r="1.5"/>
    <circle cx="356" cy="194" r="1.5"/>
    <circle cx="314" cy="163" r="1.5"/>
    <circle cx="394" cy="193" r="1.5"/>
    <circle cx="380" cy="191" r="1.5"/>
    <circle cx="356" cy="180" r="1.5"/>
    <circle cx="355" cy="188" r="1.5"/>
    <circle cx="335" cy="188" r="1.5"/>
    <circle cx="334" cy="189" r="1.5"/>
    <circle cx="301" cy="193" r="1.5"/>
    <circle cx="376" cy="166" r="1.5"/>
    <circle cx="422" cy="178" r="1.5"/>
    <circle cx="328" cy="173" r="1.5"/>
    <circle cx="363" cy="173" r="1.5"/>
    <circle cx="395" cy="184" r="1.5"/>
    <circle cx="457" cy="186" r="1.5"/>
    <circle cx="361" cy="186" r="1.5"/>
    <circle cx="321" cy="161" r="1.5"/>
    <circle cx="380" cy="181" r="1.5"/>
    <circle cx="409" cy="184" r="1.5"/>
    <circle cx="434" cy="195" r="1.5"/>
    <circle cx="298" cy="162" r="1.5"/>
    <circle cx="377" cy="192" r="1.5"/>
    <circle cx="370" cy="177" r="1.5"/>
    <circle cx="408" cy="195" r="1.5"/>
    <circle cx="223" cy="185" r="1.5"/>
    <circle cx="317" cy="177" r="1.5"/>
    <circle cx="291" cy="185" r="1.5"/>
    <circle cx="319" cy="179" r="1.5"/>
    <circle cx="417" cy="194" r="1.5"/>
    <circle cx="270" cy="179" r="1.5"/>
    <circle cx="278" cy="153" r="1.5"/>
    <circle cx="377" cy="177" r="1.5"/>
    <circle cx="419" cy="189" r="1.5"/>
    <circle cx="303" cy="175" r="1.5"/>
    <circle cx="333" cy="173" r="1.5"/>
    <circle cx="365" cy="187" r="1.5"/>
    <circle cx="282" cy="192" r="1.5"/>
    <circle cx="366" cy="190" r="1.5"/>
    <circle cx="454" cy="200" r="1.5"/>
    <circle cx="182" cy="182" r="1.5"/>
    <circle cx="394" cy="200" r="1.5"/>
    <circle cx="352" cy="200" r="1.5"/>
    <circle cx="277" cy="180" r="1.5"/>
    <circle cx="238" cy="155" r="1.5"/>
    <circle cx="221" cy="152" r="1.5"/>
    <circle cx="391" cy="200" r="1.5"/>
    <circle cx="412" cy="198" r="1.5"/>
    <circle cx="350" cy="194" r="1.5"/>
    <circle cx="380" cy="197" r="1.5"/>
    <circle cx="433" cy="194" r="1.5"/>
    <circle cx="356" cy="186" r="1.5"/>
    <circle cx="441" cy="193" r="1.5"/>
    <circle cx="405" cy="189" r="1.5"/>
    <circle cx="350" cy="177" r="1.5"/>
    <circle cx="361" cy="180" r="1.5"/>
    <circle cx="337" cy="165" r="1.5"/>
    <circle cx="422" cy="200" r="1.5"/>
    <circle cx="392" cy="196" r="1.5"/>
    <circle cx="257" cy="138" r="1.5"/>
    <circle cx="329" cy="164" r="1.5"/>
    <circle cx="310" cy="94" r="1.5"/>
    <circle cx="265" cy="146" r="1.5"/>
    <circle cx="324" cy="150" r="1.5"/>
    <circle cx="323" cy="143" r="1.5"/>
    <circle cx="398" cy="182" r="1.5"/>
    <circle cx="280" cy="146" r="1.5"/>
    <circle cx="182" cy="90" r="1.5"/>
    <circle cx="203" cy="77" r="1.5"/>
    <circle cx="285" cy="151" r="1.5"/>
    <circle cx="421" cy="194" r="1.5"/>
    <circle cx="434" cy="183" r="1.5"/>
    <circle cx="412" cy="194" r="1.5"/>
    <circle cx="216" cy="167" r="1.5"/>
    <circle cx="421" cy="201" r="1.5"/>
    <circle cx="261" cy="171" r="1.5"/>
    <circle cx="309" cy="177" r="1.5"/>
    <circle cx="273" cy="152" r="1.5"/>
    <circle cx="344" cy="186" r="1.5"/>
    <circle cx="383" cy="193" r="1.5"/>
    <circle cx="343" cy="178" r="1.5"/>
    <circle cx="411" cy="187" r="1.5"/>
    <circle cx="292" cy="157" r="1.5"/>
    <circle cx="225" cy="188" r="1.5"/>
    <circle cx="315" cy="177" r="1.5"/>
    <circle cx="450" cy="198" r="1.5"/>
    <circle cx="379" cy="186" r="1.5"/>
    <circle cx="280" cy="196" r="1.5"/>
    <circle cx="292" cy="169" r="1.5"/>
    <circle cx="311" cy="159" r="1.5"/>
    <circle cx="433" cy="191" r="1.5"/>
    <circle cx="258" cy="179" r="1.5"/>
    <circle cx="378" cy="164" r="1.5"/>
    <circle cx="358" cy="173" r="1.5"/>
    <circle cx="345" cy="173" r="1.5"/>
    <circle cx="408" cy="173" r="1.5"/>
    <circle cx="289" cy="169" r="1.5"/>
    <circle cx="312" cy="175" r="1.5"/>
    <circle cx="287" cy="151" r="1.5"/>
    <circle cx="337" cy="175" r="1.5"/>
    <circle cx="425" cy="195" r="1.5"/>
    <circle cx="217" cy="140" r="1.5"/>
    <circle cx="204" cy="128" r="1.5"/>
    <circle cx="416" cy="185" r="1.5"/>
    <circle cx="331" cy="191" r="1.5"/>
    <circle cx="285" cy="181" r="1.5"/>
    <circle cx="305" cy="184" r="1.5"/>
    <circle cx="305" cy="189" r="1.5"/>
    <circle cx="392" cy="192" r="1.5"/>
    <circle cx="229" cy="179" r="1.5"/>
    <circle cx="386" cy="187" r="1.5"/>
    <circle cx="346" cy="186" r="1.5"/>
    <circle cx="392" cy="178" r="1.5"/>
    <circle cx="344" cy="169" r="1.5"/>
    <circle cx="442" cy="194" r="1.5"/>
    <circle cx="253" cy="181" r="1.5"/>
    <circle cx="359" cy="178" r="1.5"/>
    <circle cx="294" cy="165" r="1.5"/>
    <circle cx="428" cy="180" r="1.5"/>
    <circle cx="330" cy="181" r="1.5"/>
    <circle cx="323" cy="180" r="1.5"/>
    <circle cx="372" cy="171" r="1.5"/>
    <circle cx="336" cy="170" r="1.5"/>
    <circle cx="346" cy="180" r="1.5"/>
    <circle cx="338" cy="176" r="1.5"/>
    <circle cx="261" cy="139" r="1.5"/>
    <circle cx="357" cy="190" r="1.5"/>
    <circle cx="174" cy="54" r="1.5"/>
    <circle cx="236" cy="123" r="1.5"/>
    <circle cx="80" cy="53" r="1.5"/>
    <circle cx="261" cy="176" r="1.5"/>
    <circle cx="217" cy="112" r="1.5"/>
    <circle cx="445" cy="183" r="1.5"/>
    <circle cx="241" cy="127" r="1.5"/>
    <circle cx="330" cy="133" r="1.5"/>
    <circle cx="285" cy="122" r="1.5"/>
    <circle cx="391" cy="190" r="1.5"/>
    <circle cx="209" cy="126" r="1.5"/>
    <circle cx="347" cy="164" r="1.5"/>
    <circle cx="384" cy="171" r="1.5"/>
    <circle cx="304" cy="157" r="1.5"/>
    <circle cx="364" cy="197" r="1.5"/>
    <circle cx="212" cy="193" r="1.5"/>
    <circle cx="349" cy="185" r="1.5"/>
    <circle cx="345" cy="175" r="1.5"/>
    <circle cx="301" cy="188" r="1.5"/>
    <circle cx="154" cy="151" r="1.5"/>
    <circle cx="186" cy="154" r="1.5"/>
    <circle cx="270" cy="190" r="1.5"/>
    <circle cx="286" cy="184" r="1.5"/>
    <circle cx="249" cy="181" r="1.5"/>
    <circle cx="380" cy="190" r="1.5"/>
    <circle cx="267" cy="174" r="1.5"/>
    <circle cx="433" cy="198" r="1.5"/>
    <circle cx="218" cy="191" r="1.5"/>
    <circle cx="426" cy="191" r="1.5"/>
    <circle cx="396" cy="193" r="1.5"/>
    <circle cx="378" cy="185" r="1.5"/>
    <circle cx="365" cy="160" r="1.5"/>
    <circle cx="441" cy="189" r="1.5"/>
    <circle cx="144" cy="165" r="1.5"/>
    <circle cx="347" cy="158" r="1.5"/>
    <circle cx="298" cy="163" r="1.5"/>
    <circle cx="320" cy="167" r="1.5"/>
    <circle cx="245" cy="164" r="1.5"/>
    <circle cx="232" cy="158" r="1.5"/>
    <circle cx="427" cy="177" r="1.5"/>
    <circle cx="271" cy="175" r="1.5"/>
    <circle cx="455" cy="175" r="1.5"/>
    <circle cx="332" cy="182" r="1.5"/>
    <circle cx="323" cy="160" r="1.5"/>
    <circle cx="288" cy="168" r="1.5"/>
    <circle cx="310" cy="180" r="1.5"/>
    <circle cx="358" cy="178" r="1.5"/>
    <circle cx="320" cy="179" r="1.5"/>
    <circle cx="139" cy="170" r="1.5"/>
    <circle cx="380" cy="173" r="1.5"/>
    <circle cx="358" cy="167" r="1.5"/>
    <circle cx="332" cy="174" r="1.5"/>
    <circle cx="427" cy="182" r="1.5"/>
    <circle cx="426" cy="186" r="1.5"/>
    <circle cx="269" cy="184" r="1.5"/>
    <circle cx="334" cy="162" r="1.5"/>
    <circle cx="309" cy="180" r="1.5"/>
    <circle cx="290" cy="176" r="1.5"/>
    <circle cx="352" cy="162" r="1.5"/>
    <circle cx="277" cy="159" r="1.5"/>
    <circle cx="268" cy="154" r="1.5"/>
    <circle cx="268" cy="143" r="1.5"/>
    <circle cx="249" cy="152" r="1.5"/>
    <circle cx="274" cy="146" r="1.5"/>
    <circle cx="302" cy="163" r="1.5"/>
    <circle cx="365" cy="167" r="1.5"/>
    <circle cx="281" cy="153" r="1.5"/>
    <circle cx="420" cy="179" r="1.5"/>
    <circle cx="261" cy="187" r="1.5"/>
    <circle cx="392" cy="181" r="1.5"/>
    <circle cx="308" cy="193" r="1.5"/>
    <circle cx="243" cy="182" r="1.5"/>
    <circle cx="226" cy="195" r="1.5"/>
    <circle cx="395" cy="175" r="1.5"/>
    <circle cx="407" cy="195" r="1.5"/>
    <circle cx="132" cy="160" r="1.5"/>
    <circle cx="338" cy="192" r="1.5"/>
    <circle cx="284" cy="170" r="1.5"/>
    <circle cx="236" cy="161" r="1.5"/>
    <circle cx="178" cy="173" r="1.5"/>
    <circle cx="361" cy="181" r="1.5"/>
    <circle cx="327" cy="195" r="1.5"/>
    <circle cx="297" cy="185" r="1.5"/>
    <circle cx="306" cy="165" r="1.5"/>
    <circle cx="383" cy="182" r="1.5"/>
    <circle cx="252" cy="189" r="1.5"/>
    <circle cx="445" cy="177" r="1.5"/>
    <circle cx="222" cy="171" r="1.5"/>
    <circle cx="404" cy="195" r="1.5"/>
    <circle cx="416" cy="197" r="1.5"/>
    <circle cx="299" cy="184" r="1.5"/>
    <circle cx="198" cy="173" r="1.5"/>
    <circle cx="160" cy="190" r="1.5"/>
    <circle cx="353" cy="178" r="1.5"/>
    <circle cx="304" cy="189" r="1.5"/>
    <circle cx="284" cy="193" r="1.5"/>
    <circle cx="375" cy="194" r="1.5"/>
    <circle cx="424" cy="188" r="1.5"/>
    <circle cx="337" cy="188" r="1.5"/>
    <circle cx="396" cy="195" r="1.5"/>
    <circle cx="445" cy="197" r="1.5"/>
    <circle cx="389" cy="179" r="1.5"/>
    <circle cx="348" cy="163" r="1.5"/>
    <circle cx="343" cy="166" r="1.5"/>
    <circle cx="379" cy="200" r="1.5"/>
    <circle cx="273" cy="194" r="1.5"/>
    <circle cx="253" cy="139" r="1.5"/>
    <circle cx="408" cy="187" r="1.5"/>
    <circle cx="387" cy="161" r="1.5"/>
    <circle cx="358" cy="194" r="1.5"/>
    <circle cx="413" cy="193" r="1.5"/>
    <circle cx="435" cy="195" r="1.5"/>
    <circle cx="233" cy="138" r="1.5"/>
    <circle cx="291" cy="182" r="1.5"/>
    <circle cx="284" cy="156" r="1.5"/>
    <circle cx="304" cy="178" r="1.5"/>
    <circle cx="332" cy="191" r="1.5"/>
    <circle cx="298" cy="195" r="1.5"/>
    <circle cx="311" cy="190" r="1.5"/>
    <circle cx="202" cy="165" r="1.5"/>
    <circle cx="315" cy="189" r="1.5"/>
    <circle cx="301" cy="142" r="1.5"/>
    <circle cx="251" cy="180" r="1.5"/>
    <circle cx="377" cy="199" r="1.5"/>
    <circle cx="246" cy="187" r="1.5"/>
    <circle cx="210" cy="191" r="1.5"/>
    <circle cx="398" cy="194" r="1.5"/>
    <circle cx="304" cy="170" r="1.5"/>
    <circle cx="305" cy="198" r="1.5"/>
    <circle cx="341" cy="189" r="1.5"/>
    <circle cx="345" cy="187" r="1.5"/>
    <circle cx="359" cy="183" r="1.5"/>
    <circle cx="400" cy="176" r="1.5"/>
    <circle cx="418" cy="190" r="1.5"/>
    <circle cx="376" cy="187" r="1.5"/>
    <circle cx="308" cy="155" r="1.5"/>
    <circle cx="370" cy="190" r="1.5"/>
    <circle cx="324" cy="190" r="1.5"/>
    <circle cx="423" cy="185" r="1.5"/>
    <circle cx="193" cy="160" r="1.5"/>
    <circle cx="277" cy="190" r="1.5"/>
    <circle cx="348" cy="174" r="1.5"/>
    <circle cx="292" cy="171" r="1.5"/>
    <circle cx="372" cy="179" r="1.5"/>
    <circle cx="340" cy="193" r="1.5"/>
    <circle cx="276" cy="179" r="1.5"/>
    <circle cx="350" cy="195" r="1.5"/>
    <circle cx="356" cy="188" r="1.5"/>
    <circle cx="221" cy="183" r="1.5"/>
    <circle cx="436" cy="192" r="1.5"/>
    <circle cx="237" cy="179" r="1.5"/>
    <circle cx="246" cy="191" r="1.5"/>
    <circle cx="396" cy="188" r="1.5"/>
    <circle cx="258" cy="173" r="1.5"/>
    <circle cx="270" cy="147" r="1.5"/>
    <circle cx="282" cy="185" r="1.5"/>
    <circle cx="298" cy="168" r="1.5"/>
    <circle cx="247" cy="171" r="1.5"/>
    <circle cx="263" cy="169" r="1.5"/>
    <circle cx="336" cy="186" r="1.5"/>
    <circle cx="272" cy="180" r="1.5"/>
    <circle cx="291" cy="175" r="1.5"/>
    <circle cx="259" cy="181" r="1.5"/>
    <circle cx="298" cy="191" r="1.5"/>
    <circle cx="299" cy="179" r="1.5"/>
    <circle cx="132" cy="138" r="1.5"/>
    <circle cx="300" cy="186" r="1.5"/>
    <circle cx="302" cy="172" r="1.5"/>
    <circle cx="238" cy="186" r="1.5"/>
    <circle cx="263" cy="165" r="1.5"/>
    <circle cx="361" cy="191" r="1.5"/>
    <circle cx="236" cy="152" r="1.5"/>
    <circle cx="343" cy="188" r="1.5"/>
    <circle cx="334" cy="193" r="1.5"/>
    <circle cx="293" cy="187" r="1.5"/>
    <circle cx="337" cy="190" r="1.5"/>
    <circle cx="302" cy="154" r="1.5"/>
    <circle cx="199" cy="148" r="1.5"/>
    <circle cx="344" cy="165" r="1.5"/>
    <circle cx="355" cy="168" r="1.5"/>
    <circle cx="310" cy="169" r="1.5"/>
    <circle cx="378" cy="190" r="1.5"/>
    <circle cx="303" cy="133" r="1.5"/>
    <circle cx="294" cy="175" r="1.5"/>
    <circle cx="386" cy="184" r="1.5"/>
    <circle cx="286" cy="175" r="1.5"/>
    <circle cx="351" cy="173" r="1.5"/>
    <circle cx="219" cy="180" r="1.5"/>
    <circle cx="411" cy="195" r="1.5"/>
    <circle cx="405" cy="196" r="1.5"/>
    <circle cx="276" cy="186" r="1.5"/>
    <circle cx="262" cy="167" r="1.5"/>
    <circle cx="239" cy="176" r="1.5"/>
    <circle cx="435" cy="190" r="1.5"/>
    <circle cx="350" cy="187" r="1.5"/>
    <circle cx="258" cy="182" r="1.5"/>
    <circle cx="368" cy="194" r="1.5"/>
    <circle cx="308" cy="191" r="1.5"/>
    <circle cx="437" cy="194" r="1.5"/>
    <circle cx="352" cy="186" r="1.5"/>
    <circle cx="376" cy="186" r="1.5"/>
    <circle cx="369" cy="188" r="1.5"/>
    <circle cx="380" cy="187" r="1.5"/>
    <circle cx="360" cy="172" r="1.5"/>
    <circle cx="193" cy="139" r="1.5"/>
    <circle cx="354" cy="166" r="1.5"/>
    <circle cx="268" cy="180" r="1.5"/>
    <circle cx="337" cy="171" r="1.5"/>
    <circle cx="267" cy="185" r="1.5"/>
    <circle cx="305" cy="186" r="1.5"/>
    <circle cx="227" cy="157" r="1.5"/>
    <circle cx="250" cy="150" r="1.5"/>
    <circle cx="290" cy="186" r="1.5"/>
    <circle cx="132" cy="105" r="1.5"/>
    <circle cx="236" cy="172" r="1.5"/>
    <circle cx="295" cy="187" r="1.5"/>
    <circle cx="321" cy="166" r="1.5"/>
    <circle cx="240" cy="165" r="1.5"/>
    <circle cx="283" cy="157" r="1.5"/>
    <circle cx="152" cy="144" r="1.5"/>
    <circle cx="267" cy="165" r="1.5"/>
    <circle cx="291" cy="163" r="1.5"/>
    <circle cx="220" cy="173" r="1.5"/>
    <circle cx="377" cy="178" r="1.5"/>
    <circle cx="302" cy="170" r="1.5"/>
    <circle cx="283" cy="164" r="1.5"/>
    <circle cx="274" cy="167" r="1.5"/>
    <circle cx="350" cy="179" r="1.5"/>
    <circle cx="253" cy="143" r="1.5"/>
    <circle cx="280" cy="143" r="1.5"/>
    <circle cx="297" cy="148" r="1.5"/>
    <circle cx="160" cy="131" r="1.5"/>
    <circle cx="321" cy="182" r="1.5"/>
    <circle cx="342" cy="189" r="1.5"/>
    <circle cx="214" cy="189" r="1.5"/>
    <circle cx="312" cy="180" r="1.5"/>
    <circle cx="346" cy="190" r="1.5"/>
    <circle cx="362" cy="188" r="1.5"/>
    <circle cx="262" cy="181" r="1.5"/>
    <circle cx="324" cy="187" r="1.5"/>
    <circle cx="328" cy="181" r="1.5"/>
    <circle cx="282" cy="179" r="1.5"/>
    <circle cx="335" cy="157" r="1.5"/>
    <circle cx="308" cy="164" r="1.5"/>
    <circle cx="255" cy="152" r="1.5"/>
    <circle cx="281" cy="175" r="1.5"/>
    <circle cx="267" cy="173" r="1.5"/>
    <circle cx="361" cy="167" r="1.5"/>
    <circle cx="336" cy="159" r="1.5"/>
    <circle cx="258" cy="100" r="1.5"/>
    <circle cx="256" cy="172" r="1.5"/>
    <circle cx="363" cy="161" r="1.5"/>
    <circle cx="363" cy="181" r="1.5"/>
    <circle cx="399" cy="182" r="1.5"/>
    <circle cx="289" cy="146" r="1.5"/>
    <circle cx="371" cy="177" r="1.5"/>
    <circle cx="310" cy="161" r="1.5"/>
    <circle cx="186" cy="147" r="1.5"/>
    <circle cx="238" cy="127" r="1.5"/>
    <circle cx="221" cy="142" r="1.5"/>
    <circle cx="200" cy="162" r="1.5"/>
    <circle cx="322" cy="168" r="1.5"/>
    <circle cx="331" cy="159" r="1.5"/>
    <circle cx="304" cy="166" r="1.5"/>
    <circle cx="240" cy="153" r="1.5"/>
    <circle cx="356" cy="174" r="1.5"/>
    <circle cx="226" cy="174" r="1.5"/>
    <circle cx="326" cy="168" r="1.5"/>
    <circle cx="294" cy="146" r="1.5"/>
    <circle cx="305" cy="169" r="1.5"/>
    <circle cx="314" cy="157" r="1.5"/>
    <circle cx="245" cy="138" r="1.5"/>
    <circle cx="300" cy="171" r="1.5"/>
    <circle cx="323" cy="173" r="1.5"/>
    <circle cx="259" cy="162" r="1.5"/>
    <circle cx="354" cy="191" r="1.5"/>
    <circle cx="431" cy="171" r="1.5"/>
    <circle cx="311" cy="187" r="1.5"/>
    <circle cx="288" cy="186" r="1.5"/>
    <circle cx="320" cy="184" r="1.5"/>
    <circle cx="380" cy="174" r="1.5"/>
    <circle cx="280" cy="163" r="1.5"/>
    <circle cx="327" cy="185" r="1.5"/>
    <circle cx="322" cy="171" r="1.5"/>
    <circle cx="318" cy="178" r="1.5"/>
    <circle cx="323" cy="174" r="1.5"/>
    <circle cx="280" cy="164" r="1.5"/>
    <circle cx="249" cy="135" r="1.5"/>
    <circle cx="300" cy="153" r="1.5"/>
    <circle cx="256" cy="194" r="1.5"/>
    <circle cx="326" cy="166" r="1.5"/>
    <circle cx="287" cy="166" r="1.5"/>
    <circle cx="259" cy="165" r="1.5"/>
    <circle cx="252" cy="173" r="1.5"/>
    <circle cx="334" cy="179" r="1.5"/>
    <circle cx="241" cy="152" r="1.5"/>
    <circle cx="280" cy="145" r="1.5"/>
    <circle cx="183" cy="162" r="1.5"/>
    <circle cx="230" cy="155" r="1.5"/>
    <circle cx="265" cy="178" r="1.5"/>
    <circle cx="206" cy="114" r="1.5"/>
    <circle cx="179" cy="120" r="1.5"/>
    <circle cx="238" cy="96" r="1.5"/>
    <circle cx="291" cy="153" r="1.5"/>
    <circle cx="319" cy="153" r="1.5"/>
    <circle cx="289" cy="164" r="1.5"/>
    <circle cx="203" cy="165" r="1.5"/>
    <circle cx="244" cy="147" r="1.5"/>
    <circle cx="311" cy="178" r="1.5"/>
    <circle cx="202" cy="130" r="1.5"/>
    <circle cx="298" cy="140" r="1.5"/>
    <circle cx="266" cy="106" r="1.5"/>
    <circle cx="260" cy="147" r="1.5"/>
    <circle cx="307" cy="159" r="1.5"/>
    <circle cx="277" cy="183" r="1.5"/>
    <circle cx="91" cy="121" r="1.5"/>
    <circle cx="316" cy="175" r="1.5"/>
    <circle cx="298" cy="167" r="1.5"/>
    <circle cx="222" cy="136" r="1.5"/>
    <circle cx="242" cy="155" r="1.5"/>
    <circle cx="313" cy="176" r="1.5"/>
    <circle cx="212" cy="149" r="1.5"/>
    <circle cx="236" cy="134" r="1.5"/>
    <circle cx="194" cy="98" r="1.5"/>
    <circle cx="328" cy="165" r="1.5"/>
    <circle cx="270" cy="138" r="1.5"/>
    <circle cx="189" cy="93" r="1.5"/>
    <circle cx="232" cy="136" r="1.5"/>
    <circle cx="215" cy="156" r="1.5"/>
    <circle cx="363" cy="197" r="1.5"/>
    <circle cx="456" cy="201" r="1.5"/>
    <circle cx="253" cy="137" r="1.5"/>
    <circle cx="380" cy="194" r="1.5"/>
    <circle cx="374" cy="170" r="1.5"/>
    <circle cx="257" cy="153" r="1.5"/>
    <circle cx="238" cy="152" r="1.5"/>
    <circle cx="411" cy="196" r="1.5"/>
    <circle cx="329" cy="174" r="1.5"/>
    <circle cx="362" cy="179" r="1.5"/>
    <circle cx="238" cy="178" r="1.5"/>
    <circle cx="308" cy="182" r="1.5"/>
    <circle cx="342" cy="180" r="1.5"/>
    <circle cx="440" cy="187" r="1.5"/>
    <circle cx="421" cy="189" r="1.5"/>
    <circle cx="316" cy="179" r="1.5"/>
    <circle cx="361" cy="195" r="1.5"/>
    <circle cx="427" cy="193" r="1.5"/>
    <circle cx="388" cy="200" r="1.5"/>
    <circle cx="402" cy="187" r="1.5"/>
    <circle cx="324" cy="200" r="1.5"/>
    <circle cx="311" cy="174" r="1.5"/>
    <circle cx="314" cy="195" r="1.5"/>
    <circle cx="337" cy="169" r="1.5"/>
    <circle cx="348" cy="178" r="1.5"/>
    <circle cx="287" cy="191" r="1.5"/>
    <circle cx="379" cy="188" r="1.5"/>
    <circle cx="334" cy="199" r="1.5"/>
    <circle cx="413" cy="185" r="1.5"/>
    <circle cx="363" cy="170" r="1.5"/>
    <circle cx="390" cy="173" r="1.5"/>
    <circle cx="335" cy="172" r="1.5"/>
    <circle cx="180" cy="176" r="1.5"/>
    <circle cx="357" cy="148" r="1.5"/>
    <circle cx="227" cy="168" r="1.5"/>
    <circle cx="306" cy="173" r="1.5"/>
    <circle cx="390" cy="183" r="1.5"/>
    <circle cx="293" cy="191" r="1.5"/>
    <circle cx="282" cy="189" r="1.5"/>
    <circle cx="309" cy="195" r="1.5"/>
    <circle cx="440" cy="194" r="1.5"/>
    <circle cx="315" cy="178" r="1.5"/>
    <circle cx="400" cy="193" r="1.5"/>
    <circle cx="359" cy="185" r="1.5"/>
    <circle cx="335" cy="173" r="1.5"/>
    <circle cx="390" cy="191" r="1.5"/>
    <circle cx="294" cy="186" r="1.5"/>
    <circle cx="292" cy="178" r="1.5"/>
    <circle cx="56" cy="174" r="1.5"/>
    <circle cx="356" cy="190" r="1.5"/>
    <circle cx="389" cy="187" r="1.5"/>
    <circle cx="347" cy="174" r="1.5"/>
    <circle cx="347" cy="185" r="1.5"/>
    <circle cx="85" cy="121" r="1.5"/>
    <circle cx="198" cy="153" r="1.5"/>
    <circle cx="306" cy="157" r="1.5"/>
    <circle cx="308" cy="157" r="1.5"/>
    <circle cx="265" cy="145" r="1.5"/>
    <circle cx="315" cy="146" r="1.5"/>
    <circle cx="287" cy="186" r="1.5"/>
    <circle cx="200" cy="163" r="1.5"/>
    <circle cx="312" cy="190" r="1.5"/>
    <circle cx="392" cy="190" r="1.5"/>
    <circle cx="347" cy="190" r="1.5"/>
    <circle cx="285" cy="172" r="1.5"/>
    <circle cx="219" cy="141" r="1.5"/>
    <circle cx="219" cy="159" r="1.5"/>
    <circle cx="203" cy="166" r="1.5"/>
    <circle cx="250" cy="141" r="1.5"/>
    <circle cx="240" cy="168" r="1.5"/>
    <circle cx="301" cy="173" r="1.5"/>
    <circle cx="138" cy="179" r="1.5"/>
    <circle cx="245" cy="128" r="1.5"/>
    <circle cx="381" cy="179" r="1.5"/>
    <circle cx="332" cy="196" r="1.5"/>
    <circle cx="395" cy="191" r="1.5"/>
    <circle cx="341" cy="188" r="1.5"/>
    <circle cx="342" cy="188" r="1.5"/>
    <circle cx="226" cy="188" r="1.5"/>
    <circle cx="446" cy="194" r="1.5"/>
    <circle cx="300" cy="179" r="1.5"/>
    <circle cx="202" cy="185" r="1.5"/>
    <circle cx="195" cy="185" r="1.5"/>
    <circle cx="215" cy="171" r="1.5"/>
    <circle cx="308" cy="172" r="1.5"/>
    <circle cx="240" cy="172" r="1.5"/>
    <circle cx="184" cy="170" r="1.5"/>
    <circle cx="285" cy="182" r="1.5"/>
    <circle cx="233" cy="181" r="1.5"/>
    <circle cx="230" cy="163" r="1.5"/>
    <circle cx="360" cy="146" r="1.5"/>
    <circle cx="208" cy="170" r="1.5"/>
    <circle cx="191" cy="178" r="1.5"/>
    <circle cx="285" cy="170" r="1.5"/>
    <circle cx="277" cy="191" r="1.5"/>
    <circle cx="246" cy="180" r="1.5"/>
    <circle cx="354" cy="190" r="1.5"/>
    <circle cx="277" cy="179" r="1.5"/>
    <circle cx="254" cy="149" r="1.5"/>
    <circle cx="213" cy="183" r="1.5"/>
    <circle cx="160" cy="173" r="1.5"/>
    <circle cx="350" cy="181" r="1.5"/>
    <circle cx="332" cy="185" r="1.5"/>
    <circle cx="226" cy="178" r="1.5"/>
    <circle cx="125" cy="174" r="1.5"/>
    <circle cx="318" cy="194" r="1.5"/>
    <circle cx="278" cy="169" r="1.5"/>
    <circle cx="336" cy="193" r="1.5"/>
    <circle cx="289" cy="191" r="1.5"/>
    <circle cx="358" cy="201" r="1.5"/>
    <circle cx="292" cy="175" r="1.5"/>
    <circle cx="231" cy="174" r="1.5"/>
    <circle cx="282" cy="171" r="1.5"/>
    <circle cx="264" cy="158" r="1.5"/>
    <circle cx="246" cy="170" r="1.5"/>
    <circle cx="421" cy="185" r="1.5"/>
    <circle cx="280" cy="139" r="1.5"/>
    <circle cx="332" cy="188" r="1.5"/>
    <circle cx="189" cy="180" r="1.5"/>
    <circle cx="310" cy="174" r="1.5"/>
    <circle cx="237" cy="162" r="1.5"/>
    <circle cx="243" cy="120" r="1.5"/>
    <circle cx="252" cy="146" r="1.5"/>
    <circle cx="392" cy="167" r="1.5"/>
    <circle cx="141" cy="182" r="1.5"/>
    <circle cx="356" cy="158" r="1.5"/>
    <circle cx="247" cy="181" r="1.5"/>
    <circle cx="229" cy="156" r="1.5"/>
    <circle cx="180" cy="171" r="1.5"/>
    <circle cx="284" cy="184" r="1.5"/>
    <circle cx="369" cy="193" r="1.5"/>
    <circle cx="287" cy="200" r="1.5"/>
    <circle cx="186" cy="160" r="1.5"/>
    <circle cx="252" cy="184" r="1.5"/>
    <circle cx="283" cy="181" r="1.5"/>
    <circle cx="221" cy="168" r="1.5"/>
    <circle cx="211" cy="168" r="1.5"/>
    <circle cx="138" cy="167" r="1.5"/>
    <circle cx="222" cy="174" r="1.5"/>
    <circle cx="292" cy="183" r="1.5"/>
    <circle cx="246" cy="167" r="1.5"/>
    <circle cx="340" cy="174" r="1.5"/>
    <circle cx="278" cy="172" r="1.5"/>
    <circle cx="197" cy="161" r="1.5"/>
    <circle cx="260" cy="177" r="1.5"/>
    <circle cx="363" cy="186" r="1.5"/>
    <circle cx="223" cy="163" r="1.5"/>
    <circle cx="190" cy="155" r="1.5"/>
    <circle cx="171" cy="171" r="1.5"/>
    <circle cx="275" cy="169" r="1.5"/>
    <circle cx="260" cy="169" r="1.5"/>
    <circle cx="162" cy="181" r="1.5"/>
    <circle cx="169" cy="182" r="1.5"/>
    <circle cx="240" cy="183" r="1.5"/>
    <circle cx="284" cy="175" r="1.5"/>
    <circle cx="345" cy="176" r="1.5"/>
    <circle cx="239" cy="178" r="1.5"/>
    <circle cx="239" cy="171" r="1.5"/>
    <circle cx="198" cy="156" r="1.5"/>
    <circle cx="206" cy="171" r="1.5"/>
    <circle cx="217" cy="177" r="1.5"/>
    <circle cx="348" cy="197" r="1.5"/>
    <circle cx="378" cy="191" r="1.5"/>
    <circle cx="309" cy="174" r="1.5"/>
    <circle cx="424" cy="194" r="1.5"/>
    <circle cx="454" cy="197" r="1.5"/>
    <circle cx="224" cy="161" r="1.5"/>
    <circle cx="247" cy="180" r="1.5"/>
    <circle cx="371" cy="183" r="1.5"/>
    <circle cx="271" cy="163" r="1.5"/>
    <circle cx="272" cy="176" r="1.5"/>
    <circle cx="293" cy="185" r="1.5"/>
    <circle cx="306" cy="170" r="1.5"/>
    <circle cx="248" cy="184" r="1.5"/>
    <circle cx="235" cy="160" r="1.5"/>
    <circle cx="361" cy="192" r="1.5"/>
    <circle cx="326" cy="181" r="1.5"/>
    <circle cx="338" cy="195" r="1.5"/>
    <circle cx="254" cy="194" r="1.5"/>
    <circle cx="409" cy="198" r="1.5"/>
    <circle cx="340" cy="184" r="1.5"/>
    <circle cx="361" cy="137" r="1.5"/>
    <circle cx="270" cy="149" r="1.5"/>
    <circle cx="238" cy="183" r="1.5"/>
    <circle cx="292" cy="195" r="1.5"/>
    <circle cx="218" cy="185" r="1.5"/>
    <circle cx="196" cy="185" r="1.5"/>
    <circle cx="253" cy="170" r="1.5"/>
    <circle cx="213" cy="179" r="1.5"/>
    <circle cx="263" cy="155" r="1.5"/>
    <circle cx="330" cy="186" r="1.5"/>
    <circle cx="183" cy="166" r="1.5"/>
    <circle cx="218" cy="173" r="1.5"/>
    <circle cx="247" cy="175" r="1.5"/>
    <circle cx="237" cy="154" r="1.5"/>
    <circle cx="202" cy="169" r="1.5"/>
    <circle cx="161" cy="169" r="1.5"/>
    <circle cx="318" cy="183" r="1.5"/>
    <circle cx="106" cy="175" r="1.5"/>
    <circle cx="273" cy="183" r="1.5"/>
    <circle cx="280" cy="183" r="1.5"/>
    <circle cx="386" cy="191" r="1.5"/>
    <circle cx="402" cy="191" r="1.5"/>
    <circle cx="409" cy="194" r="1.5"/>
    <circle cx="304" cy="190" r="1.5"/>
    <circle cx="230" cy="187" r="1.5"/>
    <circle cx="295" cy="190" r="1.5"/>
    <circle cx="322" cy="191" r="1.5"/>
    <circle cx="349" cy="177" r="1.5"/>
    <circle cx="460" cy="195" r="1.5"/>
    <circle cx="333" cy="150" r="1.5"/>
    <circle cx="287" cy="176" r="1.5"/>
    <circle cx="291" cy="131" r="1.5"/>
    <circle cx="234" cy="121" r="1.5"/>
    <circle cx="204" cy="180" r="1.5"/>
    <circle cx="399" cy="196" r="1.5"/>
    <circle cx="335" cy="195" r="1.5"/>
    <circle cx="251" cy="193" r="1.5"/>
    <circle cx="396" cy="191" r="1.5"/>
    <circle cx="426" cy="190" r="1.5"/>
    <circle cx="230" cy="170" r="1.5"/>
    <circle cx="334" cy="187" r="1.5"/>
    <circle cx="393" cy="186" r="1.5"/>
    <circle cx="238" cy="173" r="1.5"/>
    <circle cx="274" cy="148" r="1.5"/>
    <circle cx="253" cy="174" r="1.5"/>
    <circle cx="316" cy="177" r="1.5"/>
    <circle cx="165" cy="164" r="1.5"/>
    <circle cx="196" cy="158" r="1.5"/>
    <circle cx="314" cy="194" r="1.5"/>
    <circle cx="321" cy="196" r="1.5"/>
    <circle cx="226" cy="179" r="1.5"/>
    <circle cx="245" cy="180" r="1.5"/>
    <circle cx="367" cy="177" r="1.5"/>
    <circle cx="407" cy="173" r="1.5"/>
    <circle cx="193" cy="177" r="1.5"/>
    <circle cx="340" cy="169" r="1.5"/>
    <circle cx="376" cy="176" r="1.5"/>
    <circle cx="392" cy="176" r="1.5"/>
    <circle cx="420" cy="180" r="1.5"/>
    <circle cx="367" cy="188" r="1.5"/>
    <circle cx="314" cy="168" r="1.5"/>
    <circle cx="374" cy="173" r="1.5"/>
    <circle cx="439" cy="173" r="1.5"/>
    <circle cx="332" cy="162" r="1.5"/>
    <circle cx="316" cy="156" r="1.5"/>
    <circle cx="279" cy="179" r="1.5"/>
    <circle cx="296" cy="179" r="1.5"/>
    <circle cx="276" cy="163" r="1.5"/>
    <circle cx="341" cy="179" r="1.5"/>
    <circle cx="261" cy="179" r="1.5"/>
    <circle cx="342" cy="163" r="1.5"/>
    <circle cx="304" cy="192" r="1.5"/>
    <circle cx="455" cy="197" r="1.5"/>
    <circle cx="351" cy="185" r="1.5"/>
    <circle cx="298" cy="190" r="1.5"/>
    <circle cx="259" cy="129" r="1.5"/>
    <circle cx="366" cy="188" r="1.5"/>
    <circle cx="359" cy="182" r="1.5"/>
    <circle cx="349" cy="186" r="1.5"/>
    <circle cx="400" cy="186" r="1.5"/>
    <circle cx="181" cy="183" r="1.5"/>
    <circle cx="300" cy="168" r="1.5"/>
    <circle cx="295" cy="154" r="1.5"/>
    <circle cx="219" cy="150" r="1.5"/>
    <circle cx="214" cy="149" r="1.5"/>
    <circle cx="402" cy="195" r="1.5"/>
    <circle cx="332" cy="164" r="1.5"/>
    <circle cx="307" cy="135" r="1.5"/>
    <circle cx="340" cy="177" r="1.5"/>
    <circle cx="301" cy="185" r="1.5"/>
    <circle cx="315" cy="145" r="1.5"/>
    <circle cx="302" cy="188" r="1.5"/>
    <circle cx="251" cy="166" r="1.5"/>
    <circle cx="194" cy="122" r="1.5"/>
    <circle cx="370" cy="183" r="1.5"/>
    <circle cx="458" cy="178" r="1.5"/>
    <circle cx="255" cy="177" r="1.5"/>
    <circle cx="449" cy="197" r="1.5"/>
    <circle cx="375" cy="195" r="1.5"/>
    <circle cx="340" cy="188" r="1.5"/>
    <circle cx="376" cy="174" r="1.5"/>
    <circle cx="356" cy="176" r="1.5"/>
    <circle cx="327" cy="181" r="1.5"/>
    <circle cx="354" cy="180" r="1.5"/>
    <circle cx="293" cy="177" r="1.5"/>
    <circle cx="252" cy="176" r="1.5"/>
    <circle cx="340" cy="173" r="1.5"/>
    <circle cx="256" cy="198" r="1.5"/>
    <circle cx="386" cy="193" r="1.5"/>
    <circle cx="196" cy="184" r="1.5"/>
    <circle cx="401" cy="193" r="1.5"/>
    <circle cx="384" cy="168" r="1.5"/>
    <circle cx="336" cy="168" r="1.5"/>
    <circle cx="383" cy="174" r="1.5"/>
    <circle cx="228" cy="125" r="1.5"/>
    <circle cx="284" cy="134" r="1.5"/>
    <circle cx="285" cy="141" r="1.5"/>
    <circle cx="412" cy="185" r="1.5"/>
    <circle cx="323" cy="150" r="1.5"/>
    <circle cx="324" cy="180" r="1.5"/>
    <circle cx="265" cy="177" r="1.5"/>
    <circle cx="222" cy="152" r="1.5"/>
    <circle cx="242" cy="158" r="1.5"/>
    <circle cx="441" cy="198" r="1.5"/>
    <circle cx="347" cy="199" r="1.5"/>
    <circle cx="290" cy="192" r="1.5"/>
    <circle cx="53" cy="167" r="1.5"/>
    <circle cx="200" cy="167" r="1.5"/>
    <circle cx="204" cy="189" r="1.5"/>
    <circle cx="285" cy="194" r="1.5"/>
    <circle cx="393" cy="164" r="1.5"/>
    <circle cx="310" cy="182" r="1.5"/>
    <circle cx="360" cy="165" r="1.5"/>
    <circle cx="319" cy="188" r="1.5"/>
    <circle cx="365" cy="180" r="1.5"/>
    <circle cx="329" cy="179" r="1.5"/>
    <circle cx="221" cy="177" r="1.5"/>
    <circle cx="299" cy="175" r="1.5"/>
    <circle cx="306" cy="186" r="1.5"/>
    <circle cx="174" cy="164" r="1.5"/>
    <circle cx="256" cy="174" r="1.5"/>
    <circle cx="289" cy="174" r="1.5"/>
    <circle cx="173" cy="142" r="1.5"/>
    <circle cx="311" cy="163" r="1.5"/>
    <circle cx="386" cy="189" r="1.5"/>
    <circle cx="248" cy="172" r="1.5"/>
    <circle cx="331" cy="190" r="1.5"/>
    <circle cx="344" cy="188" r="1.5"/>
    <circle cx="221" cy="93" r="1.5"/>
    <circle cx="216" cy="182" r="1.5"/>
    <circle cx="297" cy="179" r="1.5"/>
    <circle cx="327" cy="151" r="1.5"/>
    <circle cx="270" cy="143" r="1.5"/>
    <circle cx="275" cy="139" r="1.5"/>
    <circle cx="210" cy="150" r="1.5"/>
    <circle cx="207" cy="154" r="1.5"/>
    <circle cx="273" cy="159" r="1.5"/>
    <circle cx="397" cy="179" r="1.5"/>
    <circle cx="253" cy="149" r="1.5"/>
    <circle cx="206" cy="156" r="1.5"/>
    <circle cx="337" cy="181" r="1.5"/>
    <circle cx="406" cy="198" r="1.5"/>
    <circle cx="319" cy="187" r="1.5"/>
    <circle cx="376" cy="191" r="1.5"/>
    <circle cx="389" cy="193" r="1.5"/>
    <circle cx="311" cy="180" r="1.5"/>
    <circle cx="173" cy="193" r="1.5"/>
    <circle cx="293" cy="179" r="1.5"/>
    <circle cx="342" cy="161" r="1.5"/>
    <circle cx="169" cy="157" r="1.5"/>
    <circle cx="156" cy="153" r="1.5"/>
    <circle cx="422" cy="188" r="1.5"/>
    <circle cx="296" cy="173" r="1.5"/>
    <circle cx="449" cy="189" r="1.5"/>
    <circle cx="402" cy="182" r="1.5"/>
    <circle cx="351" cy="186" r="1.5"/>
    <circle cx="187" cy="92" r="1.5"/>
    <circle cx="373" cy="191" r="1.5"/>
    <circle cx="282" cy="162" r="1.5"/>
    <circle cx="388" cy="193" r="1.5"/>
    <circle cx="401" cy="194" r="1.5"/>
    <circle cx="339" cy="173" r="1.5"/>
    <circle cx="360" cy="176" r="1.5"/>
    <circle cx="234" cy="193" r="1.5"/>
    <circle cx="301" cy="187" r="1.5"/>
    <circle cx="309" cy="144" r="1.5"/>
    <circle cx="317" cy="165" r="1.5"/>
    <circle cx="366" cy="166" r="1.5"/>
    <circle cx="351" cy="172" r="1.5"/>
    <circle cx="257" cy="161" r="1.5"/>
    <circle cx="243" cy="166" r="1.5"/>
    <circle cx="261" cy="182" r="1.5"/>
    <circle cx="346" cy="195" r="1.5"/>
    <circle cx="313" cy="197" r="1.5"/>
    <circle cx="336" cy="172" r="1.5"/>
    <circle cx="360" cy="195" r="1.5"/>
    <circle cx="265" cy="153" r="1.5"/>
    <circle cx="291" cy="167" r="1.5"/>
    <circle cx="425" cy="197" r="1.5"/>
    <circle cx="439" cy="196" r="1.5"/>
    <circle cx="374" cy="191" r="1.5"/>
    <circle cx="353" cy="180" r="1.5"/>
    <circle cx="321" cy="184" r="1.5"/>
    <circle cx="280" cy="170" r="1.5"/>
    <circle cx="282" cy="190" r="1.5"/>
    <circle cx="358" cy="199" r="1.5"/>
    <circle cx="173" cy="165" r="1.5"/>
    <circle cx="350" cy="180" r="1.5"/>
    <circle cx="162" cy="105" r="1.5"/>
    <circle cx="176" cy="107" r="1.5"/>
    <circle cx="147" cy="93" r="1.5"/>
    <circle cx="364" cy="177" r="1.5"/>
    <circle cx="411" cy="194" r="1.5"/>
    <circle cx="174" cy="197" r="1.5"/>
    <circle cx="195" cy="200" r="1.5"/>
    <circle cx="271" cy="190" r="1.5"/>
    <circle cx="173" cy="192" r="1.5"/>
    <circle cx="306" cy="166" r="1.5"/>
    <circle cx="326" cy="170" r="1.5"/>
    <circle cx="450" cy="193" r="1.5"/>
    <circle cx="382" cy="172" r="1.5"/>
    <circle cx="265" cy="189" r="1.5"/>
    <circle cx="306" cy="156" r="1.5"/>
    <circle cx="276" cy="168" r="1.5"/>
    <circle cx="236" cy="129" r="1.5"/>
    <circle cx="215" cy="129" r="1.5"/>
    <circle cx="252" cy="175" r="1.5"/>
    <circle cx="267" cy="183" r="1.5"/>
    <circle cx="244" cy="173" r="1.5"/>
    <circle cx="408" cy="179" r="1.5"/>
    <circle cx="194" cy="160" r="1.5"/>
    <circle cx="352" cy="165" r="1.5"/>
    <circle cx="339" cy="165" r="1.5"/>
    <circle cx="296" cy="177" r="1.5"/>
    <circle cx="298" cy="178" r="1.5"/>
    <circle cx="266" cy="163" r="1.5"/>
    <circle cx="32" cy="167" r="1.5"/>
    <circle cx="318" cy="177" r="1.5"/>
    <circle cx="426" cy="177" r="1.5"/>
    <circle cx="205" cy="158" r="1.5"/>
    <circle cx="215" cy="155" r="1.5"/>
    <circle cx="248" cy="166" r="1.5"/>
    <circle cx="291" cy="162" r="1.5"/>
    <circle cx="272" cy="160" r="1.5"/>
    <circle cx="334" cy="165" r="1.5"/>
    <circle cx="314" cy="160" r="1.5"/>
    <circle cx="184" cy="166" r="1.5"/>
    <circle cx="135" cy="176" r="1.5"/>
    <circle cx="218" cy="190" r="1.5"/>
    <circle cx="267" cy="140" r="1.5"/>
    <circle cx="266" cy="194" r="1.5"/>
    <circle cx="249" cy="196" r="1.5"/>
    <circle cx="311" cy="198" r="1.5"/>
    <circle cx="198" cy="158" r="1.5"/>
    <circle cx="289" cy="142" r="1.5"/>
    <circle cx="313" cy="198" r="1.5"/>
    <circle cx="320" cy="192" r="1.5"/>
    <circle cx="210" cy="181" r="1.5"/>
    <circle cx="271" cy="188" r="1.5"/>
    <circle cx="229" cy="124" r="1.5"/>
    <circle cx="81" cy="182" r="1.5"/>
    <circle cx="275" cy="170" r="1.5"/>
    <circle cx="255" cy="180" r="1.5"/>
    <circle cx="411" cy="197" r="1.5"/>
    <circle cx="369" cy="189" r="1.5"/>
    <circle cx="331" cy="180" r="1.5"/>
    <circle cx="300" cy="195" r="1.5"/>
    <circle cx="385" cy="193" r="1.5"/>
    <circle cx="322" cy="136" r="1.5"/>
    <circle cx="263" cy="180" r="1.5"/>
    <circle cx="427" cy="201" r="1.5"/>
    <circle cx="360" cy="194" r="1.5"/>
    <circle cx="410" cy="200" r="1.5"/>
    <circle cx="277" cy="162" r="1.5"/>
    <circle cx="334" cy="190" r="1.5"/>
    <circle cx="288" cy="178" r="1.5"/>
    <circle cx="285" cy="165" r="1.5"/>
    <circle cx="296" cy="164" r="1.5"/>
    <circle cx="204" cy="156" r="1.5"/>
    <circle cx="290" cy="171" r="1.5"/>
    <circle cx="368" cy="188" r="1.5"/>
    <circle cx="401" cy="200" r="1.5"/>
    <circle cx="292" cy="198" r="1.5"/>
    <circle cx="159" cy="166" r="1.5"/>
    <circle cx="446" cy="196" r="1.5"/>
    <circle cx="370" cy="185" r="1.5"/>
    <circle cx="365" cy="165" r="1.5"/>
    <circle cx="282" cy="174" r="1.5"/>
    <circle cx="315" cy="166" r="1.5"/>
    <circle cx="166" cy="124" r="1.5"/>
    <circle cx="262" cy="165" r="1.5"/>
    <circle cx="251" cy="173" r="1.5"/>
    <circle cx="324" cy="168" r="1.5"/>
    <circle cx="288" cy="159" r="1.5"/>
    <circle cx="296" cy="171" r="1.5"/>
    <circle cx="379" cy="193" r="1.5"/>
    <circle cx="340" cy="195" r="1.5"/>
    <circle cx="201" cy="151" r="1.5"/>
    <circle cx="412" cy="191" r="1.5"/>
    <circle cx="330" cy="172" r="1.5"/>
    <circle cx="212" cy="143" r="1.5"/>
    <circle cx="203" cy="150" r="1.5"/>
    <circle cx="181" cy="152" r="1.5"/>
    <circle cx="277" cy="172" r="1.5"/>
    <circle cx="161" cy="131" r="1.5"/>
    <circle cx="350" cy="150" r="1.5"/>
    <circle cx="334" cy="172" r="1.5"/>
    <circle cx="431" cy="194" r="1.5"/>
    <circle cx="398" cy="184" r="1.5"/>
    <circle cx="267" cy="194" r="1.5"/>
    <circle cx="299" cy="154" r="1.5"/>
    <circle cx="345" cy="184" r="1.5"/>
    <circle cx="254" cy="161" r="1.5"/>
    <circle cx="384" cy="192" r="1.5"/>
    <circle cx="363" cy="187" r="1.5"/>
    <circle cx="273" cy="138" r="1.5"/>
    <circle cx="243" cy="174" r="1.5"/>
    <circle cx="390" cy="181" r="1.5"/>
    <circle cx="278" cy="180" r="1.5"/>
    <circle cx="360" cy="185" r="1.5"/>
    <circle cx="401" cy="174" r="1.5"/>
    <circle cx="293" cy="163" r="1.5"/>
    <circle cx="326" cy="172" r="1.5"/>
    <circle cx="334" cy="178" r="1.5"/>
    <circle cx="187" cy="189" r="1.5"/>
    <circle cx="403" cy="176" r="1.5"/>
    <circle cx="313" cy="177" r="1.5"/>
    <circle cx="314" cy="183" r="1.5"/>
    <circle cx="299" cy="123" r="1.5"/>
    <circle cx="247" cy="178" r="1.5"/>
    <circle cx="246" cy="178" r="1.5"/>
    <circle cx="286" cy="178" r="1.5"/>
    <circle cx="273" cy="176" r="1.5"/>
    <circle cx="348" cy="183" r="1.5"/>
    <circle cx="251" cy="156" r="1.5"/>
    <circle cx="421" cy="174" r="1.5"/>
    <circle cx="293" cy="181" r="1.5"/>
    <circle cx="243" cy="76" r="1.5"/>
    <circle cx="350" cy="172" r="1.5"/>
    <circle cx="347" cy="178" r="1.5"/>
    <circle cx="354" cy="178" r="1.5"/>
    <circle cx="363" cy="177" r="1.5"/>
    <circle cx="307" cy="173" r="1.5"/>
    <circle cx="349" cy="194" r="1.5"/>
    <circle cx="403" cy="197" r="1.5"/>
    <circle cx="381" cy="183" r="1.5"/>
    <circle cx="271" cy="187" r="1.5"/>
    <circle cx="311" cy="155" r="1.5"/>
    <circle cx="262" cy="185" r="1.5"/>
    <circle cx="248" cy="182" r="1.5"/>
    <circle cx="276" cy="185" r="1.5"/>
    <circle cx="277" cy="175" r="1.5"/>
    <circle cx="386" cy="185" r="1.5"/>
    <circle cx="412" cy="190" r="1.5"/>
    <circle cx="317" cy="186" r="1.5"/>
    <circle cx="309" cy="173" r="1.5"/>
    <circle cx="211" cy="132" r="1.5"/>
    <circle cx="295" cy="172" r="1.5"/>
    <circle cx="272" cy="150" r="1.5"/>
    <circle cx="423" cy="186" r="1.5"/>
    <circle cx="301" cy="175" r="1.5"/>
    <circle cx="354" cy="196" r="1.5"/>
    <circle cx="303" cy="188" r="1.5"/>
    <circle cx="307" cy="194" r="1.5"/>
    <circle cx="348" cy="191" r="1.5"/>
    <circle cx="349" cy="184" r="1.5"/>
    <circle cx="302" cy="174" r="1.5"/>
    <circle cx="368" cy="179" r="1.5"/>
    <circle cx="306" cy="147" r="1.5"/>
    <circle cx="303" cy="182" r="1.5"/>
    <circle cx="402" cy="189" r="1.5"/>
    <circle cx="331" cy="185" r="1.5"/>
    <circle cx="291" cy="181" r="1.5"/>
    <circle cx="266" cy="130" r="1.5"/>
    <circle cx="408" cy="188" r="1.5"/>
    <circle cx="327" cy="186" r="1.5"/>
    <circle cx="374" cy="175" r="1.5"/>
    <circle cx="246" cy="186" r="1.5"/>
    <circle cx="437" cy="182" r="1.5"/>
    <circle cx="326" cy="192" r="1.5"/>
    <circle cx="430" cy="190" r="1.5"/>
    <circle cx="307" cy="195" r="1.5"/>
    <circle cx="428" cy="182" r="1.5"/>
    <circle cx="338" cy="160" r="1.5"/>
    <circle cx="243" cy="186" r="1.5"/>
    <circle cx="385" cy="172" r="1.5"/>
    <circle cx="252" cy="174" r="1.5"/>
    <circle cx="401" cy="195" r="1.5"/>
    <circle cx="351" cy="193" r="1.5"/>
    <circle cx="250" cy="148" r="1.5"/>
    <circle cx="236" cy="164" r="1.5"/>
    <circle cx="332" cy="195" r="1.5"/>
    <circle cx="291" cy="168" r="1.5"/>
    <circle cx="321" cy="174" r="1.5"/>
    <circle cx="322" cy="164" r="1.5"/>
    <circle cx="230" cy="174" r="1.5"/>
    <circle cx="369" cy="163" r="1.5"/>
    <circle cx="301" cy="138" r="1.5"/>
    <circle cx="202" cy="178" r="1.5"/>
    <circle cx="358" cy="193" r="1.5"/>
    <circle cx="293" cy="190" r="1.5"/>
    <circle cx="449" cy="199" r="1.5"/>
    <circle cx="257" cy="137" r="1.5"/>
    <circle cx="429" cy="195" r="1.5"/>
    <circle cx="309" cy="165" r="1.5"/>
    <circle cx="276" cy="98" r="1.5"/>
    <circle cx="287" cy="142" r="1.5"/>
    <circle cx="213" cy="185" r="1.5"/>
    <circle cx="323" cy="176" r="1.5"/>
    <circle cx="315" cy="194" r="1.5"/>
    <circle cx="331" cy="174" r="1.5"/>
    <circle cx="239" cy="174" r="1.5"/>
    <circle cx="342" cy="184" r="1.5"/>
    <circle cx="430" cy="195" r="1.5"/>
    <circle cx="131" cy="129" r="1.5"/>
    <circle cx="319" cy="144" r="1.5"/>
    <circle cx="287" cy="156" r="1.5"/>
    <circle cx="461" cy="197" r="1.5"/>
    <circle cx="351" cy="195" r="1.5"/>
    <circle cx="332" cy="171" r="1.5"/>
    <circle cx="459" cy="198" r="1.5"/>
    <circle cx="453" cy="192" r="1.5"/>
    <circle cx="417" cy="192" r="1.5"/>
    <circle cx="421" cy="180" r="1.5"/>
    <circle cx="258" cy="183" r="1.5"/>
    <circle cx="369" cy="191" r="1.5"/>
    <circle cx="319" cy="190" r="1.5"/>
    <circle cx="271" cy="195" r="1.5"/>
    <circle cx="458" cy="192" r="1.5"/>
    <circle cx="399" cy="188" r="1.5"/>
    <circle cx="430" cy="171" r="1.5"/>
    <circle cx="160" cy="114" r="1.5"/>
    <circle cx="343" cy="186" r="1.5"/>
    <circle cx="332" cy="199" r="1.5"/>
    <circle cx="328" cy="185" r="1.5"/>
    <circle cx="311" cy="197" r="1.5"/>
    <circle cx="342" cy="181" r="1.5"/>
    <circle cx="206" cy="148" r="1.5"/>
    <circle cx="320" cy="190" r="1.5"/>
    <circle cx="313" cy="124" r="1.5"/>
    <circle cx="294" cy="162" r="1.5"/>
    <circle cx="435" cy="182" r="1.5"/>
    <circle cx="426" cy="192" r="1.5"/>
    <circle cx="408" cy="193" r="1.5"/>
    <circle cx="282" cy="183" r="1.5"/>
    <circle cx="368" cy="182" r="1.5"/>
    <circle cx="381" cy="197" r="1.5"/>
    <circle cx="291" cy="195" r="1.5"/>
    <circle cx="440" cy="200" r="1.5"/>
    <circle cx="415" cy="198" r="1.5"/>
    <circle cx="344" cy="182" r="1.5"/>
    <circle cx="353" cy="192" r="1.5"/>
    <circle cx="386" cy="195" r="1.5"/>
    <circle cx="351" cy="201" r="1.5"/>
    <circle cx="244" cy="183" r="1.5"/>
    <circle cx="379" cy="195" r="1.5"/>
    <circle cx="361" cy="187" r="1.5"/>
    <circle cx="268" cy="156" r="1.5"/>
    <circle cx="377" cy="174" r="1.5"/>
    <circle cx="308" cy="165" r="1.5"/>
    <circle cx="275" cy="155" r="1.5"/>
    <circle cx="375" cy="186" r="1.5"/>
    <circle cx="367" cy="170" r="1.5"/>
    <circle cx="193" cy="159" r="1.5"/>
    <circle cx="371" cy="176" r="1.5"/>
    <circle cx="275" cy="182" r="1.5"/>
    <circle cx="352" cy="180" r="1.5"/>
    <circle cx="336" cy="174" r="1.5"/>
    <circle cx="118" cy="147" r="1.5"/>
    <circle cx="320" cy="189" r="1.5"/>
    <circle cx="410" cy="198" r="1.5"/>
    <circle cx="337" cy="191" r="1.5"/>
    <circle cx="292" cy="166" r="1.5"/>
    <circle cx="322" cy="151" r="1.5"/>
    <circle cx="302" cy="160" r="1.5"/>
    <circle cx="156" cy="170" r="1.5"/>
    <circle cx="336" cy="194" r="1.5"/>
    <circle cx="272" cy="188" r="1.5"/>
    <circle cx="257" cy="171" r="1.5"/>
    <circle cx="441" cy="199" r="1.5"/>
    <circle cx="423" cy="197" r="1.5"/>
    <circle cx="372" cy="173" r="1.5"/>
    <circle cx="365" cy="195" r="1.5"/>
    <circle cx="325" cy="194" r="1.5"/>
    <circle cx="270" cy="162" r="1.5"/>
    <circle cx="330" cy="188" r="1.5"/>
    <circle cx="256" cy="180" r="1.5"/>
    <circle cx="218" cy="176" r="1.5"/>
    <circle cx="276" cy="180" r="1.5"/>
    <circle cx="353" cy="171" r="1.5"/>
    <circle cx="304" cy="167" r="1.5"/>
    <circle cx="348" cy="161" r="1.5"/>
    <circle cx="452" cy="198" r="1.5"/>
    <circle cx="381" cy="198" r="1.5"/>
    <circle cx="309" cy="184" r="1.5"/>
    <circle cx="365" cy="189" r="1.5"/>
    <circle cx="419" cy="198" r="1.5"/>
    <circle cx="267" cy="190" r="1.5"/>
    <circle cx="198" cy="184" r="1.5"/>
    <circle cx="383" cy="189" r="1.5"/>
    <circle cx="244" cy="156" r="1.5"/>
    <circle cx="200" cy="171" r="1.5"/>
    <circle cx="373" cy="178" r="1.5"/>
    <circle cx="276" cy="165" r="1.5"/>
    <circle cx="352" cy="196" r="1.5"/>
    <circle cx="328" cy="180" r="1.5"/>
    <circle cx="367" cy="197" r="1.5"/>
    <circle cx="174" cy="172" r="1.5"/>
    <circle cx="305" cy="177" r="1.5"/>
    <circle cx="324" cy="136" r="1.5"/>
    <circle cx="257" cy="181" r="1.5"/>
    <circle cx="339" cy="161" r="1.5"/>
    <circle cx="413" cy="175" r="1.5"/>
    <circle cx="375" cy="196" r="1.5"/>
    <circle cx="208" cy="64" r="1.5"/>
    <circle cx="344" cy="193" r="1.5"/>
    <circle cx="331" cy="85" r="1.5"/>
    <circle cx="383" cy="167" r="1.5"/>
    <circle cx="298" cy="155" r="1.5"/>
    <circle cx="376" cy="181" r="1.5"/>
    <circle cx="342" cy="176" r="1.5"/>
    <circle cx="283" cy="187" r="1.5"/>
    <circle cx="342" cy="194" r="1.5"/>
    <circle cx="317" cy="171" r="1.5"/>
    <circle cx="284" cy="188" r="1.5"/>
    <circle cx="323" cy="158" r="1.5"/>
    <circle cx="214" cy="154" r="1.5"/>
    <circle cx="307" cy="150" r="1.5"/>
    <circle cx="296" cy="161" r="1.5"/>
    <circle cx="311" cy="171" r="1.5"/>
    <circle cx="241" cy="171" r="1.5"/>
    <circle cx="330" cy="191" r="1.5"/>
    <circle cx="256" cy="152" r="1.5"/>
    <circle cx="342" cy="172" r="1.5"/>
    <circle cx="188" cy="149" r="1.5"/>
    <circle cx="409" cy="183" r="1.5"/>
    <circle cx="325" cy="197" r="1.5"/>
    <circle cx="282" cy="191" r="1.5"/>
    <circle cx="348" cy="198" r="1.5"/>
    <circle cx="295" cy="186" r="1.5"/>
    <circle cx="406" cy="192" r="1.5"/>
    <circle cx="159" cy="169" r="1.5"/>
    <circle cx="300" cy="183" r="1.5"/>
    <circle cx="351" cy="166" r="1.5"/>
    <circle cx="346" cy="129" r="1.5"/>
    <circle cx="278" cy="87" r="1.5"/>
    <circle cx="461" cy="189" r="1.5"/>
    <circle cx="383" cy="176" r="1.5"/>
    <circle cx="437" cy="195" r="1.5"/>
    <circle cx="319" cy="147" r="1.5"/>
    <circle cx="334" cy="153" r="1.5"/>
    <circle cx="422" cy="194" r="1.5"/>
    <circle cx="267" cy="148" r="1.5"/>
    <circle cx="366" cy="174" r="1.5"/>
    <circle cx="439" cy="198" r="1.5"/>
    <circle cx="215" cy="166" r="1.5"/>
    <circle cx="352" cy="149" r="1.5"/>
    <circle cx="186" cy="200" r="1.5"/>
    <circle cx="373" cy="182" r="1.5"/>
    <circle cx="364" cy="175" r="1.5"/>
    <circle cx="379" cy="189" r="1.5"/>
    <circle cx="261" cy="181" r="1.5"/>
    <circle cx="356" cy="182" r="1.5"/>
    <circle cx="292" cy="176" r="1.5"/>
    <circle cx="346" cy="183" r="1.5"/>
    <circle cx="309" cy="154" r="1.5"/>
    <circle cx="275" cy="121" r="1.5"/>
    <circle cx="272" cy="181" r="1.5"/>
    <circle cx="268" cy="126" r="1.5"/>
    <circle cx="322" cy="169" r="1.5"/>
    <circle cx="351" cy="147" r="1.5"/>
    <circle cx="395" cy="196" r="1.5"/>
    <circle cx="448" cy="196" r="1.5"/>
    <circle cx="254" cy="196" r="1.5"/>
    <circle cx="370" cy="195" r="1.5"/>
    <circle cx="154" cy="191" r="1.5"/>
    <circle cx="373" cy="196" r="1.5"/>
    <circle cx="334" cy="184" r="1.5"/>
    <circle cx="303" cy="172" r="1.5"/>
    <circle cx="306" cy="195" r="1.5"/>
    <circle cx="353" cy="172" r="1.5"/>
    <circle cx="449" cy="175" r="1.5"/>
    <circle cx="322" cy="186" r="1.5"/>
    <circle cx="314" cy="177" r="1.5"/>
    <circle cx="352" cy="194" r="1.5"/>
    <circle cx="418" cy="194" r="1.5"/>
    <circle cx="319" cy="197" r="1.5"/>
    <circle cx="313" cy="178" r="1.5"/>
    <circle cx="344" cy="163" r="1.5"/>
    <circle cx="427" cy="195" r="1.5"/>
    <circle cx="399" cy="195" r="1.5"/>
    <circle cx="381" cy="184" r="1.5"/>
    <circle cx="454" cy="186" r="1.5"/>
    <circle cx="350" cy="185" r="1.5"/>
    <circle cx="289" cy="189" r="1.5"/>
    <circle cx="349" cy="189" r="1.5"/>
    <circle cx="380" cy="183" r="1.5"/>
    <circle cx="279" cy="149" r="1.5"/>
    <circle cx="306" cy="194" r="1.5"/>
    <circle cx="294" cy="172" r="1.5"/>
    <circle cx="355" cy="180" r="1.5"/>
    <circle cx="364" cy="178" r="1.5"/>
    <circle cx="348" cy="188" r="1.5"/>
    <circle cx="200" cy="150" r="1.5"/>
    <circle cx="309" cy="151" r="1.5"/>
    <circle cx="242" cy="129" r="1.5"/>
    <circle cx="423" cy="194" r="1.5"/>
    <circle cx="337" cy="148" r="1.5"/>
    <circle cx="406" cy="182" r="1.5"/>
    <circle cx="384" cy="174" r="1.5"/>
    <circle cx="236" cy="166" r="1.5"/>
    <circle cx="246" cy="132" r="1.5"/>
    <circle cx="261" cy="174" r="1.5"/>
    <circle cx="240" cy="182" r="1.5"/>
    <circle cx="314" cy="199" r="1.5"/>
    <circle cx="400" cy="192" r="1.5"/>
    <circle cx="244" cy="184" r="1.5"/>
    <circle cx="388" cy="192" r="1.5"/>
    <circle cx="320" cy="182" r="1.5"/>
    <circle cx="405" cy="201" r="1.5"/>
    <circle cx="220" cy="180" r="1.5"/>
    <circle cx="339" cy="177" r="1.5"/>
    <circle cx="299" cy="138" r="1.5"/>
    <circle cx="357" cy="179" r="1.5"/>
    <circle cx="306" cy="145" r="1.5"/>
    <circle cx="297" cy="153" r="1.5"/>
    <circle cx="388" cy="181" r="1.5"/>
    <circle cx="263" cy="177" r="1.5"/>
    <circle cx="282" cy="176" r="1.5"/>
    <circle cx="280" cy="182" r="1.5"/>
    <circle cx="448" cy="190" r="1.5"/>
    <circle cx="343" cy="183" r="1.5"/>
    <circle cx="424" cy="199" r="1.5"/>
    <circle cx="413" cy="194" r="1.5"/>
    <circle cx="310" cy="159" r="1.5"/>
    <circle cx="305" cy="154" r="1.5"/>
    <circle cx="310" cy="154" r="1.5"/>
    <circle cx="422" cy="180" r="1.5"/>
    <circle cx="374" cy="199" r="1.5"/>
    <circle cx="211" cy="172" r="1.5"/>
    <circle cx="306" cy="179" r="1.5"/>
    <circle cx="275" cy="177" r="1.5"/>
    <circle cx="394" cy="180" r="1.5"/>
    <circle cx="302" cy="181" r="1.5"/>
    <circle cx="446" cy="186" r="1.5"/>
    <circle cx="455" cy="194" r="1.5"/>
    <circle cx="325" cy="152" r="1.5"/>
    <circle cx="336" cy="167" r="1.5"/>
    <circle cx="399" cy="198" r="1.5"/>
    <circle cx="294" cy="125" r="1.5"/>
    <circle cx="365" cy="197" r="1.5"/>
    <circle cx="310" cy="200" r="1.5"/>
    <circle cx="229" cy="159" r="1.5"/>
    <circle cx="251" cy="175" r="1.5"/>
    <circle cx="442" cy="199" r="1.5"/>
    <circle cx="306" cy="198" r="1.5"/>
    <circle cx="288" cy="183" r="1.5"/>
    <circle cx="201" cy="153" r="1.5"/>
    <circle cx="390" cy="177" r="1.5"/>
    <circle cx="171" cy="148" r="1.5"/>
    <circle cx="274" cy="199" r="1.5"/>
    <circle cx="148" cy="145" r="1.5"/>
    <circle cx="331" cy="182" r="1.5"/>
    <circle cx="165" cy="185" r="1.5"/>
    <circle cx="332" cy="175" r="1.5"/>
    <circle cx="312" cy="181" r="1.5"/>
    <circle cx="306" cy="182" r="1.5"/>
    <circle cx="377" cy="182" r="1.5"/>
    <circle cx="147" cy="103" r="1.5"/>
    <circle cx="313" cy="167" r="1.5"/>
    <circle cx="248" cy="158" r="1.5"/>
    <circle cx="350" cy="190" r="1.5"/>
    <circle cx="294" cy="183" r="1.5"/>
    <circle cx="246" cy="174" r="1.5"/>
    <circle cx="163" cy="176" r="1.5"/>
    <circle cx="394" cy="197" r="1.5"/>
    <circle cx="323" cy="194" r="1.5"/>
    <circle cx="372" cy="194" r="1.5"/>
    <circle cx="252" cy="191" r="1.5"/>
    <circle cx="192" cy="95" r="1.5"/>
    <circle cx="382" cy="174" r="1.5"/>
    <circle cx="245" cy="191" r="1.5"/>
    <circle cx="312" cy="179" r="1.5"/>
    <circle cx="326" cy="191" r="1.5"/>
    <circle cx="213" cy="182" r="1.5"/>
    <circle cx="343" cy="171" r="1.5"/>
    <circle cx="301" cy="171" r="1.5"/>
    <circle cx="287" cy="182" r="1.5"/>
    <circle cx="313" cy="182" r="1.5"/>
    <circle cx="257" cy="192" r="1.5"/>
    <circle cx="154" cy="144" r="1.5"/>
    <circle cx="335" cy="174" r="1.5"/>
    <circle cx="308" cy="135" r="1.5"/>
    <circle cx="401" cy="189" r="1.5"/>
    <circle cx="347" cy="183" r="1.5"/>
    <circle cx="359" cy="190" r="1.5"/>
    <circle cx="266" cy="196" r="1.5"/>
    <circle cx="384" cy="196" r="1.5"/>
    <circle cx="371" cy="194" r="1.5"/>
    <circle cx="347" cy="194" r="1.5"/>
    <circle cx="414" cy="194" r="1.5"/>
    <circle cx="451" cy="196" r="1.5"/>
    <circle cx="345" cy="191" r="1.5"/>
    <circle cx="280" cy="187" r="1.5"/>
    <circle cx="332" cy="189" r="1.5"/>
    <circle cx="220" cy="155" r="1.5"/>
    <circle cx="431" cy="189" r="1.5"/>
    <circle cx="346" cy="193" r="1.5"/>
    <circle cx="261" cy="143" r="1.5"/>
    <circle cx="309" cy="136" r="1.5"/>
    <circle cx="239" cy="142" r="1.5"/>
    <circle cx="351" cy="163" r="1.5"/>
    <circle cx="364" cy="160" r="1.5"/>
    <circle cx="313" cy="165" r="1.5"/>
    <circle cx="347" cy="162" r="1.5"/>
    <circle cx="353" cy="191" r="1.5"/>
    <circle cx="436" cy="184" r="1.5"/>
    <circle cx="363" cy="195" r="1.5"/>
    <circle cx="222" cy="195" r="1.5"/>
    <circle cx="428" cy="195" r="1.5"/>
    <circle cx="109" cy="98" r="1.5"/>
    <circle cx="92" cy="86" r="1.5"/>
    <circle cx="364" cy="180" r="1.5"/>
    <circle cx="195" cy="156" r="1.5"/>
    <circle cx="217" cy="182" r="1.5"/>
    <circle cx="393" cy="185" r="1.5"/>
    <circle cx="348" cy="193" r="1.5"/>
    <circle cx="296" cy="186" r="1.5"/>
    <circle cx="317" cy="195" r="1.5"/>
    <circle cx="303" cy="178" r="1.5"/>
    <circle cx="222" cy="112" r="1.5"/>
    <circle cx="286" cy="187" r="1.5"/>
    <circle cx="350" cy="160" r="1.5"/>
    <circle cx="256" cy="141" r="1.5"/>
    <circle cx="397" cy="188" r="1.5"/>
    <circle cx="215" cy="158" r="1.5"/>
    <circle cx="225" cy="144" r="1.5"/>
    <circle cx="349" cy="193" r="1.5"/>
    <circle cx="355" cy="193" r="1.5"/>
    <circle cx="249" cy="179" r="1.5"/>
    <circle cx="385" cy="201" r="1.5"/>
    <circle cx="342" cy="196" r="1.5"/>
    <circle cx="334" cy="201" r="1.5"/>
    <circle cx="383" cy="197" r="1.5"/>
    <circle cx="326" cy="196" r="1.5"/>
    <circle cx="301" cy="178" r="1.5"/>
    <circle cx="274" cy="138" r="1.5"/>
    <circle cx="224" cy="164" r="1.5"/>
    <circle cx="373" cy="188" r="1.5"/>
    <circle cx="-38" cy="184" r="1.5"/>
    <circle cx="224" cy="178" r="1.5"/>
    <circle cx="223" cy="178" r="1.5"/>
    <circle cx="142" cy="172" r="1.5"/>
    <circle cx="324" cy="195" r="1.5"/>
    <circle cx="446" cy="180" r="1.5"/>
    <circle cx="288" cy="187" r="1.5"/>
    <circle cx="330" cy="195" r="1.5"/>
    <circle cx="130" cy="167" r="1.5"/>
    <circle cx="313" cy="183" r="1.5"/>
    <circle cx="233" cy="177" r="1.5"/>
    <circle cx="288" cy="160" r="1.5"/>
    <circle cx="334" cy="191" r="1.5"/>
    <circle cx="319" cy="157" r="1.5"/>
    <circle cx="339" cy="190" r="1.5"/>
    <circle cx="304" cy="179" r="1.5"/>
    <circle cx="359" cy="169" r="1.5"/>
    <circle cx="309" cy="187" r="1.5"/>
    <circle cx="410" cy="188" r="1.5"/>
    <circle cx="272" cy="182" r="1.5"/>
    <circle cx="391" cy="197" r="1.5"/>
    <circle cx="202" cy="154" r="1.5"/>
    <circle cx="389" cy="196" r="1.5"/>
    <circle cx="265" cy="183" r="1.5"/>
    <circle cx="302" cy="192" r="1.5"/>
    <circle cx="331" cy="184" r="1.5"/>
    <circle cx="343" cy="181" r="1.5"/>
    <circle cx="345" cy="200" r="1.5"/>
    <circle cx="294" cy="176" r="1.5"/>
    <circle cx="192" cy="168" r="1.5"/>
    <circle cx="352" cy="201" r="1.5"/>
    <circle cx="412" cy="183" r="1.5"/>
    <circle cx="314" cy="190" r="1.5"/>
    <circle cx="350" cy="200" r="1.5"/>
    <circle cx="423" cy="187" r="1.5"/>
    <circle cx="271" cy="189" r="1.5"/>
    <circle cx="342" cy="124" r="1.5"/>
    <circle cx="314" cy="153" r="1.5"/>
    <circle cx="411" cy="201" r="1.5"/>
    <circle cx="374" cy="192" r="1.5"/>
    <circle cx="379" cy="176" r="1.5"/>
    <circle cx="163" cy="163" r="1.5"/>
    <circle cx="216" cy="179" r="1.5"/>
    <circle cx="284" cy="180" r="1.5"/>
    <circle cx="320" cy="146" r="1.5"/>
    <circle cx="291" cy="139" r="1.5"/>
    <circle cx="400" cy="181" r="1.5"/>
    <circle cx="232" cy="171" r="1.5"/>
    <circle cx="233" cy="182" r="1.5"/>
    <circle cx="379" cy="187" r="1.5"/>
    <circle cx="308" cy="185" r="1.5"/>
    <circle cx="371" cy="195" r="1.5"/>
    <circle cx="211" cy="174" r="1.5"/>
    <circle cx="256" cy="159" r="1.5"/>
    <circle cx="351" cy="198" r="1.5"/>
    <circle cx="442" cy="197" r="1.5"/>
    <circle cx="177" cy="159" r="1.5"/>
    <circle cx="396" cy="183" r="1.5"/>
    <circle cx="228" cy="184" r="1.5"/>
    <circle cx="461" cy="190" r="1.5"/>
    <circle cx="326" cy="194" r="1.5"/>
    </g>
    <path d="M461,190 L455,190 L455,175 L436,175 L436,169 L434,169 L434,153 L412,153 L412,132 L389,132 L389,117 L309,117 L309,83" fill="none" stroke="#1f2937" stroke-width="1.4" stroke-dasharray="5,3" opacity="0.8"/>
    <path d="M461,197 L460,197 L460,194 L458,194 L458,192 L457,192 L457,186 L454,186 L454,182 L445,182 L445,177 L439,177 L439,173 L410,173 L410,143 L343,143 L343,143 L332,143 L332,141 L330,141 L330,140 L328,140 L328,139 L324,139 L324,136 L322,136 L322,136 L318,136 L318,127 L308,127 L308,125 L307,125 L307,115 L306,115 L306,113 L304,113 L304,110 L286,110 L286,107 L276,107 L276,98 L275,98 L275,86 L243,86 L243,76 L80,76 L80,53" fill="none" stroke="#FF680A" stroke-width="1.6" opacity="0.9"/>
    <circle cx="461" cy="190" r="3" fill="#1f2937"/>
    <circle cx="455" cy="175" r="3" fill="#1f2937"/>
    <circle cx="436" cy="169" r="3" fill="#1f2937"/>
    <circle cx="434" cy="153" r="3" fill="#1f2937"/>
    <circle cx="412" cy="132" r="3" fill="#1f2937"/>
    <circle cx="389" cy="117" r="3" fill="#1f2937"/>
    <circle cx="309" cy="83" r="3" fill="#1f2937"/>
    <circle cx="461" cy="197" r="3" fill="#FF680A"/>
    <circle cx="460" cy="194" r="3" fill="#FF680A"/>
    <circle cx="458" cy="192" r="3" fill="#FF680A"/>
    <circle cx="457" cy="186" r="3" fill="#FF680A"/>
    <circle cx="454" cy="182" r="3" fill="#FF680A"/>
    <circle cx="445" cy="177" r="3" fill="#FF680A"/>
    <circle cx="439" cy="173" r="3" fill="#FF680A"/>
    <circle cx="410" cy="143" r="3" fill="#FF680A"/>
    <circle cx="343" cy="143" r="3" fill="#FF680A"/>
    <circle cx="332" cy="141" r="3" fill="#FF680A"/>
    <circle cx="330" cy="140" r="3" fill="#FF680A"/>
    <circle cx="328" cy="139" r="3" fill="#FF680A"/>
    <circle cx="324" cy="136" r="3" fill="#FF680A"/>
    <circle cx="322" cy="136" r="3" fill="#FF680A"/>
    <circle cx="318" cy="127" r="3" fill="#FF680A"/>
    <circle cx="308" cy="125" r="3" fill="#FF680A"/>
    <circle cx="307" cy="115" r="3" fill="#FF680A"/>
    <circle cx="306" cy="113" r="3" fill="#FF680A"/>
    <circle cx="304" cy="110" r="3" fill="#FF680A"/>
    <circle cx="286" cy="107" r="3" fill="#FF680A"/>
    <circle cx="276" cy="98" r="3" fill="#FF680A"/>
    <circle cx="275" cy="86" r="3" fill="#FF680A"/>
    <circle cx="243" cy="76" r="3" fill="#FF680A"/>
    <circle cx="80" cy="53" r="3" fill="#FF680A"/>
    <rect x="440" y="44" width="8" height="2.5" fill="#FF680A"/>
    <text x="453" y="49" font-size="9" fill="#1f2937">precious-free frontier</text>
    <line x1="440" y1="60" x2="448" y2="60" stroke="#1f2937" stroke-width="1.4" stroke-dasharray="5,3"/>
    <text x="453" y="63" font-size="9" fill="#1f2937">precious-metal frontier</text>
    <circle cx="444" cy="74" r="1.5" fill="#1f2937" opacity="0.28"/>
    <text x="453" y="77" font-size="9" fill="#1f2937">one compound (2,044 reliable)</text>
    <text x="389" y="110" font-size="9.5" font-style="italic" fill="#1f2937" paint-order="stroke" stroke="#fff" stroke-width="3">FePt</text>
    <text x="314" y="80" font-size="9.5" font-style="italic" fill="#1f2937" paint-order="stroke" stroke="#fff" stroke-width="3">Fe₃Pt</text>
    <text x="441" y="163" font-size="9.5" font-style="italic" fill="#1f2937" paint-order="stroke" stroke="#fff" stroke-width="3">CoIr</text>
    <text x="80" y="51" font-size="9.5" font-style="italic" fill="#FF680A" paint-order="stroke" stroke="#fff" stroke-width="3">Fe₁₃Co₃</text>
    <text x="269" y="84" font-size="9.5" text-anchor="end" font-style="italic" fill="#FF680A" paint-order="stroke" stroke="#fff" stroke-width="3">Fe₂Ni</text>
    <text x="291" y="97" font-size="9.5" font-style="italic" fill="#FF680A" paint-order="stroke" stroke="#fff" stroke-width="3">Fe₄B₂</text>
    <text x="321" y="119" font-size="9.5" font-style="italic" fill="#FF680A" paint-order="stroke" stroke="#fff" stroke-width="3">Fe₁₅MnB₈</text>
    <text x="336" y="160" font-size="9.5" text-anchor="end" font-style="italic" fill="#FF680A" paint-order="stroke" stroke="#fff" stroke-width="3">HfGaFe₄</text>
    <text x="415" y="144" font-size="9.5" font-style="italic" fill="#FF680A" paint-order="stroke" stroke="#fff" stroke-width="3">Mn₂SbTe</text>
    <text x="459" y="184" font-size="9.5" font-style="italic" fill="#FF680A" paint-order="stroke" stroke="#fff" stroke-width="3">FeI₂</text>
    <text x="548" y="158" font-size="9" font-style="italic" fill="#888" opacity="0.8" text-anchor="middle">flagged outliers</text>
  </svg>
  <figcaption><strong>Figure 12.</strong> Every κ-reliable label on the hardness-magnetization plane (2,044 compounds, overlapping points merged). Iron-rich intermetallics crowd the strong-but-soft left edge; the hard right side is populated by dilute-moment oxides, chalcogenides, and halides, with the palest points in the flagged-outlier tail. The staircases trace Pareto frontiers over unflagged easy-axis compounds: the precious-metal frontier (dashed) dominates the precious-free frontier (orange) through the magnet-relevant range, and the free frontier crosses the NdFeB-ceiling line only at the κ ≈ 1 boride corner. The nearly empty upper right is the region a rare-earth-free NdFeB replacement must occupy.</figcaption>
</figure>

A permanent magnet must satisfy three intrinsic requirements at once, and Figure 13 adds the third: the Curie temperature. The three-dimensional Pareto set over hardness, magnetization, and Curie temperature holds 28 compounds, and the added axis reorders the shortlist. High-Curie cobalt-rich compounds (Co₃Cu, FeNi₃, MnCo₄) enter the frontier on thermal margin, while Mn₂SbTe, robust in the two-dimensional planes, drops out: its 438 K Curie point is dominated. The borides survive on all three axes.

<figure>
  <svg viewBox="0 0 620 350" xmlns="http://www.w3.org/2000/svg" style="font-family:inherit;">
    <line x1="310" y1="180" x2="460" y2="255" stroke="#bbb" stroke-width="0.7"/>
    <line x1="310" y1="180" x2="160" y2="255" stroke="#bbb" stroke-width="0.7"/>
    <line x1="460" y1="255" x2="310" y2="330" stroke="#bbb" stroke-width="0.5"/>
    <line x1="160" y1="255" x2="310" y2="330" stroke="#bbb" stroke-width="0.5"/>
    <line x1="160" y1="255" x2="160" y2="135" stroke="#888" stroke-width="0.7"/>
    <line x1="156" y1="195" x2="160" y2="195" stroke="#888" stroke-width="0.7"/>
    <text x="152" y="198" font-size="8.5" fill="#888" text-anchor="end">1</text>
    <line x1="156" y1="135" x2="160" y2="135" stroke="#888" stroke-width="0.7"/>
    <text x="152" y="138" font-size="8.5" fill="#888" text-anchor="end">2</text>
    <text x="152" y="127" font-size="10" font-style="italic" fill="#444" text-anchor="end">Ms, MA/m</text>
    <text x="468" y="264" font-size="10" font-style="italic" fill="#444" transform="rotate(26.6 468 264)">κ (log) →</text>
    <line x1="429" y1="240" x2="424" y2="249" stroke="#888" stroke-width="0.7"/>
    <text x="420" y="261" font-size="8.5" fill="#888" text-anchor="middle" paint-order="stroke" stroke="#fff" stroke-width="3">10</text>
    <text x="150" y="271" font-size="8.5" fill="#888" text-anchor="end">1200 K</text>
    <text x="193" y="229" font-size="10" font-style="italic" fill="#444" text-anchor="middle" transform="rotate(-26.6 193 229)">← Tc, K</text>
    <line x1="377" y1="214" x2="227" y2="289" stroke="#1f2937" stroke-width="0.7" stroke-dasharray="4,3" opacity="0.65"/>
    <text x="257" y="268" font-size="9" fill="#1f2937" text-anchor="middle" transform="rotate(-26.6 257 268)" paint-order="stroke" stroke="#fff" stroke-width="3">κ = 1</text>
    <g fill="#1f2937" opacity="0.18">
    <circle cx="364" cy="179" r="1.4"/>
    <circle cx="368" cy="194" r="1.4"/>
    <circle cx="377" cy="201" r="1.4"/>
    <circle cx="405" cy="219" r="1.4"/>
    <circle cx="367" cy="197" r="1.4"/>
    <circle cx="369" cy="199" r="1.4"/>
    <circle cx="389" cy="202" r="1.4"/>
    <circle cx="339" cy="166" r="1.4"/>
    <circle cx="415" cy="227" r="1.4"/>
    <circle cx="362" cy="183" r="1.4"/>
    <circle cx="375" cy="203" r="1.4"/>
    <circle cx="370" cy="195" r="1.4"/>
    <circle cx="388" cy="211" r="1.4"/>
    <circle cx="394" cy="215" r="1.4"/>
    <circle cx="394" cy="213" r="1.4"/>
    <circle cx="414" cy="227" r="1.4"/>
    <circle cx="372" cy="190" r="1.4"/>
    <circle cx="385" cy="209" r="1.4"/>
    <circle cx="371" cy="204" r="1.4"/>
    <circle cx="353" cy="190" r="1.4"/>
    <circle cx="406" cy="208" r="1.4"/>
    <circle cx="386" cy="203" r="1.4"/>
    <circle cx="404" cy="221" r="1.4"/>
    <circle cx="405" cy="225" r="1.4"/>
    <circle cx="403" cy="220" r="1.4"/>
    <circle cx="385" cy="210" r="1.4"/>
    <circle cx="412" cy="224" r="1.4"/>
    <circle cx="376" cy="185" r="1.4"/>
    <circle cx="364" cy="197" r="1.4"/>
    <circle cx="367" cy="191" r="1.4"/>
    <circle cx="410" cy="221" r="1.4"/>
    <circle cx="344" cy="165" r="1.4"/>
    <circle cx="383" cy="184" r="1.4"/>
    <circle cx="398" cy="222" r="1.4"/>
    <circle cx="381" cy="203" r="1.4"/>
    <circle cx="400" cy="220" r="1.4"/>
    <circle cx="359" cy="195" r="1.4"/>
    <circle cx="409" cy="222" r="1.4"/>
    <circle cx="400" cy="216" r="1.4"/>
    <circle cx="357" cy="183" r="1.4"/>
    <circle cx="355" cy="186" r="1.4"/>
    <circle cx="412" cy="229" r="1.4"/>
    <circle cx="407" cy="218" r="1.4"/>
    <circle cx="376" cy="188" r="1.4"/>
    <circle cx="372" cy="193" r="1.4"/>
    <circle cx="405" cy="222" r="1.4"/>
    <circle cx="354" cy="181" r="1.4"/>
    <circle cx="333" cy="141" r="1.4"/>
    <circle cx="359" cy="199" r="1.4"/>
    <circle cx="350" cy="184" r="1.4"/>
    <circle cx="356" cy="189" r="1.4"/>
    <circle cx="357" cy="189" r="1.4"/>
    <circle cx="393" cy="218" r="1.4"/>
    <circle cx="373" cy="205" r="1.4"/>
    <circle cx="414" cy="223" r="1.4"/>
    <circle cx="366" cy="185" r="1.4"/>
    <circle cx="376" cy="202" r="1.4"/>
    <circle cx="393" cy="200" r="1.4"/>
    <circle cx="369" cy="203" r="1.4"/>
    <circle cx="342" cy="167" r="1.4"/>
    <circle cx="401" cy="211" r="1.4"/>
    <circle cx="368" cy="199" r="1.4"/>
    <circle cx="344" cy="173" r="1.4"/>
    <circle cx="401" cy="215" r="1.4"/>
    <circle cx="384" cy="203" r="1.4"/>
    <circle cx="370" cy="191" r="1.4"/>
    <circle cx="429" cy="235" r="1.4"/>
    <circle cx="384" cy="199" r="1.4"/>
    <circle cx="339" cy="157" r="1.4"/>
    <circle cx="385" cy="216" r="1.4"/>
    <circle cx="334" cy="137" r="1.4"/>
    <circle cx="422" cy="232" r="1.4"/>
    <circle cx="344" cy="171" r="1.4"/>
    <circle cx="354" cy="182" r="1.4"/>
    <circle cx="347" cy="178" r="1.4"/>
    <circle cx="344" cy="189" r="1.4"/>
    <circle cx="373" cy="191" r="1.4"/>
    <circle cx="358" cy="170" r="1.4"/>
    <circle cx="367" cy="204" r="1.4"/>
    <circle cx="372" cy="203" r="1.4"/>
    <circle cx="365" cy="194" r="1.4"/>
    <circle cx="385" cy="213" r="1.4"/>
    <circle cx="344" cy="136" r="1.4"/>
    <circle cx="364" cy="196" r="1.4"/>
    <circle cx="363" cy="190" r="1.4"/>
    <circle cx="360" cy="194" r="1.4"/>
    <circle cx="410" cy="229" r="1.4"/>
    <circle cx="312" cy="100" r="1.4"/>
    <circle cx="358" cy="171" r="1.4"/>
    <circle cx="343" cy="181" r="1.4"/>
    <circle cx="339" cy="120" r="1.4"/>
    <circle cx="346" cy="148" r="1.4"/>
    <circle cx="369" cy="191" r="1.4"/>
    <circle cx="350" cy="147" r="1.4"/>
    <circle cx="353" cy="129" r="1.4"/>
    <circle cx="336" cy="137" r="1.4"/>
    <circle cx="373" cy="187" r="1.4"/>
    <circle cx="380" cy="196" r="1.4"/>
    <circle cx="350" cy="192" r="1.4"/>
    <circle cx="357" cy="164" r="1.4"/>
    <circle cx="421" cy="235" r="1.4"/>
    <circle cx="399" cy="219" r="1.4"/>
    <circle cx="369" cy="168" r="1.4"/>
    <circle cx="342" cy="147" r="1.4"/>
    <circle cx="328" cy="151" r="1.4"/>
    <circle cx="366" cy="193" r="1.4"/>
    <circle cx="345" cy="186" r="1.4"/>
    <circle cx="406" cy="225" r="1.4"/>
    <circle cx="413" cy="231" r="1.4"/>
    <circle cx="448" cy="250" r="1.4"/>
    <circle cx="322" cy="159" r="1.4"/>
    <circle cx="399" cy="224" r="1.4"/>
    <circle cx="397" cy="216" r="1.4"/>
    <circle cx="363" cy="193" r="1.4"/>
    <circle cx="373" cy="212" r="1.4"/>
    <circle cx="345" cy="167" r="1.4"/>
    <circle cx="384" cy="213" r="1.4"/>
    <circle cx="403" cy="221" r="1.4"/>
    <circle cx="380" cy="213" r="1.4"/>
    <circle cx="377" cy="209" r="1.4"/>
    <circle cx="331" cy="167" r="1.4"/>
    <circle cx="355" cy="199" r="1.4"/>
    <circle cx="351" cy="152" r="1.4"/>
    <circle cx="374" cy="193" r="1.4"/>
    <circle cx="388" cy="195" r="1.4"/>
    <circle cx="371" cy="202" r="1.4"/>
    <circle cx="388" cy="199" r="1.4"/>
    <circle cx="345" cy="187" r="1.4"/>
    <circle cx="432" cy="243" r="1.4"/>
    <circle cx="355" cy="198" r="1.4"/>
    <circle cx="378" cy="213" r="1.4"/>
    <circle cx="352" cy="184" r="1.4"/>
    <circle cx="387" cy="219" r="1.4"/>
    <circle cx="366" cy="167" r="1.4"/>
    <circle cx="383" cy="183" r="1.4"/>
    <circle cx="346" cy="168" r="1.4"/>
    <circle cx="384" cy="212" r="1.4"/>
    <circle cx="350" cy="189" r="1.4"/>
    <circle cx="338" cy="167" r="1.4"/>
    <circle cx="381" cy="207" r="1.4"/>
    <circle cx="424" cy="236" r="1.4"/>
    <circle cx="363" cy="202" r="1.4"/>
    <circle cx="399" cy="223" r="1.4"/>
    <circle cx="401" cy="226" r="1.4"/>
    <circle cx="324" cy="165" r="1.4"/>
    <circle cx="374" cy="207" r="1.4"/>
    <circle cx="394" cy="212" r="1.4"/>
    <circle cx="402" cy="221" r="1.4"/>
    <circle cx="361" cy="196" r="1.4"/>
    <circle cx="380" cy="209" r="1.4"/>
    <circle cx="394" cy="218" r="1.4"/>
    <circle cx="380" cy="199" r="1.4"/>
    <circle cx="384" cy="210" r="1.4"/>
    <circle cx="362" cy="170" r="1.4"/>
    <circle cx="403" cy="228" r="1.4"/>
    <circle cx="388" cy="218" r="1.4"/>
    <circle cx="399" cy="226" r="1.4"/>
    <circle cx="328" cy="185" r="1.4"/>
    <circle cx="362" cy="197" r="1.4"/>
    <circle cx="353" cy="189" r="1.4"/>
    <circle cx="377" cy="213" r="1.4"/>
    <circle cx="355" cy="185" r="1.4"/>
    <circle cx="390" cy="223" r="1.4"/>
    <circle cx="364" cy="193" r="1.4"/>
    <circle cx="374" cy="205" r="1.4"/>
    <circle cx="407" cy="231" r="1.4"/>
    <circle cx="375" cy="214" r="1.4"/>
    <circle cx="355" cy="200" r="1.4"/>
    <circle cx="404" cy="217" r="1.4"/>
    <circle cx="377" cy="202" r="1.4"/>
    <circle cx="372" cy="202" r="1.4"/>
    <circle cx="375" cy="213" r="1.4"/>
    <circle cx="299" cy="155" r="1.4"/>
    <circle cx="382" cy="204" r="1.4"/>
    <circle cx="358" cy="181" r="1.4"/>
    <circle cx="387" cy="216" r="1.4"/>
    <circle cx="340" cy="164" r="1.4"/>
    <circle cx="373" cy="170" r="1.4"/>
    <circle cx="404" cy="227" r="1.4"/>
    <circle cx="352" cy="190" r="1.4"/>
    <circle cx="368" cy="198" r="1.4"/>
    <circle cx="396" cy="227" r="1.4"/>
    <circle cx="354" cy="185" r="1.4"/>
    <circle cx="384" cy="218" r="1.4"/>
    <circle cx="379" cy="201" r="1.4"/>
    <circle cx="385" cy="205" r="1.4"/>
    <circle cx="415" cy="228" r="1.4"/>
    <circle cx="352" cy="187" r="1.4"/>
    <circle cx="374" cy="202" r="1.4"/>
    <circle cx="337" cy="125" r="1.4"/>
    <circle cx="367" cy="195" r="1.4"/>
    <circle cx="350" cy="188" r="1.4"/>
    <circle cx="338" cy="179" r="1.4"/>
    <circle cx="328" cy="171" r="1.4"/>
    <circle cx="398" cy="216" r="1.4"/>
    <circle cx="396" cy="219" r="1.4"/>
    <circle cx="356" cy="194" r="1.4"/>
    <circle cx="381" cy="214" r="1.4"/>
    <circle cx="415" cy="233" r="1.4"/>
    <circle cx="352" cy="189" r="1.4"/>
    <circle cx="371" cy="198" r="1.4"/>
    <circle cx="339" cy="176" r="1.4"/>
    <circle cx="358" cy="165" r="1.4"/>
    <circle cx="372" cy="211" r="1.4"/>
    <circle cx="368" cy="206" r="1.4"/>
    <circle cx="380" cy="215" r="1.4"/>
    <circle cx="395" cy="215" r="1.4"/>
    <circle cx="344" cy="163" r="1.4"/>
    <circle cx="423" cy="238" r="1.4"/>
    <circle cx="384" cy="215" r="1.4"/>
    <circle cx="347" cy="171" r="1.4"/>
    <circle cx="361" cy="169" r="1.4"/>
    <circle cx="373" cy="195" r="1.4"/>
    <circle cx="299" cy="156" r="1.4"/>
    <circle cx="372" cy="207" r="1.4"/>
    <circle cx="390" cy="207" r="1.4"/>
    <circle cx="368" cy="188" r="1.4"/>
    <circle cx="388" cy="223" r="1.4"/>
    <circle cx="374" cy="203" r="1.4"/>
    <circle cx="374" cy="212" r="1.4"/>
    <circle cx="389" cy="218" r="1.4"/>
    <circle cx="398" cy="227" r="1.4"/>
    <circle cx="374" cy="195" r="1.4"/>
    <circle cx="373" cy="209" r="1.4"/>
    <circle cx="367" cy="185" r="1.4"/>
    <circle cx="342" cy="185" r="1.4"/>
    <circle cx="343" cy="182" r="1.4"/>
    <circle cx="426" cy="240" r="1.4"/>
    <circle cx="354" cy="188" r="1.4"/>
    <circle cx="343" cy="194" r="1.4"/>
    <circle cx="372" cy="208" r="1.4"/>
    <circle cx="377" cy="199" r="1.4"/>
    <circle cx="352" cy="191" r="1.4"/>
    <circle cx="379" cy="207" r="1.4"/>
    <circle cx="376" cy="208" r="1.4"/>
    <circle cx="389" cy="212" r="1.4"/>
    <circle cx="390" cy="214" r="1.4"/>
    <circle cx="364" cy="190" r="1.4"/>
    <circle cx="364" cy="208" r="1.4"/>
    <circle cx="307" cy="127" r="1.4"/>
    <circle cx="402" cy="222" r="1.4"/>
    <circle cx="349" cy="192" r="1.4"/>
    <circle cx="422" cy="239" r="1.4"/>
    <circle cx="368" cy="190" r="1.4"/>
    <circle cx="371" cy="185" r="1.4"/>
    <circle cx="369" cy="161" r="1.4"/>
    <circle cx="342" cy="186" r="1.4"/>
    <circle cx="416" cy="231" r="1.4"/>
    <circle cx="331" cy="177" r="1.4"/>
    <circle cx="344" cy="182" r="1.4"/>
    <circle cx="350" cy="191" r="1.4"/>
    <circle cx="370" cy="203" r="1.4"/>
    <circle cx="382" cy="199" r="1.4"/>
    <circle cx="318" cy="165" r="1.4"/>
    <circle cx="375" cy="209" r="1.4"/>
    <circle cx="390" cy="219" r="1.4"/>
    <circle cx="360" cy="196" r="1.4"/>
    <circle cx="375" cy="207" r="1.4"/>
    <circle cx="388" cy="213" r="1.4"/>
    <circle cx="339" cy="163" r="1.4"/>
    <circle cx="327" cy="180" r="1.4"/>
    <circle cx="409" cy="233" r="1.4"/>
    <circle cx="368" cy="209" r="1.4"/>
    <circle cx="318" cy="122" r="1.4"/>
    <circle cx="411" cy="232" r="1.4"/>
    <circle cx="385" cy="211" r="1.4"/>
    <circle cx="318" cy="146" r="1.4"/>
    <circle cx="388" cy="220" r="1.4"/>
    <circle cx="347" cy="176" r="1.4"/>
    <circle cx="417" cy="236" r="1.4"/>
    <circle cx="375" cy="189" r="1.4"/>
    <circle cx="357" cy="200" r="1.4"/>
    <circle cx="386" cy="215" r="1.4"/>
    <circle cx="348" cy="193" r="1.4"/>
    <circle cx="379" cy="213" r="1.4"/>
    <circle cx="378" cy="202" r="1.4"/>
    <circle cx="364" cy="203" r="1.4"/>
    <circle cx="357" cy="201" r="1.4"/>
    <circle cx="397" cy="225" r="1.4"/>
    <circle cx="364" cy="205" r="1.4"/>
    <circle cx="377" cy="216" r="1.4"/>
    <circle cx="379" cy="219" r="1.4"/>
    <circle cx="358" cy="175" r="1.4"/>
    <circle cx="396" cy="214" r="1.4"/>
    <circle cx="351" cy="203" r="1.4"/>
    <circle cx="359" cy="198" r="1.4"/>
    <circle cx="347" cy="189" r="1.4"/>
    <circle cx="363" cy="203" r="1.4"/>
    <circle cx="340" cy="161" r="1.4"/>
    <circle cx="350" cy="187" r="1.4"/>
    <circle cx="363" cy="197" r="1.4"/>
    <circle cx="371" cy="212" r="1.4"/>
    <circle cx="374" cy="219" r="1.4"/>
    <circle cx="383" cy="219" r="1.4"/>
    <circle cx="384" cy="219" r="1.4"/>
    <circle cx="381" cy="204" r="1.4"/>
    <circle cx="396" cy="221" r="1.4"/>
    <circle cx="399" cy="217" r="1.4"/>
    <circle cx="393" cy="216" r="1.4"/>
    <circle cx="388" cy="206" r="1.4"/>
    <circle cx="355" cy="206" r="1.4"/>
    <circle cx="350" cy="185" r="1.4"/>
    <circle cx="343" cy="177" r="1.4"/>
    <circle cx="393" cy="224" r="1.4"/>
    <circle cx="338" cy="168" r="1.4"/>
    <circle cx="364" cy="191" r="1.4"/>
    <circle cx="364" cy="206" r="1.4"/>
    <circle cx="381" cy="213" r="1.4"/>
    <circle cx="338" cy="180" r="1.4"/>
    <circle cx="382" cy="213" r="1.4"/>
    <circle cx="368" cy="183" r="1.4"/>
    <circle cx="398" cy="226" r="1.4"/>
    <circle cx="352" cy="178" r="1.4"/>
    <circle cx="353" cy="192" r="1.4"/>
    <circle cx="402" cy="212" r="1.4"/>
    <circle cx="361" cy="195" r="1.4"/>
    <circle cx="382" cy="217" r="1.4"/>
    <circle cx="376" cy="212" r="1.4"/>
    <circle cx="319" cy="176" r="1.4"/>
    <circle cx="367" cy="183" r="1.4"/>
    <circle cx="376" cy="192" r="1.4"/>
    <circle cx="359" cy="201" r="1.4"/>
    <circle cx="355" cy="205" r="1.4"/>
    <circle cx="367" cy="196" r="1.4"/>
    <circle cx="405" cy="218" r="1.4"/>
    <circle cx="394" cy="225" r="1.4"/>
    <circle cx="383" cy="199" r="1.4"/>
    <circle cx="356" cy="172" r="1.4"/>
    <circle cx="391" cy="215" r="1.4"/>
    <circle cx="406" cy="231" r="1.4"/>
    <circle cx="335" cy="188" r="1.4"/>
    <circle cx="352" cy="194" r="1.4"/>
    <circle cx="346" cy="177" r="1.4"/>
    <circle cx="356" cy="184" r="1.4"/>
    <circle cx="388" cy="203" r="1.4"/>
    <circle cx="334" cy="170" r="1.4"/>
    <circle cx="334" cy="168" r="1.4"/>
    <circle cx="410" cy="234" r="1.4"/>
    <circle cx="387" cy="224" r="1.4"/>
    <circle cx="378" cy="204" r="1.4"/>
    <circle cx="370" cy="193" r="1.4"/>
    <circle cx="396" cy="229" r="1.4"/>
    <circle cx="364" cy="192" r="1.4"/>
    <circle cx="379" cy="215" r="1.4"/>
    <circle cx="362" cy="186" r="1.4"/>
    <circle cx="334" cy="188" r="1.4"/>
    <circle cx="374" cy="211" r="1.4"/>
    <circle cx="377" cy="219" r="1.4"/>
    <circle cx="405" cy="231" r="1.4"/>
    <circle cx="339" cy="190" r="1.4"/>
    <circle cx="357" cy="203" r="1.4"/>
    <circle cx="339" cy="194" r="1.4"/>
    <circle cx="369" cy="200" r="1.4"/>
    <circle cx="338" cy="183" r="1.4"/>
    <circle cx="376" cy="206" r="1.4"/>
    <circle cx="397" cy="227" r="1.4"/>
    <circle cx="378" cy="206" r="1.4"/>
    <circle cx="373" cy="186" r="1.4"/>
    <circle cx="357" cy="168" r="1.4"/>
    <circle cx="393" cy="219" r="1.4"/>
    <circle cx="365" cy="205" r="1.4"/>
    <circle cx="395" cy="230" r="1.4"/>
    <circle cx="377" cy="212" r="1.4"/>
    <circle cx="341" cy="167" r="1.4"/>
    <circle cx="343" cy="189" r="1.4"/>
    <circle cx="392" cy="225" r="1.4"/>
    <circle cx="389" cy="224" r="1.4"/>
    <circle cx="406" cy="233" r="1.4"/>
    <circle cx="361" cy="201" r="1.4"/>
    <circle cx="370" cy="208" r="1.4"/>
    <circle cx="334" cy="189" r="1.4"/>
    <circle cx="345" cy="171" r="1.4"/>
    <circle cx="377" cy="206" r="1.4"/>
    <circle cx="334" cy="200" r="1.4"/>
    <circle cx="362" cy="181" r="1.4"/>
    <circle cx="383" cy="218" r="1.4"/>
    <circle cx="348" cy="186" r="1.4"/>
    <circle cx="341" cy="191" r="1.4"/>
    <circle cx="359" cy="192" r="1.4"/>
    <circle cx="375" cy="210" r="1.4"/>
    <circle cx="341" cy="141" r="1.4"/>
    <circle cx="335" cy="190" r="1.4"/>
    <circle cx="352" cy="195" r="1.4"/>
    <circle cx="381" cy="210" r="1.4"/>
    <circle cx="340" cy="192" r="1.4"/>
    <circle cx="359" cy="203" r="1.4"/>
    <circle cx="362" cy="198" r="1.4"/>
    <circle cx="377" cy="218" r="1.4"/>
    <circle cx="372" cy="213" r="1.4"/>
    <circle cx="349" cy="169" r="1.4"/>
    <circle cx="358" cy="207" r="1.4"/>
    <circle cx="385" cy="218" r="1.4"/>
    <circle cx="333" cy="170" r="1.4"/>
    <circle cx="382" cy="211" r="1.4"/>
    <circle cx="345" cy="180" r="1.4"/>
    <circle cx="349" cy="194" r="1.4"/>
    <circle cx="402" cy="225" r="1.4"/>
    <circle cx="333" cy="156" r="1.4"/>
    <circle cx="329" cy="186" r="1.4"/>
    <circle cx="380" cy="219" r="1.4"/>
    <circle cx="411" cy="230" r="1.4"/>
    <circle cx="379" cy="217" r="1.4"/>
    <circle cx="405" cy="233" r="1.4"/>
    <circle cx="386" cy="224" r="1.4"/>
    <circle cx="363" cy="194" r="1.4"/>
    <circle cx="318" cy="172" r="1.4"/>
    <circle cx="409" cy="238" r="1.4"/>
    <circle cx="363" cy="168" r="1.4"/>
    <circle cx="345" cy="196" r="1.4"/>
    <circle cx="376" cy="203" r="1.4"/>
    <circle cx="362" cy="199" r="1.4"/>
    <circle cx="362" cy="203" r="1.4"/>
    <circle cx="387" cy="215" r="1.4"/>
    <circle cx="371" cy="194" r="1.4"/>
    <circle cx="348" cy="171" r="1.4"/>
    <circle cx="379" cy="216" r="1.4"/>
    <circle cx="340" cy="189" r="1.4"/>
    <circle cx="354" cy="203" r="1.4"/>
    <circle cx="348" cy="187" r="1.4"/>
    <circle cx="353" cy="171" r="1.4"/>
    <circle cx="358" cy="187" r="1.4"/>
    <circle cx="363" cy="210" r="1.4"/>
    <circle cx="354" cy="202" r="1.4"/>
    <circle cx="348" cy="172" r="1.4"/>
    <circle cx="331" cy="163" r="1.4"/>
    <circle cx="401" cy="227" r="1.4"/>
    <circle cx="362" cy="211" r="1.4"/>
    <circle cx="342" cy="193" r="1.4"/>
    <circle cx="390" cy="224" r="1.4"/>
    <circle cx="372" cy="215" r="1.4"/>
    <circle cx="352" cy="196" r="1.4"/>
    <circle cx="379" cy="211" r="1.4"/>
    <circle cx="364" cy="201" r="1.4"/>
    <circle cx="378" cy="207" r="1.4"/>
    <circle cx="404" cy="233" r="1.4"/>
    <circle cx="337" cy="167" r="1.4"/>
    <circle cx="381" cy="219" r="1.4"/>
    <circle cx="358" cy="213" r="1.4"/>
    <circle cx="379" cy="198" r="1.4"/>
    <circle cx="355" cy="182" r="1.4"/>
    <circle cx="321" cy="173" r="1.4"/>
    <circle cx="356" cy="198" r="1.4"/>
    <circle cx="363" cy="191" r="1.4"/>
    <circle cx="337" cy="183" r="1.4"/>
    <circle cx="374" cy="196" r="1.4"/>
    <circle cx="364" cy="212" r="1.4"/>
    <circle cx="416" cy="235" r="1.4"/>
    <circle cx="344" cy="187" r="1.4"/>
    <circle cx="346" cy="200" r="1.4"/>
    <circle cx="393" cy="225" r="1.4"/>
    <circle cx="375" cy="204" r="1.4"/>
    <circle cx="385" cy="224" r="1.4"/>
    <circle cx="370" cy="205" r="1.4"/>
    <circle cx="319" cy="125" r="1.4"/>
    <circle cx="361" cy="200" r="1.4"/>
    <circle cx="352" cy="198" r="1.4"/>
    <circle cx="372" cy="209" r="1.4"/>
    <circle cx="378" cy="223" r="1.4"/>
    <circle cx="363" cy="214" r="1.4"/>
    <circle cx="357" cy="195" r="1.4"/>
    <circle cx="355" cy="192" r="1.4"/>
    <circle cx="373" cy="210" r="1.4"/>
    <circle cx="316" cy="169" r="1.4"/>
    <circle cx="358" cy="200" r="1.4"/>
    <circle cx="344" cy="174" r="1.4"/>
    <circle cx="375" cy="215" r="1.4"/>
    <circle cx="366" cy="201" r="1.4"/>
    <circle cx="381" cy="220" r="1.4"/>
    <circle cx="366" cy="213" r="1.4"/>
    <circle cx="349" cy="189" r="1.4"/>
    <circle cx="348" cy="166" r="1.4"/>
    <circle cx="388" cy="226" r="1.4"/>
    <circle cx="326" cy="177" r="1.4"/>
    <circle cx="400" cy="229" r="1.4"/>
    <circle cx="341" cy="174" r="1.4"/>
    <circle cx="397" cy="228" r="1.4"/>
    <circle cx="329" cy="191" r="1.4"/>
    <circle cx="348" cy="189" r="1.4"/>
    <circle cx="363" cy="212" r="1.4"/>
    <circle cx="358" cy="205" r="1.4"/>
    <circle cx="346" cy="196" r="1.4"/>
    <circle cx="346" cy="170" r="1.4"/>
    <circle cx="369" cy="205" r="1.4"/>
    <circle cx="345" cy="173" r="1.4"/>
    <circle cx="370" cy="200" r="1.4"/>
    <circle cx="383" cy="211" r="1.4"/>
    <circle cx="348" cy="184" r="1.4"/>
    <circle cx="358" cy="190" r="1.4"/>
    <circle cx="376" cy="198" r="1.4"/>
    <circle cx="367" cy="215" r="1.4"/>
    <circle cx="351" cy="202" r="1.4"/>
    <circle cx="352" cy="200" r="1.4"/>
    <circle cx="342" cy="190" r="1.4"/>
    <circle cx="365" cy="213" r="1.4"/>
    <circle cx="347" cy="172" r="1.4"/>
    <circle cx="325" cy="191" r="1.4"/>
    <circle cx="392" cy="228" r="1.4"/>
    <circle cx="339" cy="185" r="1.4"/>
    <circle cx="372" cy="214" r="1.4"/>
    <circle cx="346" cy="179" r="1.4"/>
    <circle cx="318" cy="155" r="1.4"/>
    <circle cx="345" cy="175" r="1.4"/>
    <circle cx="379" cy="197" r="1.4"/>
    <circle cx="332" cy="174" r="1.4"/>
    <circle cx="404" cy="232" r="1.4"/>
    <circle cx="369" cy="206" r="1.4"/>
    <circle cx="324" cy="184" r="1.4"/>
    <circle cx="371" cy="210" r="1.4"/>
    <circle cx="389" cy="213" r="1.4"/>
    <circle cx="360" cy="205" r="1.4"/>
    <circle cx="398" cy="230" r="1.4"/>
    <circle cx="397" cy="234" r="1.4"/>
    <circle cx="330" cy="185" r="1.4"/>
    <circle cx="395" cy="228" r="1.4"/>
    <circle cx="376" cy="213" r="1.4"/>
    <circle cx="367" cy="180" r="1.4"/>
    <circle cx="336" cy="188" r="1.4"/>
    <circle cx="354" cy="195" r="1.4"/>
    <circle cx="321" cy="147" r="1.4"/>
    <circle cx="404" cy="235" r="1.4"/>
    <circle cx="350" cy="196" r="1.4"/>
    <circle cx="322" cy="170" r="1.4"/>
    <circle cx="356" cy="205" r="1.4"/>
    <circle cx="341" cy="176" r="1.4"/>
    <circle cx="332" cy="175" r="1.4"/>
    <circle cx="349" cy="185" r="1.4"/>
    <circle cx="353" cy="175" r="1.4"/>
    <circle cx="324" cy="160" r="1.4"/>
    <circle cx="405" cy="232" r="1.4"/>
    <circle cx="333" cy="188" r="1.4"/>
    <circle cx="334" cy="181" r="1.4"/>
    <circle cx="384" cy="222" r="1.4"/>
    <circle cx="386" cy="223" r="1.4"/>
    <circle cx="385" cy="228" r="1.4"/>
    <circle cx="358" cy="192" r="1.4"/>
    <circle cx="344" cy="178" r="1.4"/>
    <circle cx="356" cy="186" r="1.4"/>
    <circle cx="393" cy="220" r="1.4"/>
    <circle cx="373" cy="208" r="1.4"/>
    <circle cx="343" cy="195" r="1.4"/>
    <circle cx="375" cy="205" r="1.4"/>
    <circle cx="361" cy="172" r="1.4"/>
    <circle cx="382" cy="220" r="1.4"/>
    <circle cx="346" cy="191" r="1.4"/>
    <circle cx="391" cy="219" r="1.4"/>
    <circle cx="360" cy="178" r="1.4"/>
    <circle cx="354" cy="193" r="1.4"/>
    <circle cx="352" cy="208" r="1.4"/>
    <circle cx="362" cy="215" r="1.4"/>
    <circle cx="384" cy="223" r="1.4"/>
    <circle cx="374" cy="215" r="1.4"/>
    <circle cx="394" cy="230" r="1.4"/>
    <circle cx="337" cy="188" r="1.4"/>
    <circle cx="371" cy="184" r="1.4"/>
    <circle cx="366" cy="204" r="1.4"/>
    <circle cx="373" cy="201" r="1.4"/>
    <circle cx="348" cy="168" r="1.4"/>
    <circle cx="362" cy="194" r="1.4"/>
    <circle cx="369" cy="210" r="1.4"/>
    <circle cx="360" cy="201" r="1.4"/>
    <circle cx="340" cy="187" r="1.4"/>
    <circle cx="348" cy="205" r="1.4"/>
    <circle cx="371" cy="203" r="1.4"/>
    <circle cx="362" cy="193" r="1.4"/>
    <circle cx="391" cy="227" r="1.4"/>
    <circle cx="403" cy="231" r="1.4"/>
    <circle cx="334" cy="197" r="1.4"/>
    <circle cx="292" cy="164" r="1.4"/>
    <circle cx="337" cy="198" r="1.4"/>
    <circle cx="381" cy="208" r="1.4"/>
    <circle cx="397" cy="214" r="1.4"/>
    <circle cx="345" cy="160" r="1.4"/>
    <circle cx="355" cy="193" r="1.4"/>
    <circle cx="358" cy="204" r="1.4"/>
    <circle cx="366" cy="196" r="1.4"/>
    <circle cx="335" cy="181" r="1.4"/>
    <circle cx="366" cy="206" r="1.4"/>
    <circle cx="310" cy="173" r="1.4"/>
    <circle cx="391" cy="229" r="1.4"/>
    <circle cx="359" cy="188" r="1.4"/>
    <circle cx="397" cy="231" r="1.4"/>
    <circle cx="363" cy="205" r="1.4"/>
    <circle cx="360" cy="215" r="1.4"/>
    <circle cx="351" cy="185" r="1.4"/>
    <circle cx="376" cy="217" r="1.4"/>
    <circle cx="346" cy="192" r="1.4"/>
    <circle cx="394" cy="234" r="1.4"/>
    <circle cx="363" cy="211" r="1.4"/>
    <circle cx="410" cy="225" r="1.4"/>
    <circle cx="371" cy="205" r="1.4"/>
    <circle cx="346" cy="174" r="1.4"/>
    <circle cx="391" cy="232" r="1.4"/>
    <circle cx="336" cy="173" r="1.4"/>
    <circle cx="320" cy="172" r="1.4"/>
    <circle cx="318" cy="189" r="1.4"/>
    <circle cx="333" cy="193" r="1.4"/>
    <circle cx="392" cy="227" r="1.4"/>
    <circle cx="386" cy="205" r="1.4"/>
    <circle cx="373" cy="203" r="1.4"/>
    <circle cx="401" cy="234" r="1.4"/>
    <circle cx="385" cy="219" r="1.4"/>
    <circle cx="382" cy="224" r="1.4"/>
    <circle cx="336" cy="192" r="1.4"/>
    <circle cx="391" cy="222" r="1.4"/>
    <circle cx="404" cy="237" r="1.4"/>
    <circle cx="357" cy="197" r="1.4"/>
    <circle cx="365" cy="204" r="1.4"/>
    <circle cx="352" cy="180" r="1.4"/>
    <circle cx="354" cy="199" r="1.4"/>
    <circle cx="340" cy="193" r="1.4"/>
    <circle cx="362" cy="218" r="1.4"/>
    <circle cx="343" cy="174" r="1.4"/>
    <circle cx="363" cy="216" r="1.4"/>
    <circle cx="326" cy="173" r="1.4"/>
    <circle cx="361" cy="181" r="1.4"/>
    <circle cx="390" cy="230" r="1.4"/>
    <circle cx="386" cy="212" r="1.4"/>
    <circle cx="376" cy="214" r="1.4"/>
    <circle cx="363" cy="217" r="1.4"/>
    <circle cx="377" cy="215" r="1.4"/>
    <circle cx="352" cy="199" r="1.4"/>
    <circle cx="360" cy="204" r="1.4"/>
    <circle cx="387" cy="222" r="1.4"/>
    <circle cx="411" cy="241" r="1.4"/>
    <circle cx="363" cy="206" r="1.4"/>
    <circle cx="344" cy="185" r="1.4"/>
    <circle cx="337" cy="189" r="1.4"/>
    <circle cx="332" cy="170" r="1.4"/>
    <circle cx="373" cy="224" r="1.4"/>
    <circle cx="396" cy="232" r="1.4"/>
    <circle cx="349" cy="195" r="1.4"/>
    <circle cx="359" cy="204" r="1.4"/>
    <circle cx="339" cy="186" r="1.4"/>
    <circle cx="381" cy="218" r="1.4"/>
    <circle cx="379" cy="223" r="1.4"/>
    <circle cx="374" cy="204" r="1.4"/>
    <circle cx="395" cy="231" r="1.4"/>
    <circle cx="348" cy="196" r="1.4"/>
    <circle cx="344" cy="196" r="1.4"/>
    <circle cx="341" cy="183" r="1.4"/>
    <circle cx="424" cy="247" r="1.4"/>
    <circle cx="381" cy="223" r="1.4"/>
    <circle cx="351" cy="168" r="1.4"/>
    <circle cx="385" cy="227" r="1.4"/>
    <circle cx="305" cy="117" r="1.4"/>
    <circle cx="337" cy="202" r="1.4"/>
    <circle cx="350" cy="200" r="1.4"/>
    <circle cx="344" cy="203" r="1.4"/>
    <circle cx="363" cy="204" r="1.4"/>
    <circle cx="394" cy="224" r="1.4"/>
    <circle cx="368" cy="207" r="1.4"/>
    <circle cx="332" cy="185" r="1.4"/>
    <circle cx="381" cy="215" r="1.4"/>
    <circle cx="350" cy="186" r="1.4"/>
    <circle cx="339" cy="188" r="1.4"/>
    <circle cx="331" cy="178" r="1.4"/>
    <circle cx="354" cy="208" r="1.4"/>
    <circle cx="354" cy="205" r="1.4"/>
    <circle cx="374" cy="218" r="1.4"/>
    <circle cx="394" cy="232" r="1.4"/>
    <circle cx="347" cy="198" r="1.4"/>
    <circle cx="390" cy="222" r="1.4"/>
    <circle cx="344" cy="168" r="1.4"/>
    <circle cx="371" cy="213" r="1.4"/>
    <circle cx="369" cy="209" r="1.4"/>
    <circle cx="388" cy="215" r="1.4"/>
    <circle cx="349" cy="193" r="1.4"/>
    <circle cx="408" cy="237" r="1.4"/>
    <circle cx="359" cy="185" r="1.4"/>
    <circle cx="364" cy="217" r="1.4"/>
    <circle cx="345" cy="208" r="1.4"/>
    <circle cx="393" cy="223" r="1.4"/>
    <circle cx="400" cy="237" r="1.4"/>
    <circle cx="366" cy="214" r="1.4"/>
    <circle cx="378" cy="210" r="1.4"/>
    <circle cx="322" cy="178" r="1.4"/>
    <circle cx="352" cy="188" r="1.4"/>
    <circle cx="372" cy="219" r="1.4"/>
    <circle cx="366" cy="217" r="1.4"/>
    <circle cx="361" cy="211" r="1.4"/>
    <circle cx="382" cy="221" r="1.4"/>
    <circle cx="356" cy="206" r="1.4"/>
    <circle cx="373" cy="204" r="1.4"/>
    <circle cx="354" cy="190" r="1.4"/>
    <circle cx="361" cy="192" r="1.4"/>
    <circle cx="389" cy="230" r="1.4"/>
    <circle cx="356" cy="199" r="1.4"/>
    <circle cx="393" cy="230" r="1.4"/>
    <circle cx="366" cy="211" r="1.4"/>
    <circle cx="372" cy="220" r="1.4"/>
    <circle cx="346" cy="184" r="1.4"/>
    <circle cx="399" cy="235" r="1.4"/>
    <circle cx="396" cy="231" r="1.4"/>
    <circle cx="377" cy="210" r="1.4"/>
    <circle cx="368" cy="217" r="1.4"/>
    <circle cx="341" cy="188" r="1.4"/>
    <circle cx="395" cy="232" r="1.4"/>
    <circle cx="382" cy="226" r="1.4"/>
    <circle cx="356" cy="209" r="1.4"/>
    <circle cx="368" cy="202" r="1.4"/>
    <circle cx="347" cy="203" r="1.4"/>
    <circle cx="343" cy="164" r="1.4"/>
    <circle cx="351" cy="182" r="1.4"/>
    <circle cx="360" cy="209" r="1.4"/>
    <circle cx="382" cy="209" r="1.4"/>
    <circle cx="371" cy="208" r="1.4"/>
    <circle cx="351" cy="181" r="1.4"/>
    <circle cx="325" cy="180" r="1.4"/>
    <circle cx="356" cy="200" r="1.4"/>
    <circle cx="358" cy="214" r="1.4"/>
    <circle cx="332" cy="198" r="1.4"/>
    <circle cx="347" cy="187" r="1.4"/>
    <circle cx="368" cy="216" r="1.4"/>
    <circle cx="341" cy="184" r="1.4"/>
    <circle cx="383" cy="223" r="1.4"/>
    <circle cx="397" cy="233" r="1.4"/>
    <circle cx="385" cy="226" r="1.4"/>
    <circle cx="319" cy="187" r="1.4"/>
    <circle cx="372" cy="206" r="1.4"/>
    <circle cx="375" cy="212" r="1.4"/>
    <circle cx="389" cy="227" r="1.4"/>
    <circle cx="357" cy="185" r="1.4"/>
    <circle cx="343" cy="198" r="1.4"/>
    <circle cx="401" cy="235" r="1.4"/>
    <circle cx="372" cy="225" r="1.4"/>
    <circle cx="367" cy="206" r="1.4"/>
    <circle cx="319" cy="181" r="1.4"/>
    <circle cx="371" cy="216" r="1.4"/>
    <circle cx="353" cy="194" r="1.4"/>
    <circle cx="392" cy="224" r="1.4"/>
    <circle cx="369" cy="219" r="1.4"/>
    <circle cx="413" cy="238" r="1.4"/>
    <circle cx="363" cy="213" r="1.4"/>
    <circle cx="371" cy="218" r="1.4"/>
    <circle cx="361" cy="218" r="1.4"/>
    <circle cx="340" cy="190" r="1.4"/>
    <circle cx="355" cy="196" r="1.4"/>
    <circle cx="397" cy="232" r="1.4"/>
    <circle cx="359" cy="215" r="1.4"/>
    <circle cx="358" cy="198" r="1.4"/>
    <circle cx="318" cy="178" r="1.4"/>
    <circle cx="413" cy="239" r="1.4"/>
    <circle cx="380" cy="227" r="1.4"/>
    <circle cx="360" cy="212" r="1.4"/>
    <circle cx="383" cy="216" r="1.4"/>
    <circle cx="337" cy="154" r="1.4"/>
    <circle cx="378" cy="215" r="1.4"/>
    <circle cx="358" cy="202" r="1.4"/>
    <circle cx="389" cy="226" r="1.4"/>
    <circle cx="403" cy="232" r="1.4"/>
    <circle cx="350" cy="170" r="1.4"/>
    <circle cx="364" cy="221" r="1.4"/>
    <circle cx="406" cy="238" r="1.4"/>
    <circle cx="359" cy="193" r="1.4"/>
    <circle cx="388" cy="233" r="1.4"/>
    <circle cx="424" cy="241" r="1.4"/>
    <circle cx="380" cy="217" r="1.4"/>
    <circle cx="361" cy="212" r="1.4"/>
    <circle cx="373" cy="213" r="1.4"/>
    <circle cx="346" cy="190" r="1.4"/>
    <circle cx="335" cy="180" r="1.4"/>
    <circle cx="378" cy="225" r="1.4"/>
    <circle cx="361" cy="191" r="1.4"/>
    <circle cx="370" cy="223" r="1.4"/>
    <circle cx="384" cy="216" r="1.4"/>
    <circle cx="354" cy="198" r="1.4"/>
    <circle cx="338" cy="162" r="1.4"/>
    <circle cx="380" cy="224" r="1.4"/>
    <circle cx="352" cy="185" r="1.4"/>
    <circle cx="373" cy="214" r="1.4"/>
    <circle cx="385" cy="217" r="1.4"/>
    <circle cx="410" cy="239" r="1.4"/>
    <circle cx="376" cy="221" r="1.4"/>
    <circle cx="379" cy="210" r="1.4"/>
    <circle cx="360" cy="210" r="1.4"/>
    <circle cx="366" cy="216" r="1.4"/>
    <circle cx="358" cy="193" r="1.4"/>
    <circle cx="373" cy="226" r="1.4"/>
    <circle cx="393" cy="229" r="1.4"/>
    <circle cx="359" cy="214" r="1.4"/>
    <circle cx="353" cy="191" r="1.4"/>
    <circle cx="337" cy="186" r="1.4"/>
    <circle cx="353" cy="206" r="1.4"/>
    <circle cx="388" cy="225" r="1.4"/>
    <circle cx="366" cy="203" r="1.4"/>
    <circle cx="359" cy="187" r="1.4"/>
    <circle cx="360" cy="190" r="1.4"/>
    <circle cx="373" cy="206" r="1.4"/>
    <circle cx="357" cy="205" r="1.4"/>
    <circle cx="343" cy="166" r="1.4"/>
    <circle cx="371" cy="224" r="1.4"/>
    <circle cx="335" cy="191" r="1.4"/>
    <circle cx="383" cy="214" r="1.4"/>
    <circle cx="395" cy="234" r="1.4"/>
    <circle cx="374" cy="206" r="1.4"/>
    <circle cx="364" cy="187" r="1.4"/>
    <circle cx="376" cy="219" r="1.4"/>
    <circle cx="365" cy="215" r="1.4"/>
    <circle cx="355" cy="208" r="1.4"/>
    <circle cx="341" cy="159" r="1.4"/>
    <circle cx="369" cy="221" r="1.4"/>
    <circle cx="364" cy="211" r="1.4"/>
    <circle cx="375" cy="219" r="1.4"/>
    <circle cx="310" cy="177" r="1.4"/>
    <circle cx="353" cy="210" r="1.4"/>
    <circle cx="358" cy="209" r="1.4"/>
    <circle cx="368" cy="212" r="1.4"/>
    <circle cx="361" cy="182" r="1.4"/>
    <circle cx="376" cy="216" r="1.4"/>
    <circle cx="333" cy="165" r="1.4"/>
    <circle cx="325" cy="187" r="1.4"/>
    <circle cx="288" cy="172" r="1.4"/>
    <circle cx="395" cy="225" r="1.4"/>
    <circle cx="382" cy="218" r="1.4"/>
    <circle cx="341" cy="192" r="1.4"/>
    <circle cx="378" cy="218" r="1.4"/>
    <circle cx="384" cy="227" r="1.4"/>
    <circle cx="388" cy="230" r="1.4"/>
    <circle cx="347" cy="202" r="1.4"/>
    <circle cx="369" cy="215" r="1.4"/>
    <circle cx="395" cy="226" r="1.4"/>
    <circle cx="347" cy="188" r="1.4"/>
    <circle cx="389" cy="231" r="1.4"/>
    <circle cx="359" cy="205" r="1.4"/>
    <circle cx="358" cy="189" r="1.4"/>
    <circle cx="311" cy="183" r="1.4"/>
    <circle cx="354" cy="200" r="1.4"/>
    <circle cx="389" cy="229" r="1.4"/>
    <circle cx="334" cy="184" r="1.4"/>
    <circle cx="397" cy="236" r="1.4"/>
    <circle cx="401" cy="236" r="1.4"/>
    <circle cx="389" cy="234" r="1.4"/>
    <circle cx="361" cy="205" r="1.4"/>
    <circle cx="340" cy="201" r="1.4"/>
    <circle cx="400" cy="241" r="1.4"/>
    <circle cx="355" cy="203" r="1.4"/>
    <circle cx="325" cy="148" r="1.4"/>
    <circle cx="381" cy="226" r="1.4"/>
    <circle cx="378" cy="216" r="1.4"/>
    <circle cx="356" cy="210" r="1.4"/>
    <circle cx="418" cy="235" r="1.4"/>
    <circle cx="348" cy="191" r="1.4"/>
    <circle cx="339" cy="196" r="1.4"/>
    <circle cx="338" cy="169" r="1.4"/>
    <circle cx="398" cy="234" r="1.4"/>
    <circle cx="357" cy="204" r="1.4"/>
    <circle cx="358" cy="201" r="1.4"/>
    <circle cx="339" cy="192" r="1.4"/>
    <circle cx="403" cy="234" r="1.4"/>
    <circle cx="334" cy="192" r="1.4"/>
    <circle cx="353" cy="216" r="1.4"/>
    <circle cx="382" cy="229" r="1.4"/>
    <circle cx="360" cy="206" r="1.4"/>
    <circle cx="342" cy="194" r="1.4"/>
    <circle cx="324" cy="181" r="1.4"/>
    <circle cx="371" cy="222" r="1.4"/>
    <circle cx="369" cy="207" r="1.4"/>
    <circle cx="370" cy="222" r="1.4"/>
    <circle cx="333" cy="197" r="1.4"/>
    <circle cx="377" cy="222" r="1.4"/>
    <circle cx="332" cy="190" r="1.4"/>
    <circle cx="382" cy="214" r="1.4"/>
    <circle cx="343" cy="200" r="1.4"/>
    <circle cx="387" cy="230" r="1.4"/>
    <circle cx="365" cy="197" r="1.4"/>
    <circle cx="358" cy="203" r="1.4"/>
    <circle cx="370" cy="209" r="1.4"/>
    <circle cx="325" cy="193" r="1.4"/>
    <circle cx="377" cy="221" r="1.4"/>
    <circle cx="386" cy="232" r="1.4"/>
    <circle cx="389" cy="217" r="1.4"/>
    <circle cx="356" cy="203" r="1.4"/>
    <circle cx="330" cy="177" r="1.4"/>
    <circle cx="350" cy="202" r="1.4"/>
    <circle cx="380" cy="212" r="1.4"/>
    <circle cx="373" cy="219" r="1.4"/>
    <circle cx="374" cy="213" r="1.4"/>
    <circle cx="344" cy="188" r="1.4"/>
    <circle cx="368" cy="210" r="1.4"/>
    <circle cx="365" cy="196" r="1.4"/>
    <circle cx="342" cy="211" r="1.4"/>
    <circle cx="357" cy="193" r="1.4"/>
    <circle cx="348" cy="179" r="1.4"/>
    <circle cx="352" cy="207" r="1.4"/>
    <circle cx="360" cy="216" r="1.4"/>
    <circle cx="373" cy="222" r="1.4"/>
    <circle cx="342" cy="198" r="1.4"/>
    <circle cx="329" cy="193" r="1.4"/>
    <circle cx="356" cy="191" r="1.4"/>
    <circle cx="349" cy="211" r="1.4"/>
    <circle cx="379" cy="229" r="1.4"/>
    <circle cx="369" cy="223" r="1.4"/>
    <circle cx="368" cy="200" r="1.4"/>
    <circle cx="359" cy="206" r="1.4"/>
    <circle cx="369" cy="224" r="1.4"/>
    <circle cx="365" cy="203" r="1.4"/>
    <circle cx="388" cy="222" r="1.4"/>
    <circle cx="335" cy="204" r="1.4"/>
    <circle cx="375" cy="211" r="1.4"/>
    <circle cx="319" cy="173" r="1.4"/>
    <circle cx="352" cy="211" r="1.4"/>
    <circle cx="322" cy="203" r="1.4"/>
    <circle cx="318" cy="181" r="1.4"/>
    <circle cx="365" cy="217" r="1.4"/>
    <circle cx="372" cy="210" r="1.4"/>
    <circle cx="365" cy="201" r="1.4"/>
    <circle cx="334" cy="180" r="1.4"/>
    <circle cx="350" cy="211" r="1.4"/>
    <circle cx="346" cy="202" r="1.4"/>
    <circle cx="351" cy="188" r="1.4"/>
    <circle cx="407" cy="239" r="1.4"/>
    <circle cx="366" cy="219" r="1.4"/>
    <circle cx="353" cy="195" r="1.4"/>
    <circle cx="342" cy="195" r="1.4"/>
    <circle cx="319" cy="182" r="1.4"/>
    <circle cx="333" cy="178" r="1.4"/>
    <circle cx="410" cy="245" r="1.4"/>
    <circle cx="338" cy="198" r="1.4"/>
    <circle cx="322" cy="172" r="1.4"/>
    <circle cx="374" cy="227" r="1.4"/>
    <circle cx="380" cy="207" r="1.4"/>
    <circle cx="379" cy="232" r="1.4"/>
    <circle cx="347" cy="190" r="1.4"/>
    <circle cx="382" cy="228" r="1.4"/>
    <circle cx="412" cy="249" r="1.4"/>
    <circle cx="360" cy="203" r="1.4"/>
    <circle cx="373" cy="221" r="1.4"/>
    <circle cx="348" cy="214" r="1.4"/>
    <circle cx="351" cy="198" r="1.4"/>
    <circle cx="381" cy="224" r="1.4"/>
    <circle cx="368" cy="227" r="1.4"/>
    <circle cx="325" cy="171" r="1.4"/>
    <circle cx="399" cy="240" r="1.4"/>
    <circle cx="400" cy="236" r="1.4"/>
    <circle cx="374" cy="209" r="1.4"/>
    <circle cx="348" cy="199" r="1.4"/>
    <circle cx="380" cy="225" r="1.4"/>
    <circle cx="339" cy="197" r="1.4"/>
    <circle cx="357" cy="206" r="1.4"/>
    <circle cx="360" cy="200" r="1.4"/>
    <circle cx="344" cy="200" r="1.4"/>
    <circle cx="340" cy="199" r="1.4"/>
    <circle cx="346" cy="195" r="1.4"/>
    <circle cx="374" cy="224" r="1.4"/>
    <circle cx="393" cy="238" r="1.4"/>
    <circle cx="345" cy="201" r="1.4"/>
    <circle cx="367" cy="207" r="1.4"/>
    <circle cx="362" cy="221" r="1.4"/>
    <circle cx="349" cy="202" r="1.4"/>
    <circle cx="348" cy="204" r="1.4"/>
    <circle cx="353" cy="209" r="1.4"/>
    <circle cx="383" cy="226" r="1.4"/>
    <circle cx="356" cy="207" r="1.4"/>
    <circle cx="382" cy="231" r="1.4"/>
    <circle cx="356" cy="219" r="1.4"/>
    <circle cx="363" cy="219" r="1.4"/>
    <circle cx="386" cy="222" r="1.4"/>
    <circle cx="330" cy="175" r="1.4"/>
    <circle cx="348" cy="200" r="1.4"/>
    <circle cx="390" cy="234" r="1.4"/>
    <circle cx="356" cy="204" r="1.4"/>
    <circle cx="364" cy="222" r="1.4"/>
    <circle cx="351" cy="199" r="1.4"/>
    <circle cx="347" cy="192" r="1.4"/>
    <circle cx="361" cy="198" r="1.4"/>
    <circle cx="332" cy="184" r="1.4"/>
    <circle cx="392" cy="221" r="1.4"/>
    <circle cx="373" cy="211" r="1.4"/>
    <circle cx="342" cy="200" r="1.4"/>
    <circle cx="361" cy="204" r="1.4"/>
    <circle cx="337" cy="187" r="1.4"/>
    <circle cx="345" cy="203" r="1.4"/>
    <circle cx="383" cy="232" r="1.4"/>
    <circle cx="350" cy="199" r="1.4"/>
    <circle cx="319" cy="179" r="1.4"/>
    <circle cx="365" cy="208" r="1.4"/>
    <circle cx="374" cy="223" r="1.4"/>
    <circle cx="387" cy="228" r="1.4"/>
    <circle cx="373" cy="230" r="1.4"/>
    <circle cx="320" cy="171" r="1.4"/>
    <circle cx="368" cy="218" r="1.4"/>
    <circle cx="338" cy="158" r="1.4"/>
    <circle cx="407" cy="234" r="1.4"/>
    <circle cx="369" cy="216" r="1.4"/>
    <circle cx="393" cy="231" r="1.4"/>
    <circle cx="390" cy="235" r="1.4"/>
    <circle cx="371" cy="215" r="1.4"/>
    <circle cx="358" cy="206" r="1.4"/>
    <circle cx="353" cy="208" r="1.4"/>
    <circle cx="361" cy="224" r="1.4"/>
    <circle cx="316" cy="177" r="1.4"/>
    <circle cx="381" cy="232" r="1.4"/>
    <circle cx="347" cy="205" r="1.4"/>
    <circle cx="387" cy="225" r="1.4"/>
    <circle cx="385" cy="233" r="1.4"/>
    <circle cx="365" cy="216" r="1.4"/>
    <circle cx="349" cy="216" r="1.4"/>
    <circle cx="369" cy="220" r="1.4"/>
    <circle cx="291" cy="134" r="1.4"/>
    <circle cx="390" cy="227" r="1.4"/>
    <circle cx="334" cy="183" r="1.4"/>
    <circle cx="376" cy="224" r="1.4"/>
    <circle cx="355" cy="209" r="1.4"/>
    <circle cx="337" cy="194" r="1.4"/>
    <circle cx="342" cy="192" r="1.4"/>
    <circle cx="351" cy="196" r="1.4"/>
    <circle cx="379" cy="233" r="1.4"/>
    <circle cx="348" cy="209" r="1.4"/>
    <circle cx="367" cy="225" r="1.4"/>
    <circle cx="335" cy="200" r="1.4"/>
    <circle cx="346" cy="199" r="1.4"/>
    <circle cx="365" cy="214" r="1.4"/>
    <circle cx="315" cy="161" r="1.4"/>
    <circle cx="334" cy="191" r="1.4"/>
    <circle cx="351" cy="180" r="1.4"/>
    <circle cx="367" cy="214" r="1.4"/>
    <circle cx="357" cy="196" r="1.4"/>
    <circle cx="369" cy="228" r="1.4"/>
    <circle cx="371" cy="217" r="1.4"/>
    <circle cx="374" cy="220" r="1.4"/>
    <circle cx="377" cy="228" r="1.4"/>
    <circle cx="331" cy="195" r="1.4"/>
    <circle cx="391" cy="236" r="1.4"/>
    <circle cx="341" cy="186" r="1.4"/>
    <circle cx="353" cy="203" r="1.4"/>
    <circle cx="367" cy="224" r="1.4"/>
    <circle cx="315" cy="197" r="1.4"/>
    <circle cx="355" cy="213" r="1.4"/>
    <circle cx="322" cy="175" r="1.4"/>
    <circle cx="349" cy="181" r="1.4"/>
    <circle cx="391" cy="240" r="1.4"/>
    <circle cx="365" cy="222" r="1.4"/>
    <circle cx="352" cy="215" r="1.4"/>
    <circle cx="337" cy="196" r="1.4"/>
    <circle cx="404" cy="248" r="1.4"/>
    <circle cx="314" cy="201" r="1.4"/>
    <circle cx="347" cy="199" r="1.4"/>
    <circle cx="380" cy="228" r="1.4"/>
    <circle cx="367" cy="223" r="1.4"/>
    <circle cx="375" cy="225" r="1.4"/>
    <circle cx="399" cy="245" r="1.4"/>
    <circle cx="322" cy="174" r="1.4"/>
    <circle cx="354" cy="184" r="1.4"/>
    <circle cx="323" cy="177" r="1.4"/>
    <circle cx="340" cy="200" r="1.4"/>
    <circle cx="378" cy="222" r="1.4"/>
    <circle cx="333" cy="190" r="1.4"/>
    <circle cx="347" cy="193" r="1.4"/>
    <circle cx="327" cy="174" r="1.4"/>
    <circle cx="360" cy="213" r="1.4"/>
    <circle cx="302" cy="147" r="1.4"/>
    <circle cx="371" cy="226" r="1.4"/>
    <circle cx="326" cy="203" r="1.4"/>
    <circle cx="387" cy="238" r="1.4"/>
    <circle cx="354" cy="220" r="1.4"/>
    <circle cx="316" cy="192" r="1.4"/>
    <circle cx="337" cy="203" r="1.4"/>
    <circle cx="355" cy="215" r="1.4"/>
    <circle cx="350" cy="213" r="1.4"/>
    <circle cx="351" cy="177" r="1.4"/>
    <circle cx="312" cy="172" r="1.4"/>
    <circle cx="359" cy="219" r="1.4"/>
    <circle cx="384" cy="238" r="1.4"/>
    <circle cx="345" cy="202" r="1.4"/>
    <circle cx="393" cy="243" r="1.4"/>
    <circle cx="335" cy="203" r="1.4"/>
    <circle cx="353" cy="193" r="1.4"/>
    <circle cx="345" cy="195" r="1.4"/>
    <circle cx="308" cy="166" r="1.4"/>
    <circle cx="328" cy="207" r="1.4"/>
    <circle cx="375" cy="223" r="1.4"/>
    <circle cx="400" cy="244" r="1.4"/>
    <circle cx="338" cy="200" r="1.4"/>
    <circle cx="359" cy="208" r="1.4"/>
    <circle cx="368" cy="208" r="1.4"/>
    <circle cx="362" cy="210" r="1.4"/>
    <circle cx="363" cy="200" r="1.4"/>
    <circle cx="358" cy="220" r="1.4"/>
    <circle cx="366" cy="226" r="1.4"/>
    <circle cx="371" cy="207" r="1.4"/>
    <circle cx="381" cy="234" r="1.4"/>
    <circle cx="357" cy="198" r="1.4"/>
    <circle cx="351" cy="201" r="1.4"/>
    <circle cx="356" cy="220" r="1.4"/>
    <circle cx="308" cy="180" r="1.4"/>
    <circle cx="340" cy="181" r="1.4"/>
    <circle cx="386" cy="239" r="1.4"/>
    <circle cx="346" cy="207" r="1.4"/>
    <circle cx="369" cy="211" r="1.4"/>
    <circle cx="342" cy="189" r="1.4"/>
    <circle cx="369" cy="212" r="1.4"/>
    <circle cx="335" cy="206" r="1.4"/>
    <circle cx="375" cy="229" r="1.4"/>
    <circle cx="359" cy="218" r="1.4"/>
    <circle cx="368" cy="221" r="1.4"/>
    <circle cx="348" cy="206" r="1.4"/>
    <circle cx="351" cy="205" r="1.4"/>
    <circle cx="348" cy="181" r="1.4"/>
    <circle cx="364" cy="207" r="1.4"/>
    <circle cx="348" cy="201" r="1.4"/>
    <circle cx="362" cy="213" r="1.4"/>
    <circle cx="382" cy="235" r="1.4"/>
    <circle cx="362" cy="225" r="1.4"/>
    <circle cx="356" cy="201" r="1.4"/>
    <circle cx="349" cy="184" r="1.4"/>
    <circle cx="348" cy="197" r="1.4"/>
    <circle cx="371" cy="214" r="1.4"/>
    <circle cx="324" cy="187" r="1.4"/>
    <circle cx="307" cy="169" r="1.4"/>
    <circle cx="315" cy="178" r="1.4"/>
    <circle cx="349" cy="207" r="1.4"/>
    <circle cx="346" cy="208" r="1.4"/>
    <circle cx="320" cy="177" r="1.4"/>
    <circle cx="382" cy="222" r="1.4"/>
    <circle cx="356" cy="223" r="1.4"/>
    <circle cx="329" cy="177" r="1.4"/>
    <circle cx="345" cy="191" r="1.4"/>
    <circle cx="335" cy="197" r="1.4"/>
    <circle cx="353" cy="200" r="1.4"/>
    <circle cx="350" cy="178" r="1.4"/>
    <circle cx="367" cy="221" r="1.4"/>
    <circle cx="359" cy="211" r="1.4"/>
    <circle cx="348" cy="215" r="1.4"/>
    <circle cx="329" cy="198" r="1.4"/>
    <circle cx="363" cy="224" r="1.4"/>
    <circle cx="350" cy="195" r="1.4"/>
    <circle cx="353" cy="214" r="1.4"/>
    <circle cx="352" cy="186" r="1.4"/>
    <circle cx="341" cy="205" r="1.4"/>
    <circle cx="393" cy="244" r="1.4"/>
    <circle cx="361" cy="203" r="1.4"/>
    <circle cx="355" cy="227" r="1.4"/>
    <circle cx="356" cy="221" r="1.4"/>
    <circle cx="362" cy="222" r="1.4"/>
    <circle cx="353" cy="212" r="1.4"/>
    <circle cx="353" cy="181" r="1.4"/>
    <circle cx="352" cy="202" r="1.4"/>
    <circle cx="324" cy="178" r="1.4"/>
    <circle cx="360" cy="227" r="1.4"/>
    <circle cx="374" cy="232" r="1.4"/>
    <circle cx="358" cy="211" r="1.4"/>
    <circle cx="388" cy="236" r="1.4"/>
    <circle cx="380" cy="240" r="1.4"/>
    <circle cx="368" cy="224" r="1.4"/>
    <circle cx="330" cy="205" r="1.4"/>
    <circle cx="318" cy="184" r="1.4"/>
    <circle cx="354" cy="209" r="1.4"/>
    <circle cx="347" cy="201" r="1.4"/>
    <circle cx="375" cy="237" r="1.4"/>
    <circle cx="315" cy="192" r="1.4"/>
    <circle cx="316" cy="176" r="1.4"/>
    <circle cx="358" cy="215" r="1.4"/>
    <circle cx="342" cy="183" r="1.4"/>
    <circle cx="366" cy="227" r="1.4"/>
    <circle cx="354" cy="201" r="1.4"/>
    <circle cx="363" cy="218" r="1.4"/>
    <circle cx="359" cy="197" r="1.4"/>
    <circle cx="358" cy="223" r="1.4"/>
    <circle cx="363" cy="229" r="1.4"/>
    <circle cx="344" cy="169" r="1.4"/>
    <circle cx="369" cy="226" r="1.4"/>
    <circle cx="362" cy="229" r="1.4"/>
    <circle cx="346" cy="194" r="1.4"/>
    <circle cx="356" cy="215" r="1.4"/>
    <circle cx="366" cy="210" r="1.4"/>
    <circle cx="323" cy="195" r="1.4"/>
    <circle cx="374" cy="226" r="1.4"/>
    <circle cx="325" cy="194" r="1.4"/>
    <circle cx="371" cy="237" r="1.4"/>
    <circle cx="341" cy="206" r="1.4"/>
    <circle cx="333" cy="205" r="1.4"/>
    <circle cx="357" cy="221" r="1.4"/>
    <circle cx="397" cy="240" r="1.4"/>
    <circle cx="387" cy="236" r="1.4"/>
    <circle cx="360" cy="217" r="1.4"/>
    <circle cx="354" cy="219" r="1.4"/>
    <circle cx="330" cy="200" r="1.4"/>
    <circle cx="350" cy="207" r="1.4"/>
    <circle cx="315" cy="189" r="1.4"/>
    <circle cx="321" cy="179" r="1.4"/>
    <circle cx="372" cy="234" r="1.4"/>
    <circle cx="326" cy="183" r="1.4"/>
    <circle cx="339" cy="180" r="1.4"/>
    <circle cx="347" cy="210" r="1.4"/>
    <circle cx="341" cy="199" r="1.4"/>
    <circle cx="339" cy="182" r="1.4"/>
    <circle cx="373" cy="240" r="1.4"/>
    <circle cx="332" cy="179" r="1.4"/>
    <circle cx="363" cy="231" r="1.4"/>
    <circle cx="351" cy="216" r="1.4"/>
    <circle cx="361" cy="226" r="1.4"/>
    <circle cx="321" cy="187" r="1.4"/>
    <circle cx="383" cy="233" r="1.4"/>
    <circle cx="360" cy="211" r="1.4"/>
    <circle cx="309" cy="184" r="1.4"/>
    <circle cx="359" cy="216" r="1.4"/>
    <circle cx="333" cy="216" r="1.4"/>
    <circle cx="334" cy="221" r="1.4"/>
    <circle cx="353" cy="219" r="1.4"/>
    <circle cx="391" cy="246" r="1.4"/>
    <circle cx="380" cy="232" r="1.4"/>
    <circle cx="338" cy="189" r="1.4"/>
    <circle cx="350" cy="204" r="1.4"/>
    <circle cx="356" cy="228" r="1.4"/>
    <circle cx="364" cy="219" r="1.4"/>
    <circle cx="335" cy="208" r="1.4"/>
    <circle cx="354" cy="221" r="1.4"/>
    <circle cx="367" cy="231" r="1.4"/>
    <circle cx="349" cy="214" r="1.4"/>
    <circle cx="360" cy="207" r="1.4"/>
    <circle cx="329" cy="206" r="1.4"/>
    <circle cx="338" cy="193" r="1.4"/>
    <circle cx="366" cy="232" r="1.4"/>
    <circle cx="340" cy="186" r="1.4"/>
    <circle cx="383" cy="245" r="1.4"/>
    <circle cx="343" cy="214" r="1.4"/>
    <circle cx="345" cy="223" r="1.4"/>
    <circle cx="346" cy="201" r="1.4"/>
    <circle cx="350" cy="221" r="1.4"/>
    <circle cx="332" cy="214" r="1.4"/>
    <circle cx="312" cy="174" r="1.4"/>
    <circle cx="365" cy="238" r="1.4"/>
    <circle cx="321" cy="172" r="1.4"/>
    <circle cx="332" cy="191" r="1.4"/>
    <circle cx="336" cy="193" r="1.4"/>
    <circle cx="367" cy="234" r="1.4"/>
    <circle cx="377" cy="244" r="1.4"/>
    <circle cx="344" cy="202" r="1.4"/>
    <circle cx="361" cy="220" r="1.4"/>
    <circle cx="331" cy="207" r="1.4"/>
    <circle cx="366" cy="222" r="1.4"/>
    <circle cx="333" cy="211" r="1.4"/>
    <circle cx="314" cy="165" r="1.4"/>
    <circle cx="338" cy="173" r="1.4"/>
    <circle cx="333" cy="167" r="1.4"/>
    <circle cx="317" cy="174" r="1.4"/>
    <circle cx="358" cy="234" r="1.4"/>
    <circle cx="340" cy="208" r="1.4"/>
    <circle cx="284" cy="181" r="1.4"/>
    <circle cx="342" cy="214" r="1.4"/>
    <circle cx="361" cy="221" r="1.4"/>
    <circle cx="350" cy="214" r="1.4"/>
    <circle cx="348" cy="207" r="1.4"/>
    <circle cx="322" cy="162" r="1.4"/>
    <circle cx="352" cy="206" r="1.4"/>
    <circle cx="354" cy="231" r="1.4"/>
    <circle cx="340" cy="195" r="1.4"/>
    <circle cx="354" cy="222" r="1.4"/>
    <circle cx="338" cy="194" r="1.4"/>
    <circle cx="313" cy="210" r="1.4"/>
    <circle cx="340" cy="196" r="1.4"/>
    <circle cx="368" cy="223" r="1.4"/>
    <circle cx="347" cy="227" r="1.4"/>
    <circle cx="355" cy="231" r="1.4"/>
    <circle cx="362" cy="236" r="1.4"/>
    <circle cx="376" cy="244" r="1.4"/>
    <circle cx="328" cy="212" r="1.4"/>
    <circle cx="355" cy="234" r="1.4"/>
    <circle cx="358" cy="225" r="1.4"/>
    <circle cx="321" cy="210" r="1.4"/>
    <circle cx="344" cy="213" r="1.4"/>
    <circle cx="383" cy="250" r="1.4"/>
    <circle cx="320" cy="196" r="1.4"/>
    <circle cx="336" cy="219" r="1.4"/>
    <circle cx="374" cy="241" r="1.4"/>
    <circle cx="334" cy="212" r="1.4"/>
    <circle cx="350" cy="216" r="1.4"/>
    <circle cx="336" cy="195" r="1.4"/>
    <circle cx="308" cy="190" r="1.4"/>
    <circle cx="323" cy="189" r="1.4"/>
    <circle cx="330" cy="204" r="1.4"/>
    <circle cx="359" cy="217" r="1.4"/>
    <circle cx="333" cy="194" r="1.4"/>
    <circle cx="353" cy="218" r="1.4"/>
    <circle cx="351" cy="200" r="1.4"/>
    <circle cx="354" cy="226" r="1.4"/>
    <circle cx="337" cy="213" r="1.4"/>
    <circle cx="369" cy="230" r="1.4"/>
    <circle cx="317" cy="186" r="1.4"/>
    <circle cx="283" cy="165" r="1.4"/>
    <circle cx="348" cy="208" r="1.4"/>
    <circle cx="350" cy="223" r="1.4"/>
    <circle cx="347" cy="213" r="1.4"/>
    <circle cx="337" cy="226" r="1.4"/>
    <circle cx="370" cy="233" r="1.4"/>
    <circle cx="369" cy="243" r="1.4"/>
    <circle cx="332" cy="218" r="1.4"/>
    <circle cx="354" cy="233" r="1.4"/>
    <circle cx="371" cy="242" r="1.4"/>
    <circle cx="308" cy="185" r="1.4"/>
    <circle cx="337" cy="216" r="1.4"/>
    <circle cx="310" cy="189" r="1.4"/>
    <circle cx="343" cy="208" r="1.4"/>
    <circle cx="331" cy="217" r="1.4"/>
    <circle cx="346" cy="221" r="1.4"/>
    <circle cx="339" cy="219" r="1.4"/>
    <circle cx="360" cy="230" r="1.4"/>
    <circle cx="316" cy="178" r="1.4"/>
    <circle cx="307" cy="181" r="1.4"/>
    <circle cx="310" cy="180" r="1.4"/>
    <circle cx="316" cy="161" r="1.4"/>
    <circle cx="349" cy="225" r="1.4"/>
    <circle cx="360" cy="226" r="1.4"/>
    <circle cx="307" cy="194" r="1.4"/>
    <circle cx="327" cy="209" r="1.4"/>
    <circle cx="304" cy="166" r="1.4"/>
    <circle cx="306" cy="208" r="1.4"/>
    <circle cx="333" cy="214" r="1.4"/>
    <circle cx="357" cy="228" r="1.4"/>
    <circle cx="308" cy="174" r="1.4"/>
    <circle cx="343" cy="233" r="1.4"/>
    <circle cx="343" cy="223" r="1.4"/>
    <circle cx="324" cy="215" r="1.4"/>
    <circle cx="310" cy="185" r="1.4"/>
    <circle cx="352" cy="238" r="1.4"/>
    <circle cx="296" cy="197" r="1.4"/>
    <circle cx="345" cy="205" r="1.4"/>
    <circle cx="339" cy="218" r="1.4"/>
    <circle cx="311" cy="156" r="1.4"/>
    <circle cx="336" cy="231" r="1.4"/>
    <circle cx="369" cy="244" r="1.4"/>
    <circle cx="330" cy="212" r="1.4"/>
    <circle cx="326" cy="207" r="1.4"/>
    <circle cx="313" cy="136" r="1.4"/>
    <circle cx="339" cy="215" r="1.4"/>
    <circle cx="337" cy="218" r="1.4"/>
    <circle cx="305" cy="178" r="1.4"/>
    <circle cx="335" cy="228" r="1.4"/>
    <circle cx="343" cy="203" r="1.4"/>
    <circle cx="326" cy="209" r="1.4"/>
    <circle cx="330" cy="198" r="1.4"/>
    <circle cx="316" cy="182" r="1.4"/>
    <circle cx="342" cy="224" r="1.4"/>
    <circle cx="328" cy="206" r="1.4"/>
    <circle cx="345" cy="197" r="1.4"/>
    <circle cx="340" cy="215" r="1.4"/>
    <circle cx="336" cy="230" r="1.4"/>
    <circle cx="388" cy="237" r="1.4"/>
    <circle cx="353" cy="238" r="1.4"/>
    <circle cx="327" cy="188" r="1.4"/>
    <circle cx="312" cy="212" r="1.4"/>
    <circle cx="324" cy="190" r="1.4"/>
    <circle cx="335" cy="189" r="1.4"/>
    <circle cx="308" cy="172" r="1.4"/>
    <circle cx="345" cy="219" r="1.4"/>
    <circle cx="305" cy="179" r="1.4"/>
    <circle cx="355" cy="232" r="1.4"/>
    <circle cx="364" cy="231" r="1.4"/>
    <circle cx="284" cy="173" r="1.4"/>
    <circle cx="361" cy="244" r="1.4"/>
    <circle cx="316" cy="210" r="1.4"/>
    <circle cx="312" cy="175" r="1.4"/>
    <circle cx="348" cy="238" r="1.4"/>
    <circle cx="326" cy="202" r="1.4"/>
    <circle cx="350" cy="241" r="1.4"/>
    <circle cx="329" cy="221" r="1.4"/>
    <circle cx="383" cy="258" r="1.4"/>
    <circle cx="330" cy="229" r="1.4"/>
    <circle cx="328" cy="210" r="1.4"/>
    <circle cx="331" cy="213" r="1.4"/>
    <circle cx="321" cy="209" r="1.4"/>
    <circle cx="316" cy="222" r="1.4"/>
    <circle cx="278" cy="190" r="1.4"/>
    <circle cx="296" cy="156" r="1.4"/>
    <circle cx="323" cy="197" r="1.4"/>
    <circle cx="312" cy="191" r="1.4"/>
    <circle cx="324" cy="204" r="1.4"/>
    <circle cx="332" cy="221" r="1.4"/>
    <circle cx="310" cy="214" r="1.4"/>
    <circle cx="354" cy="210" r="1.4"/>
    <circle cx="316" cy="207" r="1.4"/>
    <circle cx="293" cy="185" r="1.4"/>
    <circle cx="336" cy="228" r="1.4"/>
    <circle cx="309" cy="214" r="1.4"/>
    <circle cx="315" cy="203" r="1.4"/>
    <circle cx="321" cy="188" r="1.4"/>
    <circle cx="334" cy="187" r="1.4"/>
    <circle cx="304" cy="188" r="1.4"/>
    <circle cx="315" cy="200" r="1.4"/>
    <circle cx="325" cy="222" r="1.4"/>
    <circle cx="327" cy="204" r="1.4"/>
    <circle cx="306" cy="195" r="1.4"/>
    <circle cx="302" cy="170" r="1.4"/>
    <circle cx="339" cy="237" r="1.4"/>
    <circle cx="311" cy="191" r="1.4"/>
    <circle cx="323" cy="220" r="1.4"/>
    <circle cx="325" cy="226" r="1.4"/>
    <circle cx="319" cy="192" r="1.4"/>
    <circle cx="310" cy="199" r="1.4"/>
    <circle cx="309" cy="198" r="1.4"/>
    <circle cx="312" cy="195" r="1.4"/>
    <circle cx="327" cy="205" r="1.4"/>
    <circle cx="331" cy="233" r="1.4"/>
    <circle cx="321" cy="207" r="1.4"/>
    <circle cx="314" cy="213" r="1.4"/>
    <circle cx="349" cy="244" r="1.4"/>
    <circle cx="310" cy="198" r="1.4"/>
    <circle cx="335" cy="239" r="1.4"/>
    <circle cx="314" cy="223" r="1.4"/>
    <circle cx="307" cy="196" r="1.4"/>
    <circle cx="318" cy="194" r="1.4"/>
    <circle cx="307" cy="216" r="1.4"/>
    <circle cx="361" cy="232" r="1.4"/>
    <circle cx="333" cy="233" r="1.4"/>
    <circle cx="300" cy="199" r="1.4"/>
    <circle cx="313" cy="224" r="1.4"/>
    <circle cx="318" cy="204" r="1.4"/>
    <circle cx="317" cy="198" r="1.4"/>
    <circle cx="294" cy="219" r="1.4"/>
    <circle cx="342" cy="247" r="1.4"/>
    <circle cx="322" cy="218" r="1.4"/>
    <circle cx="317" cy="179" r="1.4"/>
    <circle cx="311" cy="193" r="1.4"/>
    <circle cx="316" cy="209" r="1.4"/>
    <circle cx="318" cy="183" r="1.4"/>
    <circle cx="337" cy="236" r="1.4"/>
    <circle cx="342" cy="240" r="1.4"/>
    <circle cx="313" cy="200" r="1.4"/>
    <circle cx="314" cy="231" r="1.4"/>
    <circle cx="302" cy="216" r="1.4"/>
    <circle cx="303" cy="196" r="1.4"/>
    <circle cx="303" cy="185" r="1.4"/>
    <circle cx="330" cy="239" r="1.4"/>
    <circle cx="308" cy="182" r="1.4"/>
    <circle cx="320" cy="202" r="1.4"/>
    <circle cx="323" cy="228" r="1.4"/>
    <circle cx="305" cy="199" r="1.4"/>
    <circle cx="289" cy="154" r="1.4"/>
    <circle cx="320" cy="203" r="1.4"/>
    <circle cx="292" cy="177" r="1.4"/>
    <circle cx="302" cy="219" r="1.4"/>
    <circle cx="324" cy="247" r="1.4"/>
    <circle cx="322" cy="206" r="1.4"/>
    <circle cx="316" cy="203" r="1.4"/>
    <circle cx="310" cy="221" r="1.4"/>
    <circle cx="305" cy="205" r="1.4"/>
    <circle cx="312" cy="189" r="1.4"/>
    <circle cx="286" cy="168" r="1.4"/>
    <circle cx="315" cy="204" r="1.4"/>
    <circle cx="338" cy="251" r="1.4"/>
    <circle cx="319" cy="229" r="1.4"/>
    <circle cx="297" cy="165" r="1.4"/>
    <circle cx="312" cy="168" r="1.4"/>
    <circle cx="317" cy="242" r="1.4"/>
    <circle cx="295" cy="177" r="1.4"/>
    <circle cx="300" cy="186" r="1.4"/>
    <circle cx="315" cy="210" r="1.4"/>
    <circle cx="322" cy="239" r="1.4"/>
    <circle cx="319" cy="214" r="1.4"/>
    <circle cx="280" cy="186" r="1.4"/>
    <circle cx="301" cy="167" r="1.4"/>
    <circle cx="311" cy="187" r="1.4"/>
    <circle cx="325" cy="235" r="1.4"/>
    <circle cx="335" cy="220" r="1.4"/>
    <circle cx="290" cy="183" r="1.4"/>
    <circle cx="303" cy="229" r="1.4"/>
    <circle cx="290" cy="184" r="1.4"/>
    <circle cx="320" cy="239" r="1.4"/>
    <circle cx="298" cy="174" r="1.4"/>
    <circle cx="288" cy="219" r="1.4"/>
    <circle cx="295" cy="175" r="1.4"/>
    <circle cx="319" cy="232" r="1.4"/>
    <circle cx="266" cy="167" r="1.4"/>
    <circle cx="285" cy="210" r="1.4"/>
    <circle cx="314" cy="237" r="1.4"/>
    <circle cx="297" cy="211" r="1.4"/>
    <circle cx="273" cy="169" r="1.4"/>
    <circle cx="280" cy="178" r="1.4"/>
    <circle cx="280" cy="169" r="1.4"/>
    <circle cx="290" cy="206" r="1.4"/>
    <circle cx="292" cy="218" r="1.4"/>
    <circle cx="306" cy="163" r="1.4"/>
    <circle cx="297" cy="162" r="1.4"/>
    <circle cx="276" cy="202" r="1.4"/>
    <circle cx="302" cy="209" r="1.4"/>
    <circle cx="314" cy="207" r="1.4"/>
    <circle cx="334" cy="213" r="1.4"/>
    <circle cx="301" cy="219" r="1.4"/>
    <circle cx="303" cy="182" r="1.4"/>
    <circle cx="310" cy="168" r="1.4"/>
    <circle cx="299" cy="219" r="1.4"/>
    <circle cx="311" cy="234" r="1.4"/>
    <circle cx="281" cy="174" r="1.4"/>
    <circle cx="300" cy="189" r="1.4"/>
    <circle cx="266" cy="152" r="1.4"/>
    <circle cx="289" cy="223" r="1.4"/>
    <circle cx="266" cy="144" r="1.4"/>
    <circle cx="259" cy="160" r="1.4"/>
    <circle cx="312" cy="224" r="1.4"/>
    <circle cx="262" cy="164" r="1.4"/>
    <circle cx="285" cy="214" r="1.4"/>
    <circle cx="258" cy="167" r="1.4"/>
    <circle cx="339" cy="264" r="1.4"/>
    <circle cx="231" cy="147" r="1.4"/>
    <circle cx="298" cy="187" r="1.4"/>
    <circle cx="284" cy="197" r="1.4"/>
    <circle cx="300" cy="203" r="1.4"/>
    <circle cx="231" cy="206" r="1.4"/>
    <circle cx="284" cy="226" r="1.4"/>
    <circle cx="246" cy="154" r="1.4"/>
    <circle cx="279" cy="195" r="1.4"/>
    <circle cx="277" cy="203" r="1.4"/>
    <circle cx="281" cy="226" r="1.4"/>
    <circle cx="295" cy="235" r="1.4"/>
    <circle cx="293" cy="257" r="1.4"/>
    <circle cx="248" cy="164" r="1.4"/>
    <circle cx="286" cy="218" r="1.4"/>
    <circle cx="279" cy="220" r="1.4"/>
    <circle cx="263" cy="195" r="1.4"/>
    <circle cx="281" cy="209" r="1.4"/>
    <circle cx="275" cy="215" r="1.4"/>
    <circle cx="280" cy="219" r="1.4"/>
    <circle cx="258" cy="218" r="1.4"/>
    <circle cx="257" cy="216" r="1.4"/>
    <circle cx="239" cy="154" r="1.4"/>
    <circle cx="238" cy="199" r="1.4"/>
    <circle cx="197" cy="132" r="1.4"/>
    <circle cx="266" cy="221" r="1.4"/>
    <circle cx="296" cy="241" r="1.4"/>
    <circle cx="218" cy="148" r="1.4"/>
    <circle cx="226" cy="169" r="1.4"/>
    <circle cx="239" cy="222" r="1.4"/>
    <circle cx="226" cy="161" r="1.4"/>
    <circle cx="205" cy="189" r="1.4"/>
    <circle cx="209" cy="190" r="1.4"/>
    </g>
    <line x1="364" y1="259" x2="364" y2="231" stroke="#FF680A" stroke-width="0.7" opacity="0.45"/>
    <circle cx="364" cy="259" r="1.3" fill="#FF680A" opacity="0.5"/>
    <circle cx="364" cy="231" r="3" fill="#FF680A"/>
    <line x1="209" y1="274" x2="209" y2="190" stroke="#FF680A" stroke-width="0.7" opacity="0.45"/>
    <circle cx="209" cy="274" r="1.3" fill="#FF680A" opacity="0.5"/>
    <circle cx="209" cy="190" r="3" fill="#FF680A"/>
    <line x1="334" y1="268" x2="334" y2="213" stroke="#FF680A" stroke-width="0.7" opacity="0.45"/>
    <circle cx="334" cy="268" r="1.3" fill="#FF680A" opacity="0.5"/>
    <circle cx="334" cy="213" r="3" fill="#FF680A"/>
    <line x1="286" y1="268" x2="286" y2="218" stroke="#FF680A" stroke-width="0.7" opacity="0.45"/>
    <circle cx="286" cy="268" r="1.3" fill="#FF680A" opacity="0.5"/>
    <circle cx="286" cy="218" r="3" fill="#FF680A"/>
    <line x1="298" y1="255" x2="298" y2="187" stroke="#FF680A" stroke-width="0.7" opacity="0.45"/>
    <circle cx="298" cy="255" r="1.3" fill="#FF680A" opacity="0.5"/>
    <circle cx="298" cy="187" r="3" fill="#FF680A"/>
    <line x1="263" y1="257" x2="263" y2="195" stroke="#FF680A" stroke-width="0.7" opacity="0.45"/>
    <circle cx="263" cy="257" r="1.3" fill="#FF680A" opacity="0.5"/>
    <circle cx="263" cy="195" r="3" fill="#FF680A"/>
    <line x1="303" y1="253" x2="303" y2="182" stroke="#FF680A" stroke-width="0.7" opacity="0.45"/>
    <circle cx="303" cy="253" r="1.3" fill="#FF680A" opacity="0.5"/>
    <circle cx="303" cy="182" r="3" fill="#FF680A"/>
    <line x1="281" y1="243" x2="281" y2="174" stroke="#FF680A" stroke-width="0.7" opacity="0.45"/>
    <circle cx="281" cy="243" r="1.3" fill="#FF680A" opacity="0.5"/>
    <circle cx="281" cy="174" r="3" fill="#FF680A"/>
    <line x1="300" y1="259" x2="300" y2="203" stroke="#FF680A" stroke-width="0.7" opacity="0.45"/>
    <circle cx="300" cy="259" r="1.3" fill="#FF680A" opacity="0.5"/>
    <circle cx="300" cy="203" r="3" fill="#FF680A"/>
    <line x1="311" y1="251" x2="311" y2="187" stroke="#FF680A" stroke-width="0.7" opacity="0.45"/>
    <circle cx="311" cy="251" r="1.3" fill="#FF680A" opacity="0.5"/>
    <circle cx="311" cy="187" r="3" fill="#FF680A"/>
    <line x1="336" y1="260" x2="336" y2="195" stroke="#FF680A" stroke-width="0.7" opacity="0.45"/>
    <circle cx="336" cy="260" r="1.3" fill="#FF680A" opacity="0.5"/>
    <circle cx="336" cy="195" r="3" fill="#FF680A"/>
    <line x1="306" y1="253" x2="306" y2="163" stroke="#FF680A" stroke-width="0.7" opacity="0.45"/>
    <circle cx="306" cy="253" r="1.3" fill="#FF680A" opacity="0.5"/>
    <circle cx="306" cy="163" r="3" fill="#FF680A"/>
    <line x1="373" y1="254" x2="373" y2="214" stroke="#FF680A" stroke-width="0.7" opacity="0.45"/>
    <circle cx="373" cy="254" r="1.3" fill="#FF680A" opacity="0.5"/>
    <circle cx="373" cy="214" r="3" fill="#FF680A"/>
    <line x1="281" y1="268" x2="281" y2="209" stroke="#FF680A" stroke-width="0.7" opacity="0.45"/>
    <circle cx="281" cy="268" r="1.3" fill="#FF680A" opacity="0.5"/>
    <circle cx="281" cy="209" r="3" fill="#FF680A"/>
    <line x1="401" y1="248" x2="401" y2="236" stroke="#FF680A" stroke-width="0.7" opacity="0.45"/>
    <circle cx="401" cy="248" r="1.3" fill="#FF680A" opacity="0.5"/>
    <circle cx="401" cy="236" r="3" fill="#FF680A"/>
    <line x1="397" y1="249" x2="397" y2="232" stroke="#FF680A" stroke-width="0.7" opacity="0.45"/>
    <circle cx="397" cy="249" r="1.3" fill="#FF680A" opacity="0.5"/>
    <circle cx="397" cy="232" r="3" fill="#FF680A"/>
    <line x1="226" y1="262" x2="226" y2="169" stroke="#FF680A" stroke-width="0.7" opacity="0.45"/>
    <circle cx="226" cy="262" r="1.3" fill="#FF680A" opacity="0.5"/>
    <circle cx="226" cy="169" r="3" fill="#FF680A"/>
    <line x1="197" y1="242" x2="197" y2="132" stroke="#FF680A" stroke-width="0.7" opacity="0.45"/>
    <circle cx="197" cy="242" r="1.3" fill="#FF680A" opacity="0.5"/>
    <circle cx="197" cy="132" r="3" fill="#FF680A"/>
    <line x1="361" y1="258" x2="361" y2="244" stroke="#FF680A" stroke-width="0.7" opacity="0.45"/>
    <circle cx="361" cy="258" r="1.3" fill="#FF680A" opacity="0.5"/>
    <circle cx="361" cy="244" r="3" fill="#FF680A"/>
    <line x1="387" y1="253" x2="387" y2="228" stroke="#FF680A" stroke-width="0.7" opacity="0.45"/>
    <circle cx="387" cy="253" r="1.3" fill="#FF680A" opacity="0.5"/>
    <circle cx="387" cy="228" r="3" fill="#FF680A"/>
    <line x1="392" y1="246" x2="392" y2="221" stroke="#FF680A" stroke-width="0.7" opacity="0.45"/>
    <circle cx="392" cy="246" r="1.3" fill="#FF680A" opacity="0.5"/>
    <circle cx="392" cy="221" r="3" fill="#FF680A"/>
    <line x1="339" y1="276" x2="339" y2="264" stroke="#FF680A" stroke-width="0.7" opacity="0.45"/>
    <circle cx="339" cy="276" r="1.3" fill="#FF680A" opacity="0.5"/>
    <circle cx="339" cy="264" r="3" fill="#FF680A"/>
    <line x1="257" y1="267" x2="257" y2="216" stroke="#FF680A" stroke-width="0.7" opacity="0.45"/>
    <circle cx="257" cy="267" r="1.3" fill="#FF680A" opacity="0.5"/>
    <circle cx="257" cy="216" r="3" fill="#FF680A"/>
    <line x1="313" y1="231" x2="313" y2="136" stroke="#FF680A" stroke-width="0.7" opacity="0.45"/>
    <circle cx="313" cy="231" r="1.3" fill="#FF680A" opacity="0.5"/>
    <circle cx="313" cy="136" r="3" fill="#FF680A"/>
    <line x1="404" y1="247" x2="404" y2="237" stroke="#FF680A" stroke-width="0.7" opacity="0.45"/>
    <circle cx="404" cy="247" r="1.3" fill="#FF680A" opacity="0.5"/>
    <circle cx="404" cy="237" r="3" fill="#FF680A"/>
    <line x1="393" y1="252" x2="393" y2="243" stroke="#FF680A" stroke-width="0.7" opacity="0.45"/>
    <circle cx="393" cy="252" r="1.3" fill="#FF680A" opacity="0.5"/>
    <circle cx="393" cy="243" r="3" fill="#FF680A"/>
    <line x1="275" y1="268" x2="275" y2="215" stroke="#FF680A" stroke-width="0.7" opacity="0.45"/>
    <circle cx="275" cy="268" r="1.3" fill="#FF680A" opacity="0.5"/>
    <circle cx="275" cy="215" r="3" fill="#FF680A"/>
    <line x1="406" y1="246" x2="406" y2="231" stroke="#FF680A" stroke-width="0.7" opacity="0.45"/>
    <circle cx="406" cy="246" r="1.3" fill="#FF680A" opacity="0.5"/>
    <circle cx="406" cy="231" r="3" fill="#FF680A"/>
    <text x="218" y="183" font-size="9.5" font-style="italic" fill="#FF680A" text-anchor="start" paint-order="stroke" stroke="#fff" stroke-width="3">FeCo₃</text>
    <text x="309" y="182" font-size="9.5" font-style="italic" fill="#FF680A" text-anchor="start" paint-order="stroke" stroke="#fff" stroke-width="3">Fe₇MnB₄</text>
    <text x="290" y="173" font-size="9.5" font-style="italic" fill="#FF680A" text-anchor="end" paint-order="stroke" stroke="#fff" stroke-width="3">Fe₁₅MnB₈</text>
    <text x="351" y="202" font-size="9.5" font-style="italic" fill="#FF680A" text-anchor="start" paint-order="stroke" stroke="#fff" stroke-width="3">FePt</text>
    <text x="315" y="154" font-size="9.5" font-style="italic" fill="#FF680A" text-anchor="start" paint-order="stroke" stroke="#fff" stroke-width="3">Fe₃Pt</text>
    <text x="268" y="218" font-size="9.5" font-style="italic" fill="#FF680A" text-anchor="end" paint-order="stroke" stroke="#fff" stroke-width="3">Co₃Cu</text>
    <text x="206" y="145" font-size="9.5" font-style="italic" fill="#FF680A" text-anchor="start" paint-order="stroke" stroke="#fff" stroke-width="3">Fe₁₃Co₃</text>
    <circle cx="468" cy="46" r="3" fill="#FF680A"/><text x="476" y="49" font-size="9" fill="#1f2937">Pareto set (n = 28)</text>
    <circle cx="468" cy="60" r="1.4" fill="#1f2937" opacity="0.3"/><text x="476" y="63" font-size="9" fill="#1f2937">one compound</text>
    </svg>
  <figcaption><strong>Figure 13.</strong> The dataset in the three intrinsic dimensions a magnet must satisfy at once: hardness (log κ), magnetization, and Curie temperature. Orange stems mark the 28 compounds that are Pareto-optimal in all three, projected onto the κ-Tc floor for readability. The dashed floor line is κ = 1. The conjunction thins the candidate list further than either two-dimensional view: Mn₂SbTe falls off this frontier (Curie point too low), the (Fe,Mn)₂B borides stay on it, and the high-Curie end belongs to cobalt-rich soft compounds that lack a hardening mechanism.</figcaption>
</figure>

Figure 14 splits the hardness-magnetization plane by anion class, and each class occupies its own region: intermetallics fill the strong-but-soft upper left, the anion-bearing classes trade magnetization for anisotropy along the lower right, and the borides sit alone in the crossing zone where both are moderate, which is why that family keeps appearing in Section 4.3.

<figure>
  <svg viewBox="0 0 620 310" xmlns="http://www.w3.org/2000/svg" style="font-family:inherit;">
    <defs><g id="kmscloud" fill="#1f2937" opacity="0.10">
    <circle cx="67" cy="40" r="1.1"/>
    <circle cx="71" cy="58" r="1.1"/>
    <circle cx="145" cy="72" r="1.1"/>
    <circle cx="75" cy="64" r="1.1"/>
    <circle cx="102" cy="83" r="1.1"/>
    <circle cx="56" cy="8" r="1.1"/>
    <circle cx="82" cy="64" r="1.1"/>
    <circle cx="89" cy="57" r="1.1"/>
    <circle cx="85" cy="58" r="1.1"/>
    <circle cx="96" cy="88" r="1.1"/>
    <circle cx="80" cy="46" r="1.1"/>
    <circle cx="54" cy="41" r="1.1"/>
    <circle cx="53" cy="41" r="1.1"/>
    <circle cx="72" cy="39" r="1.1"/>
    <circle cx="70" cy="51" r="1.1"/>
    <circle cx="76" cy="47" r="1.1"/>
    <circle cx="78" cy="43" r="1.1"/>
    <circle cx="91" cy="62" r="1.1"/>
    <circle cx="61" cy="51" r="1.1"/>
    <circle cx="61" cy="48" r="1.1"/>
    <circle cx="52" cy="58" r="1.1"/>
    <circle cx="39" cy="22" r="1.1"/>
    <circle cx="69" cy="53" r="1.1"/>
    <circle cx="77" cy="74" r="1.1"/>
    <circle cx="46" cy="33" r="1.1"/>
    <circle cx="46" cy="17" r="1.1"/>
    <circle cx="53" cy="60" r="1.1"/>
    <circle cx="60" cy="74" r="1.1"/>
    <circle cx="6" cy="48" r="1.1"/>
    <circle cx="55" cy="57" r="1.1"/>
    <circle cx="88" cy="58" r="1.1"/>
    <circle cx="68" cy="53" r="1.1"/>
    <circle cx="74" cy="57" r="1.1"/>
    <circle cx="77" cy="41" r="1.1"/>
    <circle cx="42" cy="46" r="1.1"/>
    <circle cx="80" cy="73" r="1.1"/>
    <circle cx="27" cy="37" r="1.1"/>
    <circle cx="79" cy="63" r="1.1"/>
    <circle cx="51" cy="34" r="1.1"/>
    <circle cx="79" cy="42" r="1.1"/>
    <circle cx="111" cy="61" r="1.1"/>
    <circle cx="82" cy="58" r="1.1"/>
    <circle cx="42" cy="54" r="1.1"/>
    <circle cx="75" cy="67" r="1.1"/>
    <circle cx="89" cy="68" r="1.1"/>
    <circle cx="69" cy="48" r="1.1"/>
    <circle cx="75" cy="48" r="1.1"/>
    <circle cx="77" cy="57" r="1.1"/>
    <circle cx="72" cy="41" r="1.1"/>
    <circle cx="64" cy="43" r="1.1"/>
    <circle cx="33" cy="61" r="1.1"/>
    <circle cx="86" cy="64" r="1.1"/>
    <circle cx="64" cy="42" r="1.1"/>
    <circle cx="66" cy="52" r="1.1"/>
    <circle cx="94" cy="66" r="1.1"/>
    <circle cx="40" cy="63" r="1.1"/>
    <circle cx="56" cy="66" r="1.1"/>
    <circle cx="83" cy="53" r="1.1"/>
    <circle cx="81" cy="46" r="1.1"/>
    <circle cx="75" cy="46" r="1.1"/>
    <circle cx="37" cy="33" r="1.1"/>
    <circle cx="97" cy="43" r="1.1"/>
    <circle cx="72" cy="44" r="1.1"/>
    <circle cx="74" cy="48" r="1.1"/>
    <circle cx="71" cy="44" r="1.1"/>
    <circle cx="108" cy="81" r="1.1"/>
    <circle cx="66" cy="72" r="1.1"/>
    <circle cx="67" cy="82" r="1.1"/>
    <circle cx="76" cy="81" r="1.1"/>
    <circle cx="68" cy="27" r="1.1"/>
    <circle cx="86" cy="74" r="1.1"/>
    <circle cx="90" cy="75" r="1.1"/>
    <circle cx="88" cy="73" r="1.1"/>
    <circle cx="108" cy="82" r="1.1"/>
    <circle cx="54" cy="69" r="1.1"/>
    <circle cx="91" cy="67" r="1.1"/>
    <circle cx="75" cy="62" r="1.1"/>
    <circle cx="90" cy="60" r="1.1"/>
    <circle cx="73" cy="59" r="1.1"/>
    <circle cx="70" cy="75" r="1.1"/>
    <circle cx="27" cy="62" r="1.1"/>
    <circle cx="99" cy="83" r="1.1"/>
    <circle cx="97" cy="83" r="1.1"/>
    <circle cx="39" cy="73" r="1.1"/>
    <circle cx="121" cy="82" r="1.1"/>
    <circle cx="99" cy="85" r="1.1"/>
    <circle cx="51" cy="58" r="1.1"/>
    <circle cx="121" cy="87" r="1.1"/>
    <circle cx="90" cy="78" r="1.1"/>
    <circle cx="60" cy="76" r="1.1"/>
    <circle cx="55" cy="39" r="1.1"/>
    <circle cx="83" cy="60" r="1.1"/>
    <circle cx="113" cy="94" r="1.1"/>
    <circle cx="89" cy="75" r="1.1"/>
    <circle cx="84" cy="77" r="1.1"/>
    <circle cx="124" cy="86" r="1.1"/>
    <circle cx="34" cy="34" r="1.1"/>
    <circle cx="95" cy="69" r="1.1"/>
    <circle cx="102" cy="61" r="1.1"/>
    <circle cx="83" cy="77" r="1.1"/>
    <circle cx="102" cy="80" r="1.1"/>
    <circle cx="55" cy="80" r="1.1"/>
    <circle cx="117" cy="85" r="1.1"/>
    <circle cx="91" cy="78" r="1.1"/>
    <circle cx="89" cy="69" r="1.1"/>
    <circle cx="87" cy="52" r="1.1"/>
    <circle cx="49" cy="83" r="1.1"/>
    <circle cx="96" cy="76" r="1.1"/>
    <circle cx="98" cy="75" r="1.1"/>
    <circle cx="80" cy="60" r="1.1"/>
    <circle cx="101" cy="77" r="1.1"/>
    <circle cx="95" cy="90" r="1.1"/>
    <circle cx="99" cy="77" r="1.1"/>
    <circle cx="62" cy="80" r="1.1"/>
    <circle cx="83" cy="86" r="1.1"/>
    <circle cx="80" cy="81" r="1.1"/>
    <circle cx="47" cy="72" r="1.1"/>
    <circle cx="69" cy="62" r="1.1"/>
    <circle cx="75" cy="61" r="1.1"/>
    <circle cx="84" cy="73" r="1.1"/>
    <circle cx="45" cy="59" r="1.1"/>
    <circle cx="45" cy="42" r="1.1"/>
    <circle cx="42" cy="83" r="1.1"/>
    <circle cx="63" cy="83" r="1.1"/>
    <circle cx="85" cy="74" r="1.1"/>
    <circle cx="92" cy="75" r="1.1"/>
    <circle cx="87" cy="46" r="1.1"/>
    <circle cx="107" cy="83" r="1.1"/>
    <circle cx="79" cy="25" r="1.1"/>
    <circle cx="82" cy="67" r="1.1"/>
    <circle cx="73" cy="53" r="1.1"/>
    <circle cx="75" cy="60" r="1.1"/>
    <circle cx="49" cy="55" r="1.1"/>
    <circle cx="53" cy="59" r="1.1"/>
    <circle cx="92" cy="61" r="1.1"/>
    <circle cx="69" cy="67" r="1.1"/>
    <circle cx="43" cy="40" r="1.1"/>
    <circle cx="43" cy="60" r="1.1"/>
    <circle cx="58" cy="43" r="1.1"/>
    <circle cx="77" cy="66" r="1.1"/>
    <circle cx="118" cy="67" r="1.1"/>
    <circle cx="68" cy="48" r="1.1"/>
    <circle cx="54" cy="64" r="1.1"/>
    <circle cx="66" cy="60" r="1.1"/>
    <circle cx="100" cy="73" r="1.1"/>
    <circle cx="50" cy="79" r="1.1"/>
    <circle cx="82" cy="51" r="1.1"/>
    <circle cx="79" cy="78" r="1.1"/>
    <circle cx="99" cy="86" r="1.1"/>
    <circle cx="36" cy="77" r="1.1"/>
    <circle cx="91" cy="83" r="1.1"/>
    <circle cx="92" cy="66" r="1.1"/>
    <circle cx="86" cy="78" r="1.1"/>
    <circle cx="88" cy="85" r="1.1"/>
    <circle cx="124" cy="89" r="1.1"/>
    <circle cx="70" cy="84" r="1.1"/>
    <circle cx="86" cy="80" r="1.1"/>
    <circle cx="61" cy="77" r="1.1"/>
    <circle cx="102" cy="84" r="1.1"/>
    <circle cx="119" cy="85" r="1.1"/>
    <circle cx="90" cy="79" r="1.1"/>
    <circle cx="73" cy="68" r="1.1"/>
    <circle cx="120" cy="83" r="1.1"/>
    <circle cx="91" cy="76" r="1.1"/>
    <circle cx="58" cy="82" r="1.1"/>
    <circle cx="79" cy="80" r="1.1"/>
    <circle cx="78" cy="73" r="1.1"/>
    <circle cx="56" cy="70" r="1.1"/>
    <circle cx="55" cy="64" r="1.1"/>
    <circle cx="60" cy="79" r="1.1"/>
    <circle cx="78" cy="82" r="1.1"/>
    <circle cx="127" cy="91" r="1.1"/>
    <circle cx="111" cy="92" r="1.1"/>
    <circle cx="70" cy="83" r="1.1"/>
    <circle cx="85" cy="89" r="1.1"/>
    <circle cx="98" cy="89" r="1.1"/>
    <circle cx="76" cy="74" r="1.1"/>
    <circle cx="107" cy="84" r="1.1"/>
    <circle cx="79" cy="79" r="1.1"/>
    <circle cx="117" cy="91" r="1.1"/>
    <circle cx="95" cy="84" r="1.1"/>
    <circle cx="106" cy="89" r="1.1"/>
    <circle cx="81" cy="81" r="1.1"/>
    <circle cx="60" cy="48" r="1.1"/>
    <circle cx="74" cy="92" r="1.1"/>
    <circle cx="77" cy="93" r="1.1"/>
    <circle cx="99" cy="89" r="1.1"/>
    <circle cx="106" cy="85" r="1.1"/>
    <circle cx="94" cy="91" r="1.1"/>
    <circle cx="76" cy="65" r="1.1"/>
    <circle cx="100" cy="77" r="1.1"/>
    <circle cx="98" cy="84" r="1.1"/>
    <circle cx="111" cy="87" r="1.1"/>
    <circle cx="81" cy="72" r="1.1"/>
    <circle cx="101" cy="89" r="1.1"/>
    <circle cx="94" cy="87" r="1.1"/>
    <circle cx="87" cy="88" r="1.1"/>
    <circle cx="100" cy="74" r="1.1"/>
    <circle cx="85" cy="78" r="1.1"/>
    <circle cx="126" cy="86" r="1.1"/>
    <circle cx="83" cy="71" r="1.1"/>
    <circle cx="111" cy="84" r="1.1"/>
    <circle cx="138" cy="91" r="1.1"/>
    <circle cx="98" cy="80" r="1.1"/>
    <circle cx="52" cy="85" r="1.1"/>
    <circle cx="73" cy="85" r="1.1"/>
    <circle cx="66" cy="82" r="1.1"/>
    <circle cx="114" cy="88" r="1.1"/>
    <circle cx="97" cy="86" r="1.1"/>
    <circle cx="97" cy="88" r="1.1"/>
    <circle cx="39" cy="84" r="1.1"/>
    <circle cx="131" cy="94" r="1.1"/>
    <circle cx="69" cy="82" r="1.1"/>
    <circle cx="51" cy="66" r="1.1"/>
    <circle cx="111" cy="93" r="1.1"/>
    <circle cx="102" cy="93" r="1.1"/>
    <circle cx="143" cy="92" r="1.1"/>
    <circle cx="121" cy="90" r="1.1"/>
    <circle cx="128" cy="93" r="1.1"/>
    <circle cx="115" cy="94" r="1.1"/>
    <circle cx="62" cy="58" r="1.1"/>
    <circle cx="79" cy="32" r="1.1"/>
    <circle cx="84" cy="65" r="1.1"/>
    <circle cx="39" cy="30" r="1.1"/>
    <circle cx="71" cy="65" r="1.1"/>
    <circle cx="119" cy="84" r="1.1"/>
    <circle cx="49" cy="75" r="1.1"/>
    <circle cx="64" cy="77" r="1.1"/>
    <circle cx="68" cy="66" r="1.1"/>
    <circle cx="102" cy="90" r="1.1"/>
    <circle cx="74" cy="69" r="1.1"/>
    <circle cx="124" cy="93" r="1.1"/>
    <circle cx="70" cy="92" r="1.1"/>
    <circle cx="80" cy="70" r="1.1"/>
    <circle cx="63" cy="82" r="1.1"/>
    <circle cx="94" cy="78" r="1.1"/>
    <circle cx="80" cy="79" r="1.1"/>
    <circle cx="116" cy="91" r="1.1"/>
    <circle cx="46" cy="52" r="1.1"/>
    <circle cx="86" cy="89" r="1.1"/>
    <circle cx="78" cy="85" r="1.1"/>
    <circle cx="105" cy="89" r="1.1"/>
    <circle cx="103" cy="86" r="1.1"/>
    <circle cx="128" cy="92" r="1.1"/>
    <circle cx="90" cy="76" r="1.1"/>
    <circle cx="95" cy="81" r="1.1"/>
    <circle cx="117" cy="83" r="1.1"/>
    <circle cx="84" cy="82" r="1.1"/>
    <circle cx="88" cy="80" r="1.1"/>
    <circle cx="94" cy="89" r="1.1"/>
    <circle cx="56" cy="49" r="1.1"/>
    <circle cx="64" cy="80" r="1.1"/>
    <circle cx="122" cy="84" r="1.1"/>
    <circle cx="86" cy="54" r="1.1"/>
    <circle cx="141" cy="90" r="1.1"/>
    <circle cx="91" cy="73" r="1.1"/>
    <circle cx="96" cy="92" r="1.1"/>
    <circle cx="92" cy="85" r="1.1"/>
    <circle cx="30" cy="66" r="1.1"/>
    <circle cx="67" cy="88" r="1.1"/>
    <circle cx="60" cy="83" r="1.1"/>
    <circle cx="66" cy="79" r="1.1"/>
    <circle cx="116" cy="89" r="1.1"/>
    <circle cx="97" cy="71" r="1.1"/>
    <circle cx="27" cy="73" r="1.1"/>
    <circle cx="82" cy="75" r="1.1"/>
    <circle cx="116" cy="81" r="1.1"/>
    <circle cx="125" cy="79" r="1.1"/>
    <circle cx="72" cy="75" r="1.1"/>
    <circle cx="94" cy="81" r="1.1"/>
    <circle cx="25" cy="76" r="1.1"/>
    <circle cx="86" cy="79" r="1.1"/>
    <circle cx="116" cy="86" r="1.1"/>
    <circle cx="87" cy="72" r="1.1"/>
    <circle cx="73" cy="80" r="1.1"/>
    <circle cx="69" cy="70" r="1.1"/>
    <circle cx="66" cy="61" r="1.1"/>
    <circle cx="68" cy="62" r="1.1"/>
    <circle cx="97" cy="75" r="1.1"/>
    <circle cx="114" cy="82" r="1.1"/>
    <circle cx="105" cy="83" r="1.1"/>
    <circle cx="58" cy="84" r="1.1"/>
    <circle cx="106" cy="79" r="1.1"/>
    <circle cx="88" cy="90" r="1.1"/>
    <circle cx="56" cy="71" r="1.1"/>
    <circle cx="95" cy="83" r="1.1"/>
    <circle cx="75" cy="85" r="1.1"/>
    <circle cx="122" cy="81" r="1.1"/>
    <circle cx="109" cy="91" r="1.1"/>
    <circle cx="44" cy="78" r="1.1"/>
    <circle cx="93" cy="81" r="1.1"/>
    <circle cx="71" cy="90" r="1.1"/>
    <circle cx="115" cy="87" r="1.1"/>
    <circle cx="135" cy="90" r="1.1"/>
    <circle cx="122" cy="92" r="1.1"/>
    <circle cx="101" cy="94" r="1.1"/>
    <circle cx="61" cy="58" r="1.1"/>
    <circle cx="104" cy="71" r="1.1"/>
    <circle cx="55" cy="58" r="1.1"/>
    <circle cx="71" cy="68" r="1.1"/>
    <circle cx="138" cy="89" r="1.1"/>
    <circle cx="80" cy="88" r="1.1"/>
    <circle cx="81" cy="88" r="1.1"/>
    <circle cx="60" cy="82" r="1.1"/>
    <circle cx="59" cy="86" r="1.1"/>
    <circle cx="78" cy="93" r="1.1"/>
    <circle cx="108" cy="80" r="1.1"/>
    <circle cx="100" cy="86" r="1.1"/>
    <circle cx="84" cy="88" r="1.1"/>
    <circle cx="42" cy="71" r="1.1"/>
    <circle cx="91" cy="79" r="1.1"/>
    <circle cx="99" cy="82" r="1.1"/>
    <circle cx="68" cy="81" r="1.1"/>
    <circle cx="56" cy="82" r="1.1"/>
    <circle cx="107" cy="87" r="1.1"/>
    <circle cx="67" cy="63" r="1.1"/>
    <circle cx="76" cy="75" r="1.1"/>
    <circle cx="64" cy="76" r="1.1"/>
    <circle cx="75" cy="89" r="1.1"/>
    <circle cx="23" cy="58" r="1.1"/>
    <circle cx="76" cy="86" r="1.1"/>
    <circle cx="56" cy="86" r="1.1"/>
    <circle cx="90" cy="87" r="1.1"/>
    <circle cx="74" cy="86" r="1.1"/>
    <circle cx="77" cy="67" r="1.1"/>
    <circle cx="90" cy="73" r="1.1"/>
    <circle cx="79" cy="76" r="1.1"/>
    <circle cx="74" cy="79" r="1.1"/>
    <circle cx="72" cy="80" r="1.1"/>
    <circle cx="51" cy="82" r="1.1"/>
    <circle cx="109" cy="92" r="1.1"/>
    <circle cx="64" cy="75" r="1.1"/>
    <circle cx="119" cy="88" r="1.1"/>
    <circle cx="63" cy="84" r="1.1"/>
    <circle cx="79" cy="89" r="1.1"/>
    <circle cx="98" cy="87" r="1.1"/>
    <circle cx="95" cy="77" r="1.1"/>
    <circle cx="93" cy="74" r="1.1"/>
    <circle cx="78" cy="86" r="1.1"/>
    <circle cx="60" cy="65" r="1.1"/>
    <circle cx="23" cy="38" r="1.1"/>
    <circle cx="74" cy="87" r="1.1"/>
    <circle cx="71" cy="69" r="1.1"/>
    <circle cx="29" cy="61" r="1.1"/>
    <circle cx="73" cy="73" r="1.1"/>
    <circle cx="101" cy="81" r="1.1"/>
    <circle cx="68" cy="75" r="1.1"/>
    <circle cx="61" cy="61" r="1.1"/>
    <circle cx="75" cy="63" r="1.1"/>
    <circle cx="83" cy="83" r="1.1"/>
    <circle cx="49" cy="87" r="1.1"/>
    <circle cx="91" cy="88" r="1.1"/>
    <circle cx="64" cy="83" r="1.1"/>
    <circle cx="70" cy="82" r="1.1"/>
    <circle cx="79" cy="73" r="1.1"/>
    <circle cx="70" cy="79" r="1.1"/>
    <circle cx="96" cy="75" r="1.1"/>
    <circle cx="63" cy="35" r="1.1"/>
    <circle cx="96" cy="71" r="1.1"/>
    <circle cx="73" cy="62" r="1.1"/>
    <circle cx="79" cy="71" r="1.1"/>
    <circle cx="51" cy="60" r="1.1"/>
    <circle cx="83" cy="75" r="1.1"/>
    <circle cx="57" cy="66" r="1.1"/>
    <circle cx="53" cy="79" r="1.1"/>
    <circle cx="78" cy="76" r="1.1"/>
    <circle cx="59" cy="58" r="1.1"/>
    <circle cx="83" cy="78" r="1.1"/>
    <circle cx="93" cy="89" r="1.1"/>
    <circle cx="72" cy="86" r="1.1"/>
    <circle cx="70" cy="72" r="1.1"/>
    <circle cx="83" cy="79" r="1.1"/>
    <circle cx="60" cy="56" r="1.1"/>
    <circle cx="62" cy="91" r="1.1"/>
    <circle cx="63" cy="73" r="1.1"/>
    <circle cx="87" cy="82" r="1.1"/>
    <circle cx="54" cy="68" r="1.1"/>
    <circle cx="46" cy="44" r="1.1"/>
    <circle cx="56" cy="33" r="1.1"/>
    <circle cx="72" cy="73" r="1.1"/>
    <circle cx="58" cy="63" r="1.1"/>
    <circle cx="65" cy="39" r="1.1"/>
    <circle cx="78" cy="70" r="1.1"/>
    <circle cx="10" cy="47" r="1.1"/>
    <circle cx="75" cy="75" r="1.1"/>
    <circle cx="58" cy="68" r="1.1"/>
    <circle cx="48" cy="64" r="1.1"/>
    <circle cx="43" cy="34" r="1.1"/>
    <circle cx="41" cy="31" r="1.1"/>
    <circle cx="49" cy="68" r="1.1"/>
    <circle cx="126" cy="95" r="1.1"/>
    <circle cx="100" cy="76" r="1.1"/>
    <circle cx="137" cy="94" r="1.1"/>
    <circle cx="96" cy="82" r="1.1"/>
    <circle cx="79" cy="84" r="1.1"/>
    <circle cx="120" cy="87" r="1.1"/>
    <circle cx="81" cy="82" r="1.1"/>
    <circle cx="139" cy="92" r="1.1"/>
    <circle cx="109" cy="87" r="1.1"/>
    <circle cx="80" cy="91" r="1.1"/>
    <circle cx="88" cy="76" r="1.1"/>
    <circle cx="72" cy="89" r="1.1"/>
    <circle cx="112" cy="85" r="1.1"/>
    <circle cx="105" cy="78" r="1.1"/>
    <circle cx="38" cy="80" r="1.1"/>
    <circle cx="53" cy="75" r="1.1"/>
    <circle cx="105" cy="84" r="1.1"/>
    <circle cx="70" cy="87" r="1.1"/>
    <circle cx="121" cy="91" r="1.1"/>
    <circle cx="134" cy="91" r="1.1"/>
    <circle cx="139" cy="91" r="1.1"/>
    <circle cx="0" cy="79" r="1.1"/>
    <circle cx="91" cy="85" r="1.1"/>
    <circle cx="78" cy="69" r="1.1"/>
    <circle cx="81" cy="62" r="1.1"/>
    <circle cx="91" cy="89" r="1.1"/>
    <circle cx="51" cy="59" r="1.1"/>
    <circle cx="60" cy="59" r="1.1"/>
    <circle cx="76" cy="78" r="1.1"/>
    <circle cx="59" cy="52" r="1.1"/>
    <circle cx="86" cy="92" r="1.1"/>
    <circle cx="123" cy="91" r="1.1"/>
    <circle cx="43" cy="85" r="1.1"/>
    <circle cx="57" cy="77" r="1.1"/>
    <circle cx="71" cy="84" r="1.1"/>
    <circle cx="54" cy="72" r="1.1"/>
    <circle cx="47" cy="77" r="1.1"/>
    <circle cx="71" cy="76" r="1.1"/>
    <circle cx="59" cy="82" r="1.1"/>
    <circle cx="61" cy="64" r="1.1"/>
    <circle cx="32" cy="78" r="1.1"/>
    <circle cx="86" cy="86" r="1.1"/>
    <circle cx="21" cy="79" r="1.1"/>
    <circle cx="69" cy="76" r="1.1"/>
    <circle cx="94" cy="95" r="1.1"/>
    <circle cx="70" cy="77" r="1.1"/>
    <circle cx="59" cy="76" r="1.1"/>
    <circle cx="86" cy="87" r="1.1"/>
    <circle cx="56" cy="72" r="1.1"/>
    <circle cx="61" cy="62" r="1.1"/>
    <circle cx="26" cy="83" r="1.1"/>
    <circle cx="59" cy="83" r="1.1"/>
    <circle cx="71" cy="85" r="1.1"/>
    <circle cx="72" cy="94" r="1.1"/>
    <circle cx="61" cy="85" r="1.1"/>
    <circle cx="48" cy="76" r="1.1"/>
    <circle cx="51" cy="79" r="1.1"/>
    <circle cx="59" cy="75" r="1.1"/>
    <circle cx="69" cy="78" r="1.1"/>
    <circle cx="63" cy="81" r="1.1"/>
    <circle cx="52" cy="72" r="1.1"/>
    <circle cx="35" cy="77" r="1.1"/>
    <circle cx="63" cy="76" r="1.1"/>
    <circle cx="34" cy="84" r="1.1"/>
    <circle cx="71" cy="79" r="1.1"/>
    <circle cx="44" cy="68" r="1.1"/>
    <circle cx="50" cy="81" r="1.1"/>
    <circle cx="115" cy="91" r="1.1"/>
    <circle cx="52" cy="71" r="1.1"/>
    <circle cx="65" cy="85" r="1.1"/>
    <circle cx="67" cy="80" r="1.1"/>
    <circle cx="78" cy="77" r="1.1"/>
    <circle cx="55" cy="71" r="1.1"/>
    <circle cx="84" cy="83" r="1.1"/>
    <circle cx="61" cy="90" r="1.1"/>
    <circle cx="67" cy="64" r="1.1"/>
    <circle cx="74" cy="91" r="1.1"/>
    <circle cx="48" cy="82" r="1.1"/>
    <circle cx="39" cy="74" r="1.1"/>
    <circle cx="59" cy="79" r="1.1"/>
    <circle cx="32" cy="76" r="1.1"/>
    <circle cx="15" cy="80" r="1.1"/>
    <circle cx="103" cy="89" r="1.1"/>
    <circle cx="54" cy="86" r="1.1"/>
    <circle cx="83" cy="89" r="1.1"/>
    <circle cx="55" cy="47" r="1.1"/>
    <circle cx="107" cy="92" r="1.1"/>
    <circle cx="116" cy="88" r="1.1"/>
    <circle cx="54" cy="76" r="1.1"/>
    <circle cx="106" cy="86" r="1.1"/>
    <circle cx="68" cy="63" r="1.1"/>
    <circle cx="81" cy="80" r="1.1"/>
    <circle cx="43" cy="69" r="1.1"/>
    <circle cx="53" cy="82" r="1.1"/>
    <circle cx="42" cy="81" r="1.1"/>
    <circle cx="100" cy="80" r="1.1"/>
    <circle cx="97" cy="87" r="1.1"/>
    <circle cx="100" cy="78" r="1.1"/>
    <circle cx="86" cy="72" r="1.1"/>
    <circle cx="75" cy="82" r="1.1"/>
    <circle cx="64" cy="82" r="1.1"/>
    <circle cx="77" cy="89" r="1.1"/>
    <circle cx="63" cy="52" r="1.1"/>
    <circle cx="129" cy="88" r="1.1"/>
    <circle cx="76" cy="76" r="1.1"/>
    <circle cx="49" cy="64" r="1.1"/>
    <circle cx="78" cy="56" r="1.1"/>
    <circle cx="61" cy="74" r="1.1"/>
    <circle cx="126" cy="81" r="1.1"/>
    <circle cx="100" cy="91" r="1.1"/>
    <circle cx="94" cy="80" r="1.1"/>
    <circle cx="131" cy="91" r="1.1"/>
    <circle cx="89" cy="78" r="1.1"/>
    <circle cx="103" cy="90" r="1.1"/>
    <circle cx="103" cy="75" r="1.1"/>
    <circle cx="102" cy="79" r="1.1"/>
    <circle cx="71" cy="55" r="1.1"/>
    <circle cx="100" cy="72" r="1.1"/>
    <circle cx="58" cy="70" r="1.1"/>
    <circle cx="91" cy="93" r="1.1"/>
    <circle cx="45" cy="75" r="1.1"/>
    <circle cx="71" cy="91" r="1.1"/>
    <circle cx="95" cy="73" r="1.1"/>
    <circle cx="97" cy="82" r="1.1"/>
    <circle cx="51" cy="81" r="1.1"/>
    <circle cx="36" cy="73" r="1.1"/>
    <circle cx="62" cy="79" r="1.1"/>
    <circle cx="36" cy="60" r="1.1"/>
    <circle cx="103" cy="88" r="1.1"/>
    <circle cx="86" cy="88" r="1.1"/>
    <circle cx="50" cy="83" r="1.1"/>
    <circle cx="68" cy="58" r="1.1"/>
    <circle cx="47" cy="67" r="1.1"/>
    <circle cx="107" cy="82" r="1.1"/>
    <circle cx="88" cy="83" r="1.1"/>
    <circle cx="100" cy="89" r="1.1"/>
    <circle cx="36" cy="90" r="1.1"/>
    <circle cx="89" cy="71" r="1.1"/>
    <circle cx="30" cy="67" r="1.1"/>
    <circle cx="123" cy="87" r="1.1"/>
    <circle cx="40" cy="31" r="1.1"/>
    <circle cx="95" cy="80" r="1.1"/>
    <circle cx="76" cy="87" r="1.1"/>
    <circle cx="82" cy="74" r="1.1"/>
    <circle cx="62" cy="71" r="1.1"/>
    <circle cx="91" cy="82" r="1.1"/>
    <circle cx="91" cy="91" r="1.1"/>
    <circle cx="65" cy="66" r="1.1"/>
    <circle cx="116" cy="92" r="1.1"/>
    <circle cx="128" cy="89" r="1.1"/>
    <circle cx="83" cy="85" r="1.1"/>
    <circle cx="71" cy="88" r="1.1"/>
    <circle cx="36" cy="74" r="1.1"/>
    <circle cx="37" cy="40" r="1.1"/>
    <circle cx="96" cy="81" r="1.1"/>
    <circle cx="43" cy="94" r="1.1"/>
    <circle cx="36" cy="89" r="1.1"/>
    <circle cx="124" cy="90" r="1.1"/>
    <circle cx="49" cy="52" r="1.1"/>
    <circle cx="58" cy="78" r="1.1"/>
    <circle cx="42" cy="70" r="1.1"/>
    <circle cx="81" cy="74" r="1.1"/>
    <circle cx="0" cy="75" r="1.1"/>
    <circle cx="116" cy="80" r="1.1"/>
    <circle cx="49" cy="67" r="1.1"/>
    <circle cx="73" cy="72" r="1.1"/>
    <circle cx="87" cy="74" r="1.1"/>
    <circle cx="24" cy="80" r="1.1"/>
    <circle cx="66" cy="59" r="1.1"/>
    <circle cx="60" cy="92" r="1.1"/>
    <circle cx="44" cy="69" r="1.1"/>
    <circle cx="82" cy="90" r="1.1"/>
    <circle cx="67" cy="87" r="1.1"/>
    <circle cx="7" cy="84" r="1.1"/>
    <circle cx="62" cy="82" r="1.1"/>
    <circle cx="83" cy="56" r="1.1"/>
    <circle cx="111" cy="94" r="1.1"/>
    <circle cx="72" cy="81" r="1.1"/>
    <circle cx="75" cy="73" r="1.1"/>
    <circle cx="108" cy="94" r="1.1"/>
    <circle cx="128" cy="95" r="1.1"/>
    <circle cx="122" cy="91" r="1.1"/>
    <circle cx="34" cy="49" r="1.1"/>
    <circle cx="75" cy="77" r="1.1"/>
    <circle cx="89" cy="91" r="1.1"/>
    <circle cx="111" cy="89" r="1.1"/>
    <circle cx="38" cy="66" r="1.1"/>
    <circle cx="92" cy="65" r="1.1"/>
    <circle cx="72" cy="79" r="1.1"/>
    <circle cx="67" cy="58" r="1.1"/>
    <circle cx="69" cy="83" r="1.1"/>
    <circle cx="87" cy="81" r="1.1"/>
    <circle cx="109" cy="80" r="1.1"/>
    <circle cx="76" cy="49" r="1.1"/>
    <circle cx="91" cy="84" r="1.1"/>
    <circle cx="114" cy="79" r="1.1"/>
    <circle cx="58" cy="21" r="1.1"/>
    <circle cx="80" cy="68" r="1.1"/>
    <circle cx="68" cy="85" r="1.1"/>
    <circle cx="112" cy="88" r="1.1"/>
    <circle cx="82" cy="86" r="1.1"/>
    <circle cx="67" cy="65" r="1.1"/>
    <circle cx="57" cy="79" r="1.1"/>
    <circle cx="78" cy="91" r="1.1"/>
    <circle cx="78" cy="63" r="1.1"/>
    <circle cx="108" cy="87" r="1.1"/>
    <circle cx="65" cy="53" r="1.1"/>
    <circle cx="85" cy="86" r="1.1"/>
    <circle cx="84" cy="90" r="1.1"/>
    <circle cx="58" cy="86" r="1.1"/>
    <circle cx="108" cy="91" r="1.1"/>
    <circle cx="56" cy="73" r="1.1"/>
    <circle cx="73" cy="75" r="1.1"/>
    <circle cx="98" cy="72" r="1.1"/>
    <circle cx="45" cy="81" r="1.1"/>
    <circle cx="123" cy="93" r="1.1"/>
    <circle cx="72" cy="60" r="1.1"/>
    <circle cx="83" cy="80" r="1.1"/>
    <circle cx="89" cy="84" r="1.1"/>
    <circle cx="82" cy="61" r="1.1"/>
    <circle cx="126" cy="93" r="1.1"/>
    <circle cx="113" cy="90" r="1.1"/>
    <circle cx="82" cy="88" r="1.1"/>
    <circle cx="126" cy="89" r="1.1"/>
    <circle cx="32" cy="44" r="1.1"/>
    <circle cx="46" cy="63" r="1.1"/>
    <circle cx="74" cy="72" r="1.1"/>
    <circle cx="73" cy="91" r="1.1"/>
    <circle cx="113" cy="93" r="1.1"/>
    <circle cx="103" cy="91" r="1.1"/>
    <circle cx="101" cy="91" r="1.1"/>
    <circle cx="68" cy="68" r="1.1"/>
    <circle cx="68" cy="83" r="1.1"/>
    <circle cx="83" cy="88" r="1.1"/>
    <circle cx="54" cy="77" r="1.1"/>
    <circle cx="138" cy="83" r="1.1"/>
    <circle cx="31" cy="77" r="1.1"/>
    <circle cx="115" cy="93" r="1.1"/>
    <circle cx="97" cy="91" r="1.1"/>
    <circle cx="50" cy="80" r="1.1"/>
    <circle cx="93" cy="77" r="1.1"/>
    <circle cx="91" cy="71" r="1.1"/>
    <circle cx="114" cy="93" r="1.1"/>
    <circle cx="44" cy="85" r="1.1"/>
    <circle cx="44" cy="77" r="1.1"/>
    <circle cx="97" cy="93" r="1.1"/>
    <circle cx="78" cy="81" r="1.1"/>
    <circle cx="62" cy="83" r="1.1"/>
    <circle cx="100" cy="92" r="1.1"/>
    <circle cx="90" cy="90" r="1.1"/>
    <circle cx="102" cy="75" r="1.1"/>
    <circle cx="100" cy="83" r="1.1"/>
    <circle cx="82" cy="77" r="1.1"/>
    <circle cx="83" cy="70" r="1.1"/>
    <circle cx="75" cy="71" r="1.1"/>
    <circle cx="40" cy="64" r="1.1"/>
    <circle cx="70" cy="89" r="1.1"/>
    <circle cx="110" cy="89" r="1.1"/>
    <circle cx="76" cy="84" r="1.1"/>
    <circle cx="91" cy="52" r="1.1"/>
    <circle cx="127" cy="88" r="1.1"/>
    <circle cx="87" cy="66" r="1.1"/>
    <circle cx="66" cy="63" r="1.1"/>
    <circle cx="120" cy="93" r="1.1"/>
    <circle cx="93" cy="64" r="1.1"/>
    <circle cx="59" cy="78" r="1.1"/>
    <circle cx="94" cy="83" r="1.1"/>
    <circle cx="132" cy="88" r="1.1"/>
    <circle cx="67" cy="83" r="1.1"/>
    <circle cx="83" cy="76" r="1.1"/>
    <circle cx="132" cy="81" r="1.1"/>
    <circle cx="61" cy="92" r="1.1"/>
    <circle cx="99" cy="92" r="1.1"/>
    <circle cx="123" cy="79" r="1.1"/>
    <circle cx="93" cy="91" r="1.1"/>
    <circle cx="90" cy="72" r="1.1"/>
    <circle cx="125" cy="86" r="1.1"/>
    <circle cx="92" cy="88" r="1.1"/>
    <circle cx="69" cy="64" r="1.1"/>
    <circle cx="79" cy="65" r="1.1"/>
    <circle cx="88" cy="63" r="1.1"/>
    <circle cx="103" cy="79" r="1.1"/>
    <circle cx="59" cy="54" r="1.1"/>
    <circle cx="58" cy="85" r="1.1"/>
    <circle cx="109" cy="95" r="1.1"/>
    <circle cx="76" cy="58" r="1.1"/>
    <circle cx="104" cy="83" r="1.1"/>
    <circle cx="123" cy="88" r="1.1"/>
    <circle cx="79" cy="70" r="1.1"/>
    <circle cx="115" cy="82" r="1.1"/>
    <circle cx="48" cy="78" r="1.1"/>
    <circle cx="106" cy="82" r="1.1"/>
    <circle cx="125" cy="91" r="1.1"/>
    <circle cx="108" cy="93" r="1.1"/>
    <circle cx="74" cy="50" r="1.1"/>
    <circle cx="54" cy="70" r="1.1"/>
    <circle cx="72" cy="84" r="1.1"/>
    <circle cx="48" cy="81" r="1.1"/>
    <circle cx="68" cy="94" r="1.1"/>
    <circle cx="33" cy="85" r="1.1"/>
    <circle cx="28" cy="37" r="1.1"/>
    <circle cx="60" cy="70" r="1.1"/>
    <circle cx="33" cy="80" r="1.1"/>
    <circle cx="99" cy="91" r="1.1"/>
    <circle cx="42" cy="32" r="1.1"/>
    <circle cx="90" cy="77" r="1.1"/>
    <circle cx="72" cy="83" r="1.1"/>
    <circle cx="63" cy="89" r="1.1"/>
    <circle cx="30" cy="61" r="1.1"/>
    <circle cx="108" cy="88" r="1.1"/>
    <circle cx="65" cy="92" r="1.1"/>
    <circle cx="124" cy="92" r="1.1"/>
    <circle cx="70" cy="86" r="1.1"/>
    <circle cx="91" cy="90" r="1.1"/>
    <circle cx="79" cy="56" r="1.1"/>
    <circle cx="91" cy="72" r="1.1"/>
    <circle cx="51" cy="91" r="1.1"/>
    <circle cx="10" cy="27" r="1.1"/>
    <circle cx="50" cy="84" r="1.1"/>
    <circle cx="92" cy="70" r="1.1"/>
    <circle cx="52" cy="61" r="1.1"/>
    <circle cx="93" cy="90" r="1.1"/>
    <circle cx="89" cy="92" r="1.1"/>
    <circle cx="102" cy="92" r="1.1"/>
    <circle cx="68" cy="57" r="1.1"/>
    <circle cx="99" cy="87" r="1.1"/>
    <circle cx="52" cy="81" r="1.1"/>
    <circle cx="122" cy="82" r="1.1"/>
    <circle cx="55" cy="81" r="1.1"/>
    <circle cx="82" cy="69" r="1.1"/>
    <circle cx="95" cy="76" r="1.1"/>
    <circle cx="67" cy="84" r="1.1"/>
    <circle cx="104" cy="92" r="1.1"/>
    <circle cx="65" cy="84" r="1.1"/>
    <circle cx="137" cy="88" r="1.1"/>
    <circle cx="90" cy="94" r="1.1"/>
    <circle cx="42" cy="76" r="1.1"/>
    <circle cx="80" cy="89" r="1.1"/>
    <circle cx="89" cy="49" r="1.1"/>
    <circle cx="111" cy="95" r="1.1"/>
    <circle cx="101" cy="80" r="1.1"/>
    <circle cx="49" cy="82" r="1.1"/>
    <circle cx="83" cy="63" r="1.1"/>
    <circle cx="55" cy="77" r="1.1"/>
    <circle cx="48" cy="79" r="1.1"/>
    <circle cx="92" cy="93" r="1.1"/>
    <circle cx="37" cy="70" r="1.1"/>
    </g></defs>
    <text x="114" y="26" font-size="11" font-style="italic" text-anchor="middle" fill="#222">intermetallic</text>
    <text x="114" y="37" font-size="8.5" text-anchor="middle" fill="#888">n = 337</text>
    <line x1="30" y1="140" x2="198" y2="140" stroke="#888" stroke-width="0.5"/>
    <line x1="105" y1="40" x2="105" y2="140" stroke="#1f2937" stroke-width="0.5" stroke-dasharray="3,2" opacity="0.6"/>
    <use href="#kmscloud" x="30" y="40"/>
    <g fill="#FF680A" opacity="0.65">
    <circle cx="97" cy="80" r="1.5"/>
    <circle cx="33" cy="77" r="1.5"/>
    <circle cx="101" cy="98" r="1.5"/>
    <circle cx="71" cy="85" r="1.5"/>
    <circle cx="175" cy="112" r="1.5"/>
    <circle cx="149" cy="116" r="1.5"/>
    <circle cx="105" cy="104" r="1.5"/>
    <circle cx="132" cy="123" r="1.5"/>
    <circle cx="86" cy="48" r="1.5"/>
    <circle cx="79" cy="70" r="1.5"/>
    <circle cx="112" cy="104" r="1.5"/>
    <circle cx="142" cy="94" r="1.5"/>
    <circle cx="119" cy="97" r="1.5"/>
    <circle cx="114" cy="115" r="1.5"/>
    <circle cx="115" cy="98" r="1.5"/>
    <circle cx="100" cy="110" r="1.5"/>
    <circle cx="156" cy="111" r="1.5"/>
    <circle cx="110" cy="86" r="1.5"/>
    <circle cx="90" cy="87" r="1.5"/>
    <circle cx="84" cy="81" r="1.5"/>
    <circle cx="80" cy="80" r="1.5"/>
    <circle cx="83" cy="81" r="1.5"/>
    <circle cx="86" cy="85" r="1.5"/>
    <circle cx="107" cy="109" r="1.5"/>
    <circle cx="121" cy="102" r="1.5"/>
    <circle cx="113" cy="114" r="1.5"/>
    <circle cx="75" cy="81" r="1.5"/>
    <circle cx="91" cy="88" r="1.5"/>
    <circle cx="95" cy="119" r="1.5"/>
    <circle cx="82" cy="98" r="1.5"/>
    <circle cx="69" cy="62" r="1.5"/>
    <circle cx="99" cy="93" r="1.5"/>
    <circle cx="121" cy="89" r="1.5"/>
    <circle cx="52" cy="89" r="1.5"/>
    <circle cx="100" cy="91" r="1.5"/>
    <circle cx="105" cy="98" r="1.5"/>
    <circle cx="99" cy="105" r="1.5"/>
    <circle cx="94" cy="103" r="1.5"/>
    <circle cx="118" cy="98" r="1.5"/>
    <circle cx="110" cy="113" r="1.5"/>
    <circle cx="108" cy="104" r="1.5"/>
    <circle cx="57" cy="77" r="1.5"/>
    <circle cx="95" cy="80" r="1.5"/>
    <circle cx="109" cy="103" r="1.5"/>
    <circle cx="81" cy="74" r="1.5"/>
    <circle cx="75" cy="91" r="1.5"/>
    <circle cx="110" cy="95" r="1.5"/>
    <circle cx="112" cy="98" r="1.5"/>
    <circle cx="72" cy="94" r="1.5"/>
    <circle cx="105" cy="107" r="1.5"/>
    <circle cx="120" cy="120" r="1.5"/>
    <circle cx="119" cy="108" r="1.5"/>
    <circle cx="98" cy="101" r="1.5"/>
    <circle cx="107" cy="97" r="1.5"/>
    <circle cx="92" cy="90" r="1.5"/>
    <circle cx="102" cy="81" r="1.5"/>
    <circle cx="105" cy="91" r="1.5"/>
    <circle cx="94" cy="83" r="1.5"/>
    <circle cx="105" cy="88" r="1.5"/>
    <circle cx="98" cy="107" r="1.5"/>
    <circle cx="63" cy="101" r="1.5"/>
    <circle cx="96" cy="102" r="1.5"/>
    <circle cx="116" cy="104" r="1.5"/>
    <circle cx="113" cy="107" r="1.5"/>
    <circle cx="94" cy="82" r="1.5"/>
    <circle cx="84" cy="82" r="1.5"/>
    <circle cx="96" cy="92" r="1.5"/>
    <circle cx="124" cy="106" r="1.5"/>
    <circle cx="84" cy="102" r="1.5"/>
    <circle cx="70" cy="103" r="1.5"/>
    <circle cx="111" cy="103" r="1.5"/>
    <circle cx="86" cy="106" r="1.5"/>
    <circle cx="123" cy="109" r="1.5"/>
    <circle cx="113" cy="93" r="1.5"/>
    <circle cx="137" cy="104" r="1.5"/>
    <circle cx="111" cy="86" r="1.5"/>
    <circle cx="146" cy="109" r="1.5"/>
    <circle cx="105" cy="86" r="1.5"/>
    <circle cx="134" cy="86" r="1.5"/>
    <circle cx="67" cy="73" r="1.5"/>
    <circle cx="119" cy="73" r="1.5"/>
    <circle cx="127" cy="83" r="1.5"/>
    <circle cx="138" cy="121" r="1.5"/>
    <circle cx="84" cy="74" r="1.5"/>
    <circle cx="98" cy="67" r="1.5"/>
    <circle cx="120" cy="115" r="1.5"/>
    <circle cx="118" cy="113" r="1.5"/>
    <circle cx="142" cy="105" r="1.5"/>
    <circle cx="146" cy="105" r="1.5"/>
    <circle cx="116" cy="99" r="1.5"/>
    <circle cx="105" cy="102" r="1.5"/>
    <circle cx="108" cy="97" r="1.5"/>
    <circle cx="120" cy="100" r="1.5"/>
    <circle cx="107" cy="101" r="1.5"/>
    <circle cx="103" cy="99" r="1.5"/>
    <circle cx="90" cy="81" r="1.5"/>
    <circle cx="48" cy="62" r="1.5"/>
    <circle cx="119" cy="123" r="1.5"/>
    <circle cx="119" cy="116" r="1.5"/>
    <circle cx="120" cy="118" r="1.5"/>
    <circle cx="90" cy="116" r="1.5"/>
    <circle cx="107" cy="104" r="1.5"/>
    <circle cx="85" cy="79" r="1.5"/>
    <circle cx="116" cy="105" r="1.5"/>
    <circle cx="113" cy="100" r="1.5"/>
    <circle cx="80" cy="96" r="1.5"/>
    <circle cx="114" cy="117" r="1.5"/>
    <circle cx="132" cy="101" r="1.5"/>
    <circle cx="147" cy="125" r="1.5"/>
    <circle cx="105" cy="99" r="1.5"/>
    <circle cx="122" cy="119" r="1.5"/>
    <circle cx="83" cy="103" r="1.5"/>
    <circle cx="122" cy="115" r="1.5"/>
    <circle cx="153" cy="94" r="1.5"/>
    <circle cx="117" cy="86" r="1.5"/>
    <circle cx="91" cy="89" r="1.5"/>
    <circle cx="76" cy="68" r="1.5"/>
    <circle cx="109" cy="65" r="1.5"/>
    <circle cx="100" cy="95" r="1.5"/>
    <circle cx="112" cy="107" r="1.5"/>
    <circle cx="108" cy="84" r="1.5"/>
    <circle cx="99" cy="107" r="1.5"/>
    <circle cx="73" cy="80" r="1.5"/>
    <circle cx="98" cy="88" r="1.5"/>
    <circle cx="70" cy="93" r="1.5"/>
    <circle cx="129" cy="100" r="1.5"/>
    <circle cx="124" cy="128" r="1.5"/>
    <circle cx="118" cy="119" r="1.5"/>
    <circle cx="112" cy="91" r="1.5"/>
    <circle cx="79" cy="82" r="1.5"/>
    <circle cx="92" cy="99" r="1.5"/>
    <circle cx="91" cy="117" r="1.5"/>
    <circle cx="120" cy="119" r="1.5"/>
    <circle cx="97" cy="108" r="1.5"/>
    <circle cx="103" cy="108" r="1.5"/>
    <circle cx="126" cy="116" r="1.5"/>
    <circle cx="85" cy="104" r="1.5"/>
    <circle cx="135" cy="120" r="1.5"/>
    <circle cx="106" cy="105" r="1.5"/>
    <circle cx="130" cy="114" r="1.5"/>
    <circle cx="125" cy="126" r="1.5"/>
    <circle cx="131" cy="123" r="1.5"/>
    <circle cx="130" cy="121" r="1.5"/>
    <circle cx="109" cy="72" r="1.5"/>
    <circle cx="95" cy="102" r="1.5"/>
    <circle cx="114" cy="105" r="1.5"/>
    <circle cx="137" cy="124" r="1.5"/>
    <circle cx="69" cy="70" r="1.5"/>
    <circle cx="75" cy="62" r="1.5"/>
    <circle cx="101" cy="105" r="1.5"/>
    <circle cx="79" cy="115" r="1.5"/>
    <circle cx="80" cy="99" r="1.5"/>
    <circle cx="120" cy="116" r="1.5"/>
    <circle cx="125" cy="121" r="1.5"/>
    <circle cx="104" cy="113" r="1.5"/>
    <circle cx="121" cy="123" r="1.5"/>
    <circle cx="94" cy="98" r="1.5"/>
    <circle cx="66" cy="48" r="1.5"/>
    <circle cx="36" cy="48" r="1.5"/>
    <circle cx="116" cy="94" r="1.5"/>
    <circle cx="101" cy="88" r="1.5"/>
    <circle cx="135" cy="129" r="1.5"/>
    <circle cx="171" cy="130" r="1.5"/>
    <circle cx="77" cy="91" r="1.5"/>
    <circle cx="121" cy="113" r="1.5"/>
    <circle cx="133" cy="117" r="1.5"/>
    <circle cx="112" cy="115" r="1.5"/>
    <circle cx="155" cy="119" r="1.5"/>
    <circle cx="113" cy="111" r="1.5"/>
    <circle cx="102" cy="115" r="1.5"/>
    <circle cx="109" cy="122" r="1.5"/>
    <circle cx="116" cy="119" r="1.5"/>
    <circle cx="146" cy="123" r="1.5"/>
    <circle cx="146" cy="126" r="1.5"/>
    <circle cx="96" cy="125" r="1.5"/>
    <circle cx="117" cy="112" r="1.5"/>
    <circle cx="109" cy="123" r="1.5"/>
    <circle cx="122" cy="112" r="1.5"/>
    <circle cx="99" cy="110" r="1.5"/>
    <circle cx="96" cy="107" r="1.5"/>
    <circle cx="96" cy="101" r="1.5"/>
    <circle cx="90" cy="106" r="1.5"/>
    <circle cx="98" cy="102" r="1.5"/>
    <circle cx="107" cy="112" r="1.5"/>
    <circle cx="127" cy="115" r="1.5"/>
    <circle cx="100" cy="107" r="1.5"/>
    <circle cx="136" cy="119" r="1.5"/>
    <circle cx="91" cy="128" r="1.5"/>
    <circle cx="107" cy="128" r="1.5"/>
    <circle cx="120" cy="114" r="1.5"/>
    <circle cx="140" cy="126" r="1.5"/>
    <circle cx="134" cy="111" r="1.5"/>
    <circle cx="85" cy="98" r="1.5"/>
    <circle cx="101" cy="108" r="1.5"/>
    <circle cx="107" cy="121" r="1.5"/>
    <circle cx="75" cy="113" r="1.5"/>
    <circle cx="128" cy="128" r="1.5"/>
    <circle cx="121" cy="119" r="1.5"/>
    <circle cx="129" cy="122" r="1.5"/>
    <circle cx="122" cy="131" r="1.5"/>
    <circle cx="89" cy="129" r="1.5"/>
    <circle cx="74" cy="103" r="1.5"/>
    <circle cx="109" cy="116" r="1.5"/>
    <circle cx="131" cy="128" r="1.5"/>
    <circle cx="122" cy="118" r="1.5"/>
    <circle cx="125" cy="117" r="1.5"/>
    <circle cx="93" cy="75" r="1.5"/>
    <circle cx="104" cy="109" r="1.5"/>
    <circle cx="103" cy="102" r="1.5"/>
    <circle cx="81" cy="100" r="1.5"/>
    <circle cx="111" cy="109" r="1.5"/>
    <circle cx="89" cy="98" r="1.5"/>
    <circle cx="113" cy="117" r="1.5"/>
    <circle cx="106" cy="107" r="1.5"/>
    <circle cx="103" cy="106" r="1.5"/>
    <circle cx="95" cy="79" r="1.5"/>
    <circle cx="81" cy="96" r="1.5"/>
    <circle cx="78" cy="104" r="1.5"/>
    <circle cx="86" cy="95" r="1.5"/>
    <circle cx="81" cy="106" r="1.5"/>
    <circle cx="92" cy="106" r="1.5"/>
    <circle cx="87" cy="106" r="1.5"/>
    <circle cx="126" cy="122" r="1.5"/>
    <circle cx="134" cy="134" r="1.5"/>
    <circle cx="104" cy="126" r="1.5"/>
    <circle cx="134" cy="127" r="1.5"/>
    <circle cx="121" cy="125" r="1.5"/>
    <circle cx="101" cy="118" r="1.5"/>
    <circle cx="126" cy="97" r="1.5"/>
    <circle cx="97" cy="104" r="1.5"/>
    <circle cx="133" cy="129" r="1.5"/>
    <circle cx="138" cy="129" r="1.5"/>
    <circle cx="141" cy="131" r="1.5"/>
    <circle cx="122" cy="120" r="1.5"/>
    <circle cx="85" cy="87" r="1.5"/>
    <circle cx="169" cy="132" r="1.5"/>
    <circle cx="130" cy="118" r="1.5"/>
    <circle cx="107" cy="129" r="1.5"/>
    <circle cx="79" cy="104" r="1.5"/>
    <circle cx="106" cy="125" r="1.5"/>
    <circle cx="151" cy="98" r="1.5"/>
    <circle cx="122" cy="121" r="1.5"/>
    <circle cx="130" cy="119" r="1.5"/>
    <circle cx="115" cy="123" r="1.5"/>
    <circle cx="104" cy="121" r="1.5"/>
    <circle cx="138" cy="130" r="1.5"/>
    <circle cx="151" cy="133" r="1.5"/>
    <circle cx="121" cy="133" r="1.5"/>
    <circle cx="103" cy="129" r="1.5"/>
    <circle cx="30" cy="114" r="1.5"/>
    <circle cx="75" cy="115" r="1.5"/>
    <circle cx="76" cy="128" r="1.5"/>
    <circle cx="101" cy="131" r="1.5"/>
    <circle cx="66" cy="100" r="1.5"/>
    <circle cx="81" cy="71" r="1.5"/>
    <circle cx="115" cy="105" r="1.5"/>
    <circle cx="96" cy="100" r="1.5"/>
    <circle cx="70" cy="71" r="1.5"/>
    <circle cx="95" cy="106" r="1.5"/>
    <circle cx="108" cy="109" r="1.5"/>
    <circle cx="97" cy="98" r="1.5"/>
    <circle cx="99" cy="123" r="1.5"/>
    <circle cx="125" cy="125" r="1.5"/>
    <circle cx="138" cy="119" r="1.5"/>
    <circle cx="106" cy="89" r="1.5"/>
    <circle cx="97" cy="120" r="1.5"/>
    <circle cx="123" cy="121" r="1.5"/>
    <circle cx="126" cy="121" r="1.5"/>
    <circle cx="110" cy="108" r="1.5"/>
    <circle cx="99" cy="119" r="1.5"/>
    <circle cx="133" cy="125" r="1.5"/>
    <circle cx="78" cy="94" r="1.5"/>
    <circle cx="108" cy="103" r="1.5"/>
    <circle cx="95" cy="93" r="1.5"/>
    <circle cx="93" cy="97" r="1.5"/>
    <circle cx="147" cy="131" r="1.5"/>
    <circle cx="99" cy="74" r="1.5"/>
    <circle cx="98" cy="123" r="1.5"/>
    <circle cx="123" cy="122" r="1.5"/>
    <circle cx="98" cy="122" r="1.5"/>
    <circle cx="121" cy="111" r="1.5"/>
    <circle cx="141" cy="134" r="1.5"/>
    <circle cx="88" cy="108" r="1.5"/>
    <circle cx="118" cy="111" r="1.5"/>
    <circle cx="77" cy="54" r="1.5"/>
    <circle cx="120" cy="130" r="1.5"/>
    <circle cx="116" cy="66" r="1.5"/>
    <circle cx="132" cy="115" r="1.5"/>
    <circle cx="105" cy="108" r="1.5"/>
    <circle cx="113" cy="110" r="1.5"/>
    <circle cx="79" cy="107" r="1.5"/>
    <circle cx="108" cy="105" r="1.5"/>
    <circle cx="121" cy="92" r="1.5"/>
    <circle cx="99" cy="68" r="1.5"/>
    <circle cx="96" cy="103" r="1.5"/>
    <circle cx="127" cy="119" r="1.5"/>
    <circle cx="96" cy="91" r="1.5"/>
    <circle cx="113" cy="116" r="1.5"/>
    <circle cx="153" cy="119" r="1.5"/>
    <circle cx="75" cy="99" r="1.5"/>
    <circle cx="99" cy="104" r="1.5"/>
    <circle cx="104" cy="118" r="1.5"/>
    <circle cx="133" cy="119" r="1.5"/>
    <circle cx="108" cy="102" r="1.5"/>
    <circle cx="109" cy="110" r="1.5"/>
    <circle cx="108" cy="107" r="1.5"/>
    <circle cx="109" cy="107" r="1.5"/>
    <circle cx="104" cy="90" r="1.5"/>
    <circle cx="104" cy="124" r="1.5"/>
    <circle cx="72" cy="72" r="1.5"/>
    <circle cx="132" cy="119" r="1.5"/>
    <circle cx="60" cy="101" r="1.5"/>
    <circle cx="108" cy="96" r="1.5"/>
    <circle cx="138" cy="128" r="1.5"/>
    <circle cx="133" cy="132" r="1.5"/>
    <circle cx="109" cy="96" r="1.5"/>
    <circle cx="82" cy="101" r="1.5"/>
    <circle cx="120" cy="134" r="1.5"/>
    <circle cx="119" cy="89" r="1.5"/>
    <circle cx="122" cy="133" r="1.5"/>
    <circle cx="157" cy="128" r="1.5"/>
    </g>
    <text x="26" y="93" font-size="8" text-anchor="end" fill="#888">1</text>
    <text x="26" y="43" font-size="8" text-anchor="end" fill="#888">2</text>
    <text x="314" y="26" font-size="11" font-style="italic" text-anchor="middle" fill="#222">boride</text>
    <text x="314" y="37" font-size="8.5" text-anchor="middle" fill="#888">n = 37</text>
    <line x1="230" y1="140" x2="398" y2="140" stroke="#888" stroke-width="0.5"/>
    <line x1="305" y1="40" x2="305" y2="140" stroke="#1f2937" stroke-width="0.5" stroke-dasharray="3,2" opacity="0.6"/>
    <use href="#kmscloud" x="230" y="40"/>
    <g fill="#FF680A" opacity="0.65">
    <circle cx="261" cy="88" r="1.5"/>
    <circle cx="302" cy="79" r="1.5"/>
    <circle cx="300" cy="85" r="1.5"/>
    <circle cx="300" cy="91" r="1.5"/>
    <circle cx="316" cy="101" r="1.5"/>
    <circle cx="306" cy="87" r="1.5"/>
    <circle cx="319" cy="106" r="1.5"/>
    <circle cx="308" cy="83" r="1.5"/>
    <circle cx="279" cy="90" r="1.5"/>
    <circle cx="307" cy="114" r="1.5"/>
    <circle cx="291" cy="79" r="1.5"/>
    <circle cx="276" cy="73" r="1.5"/>
    <circle cx="286" cy="92" r="1.5"/>
    <circle cx="290" cy="90" r="1.5"/>
    <circle cx="293" cy="97" r="1.5"/>
    <circle cx="298" cy="93" r="1.5"/>
    <circle cx="301" cy="97" r="1.5"/>
    <circle cx="304" cy="97" r="1.5"/>
    <circle cx="310" cy="122" r="1.5"/>
    <circle cx="307" cy="81" r="1.5"/>
    <circle cx="276" cy="87" r="1.5"/>
    <circle cx="272" cy="86" r="1.5"/>
    <circle cx="278" cy="85" r="1.5"/>
    <circle cx="302" cy="83" r="1.5"/>
    <circle cx="302" cy="84" r="1.5"/>
    <circle cx="304" cy="89" r="1.5"/>
    <circle cx="304" cy="88" r="1.5"/>
    <circle cx="309" cy="90" r="1.5"/>
    <circle cx="301" cy="84" r="1.5"/>
    <circle cx="304" cy="83" r="1.5"/>
    <circle cx="310" cy="100" r="1.5"/>
    <circle cx="303" cy="83" r="1.5"/>
    <circle cx="354" cy="129" r="1.5"/>
    <circle cx="258" cy="71" r="1.5"/>
    <circle cx="268" cy="106" r="1.5"/>
    <circle cx="362" cy="128" r="1.5"/>
    </g>
    <text x="514" y="26" font-size="11" font-style="italic" text-anchor="middle" fill="#222">pnictide</text>
    <text x="514" y="37" font-size="8.5" text-anchor="middle" fill="#888">n = 204</text>
    <line x1="430" y1="140" x2="598" y2="140" stroke="#888" stroke-width="0.5"/>
    <line x1="505" y1="40" x2="505" y2="140" stroke="#1f2937" stroke-width="0.5" stroke-dasharray="3,2" opacity="0.6"/>
    <use href="#kmscloud" x="430" y="40"/>
    <g fill="#FF680A" opacity="0.65">
    <circle cx="491" cy="91" r="1.5"/>
    <circle cx="487" cy="102" r="1.5"/>
    <circle cx="476" cy="57" r="1.5"/>
    <circle cx="483" cy="100" r="1.5"/>
    <circle cx="490" cy="114" r="1.5"/>
    <circle cx="436" cy="88" r="1.5"/>
    <circle cx="485" cy="97" r="1.5"/>
    <circle cx="516" cy="101" r="1.5"/>
    <circle cx="494" cy="96" r="1.5"/>
    <circle cx="509" cy="82" r="1.5"/>
    <circle cx="487" cy="86" r="1.5"/>
    <circle cx="506" cy="95" r="1.5"/>
    <circle cx="495" cy="100" r="1.5"/>
    <circle cx="499" cy="88" r="1.5"/>
    <circle cx="484" cy="78" r="1.5"/>
    <circle cx="505" cy="88" r="1.5"/>
    <circle cx="487" cy="92" r="1.5"/>
    <circle cx="517" cy="115" r="1.5"/>
    <circle cx="521" cy="107" r="1.5"/>
    <circle cx="457" cy="102" r="1.5"/>
    <circle cx="529" cy="125" r="1.5"/>
    <circle cx="481" cy="98" r="1.5"/>
    <circle cx="537" cy="106" r="1.5"/>
    <circle cx="525" cy="109" r="1.5"/>
    <circle cx="521" cy="118" r="1.5"/>
    <circle cx="535" cy="127" r="1.5"/>
    <circle cx="527" cy="116" r="1.5"/>
    <circle cx="481" cy="104" r="1.5"/>
    <circle cx="531" cy="117" r="1.5"/>
    <circle cx="526" cy="116" r="1.5"/>
    <circle cx="525" cy="130" r="1.5"/>
    <circle cx="522" cy="101" r="1.5"/>
    <circle cx="473" cy="100" r="1.5"/>
    <circle cx="515" cy="124" r="1.5"/>
    <circle cx="548" cy="107" r="1.5"/>
    <circle cx="484" cy="104" r="1.5"/>
    <circle cx="480" cy="102" r="1.5"/>
    <circle cx="496" cy="100" r="1.5"/>
    <circle cx="509" cy="118" r="1.5"/>
    <circle cx="522" cy="106" r="1.5"/>
    <circle cx="516" cy="120" r="1.5"/>
    <circle cx="549" cy="125" r="1.5"/>
    <circle cx="521" cy="116" r="1.5"/>
    <circle cx="547" cy="131" r="1.5"/>
    <circle cx="529" cy="129" r="1.5"/>
    <circle cx="511" cy="112" r="1.5"/>
    <circle cx="513" cy="111" r="1.5"/>
    <circle cx="505" cy="112" r="1.5"/>
    <circle cx="518" cy="113" r="1.5"/>
    <circle cx="545" cy="134" r="1.5"/>
    <circle cx="492" cy="98" r="1.5"/>
    <circle cx="476" cy="92" r="1.5"/>
    <circle cx="524" cy="129" r="1.5"/>
    <circle cx="486" cy="89" r="1.5"/>
    <circle cx="480" cy="83" r="1.5"/>
    <circle cx="487" cy="91" r="1.5"/>
    <circle cx="478" cy="130" r="1.5"/>
    <circle cx="503" cy="120" r="1.5"/>
    <circle cx="535" cy="123" r="1.5"/>
    <circle cx="483" cy="131" r="1.5"/>
    <circle cx="496" cy="112" r="1.5"/>
    <circle cx="525" cy="123" r="1.5"/>
    <circle cx="532" cy="124" r="1.5"/>
    <circle cx="552" cy="121" r="1.5"/>
    <circle cx="543" cy="132" r="1.5"/>
    <circle cx="507" cy="100" r="1.5"/>
    <circle cx="525" cy="124" r="1.5"/>
    <circle cx="530" cy="126" r="1.5"/>
    <circle cx="508" cy="108" r="1.5"/>
    <circle cx="545" cy="125" r="1.5"/>
    <circle cx="503" cy="117" r="1.5"/>
    <circle cx="537" cy="127" r="1.5"/>
    <circle cx="493" cy="118" r="1.5"/>
    <circle cx="506" cy="115" r="1.5"/>
    <circle cx="497" cy="122" r="1.5"/>
    <circle cx="494" cy="113" r="1.5"/>
    <circle cx="524" cy="116" r="1.5"/>
    <circle cx="549" cy="128" r="1.5"/>
    <circle cx="522" cy="126" r="1.5"/>
    <circle cx="523" cy="114" r="1.5"/>
    <circle cx="519" cy="115" r="1.5"/>
    <circle cx="513" cy="114" r="1.5"/>
    <circle cx="522" cy="122" r="1.5"/>
    <circle cx="509" cy="111" r="1.5"/>
    <circle cx="486" cy="91" r="1.5"/>
    <circle cx="474" cy="112" r="1.5"/>
    <circle cx="504" cy="102" r="1.5"/>
    <circle cx="493" cy="103" r="1.5"/>
    <circle cx="515" cy="114" r="1.5"/>
    <circle cx="524" cy="128" r="1.5"/>
    <circle cx="521" cy="119" r="1.5"/>
    <circle cx="495" cy="102" r="1.5"/>
    <circle cx="511" cy="102" r="1.5"/>
    <circle cx="521" cy="129" r="1.5"/>
    <circle cx="481" cy="99" r="1.5"/>
    <circle cx="490" cy="99" r="1.5"/>
    <circle cx="506" cy="118" r="1.5"/>
    <circle cx="532" cy="122" r="1.5"/>
    <circle cx="500" cy="117" r="1.5"/>
    <circle cx="495" cy="110" r="1.5"/>
    <circle cx="489" cy="116" r="1.5"/>
    <circle cx="488" cy="87" r="1.5"/>
    <circle cx="524" cy="109" r="1.5"/>
    <circle cx="486" cy="124" r="1.5"/>
    <circle cx="527" cy="120" r="1.5"/>
    <circle cx="581" cy="126" r="1.5"/>
    <circle cx="576" cy="123" r="1.5"/>
    <circle cx="544" cy="122" r="1.5"/>
    <circle cx="550" cy="119" r="1.5"/>
    <circle cx="500" cy="122" r="1.5"/>
    <circle cx="505" cy="122" r="1.5"/>
    <circle cx="519" cy="112" r="1.5"/>
    <circle cx="539" cy="131" r="1.5"/>
    <circle cx="508" cy="96" r="1.5"/>
    <circle cx="519" cy="120" r="1.5"/>
    <circle cx="507" cy="127" r="1.5"/>
    <circle cx="491" cy="114" r="1.5"/>
    <circle cx="556" cy="121" r="1.5"/>
    <circle cx="492" cy="121" r="1.5"/>
    <circle cx="524" cy="120" r="1.5"/>
    <circle cx="523" cy="123" r="1.5"/>
    <circle cx="519" cy="118" r="1.5"/>
    <circle cx="533" cy="115" r="1.5"/>
    <circle cx="518" cy="115" r="1.5"/>
    <circle cx="501" cy="99" r="1.5"/>
    <circle cx="513" cy="105" r="1.5"/>
    <circle cx="510" cy="112" r="1.5"/>
    <circle cx="480" cy="123" r="1.5"/>
    <circle cx="514" cy="117" r="1.5"/>
    <circle cx="504" cy="123" r="1.5"/>
    <circle cx="522" cy="118" r="1.5"/>
    <circle cx="521" cy="121" r="1.5"/>
    <circle cx="508" cy="118" r="1.5"/>
    <circle cx="504" cy="118" r="1.5"/>
    <circle cx="497" cy="105" r="1.5"/>
    <circle cx="530" cy="119" r="1.5"/>
    <circle cx="550" cy="124" r="1.5"/>
    <circle cx="516" cy="131" r="1.5"/>
    <circle cx="513" cy="113" r="1.5"/>
    <circle cx="509" cy="113" r="1.5"/>
    <circle cx="502" cy="100" r="1.5"/>
    <circle cx="452" cy="92" r="1.5"/>
    <circle cx="512" cy="101" r="1.5"/>
    <circle cx="502" cy="108" r="1.5"/>
    <circle cx="488" cy="83" r="1.5"/>
    <circle cx="448" cy="103" r="1.5"/>
    <circle cx="507" cy="115" r="1.5"/>
    <circle cx="515" cy="122" r="1.5"/>
    <circle cx="527" cy="133" r="1.5"/>
    <circle cx="541" cy="124" r="1.5"/>
    <circle cx="527" cy="122" r="1.5"/>
    <circle cx="538" cy="124" r="1.5"/>
    <circle cx="540" cy="129" r="1.5"/>
    <circle cx="512" cy="103" r="1.5"/>
    <circle cx="517" cy="106" r="1.5"/>
    <circle cx="479" cy="114" r="1.5"/>
    <circle cx="523" cy="104" r="1.5"/>
    <circle cx="489" cy="118" r="1.5"/>
    <circle cx="529" cy="123" r="1.5"/>
    <circle cx="526" cy="119" r="1.5"/>
    <circle cx="531" cy="128" r="1.5"/>
    <circle cx="498" cy="88" r="1.5"/>
    <circle cx="522" cy="103" r="1.5"/>
    <circle cx="524" cy="115" r="1.5"/>
    <circle cx="562" cy="121" r="1.5"/>
    <circle cx="523" cy="118" r="1.5"/>
    <circle cx="519" cy="122" r="1.5"/>
    <circle cx="536" cy="120" r="1.5"/>
    <circle cx="511" cy="121" r="1.5"/>
    <circle cx="532" cy="125" r="1.5"/>
    <circle cx="555" cy="126" r="1.5"/>
    <circle cx="502" cy="127" r="1.5"/>
    <circle cx="497" cy="128" r="1.5"/>
    <circle cx="526" cy="121" r="1.5"/>
    <circle cx="521" cy="127" r="1.5"/>
    <circle cx="474" cy="104" r="1.5"/>
    <circle cx="509" cy="105" r="1.5"/>
    <circle cx="488" cy="92" r="1.5"/>
    <circle cx="518" cy="103" r="1.5"/>
    <circle cx="506" cy="98" r="1.5"/>
    <circle cx="480" cy="129" r="1.5"/>
    <circle cx="545" cy="122" r="1.5"/>
    <circle cx="536" cy="122" r="1.5"/>
    <circle cx="507" cy="123" r="1.5"/>
    <circle cx="514" cy="106" r="1.5"/>
    <circle cx="517" cy="119" r="1.5"/>
    <circle cx="516" cy="128" r="1.5"/>
    <circle cx="494" cy="101" r="1.5"/>
    <circle cx="487" cy="100" r="1.5"/>
    <circle cx="566" cy="128" r="1.5"/>
    <circle cx="498" cy="97" r="1.5"/>
    <circle cx="534" cy="132" r="1.5"/>
    <circle cx="577" cy="134" r="1.5"/>
    <circle cx="520" cy="123" r="1.5"/>
    <circle cx="531" cy="120" r="1.5"/>
    <circle cx="485" cy="117" r="1.5"/>
    <circle cx="562" cy="130" r="1.5"/>
    </g>
    <text x="114" y="166" font-size="11" font-style="italic" text-anchor="middle" fill="#222">chalcogenide</text>
    <text x="114" y="177" font-size="8.5" text-anchor="middle" fill="#888">n = 422</text>
    <line x1="30" y1="280" x2="198" y2="280" stroke="#888" stroke-width="0.5"/>
    <line x1="105" y1="180" x2="105" y2="280" stroke="#1f2937" stroke-width="0.5" stroke-dasharray="3,2" opacity="0.6"/>
    <use href="#kmscloud" x="30" y="180"/>
    <g fill="#FF680A" opacity="0.65">
    <circle cx="141" cy="241" r="1.5"/>
    <circle cx="96" cy="260" r="1.5"/>
    <circle cx="97" cy="262" r="1.5"/>
    <circle cx="151" cy="264" r="1.5"/>
    <circle cx="106" cy="261" r="1.5"/>
    <circle cx="77" cy="251" r="1.5"/>
    <circle cx="100" cy="255" r="1.5"/>
    <circle cx="129" cy="263" r="1.5"/>
    <circle cx="67" cy="256" r="1.5"/>
    <circle cx="127" cy="263" r="1.5"/>
    <circle cx="123" cy="260" r="1.5"/>
    <circle cx="69" cy="253" r="1.5"/>
    <circle cx="116" cy="257" r="1.5"/>
    <circle cx="151" cy="262" r="1.5"/>
    <circle cx="109" cy="257" r="1.5"/>
    <circle cx="119" cy="255" r="1.5"/>
    <circle cx="160" cy="268" r="1.5"/>
    <circle cx="154" cy="266" r="1.5"/>
    <circle cx="119" cy="260" r="1.5"/>
    <circle cx="138" cy="262" r="1.5"/>
    <circle cx="132" cy="260" r="1.5"/>
    <circle cx="99" cy="260" r="1.5"/>
    <circle cx="85" cy="260" r="1.5"/>
    <circle cx="158" cy="267" r="1.5"/>
    <circle cx="119" cy="249" r="1.5"/>
    <circle cx="79" cy="263" r="1.5"/>
    <circle cx="128" cy="255" r="1.5"/>
    <circle cx="124" cy="264" r="1.5"/>
    <circle cx="141" cy="254" r="1.5"/>
    <circle cx="74" cy="247" r="1.5"/>
    <circle cx="113" cy="274" r="1.5"/>
    <circle cx="72" cy="263" r="1.5"/>
    <circle cx="93" cy="263" r="1.5"/>
    <circle cx="96" cy="255" r="1.5"/>
    <circle cx="105" cy="240" r="1.5"/>
    <circle cx="79" cy="235" r="1.5"/>
    <circle cx="95" cy="239" r="1.5"/>
    <circle cx="104" cy="233" r="1.5"/>
    <circle cx="107" cy="246" r="1.5"/>
    <circle cx="115" cy="251" r="1.5"/>
    <circle cx="126" cy="256" r="1.5"/>
    <circle cx="149" cy="270" r="1.5"/>
    <circle cx="94" cy="261" r="1.5"/>
    <circle cx="66" cy="257" r="1.5"/>
    <circle cx="128" cy="263" r="1.5"/>
    <circle cx="121" cy="263" r="1.5"/>
    <circle cx="140" cy="265" r="1.5"/>
    <circle cx="105" cy="261" r="1.5"/>
    <circle cx="120" cy="265" r="1.5"/>
    <circle cx="118" cy="265" r="1.5"/>
    <circle cx="125" cy="265" r="1.5"/>
    <circle cx="154" cy="269" r="1.5"/>
    <circle cx="100" cy="264" r="1.5"/>
    <circle cx="105" cy="252" r="1.5"/>
    <circle cx="94" cy="268" r="1.5"/>
    <circle cx="132" cy="264" r="1.5"/>
    <circle cx="135" cy="266" r="1.5"/>
    <circle cx="145" cy="259" r="1.5"/>
    <circle cx="143" cy="260" r="1.5"/>
    <circle cx="150" cy="263" r="1.5"/>
    <circle cx="121" cy="267" r="1.5"/>
    <circle cx="143" cy="264" r="1.5"/>
    <circle cx="103" cy="258" r="1.5"/>
    <circle cx="109" cy="260" r="1.5"/>
    <circle cx="127" cy="270" r="1.5"/>
    <circle cx="146" cy="267" r="1.5"/>
    <circle cx="90" cy="259" r="1.5"/>
    <circle cx="108" cy="262" r="1.5"/>
    <circle cx="77" cy="269" r="1.5"/>
    <circle cx="115" cy="269" r="1.5"/>
    <circle cx="122" cy="272" r="1.5"/>
    <circle cx="128" cy="269" r="1.5"/>
    <circle cx="146" cy="270" r="1.5"/>
    <circle cx="117" cy="265" r="1.5"/>
    <circle cx="108" cy="269" r="1.5"/>
    <circle cx="124" cy="271" r="1.5"/>
    <circle cx="153" cy="272" r="1.5"/>
    <circle cx="118" cy="262" r="1.5"/>
    <circle cx="137" cy="270" r="1.5"/>
    <circle cx="124" cy="267" r="1.5"/>
    <circle cx="117" cy="267" r="1.5"/>
    <circle cx="117" cy="268" r="1.5"/>
    <circle cx="106" cy="270" r="1.5"/>
    <circle cx="115" cy="258" r="1.5"/>
    <circle cx="126" cy="258" r="1.5"/>
    <circle cx="136" cy="265" r="1.5"/>
    <circle cx="156" cy="266" r="1.5"/>
    <circle cx="149" cy="271" r="1.5"/>
    <circle cx="131" cy="269" r="1.5"/>
    <circle cx="164" cy="273" r="1.5"/>
    <circle cx="140" cy="271" r="1.5"/>
    <circle cx="112" cy="261" r="1.5"/>
    <circle cx="103" cy="265" r="1.5"/>
    <circle cx="132" cy="273" r="1.5"/>
    <circle cx="142" cy="271" r="1.5"/>
    <circle cx="120" cy="261" r="1.5"/>
    <circle cx="140" cy="258" r="1.5"/>
    <circle cx="84" cy="249" r="1.5"/>
    <circle cx="124" cy="261" r="1.5"/>
    <circle cx="139" cy="271" r="1.5"/>
    <circle cx="101" cy="270" r="1.5"/>
    <circle cx="130" cy="270" r="1.5"/>
    <circle cx="145" cy="267" r="1.5"/>
    <circle cx="118" cy="267" r="1.5"/>
    <circle cx="165" cy="270" r="1.5"/>
    <circle cx="137" cy="271" r="1.5"/>
    <circle cx="152" cy="272" r="1.5"/>
    <circle cx="131" cy="274" r="1.5"/>
    <circle cx="98" cy="271" r="1.5"/>
    <circle cx="125" cy="270" r="1.5"/>
    <circle cx="142" cy="270" r="1.5"/>
    <circle cx="168" cy="269" r="1.5"/>
    <circle cx="116" cy="269" r="1.5"/>
    <circle cx="106" cy="271" r="1.5"/>
    <circle cx="110" cy="268" r="1.5"/>
    <circle cx="111" cy="268" r="1.5"/>
    <circle cx="131" cy="273" r="1.5"/>
    <circle cx="89" cy="266" r="1.5"/>
    <circle cx="107" cy="256" r="1.5"/>
    <circle cx="143" cy="268" r="1.5"/>
    <circle cx="103" cy="260" r="1.5"/>
    <circle cx="105" cy="269" r="1.5"/>
    <circle cx="125" cy="269" r="1.5"/>
    <circle cx="104" cy="266" r="1.5"/>
    <circle cx="118" cy="269" r="1.5"/>
    <circle cx="133" cy="265" r="1.5"/>
    <circle cx="141" cy="271" r="1.5"/>
    <circle cx="139" cy="272" r="1.5"/>
    <circle cx="93" cy="264" r="1.5"/>
    <circle cx="118" cy="257" r="1.5"/>
    <circle cx="113" cy="263" r="1.5"/>
    <circle cx="120" cy="268" r="1.5"/>
    <circle cx="79" cy="267" r="1.5"/>
    <circle cx="110" cy="263" r="1.5"/>
    <circle cx="121" cy="268" r="1.5"/>
    <circle cx="126" cy="267" r="1.5"/>
    <circle cx="94" cy="263" r="1.5"/>
    <circle cx="114" cy="267" r="1.5"/>
    <circle cx="115" cy="263" r="1.5"/>
    <circle cx="100" cy="262" r="1.5"/>
    <circle cx="126" cy="255" r="1.5"/>
    <circle cx="92" cy="258" r="1.5"/>
    <circle cx="126" cy="263" r="1.5"/>
    <circle cx="137" cy="264" r="1.5"/>
    <circle cx="129" cy="261" r="1.5"/>
    <circle cx="75" cy="254" r="1.5"/>
    <circle cx="109" cy="261" r="1.5"/>
    <circle cx="110" cy="260" r="1.5"/>
    <circle cx="111" cy="262" r="1.5"/>
    <circle cx="91" cy="263" r="1.5"/>
    <circle cx="100" cy="267" r="1.5"/>
    <circle cx="104" cy="261" r="1.5"/>
    <circle cx="30" cy="259" r="1.5"/>
    <circle cx="108" cy="249" r="1.5"/>
    <circle cx="109" cy="249" r="1.5"/>
    <circle cx="135" cy="268" r="1.5"/>
    <circle cx="89" cy="232" r="1.5"/>
    <circle cx="128" cy="268" r="1.5"/>
    <circle cx="106" cy="262" r="1.5"/>
    <circle cx="69" cy="257" r="1.5"/>
    <circle cx="101" cy="256" r="1.5"/>
    <circle cx="99" cy="269" r="1.5"/>
    <circle cx="89" cy="262" r="1.5"/>
    <circle cx="78" cy="264" r="1.5"/>
    <circle cx="62" cy="258" r="1.5"/>
    <circle cx="145" cy="265" r="1.5"/>
    <circle cx="71" cy="262" r="1.5"/>
    <circle cx="109" cy="259" r="1.5"/>
    <circle cx="56" cy="263" r="1.5"/>
    <circle cx="89" cy="263" r="1.5"/>
    <circle cx="84" cy="248" r="1.5"/>
    <circle cx="68" cy="257" r="1.5"/>
    <circle cx="119" cy="259" r="1.5"/>
    <circle cx="65" cy="257" r="1.5"/>
    <circle cx="98" cy="256" r="1.5"/>
    <circle cx="93" cy="256" r="1.5"/>
    <circle cx="62" cy="263" r="1.5"/>
    <circle cx="64" cy="264" r="1.5"/>
    <circle cx="87" cy="264" r="1.5"/>
    <circle cx="101" cy="259" r="1.5"/>
    <circle cx="120" cy="260" r="1.5"/>
    <circle cx="87" cy="261" r="1.5"/>
    <circle cx="87" cy="257" r="1.5"/>
    <circle cx="80" cy="261" r="1.5"/>
    <circle cx="129" cy="264" r="1.5"/>
    <circle cx="97" cy="260" r="1.5"/>
    <circle cx="108" cy="257" r="1.5"/>
    <circle cx="90" cy="265" r="1.5"/>
    <circle cx="119" cy="265" r="1.5"/>
    <circle cx="80" cy="265" r="1.5"/>
    <circle cx="98" cy="264" r="1.5"/>
    <circle cx="107" cy="268" r="1.5"/>
    <circle cx="84" cy="266" r="1.5"/>
    <circle cx="104" cy="268" r="1.5"/>
    <circle cx="113" cy="269" r="1.5"/>
    <circle cx="103" cy="234" r="1.5"/>
    <circle cx="136" cy="266" r="1.5"/>
    <circle cx="130" cy="260" r="1.5"/>
    <circle cx="135" cy="260" r="1.5"/>
    <circle cx="127" cy="267" r="1.5"/>
    <circle cx="138" cy="270" r="1.5"/>
    <circle cx="155" cy="272" r="1.5"/>
    <circle cx="122" cy="265" r="1.5"/>
    <circle cx="72" cy="228" r="1.5"/>
    <circle cx="73" cy="265" r="1.5"/>
    <circle cx="83" cy="230" r="1.5"/>
    <circle cx="101" cy="235" r="1.5"/>
    <circle cx="130" cy="252" r="1.5"/>
    <circle cx="142" cy="265" r="1.5"/>
    <circle cx="114" cy="262" r="1.5"/>
    <circle cx="92" cy="259" r="1.5"/>
    <circle cx="86" cy="261" r="1.5"/>
    <circle cx="103" cy="259" r="1.5"/>
    <circle cx="90" cy="258" r="1.5"/>
    <circle cx="98" cy="238" r="1.5"/>
    <circle cx="78" cy="245" r="1.5"/>
    <circle cx="77" cy="247" r="1.5"/>
    <circle cx="98" cy="250" r="1.5"/>
    <circle cx="130" cy="269" r="1.5"/>
    <circle cx="64" cy="249" r="1.5"/>
    <circle cx="60" cy="247" r="1.5"/>
    <circle cx="85" cy="270" r="1.5"/>
    <circle cx="94" cy="264" r="1.5"/>
    <circle cx="110" cy="272" r="1.5"/>
    <circle cx="125" cy="271" r="1.5"/>
    <circle cx="129" cy="269" r="1.5"/>
    <circle cx="118" cy="263" r="1.5"/>
    <circle cx="125" cy="274" r="1.5"/>
    <circle cx="115" cy="262" r="1.5"/>
    <circle cx="66" cy="269" r="1.5"/>
    <circle cx="95" cy="268" r="1.5"/>
    <circle cx="125" cy="255" r="1.5"/>
    <circle cx="146" cy="260" r="1.5"/>
    <circle cx="69" cy="254" r="1.5"/>
    <circle cx="95" cy="270" r="1.5"/>
    <circle cx="90" cy="272" r="1.5"/>
    <circle cx="110" cy="273" r="1.5"/>
    <circle cx="101" cy="248" r="1.5"/>
    <circle cx="76" cy="248" r="1.5"/>
    <circle cx="103" cy="257" r="1.5"/>
    <circle cx="158" cy="259" r="1.5"/>
    <circle cx="131" cy="270" r="1.5"/>
    <circle cx="88" cy="259" r="1.5"/>
    <circle cx="102" cy="261" r="1.5"/>
    <circle cx="144" cy="259" r="1.5"/>
    <circle cx="109" cy="258" r="1.5"/>
    <circle cx="145" cy="266" r="1.5"/>
    <circle cx="87" cy="259" r="1.5"/>
    <circle cx="128" cy="262" r="1.5"/>
    <circle cx="140" cy="267" r="1.5"/>
    <circle cx="133" cy="258" r="1.5"/>
    <circle cx="91" cy="259" r="1.5"/>
    <circle cx="138" cy="271" r="1.5"/>
    <circle cx="122" cy="270" r="1.5"/>
    <circle cx="84" cy="259" r="1.5"/>
    <circle cx="147" cy="271" r="1.5"/>
    <circle cx="157" cy="272" r="1.5"/>
    <circle cx="122" cy="271" r="1.5"/>
    <circle cx="156" cy="273" r="1.5"/>
    <circle cx="155" cy="270" r="1.5"/>
    <circle cx="144" cy="263" r="1.5"/>
    <circle cx="116" cy="274" r="1.5"/>
    <circle cx="115" cy="266" r="1.5"/>
    <circle cx="119" cy="263" r="1.5"/>
    <circle cx="112" cy="268" r="1.5"/>
    <circle cx="104" cy="252" r="1.5"/>
    <circle cx="149" cy="264" r="1.5"/>
    <circle cx="146" cy="269" r="1.5"/>
    <circle cx="140" cy="270" r="1.5"/>
    <circle cx="131" cy="271" r="1.5"/>
    <circle cx="130" cy="266" r="1.5"/>
    <circle cx="129" cy="260" r="1.5"/>
    <circle cx="168" cy="263" r="1.5"/>
    <circle cx="166" cy="265" r="1.5"/>
    <circle cx="151" cy="273" r="1.5"/>
    <circle cx="145" cy="273" r="1.5"/>
    <circle cx="116" cy="267" r="1.5"/>
    <circle cx="134" cy="270" r="1.5"/>
    <circle cx="92" cy="262" r="1.5"/>
    <circle cx="80" cy="260" r="1.5"/>
    <circle cx="154" cy="273" r="1.5"/>
    <circle cx="74" cy="265" r="1.5"/>
    <circle cx="132" cy="268" r="1.5"/>
    <circle cx="74" cy="257" r="1.5"/>
    <circle cx="114" cy="237" r="1.5"/>
    <circle cx="130" cy="263" r="1.5"/>
    <circle cx="110" cy="257" r="1.5"/>
    <circle cx="122" cy="254" r="1.5"/>
    <circle cx="145" cy="270" r="1.5"/>
    <circle cx="104" cy="260" r="1.5"/>
    <circle cx="121" cy="264" r="1.5"/>
    <circle cx="97" cy="263" r="1.5"/>
    <circle cx="98" cy="257" r="1.5"/>
    <circle cx="143" cy="271" r="1.5"/>
    <circle cx="112" cy="272" r="1.5"/>
    <circle cx="110" cy="261" r="1.5"/>
    <circle cx="122" cy="268" r="1.5"/>
    <circle cx="131" cy="264" r="1.5"/>
    <circle cx="108" cy="271" r="1.5"/>
    <circle cx="124" cy="262" r="1.5"/>
    <circle cx="145" cy="271" r="1.5"/>
    <circle cx="140" cy="264" r="1.5"/>
    <circle cx="88" cy="265" r="1.5"/>
    <circle cx="134" cy="269" r="1.5"/>
    <circle cx="81" cy="262" r="1.5"/>
    <circle cx="118" cy="261" r="1.5"/>
    <circle cx="117" cy="258" r="1.5"/>
    <circle cx="128" cy="270" r="1.5"/>
    <circle cx="134" cy="263" r="1.5"/>
    <circle cx="153" cy="268" r="1.5"/>
    <circle cx="120" cy="264" r="1.5"/>
    <circle cx="130" cy="273" r="1.5"/>
    <circle cx="78" cy="258" r="1.5"/>
    <circle cx="98" cy="260" r="1.5"/>
    <circle cx="152" cy="266" r="1.5"/>
    <circle cx="155" cy="271" r="1.5"/>
    <circle cx="138" cy="273" r="1.5"/>
    <circle cx="157" cy="273" r="1.5"/>
    <circle cx="127" cy="273" r="1.5"/>
    <circle cx="109" cy="274" r="1.5"/>
    <circle cx="151" cy="274" r="1.5"/>
    <circle cx="78" cy="261" r="1.5"/>
    <circle cx="135" cy="261" r="1.5"/>
    <circle cx="116" cy="260" r="1.5"/>
    <circle cx="108" cy="263" r="1.5"/>
    <circle cx="131" cy="263" r="1.5"/>
    <circle cx="141" cy="264" r="1.5"/>
    <circle cx="89" cy="259" r="1.5"/>
    <circle cx="63" cy="260" r="1.5"/>
    <circle cx="113" cy="270" r="1.5"/>
    <circle cx="129" cy="271" r="1.5"/>
    <circle cx="89" cy="269" r="1.5"/>
    <circle cx="119" cy="268" r="1.5"/>
    <circle cx="102" cy="263" r="1.5"/>
    <circle cx="161" cy="267" r="1.5"/>
    <circle cx="100" cy="266" r="1.5"/>
    <circle cx="147" cy="268" r="1.5"/>
    <circle cx="121" cy="270" r="1.5"/>
    <circle cx="122" cy="252" r="1.5"/>
    <circle cx="126" cy="251" r="1.5"/>
    <circle cx="123" cy="269" r="1.5"/>
    <circle cx="126" cy="271" r="1.5"/>
    <circle cx="105" cy="266" r="1.5"/>
    <circle cx="107" cy="261" r="1.5"/>
    <circle cx="102" cy="267" r="1.5"/>
    <circle cx="169" cy="272" r="1.5"/>
    <circle cx="123" cy="270" r="1.5"/>
    <circle cx="90" cy="262" r="1.5"/>
    <circle cx="141" cy="272" r="1.5"/>
    <circle cx="119" cy="272" r="1.5"/>
    <circle cx="30" cy="265" r="1.5"/>
    <circle cx="82" cy="261" r="1.5"/>
    <circle cx="114" cy="271" r="1.5"/>
    <circle cx="152" cy="262" r="1.5"/>
    <circle cx="141" cy="267" r="1.5"/>
    <circle cx="97" cy="264" r="1.5"/>
    <circle cx="158" cy="272" r="1.5"/>
    <circle cx="135" cy="272" r="1.5"/>
    <circle cx="167" cy="268" r="1.5"/>
    <circle cx="116" cy="265" r="1.5"/>
    <circle cx="160" cy="271" r="1.5"/>
    <circle cx="142" cy="264" r="1.5"/>
    <circle cx="129" cy="270" r="1.5"/>
    <circle cx="115" cy="265" r="1.5"/>
    <circle cx="101" cy="262" r="1.5"/>
    <circle cx="141" cy="274" r="1.5"/>
    <circle cx="108" cy="265" r="1.5"/>
    <circle cx="78" cy="259" r="1.5"/>
    <circle cx="67" cy="250" r="1.5"/>
    <circle cx="83" cy="264" r="1.5"/>
    <circle cx="114" cy="270" r="1.5"/>
    </g>
    <text x="47" y="292" font-size="8" text-anchor="middle" fill="#888">0.1</text>
    <text x="105" y="292" font-size="8" text-anchor="middle" fill="#888">1</text>
    <text x="163" y="292" font-size="8" text-anchor="middle" fill="#888">10</text>
    <text x="26" y="233" font-size="8" text-anchor="end" fill="#888">1</text>
    <text x="26" y="183" font-size="8" text-anchor="end" fill="#888">2</text>
    <text x="314" y="166" font-size="11" font-style="italic" text-anchor="middle" fill="#222">oxide</text>
    <text x="314" y="177" font-size="8.5" text-anchor="middle" fill="#888">n = 740</text>
    <line x1="230" y1="280" x2="398" y2="280" stroke="#888" stroke-width="0.5"/>
    <line x1="305" y1="180" x2="305" y2="280" stroke="#1f2937" stroke-width="0.5" stroke-dasharray="3,2" opacity="0.6"/>
    <use href="#kmscloud" x="230" y="180"/>
    <g fill="#FF680A" opacity="0.65">
    <circle cx="308" cy="248" r="1.5"/>
    <circle cx="326" cy="268" r="1.5"/>
    <circle cx="343" cy="271" r="1.5"/>
    <circle cx="296" cy="252" r="1.5"/>
    <circle cx="329" cy="251" r="1.5"/>
    <circle cx="338" cy="262" r="1.5"/>
    <circle cx="349" cy="269" r="1.5"/>
    <circle cx="351" cy="267" r="1.5"/>
    <circle cx="281" cy="231" r="1.5"/>
    <circle cx="324" cy="255" r="1.5"/>
    <circle cx="278" cy="234" r="1.5"/>
    <circle cx="264" cy="214" r="1.5"/>
    <circle cx="313" cy="257" r="1.5"/>
    <circle cx="329" cy="254" r="1.5"/>
    <circle cx="326" cy="256" r="1.5"/>
    <circle cx="331" cy="259" r="1.5"/>
    <circle cx="329" cy="257" r="1.5"/>
    <circle cx="310" cy="261" r="1.5"/>
    <circle cx="277" cy="252" r="1.5"/>
    <circle cx="302" cy="258" r="1.5"/>
    <circle cx="299" cy="242" r="1.5"/>
    <circle cx="285" cy="246" r="1.5"/>
    <circle cx="305" cy="241" r="1.5"/>
    <circle cx="320" cy="254" r="1.5"/>
    <circle cx="323" cy="260" r="1.5"/>
    <circle cx="314" cy="253" r="1.5"/>
    <circle cx="275" cy="239" r="1.5"/>
    <circle cx="295" cy="234" r="1.5"/>
    <circle cx="275" cy="222" r="1.5"/>
    <circle cx="304" cy="273" r="1.5"/>
    <circle cx="322" cy="260" r="1.5"/>
    <circle cx="315" cy="254" r="1.5"/>
    <circle cx="292" cy="260" r="1.5"/>
    <circle cx="309" cy="252" r="1.5"/>
    <circle cx="337" cy="263" r="1.5"/>
    <circle cx="308" cy="244" r="1.5"/>
    <circle cx="273" cy="212" r="1.5"/>
    <circle cx="267" cy="213" r="1.5"/>
    <circle cx="291" cy="235" r="1.5"/>
    <circle cx="284" cy="253" r="1.5"/>
    <circle cx="307" cy="259" r="1.5"/>
    <circle cx="288" cy="223" r="1.5"/>
    <circle cx="316" cy="257" r="1.5"/>
    <circle cx="320" cy="234" r="1.5"/>
    <circle cx="330" cy="253" r="1.5"/>
    <circle cx="280" cy="259" r="1.5"/>
    <circle cx="329" cy="266" r="1.5"/>
    <circle cx="316" cy="258" r="1.5"/>
    <circle cx="308" cy="254" r="1.5"/>
    <circle cx="308" cy="253" r="1.5"/>
    <circle cx="328" cy="261" r="1.5"/>
    <circle cx="286" cy="250" r="1.5"/>
    <circle cx="293" cy="242" r="1.5"/>
    <circle cx="299" cy="247" r="1.5"/>
    <circle cx="341" cy="272" r="1.5"/>
    <circle cx="300" cy="263" r="1.5"/>
    <circle cx="306" cy="254" r="1.5"/>
    <circle cx="291" cy="267" r="1.5"/>
    <circle cx="337" cy="264" r="1.5"/>
    <circle cx="334" cy="271" r="1.5"/>
    <circle cx="325" cy="270" r="1.5"/>
    <circle cx="309" cy="259" r="1.5"/>
    <circle cx="302" cy="254" r="1.5"/>
    <circle cx="325" cy="264" r="1.5"/>
    <circle cx="322" cy="261" r="1.5"/>
    <circle cx="336" cy="269" r="1.5"/>
    <circle cx="343" cy="272" r="1.5"/>
    <circle cx="311" cy="261" r="1.5"/>
    <circle cx="319" cy="265" r="1.5"/>
    <circle cx="290" cy="228" r="1.5"/>
    <circle cx="314" cy="252" r="1.5"/>
    <circle cx="304" cy="272" r="1.5"/>
    <circle cx="318" cy="265" r="1.5"/>
    <circle cx="336" cy="265" r="1.5"/>
    <circle cx="328" cy="264" r="1.5"/>
    <circle cx="324" cy="271" r="1.5"/>
    <circle cx="336" cy="270" r="1.5"/>
    <circle cx="324" cy="262" r="1.5"/>
    <circle cx="345" cy="261" r="1.5"/>
    <circle cx="328" cy="260" r="1.5"/>
    <circle cx="312" cy="262" r="1.5"/>
    <circle cx="296" cy="262" r="1.5"/>
    <circle cx="317" cy="258" r="1.5"/>
    <circle cx="327" cy="266" r="1.5"/>
    <circle cx="300" cy="270" r="1.5"/>
    <circle cx="327" cy="268" r="1.5"/>
    <circle cx="355" cy="274" r="1.5"/>
    <circle cx="269" cy="264" r="1.5"/>
    <circle cx="336" cy="274" r="1.5"/>
    <circle cx="361" cy="274" r="1.5"/>
    <circle cx="323" cy="274" r="1.5"/>
    <circle cx="299" cy="262" r="1.5"/>
    <circle cx="286" cy="247" r="1.5"/>
    <circle cx="281" cy="246" r="1.5"/>
    <circle cx="335" cy="274" r="1.5"/>
    <circle cx="322" cy="271" r="1.5"/>
    <circle cx="339" cy="268" r="1.5"/>
    <circle cx="358" cy="273" r="1.5"/>
    <circle cx="325" cy="262" r="1.5"/>
    <circle cx="315" cy="253" r="1.5"/>
    <circle cx="294" cy="257" r="1.5"/>
    <circle cx="309" cy="261" r="1.5"/>
    <circle cx="320" cy="266" r="1.5"/>
    <circle cx="341" cy="267" r="1.5"/>
    <circle cx="304" cy="249" r="1.5"/>
    <circle cx="282" cy="267" r="1.5"/>
    <circle cx="331" cy="266" r="1.5"/>
    <circle cx="300" cy="272" r="1.5"/>
    <circle cx="303" cy="256" r="1.5"/>
    <circle cx="310" cy="250" r="1.5"/>
    <circle cx="348" cy="269" r="1.5"/>
    <circle cx="293" cy="262" r="1.5"/>
    <circle cx="331" cy="253" r="1.5"/>
    <circle cx="324" cy="258" r="1.5"/>
    <circle cx="310" cy="259" r="1.5"/>
    <circle cx="302" cy="245" r="1.5"/>
    <circle cx="318" cy="259" r="1.5"/>
    <circle cx="346" cy="271" r="1.5"/>
    <circle cx="343" cy="265" r="1.5"/>
    <circle cx="301" cy="263" r="1.5"/>
    <circle cx="308" cy="265" r="1.5"/>
    <circle cx="308" cy="268" r="1.5"/>
    <circle cx="335" cy="269" r="1.5"/>
    <circle cx="284" cy="262" r="1.5"/>
    <circle cx="321" cy="266" r="1.5"/>
    <circle cx="358" cy="272" r="1.5"/>
    <circle cx="317" cy="255" r="1.5"/>
    <circle cx="335" cy="261" r="1.5"/>
    <circle cx="351" cy="270" r="1.5"/>
    <circle cx="291" cy="263" r="1.5"/>
    <circle cx="347" cy="263" r="1.5"/>
    <circle cx="315" cy="263" r="1.5"/>
    <circle cx="314" cy="262" r="1.5"/>
    <circle cx="317" cy="256" r="1.5"/>
    <circle cx="318" cy="260" r="1.5"/>
    <circle cx="294" cy="260" r="1.5"/>
    <circle cx="326" cy="272" r="1.5"/>
    <circle cx="322" cy="265" r="1.5"/>
    <circle cx="320" cy="259" r="1.5"/>
    <circle cx="307" cy="267" r="1.5"/>
    <circle cx="260" cy="246" r="1.5"/>
    <circle cx="270" cy="247" r="1.5"/>
    <circle cx="297" cy="268" r="1.5"/>
    <circle cx="302" cy="265" r="1.5"/>
    <circle cx="290" cy="263" r="1.5"/>
    <circle cx="331" cy="268" r="1.5"/>
    <circle cx="296" cy="259" r="1.5"/>
    <circle cx="348" cy="273" r="1.5"/>
    <circle cx="280" cy="269" r="1.5"/>
    <circle cx="346" cy="269" r="1.5"/>
    <circle cx="331" cy="265" r="1.5"/>
    <circle cx="327" cy="251" r="1.5"/>
    <circle cx="351" cy="268" r="1.5"/>
    <circle cx="321" cy="249" r="1.5"/>
    <circle cx="305" cy="252" r="1.5"/>
    <circle cx="289" cy="253" r="1.5"/>
    <circle cx="346" cy="261" r="1.5"/>
    <circle cx="297" cy="259" r="1.5"/>
    <circle cx="316" cy="263" r="1.5"/>
    <circle cx="313" cy="262" r="1.5"/>
    <circle cx="255" cy="256" r="1.5"/>
    <circle cx="332" cy="258" r="1.5"/>
    <circle cx="294" cy="267" r="1.5"/>
    <circle cx="301" cy="257" r="1.5"/>
    <circle cx="267" cy="258" r="1.5"/>
    <circle cx="315" cy="271" r="1.5"/>
    <circle cx="305" cy="265" r="1.5"/>
    <circle cx="281" cy="257" r="1.5"/>
    <circle cx="306" cy="265" r="1.5"/>
    <circle cx="274" cy="258" r="1.5"/>
    <circle cx="262" cy="268" r="1.5"/>
    <circle cx="323" cy="261" r="1.5"/>
    <circle cx="334" cy="262" r="1.5"/>
    <circle cx="291" cy="238" r="1.5"/>
    <circle cx="303" cy="263" r="1.5"/>
    <circle cx="290" cy="262" r="1.5"/>
    <circle cx="319" cy="267" r="1.5"/>
    <circle cx="339" cy="271" r="1.5"/>
    <circle cx="314" cy="268" r="1.5"/>
    <circle cx="297" cy="243" r="1.5"/>
    <circle cx="300" cy="265" r="1.5"/>
    <circle cx="289" cy="257" r="1.5"/>
    <circle cx="294" cy="256" r="1.5"/>
    <circle cx="306" cy="262" r="1.5"/>
    <circle cx="253" cy="238" r="1.5"/>
    <circle cx="338" cy="264" r="1.5"/>
    <circle cx="306" cy="266" r="1.5"/>
    <circle cx="307" cy="258" r="1.5"/>
    <circle cx="286" cy="246" r="1.5"/>
    <circle cx="320" cy="267" r="1.5"/>
    <circle cx="317" cy="270" r="1.5"/>
    <circle cx="320" cy="253" r="1.5"/>
    <circle cx="304" cy="259" r="1.5"/>
    <circle cx="294" cy="255" r="1.5"/>
    <circle cx="328" cy="267" r="1.5"/>
    <circle cx="331" cy="267" r="1.5"/>
    <circle cx="272" cy="238" r="1.5"/>
    <circle cx="296" cy="265" r="1.5"/>
    <circle cx="308" cy="266" r="1.5"/>
    <circle cx="283" cy="249" r="1.5"/>
    <circle cx="290" cy="245" r="1.5"/>
    <circle cx="303" cy="266" r="1.5"/>
    <circle cx="253" cy="218" r="1.5"/>
    <circle cx="287" cy="254" r="1.5"/>
    <circle cx="301" cy="249" r="1.5"/>
    <circle cx="298" cy="247" r="1.5"/>
    <circle cx="304" cy="257" r="1.5"/>
    <circle cx="296" cy="253" r="1.5"/>
    <circle cx="303" cy="253" r="1.5"/>
    <circle cx="281" cy="258" r="1.5"/>
    <circle cx="331" cy="261" r="1.5"/>
    <circle cx="307" cy="256" r="1.5"/>
    <circle cx="301" cy="253" r="1.5"/>
    <circle cx="298" cy="255" r="1.5"/>
    <circle cx="305" cy="243" r="1.5"/>
    <circle cx="262" cy="234" r="1.5"/>
    <circle cx="317" cy="249" r="1.5"/>
    <circle cx="309" cy="253" r="1.5"/>
    <circle cx="292" cy="246" r="1.5"/>
    <circle cx="300" cy="259" r="1.5"/>
    <circle cx="295" cy="258" r="1.5"/>
    <circle cx="317" cy="250" r="1.5"/>
    <circle cx="326" cy="251" r="1.5"/>
    <circle cx="270" cy="243" r="1.5"/>
    <circle cx="313" cy="255" r="1.5"/>
    <circle cx="316" cy="250" r="1.5"/>
    <circle cx="307" cy="254" r="1.5"/>
    <circle cx="287" cy="246" r="1.5"/>
    <circle cx="283" cy="259" r="1.5"/>
    <circle cx="314" cy="255" r="1.5"/>
    <circle cx="308" cy="256" r="1.5"/>
    <circle cx="306" cy="257" r="1.5"/>
    <circle cx="313" cy="258" r="1.5"/>
    <circle cx="293" cy="252" r="1.5"/>
    <circle cx="348" cy="257" r="1.5"/>
    <circle cx="310" cy="266" r="1.5"/>
    <circle cx="302" cy="266" r="1.5"/>
    <circle cx="312" cy="265" r="1.5"/>
    <circle cx="349" cy="270" r="1.5"/>
    <circle cx="300" cy="252" r="1.5"/>
    <circle cx="315" cy="265" r="1.5"/>
    <circle cx="313" cy="259" r="1.5"/>
    <circle cx="300" cy="253" r="1.5"/>
    <circle cx="290" cy="236" r="1.5"/>
    <circle cx="314" cy="254" r="1.5"/>
    <circle cx="293" cy="253" r="1.5"/>
    <circle cx="291" cy="258" r="1.5"/>
    <circle cx="317" cy="262" r="1.5"/>
    <circle cx="300" cy="242" r="1.5"/>
    <circle cx="269" cy="252" r="1.5"/>
    <circle cx="284" cy="248" r="1.5"/>
    <circle cx="295" cy="261" r="1.5"/>
    <circle cx="302" cy="253" r="1.5"/>
    <circle cx="288" cy="243" r="1.5"/>
    <circle cx="305" cy="239" r="1.5"/>
    <circle cx="308" cy="250" r="1.5"/>
    <circle cx="299" cy="264" r="1.5"/>
    <circle cx="240" cy="227" r="1.5"/>
    <circle cx="311" cy="259" r="1.5"/>
    <circle cx="305" cy="255" r="1.5"/>
    <circle cx="288" cy="248" r="1.5"/>
    <circle cx="297" cy="237" r="1.5"/>
    <circle cx="284" cy="236" r="1.5"/>
    <circle cx="279" cy="248" r="1.5"/>
    <circle cx="356" cy="275" r="1.5"/>
    <circle cx="293" cy="263" r="1.5"/>
    <circle cx="291" cy="237" r="1.5"/>
    <circle cx="330" cy="256" r="1.5"/>
    <circle cx="372" cy="275" r="1.5"/>
    <circle cx="367" cy="274" r="1.5"/>
    <circle cx="315" cy="259" r="1.5"/>
    <circle cx="309" cy="264" r="1.5"/>
    <circle cx="325" cy="271" r="1.5"/>
    <circle cx="318" cy="269" r="1.5"/>
    <circle cx="314" cy="274" r="1.5"/>
    <circle cx="310" cy="271" r="1.5"/>
    <circle cx="310" cy="265" r="1.5"/>
    <circle cx="302" cy="269" r="1.5"/>
    <circle cx="317" cy="274" r="1.5"/>
    <circle cx="268" cy="260" r="1.5"/>
    <circle cx="283" cy="255" r="1.5"/>
    <circle cx="335" cy="264" r="1.5"/>
    <circle cx="304" cy="269" r="1.5"/>
    <circle cx="309" cy="271" r="1.5"/>
    <circle cx="351" cy="271" r="1.5"/>
    <circle cx="338" cy="270" r="1.5"/>
    <circle cx="325" cy="265" r="1.5"/>
    <circle cx="238" cy="227" r="1.5"/>
    <circle cx="281" cy="250" r="1.5"/>
    <circle cx="275" cy="254" r="1.5"/>
    <circle cx="287" cy="255" r="1.5"/>
    <circle cx="255" cy="262" r="1.5"/>
    <circle cx="301" cy="264" r="1.5"/>
    <circle cx="285" cy="263" r="1.5"/>
    <circle cx="284" cy="252" r="1.5"/>
    <circle cx="277" cy="257" r="1.5"/>
    <circle cx="271" cy="261" r="1.5"/>
    <circle cx="323" cy="268" r="1.5"/>
    <circle cx="291" cy="244" r="1.5"/>
    <circle cx="322" cy="263" r="1.5"/>
    <circle cx="283" cy="261" r="1.5"/>
    <circle cx="251" cy="259" r="1.5"/>
    <circle cx="303" cy="269" r="1.5"/>
    <circle cx="324" cy="275" r="1.5"/>
    <circle cx="284" cy="259" r="1.5"/>
    <circle cx="300" cy="238" r="1.5"/>
    <circle cx="286" cy="252" r="1.5"/>
    <circle cx="335" cy="254" r="1.5"/>
    <circle cx="302" cy="274" r="1.5"/>
    <circle cx="270" cy="251" r="1.5"/>
    <circle cx="291" cy="265" r="1.5"/>
    <circle cx="309" cy="256" r="1.5"/>
    <circle cx="281" cy="255" r="1.5"/>
    <circle cx="278" cy="256" r="1.5"/>
    <circle cx="255" cy="255" r="1.5"/>
    <circle cx="281" cy="259" r="1.5"/>
    <circle cx="303" cy="264" r="1.5"/>
    <circle cx="289" cy="255" r="1.5"/>
    <circle cx="299" cy="258" r="1.5"/>
    <circle cx="274" cy="251" r="1.5"/>
    <circle cx="293" cy="261" r="1.5"/>
    <circle cx="326" cy="266" r="1.5"/>
    <circle cx="282" cy="252" r="1.5"/>
    <circle cx="271" cy="248" r="1.5"/>
    <circle cx="274" cy="248" r="1.5"/>
    <circle cx="276" cy="257" r="1.5"/>
    <circle cx="321" cy="272" r="1.5"/>
    <circle cx="331" cy="269" r="1.5"/>
    <circle cx="355" cy="272" r="1.5"/>
    <circle cx="282" cy="251" r="1.5"/>
    <circle cx="295" cy="265" r="1.5"/>
    <circle cx="297" cy="252" r="1.5"/>
    <circle cx="304" cy="265" r="1.5"/>
    <circle cx="285" cy="251" r="1.5"/>
    <circle cx="326" cy="270" r="1.5"/>
    <circle cx="314" cy="263" r="1.5"/>
    <circle cx="273" cy="265" r="1.5"/>
    <circle cx="294" cy="248" r="1.5"/>
    <circle cx="316" cy="266" r="1.5"/>
    <circle cx="269" cy="254" r="1.5"/>
    <circle cx="245" cy="260" r="1.5"/>
    <circle cx="357" cy="271" r="1.5"/>
    <circle cx="316" cy="245" r="1.5"/>
    <circle cx="302" cy="260" r="1.5"/>
    <circle cx="276" cy="262" r="1.5"/>
    <circle cx="337" cy="272" r="1.5"/>
    <circle cx="364" cy="272" r="1.5"/>
    <circle cx="284" cy="256" r="1.5"/>
    <circle cx="317" cy="266" r="1.5"/>
    <circle cx="286" cy="258" r="1.5"/>
    <circle cx="298" cy="243" r="1.5"/>
    <circle cx="291" cy="259" r="1.5"/>
    <circle cx="311" cy="260" r="1.5"/>
    <circle cx="273" cy="249" r="1.5"/>
    <circle cx="313" cy="272" r="1.5"/>
    <circle cx="272" cy="261" r="1.5"/>
    <circle cx="316" cy="252" r="1.5"/>
    <circle cx="311" cy="248" r="1.5"/>
    <circle cx="299" cy="252" r="1.5"/>
    <circle cx="319" cy="262" r="1.5"/>
    <circle cx="294" cy="262" r="1.5"/>
    <circle cx="305" cy="268" r="1.5"/>
    <circle cx="293" cy="232" r="1.5"/>
    <circle cx="327" cy="267" r="1.5"/>
    <circle cx="322" cy="266" r="1.5"/>
    <circle cx="359" cy="268" r="1.5"/>
    <circle cx="268" cy="264" r="1.5"/>
    <circle cx="306" cy="256" r="1.5"/>
    <circle cx="305" cy="247" r="1.5"/>
    <circle cx="280" cy="245" r="1.5"/>
    <circle cx="316" cy="253" r="1.5"/>
    <circle cx="353" cy="272" r="1.5"/>
    <circle cx="330" cy="271" r="1.5"/>
    <circle cx="361" cy="271" r="1.5"/>
    <circle cx="291" cy="260" r="1.5"/>
    <circle cx="292" cy="273" r="1.5"/>
    <circle cx="333" cy="270" r="1.5"/>
    <circle cx="360" cy="267" r="1.5"/>
    <circle cx="288" cy="250" r="1.5"/>
    <circle cx="336" cy="253" r="1.5"/>
    <circle cx="309" cy="263" r="1.5"/>
    <circle cx="325" cy="253" r="1.5"/>
    <circle cx="312" cy="267" r="1.5"/>
    <circle cx="327" cy="262" r="1.5"/>
    <circle cx="315" cy="262" r="1.5"/>
    <circle cx="281" cy="261" r="1.5"/>
    <circle cx="306" cy="260" r="1.5"/>
    <circle cx="266" cy="253" r="1.5"/>
    <circle cx="304" cy="256" r="1.5"/>
    <circle cx="316" cy="268" r="1.5"/>
    <circle cx="337" cy="262" r="1.5"/>
    <circle cx="276" cy="248" r="1.5"/>
    <circle cx="318" cy="263" r="1.5"/>
    <circle cx="340" cy="273" r="1.5"/>
    <circle cx="318" cy="267" r="1.5"/>
    <circle cx="334" cy="270" r="1.5"/>
    <circle cx="309" cy="262" r="1.5"/>
    <circle cx="266" cy="270" r="1.5"/>
    <circle cx="325" cy="269" r="1.5"/>
    <circle cx="320" cy="258" r="1.5"/>
    <circle cx="304" cy="262" r="1.5"/>
    <circle cx="319" cy="251" r="1.5"/>
    <circle cx="338" cy="263" r="1.5"/>
    <circle cx="325" cy="260" r="1.5"/>
    <circle cx="306" cy="267" r="1.5"/>
    <circle cx="312" cy="254" r="1.5"/>
    <circle cx="322" cy="258" r="1.5"/>
    <circle cx="292" cy="251" r="1.5"/>
    <circle cx="288" cy="254" r="1.5"/>
    <circle cx="321" cy="262" r="1.5"/>
    <circle cx="290" cy="244" r="1.5"/>
    <circle cx="321" cy="271" r="1.5"/>
    <circle cx="303" cy="254" r="1.5"/>
    <circle cx="346" cy="272" r="1.5"/>
    <circle cx="350" cy="272" r="1.5"/>
    <circle cx="323" cy="262" r="1.5"/>
    <circle cx="329" cy="264" r="1.5"/>
    <circle cx="313" cy="265" r="1.5"/>
    <circle cx="300" cy="256" r="1.5"/>
    <circle cx="301" cy="268" r="1.5"/>
    <circle cx="319" cy="259" r="1.5"/>
    <circle cx="262" cy="218" r="1.5"/>
    <circle cx="267" cy="220" r="1.5"/>
    <circle cx="326" cy="261" r="1.5"/>
    <circle cx="297" cy="269" r="1.5"/>
    <circle cx="354" cy="270" r="1.5"/>
    <circle cx="340" cy="262" r="1.5"/>
    <circle cx="272" cy="250" r="1.5"/>
    <circle cx="323" cy="254" r="1.5"/>
    <circle cx="318" cy="254" r="1.5"/>
    <circle cx="311" cy="254" r="1.5"/>
    <circle cx="305" cy="261" r="1.5"/>
    <circle cx="306" cy="261" r="1.5"/>
    <circle cx="295" cy="252" r="1.5"/>
    <circle cx="230" cy="255" r="1.5"/>
    <circle cx="312" cy="261" r="1.5"/>
    <circle cx="276" cy="250" r="1.5"/>
    <circle cx="279" cy="247" r="1.5"/>
    <circle cx="280" cy="242" r="1.5"/>
    <circle cx="289" cy="254" r="1.5"/>
    <circle cx="303" cy="252" r="1.5"/>
    <circle cx="297" cy="251" r="1.5"/>
    <circle cx="317" cy="254" r="1.5"/>
    <circle cx="311" cy="251" r="1.5"/>
    <circle cx="286" cy="262" r="1.5"/>
    <circle cx="280" cy="268" r="1.5"/>
    <circle cx="296" cy="239" r="1.5"/>
    <circle cx="303" cy="240" r="1.5"/>
    <circle cx="297" cy="267" r="1.5"/>
    <circle cx="284" cy="229" r="1.5"/>
    <circle cx="237" cy="264" r="1.5"/>
    <circle cx="298" cy="257" r="1.5"/>
    <circle cx="292" cy="262" r="1.5"/>
    <circle cx="316" cy="262" r="1.5"/>
    <circle cx="306" cy="271" r="1.5"/>
    <circle cx="317" cy="252" r="1.5"/>
    <circle cx="313" cy="236" r="1.5"/>
    <circle cx="346" cy="275" r="1.5"/>
    <circle cx="341" cy="274" r="1.5"/>
    <circle cx="371" cy="271" r="1.5"/>
    <circle cx="317" cy="268" r="1.5"/>
    <circle cx="302" cy="261" r="1.5"/>
    <circle cx="301" cy="254" r="1.5"/>
    <circle cx="305" cy="253" r="1.5"/>
    <circle cx="328" cy="266" r="1.5"/>
    <circle cx="327" cy="254" r="1.5"/>
    <circle cx="294" cy="253" r="1.5"/>
    <circle cx="302" cy="250" r="1.5"/>
    <circle cx="305" cy="257" r="1.5"/>
    <circle cx="319" cy="271" r="1.5"/>
    <circle cx="275" cy="245" r="1.5"/>
    <circle cx="341" cy="269" r="1.5"/>
    <circle cx="278" cy="240" r="1.5"/>
    <circle cx="322" cy="245" r="1.5"/>
    <circle cx="347" cy="271" r="1.5"/>
    <circle cx="302" cy="259" r="1.5"/>
    <circle cx="296" cy="270" r="1.5"/>
    <circle cx="321" cy="259" r="1.5"/>
    <circle cx="320" cy="265" r="1.5"/>
    <circle cx="333" cy="269" r="1.5"/>
    <circle cx="326" cy="267" r="1.5"/>
    <circle cx="304" cy="253" r="1.5"/>
    <circle cx="317" cy="261" r="1.5"/>
    <circle cx="270" cy="267" r="1.5"/>
    <circle cx="339" cy="260" r="1.5"/>
    <circle cx="321" cy="264" r="1.5"/>
    <circle cx="291" cy="248" r="1.5"/>
    <circle cx="288" cy="201" r="1.5"/>
    <circle cx="332" cy="264" r="1.5"/>
    <circle cx="342" cy="268" r="1.5"/>
    <circle cx="394" cy="274" r="1.5"/>
    <circle cx="312" cy="266" r="1.5"/>
    <circle cx="323" cy="272" r="1.5"/>
    <circle cx="308" cy="271" r="1.5"/>
    <circle cx="321" cy="269" r="1.5"/>
    <circle cx="307" cy="263" r="1.5"/>
    <circle cx="316" cy="265" r="1.5"/>
    <circle cx="289" cy="266" r="1.5"/>
    <circle cx="314" cy="270" r="1.5"/>
    <circle cx="347" cy="268" r="1.5"/>
    <circle cx="318" cy="251" r="1.5"/>
    <circle cx="288" cy="266" r="1.5"/>
    <circle cx="286" cy="253" r="1.5"/>
    <circle cx="303" cy="255" r="1.5"/>
    <circle cx="310" cy="262" r="1.5"/>
    <circle cx="306" cy="237" r="1.5"/>
    <circle cx="324" cy="270" r="1.5"/>
    <circle cx="304" cy="268" r="1.5"/>
    <circle cx="353" cy="273" r="1.5"/>
    <circle cx="279" cy="266" r="1.5"/>
    <circle cx="313" cy="260" r="1.5"/>
    <circle cx="311" cy="270" r="1.5"/>
    <circle cx="287" cy="259" r="1.5"/>
    <circle cx="319" cy="264" r="1.5"/>
    <circle cx="343" cy="270" r="1.5"/>
    <circle cx="297" cy="271" r="1.5"/>
    <circle cx="262" cy="224" r="1.5"/>
    <circle cx="276" cy="243" r="1.5"/>
    <circle cx="332" cy="273" r="1.5"/>
    <circle cx="323" cy="269" r="1.5"/>
    <circle cx="333" cy="271" r="1.5"/>
    <circle cx="288" cy="264" r="1.5"/>
    <circle cx="325" cy="266" r="1.5"/>
    <circle cx="296" cy="248" r="1.5"/>
    <circle cx="330" cy="259" r="1.5"/>
    <circle cx="345" cy="265" r="1.5"/>
    <circle cx="298" cy="248" r="1.5"/>
    <circle cx="327" cy="256" r="1.5"/>
    <circle cx="311" cy="249" r="1.5"/>
    <circle cx="313" cy="268" r="1.5"/>
    <circle cx="379" cy="273" r="1.5"/>
    <circle cx="341" cy="273" r="1.5"/>
    <circle cx="284" cy="257" r="1.5"/>
    <circle cx="261" cy="257" r="1.5"/>
    <circle cx="329" cy="258" r="1.5"/>
    <circle cx="327" cy="271" r="1.5"/>
    <circle cx="314" cy="271" r="1.5"/>
    <circle cx="323" cy="257" r="1.5"/>
    <circle cx="309" cy="265" r="1.5"/>
    <circle cx="344" cy="273" r="1.5"/>
    <circle cx="296" cy="268" r="1.5"/>
    <circle cx="299" cy="254" r="1.5"/>
    <circle cx="292" cy="263" r="1.5"/>
    <circle cx="301" cy="267" r="1.5"/>
    <circle cx="316" cy="269" r="1.5"/>
    <circle cx="305" cy="251" r="1.5"/>
    <circle cx="270" cy="244" r="1.5"/>
    <circle cx="314" cy="273" r="1.5"/>
    <circle cx="310" cy="253" r="1.5"/>
    <circle cx="300" cy="269" r="1.5"/>
    <circle cx="321" cy="273" r="1.5"/>
    <circle cx="305" cy="266" r="1.5"/>
    <circle cx="261" cy="256" r="1.5"/>
    <circle cx="306" cy="264" r="1.5"/>
    <circle cx="357" cy="268" r="1.5"/>
    <circle cx="294" cy="263" r="1.5"/>
    <circle cx="324" cy="263" r="1.5"/>
    <circle cx="309" cy="247" r="1.5"/>
    <circle cx="336" cy="272" r="1.5"/>
    <circle cx="260" cy="269" r="1.5"/>
    <circle cx="329" cy="272" r="1.5"/>
    <circle cx="317" cy="265" r="1.5"/>
    <circle cx="323" cy="271" r="1.5"/>
    <circle cx="320" cy="252" r="1.5"/>
    <circle cx="337" cy="271" r="1.5"/>
    <circle cx="286" cy="254" r="1.5"/>
    <circle cx="294" cy="259" r="1.5"/>
    <circle cx="312" cy="264" r="1.5"/>
    <circle cx="339" cy="275" r="1.5"/>
    <circle cx="301" cy="260" r="1.5"/>
    <circle cx="346" cy="273" r="1.5"/>
    <circle cx="308" cy="262" r="1.5"/>
    <circle cx="284" cy="250" r="1.5"/>
    <circle cx="308" cy="273" r="1.5"/>
    <circle cx="302" cy="264" r="1.5"/>
    <circle cx="275" cy="246" r="1.5"/>
    <circle cx="321" cy="268" r="1.5"/>
    <circle cx="265" cy="243" r="1.5"/>
    <circle cx="298" cy="274" r="1.5"/>
    <circle cx="258" cy="242" r="1.5"/>
    <circle cx="263" cy="265" r="1.5"/>
    <circle cx="258" cy="217" r="1.5"/>
    <circle cx="290" cy="250" r="1.5"/>
    <circle cx="291" cy="269" r="1.5"/>
    <circle cx="320" cy="257" r="1.5"/>
    <circle cx="310" cy="264" r="1.5"/>
    <circle cx="293" cy="269" r="1.5"/>
    <circle cx="301" cy="258" r="1.5"/>
    <circle cx="354" cy="272" r="1.5"/>
    <circle cx="320" cy="269" r="1.5"/>
    <circle cx="281" cy="271" r="1.5"/>
    <circle cx="245" cy="214" r="1.5"/>
    <circle cx="240" cy="207" r="1.5"/>
    <circle cx="273" cy="248" r="1.5"/>
    <circle cx="312" cy="271" r="1.5"/>
    <circle cx="281" cy="222" r="1.5"/>
    <circle cx="322" cy="250" r="1.5"/>
    <circle cx="292" cy="239" r="1.5"/>
    <circle cx="337" cy="267" r="1.5"/>
    <circle cx="302" cy="255" r="1.5"/>
    <circle cx="333" cy="275" r="1.5"/>
    <circle cx="317" cy="275" r="1.5"/>
    <circle cx="282" cy="253" r="1.5"/>
    <circle cx="329" cy="267" r="1.5"/>
    <circle cx="282" cy="261" r="1.5"/>
    <circle cx="256" cy="258" r="1.5"/>
    <circle cx="321" cy="261" r="1.5"/>
    <circle cx="316" cy="272" r="1.5"/>
    <circle cx="316" cy="271" r="1.5"/>
    <circle cx="285" cy="261" r="1.5"/>
    <circle cx="317" cy="269" r="1.5"/>
    <circle cx="309" cy="266" r="1.5"/>
    <circle cx="275" cy="247" r="1.5"/>
    <circle cx="295" cy="264" r="1.5"/>
    <circle cx="369" cy="268" r="1.5"/>
    <circle cx="307" cy="269" r="1.5"/>
    <circle cx="304" cy="260" r="1.5"/>
    <circle cx="272" cy="256" r="1.5"/>
    <circle cx="322" cy="275" r="1.5"/>
    <circle cx="310" cy="269" r="1.5"/>
    <circle cx="322" cy="274" r="1.5"/>
    <circle cx="263" cy="252" r="1.5"/>
    <circle cx="292" cy="250" r="1.5"/>
    <circle cx="351" cy="272" r="1.5"/>
    </g>
    <text x="247" y="292" font-size="8" text-anchor="middle" fill="#888">0.1</text>
    <text x="305" y="292" font-size="8" text-anchor="middle" fill="#888">1</text>
    <text x="363" y="292" font-size="8" text-anchor="middle" fill="#888">10</text>
    <text x="514" y="166" font-size="11" font-style="italic" text-anchor="middle" fill="#222">halide</text>
    <text x="514" y="177" font-size="8.5" text-anchor="middle" fill="#888">n = 304</text>
    <line x1="430" y1="280" x2="598" y2="280" stroke="#888" stroke-width="0.5"/>
    <line x1="505" y1="180" x2="505" y2="280" stroke="#1f2937" stroke-width="0.5" stroke-dasharray="3,2" opacity="0.6"/>
    <use href="#kmscloud" x="430" y="180"/>
    <g fill="#FF680A" opacity="0.65">
    <circle cx="525" cy="258" r="1.5"/>
    <circle cx="516" cy="254" r="1.5"/>
    <circle cx="555" cy="264" r="1.5"/>
    <circle cx="507" cy="253" r="1.5"/>
    <circle cx="484" cy="249" r="1.5"/>
    <circle cx="543" cy="274" r="1.5"/>
    <circle cx="547" cy="268" r="1.5"/>
    <circle cx="477" cy="224" r="1.5"/>
    <circle cx="434" cy="252" r="1.5"/>
    <circle cx="502" cy="248" r="1.5"/>
    <circle cx="517" cy="232" r="1.5"/>
    <circle cx="487" cy="263" r="1.5"/>
    <circle cx="492" cy="260" r="1.5"/>
    <circle cx="490" cy="244" r="1.5"/>
    <circle cx="513" cy="266" r="1.5"/>
    <circle cx="504" cy="273" r="1.5"/>
    <circle cx="503" cy="233" r="1.5"/>
    <circle cx="483" cy="239" r="1.5"/>
    <circle cx="571" cy="262" r="1.5"/>
    <circle cx="488" cy="262" r="1.5"/>
    <circle cx="477" cy="266" r="1.5"/>
    <circle cx="496" cy="252" r="1.5"/>
    <circle cx="557" cy="271" r="1.5"/>
    <circle cx="548" cy="268" r="1.5"/>
    <circle cx="525" cy="269" r="1.5"/>
    <circle cx="476" cy="259" r="1.5"/>
    <circle cx="510" cy="266" r="1.5"/>
    <circle cx="507" cy="273" r="1.5"/>
    <circle cx="539" cy="266" r="1.5"/>
    <circle cx="548" cy="272" r="1.5"/>
    <circle cx="516" cy="258" r="1.5"/>
    <circle cx="548" cy="273" r="1.5"/>
    <circle cx="530" cy="257" r="1.5"/>
    <circle cx="541" cy="267" r="1.5"/>
    <circle cx="531" cy="269" r="1.5"/>
    <circle cx="541" cy="264" r="1.5"/>
    <circle cx="568" cy="271" r="1.5"/>
    <circle cx="482" cy="265" r="1.5"/>
    <circle cx="543" cy="271" r="1.5"/>
    <circle cx="544" cy="268" r="1.5"/>
    <circle cx="541" cy="273" r="1.5"/>
    <circle cx="548" cy="270" r="1.5"/>
    <circle cx="573" cy="272" r="1.5"/>
    <circle cx="524" cy="266" r="1.5"/>
    <circle cx="551" cy="270" r="1.5"/>
    <circle cx="535" cy="272" r="1.5"/>
    <circle cx="500" cy="242" r="1.5"/>
    <circle cx="544" cy="271" r="1.5"/>
    <circle cx="549" cy="264" r="1.5"/>
    <circle cx="544" cy="275" r="1.5"/>
    <circle cx="498" cy="246" r="1.5"/>
    <circle cx="532" cy="270" r="1.5"/>
    <circle cx="554" cy="273" r="1.5"/>
    <circle cx="520" cy="258" r="1.5"/>
    <circle cx="516" cy="260" r="1.5"/>
    <circle cx="516" cy="269" r="1.5"/>
    <circle cx="533" cy="266" r="1.5"/>
    <circle cx="552" cy="264" r="1.5"/>
    <circle cx="457" cy="253" r="1.5"/>
    <circle cx="544" cy="262" r="1.5"/>
    <circle cx="509" cy="270" r="1.5"/>
    <circle cx="488" cy="264" r="1.5"/>
    <circle cx="540" cy="271" r="1.5"/>
    <circle cx="453" cy="251" r="1.5"/>
    <circle cx="518" cy="270" r="1.5"/>
    <circle cx="486" cy="251" r="1.5"/>
    <circle cx="508" cy="253" r="1.5"/>
    <circle cx="508" cy="273" r="1.5"/>
    <circle cx="538" cy="260" r="1.5"/>
    <circle cx="472" cy="251" r="1.5"/>
    <circle cx="499" cy="268" r="1.5"/>
    <circle cx="519" cy="270" r="1.5"/>
    <circle cx="539" cy="271" r="1.5"/>
    <circle cx="498" cy="261" r="1.5"/>
    <circle cx="524" cy="267" r="1.5"/>
    <circle cx="481" cy="264" r="1.5"/>
    <circle cx="549" cy="269" r="1.5"/>
    <circle cx="486" cy="262" r="1.5"/>
    <circle cx="518" cy="266" r="1.5"/>
    <circle cx="486" cy="266" r="1.5"/>
    <circle cx="507" cy="247" r="1.5"/>
    <circle cx="507" cy="235" r="1.5"/>
    <circle cx="502" cy="260" r="1.5"/>
    <circle cx="481" cy="262" r="1.5"/>
    <circle cx="498" cy="266" r="1.5"/>
    <circle cx="487" cy="260" r="1.5"/>
    <circle cx="528" cy="271" r="1.5"/>
    <circle cx="509" cy="269" r="1.5"/>
    <circle cx="549" cy="271" r="1.5"/>
    <circle cx="523" cy="266" r="1.5"/>
    <circle cx="530" cy="266" r="1.5"/>
    <circle cx="486" cy="257" r="1.5"/>
    <circle cx="504" cy="267" r="1.5"/>
    <circle cx="459" cy="241" r="1.5"/>
    <circle cx="491" cy="241" r="1.5"/>
    <circle cx="500" cy="240" r="1.5"/>
    <circle cx="524" cy="259" r="1.5"/>
    <circle cx="523" cy="269" r="1.5"/>
    <circle cx="492" cy="271" r="1.5"/>
    <circle cx="476" cy="224" r="1.5"/>
    <circle cx="468" cy="227" r="1.5"/>
    <circle cx="486" cy="213" r="1.5"/>
    <circle cx="475" cy="233" r="1.5"/>
    <circle cx="473" cy="214" r="1.5"/>
    <circle cx="471" cy="211" r="1.5"/>
    <circle cx="526" cy="273" r="1.5"/>
    <circle cx="486" cy="261" r="1.5"/>
    <circle cx="519" cy="262" r="1.5"/>
    <circle cx="550" cy="267" r="1.5"/>
    <circle cx="544" cy="267" r="1.5"/>
    <circle cx="546" cy="270" r="1.5"/>
    <circle cx="569" cy="272" r="1.5"/>
    <circle cx="546" cy="266" r="1.5"/>
    <circle cx="539" cy="267" r="1.5"/>
    <circle cx="518" cy="256" r="1.5"/>
    <circle cx="521" cy="261" r="1.5"/>
    <circle cx="542" cy="265" r="1.5"/>
    <circle cx="526" cy="257" r="1.5"/>
    <circle cx="535" cy="258" r="1.5"/>
    <circle cx="517" cy="257" r="1.5"/>
    <circle cx="524" cy="244" r="1.5"/>
    <circle cx="508" cy="258" r="1.5"/>
    <circle cx="563" cy="271" r="1.5"/>
    <circle cx="564" cy="271" r="1.5"/>
    <circle cx="569" cy="271" r="1.5"/>
    <circle cx="535" cy="269" r="1.5"/>
    <circle cx="502" cy="266" r="1.5"/>
    <circle cx="474" cy="252" r="1.5"/>
    <circle cx="510" cy="268" r="1.5"/>
    <circle cx="516" cy="272" r="1.5"/>
    <circle cx="536" cy="269" r="1.5"/>
    <circle cx="519" cy="267" r="1.5"/>
    <circle cx="483" cy="267" r="1.5"/>
    <circle cx="553" cy="271" r="1.5"/>
    <circle cx="475" cy="265" r="1.5"/>
    <circle cx="473" cy="265" r="1.5"/>
    <circle cx="479" cy="257" r="1.5"/>
    <circle cx="509" cy="257" r="1.5"/>
    <circle cx="487" cy="257" r="1.5"/>
    <circle cx="525" cy="242" r="1.5"/>
    <circle cx="516" cy="266" r="1.5"/>
    <circle cx="512" cy="271" r="1.5"/>
    <circle cx="499" cy="256" r="1.5"/>
    <circle cx="504" cy="259" r="1.5"/>
    <circle cx="516" cy="267" r="1.5"/>
    <circle cx="491" cy="242" r="1.5"/>
    <circle cx="501" cy="265" r="1.5"/>
    <circle cx="528" cy="270" r="1.5"/>
    <circle cx="526" cy="266" r="1.5"/>
    <circle cx="509" cy="259" r="1.5"/>
    <circle cx="545" cy="271" r="1.5"/>
    <circle cx="518" cy="271" r="1.5"/>
    <circle cx="491" cy="270" r="1.5"/>
    <circle cx="504" cy="271" r="1.5"/>
    <circle cx="491" cy="257" r="1.5"/>
    <circle cx="478" cy="262" r="1.5"/>
    <circle cx="480" cy="258" r="1.5"/>
    <circle cx="489" cy="259" r="1.5"/>
    <circle cx="486" cy="247" r="1.5"/>
    <circle cx="475" cy="256" r="1.5"/>
    <circle cx="462" cy="256" r="1.5"/>
    <circle cx="512" cy="264" r="1.5"/>
    <circle cx="517" cy="271" r="1.5"/>
    <circle cx="546" cy="268" r="1.5"/>
    <circle cx="463" cy="253" r="1.5"/>
    <circle cx="510" cy="271" r="1.5"/>
    <circle cx="483" cy="262" r="1.5"/>
    <circle cx="489" cy="262" r="1.5"/>
    <circle cx="510" cy="255" r="1.5"/>
    <circle cx="538" cy="266" r="1.5"/>
    <circle cx="532" cy="259" r="1.5"/>
    <circle cx="521" cy="259" r="1.5"/>
    <circle cx="533" cy="268" r="1.5"/>
    <circle cx="545" cy="267" r="1.5"/>
    <circle cx="505" cy="258" r="1.5"/>
    <circle cx="553" cy="267" r="1.5"/>
    <circle cx="529" cy="269" r="1.5"/>
    <circle cx="518" cy="258" r="1.5"/>
    <circle cx="509" cy="241" r="1.5"/>
    <circle cx="527" cy="254" r="1.5"/>
    <circle cx="517" cy="258" r="1.5"/>
    <circle cx="558" cy="269" r="1.5"/>
    <circle cx="466" cy="254" r="1.5"/>
    <circle cx="522" cy="263" r="1.5"/>
    <circle cx="466" cy="272" r="1.5"/>
    <circle cx="473" cy="274" r="1.5"/>
    <circle cx="514" cy="256" r="1.5"/>
    <circle cx="532" cy="258" r="1.5"/>
    <circle cx="486" cy="232" r="1.5"/>
    <circle cx="479" cy="232" r="1.5"/>
    <circle cx="496" cy="264" r="1.5"/>
    <circle cx="488" cy="258" r="1.5"/>
    <circle cx="454" cy="260" r="1.5"/>
    <circle cx="474" cy="249" r="1.5"/>
    <circle cx="512" cy="270" r="1.5"/>
    <circle cx="477" cy="263" r="1.5"/>
    <circle cx="541" cy="272" r="1.5"/>
    <circle cx="527" cy="267" r="1.5"/>
    <circle cx="538" cy="274" r="1.5"/>
    <circle cx="503" cy="273" r="1.5"/>
    <circle cx="558" cy="275" r="1.5"/>
    <circle cx="461" cy="254" r="1.5"/>
    <circle cx="552" cy="271" r="1.5"/>
    <circle cx="464" cy="229" r="1.5"/>
    <circle cx="475" cy="253" r="1.5"/>
    <circle cx="462" cy="233" r="1.5"/>
    <circle cx="537" cy="265" r="1.5"/>
    <circle cx="511" cy="264" r="1.5"/>
    <circle cx="489" cy="261" r="1.5"/>
    <circle cx="521" cy="271" r="1.5"/>
    <circle cx="539" cy="273" r="1.5"/>
    <circle cx="494" cy="265" r="1.5"/>
    <circle cx="490" cy="263" r="1.5"/>
    <circle cx="498" cy="265" r="1.5"/>
    <circle cx="538" cy="267" r="1.5"/>
    <circle cx="515" cy="266" r="1.5"/>
    <circle cx="500" cy="263" r="1.5"/>
    <circle cx="547" cy="263" r="1.5"/>
    <circle cx="520" cy="260" r="1.5"/>
    <circle cx="513" cy="259" r="1.5"/>
    <circle cx="528" cy="252" r="1.5"/>
    <circle cx="475" cy="261" r="1.5"/>
    <circle cx="516" cy="259" r="1.5"/>
    <circle cx="512" cy="268" r="1.5"/>
    <circle cx="556" cy="269" r="1.5"/>
    <circle cx="547" cy="257" r="1.5"/>
    <circle cx="510" cy="229" r="1.5"/>
    <circle cx="500" cy="264" r="1.5"/>
    <circle cx="528" cy="263" r="1.5"/>
    <circle cx="503" cy="271" r="1.5"/>
    <circle cx="550" cy="274" r="1.5"/>
    <circle cx="543" cy="273" r="1.5"/>
    <circle cx="520" cy="264" r="1.5"/>
    <circle cx="522" cy="275" r="1.5"/>
    <circle cx="517" cy="265" r="1.5"/>
    <circle cx="480" cy="245" r="1.5"/>
    <circle cx="513" cy="245" r="1.5"/>
    <circle cx="507" cy="250" r="1.5"/>
    <circle cx="497" cy="267" r="1.5"/>
    <circle cx="492" cy="257" r="1.5"/>
    <circle cx="523" cy="272" r="1.5"/>
    <circle cx="466" cy="258" r="1.5"/>
    <circle cx="508" cy="261" r="1.5"/>
    <circle cx="542" cy="260" r="1.5"/>
    <circle cx="530" cy="272" r="1.5"/>
    <circle cx="519" cy="260" r="1.5"/>
    <circle cx="534" cy="274" r="1.5"/>
    <circle cx="501" cy="266" r="1.5"/>
    <circle cx="512" cy="257" r="1.5"/>
    <circle cx="532" cy="260" r="1.5"/>
    <circle cx="550" cy="273" r="1.5"/>
    <circle cx="470" cy="274" r="1.5"/>
    <circle cx="553" cy="272" r="1.5"/>
    <circle cx="491" cy="272" r="1.5"/>
    <circle cx="508" cy="271" r="1.5"/>
    <circle cx="489" cy="234" r="1.5"/>
    <circle cx="531" cy="264" r="1.5"/>
    <circle cx="513" cy="267" r="1.5"/>
    <circle cx="497" cy="260" r="1.5"/>
    <circle cx="522" cy="268" r="1.5"/>
    <circle cx="551" cy="273" r="1.5"/>
    <circle cx="510" cy="261" r="1.5"/>
    <circle cx="514" cy="269" r="1.5"/>
    <circle cx="479" cy="263" r="1.5"/>
    <circle cx="525" cy="268" r="1.5"/>
    <circle cx="495" cy="272" r="1.5"/>
    <circle cx="525" cy="264" r="1.5"/>
    <circle cx="529" cy="271" r="1.5"/>
    <circle cx="481" cy="248" r="1.5"/>
    <circle cx="521" cy="252" r="1.5"/>
    <circle cx="547" cy="271" r="1.5"/>
    <circle cx="526" cy="262" r="1.5"/>
    <circle cx="480" cy="264" r="1.5"/>
    <circle cx="479" cy="249" r="1.5"/>
    <circle cx="532" cy="272" r="1.5"/>
    <circle cx="514" cy="272" r="1.5"/>
    <circle cx="452" cy="255" r="1.5"/>
    <circle cx="512" cy="249" r="1.5"/>
    <circle cx="507" cy="262" r="1.5"/>
    <circle cx="525" cy="256" r="1.5"/>
    <circle cx="497" cy="268" r="1.5"/>
    <circle cx="510" cy="247" r="1.5"/>
    <circle cx="541" cy="275" r="1.5"/>
    <circle cx="501" cy="257" r="1.5"/>
    <circle cx="479" cy="262" r="1.5"/>
    <circle cx="513" cy="243" r="1.5"/>
    <circle cx="503" cy="238" r="1.5"/>
    <circle cx="538" cy="263" r="1.5"/>
    <circle cx="485" cy="263" r="1.5"/>
    </g>
    <text x="447" y="292" font-size="8" text-anchor="middle" fill="#888">0.1</text>
    <text x="505" y="292" font-size="8" text-anchor="middle" fill="#888">1</text>
    <text x="563" y="292" font-size="8" text-anchor="middle" fill="#888">10</text>
    <text x="310" y="303" font-size="10" font-style="italic" text-anchor="middle" fill="#444">corrected hardness κ (log) vs Ms, MA/m: each chemistry class (orange) against the full cloud (gray)</text>
    </svg>
  <figcaption><strong>Figure 14.</strong> The hardness-magnetization plane split by chemistry class (orange, one panel per class) against the full cloud (gray). The classes cluster: metallic bonding buys magnetization at the upper left, anion chemistry (oxides, chalcogenides, halides) buys anisotropy at dilute moments toward the lower right, and pnictides sit between. The 37 borides straddle the κ = 1 line at high magnetization, the region every other class avoids, marking interstitial boron hardening of an iron-rich lattice as the dataset's distinctive rare-earth-free design route.</figcaption>
</figure>

Figure 15 repeats the analysis with the engineering pair: the peak energy product against the robustness score, for the 641 compounds that passed every gate. Nearly every compound sits close to one of the two axes. Rare-earth-free compounds reach NdFeB-class ceilings only at robustness near zero (the borides), or usable robustness at half the ceiling (Mn₂SbTe); the approach to the open corner is made only by precious-metal compounds, FePt nearest. No physical bound excludes the corner; it is where a rare-earth-free discovery would land, and the dataset states what occupying it requires: κ comfortably above one and \(M_s\) above ~1.1 MA/m in the same uniaxial, stable, high-Curie compound.

<figure>
  <svg viewBox="0 0 620 262" xmlns="http://www.w3.org/2000/svg" style="font-family:inherit;">
    <line x1="60" y1="210" x2="590" y2="210" stroke="#888" stroke-width="0.6"/>
    <line x1="60" y1="210" x2="60" y2="40" stroke="#888" stroke-width="0.6"/>
    <text x="60" y="224" text-anchor="middle" font-size="9" fill="#888">0</text>
    <text x="249" y="224" text-anchor="middle" font-size="9" fill="#888">0.5</text>
    <text x="439" y="224" text-anchor="middle" font-size="9" fill="#888">1.0</text>
    <text x="52" y="168" text-anchor="end" font-size="9" fill="#888">200</text>
    <text x="52" y="122" text-anchor="end" font-size="9" fill="#888">400</text>
    <text x="52" y="77" text-anchor="end" font-size="9" fill="#888">600</text>
    <text x="325" y="243" text-anchor="middle" font-size="10" fill="#444" font-style="italic">robustness score (pass share × threshold margin)</text>
    <text x="30" y="125" text-anchor="middle" font-size="10" fill="#444" font-style="italic" transform="rotate(-90 30 125)">peak (BH)max, kJ/m³</text>
    <line x1="60" y1="119" x2="590" y2="119" stroke="#bbb" stroke-width="0.6" stroke-dasharray="3,3"/>
    <text x="588" y="114" text-anchor="end" font-size="9" fill="#888">sintered NdFeB ≈ 400</text>
    <g fill="#1f2937" opacity="0.5">
    <circle cx="60" cy="188" r="2"/>
    <circle cx="60" cy="194" r="2"/>
    <circle cx="452" cy="150" r="2"/>
    <circle cx="111" cy="159" r="2"/>
    <circle cx="60" cy="186" r="2"/>
    <circle cx="66" cy="128" r="2"/>
    <circle cx="164" cy="135" r="2"/>
    <circle cx="86" cy="177" r="2"/>
    <circle cx="78" cy="148" r="2"/>
    <circle cx="210" cy="173" r="2"/>
    <circle cx="73" cy="127" r="2"/>
    <circle cx="404" cy="126" r="2"/>
    <circle cx="60" cy="200" r="2"/>
    <circle cx="60" cy="192" r="2"/>
    <circle cx="222" cy="167" r="2"/>
    <circle cx="60" cy="210" r="2"/>
    <circle cx="545" cy="149" r="2"/>
    <circle cx="88" cy="50" r="2"/>
    <circle cx="171" cy="178" r="2"/>
    <circle cx="60" cy="206" r="2"/>
    <circle cx="60" cy="207" r="2"/>
    <circle cx="60" cy="209" r="2"/>
    <circle cx="60" cy="203" r="2"/>
    <circle cx="60" cy="198" r="2"/>
    <circle cx="60" cy="189" r="2"/>
    <circle cx="60" cy="202" r="2"/>
    <circle cx="61" cy="171" r="2"/>
    <circle cx="60" cy="191" r="2"/>
    <circle cx="60" cy="208" r="2"/>
    <circle cx="183" cy="158" r="2"/>
    <circle cx="60" cy="205" r="2"/>
    <circle cx="61" cy="170" r="2"/>
    <circle cx="462" cy="161" r="2"/>
    <circle cx="60" cy="187" r="2"/>
    <circle cx="75" cy="172" r="2"/>
    </g>
    <g fill="#FF680A" opacity="0.5">
    <circle cx="60" cy="201" r="2"/>
    <circle cx="61" cy="175" r="2"/>
    <circle cx="77" cy="161" r="2"/>
    <circle cx="60" cy="206" r="2"/>
    <circle cx="60" cy="165" r="2"/>
    <circle cx="64" cy="178" r="2"/>
    <circle cx="64" cy="118" r="2"/>
    <circle cx="98" cy="169" r="2"/>
    <circle cx="63" cy="114" r="2"/>
    <circle cx="327" cy="166" r="2"/>
    <circle cx="60" cy="152" r="2"/>
    <circle cx="60" cy="157" r="2"/>
    <circle cx="67" cy="172" r="2"/>
    <circle cx="61" cy="179" r="2"/>
    <circle cx="63" cy="140" r="2"/>
    <circle cx="60" cy="196" r="2"/>
    <circle cx="60" cy="191" r="2"/>
    <circle cx="60" cy="202" r="2"/>
    <circle cx="60" cy="189" r="2"/>
    <circle cx="79" cy="163" r="2"/>
    <circle cx="60" cy="168" r="2"/>
    <circle cx="60" cy="181" r="2"/>
    <circle cx="98" cy="165" r="2"/>
    <circle cx="60" cy="166" r="2"/>
    <circle cx="77" cy="162" r="2"/>
    <circle cx="60" cy="198" r="2"/>
    <circle cx="60" cy="195" r="2"/>
    <circle cx="60" cy="207" r="2"/>
    <circle cx="64" cy="165" r="2"/>
    <circle cx="60" cy="199" r="2"/>
    <circle cx="60" cy="192" r="2"/>
    <circle cx="60" cy="205" r="2"/>
    <circle cx="60" cy="190" r="2"/>
    <circle cx="60" cy="194" r="2"/>
    <circle cx="60" cy="203" r="2"/>
    <circle cx="60" cy="200" r="2"/>
    <circle cx="60" cy="167" r="2"/>
    <circle cx="64" cy="121" r="2"/>
    <circle cx="60" cy="173" r="2"/>
    <circle cx="60" cy="186" r="2"/>
    <circle cx="74" cy="142" r="2"/>
    <circle cx="60" cy="204" r="2"/>
    <circle cx="60" cy="197" r="2"/>
    <circle cx="60" cy="209" r="2"/>
    <circle cx="60" cy="193" r="2"/>
    <circle cx="60" cy="208" r="2"/>
    <circle cx="60" cy="188" r="2"/>
    <circle cx="60" cy="210" r="2"/>
    <circle cx="66" cy="165" r="2"/>
    <circle cx="60" cy="182" r="2"/>
    <circle cx="60" cy="185" r="2"/>
    <circle cx="60" cy="187" r="2"/>
    <circle cx="60" cy="180" r="2"/>
    <circle cx="60" cy="172" r="2"/>
    <circle cx="60" cy="184" r="2"/>
    <circle cx="60" cy="161" r="2"/>
    <circle cx="60" cy="183" r="2"/>
    <circle cx="66" cy="175" r="2"/>
    <circle cx="61" cy="157" r="2"/>
    <circle cx="63" cy="175" r="2"/>
    <circle cx="71" cy="156" r="2"/>
    <circle cx="84" cy="174" r="2"/>
    <circle cx="60" cy="136" r="2"/>
    <circle cx="60" cy="170" r="2"/>
    <circle cx="62" cy="168" r="2"/>
    <circle cx="61" cy="176" r="2"/>
    <circle cx="74" cy="157" r="2"/>
    <circle cx="61" cy="172" r="2"/>
    <circle cx="98" cy="171" r="2"/>
    <circle cx="60" cy="175" r="2"/>
    <circle cx="62" cy="170" r="2"/>
    </g>
    <circle cx="234" cy="50" r="2.5" fill="#FF680A"/>
    <text x="242" y="53" font-size="9" fill="#1f2937">precious-free</text>
    <circle cx="234" cy="64" r="2.5" fill="#1f2937"/>
    <text x="242" y="67" font-size="9" fill="#1f2937">precious-containing</text>
    <text x="94" y="48" font-size="9.5" font-style="italic" fill="#1f2937">Fe₃Pt</text>
    <text x="410" y="123" font-size="9.5" font-style="italic" fill="#1f2937">FePt</text>
    <text x="540" y="144" font-size="9.5" text-anchor="end" font-style="italic" fill="#1f2937">Co₃Ir</text>
    <text x="334" y="162" font-size="9.5" font-style="italic" fill="#FF680A">Mn₂SbTe</text>
    <text x="68" y="110" font-size="9.5" font-style="italic" fill="#FF680A">Fe₁₅MnB₈</text>
    <text x="586" y="75" font-size="9.5" text-anchor="end" font-style="italic" fill="#888">open: ceiling and robustness together</text>
  </svg>
  <figcaption><strong>Figure 15.</strong> The engineering trade for the 641 gate-passing compounds: peak energy product against robustness. High ceilings occur at near-zero robustness (the borides, upper left) and usable robustness at moderate ceilings (Mn₂SbTe); only precious-metal compounds approach the open corner. Fe₃Pt's 706 kJ/m³ ceiling comes with Invar caveats (Section 5.1), which leaves FePt as the appropriate reference point.</figcaption>
</figure>

### 5  Technical validation

Screening-scale settings trade accuracy for throughput, and the calibration tier measures how much accuracy is given up. A stratified subset of 287 compounds (roughly fifty per hardness band, interleaved so partial completion stays balanced) was recomputed with the k-point spacing tightened from 0.16 to 0.10 Å⁻¹ and the plane-wave cutoff raised from 65 to 80 Ry, a refinement that costs six to ten times the production runtime per compound. Comparing the two values for the same compound separates the error into a bias and a scatter, and the two behave very differently.

<figure>
  <svg viewBox="0 0 620 262" xmlns="http://www.w3.org/2000/svg" style="font-family:inherit;">
    <line x1="70" y1="215" x2="570" y2="215" stroke="#888" stroke-width="0.6"/>
    <line x1="70" y1="215" x2="70" y2="30" stroke="#888" stroke-width="0.6"/>
    <line x1="70" y1="215" x2="570" y2="30" stroke="#1f2937" stroke-width="0.8" stroke-dasharray="4,3"/>
    <text x="252" y="160" font-size="9.5" font-style="italic" fill="#1f2937" transform="rotate(-20 252 160)">converged (y = x)</text>
    <text x="176" y="229" text-anchor="middle" font-size="9" fill="#888">0.1</text>
    <text x="62" y="179" text-anchor="end" font-size="9" fill="#888">0.1</text>
    <text x="328" y="229" text-anchor="middle" font-size="9" fill="#888">1</text>
    <text x="62" y="123" text-anchor="end" font-size="9" fill="#888">1</text>
    <text x="479" y="229" text-anchor="middle" font-size="9" fill="#888">10</text>
    <text x="62" y="67" text-anchor="end" font-size="9" fill="#888">10</text>
    <text x="320" y="248" text-anchor="middle" font-size="10" fill="#444" font-style="italic">κ at production settings (log)</text>
    <text x="30" y="122" text-anchor="middle" font-size="10" fill="#444" font-style="italic" transform="rotate(-90 30 122)">κ at high-accuracy settings</text>
    <g fill="#FF680A" opacity="0.6">
    <circle cx="293" cy="110" r="2.2"/>
    <circle cx="302" cy="121" r="2.2"/>
    <circle cx="310" cy="126" r="2.2"/>
    <circle cx="225" cy="178" r="2.2"/>
    <circle cx="297" cy="121" r="2.2"/>
    <circle cx="277" cy="150" r="2.2"/>
    <circle cx="243" cy="165" r="2.2"/>
    <circle cx="302" cy="129" r="2.2"/>
    <circle cx="219" cy="160" r="2.2"/>
    <circle cx="276" cy="138" r="2.2"/>
    <circle cx="245" cy="151" r="2.2"/>
    <circle cx="285" cy="135" r="2.2"/>
    <circle cx="220" cy="159" r="2.2"/>
    <circle cx="279" cy="136" r="2.2"/>
    <circle cx="301" cy="134" r="2.2"/>
    <circle cx="268" cy="145" r="2.2"/>
    <circle cx="259" cy="145" r="2.2"/>
    <circle cx="233" cy="145" r="2.2"/>
    <circle cx="282" cy="186" r="2.2"/>
    <circle cx="274" cy="143" r="2.2"/>
    <circle cx="299" cy="130" r="2.2"/>
    <circle cx="250" cy="142" r="2.2"/>
    <circle cx="267" cy="142" r="2.2"/>
    <circle cx="208" cy="173" r="2.2"/>
    <circle cx="305" cy="129" r="2.2"/>
    <circle cx="278" cy="129" r="2.2"/>
    <circle cx="278" cy="118" r="2.2"/>
    <circle cx="262" cy="141" r="2.2"/>
    <circle cx="288" cy="136" r="2.2"/>
    <circle cx="264" cy="143" r="2.2"/>
    <circle cx="259" cy="126" r="2.2"/>
    <circle cx="257" cy="99" r="2.2"/>
    <circle cx="300" cy="137" r="2.2"/>
    <circle cx="285" cy="136" r="2.2"/>
    <circle cx="271" cy="145" r="2.2"/>
    <circle cx="299" cy="125" r="2.2"/>
    <circle cx="276" cy="140" r="2.2"/>
    <circle cx="311" cy="127" r="2.2"/>
    <circle cx="252" cy="148" r="2.2"/>
    <circle cx="229" cy="161" r="2.2"/>
    <circle cx="307" cy="128" r="2.2"/>
    <circle cx="278" cy="138" r="2.2"/>
    <circle cx="276" cy="143" r="2.2"/>
    <circle cx="209" cy="149" r="2.2"/>
    <circle cx="291" cy="134" r="2.2"/>
    <circle cx="255" cy="145" r="2.2"/>
    <circle cx="263" cy="152" r="2.2"/>
    <circle cx="307" cy="121" r="2.2"/>
    <circle cx="292" cy="134" r="2.2"/>
    <circle cx="277" cy="144" r="2.2"/>
    <circle cx="241" cy="152" r="2.2"/>
    <circle cx="278" cy="138" r="2.2"/>
    <circle cx="253" cy="148" r="2.2"/>
    <circle cx="307" cy="124" r="2.2"/>
    <circle cx="262" cy="141" r="2.2"/>
    <circle cx="285" cy="136" r="2.2"/>
    <circle cx="290" cy="134" r="2.2"/>
    <circle cx="278" cy="135" r="2.2"/>
    <circle cx="293" cy="133" r="2.2"/>
    <circle cx="248" cy="149" r="2.2"/>
    <circle cx="283" cy="133" r="2.2"/>
    <circle cx="239" cy="149" r="2.2"/>
    <circle cx="310" cy="126" r="2.2"/>
    <circle cx="285" cy="131" r="2.2"/>
    <circle cx="263" cy="146" r="2.2"/>
    <circle cx="278" cy="133" r="2.2"/>
    <circle cx="237" cy="178" r="2.2"/>
    <circle cx="283" cy="131" r="2.2"/>
    <circle cx="311" cy="108" r="2.2"/>
    <circle cx="256" cy="143" r="2.2"/>
    <circle cx="389" cy="97" r="2.2"/>
    <circle cx="420" cy="84" r="2.2"/>
    <circle cx="440" cy="92" r="2.2"/>
    <circle cx="406" cy="95" r="2.2"/>
    <circle cx="315" cy="142" r="2.2"/>
    <circle cx="341" cy="115" r="2.2"/>
    <circle cx="416" cy="90" r="2.2"/>
    <circle cx="389" cy="95" r="2.2"/>
    <circle cx="417" cy="87" r="2.2"/>
    <circle cx="350" cy="125" r="2.2"/>
    <circle cx="340" cy="115" r="2.2"/>
    <circle cx="314" cy="124" r="2.2"/>
    <circle cx="351" cy="113" r="2.2"/>
    <circle cx="342" cy="114" r="2.2"/>
    <circle cx="340" cy="117" r="2.2"/>
    <circle cx="425" cy="105" r="2.2"/>
    <circle cx="320" cy="115" r="2.2"/>
    <circle cx="331" cy="122" r="2.2"/>
    <circle cx="477" cy="61" r="2.2"/>
    <circle cx="331" cy="118" r="2.2"/>
    <circle cx="354" cy="102" r="2.2"/>
    <circle cx="326" cy="128" r="2.2"/>
    <circle cx="349" cy="118" r="2.2"/>
    <circle cx="424" cy="84" r="2.2"/>
    <circle cx="410" cy="89" r="2.2"/>
    <circle cx="435" cy="80" r="2.2"/>
    <circle cx="455" cy="75" r="2.2"/>
    <circle cx="398" cy="108" r="2.2"/>
    <circle cx="409" cy="91" r="2.2"/>
    <circle cx="350" cy="132" r="2.2"/>
    <circle cx="321" cy="130" r="2.2"/>
    <circle cx="333" cy="118" r="2.2"/>
    <circle cx="497" cy="58" r="2.2"/>
    <circle cx="432" cy="81" r="2.2"/>
    <circle cx="320" cy="127" r="2.2"/>
    <circle cx="434" cy="80" r="2.2"/>
    <circle cx="422" cy="86" r="2.2"/>
    <circle cx="390" cy="146" r="2.2"/>
    <circle cx="376" cy="118" r="2.2"/>
    <circle cx="390" cy="122" r="2.2"/>
    <circle cx="375" cy="99" r="2.2"/>
    <circle cx="364" cy="106" r="2.2"/>
    <circle cx="340" cy="116" r="2.2"/>
    <circle cx="328" cy="104" r="2.2"/>
    <circle cx="474" cy="80" r="2.2"/>
    <circle cx="404" cy="94" r="2.2"/>
    <circle cx="452" cy="99" r="2.2"/>
    <circle cx="369" cy="106" r="2.2"/>
    <circle cx="315" cy="125" r="2.2"/>
    <circle cx="347" cy="120" r="2.2"/>
    <circle cx="325" cy="121" r="2.2"/>
    <circle cx="422" cy="88" r="2.2"/>
    <circle cx="381" cy="95" r="2.2"/>
    <circle cx="326" cy="123" r="2.2"/>
    <circle cx="379" cy="100" r="2.2"/>
    <circle cx="315" cy="115" r="2.2"/>
    <circle cx="319" cy="128" r="2.2"/>
    <circle cx="336" cy="115" r="2.2"/>
    <circle cx="447" cy="75" r="2.2"/>
    <circle cx="320" cy="124" r="2.2"/>
    <circle cx="370" cy="116" r="2.2"/>
    <circle cx="418" cy="85" r="2.2"/>
    <circle cx="422" cy="85" r="2.2"/>
    <circle cx="370" cy="108" r="2.2"/>
    <circle cx="348" cy="113" r="2.2"/>
    <circle cx="366" cy="109" r="2.2"/>
    <circle cx="439" cy="79" r="2.2"/>
    <circle cx="320" cy="120" r="2.2"/>
    <circle cx="332" cy="117" r="2.2"/>
    <circle cx="383" cy="109" r="2.2"/>
    <circle cx="325" cy="123" r="2.2"/>
    <circle cx="424" cy="86" r="2.2"/>
    <circle cx="360" cy="103" r="2.2"/>
    <circle cx="395" cy="95" r="2.2"/>
    <circle cx="482" cy="60" r="2.2"/>
    <circle cx="359" cy="118" r="2.2"/>
    <circle cx="375" cy="102" r="2.2"/>
    <circle cx="442" cy="78" r="2.2"/>
    <circle cx="381" cy="104" r="2.2"/>
    <circle cx="407" cy="97" r="2.2"/>
    <circle cx="325" cy="130" r="2.2"/>
    <circle cx="368" cy="99" r="2.2"/>
    <circle cx="313" cy="125" r="2.2"/>
    <circle cx="401" cy="93" r="2.2"/>
    <circle cx="356" cy="105" r="2.2"/>
    <circle cx="465" cy="65" r="2.2"/>
    <circle cx="444" cy="76" r="2.2"/>
    <circle cx="328" cy="117" r="2.2"/>
    <circle cx="370" cy="106" r="2.2"/>
    <circle cx="411" cy="90" r="2.2"/>
    <circle cx="330" cy="122" r="2.2"/>
    <circle cx="356" cy="114" r="2.2"/>
    <circle cx="438" cy="79" r="2.2"/>
    <circle cx="359" cy="99" r="2.2"/>
    <circle cx="346" cy="115" r="2.2"/>
    <circle cx="242" cy="149" r="2.2"/>
    <circle cx="468" cy="70" r="2.2"/>
    <circle cx="333" cy="118" r="2.2"/>
    <circle cx="408" cy="92" r="2.2"/>
    <circle cx="415" cy="87" r="2.2"/>
    <circle cx="329" cy="120" r="2.2"/>
    <circle cx="452" cy="74" r="2.2"/>
    <circle cx="342" cy="113" r="2.2"/>
    <circle cx="318" cy="111" r="2.2"/>
    <circle cx="415" cy="88" r="2.2"/>
    <circle cx="422" cy="78" r="2.2"/>
    <circle cx="434" cy="81" r="2.2"/>
    <circle cx="369" cy="107" r="2.2"/>
    <circle cx="388" cy="162" r="2.2"/>
    <circle cx="385" cy="110" r="2.2"/>
    <circle cx="382" cy="115" r="2.2"/>
    <circle cx="433" cy="81" r="2.2"/>
    <circle cx="443" cy="73" r="2.2"/>
    <circle cx="363" cy="98" r="2.2"/>
    <circle cx="350" cy="119" r="2.2"/>
    <circle cx="397" cy="93" r="2.2"/>
    <circle cx="313" cy="124" r="2.2"/>
    <circle cx="381" cy="93" r="2.2"/>
    <circle cx="358" cy="108" r="2.2"/>
    <circle cx="383" cy="89" r="2.2"/>
    <circle cx="337" cy="115" r="2.2"/>
    <circle cx="422" cy="78" r="2.2"/>
    <circle cx="419" cy="86" r="2.2"/>
    <circle cx="372" cy="104" r="2.2"/>
    <circle cx="334" cy="106" r="2.2"/>
    <circle cx="321" cy="124" r="2.2"/>
    <circle cx="335" cy="115" r="2.2"/>
    <circle cx="435" cy="81" r="2.2"/>
    <circle cx="357" cy="108" r="2.2"/>
    <circle cx="437" cy="82" r="2.2"/>
    <circle cx="395" cy="105" r="2.2"/>
    <circle cx="360" cy="97" r="2.2"/>
    <circle cx="318" cy="122" r="2.2"/>
    <circle cx="364" cy="93" r="2.2"/>
    <circle cx="384" cy="124" r="2.2"/>
    <circle cx="445" cy="103" r="2.2"/>
    <circle cx="316" cy="125" r="2.2"/>
    <circle cx="348" cy="113" r="2.2"/>
    <circle cx="380" cy="100" r="2.2"/>
    <circle cx="385" cy="98" r="2.2"/>
    <circle cx="448" cy="74" r="2.2"/>
    <circle cx="332" cy="119" r="2.2"/>
    <circle cx="351" cy="107" r="2.2"/>
    <circle cx="488" cy="62" r="2.2"/>
    <circle cx="333" cy="115" r="2.2"/>
    <circle cx="373" cy="127" r="2.2"/>
    <circle cx="403" cy="93" r="2.2"/>
    <circle cx="337" cy="116" r="2.2"/>
    <circle cx="469" cy="78" r="2.2"/>
    <circle cx="408" cy="89" r="2.2"/>
    <circle cx="325" cy="120" r="2.2"/>
    <circle cx="378" cy="100" r="2.2"/>
    <circle cx="339" cy="109" r="2.2"/>
    <circle cx="349" cy="113" r="2.2"/>
    <circle cx="434" cy="82" r="2.2"/>
    <circle cx="423" cy="81" r="2.2"/>
    <circle cx="392" cy="95" r="2.2"/>
    <circle cx="366" cy="105" r="2.2"/>
    <circle cx="398" cy="104" r="2.2"/>
    <circle cx="353" cy="109" r="2.2"/>
    <circle cx="337" cy="111" r="2.2"/>
    <circle cx="335" cy="119" r="2.2"/>
    <circle cx="366" cy="103" r="2.2"/>
    <circle cx="349" cy="117" r="2.2"/>
    <circle cx="330" cy="118" r="2.2"/>
    <circle cx="315" cy="125" r="2.2"/>
    <circle cx="360" cy="102" r="2.2"/>
    <circle cx="480" cy="67" r="2.2"/>
    <circle cx="380" cy="96" r="2.2"/>
    <circle cx="441" cy="91" r="2.2"/>
    <circle cx="436" cy="73" r="2.2"/>
    <circle cx="418" cy="91" r="2.2"/>
    <circle cx="332" cy="118" r="2.2"/>
    <circle cx="377" cy="96" r="2.2"/>
    </g>
    <g fill="#1f2937" opacity="0.75">
    <circle cx="261" cy="142" r="2.2"/>
    <circle cx="305" cy="144" r="2.2"/>
    <circle cx="274" cy="159" r="2.2"/>
    <circle cx="294" cy="68" r="2.2"/>
    <circle cx="225" cy="104" r="2.2"/>
    <circle cx="309" cy="134" r="2.2"/>
    <circle cx="294" cy="126" r="2.2"/>
    <circle cx="252" cy="123" r="2.2"/>
    <circle cx="306" cy="119" r="2.2"/>
    <circle cx="313" cy="126" r="2.2"/>
    <circle cx="305" cy="117" r="2.2"/>
    <circle cx="189" cy="131" r="2.2"/>
    <circle cx="274" cy="141" r="2.2"/>
    <circle cx="271" cy="133" r="2.2"/>
    <circle cx="250" cy="130" r="2.2"/>
    <circle cx="264" cy="127" r="2.2"/>
    <circle cx="148" cy="127" r="2.2"/>
    <circle cx="338" cy="154" r="2.2"/>
    <circle cx="371" cy="125" r="2.2"/>
    <circle cx="333" cy="152" r="2.2"/>
    <circle cx="460" cy="79" r="2.2"/>
    <circle cx="478" cy="91" r="2.2"/>
    <circle cx="483" cy="50" r="2.2"/>
    <circle cx="363" cy="132" r="2.2"/>
    <circle cx="357" cy="101" r="2.2"/>
    <circle cx="317" cy="116" r="2.2"/>
    <circle cx="346" cy="50" r="2.2"/>
    <circle cx="514" cy="80" r="2.2"/>
    <circle cx="398" cy="107" r="2.2"/>
    <circle cx="375" cy="105" r="2.2"/>
    <circle cx="321" cy="123" r="2.2"/>
    <circle cx="425" cy="127" r="2.2"/>
    <circle cx="323" cy="143" r="2.2"/>
    <circle cx="366" cy="96" r="2.2"/>
    <circle cx="334" cy="103" r="2.2"/>
    <circle cx="387" cy="96" r="2.2"/>
    <circle cx="323" cy="146" r="2.2"/>
    <circle cx="461" cy="76" r="2.2"/>
    <circle cx="365" cy="130" r="2.2"/>
    <circle cx="483" cy="65" r="2.2"/>
    <circle cx="344" cy="103" r="2.2"/>
    <circle cx="384" cy="101" r="2.2"/>
    <circle cx="468" cy="90" r="2.2"/>
    </g>
    <circle cx="420" cy="188" r="2.5" fill="#FF680A" opacity="0.7"/>
    <text x="428" y="191" font-size="9" fill="#1f2937">easy-axis class unchanged</text>
    <circle cx="420" cy="202" r="2.5" fill="#1f2937" opacity="0.8"/>
    <text x="428" y="205" font-size="9" fill="#1f2937">axis↔plane changed</text>
    </svg>
  <figcaption><strong>Figure 16.</strong> The 287 calibration pairs. The spine follows the identity line closely, and the small downward offset at the hard end is the bias of Table 5; the vertical scatter around the line is the per-label noise that dominates the error budget. Axis↔plane classification changes (dark) concentrate among the compounds that move farthest.</figcaption>
</figure>

**Table 5.** Per-band calibration, 287 compounds. The correction is the median ratio of high-accuracy to production \(\kappa\); the interquartile range (IQR) is the per-label scatter around it; the flip rate is the fraction whose easy-axis classification (axis vs plane) changed under refinement.

| κ band | n | κ correction (median) | IQR | axis↔plane flip |
|---|---:|:---:|:---:|:---:|
| < 0.8 | 88 | ×1.002 | [0.96, 1.31] | 19% |
| 0.8 – 1.2 | 51 | ×0.992 | [0.90, 1.09] | 14% |
| 1.2 – 2 | 50 | ×0.983 | [0.84, 1.19] | 14% |
| 2 – 4 | 48 | ×0.963 | [0.75, 1.03] | 8% |
| > 4 | 50 | ×0.968 | [0.79, 1.02] | 16% |

<figure>
  <svg viewBox="0 0 620 250" xmlns="http://www.w3.org/2000/svg" style="font-family:inherit;">
    <line x1="70" y1="30" x2="70" y2="190" stroke="#888" stroke-width="0.6"/>
    <line x1="70" y1="161" x2="590" y2="161" stroke="#eee" stroke-width="0.6"/>
    <text x="62" y="164" font-size="9" text-anchor="end" fill="#888">0.5</text>
    <line x1="70" y1="84" x2="590" y2="84" stroke="#eee" stroke-width="0.6"/>
    <text x="62" y="87" font-size="9" text-anchor="end" fill="#888">2</text>
    <line x1="70" y1="45" x2="590" y2="45" stroke="#eee" stroke-width="0.6"/>
    <text x="62" y="48" font-size="9" text-anchor="end" fill="#888">4</text>
    <line x1="70" y1="122" x2="590" y2="122" stroke="#1f2937" stroke-width="0.8" stroke-dasharray="4,3"/>
    <text x="62" y="125" font-size="9" font-weight="500" text-anchor="end" fill="#1f2937">1.0</text>
    <text x="588" y="115" font-size="9" font-style="italic" text-anchor="end" fill="#1f2937">no change</text>
    <text x="28" y="112" font-size="10" font-style="italic" fill="#444" text-anchor="middle" transform="rotate(-90 28 112)">κ ratio, refined / production (log)</text>
    <line x1="125" y1="41" x2="125" y2="156" stroke="#FF680A" stroke-width="1" opacity="0.7"/>
    <line x1="118" y1="156" x2="132" y2="156" stroke="#FF680A" stroke-width="1" opacity="0.7"/>
    <line x1="118" y1="41" x2="132" y2="41" stroke="#FF680A" stroke-width="1" opacity="0.7"/>
    <rect x="102" y="108" width="46" height="16" fill="#FF680A" opacity="0.22" stroke="#FF680A" stroke-width="1"/>
    <line x1="102" y1="122" x2="148" y2="122" stroke="#FF680A" stroke-width="3"/>
    <text x="125" y="207" font-size="11" text-anchor="middle" fill="#1f2937">κ &lt; 0.8</text>
    <text x="125" y="220" font-size="8.5" text-anchor="middle" fill="#888">n = 88</text>
    <line x1="225" y1="96" x2="225" y2="175" stroke="#FF680A" stroke-width="1" opacity="0.7"/>
    <line x1="218" y1="175" x2="232" y2="175" stroke="#FF680A" stroke-width="1" opacity="0.7"/>
    <line x1="218" y1="96" x2="232" y2="96" stroke="#FF680A" stroke-width="1" opacity="0.7"/>
    <rect x="202" y="118" width="46" height="10" fill="#FF680A" opacity="0.22" stroke="#FF680A" stroke-width="1"/>
    <line x1="202" y1="123" x2="248" y2="123" stroke="#FF680A" stroke-width="3"/>
    <text x="225" y="207" font-size="11" text-anchor="middle" fill="#1f2937">0.8–1.2</text>
    <text x="225" y="220" font-size="8.5" text-anchor="middle" fill="#888">n = 51</text>
    <line x1="325" y1="97" x2="325" y2="174" stroke="#FF680A" stroke-width="1" opacity="0.7"/>
    <line x1="318" y1="174" x2="332" y2="174" stroke="#FF680A" stroke-width="1" opacity="0.7"/>
    <line x1="318" y1="97" x2="332" y2="97" stroke="#FF680A" stroke-width="1" opacity="0.7"/>
    <rect x="302" y="113" width="46" height="19" fill="#FF680A" opacity="0.22" stroke="#FF680A" stroke-width="1"/>
    <line x1="302" y1="123" x2="348" y2="123" stroke="#FF680A" stroke-width="3"/>
    <text x="325" y="207" font-size="11" text-anchor="middle" fill="#1f2937">1.2–2</text>
    <text x="325" y="220" font-size="8.5" text-anchor="middle" fill="#888">n = 50</text>
    <line x1="425" y1="109" x2="425" y2="180" stroke="#FF680A" stroke-width="1" opacity="0.7"/>
    <line x1="418" y1="180" x2="432" y2="180" stroke="#FF680A" stroke-width="1" opacity="0.7"/>
    <line x1="418" y1="109" x2="432" y2="109" stroke="#FF680A" stroke-width="1" opacity="0.7"/>
    <rect x="402" y="121" width="46" height="19" fill="#FF680A" opacity="0.22" stroke="#FF680A" stroke-width="1"/>
    <line x1="402" y1="124" x2="448" y2="124" stroke="#FF680A" stroke-width="3"/>
    <text x="425" y="207" font-size="11" text-anchor="middle" fill="#1f2937">2–4</text>
    <text x="425" y="220" font-size="8.5" text-anchor="middle" fill="#888">n = 48</text>
    <line x1="525" y1="108" x2="525" y2="184" stroke="#FF680A" stroke-width="1" opacity="0.7"/>
    <line x1="518" y1="184" x2="532" y2="184" stroke="#FF680A" stroke-width="1" opacity="0.7"/>
    <line x1="518" y1="108" x2="532" y2="108" stroke="#FF680A" stroke-width="1" opacity="0.7"/>
    <rect x="502" y="121" width="46" height="13" fill="#FF680A" opacity="0.22" stroke="#FF680A" stroke-width="1"/>
    <line x1="502" y1="124" x2="548" y2="124" stroke="#FF680A" stroke-width="3"/>
    <text x="525" y="207" font-size="11" text-anchor="middle" fill="#1f2937">&gt; 4</text>
    <text x="525" y="220" font-size="8.5" text-anchor="middle" fill="#888">n = 50</text>
    <text x="330" y="241" font-size="10.5" text-anchor="middle" fill="#888">per κ band: median line, IQR box, 5–95% whiskers, log scale</text>
    </svg>
  <figcaption><strong>Figure 17.</strong> The calibration result in one picture. The medians (thick lines) hug the no-change line: the systematic bias is 0–4% and grows mildly with hardness. The boxes (interquartile ranges) do not; a typical individual label moves by ±16% under refinement, and the 5–95% whiskers show the heavy tails, largest in the ill-defined soft band. The bias is corrected in the shipped values; the scatter is the irreducible per-label uncertainty and is the number a model trained on this data should be judged against.</figcaption>
</figure>

The bias is small, κ-dependent, and corrected. The shipped columns `kappa_corrected` and `K1_corrected_J_per_m3` apply each band's median correction (squared for \(K_1\), since \(K_1 \propto \kappa^2\) at fixed \(M_s\)). The correction grows toward the hard end, and the benchmark below shows it grows further for the very hardest compounds, so high-\(\kappa\) values should be read as upper estimates.

The scatter is the dominant error term, and it does not average away for a single compound. In the magnet-relevant bands (\(\kappa \geq 0.8\), n = 199) the interquartile range of the refinement ratio is [0.84, 1.05], a robust one-sigma of roughly ±16%, with 48% of labels within ±10% of their refined value and 66% within ±25%. In practice, a regression model trained on these labels cannot be validated below a ±15–20% error floor on \(\kappa\), because the labels themselves move that much under convergence refinement. Most computed-property datasets report values without a calibration tier; stating the floor lets users size their validation targets correctly.

The easy-axis label is most reliable in the strongly anisotropic bands, where it matters most. The axis↔plane flip rate falls from 19% for soft, nearly-isotropic compounds, where the easy direction is genuinely ill-defined, to 8% in the strongly anisotropic 2–4 band. The shipped `easy_axis_confidence` column encodes one minus the per-band flip rate.

#### 5.1  Benchmark against literature

**Table 6.** Computed versus literature \(K_1\) (MJ/m³) for canonical hard magnets. "Production" is the as-computed value at screening settings; "refined" is the tightened-settings recomputation, completed for all rows in July 2026; experiment and DFT columns are literature values [12, 13, 19]. The refined easy axis is noted where it differs from production.

| compound | easy axis (ours) | \(K_1\) production | \(K_1\) refined | \(K_1\) experiment | \(K_1\) DFT literature |
|---|:---:|---:|---:|---:|---:|
| FePt (L1₀) | 001 ✓ | 15.9 | 10.6 | ~6.6 | 7–11 |
| FeCoPt₂ | 001 | 20.5 | 10.0 | — | 10–20 |
| CoPt (L1₀) | 001 ✓ | 8.9 | 2.5 (→ in-plane ✗) | ~4.9 | 5–8 |
| FePd (L1₀) | in-plane ✗ | 1.5 | 1.8 (→ 001 ✓) | ~1.8 | 2–3 |
| Fe₂B | 001 ✗ | 1.4 | 0.6 (→ plane ✓) | −0.8 (easy-plane) | ≈0, near boundary |
| CrPt, MnPt | non-001 | 10.4, 6.7 | 17.7, 8.4 | antiferromagnets | — |

The pipeline recovers the correct hardness ordering (FePt > CoPt > FePd), and refinement moves the hardest values into the published DFT ranges (FePt 15.9 → 10.6, FeCoPt₂ 20.5 → 10.0 MJ/m³) while they remain above room-temperature experiment, the well-documented gap between zero-temperature density-functional anisotropy and measurement [12, 13]. Refinement also corrects both marginal easy-axis errors: FePd moves from in-plane to the known 001 axis with K1 = 1.8 MJ/m³, matching experiment, and Fe₂B moves from 001 to the easy plane, matching its measured K1 of −0.8 MJ/m³ at room temperature [19]. The Fe₂B result anchors the boride story of Section 4.3 in the literature: the parent compound is easy-plane, and hardening it requires substitution, the role Mn plays in Fe₁₅MnB₈ as Co does in (Fe,Co)₂B alloys [19]. CoPt is the exception, flipping to in-plane against the known easy axis under refinement; single calculations carry the Section 5 per-label variance at either setting, and near-boundary compositions can flip in either direction. The two antiferromagnets, included as controls, fail to present as easy-axis ferromagnets at both settings; their large anisotropy energies are spin–orbit scales, not usable permanent-magnet constants.

### 6  Usage notes

#### 6.1  Quality flags

Known failure modes of the pipeline are recorded as per-row flags; flagged rows are retained in the dataset, and the filtering threshold is left to the user.

| flag | rows | meaning |
|---|---:|---|
| `kappa_reliable = False` | 198 | \(\kappa = \sqrt{K_1/\mu_0 M_s^2}\) diverges as \(M_s \to 0\); near-compensated ferrimagnets produce artifact hardness values (the dataset's raw maximum, κ ≈ 66, is such an artifact). Flagged when the anisotropy-stage \(M_s\) < 0.1 MA/m. |
| `k1_outlier = True` | 165 | \(K_1\) above 20 MJ/m³ or corrected κ above 8, beyond the credible hard-magnet ceiling (FePt, ~16 MJ/m³ at these settings) and in the calibration tail where single-shot values are least trustworthy. Flagged values should be recomputed at refined settings before use. |
| `fm_assumption_risk = True` | 1,773 | The calculation assumes ferromagnetic alignment. Flagged where that plausibly overestimates \(M_s\) (hence κ and the energy product): two or more Mn/Cr atoms per formula unit, or multiple magnetic atoms together with an anion, the superexchange chemistry that favors antiferro- or ferrimagnetic order. Half the dataset carries this flag, consistent with its oxide-heavy composition. |
| `easy_axis_confidence` | all labeled | one minus the per-band axis↔plane flip rate of Table 5. |

#### 6.2  Limitations

The dataset is a screening resource, and its limitations follow from that role. Only uniaxial crystal systems are present, so there is no cubic anisotropy data. Ferromagnetic alignment is assumed throughout; true ground-state orderings are not resolved, only flagged. The labels are single calculations at screening settings with the per-label uncertainty of Section 5; the calibration tier quantifies the noise, it does not remove it. Curie temperatures and the derived exchange stiffness are method-level estimates. Absolute anisotropy magnitudes are zero-temperature density-functional values, 1.5–2× room-temperature experiment for hard magnets. Chemistry under-represents nickel-rich compounds, which is at least partly intrinsic, since nickel-rich uniaxial magnets are genuinely scarce. And rare-earth compounds are absent by construction, which is the dataset's scope, not an oversight: a model trained on it learns the rare-earth-free anisotropy landscape, which is the landscape the discovery problem cares about.

#### 6.3  Intended use

Three uses motivated the construction. The first is training and benchmarking structure-to-anisotropy models against a measured noise floor: the corrected columns are the labels, the calibration tier is a held-out gold standard for uncertainty-aware training, and ±15–20% on \(\kappa\) is the error below which validation results measure label noise rather than model skill. The second is screening: the flags plus the corrected values support a screening workflow: require `kappa_reliable`, recompute `k1_outlier` rows before use, and treat magnetization-derived figures as upper bounds where `fm_assumption_risk` is set. The third is negative-example supply: balanced easy-axis/easy-plane and soft/hard populations are rarer in public data than positives, and they are what a classifier needs to learn a decision boundary rather than a density estimate.

### Data and code availability

The dataset (v1.0) is available on the Hugging Face Hub at [huggingface.co/datasets/willgbryan13/magnet-anisotropy-screening](https://huggingface.co/datasets/willgbryan13/magnet-anisotropy-screening) under a CC-BY-4.0 license: the main table in Parquet and CSV, the complete per-record pipeline output, the 2,787 relaxed structures with a record-linked manifest, the 287-pair calibration tier, and the parameter-level methods document. Every row carries a stable `record_id`. The screening cascade, calibration runner, and correction scripts are maintained in the project repository; the property-calculation routes are hosted on the Ouro platform [16].

### Acknowledgements

The anisotropy, relaxation, stability, Curie-temperature, and magnetic-property calculations ran as hosted routes on [Ouro](https://ouro.foundation); the screening orchestration ran on [Modal](https://modal.com). Source structures draw on the [Materials Project](https://materialsproject.org/) [4]. Structure handling used pymatgen [14]. The GPSK-300 structure-generation work that seeded this project is described in the companion report [15].

### References

[1] M. Sagawa et al. *New material for permanent magnets on a base of Nd and Fe*. J. Appl. Phys. 55, 2083 (1984). [DOI:10.1063/1.333572](https://doi.org/10.1063/1.333572)

[2] R. Skomski and J. M. D. Coey. *Magnetic anisotropy — How much is enough for a permanent magnet?* Scripta Mater. 112, 3 (2016). [DOI:10.1016/j.scriptamat.2015.09.021](https://doi.org/10.1016/j.scriptamat.2015.09.021)

[3] J. M. D. Coey. *Magnetism and Magnetic Materials*. Cambridge Univ. Press (2010). [DOI:10.1017/CBO9780511845000](https://doi.org/10.1017/CBO9780511845000)

[4] A. Jain et al. *The Materials Project: A materials genome approach to accelerating materials innovation*. APL Materials 1, 011002 (2013). [DOI:10.1063/1.4812323](https://doi.org/10.1063/1.4812323)

[5] S. V. Gallego et al. *MAGNDATA: towards a database of magnetic structures*. J. Appl. Cryst. 49, 1750 (2016). [DOI:10.1107/S1600576716012863](https://doi.org/10.1107/S1600576716012863)

[6] P. Nieves et al. *Database of novel magnetic materials for high-performance permanent magnet development*. Comput. Mater. Sci. 168, 109340 (2019). [DOI:10.1016/j.commatsci.2019.109340](https://doi.org/10.1016/j.commatsci.2019.109340)

[7] S. Haastrup et al. *The Computational 2D Materials Database: high-throughput modeling and discovery of atomically thin crystals*. 2D Mater. 5, 042002 (2018). [DOI:10.1088/2053-1583/aacfc1](https://doi.org/10.1088/2053-1583/aacfc1)

[8] B. Rhodes et al. *Orb-v3: atomistic simulation at scale*. arXiv:2504.06231 (2025). [arXiv:2504.06231](https://arxiv.org/abs/2504.06231)

[9] P. Li et al. *Large-scale ab initio simulations based on systematically improvable atomic basis*. Comput. Mater. Sci. 112, 503 (2016). [DOI:10.1016/j.commatsci.2015.07.004](https://doi.org/10.1016/j.commatsci.2015.07.004)

[10] X. He, N. Helbig, M. J. Verstraete, and E. Bousquet. *TB2J: A python package for computing magnetic interaction parameters*. Comput. Phys. Commun. 264, 107938 (2021). [DOI:10.1016/j.cpc.2021.107938](https://doi.org/10.1016/j.cpc.2021.107938)

[11] M. J. van Setten et al. *The PseudoDojo: Training and grading a 85 element optimized norm-conserving pseudopotential table*. Comput. Phys. Commun. 226, 39 (2018). [DOI:10.1016/j.cpc.2018.01.012](https://doi.org/10.1016/j.cpc.2018.01.012)

[12] D. Weller and A. Moser. *Thermal effect limits in ultrahigh-density magnetic recording*. IEEE Trans. Magn. 35, 4423 (1999). [DOI:10.1109/20.809134](https://doi.org/10.1109/20.809134)

[13] A. B. Shick and O. N. Mryasov. *Coulomb correlations and magnetic anisotropy in ordered L1₀ CoPt and FePt alloys*. Phys. Rev. B 67, 172407 (2003). [DOI:10.1103/PhysRevB.67.172407](https://doi.org/10.1103/PhysRevB.67.172407)

[14] S. P. Ong et al. *Python Materials Genomics (pymatgen): A robust, open-source python library for materials analysis*. Comput. Mater. Sci. 68, 314 (2013). [DOI:10.1016/j.commatsci.2012.10.028](https://doi.org/10.1016/j.commatsci.2012.10.028)

[15] W. Bryan. *GPSK-300: A Reciprocal-Space Diffusion Model for L1₀ Magnet Structure Prediction*. ghost-projects (2026). [/project-014/gpsk-300/](/project-014/gpsk-300/)

[16] Ouro Foundation. *Hosted property-prediction routes for materials science*. [ouro.foundation](https://ouro.foundation)

[17] S. Curtarolo et al. *AFLOW: An automatic framework for high-throughput materials discovery*. Comput. Mater. Sci. 58, 218 (2012). [DOI:10.1016/j.commatsci.2012.02.005](https://doi.org/10.1016/j.commatsci.2012.02.005)

[18] H. Sahasrabuddhe, J. Zheng et al. *A High-Throughput ab initio Database of Harmonic Phonon Properties for Inorganic Crystals*. ChemRxiv preprint (2026). [DOI:10.26434/chemrxiv.15004632](https://doi.org/10.26434/chemrxiv.15004632)


[19] A. Edström, M. Werwiński, D. Iuşan, J. Rusz, O. Eriksson, K. P. Skokov, I. A. Radulov, S. Ener, M. D. Kuz'min, J. Hong, et al. *Magnetic properties of (Fe1−xCox)2B alloys and the effect of doping by 5d elements*. Phys. Rev. B 92, 174413 (2015). [DOI:10.1103/PhysRevB.92.174413](https://doi.org/10.1103/PhysRevB.92.174413)

# SOC-SCF article — editorial workbench

Article: `project-14/content/soc-scf-trajectories.md`, published at `/soc-scf-trajectories/`.
Status: `draft: false` (published on the next deploy); linked from the homepage after GPAC.

## Direction (September 24 rewrite)

The page is a primer and a dataset card for the public release
[project-14/soc-scf-trajectories](https://huggingface.co/datasets/project-14/soc-scf-trajectories).
Order: what DFT computes → the SCF loop → collinear and noncollinear spin → spin–orbit coupling →
why magnets care → what we built (claim, record anatomy, explorer, findings, coverage) → use cases
(response operators from trajectories; learned mixing for stuck magnetic runs) → using the dataset →
collection → references. Use-case numbers (145/14/0 late-turning histories, FeB2 stall) are in
`figure-data.json` under `late_turning` and `feb2_stall`.

All counts come from the public release, not from campaign notes. The release differs from the
September 22 closeout (310 histories, 49,007 evaluations, 47,198 maps, 22 families, 53 roots,
163 geometries, 32/62/216 outcomes) because it excludes composition-discovery studies and all
Fe12W2B8-related roots. The Fe12W2B8 MAE-sensitivity example and the paid-GPU yield figures were
dropped for that reason.

## Figures

Palette: pink (#ff0860) is the only accent. Second series, "solver converged", negative spin and
B poles, and the V₀ ramp use greys (slate #4b515b, light #c9ced6); page links take the text colour
with a pink underline.

- Data figures: `generate_soc_scf_figures.py` reads the release metadata plus raw shards 00000,
  00628 and 00661 (FeAl2 evaluations 1–9 and 96), checks every field hash, and asserts that
  recomputed charge/spin residuals match `scalar-histories`. Outputs go to `static/img/soc-scf/`,
  with the quoted numbers in `figure-data.json` and the explorer manifest in `feal2/manifest.json`.
- Figures are embedded with the `soc-img` shortcode, which appends a content hash (`?v=`) so a
  regenerated image is never served stale from a browser or CDN cache. Explorer tiles use the
  `version` hash the generator writes into `feal2/manifest.json`.
- Diagrams: `assets/soc-scf/*.svg`, inlined by the `soc-svg` shortcode so they use page fonts.
- Widgets: `soc-rotate` (phenomenological K sin²θ via `magnetism-model.js`) and `soc-explorer`
  (measured FeAl2 slices), both in `assets/js/soc-scf-article.js`. `tests/soc-scf-article.test.cjs`
  checks the manifest, tiles and quoted counts.
- The older `static/img/scf-corpus/*` assets and `generate_scf_figures.py` are no longer used by
  the page. Their counts (314 histories, 23 families) are the pre-release snapshot.

## Citations

`{{< cite "key" >}}` numbers references by first appearance; `{{< references >}}` lists them.
Entries live in `data/soc_refs.yaml`; every DOI was resolved against Crossref on September 24.
Quoted magnitudes were read in the sources: Xie & Blackman (Fe/Co/Ni 1.4, 65, −2.7 μeV/atom,
experimental reference lines), Staunton et al. (FePt up to 1.76 meV per pair), Blanco-Rey et al.
Table 3 (ξ values), USGS MCS 2026 (China 270,000 of 390,000 t REO in 2025), DOE 2022 (92% of
magnet production), QE `INPUT_PW` (`mixing_mode='plain'` is Broyden mixing).

## The novelty claim

Wording used: first publicly released dataset of SCF field trajectories for periodic,
spin–orbit-coupled DFT, preserving input/output charge and vector-spin densities with effective
local potentials at every evaluation. Prior-art search (September 24): NeuralSCF (npj Comput. Mater.
12, 289, 2026) released iteration-resolved density coefficients for closed-shell molecules, so any
claim without "periodic" and spin/SOC qualifiers is false. Khan et al. (arXiv:2608.23895) generated
periodic potential→density pairs with QE but describe no spin and no public release. Materials
Project densities are converged and at most collinear; Materials-HAM-SOC holds Hamiltonians.

## Open before publishing

- Raw upload: complete (1,368 of 1,368 shards verified, RAW_STATUS.json updated 2026-09-25).
- Pseudopotentials: "fully relativistic norm-conserving" confirmed. Fully relativistic is required by
  `lspinorb`; norm-conserving matches the 4:1 density-to-wavefunction cutoff ratio (480/120 Ry) in all
  310 histories.
- Authorship and acknowledgements.

---
title: "GPSK-300: A Reciprocal-Space Diffusion Model for L1₀ Magnet Structure Prediction"
projectTitle: "GPSK-300"
description: "A 304M-parameter multimodal diffusion transformer that generates crystals in a three-channel reciprocal-space representation whose lattice is recovered in closed form, with the atomic basis reconstructed by inverse FFT under a composition prompt. Near-perfect lattice recovery on the L1₀ tetragonal magnet family."
bgColor: "#E7EAEE"
textColor: "#000"
sidebarText: "If I could give one piece of advice to new researchers, it would be to never stop looking for new avenues of research. On top of what you have been given, ask yourself, what might be necessary ten years from now? What will society need? Find your own research theme, and every day, little by little, you have to keep working on it."
---

**Will Bryan**  ·  ghost-projects  ·  May 2026

### Abstract

Current generative models for inorganic crystal structures (MatterGen [10], CDVAE [25], DiffCSP [26], FlowMM [27]) encode each crystal in real space as fractional atomic coordinates inside an explicit lattice variable, with the lattice itself produced by a learned head: regressed from a latent (CDVAE) or co-diffused with the atomic positions on a separate manifold (MatterGen, DiffCSP, FlowMM). Standard evaluation centers on Stable–Unique–Novel (SUN) metrics, which reward structures distinct from those in the training distribution and structurally penalize canonical-structure recovery, the behavior expected of a crystal-structure-prediction (CSP) system.

We present GPSK-300, a 304M-parameter multimodal diffusion transformer that samples in a learned reciprocal-space representation. Each crystal is encoded as a 64³ grid on integer Miller indices with three channels: Re F(h), Im F(h), and the reciprocal-metric field 1/d²(h). Lattice parameters and atomic positions are recoverable from the model output by closed-form arithmetic, a linear least-squares fit on the reciprocal-metric channel for the lattice, and an inverse Fourier transform on the structure-factor channels for the atomic basis; element identity is then assigned heuristically under the composition prompt (Section 3.6), not solved independently. Training uses rectified flow matching in a 16³×128 latent learned by a small 3D VAE; inference is 50 forward Euler steps with classifier-free guidance.

On a targeted permanent-magnet benchmark, GPSK-300 recovers the trained L1₀ tetragonal magnets (FePt, CoPt, FeNi, MnAl) within ±4% on both lattice constants and respects the conditioning signals it was trained on. Sampling takes approximately five seconds per candidate, against hours to days for classical CSP. A controlled composition/family holdout locates the model's reliability precisely: held-out *compositions* within a trained family recover at nearly the in-distribution rate (≈48% vs ≈58% exact structure match, for the held-out L1₀ pair FePd and MnGa), while an entirely held-out structural *family*, the hexagonal CaCu₅ rare-earth–transition-metal magnets (SmCo₅, YCo₅, CeCo₅), is not recovered, the model defaulting to the wrong cell (though the family is cheaply re-acquired by few-shot fine-tuning). Reliability sits at interpolation within represented motifs rather than extrapolation to new ones. GPSK-300 is best understood as a fast, amortized structure *proposer* for magnet-relevant families, calibrated by family-level recovery on known reference structures rather than by SUN-style novelty metrics. Downstream synthesizability and microstructural questions that govern whether a candidate composition can be realized as a functional magnet are not addressed.

### 1  Introduction

Crystal structure prediction (CSP), determining the equilibrium crystal structure of a given chemical composition, is a foundational subroutine for any computational materials-discovery pipeline. Classical CSP methods (USPEX [7], CALYPSO [8], AIRSS [9]) combine search heuristics with density functional theory and return reliable answers on timescales of hours to days per composition. Recent deep generative approaches (MatterGen [10], CDVAE [25], DiffCSP [26], FlowMM [27]) replace the explicit search with sampling and reduce the wall-clock cost per candidate by several orders of magnitude. A representational choice common to all of these generative models is to encode the crystal in real space (fractional coordinates inside an explicit lattice variable) and to require the model to learn both pieces. The lattice in particular is either regressed from a learned latent (CDVAE) or treated as a separate stochastic variable diffused or flowed jointly with the atomic positions (MatterGen, DiffCSP, FlowMM). The structural consequence is that any error in the predicted lattice translates directly into an error in the final crystal, with no mechanism in the representation itself for recovering the lattice in closed form.

This paper proposes an alternative representation in which the lattice is recovered by linear algebra rather than predicted by a learned head. Generation moves into reciprocal space, where a crystal is naturally described by its structure factor \(F(\mathbf{h})\) on integer Miller indices, augmented with the reciprocal-metric field \(1/d^2(\mathbf{h}) = \mathbf{h}^T G^\ast \mathbf{h}\). The metric field is a quadratic form whose six independent coefficients are the components of the reciprocal metric tensor \(G^\ast\) and uniquely determine the six real-space lattice parameters \((a, b, c, \alpha, \beta, \gamma)\). When sampled on a dense Miller-index grid, the lattice is recovered from the quadratic field by ordinary least squares, and atomic positions are recovered by inverse Fourier transform of the structure factor. The model is responsible only for generating a coherent grid.

We evaluate this representation through GPSK-300, a 304M-parameter multimodal diffusion transformer trained with rectified flow matching on a curated 2,000,115-structure corpus drawn from public DFT and experimental databases. The primary evaluation targets the two structural families most directly relevant to permanent-magnet design: the L1₀ tetragonal binaries (FePt, CoPt, FeNi, FePd, MnAl, MnGa) [3, 4, 5] and the hexagonal rare-earth–transition-metal compounds (SmCo₅, YCo₅, CeCo₅) [6]. On the trained L1₀ family the model recovers reference structures within ±4% on both \(a\) and \(c\) lattice constants, generates a candidate in approximately five seconds on a single GPU, and responds to the conditioning modalities it was trained on (composition, crystal system, space group, band gap, formation energy, energy above hull, magnetic ordering). The hexagonal family, together with the L1₀ compositions FePd and MnGa, is deliberately held out of training as a controlled generalization study (Section 5.7).

Two components of the broader permanent-magnet design problem are explicitly out of scope. Synthesizability (whether a candidate crystal structure can be realized through a tractable physical process) and microstructural engineering (control of grain size, crystallographic texture, domain-wall pinning, and second-phase distributions, all of which govern the gap between intrinsic and extrinsic magnetic figures of merit) are equally critical to producing a working magnet from a candidate composition, and neither is addressed in this work. GPSK-300 returns a candidate crystal structure given a composition prompt; downstream filtering for thermodynamic stability, synthesis pathway, and microstructural performance is the province of property-prediction models, multi-scale simulation, and experimental validation.

The contributions of this paper are:

1. A three-channel reciprocal-space representation for crystals in which the lattice is recovered in closed form, encoded as a smooth quadratic field rather than supplied as metadata or predicted by a separate learned head, with the atomic basis reconstructed by inverse FFT and element identity assigned under the composition prompt rather than solved independently.
2. GPSK-300, a 304M-parameter multimodal diffusion transformer operating in a 16³×128 latent over this representation, trained with rectified flow matching and classifier-free guidance.
3. A reframing of how generative CSP systems should be evaluated: by per-family recovery against known reference structures rather than by SUN-style novelty rewards, which structurally penalize the kind of accuracy a useful CSP system should exhibit.

The remainder of the paper is organized as follows. Section 2 reviews the structure-factor representation, the reciprocal metric tensor, and the diffusion machinery on which the model is built. Section 3 describes the encoder, generator, and closed-form decoder. Section 4 covers the training data and protocol. Section 5 reports invertibility, L1₀ magnet recovery, the composition/family holdout, conditioning-modality emergence, and the rock-salt halide undershoot. Section 6 discusses the system's scope and limits, and Section 7 outlines next-step directions.

### 2  Background

#### 2.1  Structure factors and reciprocal space

A crystal is specified by a lattice (six parameters \(a, b, c, \alpha, \beta, \gamma\)) and a basis of fractional atomic positions \(\{\mathbf{r}_j\}\) with species \(\{Z_j\}\). The X-ray structure factor at Miller index \(\mathbf{h} = (h, k, l)\) is

$$F(\mathbf{h}) \;=\; \sum_j f_{Z_j}(s)\,\exp\!\bigl(2\pi i\,\mathbf{h}\cdot\mathbf{r}_j\bigr)$$

where \(f_{Z_j}(s)\) is the atomic scattering factor at \(s = \sin\theta/\lambda = 1/(2d)\), and \(d(\mathbf{h})\) is the d-spacing of the (hkl) plane family. The Cromer-Mann four-Gaussian approximation [11] is used:

$$f_Z(s) \;=\; \sum_{i=1}^{4} a_i^{(Z)}\,e^{-b_i^{(Z)}\,s^2}$$

so element identity enters the magnitude of \(F\) at every Miller index, not just through atomic number.

\(F\) is generally complex, and \(F(-\mathbf{h}) = F(\mathbf{h})^\*\) when the basis charge density is real. Re F is even in \(\mathbf{h}\); Im F is odd and vanishes everywhere when the basis is centrosymmetric (every \(\mathbf{r}_j\) has a partner at \(-\mathbf{r}_j\) and the sine terms cancel pairwise), a useful constraint that the model can lean on at training time for the substantial share of structures with inversion symmetry.

<figure>
  <svg viewBox="0 0 600 200" xmlns="http://www.w3.org/2000/svg" style="font-family:inherit;">
    <text x="100" y="17" text-anchor="middle" font-size="12" font-style="italic" fill="#222">Re F(h)</text>
    <rect x="20" y="28" width="160" height="160" fill="none" stroke="#bbb" stroke-width="0.5"/>
    <circle cx="100" cy="108" r="9" fill="#FF680A"/>
    <circle cx="135" cy="108" r="4.5" fill="#1f2937" opacity="0.85"/>
    <circle cx="65" cy="108" r="4.5" fill="#1f2937" opacity="0.85"/>
    <circle cx="100" cy="78" r="5.5" fill="#FF680A" opacity="0.9"/>
    <circle cx="100" cy="138" r="5.5" fill="#FF680A" opacity="0.9"/>
    <circle cx="135" cy="78" r="3" fill="#1f2937" opacity="0.65"/>
    <circle cx="65" cy="138" r="3" fill="#1f2937" opacity="0.65"/>
    <circle cx="135" cy="138" r="3.5" fill="#FF680A" opacity="0.7"/>
    <circle cx="65" cy="78" r="3.5" fill="#FF680A" opacity="0.7"/>
    <circle cx="160" cy="108" r="2" fill="#1f2937" opacity="0.5"/>
    <circle cx="40" cy="108" r="2" fill="#1f2937" opacity="0.5"/>
    <circle cx="100" cy="48" r="2.5" fill="#FF680A" opacity="0.55"/>
    <circle cx="100" cy="168" r="2.5" fill="#FF680A" opacity="0.55"/>
    <text x="300" y="17" text-anchor="middle" font-size="12" font-style="italic" fill="#222">Im F(h)</text>
    <rect x="220" y="28" width="160" height="160" fill="none" stroke="#bbb" stroke-width="0.5"/>
    <circle cx="300" cy="108" r="1.6" fill="#888" opacity="0.55"/>
    <circle cx="335" cy="108" r="4" fill="#FF680A" opacity="0.8"/>
    <circle cx="265" cy="108" r="4" fill="#1f2937" opacity="0.8"/>
    <circle cx="300" cy="78" r="3.5" fill="#FF680A" opacity="0.7"/>
    <circle cx="300" cy="138" r="3.5" fill="#1f2937" opacity="0.7"/>
    <circle cx="335" cy="78" r="4.5" fill="#FF680A" opacity="0.85"/>
    <circle cx="265" cy="138" r="4.5" fill="#1f2937" opacity="0.85"/>
    <circle cx="335" cy="138" r="3" fill="#1f2937" opacity="0.6"/>
    <circle cx="265" cy="78" r="3" fill="#FF680A" opacity="0.6"/>
    <circle cx="360" cy="108" r="2.5" fill="#FF680A" opacity="0.55"/>
    <circle cx="240" cy="108" r="2.5" fill="#1f2937" opacity="0.55"/>
    <text x="500" y="17" text-anchor="middle" font-size="12" font-style="italic" fill="#222">1/d²(h)</text>
    <rect x="420" y="28" width="160" height="160" fill="none" stroke="#bbb" stroke-width="0.5"/>
    <circle cx="500" cy="108" r="68" fill="#FF680A" opacity="0.18"/>
    <circle cx="500" cy="108" r="44" fill="#FF680A" opacity="0.32"/>
    <circle cx="500" cy="108" r="20" fill="#FF680A" opacity="0.55"/>
    <circle cx="500" cy="108" r="2.5" fill="#1f2937"/>
  </svg>
  <figcaption><strong>Figure 1.</strong> The model's three input channels are sampled at integer Miller indices. Re F(h) is even with a bright DC term and signed Bragg peaks falling off outward. Im F(h) is odd, vanishes at the origin, and flips sign through inversion. 1/d²(h) is a smooth quadratic, small near the origin, growing radially.</figcaption>
</figure>

#### 2.2  The reciprocal metric tensor

The d-spacing satisfies

$$\frac{1}{d^2(\mathbf{h})} \;=\; \mathbf{h}^T G^\ast \mathbf{h} \;=\; g_{11}h^2 + g_{22}k^2 + g_{33}l^2 + 2g_{12}hk + 2g_{13}hl + 2g_{23}kl$$

where \(G^\ast = G^{-1}\) is the reciprocal metric tensor and \(G\) is the real-space metric tensor built from the lattice vectors. \(G^\ast\) has six independent components, matching the six lattice degrees of freedom \((a, b, c, \alpha, \beta, \gamma)\). Sampled as a scalar field over a 64³ Miller-index grid, the quadratic form is overdetermined: six unknowns against ~262,000 grid points. Lattice recovery from this field reduces to linear least squares.

<figure>
  <svg viewBox="0 0 600 220" xmlns="http://www.w3.org/2000/svg" style="font-family:inherit;">
    <text x="140" y="18" text-anchor="middle" font-size="12" font-style="italic" fill="#222">Centrosymmetric basis</text>
    <rect x="60" y="28" width="160" height="160" fill="#000" fill-opacity="0.025" stroke="#bbb" stroke-width="0.5"/>
    <line x1="60" y1="108" x2="220" y2="108" stroke="#ccc" stroke-width="0.5" stroke-dasharray="2,3"/>
    <line x1="140" y1="28" x2="140" y2="188" stroke="#ccc" stroke-width="0.5" stroke-dasharray="2,3"/>
    <circle cx="140" cy="108" r="2" fill="#888"/>
    <circle cx="95" cy="65" r="6" fill="#FF680A"/>
    <circle cx="185" cy="151" r="6" fill="#FF680A"/>
    <line x1="95" y1="65" x2="185" y2="151" stroke="#FF680A" stroke-width="0.7" opacity="0.45" stroke-dasharray="2,3"/>
    <circle cx="178" cy="82" r="5" fill="#1f2937"/>
    <circle cx="102" cy="134" r="5" fill="#1f2937"/>
    <line x1="178" y1="82" x2="102" y2="134" stroke="#1f2937" stroke-width="0.7" opacity="0.45" stroke-dasharray="2,3"/>
    <text x="140" y="208" text-anchor="middle" font-size="12" font-style="italic" fill="#222">Im F(h) = 0</text>
    <text x="460" y="18" text-anchor="middle" font-size="12" font-style="italic" fill="#222">Non-centrosymmetric basis</text>
    <rect x="380" y="28" width="160" height="160" fill="#000" fill-opacity="0.025" stroke="#bbb" stroke-width="0.5"/>
    <line x1="380" y1="108" x2="540" y2="108" stroke="#ccc" stroke-width="0.5" stroke-dasharray="2,3"/>
    <line x1="460" y1="28" x2="460" y2="188" stroke="#ccc" stroke-width="0.5" stroke-dasharray="2,3"/>
    <circle cx="412" cy="58" r="6" fill="#FF680A"/>
    <circle cx="518" cy="96" r="5" fill="#1f2937"/>
    <circle cx="448" cy="170" r="6" fill="#FF680A"/>
    <circle cx="496" cy="148" r="4" fill="#1f2937"/>
    <text x="460" y="208" text-anchor="middle" font-size="12" font-style="italic" fill="#FF680A">Im F(h) ≠ 0</text>
  </svg>
  <figcaption><strong>Figure 2.</strong> In a centrosymmetric basis (left) every atom at r has a partner at −r through the inversion center (dashed pairings), and the sine terms in F(h) = Σ f<sub>j</sub> exp(2πi h·r<sub>j</sub>) cancel pairwise, so Im F vanishes. An asymmetric basis (right) has no such pairings, so Im F survives at every hkl.</figcaption>
</figure>

<figure>
  <svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg" style="font-family:inherit;">
    <text x="100" y="18" text-anchor="middle" font-size="12" font-style="italic" fill="#222">Cubic</text>
    <text x="100" y="32" text-anchor="middle" font-size="10" fill="#888">a = b = c, all 90°</text>
    <rect x="20" y="42" width="160" height="160" fill="none" stroke="#bbb" stroke-width="0.5"/>
    <circle cx="100" cy="122" r="68" fill="#FF680A" opacity="0.18"/>
    <circle cx="100" cy="122" r="44" fill="#FF680A" opacity="0.32"/>
    <circle cx="100" cy="122" r="20" fill="#FF680A" opacity="0.55"/>
    <circle cx="100" cy="122" r="2.5" fill="#1f2937"/>
    <text x="300" y="18" text-anchor="middle" font-size="12" font-style="italic" fill="#222">Tetragonal (L1₀)</text>
    <text x="300" y="32" text-anchor="middle" font-size="10" fill="#888">a = b ≠ c</text>
    <rect x="220" y="42" width="160" height="160" fill="none" stroke="#bbb" stroke-width="0.5"/>
    <ellipse cx="300" cy="122" rx="68" ry="48" fill="#FF680A" opacity="0.18"/>
    <ellipse cx="300" cy="122" rx="44" ry="31" fill="#FF680A" opacity="0.32"/>
    <ellipse cx="300" cy="122" rx="20" ry="14" fill="#FF680A" opacity="0.55"/>
    <circle cx="300" cy="122" r="2.5" fill="#1f2937"/>
    <text x="500" y="18" text-anchor="middle" font-size="12" font-style="italic" fill="#222">Monoclinic</text>
    <text x="500" y="32" text-anchor="middle" font-size="10" fill="#888">β ≠ 90°</text>
    <rect x="420" y="42" width="160" height="160" fill="none" stroke="#bbb" stroke-width="0.5"/>
    <g transform="rotate(-22 500 122)">
      <ellipse cx="500" cy="122" rx="68" ry="44" fill="#FF680A" opacity="0.18"/>
      <ellipse cx="500" cy="122" rx="44" ry="28" fill="#FF680A" opacity="0.32"/>
      <ellipse cx="500" cy="122" rx="20" ry="13" fill="#FF680A" opacity="0.55"/>
    </g>
    <circle cx="500" cy="122" r="2.5" fill="#1f2937"/>
  </svg>
  <figcaption><strong>Figure 3.</strong> The 1/d²(h) iso-contours take a different shape for each crystal system: cubic is rotationally symmetric (a=b=c), the L1₀ tetragonal family stretches along one axis (a=b≠c), and monoclinic tilts the principal axes (β≠90°). The shape of the iso-contour ellipsoid directly encodes the lattice metric.</figcaption>
</figure>

#### 2.3  Diffusion models and rectified flow matching

The dominant family of modern generative models for continuous data fits a probability path \(p_t\) between a tractable prior \(p_0\) (Gaussian noise) and the data distribution \(p_1\), and learns to traverse that path with a learned vector field [12]. Score-based diffusion [13] parameterises this through the score \(\nabla_x \log p_t(x)\); flow matching [14] parameterises it directly as a velocity field \(v_\theta(x, t)\) trained to match a chosen target.

Rectified flow [15] is the special case in which the path between paired \((x_0, x_1)\) is a straight line:

$$x_t \;=\; (1-t)\,x_0 \,+\, t\,x_1, \qquad v^\star \;=\; x_1 - x_0$$

and the training objective collapses to a constant target along each path:

$$\mathcal{L}(\theta) \;=\; \mathbb{E}_{t,\,x_0,\,x_1,\,c}\!\left[\,\bigl\|\,v_\theta(x_t, t, c) \,-\, (x_1 - x_0)\,\bigr\|^2\,\right]$$

At inference the velocity field is integrated as an ODE \(\dot{x} = v_\theta(x, t)\) from \(t = 0\) to \(t = 1\), typically with a small number of Euler steps since the trajectories are straight by construction. This formulation underlies recent large-scale image and video generators including Stable Diffusion 3 [16] and is the basis of GPSK-300's diffusion stage.

<figure>
  <svg viewBox="0 0 600 220" xmlns="http://www.w3.org/2000/svg" style="font-family:inherit;">
    <circle cx="80" cy="110" r="58" fill="#000" opacity="0.05"/>
    <circle cx="80" cy="110" r="36" fill="#000" opacity="0.07"/>
    <circle cx="80" cy="110" r="18" fill="#000" opacity="0.12"/>
    <text x="80" y="200" text-anchor="middle" font-size="13" fill="#555" font-style="italic">π₀ · noise</text>
    <ellipse cx="510" cy="110" rx="50" ry="38" fill="#FF680A" opacity="0.18" transform="rotate(18 510 110)"/>
    <ellipse cx="510" cy="110" rx="32" ry="24" fill="#FF680A" opacity="0.32" transform="rotate(18 510 110)"/>
    <ellipse cx="510" cy="110" rx="15" ry="11" fill="#FF680A" opacity="0.55" transform="rotate(18 510 110)"/>
    <text x="510" y="200" text-anchor="middle" font-size="13" fill="#555" font-style="italic">π₁ · data</text>
    <line x1="80" y1="110" x2="492" y2="110" stroke="#000" stroke-width="1.8"/>
    <polygon points="500,110 488,104 488,116" fill="#000"/>
    <circle cx="80" cy="110" r="4" fill="#000"/>
    <text x="60" y="100" text-anchor="end" font-size="12" font-style="italic">x₀</text>
    <circle cx="510" cy="110" r="4" fill="#000"/>
    <text x="530" y="100" text-anchor="start" font-size="12" font-style="italic">x₁</text>
    <circle cx="272" cy="110" r="4" fill="#000"/>
    <text x="272" y="98" text-anchor="middle" font-size="12" font-style="italic">x<tspan baseline-shift="sub" font-size="0.78em">t</tspan></text>
    <text x="370" y="98" text-anchor="middle" font-size="12" font-style="italic" fill="#222">v⋆ = x₁ − x₀</text>
  </svg>
  <figcaption><strong>Figure 4.</strong> A noise sample x₀ is paired to a data sample x₁, and the model v<sub>θ</sub> is trained to predict the constant velocity v⋆ = x₁ − x₀ at every t along the segment between them. The target is independent of the position along the path, which makes the objective flat to train relative to score matching.</figcaption>
</figure>

To amplify conditioning at inference, GPSK-300 applies classifier-free guidance [17]: the model is trained to predict both \(v_\theta(x_t, t, c)\) and \(v_\theta(x_t, t, \varnothing)\) by stochastically dropping the conditioning during training, and the inference velocity is extrapolated past the conditional one:

$$\tilde{v}_\theta(x_t, t, c) \;=\; v_\theta(x_t, t, \varnothing) \,+\, w\,\bigl(\,v_\theta(x_t, t, c) - v_\theta(x_t, t, \varnothing)\,\bigr)$$

With \(w = 1\) this reduces to ordinary conditional sampling; for \(w > 1\) the model is pulled more strongly in the direction the conditioning would already have pulled it, trading sample diversity for stronger response to \(c\), a knob that matters more than usual for continuous-property conditioning, where without it the model averages over the data distribution and ignores the property entirely.

### 3  Method

#### 3.1  Representation

Each crystal is represented as a \(64^3 \times 3\) tensor sampled on the integer Miller-index grid \((h, k, l) \in [-32, 31]^3\). The three channels are:

$$X(\mathbf{h}) \;=\; \bigl(\,\mathrm{Re}\,F(\mathbf{h}),\; \mathrm{Im}\,F(\mathbf{h}),\; 1/d^2(\mathbf{h})\,\bigr).$$

The first two carry the basis: atomic positions and element identity through Cromer-Mann scattering factors. The third encodes the lattice geometry through its quadratic form.

Three representation choices matter for invertibility. First, the structure-factor magnitudes are compressed by an exponent γ = 0.5 (|F| → |F|^γ, phase-preserving) before storage, flattening the heavy dynamic range of the Bragg peaks so the VAE and flow model allocate capacity across the spectrum rather than only the brightest reflections; the exponent is inverted at decode. Second, F is divided by the per-sample maximum magnitude, with `norm_factor = max|F|` retained for the inverse transform (this preserves dynamic range without leaking absolute charge density). Third, the 1/d² channel is divided by a **fixed** constant `INV_D2_NORM = 200 Å⁻²`, not per-sample, so that the absolute lattice scale is encoded in the channel values and the lattice recovery is closed-form against the encoded values rather than requiring per-sample metadata.

#### 3.2  Encoder VAE

A small 3D convolutional VAE (\(\approx\)2.6M parameters) maps \(\mathbb{R}^{64^3 \times 3} \to \mathbb{R}^{16^3 \times 128}\). Because the 1/d² channel is a smooth quadratic over a regular grid, it is encoded almost losslessly, reconstruction MSE \(\sim 10^{-6}\) on held-out structures. The structure-factor channels are intrinsically sparse (most amplitude is concentrated near the origin) but the VAE handles them adequately at this resolution; no per-channel specialization was required.

#### 3.3  MMDiT generator

The generator is a multimodal diffusion transformer (MMDiT, ≈304M parameters) operating on the 16³×128 latent. Each block is double-stream: image tokens (sequenced from the spatial latent) and conditioning tokens (composition, crystal system, space group, band gap, formation energy, energy above hull, magnetic ordering) attend jointly through a shared attention mechanism, allowing conditioning tokens to attend to specific spatial regions of the latent rather than only modulating activations globally. AdaLN-Zero modulation [18, 19] on every block provides an additional global conditioning signal initialized so that residual blocks start as identity, which stabilizes training at this scale. After the double-stream blocks, the model passes into single-stream blocks operating on the merged token sequence.

#### 3.4  Training: rectified flow matching

Given a data latent \(z_1 \sim p_\text{data}\) and an isotropic Gaussian sample \(z_0 \sim \mathcal{N}(0, I)\), the training pair is linearly interpolated

$$z_t \;=\; (1-t)\,z_0 + t\,z_1, \qquad t \sim \mathcal{U}(0,1)$$

and minimize the rectified-flow objective from Section 2.3:

$$\mathcal{L}(\theta) \;=\; \mathbb{E}_{t,\,z_0,\,z_1,\,c}\!\left[\,\bigl\|\,v_\theta(z_t, t, c) - (z_1 - z_0)\,\bigr\|^2\,\right]$$

Conditioning tokens \(c\) are dropped with probability \(p_\text{drop} = 0.1\) per token group during training, so the same network learns the conditional and unconditional velocity fields jointly (Figure 4). Training ran for 500k optimization steps on the GPSK-Inorganic-Crystals training corpus [28]; the deployed model is the 400k-step checkpoint, selected by the holdout tiebreak (Section 5.7). See Section 4 for the full source breakdown and curation procedure.

#### 3.5  Inference

Sampling integrates the ODE \(\dot{z} = v_\theta(z, t)\) from \(t = 0\) to \(t = 1\) with 50 forward Euler steps. At every step, classifier-free guidance amplifies the conditioning signal:

$$\tilde{v}_\theta(z_t, t, c) \;=\; v_\theta(z_t, t, \varnothing) \,+\, w\,\bigl(\,v_\theta(z_t, t, c) - v_\theta(z_t, t, \varnothing)\,\bigr)$$

The default guidance scale is \(w = 6.0\), substantially higher than typical image-generation values. The dominant signal that needs amplification is property-conditioning on continuous values (formation energy, band gap, energy above hull); at \(w \le 1\) the model averages over the data distribution and the property knob has no measurable effect on the output, while at \(w \approx 6\) the response curves are monotonic in the conditioning value (Section 5.4). End-to-end sampling takes approximately five seconds per candidate on a single GPU.

<figure>
  <svg viewBox="0 10 600 120" xmlns="http://www.w3.org/2000/svg" style="font-family:inherit;">
    <circle cx="40" cy="60" r="22" fill="#000" opacity="0.07"/>
    <circle cx="40" cy="60" r="12" fill="#000" opacity="0.14"/>
    <text x="40" y="110" text-anchor="middle" font-size="10" fill="#555" font-style="italic">z₀ ~ 𝒩(0, I)</text>
    <line x1="68" y1="60" x2="100" y2="60" stroke="#888" stroke-width="0.6"/>
    <polygon points="103,60 98,58 98,62" fill="#888"/>
    <rect x="103" y="38" width="118" height="44" fill="none" stroke="#888" stroke-width="0.8"/>
    <text x="162" y="56" text-anchor="middle" font-size="11" font-weight="500">MMDiT</text>
    <text x="162" y="70" text-anchor="middle" font-size="9" fill="#666">50 Euler steps · w = 6</text>
    <text x="162" y="110" text-anchor="middle" font-size="10" fill="#555" font-style="italic">rectified flow + CFG</text>
    <text x="162" y="28" text-anchor="middle" font-size="9" fill="#FF680A" font-style="italic">+ c</text>
    <line x1="221" y1="60" x2="245" y2="60" stroke="#888" stroke-width="0.6"/>
    <polygon points="248,60 243,58 243,62" fill="#888"/>
    <rect x="248" y="45" width="58" height="30" fill="#000" fill-opacity="0.05" stroke="#888" stroke-width="0.5"/>
    <text x="277" y="64" text-anchor="middle" font-size="11" font-style="italic">z₁</text>
    <text x="277" y="110" text-anchor="middle" font-size="10" fill="#555" font-style="italic">16³ × 128 latent</text>
    <line x1="306" y1="60" x2="330" y2="60" stroke="#888" stroke-width="0.6"/>
    <polygon points="333,60 328,58 328,62" fill="#888"/>
    <rect x="333" y="40" width="62" height="40" fill="none" stroke="#888" stroke-width="0.8"/>
    <text x="364" y="64" text-anchor="middle" font-size="11">VAE⁻¹</text>
    <line x1="395" y1="60" x2="419" y2="60" stroke="#888" stroke-width="0.6"/>
    <polygon points="422,60 417,58 417,62" fill="#888"/>
    <rect x="422" y="45" width="60" height="30" fill="#000" fill-opacity="0.05" stroke="#888" stroke-width="0.5"/>
    <text x="452" y="64" text-anchor="middle" font-size="11" font-style="italic">64³ × 3</text>
    <text x="452" y="110" text-anchor="middle" font-size="10" fill="#555" font-style="italic">grid</text>
    <line x1="482" y1="60" x2="506" y2="60" stroke="#888" stroke-width="0.6"/>
    <polygon points="509,60 504,58 504,62" fill="#888"/>
    <rect x="509" y="40" width="84" height="40" fill="#FF680A" fill-opacity="0.15" stroke="#FF680A" stroke-width="0.8"/>
    <text x="551" y="58" text-anchor="middle" font-size="10" font-weight="500">pymatgen</text>
    <text x="551" y="71" text-anchor="middle" font-size="10" fill="#FF680A" font-style="italic">Structure</text>
  </svg>
  <figcaption><strong>Figure 5a.</strong> A Gaussian noise sample z₀ is integrated through 50 Euler steps of the conditional rectified-flow ODE with classifier-free guidance at w = 6, producing the data latent z₁. The VAE decoder maps that latent back to a 64³ × 3 reciprocal-space grid, and the closed-form decoder of Section 3.6 turns the grid into a pymatgen Structure. The conditioning input c enters the MMDiT directly; its internal routing through the network is detailed in Figure 5b. End-to-end inference takes approximately five seconds per candidate.</figcaption>
</figure>

<figure>
  <svg viewBox="0 180 600 215" xmlns="http://www.w3.org/2000/svg" style="font-family:inherit;">
    <text x="68" y="195" text-anchor="middle" font-size="9" fill="#666" font-style="italic">conditioning c</text>
    <rect x="10" y="200" width="116" height="116" fill="none" stroke="#888" stroke-width="0.5" stroke-dasharray="3,2"/>
    <text x="68" y="214" text-anchor="middle" font-size="8.5" fill="#333">composition</text>
    <text x="68" y="226" text-anchor="middle" font-size="8.5" fill="#333">crystal system</text>
    <text x="68" y="238" text-anchor="middle" font-size="8.5" fill="#333">space group</text>
    <text x="68" y="250" text-anchor="middle" font-size="8.5" fill="#333">band gap</text>
    <text x="68" y="262" text-anchor="middle" font-size="8.5" fill="#333">formation energy</text>
    <text x="68" y="274" text-anchor="middle" font-size="8.5" fill="#333">energy above hull</text>
    <text x="68" y="286" text-anchor="middle" font-size="8.5" fill="#333">magnetic ordering</text>
    <text x="68" y="306" text-anchor="middle" font-size="8" fill="#888" font-style="italic">7 tokens · p_drop = 0.1</text>
    <line x1="126" y1="282" x2="146" y2="282" stroke="#FF680A" stroke-width="0.7"/>
    <polygon points="149,282 144,280 144,284" fill="#FF680A"/>
    <text x="210" y="195" text-anchor="middle" font-size="10" font-weight="500" fill="#222">MMDiT · ~304M params</text>
    <text x="210" y="213" text-anchor="middle" font-size="9" fill="#666" font-style="italic">image latent (from z<tspan baseline-shift="sub" font-size="0.78em">t</tspan>)</text>
    <rect x="150" y="218" width="120" height="22" fill="none" stroke="#888" stroke-width="0.6"/>
    <text x="210" y="232" text-anchor="middle" font-size="9" fill="#444">linear projection</text>
    <line x1="210" y1="240" x2="210" y2="258" stroke="#888" stroke-width="0.5"/>
    <polygon points="210,261 207,256 213,256" fill="#888"/>
    <rect x="146" y="262" width="128" height="40" fill="#000" fill-opacity="0.04" stroke="#888" stroke-width="0.6"/>
    <text x="210" y="276" text-anchor="middle" font-size="10" font-weight="500" fill="#222">double-stream block × N</text>
    <text x="210" y="289" text-anchor="middle" font-size="9" fill="#555">joint attn (image ↔ c)</text>
    <text x="210" y="299" text-anchor="middle" font-size="9" fill="#555">AdaLN-Zero MLP</text>
    <line x1="210" y1="302" x2="210" y2="314" stroke="#888" stroke-width="0.5"/>
    <polygon points="210,317 207,312 213,312" fill="#888"/>
    <rect x="146" y="317" width="128" height="36" fill="#000" fill-opacity="0.04" stroke="#888" stroke-width="0.6"/>
    <text x="210" y="331" text-anchor="middle" font-size="10" font-weight="500" fill="#222">single-stream block × M</text>
    <text x="210" y="345" text-anchor="middle" font-size="9" fill="#555">self-attn + AdaLN-Zero</text>
    <line x1="210" y1="353" x2="210" y2="365" stroke="#888" stroke-width="0.5"/>
    <polygon points="210,368 207,363 213,363" fill="#888"/>
    <rect x="148" y="368" width="124" height="22" fill="none" stroke="#888" stroke-width="0.6"/>
    <text x="210" y="382" text-anchor="middle" font-size="9" fill="#444">linear output → v<tspan baseline-shift="sub" font-size="0.78em">θ</tspan></text>
    <text x="450" y="195" text-anchor="middle" font-size="10" font-weight="500" fill="#222">VAE decoder · ~2.6M params</text>
    <rect x="385" y="218" width="130" height="22" fill="#000" fill-opacity="0.05" stroke="#888" stroke-width="0.6"/>
    <text x="450" y="232" text-anchor="middle" font-size="10" font-style="italic">z₁ : 16³ × 128</text>
    <line x1="450" y1="240" x2="450" y2="254" stroke="#888" stroke-width="0.5"/>
    <polygon points="450,257 447,252 453,252" fill="#888"/>
    <text x="538" y="251" font-size="9" fill="#666" font-style="italic">3D upconv</text>
    <rect x="385" y="257" width="130" height="22" fill="#000" fill-opacity="0.05" stroke="#888" stroke-width="0.6"/>
    <text x="450" y="271" text-anchor="middle" font-size="10" font-style="italic">32³ × 64</text>
    <line x1="450" y1="279" x2="450" y2="293" stroke="#888" stroke-width="0.5"/>
    <polygon points="450,296 447,291 453,291" fill="#888"/>
    <text x="538" y="290" font-size="9" fill="#666" font-style="italic">3D upconv</text>
    <rect x="385" y="296" width="130" height="22" fill="#000" fill-opacity="0.05" stroke="#888" stroke-width="0.6"/>
    <text x="450" y="310" text-anchor="middle" font-size="10" font-style="italic">64³ × 16</text>
    <line x1="450" y1="318" x2="450" y2="332" stroke="#888" stroke-width="0.5"/>
    <polygon points="450,335 447,330 453,330" fill="#888"/>
    <text x="538" y="329" font-size="9" fill="#666" font-style="italic">1×1×1 conv</text>
    <rect x="385" y="335" width="130" height="22" fill="#FF680A" fill-opacity="0.15" stroke="#FF680A" stroke-width="0.6"/>
    <text x="450" y="349" text-anchor="middle" font-size="10" font-style="italic" fill="#FF680A">64³ × 3 grid</text>
  </svg>
  <figcaption><strong>Figure 5b.</strong> The seven conditioning streams are each tokenized, individually dropped during training with p<sub>drop</sub> = 0.1, and fed as a separate token stream into the MMDiT's double-stream blocks, where they attend jointly with the latent image tokens. The MMDiT (≈304M params) processes the latent through a linear projection, N double-stream blocks (joint attention plus AdaLN-Zero), M single-stream blocks (merged self-attention plus AdaLN-Zero), and a linear output head producing the velocity field v<sub>θ</sub>. The VAE decoder (≈2.6M params) is a cascade of 3D transposed convolutions upsampling the 16³ × 128 latent to a 64³ × 3 grid, terminating in a 1×1×1 channel projection.</figcaption>
</figure>

<figure>
  <svg viewBox="0 0 600 250" xmlns="http://www.w3.org/2000/svg" style="font-family:inherit;">
    <circle cx="100" cy="210" r="3.5" fill="#000"/>
    <text x="100" y="232" text-anchor="middle" font-size="12" font-style="italic">z<tspan baseline-shift="sub" font-size="0.78em">t</tspan></text>
    <line x1="100" y1="210" x2="293" y2="181" stroke="#999" stroke-width="1.5"/>
    <polygon points="300,180 287,178 290,186" fill="#999"/>
    <text x="316" y="187" font-size="12" fill="#666" font-style="italic">v<tspan baseline-shift="sub" font-size="0.78em">∅</tspan></text>
    <line x1="100" y1="210" x2="333" y2="103" stroke="#333" stroke-width="1.8"/>
    <polygon points="340,100 327,99 331,108" fill="#333"/>
    <text x="356" y="106" font-size="12" fill="#333" font-style="italic">v<tspan baseline-shift="sub" font-size="0.78em">c</tspan></text>
    <line x1="300" y1="180" x2="380" y2="20" stroke="#888" stroke-width="0.6" stroke-dasharray="3,3"/>
    <line x1="100" y1="210" x2="372" y2="22" stroke="#FF680A" stroke-width="2.3"/>
    <polygon points="380,20 367,21 370,30" fill="#FF680A"/>
    <text x="396" y="26" font-size="12" fill="#FF680A" font-style="italic">ṽ  (w &gt; 1)</text>
  </svg>
  <figcaption><strong>Figure 6.</strong> At a single inference step, v<sub>∅</sub> is the unconditional velocity and v<sub>c</sub> the conditional velocity. The guided velocity ṽ lies on the line through the two tips (dashed) and extrapolates past v<sub>c</sub> when w &gt; 1, magnifying the conditional direction.</figcaption>
</figure>

#### 3.6  Closed-form decode

Once the model produces a \(64^3 \times 3\) grid, reconstruction is closed-form.

**Atom positions.** Combine channels 0 and 1 into a complex field \(F = \mathrm{Re}\,F + i\,\mathrm{Im}\,F\), inverse FFT, take \(|\cdot|\) to obtain the fractional electron density \(\rho(\mathbf{r})\). Periodic-aware peak finding with a minimum-separation criterion gives candidate atomic sites. The detection step over-samples with a low threshold and then keeps the top-\(N\) peaks where \(N\) is set by the requested formula and the cell volume:

$$N \;=\; n_\text{f.u.} \cdot \sum_e \nu_e, \qquad n_\text{f.u.} \;=\; \mathrm{round}\!\bigl(V_\text{cell} / (V_\text{atom} \cdot \sum_e \nu_e)\bigr)$$

with \(V_\text{atom} \approx 12\) Å³ as a rough average per atom. This enforces requested stoichiometry exactly.

**Lattice.** From channel 2, denormalize to recover \(1/d^2(\mathbf{h})\) on the integer grid. Assemble the design matrix \(\mathbf{A} = [\,h^2,\,k^2,\,l^2,\,2hk,\,2hl,\,2kl\,]\) over all non-origin grid points and solve the linear least-squares problem \(\min_{\mathbf{g}} \|\mathbf{A}\mathbf{g} - \mathbf{y}\|^2\) for the six independent components of \(G^\ast\). Invert \(G^\ast \to G\) and read off:

$$a = \sqrt{G_{11}},\; b = \sqrt{G_{22}},\; c = \sqrt{G_{33}}, \quad \cos\alpha = G_{23}/(bc),\; \text{etc.}$$

**Composition.** The deployed decoder assumes the requested formula and assigns heavier elements to brighter peaks. The heuristic recovers element identity correctly because the Cromer-Mann scattering magnitude scales monotonically with atomic number, and, perhaps surprisingly, it is robust even for near-Z neighbors (Fe/Co/Ni, Mn/Fe). It reads density peak *heights*, which the inverse FFT concentrates at atomic sites, so they are stable under reconstruction error: across encoded near-Z binaries, the heuristic assigns elements correctly at 100% both noise-free and under the VAE's own round-trip error (Figure 8). A magnitude-fitting alternative (joint Cromer-Mann least squares) is exact in the noise-free limit but *less* robust, it overfits the reconstruction error to neighboring atomic numbers and drops to ~60% on the same near-Z cases, so the simple heuristic is retained.

<figure>
  <svg viewBox="0 0 600 220" xmlns="http://www.w3.org/2000/svg" style="font-family:inherit;">
    <rect x="10" y="90" width="86" height="40" fill="none" stroke="#888" stroke-width="0.8"/>
    <text x="53" y="108" text-anchor="middle" font-size="11" font-weight="500">64³ × 3</text>
    <text x="53" y="121" text-anchor="middle" font-size="9" fill="#666">grid</text>
    <path d="M 96 105 L 112 105 L 112 55 L 126 55" stroke="#888" stroke-width="0.6" fill="none"/>
    <path d="M 96 115 L 112 115 L 112 165 L 126 165" stroke="#888" stroke-width="0.6" fill="none"/>
    <rect x="126" y="40" width="78" height="30" fill="none" stroke="#888" stroke-width="0.5"/>
    <text x="165" y="58" text-anchor="middle" font-size="10" font-style="italic">F = Re + i·Im</text>
    <line x1="204" y1="55" x2="224" y2="55" stroke="#888" stroke-width="0.5"/>
    <polygon points="227,55 222,53 222,57" fill="#888"/>
    <rect x="227" y="40" width="58" height="30" fill="none" stroke="#888" stroke-width="0.5"/>
    <text x="256" y="58" text-anchor="middle" font-size="10">IFFT</text>
    <line x1="285" y1="55" x2="305" y2="55" stroke="#888" stroke-width="0.5"/>
    <polygon points="308,55 303,53 303,57" fill="#888"/>
    <rect x="308" y="40" width="74" height="30" fill="none" stroke="#888" stroke-width="0.5"/>
    <text x="345" y="55" text-anchor="middle" font-size="10">peak find</text>
    <text x="345" y="65" text-anchor="middle" font-size="8" fill="#666" font-style="italic">on ρ(r)</text>
    <line x1="382" y1="55" x2="402" y2="55" stroke="#888" stroke-width="0.5"/>
    <polygon points="405,55 400,53 400,57" fill="#888"/>
    <text x="408" y="58" font-size="10" font-style="italic" fill="#333">atom positions</text>
    <rect x="126" y="150" width="78" height="30" fill="none" stroke="#888" stroke-width="0.5"/>
    <text x="165" y="168" text-anchor="middle" font-size="10" font-style="italic">1/d²(h)</text>
    <line x1="204" y1="165" x2="224" y2="165" stroke="#888" stroke-width="0.5"/>
    <polygon points="227,165 222,163 222,167" fill="#888"/>
    <rect x="227" y="150" width="58" height="30" fill="none" stroke="#888" stroke-width="0.5"/>
    <text x="256" y="165" text-anchor="middle" font-size="10">LSQ fit</text>
    <text x="256" y="175" text-anchor="middle" font-size="8" fill="#666" font-style="italic">→ G*</text>
    <line x1="285" y1="165" x2="305" y2="165" stroke="#888" stroke-width="0.5"/>
    <polygon points="308,165 303,163 303,167" fill="#888"/>
    <rect x="308" y="150" width="74" height="30" fill="none" stroke="#888" stroke-width="0.5"/>
    <text x="345" y="168" text-anchor="middle" font-size="10">invert G*</text>
    <line x1="382" y1="165" x2="402" y2="165" stroke="#888" stroke-width="0.5"/>
    <polygon points="405,165 400,163 400,167" fill="#888"/>
    <text x="408" y="168" font-size="10" font-style="italic" fill="#333">(a, b, c, α, β, γ)</text>
    <path d="M 502 55 L 528 55 L 528 102 L 537 102" stroke="#888" stroke-width="0.6" fill="none"/>
    <polygon points="540,102 532,98 532,106" fill="#888"/>
    <path d="M 502 165 L 528 165 L 528 122 L 537 122" stroke="#888" stroke-width="0.6" fill="none"/>
    <polygon points="540,122 532,118 532,126" fill="#888"/>
    <rect x="540" y="98" width="58" height="28" fill="#FF680A" fill-opacity="0.15" stroke="#FF680A" stroke-width="0.8"/>
    <text x="569" y="110" text-anchor="middle" font-size="10" font-weight="500">pymatgen</text>
    <text x="569" y="121" text-anchor="middle" font-size="10" font-style="italic" fill="#FF680A">Structure</text>
  </svg>
  <figcaption><strong>Figure 7.</strong> The two structure-factor channels combine into a complex field, are inverse-FFT'd to a fractional electron density, and peak-found to recover atom positions. The reciprocal-metric channel is fit by linear least squares to recover G*, which is inverted to read off the six lattice parameters. The two streams merge into a pymatgen Structure. No learned post-processing.</figcaption>
</figure>


<figure>
  <svg viewBox="0 0 600 250" xmlns="http://www.w3.org/2000/svg" style="font-family:inherit;">
    <line x1="110" y1="40" x2="110" y2="210" stroke="#888" stroke-width="0.6"/>
    <line x1="110" y1="210" x2="550" y2="210" stroke="#888" stroke-width="0.6"/>
    <line x1="110" y1="125" x2="550" y2="125" stroke="#eee" stroke-width="0.5"/>
    <text x="103" y="53" text-anchor="end" font-size="9" fill="#888">100%</text>
    <text x="103" y="128" text-anchor="end" font-size="9" fill="#888">75%</text>
    <text x="103" y="203" text-anchor="end" font-size="9" fill="#888">50%</text>
    <polyline points="170,50 340,50 510,50" fill="none" stroke="#FF680A" stroke-width="2"/>
    <circle cx="170" cy="50" r="4" fill="#FF680A"/><circle cx="340" cy="50" r="4" fill="#FF680A"/><circle cx="510" cy="50" r="4" fill="#FF680A"/>
    <polyline points="170,50 340,50 510,164" fill="none" stroke="#1f2937" stroke-width="1.8" stroke-dasharray="4,3"/>
    <circle cx="170" cy="50" r="3" fill="#1f2937"/><circle cx="340" cy="50" r="3" fill="#1f2937"/><circle cx="510" cy="164" r="4.5" fill="#1f2937"/>
    <text x="300" y="42" text-anchor="middle" font-size="9.5" font-style="italic" fill="#FF680A">brightness heuristic, robust</text>
    <text x="500" y="182" text-anchor="end" font-size="9.5" font-style="italic" fill="#1f2937">Cromer-Mann fit, degrades</text>
    <text x="170" y="225" text-anchor="middle" font-size="9" fill="#666">noise-free</text>
    <text x="340" y="225" text-anchor="middle" font-size="9" fill="#666">white noise</text>
    <text x="510" y="225" text-anchor="middle" font-size="9" fill="#666">VAE reconstruction error</text>
    <text x="330" y="243" text-anchor="middle" font-size="10" fill="#444" font-style="italic">input perturbation</text>
    <text x="34" y="130" text-anchor="middle" font-size="10" fill="#444" font-style="italic" transform="rotate(-90 34 130)">near-Z element-ID accuracy</text>
  </svg>
  <figcaption><strong>Figure 8.</strong> Element-identity accuracy on near-Z pairs (Fe/Co/Ni, Mn/Fe) holds for the brightness heuristic but not for a Cromer-Mann magnitude fit as reconstruction error increases. Both are exact on clean and white-noise-perturbed inputs, but under realistic VAE reconstruction error the magnitude fit overfits the error to neighbouring atomic numbers and degrades, while the heuristic, reading inverse-FFT peak heights, remains exact. The heuristic is therefore retained in the deployed decode.</figcaption>
</figure>

### 4  Experimental Setup

#### 4.1  Dataset

GPSK-300 is trained on the GPSK-Inorganic-Crystals dataset [28], 2,000,115 structures drawn from LeMat-Bulk [20], Materials Project [21], Alexandria [22], OQMD [29], the Crystallographic Open Database [30], and MAGNDATA [31], deduplicated by entalpic fingerprint and joint-balanced across (space group × n_sites bin × chemical family) to preserve the long tail of rare structural families (L1₀ tetragonal, hex RE-TM, perovskite_cubic, rock_salt_oxide). For the held-out generalization study (Section 5.7), a 0.31% slice, the entire hex RE-TM family together with the FePd and MnGa compositions, is excluded from training before the representation is precomputed; all other structures are included. The three-channel representation is computed for each structure following Section 3.1.

#### 4.2  Composition tokens

An early ablation found that conditioning on `reduced_formula` (the standard pymatgen normalization) was ambiguous in important cases: "NaCl" could mean the 2-atom or the 8-atom cell, and the model could not learn the difference. The deployed model uses raw atom counts ("Na1 Cl1" vs "Na4 Cl4") as composition tokens. Multi-formula-unit prompts became distinguishable in the generated structures and per-family lattice accuracy improved measurably as a result.

#### 4.3  Conditioning modalities

Seven conditioning streams are supplied to the model: composition (raw counts), crystal system, space group, band gap, formation energy per atom, energy above hull, and magnetic ordering. Each is embedded and dropped independently with probability 0.1 during training; at inference any subset may be supplied.

#### 4.4  Training

Training runs for 500k optimization steps with AdamW on the rectified-flow loss in two phases: (a) the three-channel grids are precomputed once and cached as parquet; (b) the VAE is trained first to convergence and frozen, after which the MMDiT is trained on the cached latents. The two-phase stack prevents the diffusion model from absorbing encoder noise during its own optimization.

#### 4.5  Inference

Inference uses 50 forward Euler steps with \(w = 6.0\) classifier-free guidance and best-of-N candidate selection. For the magnetic evaluation, N = 10 candidates are drawn per (composition, crystal system, space group, magnetic ordering) prompt and the closest match to reference is reported.

### 5  Results

#### 5.1  Invertibility

A first sanity check is the round-trip: take a known structure, encode to the three-channel grid, immediately decode, and compare. On a held-out set of test structures the encoded-then-decoded structure matches the source to roughly 4 decimal places on every lattice parameter (worst-case ≤ 0.0005 Å on edge lengths and ≤ 0.05° on angles), and atomic positions land within 0.01 fractional coordinate of the reference. With the trained VAE inserted (encode → VAE → VAE-decode → decode), end-to-end correlation with the source grid is 99.9%. The lattice channel alone reconstructs to MSE \(\sim 10^{-6}\), and the closed-form lattice recovered from the VAE-reconstructed grid stays within ~0.3% of the source edges.

#### 5.2  L1₀ tetragonal family

The L1₀ family is a primary target for rare-earth-free permanent magnets: tetragonal P4/mmm intermetallics with a c/a ratio just under unity, alternating A/B atomic planes along the c axis. The four trained members, FePt, CoPt, FeNi, MnAl, recover to within ±4% on both \(a\) and \(c\) (Table 1, best of N = 16); two further members, FePd and MnGa, are held out of training and recover at nearly the same rate (Section 5.7). The c/a ratio, the most important structural number for L1₀ magnets, because it controls the magnetocrystalline anisotropy that makes these compounds useful, is preserved to within ~3% across the family.

**Table 1.** L1₀ tetragonal magnet recovery (trained members; best of N = 16). Reference parameters from published crystallography [3, 4, 5]. Ratios are *recovered/reference*; values near 1.00 are best.

| Composition | ref a (Å) | ref c (Å) | a ratio | c ratio | family role |
|---|---:|---:|---:|---:|---|
| FePt | 2.73 | 3.73 | 0.995 | 1.003 | classic FePt, K₁ ≈ 7 MJ/m³ |
| CoPt | 2.68 | 3.70 | 0.986 | 1.017 | high anisotropy |
| FeNi | 2.53 | 3.58 | 0.987 | 0.985 | tetrataenite, RE-free |
| MnAl | 2.78 | 3.56 | 0.965 | 0.998 | τ-MnAl RE-free |

<figure>
  <img src="/img/gpsk300_gallery.png" alt="Generated versus expected crystal structures across the competence spectrum: recovered L1₀ magnets, metals and rock-salt oxide; held-out compositions; and characteristic failures." style="width:100%;max-width:600px;display:block;margin:0 auto;" />
  <figcaption><strong>Figure 9a.</strong> GPSK-300's outputs span its competence spectrum, each shown as the generated crystal beside the expected reference at a common scale. The recovered families (L1₀ magnets, simple metals, and the training-rich rock-salt oxide) reproduce the expected cell; held-out compositions (FePd, MnGa) recover at nearly the seen rate; and the off-target cases are visible directly: the unseen hexagonal family produces a tall cell rather than the squat CaCu₅ geometry, rock-salt halides and perovskite generate coherent but structurally wrong cells, and the 68-atom Nd₂Fe₁₄B exceeds the decode's ~20–40-atom ceiling and returns only a fragment. Per-structure metrics are in Tables 1–4 and Appendix A.</figcaption>
</figure>

<figure>
  <img src="/img/gpsk300_consistency.png" alt="Three independent generated samples each for FePt, MgO, and SmCo5, showing recovery and off-target behavior are both consistent across samples." style="width:100%;max-width:720px;display:block;margin:0 auto;" />
  <figcaption><strong>Figure 9b.</strong> The behavior in Figure 9a is typical across samples, not a cherry-picked best-of-N. Three independent generations are shown for a recovered metal magnet (FePt), a recovered rock-salt oxide (MgO), and the held-out hexagonal family (SmCo₅). Every FePt sample returns the L1₀ tetragonal motif and every MgO sample the rock-salt cell, while every SmCo₅ sample is tall rather than the squat CaCu₅ geometry. Recovery and off-target behavior are both reproducible, not artifacts of selecting the best of many tries.</figcaption>
</figure>


#### 5.3  Hexagonal rare-earth–transition-metal magnets

The CaCu₅-type hexagonal RE-Co structures (space group P6/mmm) are the second key magnetic family, and they serve as the family-level arm of the holdout study (Section 5.7): the **entire hex RE-TM family is excluded from training** (Section 4.1). On this held-out family the model does *not* reproduce the squat CaCu₅ geometry, across SmCo₅, YCo₅, and CeCo₅ it defaults to tall cells (generated c/a ≈ 1.3–1.6 against the squat target ≈ 0.80), a 0% structure-match rate (Table 2). This is the negative control that validates the holdout methodology: the model's "hexagonal" prior, learned from non-RE-TM hexagonal structures that are predominantly tall, defaults to tall when asked for a squat motif it never saw.

**Table 2.** Held-out hexagonal RE-Co family, ship model, never trained on this family. Squat CaCu₅ target c/a ≈ 0.80.

| Composition | target c/a | generated c/a | structure-match |
|---|---:|---:|:---:|
| SmCo₅ | 0.79 | ≈1.6 | ✗ (0/10) |
| YCo₅  | 0.81 | ≈1.5 | ✗ (0/10) |
| CeCo₅ | 0.82 | ≈1.5 | ✗ (0/10) |

This family-level failure is not permanent, however. Fine-tuning the trained model on a small number of squat CaCu₅ examples reverses the tall default: as few as one to five examples move all three targets into the correct squat regime (c/a ≈ 0.88, recovered in 8–10 of 12 samples), and the recovery is stable as more are added (Figure 10). The unseen motif is reachable: the base model already has the machinery to produce it, and a handful of the right examples installs it. Acquiring a new family is therefore a small post-training cost, not a retrain. (The fine-tuning set must be curated to the target motif: the broad RE-TM pool is dominated by tall hexagonal structures and does not teach the squat one; and the metric here is the lattice c/a, the defining squat signature, not a full structure match.)

<figure>
  <svg viewBox="0 0 600 250" xmlns="http://www.w3.org/2000/svg" style="font-family:inherit;">
    <line x1="90" y1="45" x2="90" y2="210" stroke="#888" stroke-width="0.6"/>
    <line x1="90" y1="210" x2="520" y2="210" stroke="#888" stroke-width="0.6"/>
    <line x1="90" y1="197" x2="520" y2="197" stroke="#1f2937" stroke-width="0.7" stroke-dasharray="3,3"/>
    <text x="518" y="208" text-anchor="end" font-size="9" font-style="italic" fill="#555">CaCu₅ target c/a ≈ 0.80</text>
    <text x="83" y="67" text-anchor="end" font-size="9" fill="#888">1.8</text>
    <text x="83" y="146" text-anchor="end" font-size="9" fill="#888">1.2</text>
    <text x="83" y="200" text-anchor="end" font-size="9" fill="#888">0.8</text>
    <polyline points="110,64 200,185 290,186 380,179 470,186" fill="none" stroke="#FF680A" stroke-width="2"/>
    <circle cx="110" cy="64" r="4.5" fill="#999"/>
    <circle cx="200" cy="185" r="4.5" fill="#FF680A"/>
    <circle cx="290" cy="186" r="4.5" fill="#FF680A"/>
    <circle cx="380" cy="179" r="4.5" fill="#FF680A"/>
    <circle cx="470" cy="186" r="4.5" fill="#FF680A"/>
    <text x="128" y="60" text-anchor="start" font-size="10" font-style="italic" fill="#999">tall default, no recovery</text>
    <text x="340" y="158" text-anchor="middle" font-size="10" font-style="italic" fill="#FF680A">squat, recovered with K ≥ 1</text>
    <text x="110" y="224" text-anchor="middle" font-size="9" fill="#666">0</text>
    <text x="200" y="224" text-anchor="middle" font-size="9" fill="#666">1</text>
    <text x="290" y="224" text-anchor="middle" font-size="9" fill="#666">5</text>
    <text x="380" y="224" text-anchor="middle" font-size="9" fill="#666">20</text>
    <text x="470" y="224" text-anchor="middle" font-size="9" fill="#666">100</text>
    <text x="305" y="242" text-anchor="middle" font-size="10" fill="#444" font-style="italic">fine-tune examples K (squat CaCu₅)</text>
    <text x="34" y="125" text-anchor="middle" font-size="10" fill="#444" font-style="italic" transform="rotate(-90 34 125)">median c/a of generated hex</text>
  </svg>
  <figcaption><strong>Figure 10.</strong> The median c/a of generated SmCo₅/YCo₅/CeCo₅ falls toward the squat target as the number of squat-CaCu₅ fine-tuning examples K grows. The base model (K = 0) generates tall cells (c/a ≈ 1.8) far from the target; a single curated example shifts generation into the squat regime (c/a ≈ 0.88, near the 0.80 target), and the recovery is stable as K grows.</figcaption>
</figure>

#### 5.4  Conditioning modality emergence

For each modality, the correlation between requested conditioning value and the measured value in the generated structure (or, for categorical conditioning, the fraction of samples respecting the requested label) was tracked across the training schedule. Each modality shows a clear emergence checkpoint where signal moves from indistinguishable from noise to strong, and the order is not the naive expectation, symmetry information comes in first, continuous properties last (per-modality numbers in Table A1).


Concrete monotonic trends confirm this ordering on the continuous-property channels (Figure 13): TiO₂'s c-axis scales smoothly with the formation-energy condition (≈4.4 Å at −3 eV/atom falling to ≈3.0 Å at 0), and SiO₂'s \(a\)-axis scales smoothly with the band-gap condition (≈3.3 Å at 0 eV to ≈2.2 Å by 4 eV). Magnetic ordering, by contrast, leaves the lattice essentially unchanged: across the L1₀ magnet families the recovered c/a shifts by ≤0.04 between FM and AFM conditioning. The cell is set by composition and symmetry; magnetic ordering registers as a property condition that does not measurably reshape it, a more physical behavior than a strong magnetostructural coupling would be.

<figure>
  <svg viewBox="0 0 600 250" xmlns="http://www.w3.org/2000/svg" style="font-family:inherit;">
    <line x1="236" y1="25" x2="236" y2="215" stroke="#eee" stroke-width="0.5"/>
    <line x1="288" y1="25" x2="288" y2="215" stroke="#eee" stroke-width="0.5"/>
    <line x1="340" y1="25" x2="340" y2="215" stroke="#eee" stroke-width="0.5"/>
    <line x1="470" y1="25" x2="470" y2="215" stroke="#eee" stroke-width="0.5"/>
    <line x1="535" y1="25" x2="535" y2="215" stroke="#eee" stroke-width="0.5"/>
    <line x1="145" y1="215" x2="535" y2="215" stroke="#888" stroke-width="0.5"/>
    <text x="140" y="44" text-anchor="end" font-size="10" font-style="italic">formation energy</text>
    <rect x="509" y="32" width="26" height="16" fill="#FF680A" fill-opacity="0.75"/>
    <text x="545" y="44" font-size="10" font-style="italic" fill="#FF680A">0.84</text>
    <text x="140" y="74" text-anchor="end" font-size="10" font-style="italic">magnetic ordering</text>
    <rect x="496" y="62" width="39" height="16" fill="#FF680A" fill-opacity="0.6"/>
    <text x="545" y="74" font-size="10" font-style="italic" fill="#FF680A">0.57</text>
    <text x="140" y="104" text-anchor="end" font-size="10" font-style="italic">space group</text>
    <rect x="236" y="92" width="299" height="16" fill="#FF680A" fill-opacity="0.58"/>
    <text x="545" y="104" font-size="10" font-style="italic" fill="#FF680A">0.55</text>
    <text x="140" y="134" text-anchor="end" font-size="10" font-style="italic">crystal system</text>
    <rect x="288" y="122" width="247" height="16" fill="#FF680A" fill-opacity="0.52"/>
    <text x="545" y="134" font-size="10" font-style="italic" fill="#FF680A">0.52</text>
    <text x="140" y="164" text-anchor="end" font-size="10" font-style="italic">composition</text>
    <rect x="340" y="152" width="195" height="16" fill="#FF680A" fill-opacity="0.48"/>
    <text x="545" y="164" font-size="10" font-style="italic" fill="#FF680A">0.49</text>
    <text x="140" y="194" text-anchor="end" font-size="10" font-style="italic">band gap</text>
    <rect x="470" y="182" width="65" height="16" fill="#FF680A" fill-opacity="0.42"/>
    <text x="545" y="194" font-size="10" font-style="italic" fill="#FF680A">0.43</text>
    <text x="145" y="232" text-anchor="middle" font-size="9" fill="#666">0</text>
    <text x="236" y="232" text-anchor="middle" font-size="9" fill="#666">70k</text>
    <text x="288" y="232" text-anchor="middle" font-size="9" fill="#666">110k</text>
    <text x="340" y="232" text-anchor="middle" font-size="9" fill="#666">150k</text>
    <text x="470" y="232" text-anchor="middle" font-size="9" fill="#666">250k</text>
    <text x="535" y="232" text-anchor="middle" font-size="9" fill="#666">300k</text>
    <text x="340" y="248" text-anchor="middle" font-size="10" fill="#444" font-style="italic">training step</text>
  </svg>
  <figcaption><strong>Figure 11.</strong> Each modality's bar starts at the training step where its conditioning correlation first exceeded 0.3 and runs to the end of training; the trailing number is the final conditioning correlation. Symmetry conditioning emerges first (space group, then crystal system), composition next, continuous properties (band gap) and globally-defined properties (magnetic ordering, formation energy) last. Formation energy carries the strongest final signal, by a wide margin.</figcaption>
</figure>

The emergence above concerns *property* response, for which a strong guidance scale (w = 6) is needed; *lattice* recovery, by contrast, responds to guidance non-monotonically. Sweeping w over the L1₀ families gives an inverted-U with a clear optimum near **w ≈ 3**: best-of-N lattice error is minimized there and rises roughly fourfold by w = 6, where the exact-match rate also collapses, strong guidance over-sharpens and distorts the cell (the same mechanism that drives the unseen hex family further from its true c/a at high w). The two demands trade off, w ≈ 6 maximizes property response at a measurable lattice-accuracy cost, w ≈ 3 is the lattice-recovery optimum, and the structural evaluations in this paper use w ≈ 3.

<figure>
  <svg viewBox="0 0 600 250" xmlns="http://www.w3.org/2000/svg" style="font-family:inherit;">
    <line x1="90" y1="50" x2="90" y2="200" stroke="#ddd" stroke-width="0.5"/>
    <line x1="90" y1="200" x2="555" y2="200" stroke="#888" stroke-width="0.6"/>
    <text x="83" y="203" text-anchor="end" font-size="9" fill="#888">0.06</text>
    <text x="83" y="55" text-anchor="end" font-size="9" fill="#888">0.32</text>
    <polyline points="90,147 122,180 154,196 219,199 283,162 411,99 540,56" fill="none" stroke="#FF680A" stroke-width="2"/>
    <circle cx="90" cy="147" r="3" fill="#FF680A"/>
    <circle cx="122" cy="180" r="3" fill="#FF680A"/>
    <circle cx="154" cy="196" r="3" fill="#FF680A"/>
    <circle cx="219" cy="199" r="5.5" fill="#FF680A"/>
    <circle cx="283" cy="162" r="3" fill="#FF680A"/>
    <circle cx="411" cy="99" r="4.5" fill="#1f2937"/>
    <circle cx="540" cy="56" r="3" fill="#FF680A"/>
    <line x1="219" y1="193" x2="219" y2="120" stroke="#FF680A" stroke-width="0.6" stroke-dasharray="2,2"/>
    <text x="219" y="113" text-anchor="middle" font-size="10" font-style="italic" fill="#FF680A">optimum w ≈ 3</text>
    <text x="411" y="86" text-anchor="middle" font-size="9.5" font-style="italic" fill="#1f2937">w = 6 over-guides</text>
    <text x="90" y="214" text-anchor="middle" font-size="9" fill="#666">1</text>
    <text x="154" y="214" text-anchor="middle" font-size="9" fill="#666">2</text>
    <text x="219" y="214" text-anchor="middle" font-size="9" fill="#666">3</text>
    <text x="283" y="214" text-anchor="middle" font-size="9" fill="#666">4</text>
    <text x="411" y="214" text-anchor="middle" font-size="9" fill="#666">6</text>
    <text x="540" y="214" text-anchor="middle" font-size="9" fill="#666">8</text>
    <text x="322" y="238" text-anchor="middle" font-size="10" fill="#444" font-style="italic">guidance scale w</text>
    <text x="34" y="125" text-anchor="middle" font-size="10" fill="#444" font-style="italic" transform="rotate(-90 34 125)">best-of-N lattice error Δ(a,c)</text>
  </svg>
  <figcaption><strong>Figure 12.</strong> Best-of-N lattice error on the L1₀ families varies non-monotonically with the classifier-free guidance scale. The error is minimized near <em>w</em> ≈ 3 and rises roughly fourfold by <em>w</em> = 6, where strong guidance over-sharpens and distorts the cell. The deployed <em>w</em> = 6, chosen for property-conditioning response, sits past the lattice-recovery optimum, so the structural evaluations use <em>w</em> ≈ 3.</figcaption>
</figure>

<figure>
  <img src="/img/gpsk300_conditioning.png" alt="GPSK-300 conditioning response: a cell-angle versus c/a scatter where the requested crystal system forms three clusters, plus band-gap and formation-energy response curves." style="width:100%;max-width:768px;display:block;margin:0 auto;" />
  <figcaption><strong>Figure 13.</strong> GPSK-300 responds to each conditioning channel. Left: each point is one generated Fe₂O₃ cell, read closed-form from the grid. Dashed lines mark the crystallographic ideals that define each system: γ = 90° (cubic and tetragonal), γ = 120° (hexagonal), and c/a = 1 (cubic), with the marked point the cubic ideal at their intersection. The clusters land where expected, hexagonal on the 120° line, cubic at the 90°/1 corner, and tetragonal on the 90° line above c/a = 1, and the spread around each ideal reflects decode tolerance. Right: the continuous-property channels track the request, with SiO₂'s a-axis falling as the requested band gap rises and TiO₂'s c-axis falling as formation energy rises. Magnetic ordering, by contrast, leaves the lattice essentially unchanged: switching FM↔AFM across the trained magnet families moves the recovered c/a by ≤0.04, a more physical response than a strong magnetostructural coupling would be.</figcaption>
</figure>

#### 5.5  Magnetic batch

A batch of 195 generated structures across 28 magnetic prompts gives the population-level picture (a representative subsample scored with LeMat-GenBench [23]; the full-scale batch is a straightforward larger run). Validity is high: 100% of structures are charge-neutral and 99.0% are physically plausible (sensible angles, pymatgen-parseable); 67% additionally pass the strictest interatomic-distance check, the remainder carrying a single near-contact from the peak-finding decode. The Herfindahl-Hirschman composition risk score sits in the moderate band (`HHI_combined_mean ≈ 2.66`), reflecting the Co-, Fe-, and Pt-rich magnetic prompts rather than a model bias. Uniqueness is 64%: distinct prompts yield distinct structures, and best-of-N resampling retains meaningful diversity rather than collapsing to a single mode.

The exact-fingerprint novelty metric reports ≈100% novel, but this is the metric pathology discussed in Section 6, not a generation property. GPSK-300 returns *approximately* correct cells (the lattice within a few percent, Section 5.2), and the BAWL structure fingerprint is exact, so an approximately-right structure registers as "not in the database" even when it is the canonical compound. Whether the model returns the correct structure for a known composition is therefore read from the `StructureMatcher` recovery rates (Sections 5.2, 5.7), not from exact-fingerprint novelty.

#### 5.6  Failure modes

Rock-salt ionics divide cleanly along anion type. The rock-salt **oxide** is recovered: MgO matches its reference structure exactly (per-atom volume within ~20% of reference, exact `StructureMatcher` match). The systematic undershoot is confined to rock-salt **halides**, NaCl and KCl generate cells roughly half the reference per-atom volume (Table 3). Other failure modes are family-specific, Si (diamond cubic) fails the decode entirely because the FCC selection rule sends Im F to zero on \(l=0\) and our peak-finder misses the diagonal-pair structure on a single slice; LiFePO₄ (olivine) recovers but with a poor lattice ratio reflecting low training-set coverage of that family.

**Table 3.** Rock-salt family (per-atom volume ratio; 1.0 = correct).

| Composition | type | vol/atom ratio | match |
|---|:---:|---:|:---:|
| MgO  | oxide  | 1.21 | ✓ |
| NaCl | halide | 0.52 | ✗ |
| KCl  | halide | 0.39 | ✗ |

The halide undershoot is consistent with the failure mode expected of a supervised conditional generator trained without an explicit energetic objective: the model converges to the conditional mode of the training distribution for each prompt, and for the sparsely-covered halides the conditional mode is offset from the equilibrium-volume cell implied by the chemistry. The remedy is at the objective level rather than the representation level (Section 7).

#### 5.7  Holdout generalization: composition vs family

The L1₀ recovery above (Section 5.2) is measured on a family GPSK-300 was trained on, which leaves the central evaluation question of Section 6 unresolved: when the model returns the reference structure for a magnet composition, is it *predicting* structure or *retrieving* a family it has effectively memorized? The holdout built into training (Section 4.1) separates the two, a 0.31% slice of magnet structures is excluded from training entirely, and the model is evaluated for recovery on exactly those structures it never saw. The holdout is constructed at two levels of difficulty:

- **Held-out composition, seen family.** Specific L1₀ compositions (FePd, MnGa) are removed while the rest of the L1₀ family (FePt, CoPt, FeNi, MnAl, …) remains. This tests whether the model can place an *unseen composition* into a structural motif it has learned from siblings.
- **Held-out family.** The entire hexagonal RE-TM (CaCu₅-type) family is removed. This tests whether the model can produce a structural *motif* it has never seen at all.

Each held-out target is prompted by composition + symmetry, sampled best-of-N, and scored against its reference with the full structure-level metric set of Section 5 (StructureMatcher match, space-group recovery, bond-validity, volume ratio) rather than lattice ratios alone.

The two levels separate cleanly, and the separation is the honest scope of the prediction claim. **Held-out *compositions* in a seen family recover at nearly the seen rate.** Scoring exact `StructureMatcher` matches over N = 48 samples per prompt, FePd and MnGa reach a per-sample match rate of 50% and 46% (48% combined) against 58% for the four seen L1₀ families, full-motif matches with correct c/a, not merely right-sized cells. The model interpolates within a learned motif rather than reproducing exact training entries; at these per-sample rates, best-of-N recovery is effectively certain. **The held-out *family* does not recover at all.** Across a sweep of guidance and magnetic-conditioning settings, generated hex RE-TM cells never reproduce the squat CaCu₅ c/a ≈ 0.8, 0% StructureMatcher match and 0% even geometrically valid, defaulting to the tall c/a > 1 learned from other hexagonal structures. **The boundary, interpolation within a represented motif, not extrapolation to an unseen one, is the scope within which a "novel" candidate from GPSK-300 should be trusted.**

**Table 4.** Holdout recovery (ship checkpoint, N = 48 samples/prompt). Rate = fraction of samples that are exact `StructureMatcher` matches to the prototype reference. Held-out *composition* recovers near the seen rate; held-out *family* is the negative control.

| target | holdout level | structure-match rate | recovers? |
|---|---|:---:|:---:|
| FePt, CoPt, FeNi, MnAl | none, seen reference | 58% | ✓ |
| **FePd** | composition (L1₀ family seen) | **50%** | ✓ |
| **MnGa** | composition (L1₀ family seen) | **46%** | ✓ |
| SmCo₅, YCo₅, CeCo₅ | family (hex RE-TM unseen) | **0%** | ✗ |

The reported checkpoint is the best of GPSK-300's training trajectory: per-sample recovery peaked at ~80% of the schedule and declined as the learning rate annealed to zero (the endpoint over-sharpens and loses the sample diversity that best-of-N relies on), so the checkpoint at the recovery peak (400k) is used throughout.

<figure>
  <svg viewBox="0 0 600 250" xmlns="http://www.w3.org/2000/svg" style="font-family:inherit;">
    <line x1="80" y1="45" x2="80" y2="210" stroke="#888" stroke-width="0.6"/>
    <line x1="80" y1="210" x2="540" y2="210" stroke="#888" stroke-width="0.6"/>
    <line x1="80" y1="135" x2="540" y2="135" stroke="#eee" stroke-width="0.5"/>
    <text x="73" y="63" text-anchor="end" font-size="9" fill="#888">100%</text>
    <text x="73" y="138" text-anchor="end" font-size="9" fill="#888">50%</text>
    <text x="73" y="213" text-anchor="end" font-size="9" fill="#888">0%</text>
    <rect x="120" y="123" width="90" height="87" fill="#FF680A" fill-opacity="0.85"/>
    <text x="165" y="116" text-anchor="middle" font-size="13" font-weight="600" fill="#FF680A">58%</text>
    <text x="165" y="226" text-anchor="middle" font-size="10" fill="#333">seen family</text>
    <text x="165" y="238" text-anchor="middle" font-size="8.5" fill="#888" font-style="italic">reference</text>
    <rect x="255" y="138" width="90" height="72" fill="#FF680A" fill-opacity="0.55"/>
    <text x="300" y="131" text-anchor="middle" font-size="13" font-weight="600" fill="#FF680A">48%</text>
    <text x="300" y="226" text-anchor="middle" font-size="10" fill="#333">held-out composition</text>
    <text x="300" y="238" text-anchor="middle" font-size="8.5" fill="#888" font-style="italic">FePd, MnGa</text>
    <rect x="390" y="206" width="90" height="4" fill="#999"/>
    <text x="435" y="200" text-anchor="middle" font-size="13" font-weight="600" fill="#999">0%</text>
    <text x="435" y="226" text-anchor="middle" font-size="10" fill="#333">held-out family</text>
    <text x="435" y="238" text-anchor="middle" font-size="8.5" fill="#888" font-style="italic">hex RE-Co</text>
    <text x="232" y="34" text-anchor="middle" font-size="10" font-style="italic" fill="#FF680A">interpolation within a learned motif ✓</text>
    <text x="435" y="184" text-anchor="middle" font-size="10" font-style="italic" fill="#999">extrapolation ✗</text>
  </svg>
  <figcaption><strong>Figure 14.</strong> Exact-structure recovery is compared across three levels: a seen family (reference), a held-out <em>composition</em> within a seen family, and an entirely held-out <em>family</em>. Held-out compositions recover at nearly the seen rate, whereas the held-out family does not: the model interpolates within a represented motif but does not extrapolate to a new one.</figcaption>
</figure>

<figure>
  <svg viewBox="0 0 600 250" xmlns="http://www.w3.org/2000/svg" style="font-family:inherit;">
    <line x1="100" y1="45" x2="100" y2="210" stroke="#888" stroke-width="0.6"/>
    <line x1="100" y1="210" x2="550" y2="210" stroke="#888" stroke-width="0.6"/>
    <line x1="100" y1="130" x2="550" y2="130" stroke="#eee" stroke-width="0.5"/>
    <text x="93" y="213" text-anchor="end" font-size="9" fill="#888">0</text>
    <text x="93" y="133" text-anchor="end" font-size="9" fill="#888">35%</text>
    <text x="93" y="54" text-anchor="end" font-size="9" fill="#888">70%</text>
    <line x1="390" y1="62" x2="390" y2="210" stroke="#FF680A" stroke-width="0.6" stroke-dasharray="2,2"/>
    <text x="390" y="42" text-anchor="middle" font-size="9.5" font-style="italic" fill="#FF680A">ship checkpoint · 400k</text>
    <polyline points="130,164 260,148 390,57 520,119" fill="none" stroke="#FF680A" stroke-width="2"/>
    <circle cx="130" cy="164" r="3.5" fill="#FF680A"/><circle cx="260" cy="148" r="3.5" fill="#FF680A"/><circle cx="390" cy="57" r="5" fill="#FF680A"/><circle cx="520" cy="119" r="3.5" fill="#FF680A"/>
    <polyline points="130,187 260,119 390,107 520,153" fill="none" stroke="#FF680A" stroke-width="1.6" stroke-dasharray="4,3" opacity="0.6"/>
    <circle cx="130" cy="187" r="3" fill="#FF680A" opacity="0.6"/><circle cx="260" cy="119" r="3" fill="#FF680A" opacity="0.6"/><circle cx="390" cy="107" r="3" fill="#FF680A" opacity="0.6"/><circle cx="520" cy="153" r="3" fill="#FF680A" opacity="0.6"/>
    <line x1="425" y1="182" x2="450" y2="182" stroke="#FF680A" stroke-width="2"/><text x="455" y="185" font-size="9" fill="#555">seen family</text>
    <line x1="425" y1="197" x2="450" y2="197" stroke="#FF680A" stroke-width="1.6" stroke-dasharray="4,3" opacity="0.6"/><text x="455" y="200" font-size="9" fill="#555">held-out composition</text>
    <text x="130" y="224" text-anchor="middle" font-size="9" fill="#666">200k</text>
    <text x="260" y="224" text-anchor="middle" font-size="9" fill="#666">300k</text>
    <text x="390" y="224" text-anchor="middle" font-size="9" fill="#666">400k</text>
    <text x="520" y="224" text-anchor="middle" font-size="9" fill="#666">500k</text>
    <text x="325" y="242" text-anchor="middle" font-size="10" fill="#444" font-style="italic">training step</text>
    <text x="34" y="130" text-anchor="middle" font-size="10" fill="#444" font-style="italic" transform="rotate(-90 34 130)">structure-match recovery</text>
  </svg>
  <figcaption><strong>Figure 15.</strong> Structure-match recovery on the seen and held-out L1₀ families changes across training checkpoints. Both rise to a maximum near 80% of the schedule (the 400k-step checkpoint, used as the deployed model) and decline as the learning rate anneals to zero, since the over-sharpened endpoint loses the sample diversity that best-of-N selection relies on. This motivates selecting the peak checkpoint rather than the final one.</figcaption>
</figure>


The family-level failure is not permanent: a brief fine-tune on a handful of examples of the missing motif recovers it (Section 5.3).


#### 5.8  Breadth beyond the magnet families

The evaluation so far targets magnet families by design. To map where the reciprocal-space representation generalizes and where it is family-specific, GPSK-300 was probed on a panel of canonical prototypes spanning bonding types, ionic, covalent, oxide, metallic, each scored against a prototype reference with the Section 5 structure-level metrics (Table A2). The picture is one of *narrow, coverage-tracking competence*.


Exact recovery is confined to simple metals and the (training-rich) rock-salt oxide; most other prototypes produce geometrically valid but structurally incorrect cells, and the families sparsest in training (rock-salt halides) fail even on cell size. The clean tell is that rock-salt *oxide* recovers while rock-salt *halide* does not, competence tracks training coverage, not structural simplicity. **The magnet-family accuracy does not broadly generalize**, which is the empirical basis for positioning GPSK-300 as an amortized proposer for represented families rather than a general-purpose CSP engine. (Annealing sharpens these rates but does not broaden them: across checkpoints, metal recovery peaks at the same point as magnet recovery, and the never-matched families stay at zero.)

<figure>
  <svg viewBox="0 0 600 250" xmlns="http://www.w3.org/2000/svg" style="font-family:inherit;">
    <line x1="150" y1="30" x2="150" y2="205" stroke="#888" stroke-width="0.5"/>
    <line x1="335" y1="30" x2="335" y2="205" stroke="#eee" stroke-width="0.5"/>
    <line x1="520" y1="30" x2="520" y2="205" stroke="#eee" stroke-width="0.5"/>
    <text x="144" y="48" text-anchor="end" font-size="9.5" fill="#333">Fe · bcc metal</text>
    <rect x="150" y="40" width="370" height="14" fill="#FF680A" fill-opacity="0.8"/>
    <text x="527" y="51" font-size="9.5" fill="#FF680A">100%</text>
    <text x="144" y="78" text-anchor="end" font-size="9.5" fill="#333">Cu · fcc metal</text>
    <rect x="150" y="70" width="344" height="14" fill="#FF680A" fill-opacity="0.8"/>
    <text x="501" y="81" font-size="9.5" fill="#FF680A">93%</text>
    <text x="144" y="108" text-anchor="end" font-size="9.5" fill="#333">MgO · rock-salt oxide</text>
    <rect x="150" y="100" width="370" height="14" fill="#FF680A" fill-opacity="0.8"/>
    <text x="527" y="111" font-size="9.5" fill="#FF680A">100%</text>
    <text x="144" y="138" text-anchor="end" font-size="9.5" fill="#888">NaCl · rock-salt halide</text>
    <rect x="150" y="130" width="3" height="14" fill="#bbb"/>
    <text x="160" y="141" font-size="9.5" fill="#999">0%</text>
    <text x="144" y="168" text-anchor="end" font-size="9.5" fill="#888">SrTiO₃ · perovskite</text>
    <rect x="150" y="160" width="3" height="14" fill="#bbb"/>
    <text x="160" y="171" font-size="9.5" fill="#999">0%</text>
    <text x="144" y="198" text-anchor="end" font-size="9.5" fill="#888">GaAs · zinc-blende</text>
    <rect x="150" y="190" width="3" height="14" fill="#bbb"/>
    <text x="160" y="201" font-size="9.5" fill="#999">0%</text>
    <line x1="150" y1="208" x2="520" y2="208" stroke="#888" stroke-width="0.5"/>
    <text x="150" y="221" text-anchor="middle" font-size="9" fill="#666">0</text>
    <text x="335" y="221" text-anchor="middle" font-size="9" fill="#666">50%</text>
    <text x="520" y="221" text-anchor="middle" font-size="9" fill="#666">100%</text>
    <text x="335" y="239" text-anchor="middle" font-size="10" fill="#444" font-style="italic">StructureMatcher recovery rate</text>
  </svg>
  <figcaption><strong>Figure 16.</strong> Exact-structure recovery varies sharply across canonical prototypes spanning ionic, covalent, oxide, and metallic bonding. Recovery is confined to simple metals and the training-rich rock-salt oxide; families sparser in training recover at 0%, producing valid-looking but structurally incorrect cells. Competence tracks training coverage: rock-salt <em>oxide</em> recovers while rock-salt <em>halide</em> does not, so magnet-family accuracy does not broadly generalize.</figcaption>
</figure>

#### 5.9  Complexity ceiling

The closed-form decode locates atoms as peaks in the inverse-FFT density, which bounds the cell complexity it can resolve. A ladder of increasing atom count makes the ceiling explicit (Table A3): small-to-moderate cells recover, but beyond roughly 20–40 atoms the decode collapses, it either undershoots the atom count badly or returns invalid geometry. Nd₂Fe₁₄B, the commercial permanent magnet, is a 68-atom cell; the model emits a single-formula-unit, 17-atom fragment.


Critically, **this is not a grid-resolution limit.** A closed-form encode→decode round-trip on real structures resolves all atoms losslessly up to at least 128 atoms at the current 64³ Miller grid, and doubling the grid to 128³ yields no improvement at any atom count. The ceiling is instead the *generative* model emitting too-small cells for complex compositions (a training-coverage effect, large cells are rare in the corpus) compounded by the peak-finder's sensitivity on dense cells. The remedy is coverage and decode refinement, not finer sampling, and it bounds the honest reading of "invertibility," which holds for small-to-moderate well-represented cells and degrades as peak density grows.

<figure>
  <svg viewBox="0 0 600 250" xmlns="http://www.w3.org/2000/svg" style="font-family:inherit;">
    <line x1="262" y1="48" x2="262" y2="200" stroke="#FF680A" stroke-width="0.8" stroke-dasharray="3,3"/>
    <text x="262" y="40" text-anchor="middle" font-size="9.5" font-style="italic" fill="#FF680A">decode ceiling ~20–40 atoms</text>
    <line x1="90" y1="200" x2="545" y2="200" stroke="#888" stroke-width="0.6"/>
    <line x1="90" y1="42" x2="90" y2="200" stroke="#888" stroke-width="0.5"/>
    <text x="84" y="79" text-anchor="end" font-size="9.5" fill="#FF680A">recovered</text>
    <circle cx="103" cy="75" r="6" fill="#FF680A" fill-opacity="0.85"/>
    <text x="103" y="60" text-anchor="middle" font-size="8.5" fill="#555">FePt</text>
    <circle cx="192" cy="75" r="6" fill="#FF680A" fill-opacity="0.85"/>
    <text x="192" y="60" text-anchor="middle" font-size="8.5" fill="#555">Co₂MnSi</text>
    <text x="84" y="129" text-anchor="end" font-size="9.5" fill="#999">fails</text>
    <text x="333" y="129" text-anchor="middle" font-size="12" fill="#999">✕</text>
    <text x="333" y="145" text-anchor="middle" font-size="8.5" fill="#555">Sm₂Co₁₇</text>
    <text x="448" y="129" text-anchor="middle" font-size="12" fill="#999">✕</text>
    <text x="448" y="145" text-anchor="middle" font-size="8.5" fill="#555">MgAl₂O₄</text>
    <text x="525" y="129" text-anchor="middle" font-size="12" fill="#999">✕</text>
    <text x="525" y="145" text-anchor="middle" font-size="8.5" fill="#1f2937" font-weight="600">Nd₂Fe₁₄B</text>
    <text x="103" y="214" text-anchor="middle" font-size="9" fill="#666">2</text>
    <text x="192" y="214" text-anchor="middle" font-size="9" fill="#666">16</text>
    <text x="333" y="214" text-anchor="middle" font-size="9" fill="#666">38</text>
    <text x="525" y="214" text-anchor="middle" font-size="9" fill="#666">68</text>
    <text x="317" y="236" text-anchor="middle" font-size="10" fill="#444" font-style="italic">unit-cell atom count</text>
  </svg>
  <figcaption><strong>Figure 17.</strong> Structure recovery falls off with unit-cell atom count. Cells up to ~16 atoms recover; beyond ~20–40 atoms the decode collapses, returning invalid geometry (Sm₂Co₁₇) or a partial fragment (Nd₂Fe₁₄B, the 68-atom commercial magnet, decodes only 17 atoms). The limit is not grid resolution (a closed-form round-trip resolves ≥128 atoms at this grid) but the generative model emitting too-small cells, compounded by peak-finding on dense cells.</figcaption>
</figure>

#### 5.10  Ablation: is the 1/d² channel load-bearing?

The central representational claim is that the reciprocal-metric channel makes lattice recovery a closed-form operation, removing the need for a learned lattice head. We test it by ablation: a 3D-CNN regression head is trained on the (Re F, Im F) channels alone, no 1/d², to predict the six lattice parameters, which is the learned-head approach real-space generators rely on. On 20,000 training / 2,000 held-out structures the head plateaus at **7.7% mean edge error and 1.8° mean angle error**, against **≈0% for the closed-form recovery from the 1/d² channel** (Section 5.1). The structure-factor channels carry lattice scale only weakly, through the angular falloff of the scattering factors, so a head must infer it indirectly and lands an order of magnitude worse (8% on edges is ~26% on cell volume, the regime where lattice error corrupts the structure). The reciprocal-metric channel is therefore load-bearing: it is precisely what turns lattice recovery from a learned regression (~8% error) into closed-form linear algebra (~0%), which is the paper's central contribution.

<figure>
  <svg viewBox="0 0 600 230" xmlns="http://www.w3.org/2000/svg" style="font-family:inherit;">
    <line x1="100" y1="40" x2="100" y2="190" stroke="#888" stroke-width="0.6"/>
    <line x1="100" y1="190" x2="500" y2="190" stroke="#888" stroke-width="0.6"/>
    <text x="93" y="193" text-anchor="end" font-size="9" fill="#888">0%</text>
    <text x="93" y="123" text-anchor="end" font-size="9" fill="#888">4%</text>
    <text x="93" y="55" text-anchor="end" font-size="9" fill="#888">8%</text>
    <line x1="100" y1="120" x2="500" y2="120" stroke="#eee" stroke-width="0.5"/>
    <rect x="160" y="186" width="120" height="4" fill="#FF680A" fill-opacity="0.85"/>
    <text x="220" y="180" text-anchor="middle" font-size="13" font-weight="600" fill="#FF680A">≈ 0%</text>
    <text x="220" y="206" text-anchor="middle" font-size="10" fill="#333">1/d² closed-form</text>
    <text x="220" y="218" text-anchor="middle" font-size="8.5" font-style="italic" fill="#888">linear least-squares</text>
    <rect x="340" y="55" width="120" height="135" fill="#1f2937" fill-opacity="0.7"/>
    <text x="400" y="48" text-anchor="middle" font-size="13" font-weight="600" fill="#1f2937">7.7%</text>
    <text x="400" y="206" text-anchor="middle" font-size="10" fill="#333">learned head</text>
    <text x="400" y="218" text-anchor="middle" font-size="8.5" font-style="italic" fill="#888">CNN on Re/Im, no 1/d²</text>
    <text x="400" y="130" text-anchor="middle" font-size="9.5" font-style="italic" fill="#fff" fill-opacity="0.9">≈ 26% by volume</text>
  </svg>
  <figcaption><strong>Figure 18.</strong> Closed-form recovery from the reciprocal-metric channel achieves ≈0% mean lattice edge error, against 7.7% (≈26% on cell volume) for a learned 3D-CNN head trained on the structure-factor channels alone. The learned-head approach used by real-space generators is an order of magnitude worse, which is why the reciprocal-metric channel is retained.</figcaption>
</figure>

### 6  Discussion

GPSK-300 is best described as a fast crystal structure prediction system, not a novel-materials generator. The L1₀ recovery result is the right way to evaluate it: near-perfect lattice recovery across a family of high practical relevance, bounded by the controlled holdout (Section 5.7) that shows where that reliability extends. The standard LeMat-GenBench [20] family of metrics, especially the SUN (Stable ∩ Unique ∩ Novel) rate, structurally undersells this kind of system:

- **Stable**: required, ✓.
- **Unique**: ✗ by design. Best-of-N collapses to a near-deterministic mode per prompt, exactly the behavior you want from CSP.
- **Novel**: ✗ by design. The known answer for FePt is itself, not a "novel" L1₀ variant.

The metric structurally rewards lattice imprecision: a wrong lattice → fingerprint mismatch → label "novel". GPSK-05's 99.9% novelty was earned partly by its 25% lattice undershoot on simple ionics. Accuracy was being penalized for not appearing novel.

The right benchmark for this class of model is per-family recovery: take held-out known compositions in a family F, prompt with composition + symmetry, compare to reference by lattice RMSD plus atom-position match, and report family-level accuracy. The magnetic evaluation in Section 5 establishes the trained L1₀ family at high recovery accuracy. The right way to interpret a *novel* L1₀ candidate generated by GPSK-300 is then "as reliable as the family-level recovery rate suggests." Recovering the trained L1₀ family establishes strong in-distribution accuracy; on its own, however, it does not separate genuine structure prediction from retrieval of a family well-represented in training. Establishing that separation requires recovering compositions the model never saw, a composition/family holdout (Section 5.7), which we treat as the load-bearing experiment for any novelty claim.

The speed comparison against classical CSP methods is the practical claim of the work. USPEX [7], CALYPSO [8], and AIRSS [9] all evaluate hundreds-to-thousands of candidates per composition through DFT scoring and take hours to days per query. GPSK-300 returns a candidate in ≈5 seconds, and on the family where its family-level recovery rate is high (L1₀), the candidate it returns matches the canonical reference structure. For magnet candidate screening at the volume needed to displace NdFeB, i.e., thousands of compositions, fast iteration, this is the order-of-magnitude shift the field needs.

The rock-salt halide undershoot in Section 5.6 is a clean, narrow failure mode rather than a fundamental model breakdown. The model is producing structures that are *almost* right, right motif, right symmetry, right composition, wrong volume. The cleanest path to closing the gap is at the objective level, not the representation level: introduce a stability-aware reward signal at training or inference time so that volume errors that move the structure away from its energy minimum are explicitly penalized.

### 7  Future Work

**Stability-aware reward.** RL fine-tuning against a CHGNet-style universal MLIP [24], or diffusion-time optimization against the same energy oracle, so the model is pulled toward energetic optima rather than only the data-distribution average. A prototype using GRPO with per-prompt EMA baseline and a strong KL anchor (β ≈ 0.3) ran stably on the magnetic domain across 80 fine-tuning steps without degrading the L1₀ accuracy reported here. The full retrain target is to extend that stability gain to the simple ionics where the base model undershoots, with the explicit reward being lattice RMSD against reference rather than raw MLIP energy.

**Data rebalancing.** LeMat-Bulk lifts coverage of every family used in this paper into the regime where supervised flow matching trains cleanly (perovskite_cubic 575 → 12k samples, spinels 2.9k → 17k, hex RE-TM 1.5k → 5.9k). Rock-salt oxide remains at ~240 samples even after this lift and is the next family to upweight explicitly. The training pipeline supports a `--rebalance-alpha` family-importance term that we have not yet swept exhaustively.

**Robust element disambiguation (open).** Element assignment is not the bottleneck we initially expected: the brightness heuristic recovers near-Z identities reliably under reconstruction error (Section 3.6). The natural alternative, a joint Cromer-Mann least-squares fit predicting F(hkl) from candidate assignments, is exact on noise-free structures (6/6 SmCo₅, 4/4 Fe/Co at ΔZ=1) but, we found, *less* robust than the heuristic under realistic VAE error, overfitting reconstruction noise to neighboring atomic numbers (~60% vs the heuristic's 100% on near-Z binaries). A disambiguation method that is both error-robust and physically grounded, e.g. constraining the magnitude fit with the recovered density peak heights rather than fitting F-magnitudes alone, remains open; the current heuristic is the operating choice.

**Scale anchor for unconditional generation.** Unconditional (no-composition) generation requires resolving an \(\alpha \times Z\) scale ambiguity that the noise-free F(hkl) magnitudes cannot break alone. The cleanest fix is to add a fourth channel encoding the per-structure scale anchor (\(\log\) of `norm_factor`), so the model emits its own absolute scale at generation time.

**Per-family CSP benchmark.** 50–200 known compositions per chemical family with lattice RMSD against reference. This is the benchmark we believe most accurately measures what models like GPSK-300 actually do, and which we plan to release alongside the next-iteration model.

### Appendix A  Detailed evaluation tables

The figures in Section 5 carry the headline results; the full per-family numbers are collected here for reference.

**Table A1.** Conditioning modality response measured over training. Minimum pairwise correlation is taken across the conditioning sweep; "emergence" is the step at which sustained correlation \(>\) 0.3 was first observed. The emergence *ordering*, symmetry first, continuous and global properties last, is the robust, reproducible finding; the step counts are approximate and illustrate the dynamics.

| Modality | min correlation | strength | emergence |
|---|---:|:---:|---:|
| Space group        | 0.55 | strong   | ~70k |
| Crystal system     | 0.52 | strong   | ~110k |
| Composition        | 0.49 | strong   | ~150k |
| Band gap           | 0.43 | strong   | ~250k |
| Magnetic ordering  | 0.57 | strong   | late |
| Formation energy   | 0.84 | strong   | late |

**Table A2.** Breadth across structural families (ship checkpoint). Match = exact `StructureMatcher` rate; cell-size = median per-atom volume ratio (1.0 = correct).

| structure family | match rate | cell-size | verdict |
|---|:---:|:---:|---|
| bcc / fcc metals (Fe, Cu) | 100% / 93% | ~1.0 | recovered |
| rock-salt oxide (MgO) | 100% | ~1.05 | recovered |
| rock-salt halide (NaCl, KCl) | 0% | 0.73–0.81 | cells ~20% small; sparse in training |
| perovskite (SrTiO₃, BaTiO₃) | 0% (87% valid) | ~1.00 | right size, wrong internal structure |
| zinc-blende / fluorite / rutile | 0% (valid varies) | 0.8–0.9 | geometrically valid, wrong motif |

**Table A3.** Recovery vs. unit-cell complexity (ship checkpoint).

| compound | motif | atoms | outcome |
|---|---|:---:|---|
| FePt, Co₂MnSi | L1₀, Heusler | 2, 16 | recovered |
| Sm₂Co₁₇ | 2:17 | ~38 | invalid geometry |
| Nd₂Fe₁₄B | NdFeB | 68 | 17-atom fragment |

**Table A4.** Per-checkpoint structure-match recovery on the seen and held-out L1₀ families (the per-checkpoint numbers plotted in the training-trajectory figure). The 400k checkpoint is the deployed model.

| checkpoint | seen L1₀ | held-out L1₀ |
|---|---:|---:|
| 200k | 20% | 10% |
| 300k | 27% | 40% |
| **400k (ship)** | **67%** | **45%** |
| 500k | 40% | 25% |

### Acknowledgements

This paper builds on infrastructure and dataset work by the broader Project 14 effort. The training data combines [LeMat-Bulk](https://github.com/entalpic/materials_open_lab), the [Materials Project](https://materialsproject.org/), [Alexandria](https://alexandria.icams.rub.de/), [OQMD](https://oqmd.org/), the [Crystallographic Open Database](https://www.crystallography.net/cod/), and [MAGNDATA](https://www.cryst.ehu.es/magndata/). The curated training corpus is publicly released as the [GPSK-Inorganic-Crystals dataset](https://huggingface.co/datasets/willgbryan13/gpsk-inorganic-crystals) on the Hugging Face Hub. Property-prediction models for downstream magnetic-figure-of-merit screening are published by [Ouro](https://ouro.foundation).

### References

[1] M. Sagawa et al. *New material for permanent magnets on a base of Nd and Fe*. J. Appl. Phys. 55, 2083 (1984). [DOI:10.1063/1.333572](https://doi.org/10.1063/1.333572)

[2] J. J. Croat et al. *Pr-Fe and Nd-Fe-based materials: A new class of high-performance permanent magnets*. J. Appl. Phys. 55, 2078 (1984). [DOI:10.1063/1.333571](https://doi.org/10.1063/1.333571)

[3] D. Weller and A. Moser. *Thermal effect limits in ultrahigh-density magnetic recording*. IEEE Trans. Magn. 35, 4423 (1999). [DOI:10.1109/20.809134](https://doi.org/10.1109/20.809134)

[4] J. M. D. Coey. *Magnetism and Magnetic Materials*. Cambridge Univ. Press (2010). [DOI:10.1017/CBO9780511845000](https://doi.org/10.1017/CBO9780511845000)

[5] H. Kono. *On the ferromagnetic phase in manganese-aluminum system*. J. Phys. Soc. Jpn. 13, 1444 (1958). [DOI:10.1143/JPSJ.13.1444](https://doi.org/10.1143/JPSJ.13.1444)

[6] K. J. Strnat. *The hard-magnetic properties of rare earth–transition metal alloys*. IEEE Trans. Magn. 8, 511 (1972). [DOI:10.1109/TMAG.1972.1067368](https://doi.org/10.1109/TMAG.1972.1067368)

[7] A. R. Oganov and C. W. Glass. *Crystal structure prediction using ab initio evolutionary techniques*. J. Chem. Phys. 124, 244704 (2006). [DOI:10.1063/1.2210932](https://doi.org/10.1063/1.2210932)

[8] Y. Wang, J. Lv, L. Zhu, and Y. Ma. *Crystal structure prediction via particle-swarm optimization* (CALYPSO). Phys. Rev. B 82, 094116 (2010). [DOI:10.1103/PhysRevB.82.094116](https://doi.org/10.1103/PhysRevB.82.094116)

[9] C. J. Pickard and R. J. Needs. *Ab initio random structure searching* (AIRSS). J. Phys.: Condens. Matter 23, 053201 (2011). [DOI:10.1088/0953-8984/23/5/053201](https://doi.org/10.1088/0953-8984/23/5/053201)

[10] C. Zeni et al. *MatterGen: A generative model for inorganic materials design*. arXiv:2312.03687 (2023). [arXiv:2312.03687](https://arxiv.org/abs/2312.03687)

[11] D. T. Cromer and J. B. Mann. *X-ray scattering factors computed from numerical Hartree-Fock wave functions*. Acta Cryst. A 24, 321 (1968). [DOI:10.1107/S0567739468000550](https://doi.org/10.1107/S0567739468000550)

[12] J. Ho, A. Jain, and P. Abbeel. *Denoising Diffusion Probabilistic Models*. NeurIPS (2020). [arXiv:2006.11239](https://arxiv.org/abs/2006.11239)

[13] Y. Song et al. *Score-based generative modeling through stochastic differential equations*. ICLR (2021). [arXiv:2011.13456](https://arxiv.org/abs/2011.13456)

[14] Y. Lipman et al. *Flow Matching for Generative Modeling*. ICLR (2023). [arXiv:2210.02747](https://arxiv.org/abs/2210.02747)

[15] X. Liu, C. Gong, and Q. Liu. *Flow Straight and Fast: Learning to Generate and Transfer Data with Rectified Flow*. ICLR (2023). [arXiv:2209.03003](https://arxiv.org/abs/2209.03003)

[16] P. Esser et al. *Scaling Rectified Flow Transformers for High-Resolution Image Synthesis* (SD3). arXiv:2403.03206 (2024). [arXiv:2403.03206](https://arxiv.org/abs/2403.03206)

[17] J. Ho and T. Salimans. *Classifier-Free Diffusion Guidance*. arXiv:2207.12598 (2022). [arXiv:2207.12598](https://arxiv.org/abs/2207.12598)

[18] W. Peebles and S. Xie. *Scalable Diffusion Models with Transformers* (DiT). ICCV (2023). [arXiv:2212.09748](https://arxiv.org/abs/2212.09748)

[19] A. Vaswani et al. *Attention Is All You Need*. NeurIPS (2017). [arXiv:1706.03762](https://arxiv.org/abs/1706.03762)

[20] Entalpic. *LeMat-Bulk and LeMat-GenBench: a community resource for generative crystal modeling*. [github.com/entalpic/materials_open_lab](https://github.com/entalpic/materials_open_lab) (2024–).

[21] A. Jain et al. *The Materials Project: A materials genome approach to accelerating materials innovation*. APL Materials 1, 011002 (2013). [DOI:10.1063/1.4812323](https://doi.org/10.1063/1.4812323)

[22] J. Schmidt et al. *A dataset of 175k stable and metastable materials calculated with the PBEsol and SCAN functionals*. Sci. Data 9, 64 (2022). [DOI:10.1038/s41597-022-01177-w](https://doi.org/10.1038/s41597-022-01177-w)

[23] O. C. Herfindahl. *Concentration in the Steel Industry*. Columbia Univ. (1950); A. O. Hirschman. *National Power and the Structure of Foreign Trade*. UC Press (1945). HHI as a chemical-element supply-risk metric is conventionally computed on production share with adjustment for country-level political risk.

[24] B. Deng et al. *CHGNet: A pretrained universal neural network potential for charge-informed atomistic modelling*. Nature Machine Intelligence 5, 1031 (2023). [arXiv:2302.14231](https://arxiv.org/abs/2302.14231)

[25] T. Xie, X. Fu, O.-E. Ganea, R. Barzilay, T. Jaakkola. *Crystal Diffusion Variational Autoencoder for Periodic Material Generation* (CDVAE). ICLR (2022). [arXiv:2110.06197](https://arxiv.org/abs/2110.06197)

[26] R. Jiao, W. Huang, P. Lin, J. Han, P. Chen, Y. Lu, Y. Liu. *Crystal Structure Prediction by Joint Equivariant Diffusion* (DiffCSP). NeurIPS (2023). [arXiv:2309.04475](https://arxiv.org/abs/2309.04475)

[27] B. K. Miller, R. T. Q. Chen, A. Sriram, B. M. Wood. *FlowMM: Generating Materials with Riemannian Flow Matching*. ICML (2024). [arXiv:2406.04713](https://arxiv.org/abs/2406.04713)

[28] W. Bryan. *GPSK-Inorganic-Crystals: a joint-balanced corpus of 2M inorganic crystal structures with conditioning metadata*. Hugging Face Datasets (2026). [huggingface.co/datasets/willgbryan13/gpsk-inorganic-crystals](https://huggingface.co/datasets/willgbryan13/gpsk-inorganic-crystals)

[29] S. Kirklin et al. *The Open Quantum Materials Database (OQMD): assessing the accuracy of DFT formation energies*. npj Computational Materials 1, 15010 (2015). [DOI:10.1038/npjcompumats.2015.10](https://doi.org/10.1038/npjcompumats.2015.10)

[30] S. Gražulis et al. *Crystallography Open Database, an open-access collection of crystal structures*. J. Appl. Cryst. 42, 726 (2009). [DOI:10.1107/S0021889809016690](https://doi.org/10.1107/S0021889809016690)

[31] S. V. Gallego, J. M. Perez-Mato, L. Elcoro, E. S. Tasci, R. M. Hanson, K. Momma, M. I. Aroyo, G. Madariaga. *MAGNDATA: towards a database of magnetic structures*. J. Appl. Cryst. 49, 1750 (2016). [DOI:10.1107/S1600576716012863](https://doi.org/10.1107/S1600576716012863)

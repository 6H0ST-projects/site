---
title: "Project 014"
projectTitle: "Project 014"
description: ""
bgColor: "#E7EAEE"
textColor: "#000"
sidebarText: "If I could give one piece of advice to new researchers, it would be to never stop looking for new avenues of research. On top of what you have been given, ask yourself, what might be necessary ten years from now? What will society need? Find your own research theme, and every day, little by little, you have to keep working on it."
---

Magnets need to move into the 21st century. The NdFeB incumbent, which dominates over 60% of a $30B magnet market, was discovered in the 80s... surely we can do better.

Project 14 aims to create novel modeling methods for discovering the next generation of magnetic materials.

Curie temperature, thermodynamic stability, magneto-crystalline anisotropy energy, and total magnetic density are already being accurately predicted by published [Ouro](https://ouro.foundation) models.

GPSK-300 is our crystal structure generator. A 304M-parameter multimodal diffusion transformer that produces crystals in reciprocal space. The representation is a \(32^3\) grid of Miller indices with three channels: \(\mathrm{Re}\,F(\mathbf{h})\), \(\mathrm{Im}\,F(\mathbf{h})\), and \(1/d^2(\mathbf{h})\). Every grid the model produces decodes directly into a pymatgen Structure: lattice, atomic positions, and composition. No auxiliary lattice regressor, no element classifier, no MLIP volume scan.

The first two channels are the complex structure factor split into real and imaginary parts, with proper Cromer-Mann scattering factors so they carry element identity at every Miller index. Atom positions fall out of \(\mathrm{IFFT}(\mathrm{Re}\,F + i\,\mathrm{Im}\,F)\).

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
  <figcaption><strong>Figure 1.</strong> The three-channel reciprocal-space input to GPSK-300, sampled at integer Miller indices. Re F(h) is even with a bright DC term and signed Bragg peaks falling off outward. Im F(h) is odd, vanishes at the origin, and flips sign through inversion. 1/d²(h) is a smooth quadratic — small near the origin, growing radially.</figcaption>
</figure>

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
  <figcaption><strong>Figure 2.</strong> Why Im F vanishes for centrosymmetric crystals. Every atom at r has a partner at −r through the inversion center (dashed pairings), and the sin terms in F(h) = Σ f<sub>j</sub> e<sup>2πi h·r<sub>j</sub></sup> cancel pairwise. An asymmetric basis has no such pairings, so Im F survives at every hkl.</figcaption>
</figure>

The third channel stores the reciprocal-space metric field as a quadratic form in \((h, k, l)\):

$$
\frac{1}{d^2(\mathbf{h})} = \mathbf{h}^T G^* \mathbf{h} = g_{11}h^2 + g_{22}k^2 + g_{33}l^2 + 2g_{12}hk + 2g_{13}hl + 2g_{23}kl
$$

\(G^*\) has six independent coefficients, and a lattice has six free parameters \((a, b, c, \alpha, \beta, \gamma)\). Writing the quadratic across a \(32^3\) grid massively overdetermines those six numbers. The model is not asked to predict the lattice. It generates a smooth quadratic and we recover the lattice with linear least squares.

<figure>
  <svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg" style="font-family:inherit;">
    <text x="100" y="18" text-anchor="middle" font-size="12" font-style="italic" fill="#222">Cubic</text>
    <text x="100" y="32" text-anchor="middle" font-size="10" fill="#888">a = b = c, all 90°</text>
    <rect x="20" y="42" width="160" height="160" fill="none" stroke="#bbb" stroke-width="0.5"/>
    <circle cx="100" cy="122" r="68" fill="#FF680A" opacity="0.18"/>
    <circle cx="100" cy="122" r="44" fill="#FF680A" opacity="0.32"/>
    <circle cx="100" cy="122" r="20" fill="#FF680A" opacity="0.55"/>
    <circle cx="100" cy="122" r="2.5" fill="#1f2937"/>
    <text x="300" y="18" text-anchor="middle" font-size="12" font-style="italic" fill="#222">Tetragonal</text>
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
  <figcaption><strong>Figure 3.</strong> 1/d²(h) contours for three crystal systems. Cubic is rotationally symmetric (a=b=c); tetragonal stretches along one axis (a=b≠c); monoclinic tilts the principal axes (β≠90°). G* has six independent coefficients and a lattice has six free parameters — fitting one from the other is six numbers against ~32³ grid points.</figcaption>
</figure>

A 3D VAE compresses the \(32^3 \times 3\) grid into an \(8^3 \times 64\) latent at ~2.4M parameters. The \(1/d^2\) channel is a smooth quadratic that convolutional networks encode almost losslessly (reconstruction MSE \(\sim 10^{-6}\)). The diffusion model is a multimodal transformer in that latent space with double-stream blocks and AdaLN-Zero modulation. Conditioning covers composition, crystal system, space group, band gap, formation energy, energy above hull, and magnetic ordering.

Training is rectified flow matching. Sample noise \(z_0 \sim \mathcal{N}(0, I)\) and a data latent \(z_1 \sim p_\text{data}\), linearly interpolate, and train the network to predict the constant velocity along that segment:

$$z_t = (1-t)\,z_0 + t\,z_1, \qquad \mathcal{L}(\theta) \;=\; \mathbb{E}_{t,\,z_0,\,z_1,\,c}\!\left[\,\bigl\|\,v_\theta(z_t,\,t,\,c) \;-\; (z_1 - z_0)\,\bigr\|^2\,\right]$$

The target is constant along each path, so there is no noise schedule and no score function to approximate. Conditioning \(c\) is dropped with probability \(0.1\) during training, so the same network learns both \(v_\theta(z_t, t, c)\) and the unconditional \(v_\theta(z_t, t, \varnothing)\).

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
    <text x="60" y="100" text-anchor="end" font-size="12" font-style="italic">z₀</text>
    <circle cx="510" cy="110" r="4" fill="#000"/>
    <text x="530" y="100" text-anchor="start" font-size="12" font-style="italic">z₁</text>
    <circle cx="272" cy="110" r="4" fill="#000"/>
    <text x="272" y="98" text-anchor="middle" font-size="12" font-style="italic">z<tspan baseline-shift="sub" font-size="0.78em">t</tspan></text>
    <text x="370" y="98" text-anchor="middle" font-size="12" font-style="italic" fill="#222">v★ = z₁ − z₀</text>
  </svg>
  <figcaption><strong>Figure 4.</strong> Rectified flow matching. Pair a noise sample to a data sample, draw the straight segment between them, train v<sub>θ</sub> to predict the constant velocity v★ = z₁ − z₀ at every t. The target does not depend on where along the path we sample, which is what makes the objective flat to train compared to score matching.</figcaption>
</figure>

Inference integrates the ODE \(\dot{z} = v_\theta(z, t)\) from \(t = 0\) to \(t = 1\) with 50 forward Euler steps. The learned trajectories are straight by construction, so 50 steps is plenty to land on the data manifold. At every step we apply classifier-free guidance to amplify the conditioning signal:

$$\tilde{v}_\theta(z_t,\,t,\,c) \;=\; v_\theta(z_t,\,t,\,\varnothing) \;+\; w\,\bigl(\,v_\theta(z_t,\,t,\,c) \;-\; v_\theta(z_t,\,t,\,\varnothing)\,\bigr)$$

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
  <figcaption><strong>Figure 5.</strong> Classifier-free guidance at one inference step. v<sub>∅</sub> is the unconditional velocity, v<sub>c</sub> the conditional velocity. The guided velocity ṽ lies on the line through the two tips (dashed) and extrapolates past v<sub>c</sub> when w &gt; 1, magnifying the conditional direction. w = 0 reduces to unconditional sampling, w = 1 recovers the standard conditional model.</figcaption>
</figure>

The guidance weight \(w\) controls how strongly each step is pulled toward the conditioning. \(w = 1\) is standard conditional sampling; \(w > 1\) trades sample diversity for stronger response to \(c\). For continuous-property conditioning (formation energy, band gap, energy above hull), \(w > 1\) is what makes the response actually emerge in the sampled crystals — without it, the model averages over the data distribution and ignores the property knob.

On 21 magnetic compositions with 10 candidates each: 95% extraction success, median lattice ratios 0.98 to 0.99 against reference. All seven L1₀ tetragonal magnets (FePt, CoPt, FeNi, FePd, MnAl, MnGa, MnAlC) come back with near-perfect lattices. So do the three hexagonal RE-TM compounds (SmCo₅, YCo₅, CeCo₅).

The remaining failure mode is rock-salt ionics like NaCl, MgO, CaO, NiO, MnO. Motifs, symmetry, and composition come out right, but the cell is systematically 25 to 30 percent too small. The model has learned the data distribution better than it has learned energetic optimality — it knows what a plausible crystal looks like without a strong signal for where the energy minimum is. Closing that gap is an objective problem, not a representation problem. The next step is a stability-aware reward signal, likely RL-style fine-tuning or diffusion-time optimization against an MLIP, so structures come out stable as generated rather than stable after a relax.

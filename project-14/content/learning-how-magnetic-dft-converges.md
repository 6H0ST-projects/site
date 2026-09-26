---
title: "SOC-Enabled SCF Trajectories Dataset"
projectTitle: "SOC-Enabled SCF Trajectories"
description: "310 spin–orbit-coupled SCF histories from magnetic crystals, with input and output charge and vector-spin densities and effective local potentials at all 49,007 evaluations, plus the DFT, spin and spin–orbit background needed to use them."
date: 2026-09-26
draft: false
scfCorpus: true
ogImage: "img/soc-scf/hero-spin-emergence-og.png"
bgColor: "#E7EAEE"
textColor: "#000"
---

**Project 14 & SF Compute · September 2026**

Our **SOC-SCF Trajectories Dataset** holds 310 self-consistent-field (SCF) histories from spin–orbit-coupled density functional theory calculations performed on select magnetic materials. For each SCF evaluation we store three full three-dimensional fields: the input charge and spin density, the produced effective potential, and the resulting density.

**A special thank you to the [SF Compute](https://sfcompute.com/) team.** SF Compute provided the H100 GPU infrastructure that made this collection possible. Their nodes supported multiple parallel spin–orbit-coupled Quantum ESPRESSO runs, preserving the charge, spin and potential fields throughout each SCF history. That sustained compute time let us collect both converged solutions and their full trajectory history.

<figure class="soc-figure">
  <div class="soc-scroll" tabindex="0" role="group" aria-label="Input spin density of FeAl2 in two crystal layers at SCF evaluations 1, 3, 5, 9 and 96.">
    {{< soc-img src="/img/soc-scf/hero-spin-emergence.webp" width="1680" height="869" alt="Ten slices of the input spin density m_z of FeAl2. At evaluation 1 the spin density is positive everywhere. By evaluations 5 and 9, negative regions appear between the atoms in both the Fe and Al layers, and the spin density around Fe takes a four-lobed shape. Evaluations 9 and 96 look nearly identical." >}}
  </div>
  <figcaption><strong>Figure 1</strong> Measured input spin density \(m_z\) from one qualified history in the dataset (C16 - FeAl₂), in a layer through the Fe atoms and a layer through the Al atoms. Colors are scaled using signed asinh.</figcaption>
</figure>

The dataset is available on Hugging Face at [project-14/soc-scf-trajectories](https://huggingface.co/datasets/project-14/soc-scf-trajectories) under CC BY 4.0.

We intend for this white paper to be a primer as much as a dataset card. If you already work with noncollinear DFT or are familiar with the concepts, feel free to skip to [what we built](#what-we-built) or the [use cases](#use-cases). Otherwise the sections below provide some background in the following order: [what DFT computes](#dft), [why the calculation is a loop](#scf), [collinear and noncollinear spin](#spin), [spin–orbit coupling](#soc), and [why magnets need all of it](#magnets). Every field image and chart is drawn from the released data. The diagrams and the interactive models are labeled as schematic and are intended to be illustrative.

### What a DFT calculation computes {#dft}

A crystal is a periodic lattice of nuclei and their electrons. The electrons in these systems determine almost everything we know about a material. Magnetic properties, bond strength and magnetization direction are all properties that the electrons determine. The Schrödinger equation underpins the behavior of these electrons, but in practice the many-electron wavefunction is unmanageable given it depends on the positions of all the electrons in the system at once. The FeAl₂ cell in Figure 1 has 44 valence electrons, giving rise to a 132-dimensional wavefunction. This is far too expensive to compute.

Hohenberg and Kohn showed that the ground-state electron density \(n(\mathbf r)\), a three-coordinate function, determines the ground-state properties of the system {{< cite "hohenberg1964" >}}. Kohn and Sham built on this and turned it into a practical method {{< cite "kohn1965" >}} where we can replace the interacting electrons with fictitious non-interacting ones that move in an effective potential, chosen so that they reproduce the same density. In atomic units,

$$\Big[-\tfrac12\nabla^2+v_{\rm eff}[n](\mathbf r)\Big]\psi_i(\mathbf r)=\varepsilon_i\,\psi_i(\mathbf r),\qquad n(\mathbf r)=\sum_i f_i\,|\psi_i(\mathbf r)|^2,$$

where the \(\psi_i\) are the Kohn–Sham orbitals and \(f_i\) their occupations. This effective potential has three parts: the attraction of the nuclei, represented by pseudopotentials that replace the core electrons; the classical electrostatic (Hartree) repulsion of the density; and exchange and correlation. The last of these carries the rest of the quantum mechanics (it is not known exactly and must be approximated). Every calculation in this dataset uses the PBE generalized-gradient approximation {{< cite "pbe1996" >}}.

### Self-consistency {#scf}

The Kohn–Sham problem is circular (think of a circular reference in Excel, it's the exact same concept). The potential depends on the density, but the density comes from the orbitals, which depend on the potential. A calculation must therefore start from an initial guess and iterate:

1. Build the effective potential from an input density
2. Solve the Kohn–Sham equations for orbitals in that potential
3. Sum the occupied orbitals into an output density
4. Compare the output with the input. If they agree within a tolerance, call it converged and stop. Otherwise, combine them into a new input and repeat.

This is the self-consistent-field (SCF) loop. We're searching for a fixed point \(n = F(n)\), where \(F\) maps an input density to the output density it produces. The mismatch \(R = F(n) - n\) is the residual. Often times, feeding the output straight back in oscillates or diverges, so solvers take damped steps,

$$n_{k+1}=n_k+\alpha\,\big(F(n_k)-n_k\big),\qquad 0<\alpha\le1,$$

and use the history of earlier steps to choose better ones. Pulay's DIIS {{< cite "pulay1980" >}} and Broyden-type methods {{< cite "johnson1988" >}} are the standard tools, often combined with preconditioners such as Kerker's, which damps long-wavelength charge sloshing {{< cite "kerker1981" >}}. Woods, Payne and Hasnip review the field {{< cite "woods2019" >}}.

There are two things we want to clarify here. The iteration axis is not time. An SCF history is a sequence of numerical guesses at fixed atomic positions, not electrons moving, and normally only the endpoint survives. Quantum ESPRESSO, like most DFT packages, keeps the latest density for restarts and discards the path entirely.

<figure class="soc-figure">
  <div class="soc-scroll" tabindex="0" role="group" aria-label="Schematic of the SCF loop, marking which quantities the dataset stores.">
{{< soc-svg "ks-loop" >}}
  </div>
  <figcaption><strong>Figure 2</strong> Schematic. Pink boxes are stored at every evaluation. Orbitals and the mixer's internal history are not, so an evaluation's output density is generally not the next evaluation's input.</figcaption>
</figure>

### Collinear and noncollinear spin {#spin}

Electrons carry spin. Spin is an intrinsic angular momentum with an attached magnetic moment. In most materials spin-up and spin-down electrons pair off and their moments cancel. In iron, cobalt, nickel and many of their compounds they do not. This imbalance is the magnetization.

One way to include spin in DFT calculations is the collinear, spin-polarized scheme of von Barth and Hedin {{< cite "vonbarth1972" >}}. It picks a single axis and treats spin-up and spin-down electrons as two populations with densities \(n_\uparrow\) and \(n_\downarrow\). The charge density is their sum, \(n = n_\uparrow + n_\downarrow\), and the magnetization density is their difference, \(m = n_\uparrow - n_\downarrow\). Every local moment in the crystal is then parallel or antiparallel to that one axis.

A noncollinear calculation lifts the restriction {{< cite "kubler1988 sandratskii1998" >}}. Each orbital becomes a two-component spinor, and the density at each point becomes a 2 × 2 matrix:

$$\rho(\mathbf r)=\tfrac12\big[n(\mathbf r)\,\mathbb 1+\mathbf m(\mathbf r)\cdot\boldsymbol\sigma\big],\qquad \psi_i=\begin{pmatrix}\psi_{i\uparrow}\\ \psi_{i\downarrow}\end{pmatrix},$$

where \(\boldsymbol\sigma\) are the Pauli matrices. Now four real numbers per point, \((n, m_x, m_y, m_z)\), describe the electrons. In this configuration the magnetization can point in any direction and change direction from place to place. Plane-wave and all-electron codes implement this routinely {{< cite "hobbs2000 kurz2004" >}}. The effective potential takes the same form with a scalar part \(V_0\) plus a spin-dependent part \(\mathbf B\cdot\boldsymbol\sigma\). These describe the four potential channels in the dataset.

<figure class="soc-figure">
  <div class="soc-scroll" tabindex="0" role="group" aria-label="Schematic comparing collinear and noncollinear spin.">
{{< soc-svg "collinear-noncollinear" >}}
  </div>
  <figcaption><strong>Figure 3</strong> Schematic. Collinear calculations allow only up or down along one shared axis. Noncollinear calculations allow a full vector at every point, stored as four real numbers.</figcaption>
</figure>

Without spin–orbit coupling, spin and space are decoupled. You could rotate every spin in the crystal by the same angle and the energy would not change {{< cite "sipr2016" >}}. In a collinear calculation the choice of axis is therefore arbitrary, and so is the direction of a ferromagnet's magnetization relative to its crystal. Real magnets do not behave like this. Spin–orbit coupling is what ties the spin to the magnet's lattice.

### Spin–orbit coupling {#soc}

Spin–orbit coupling is a relativistic effect. An electron moving through the electric field of a nucleus experiences, in its own rest frame, a magnetic field proportional to its orbital angular momentum \(\mathbf L\). Its spin \(\mathbf S\) couples to that field (Figure 4). For an electron in a central potential \(V(r)\) the result is

$$H_{\rm SO}=\xi(r)\,\mathbf L\cdot\mathbf S,\qquad \xi(r)=\frac{1}{2m_e^2c^2}\,\frac1r\frac{dV}{dr}.$$

Because \(\xi\) follows the slope of the potential, it is largest close to the nucleus and grows rapidly with nuclear charge. For hydrogen-like ions the splitting scales as \(Z^4/n^3\) {{< cite "bethe1957" >}}. Screening by inner electrons slows this growth for valence electrons in solids. SOC is modest in 3d metals such as iron and several times larger in 4d and 5d elements such as palladium and platinum (Figure 5) {{< cite "blancorey2019" >}}.

<figure class="soc-figure">
  <div class="soc-scroll" tabindex="0" role="group" aria-label="Schematic of the origin of spin–orbit coupling.">
{{< soc-svg "soc-frames" >}}
  </div>
  <figcaption><strong>Figure 4</strong> Schematic. From the electron's point of view the nucleus circles it, and the resulting magnetic field lines up with the orbital angular momentum. The spin's energy in that field is proportional to \(\mathbf L\cdot\mathbf S\).</figcaption>
</figure>

<figure class="soc-figure">
  <div class="soc-scroll" tabindex="0" role="group" aria-label="Bar chart of spin–orbit constants for Fe, Co, Cu, Pd, Pt and Au.">
    {{< soc-img src="/img/soc-scf/soc-strength.svg" width="590" height="209" loading="lazy" alt="Valence spin–orbit constants: Fe 60, Co 74, Cu 110, Pd 191, Pt 537 and Au 615 meV." >}}
  </div>
  <figcaption><strong>Figure 5</strong> Valence spin–orbit constants used in one first-principles study of Fe-based alloys {{< cite "blancorey2019" >}}. These are values from literature and not part of our dataset. Exact values depend on the atom's environment and the method.</figcaption>
</figure>

Spin–orbit coupling has two direct consequences that impact this dataset.

**It makes the calculation noncollinear.** Take \(\mathbf L\cdot\mathbf S = L_zS_z + \tfrac12(L_+S_- + L_-S_+)\). The second term flips a spin while changing the orbital angular momentum, so it mixes the spin-up and spin-down components of every state. Spin along a fixed axis is therefore no longer conserved, and a calculation with SOC has to work with spinors and a vector magnetization. In Quantum ESPRESSO that means noncollinear spinors plus fully relativistic pseudopotentials that carry the spin–orbit term {{< cite "theurich2001 dalcorso2005" >}}. Figure 6 shows the effect in our data. The FeAl₂ history starts with its magnetization strictly along \(z\), so the input \(m_x\) and \(m_y\) are exactly zero, as are \(B_x\) and \(B_y\). One solve later the output has transverse spin density around each Fe atom. By contrast, a collinear calculation would set these components to zero by construction.

**It ties the magnetization to the crystal.** Through \(\mathbf L\), the spin now 'feels' the shape of the electronic orbitals, and those orbitals are fixed by the crystal. The energy therefore depends on which way the magnetization points relative to the crystal axes. This is magnetocrystalline anisotropy (MAE). Van Vleck first traced MAE to spin–orbit coupling {{< cite "vanvleck1937" >}}, and Bruno later connected its size to how the orbital moment changes with direction {{< cite "bruno1989" >}}.

<figure class="soc-figure">
  <div class="soc-scroll" tabindex="0" role="group" aria-label="The three fields of the first SCF evaluation of FeAl2, on a vertical section through a chain of Fe atoms.">
    {{< soc-img src="/img/soc-scf/record-anatomy.webp" width="1680" height="1860" loading="lazy" alt="Twelve panels. Input density: n, m_x (exactly zero), m_y (exactly zero), m_z. Effective potential: V0, B_x (exactly zero), B_y (exactly zero), B_z. Output density: n, m_x and m_y with small four-lobed patterns around each Fe atom, and m_z." >}}
  </div>
  <figcaption><strong>Figure 6</strong> Three stored fields of evaluation 1 in the FeAl₂ history, on a vertical section through a chain of Fe atoms (represented as circles), with the crystal's c axis pointing up. The starting guess is collinear, so the input transverse spin and the transverse potential are exactly zero. The output is not zero, as spin–orbit coupling has produced small \(m_x\) and \(m_y\) lobes around each Fe atom.</figcaption>
</figure>

### The impact on magnets {#magnets}

Permanent magnet performance depends on the magnet's peak magnetic strength, its ability to retain that magnetism at high temperatures, and its ability to resist being demagnetized. This resistance to demagnetization is dependent on something called anisotropy in the magnet, or the energy cost of pointing the magnetization along different crystal axes. An easy axis gives the magnetization two stable directions that are separated by an energy barrier. To evaluate this barrier, a widely used criterion is the magnetic hardness

$$\kappa=\sqrt{\frac{K_1}{\mu_0M_s^2}}>1,$$

where \(K_1\) is the anisotropy constant and \(M_s\) the saturation magnetization {{< cite "coey2011 skomski2016" >}}. Anisotropy is not sufficient on its own, since coercivity also depends heavily on microstructure, lattice defects and operating temperature {{< cite "mccallum2014" >}}. This anisotropy is still a required property. Without it you have no permanent magnet.

{{< soc-rotate >}}

The 'best' (probably better phrased as most performant and widely used) magnets today, Nd₂Fe₁₄B and SmCo₅, get their anisotropy from the strong spin–orbit coupling of rare-earth 4f electrons {{< cite "coey2020" >}}. Their supply is concentrated, as has become all too topical in recent years. China mined about 270,000 of an estimated 390,000 tonnes of rare-earth oxide in 2025 {{< cite "usgs2026" >}}, and a 2022 U.S. Department of Energy assessment put its share of global rare-earth magnet production at 92% {{< cite "doe2022" >}}. American startups and other global rare-earth mining and refinement companies are cutting into this market share. Rare-earth-free candidates attempt to combine the magnetization of 3d elements such as iron, cobalt and manganese with anisotropy from crystal structure and from heavier elements with stronger SOC {{< cite "gutfleisch2011 mccallum2014" >}}. To properly screen a rare-earth-free permanent magnet candidate, we need to run these SOC-enabled calculations.

Those calculations are expensive, and often tricky to compute. The anisotropy energy is extremely small. Measured values for bcc iron, hcp cobalt and fcc nickel, as compiled by Xie and Blackman, are 1.4, 65 and −2.7 μeV per atom {{< cite "xie2004" >}}. Even L1₀ FePt, a benchmark hard magnet, reaches only about 1.8 meV per FePt pair {{< cite "staunton2004" >}}. To attempt to compute this anisotropy value directly, compounds need to be 'converged' (more on this later) far beyond the energy threshold of what will ultimately be a small difference between two large energies corresponding to different magnetization axes. Early first-principles work on iron, cobalt and nickel showed how demanding this process is {{< cite "daalderop1990 halilov1998" >}} (force-theorem methods estimate the difference from band energies at a fixed potential {{< cite "weinert1985 wang1993" >}}).

<figure class="soc-figure">
  <div class="soc-scroll" tabindex="0" role="group" aria-label="Residual and total-energy error of the FeAl2 history by SCF evaluation.">
    {{< soc-img src="/img/soc-scf/feal2-history.svg" width="590" height="403" loading="lazy" alt="Top: charge and spin residuals fall from about 1 to roughly 1e-6 (charge) and 1e-5 (spin) electrons per atom within 20 evaluations, stay near those levels until about evaluation 90, then fall again. Bottom: the total-energy error falls below the band of measured anisotropy energies by evaluation 15 and below logged precision by evaluation 18." >}}
  </div>
  <figcaption><strong>Figure 7</strong> Shown here: 96 evaluations of an FeAl₂ history. Top: L1 charge and spin residuals per atom. Bottom: total-energy error per atom relative to the final evaluation, against the range of measured anisotropy energies from bcc Fe {{< cite "xie2004" >}} to L1₀ FePt {{< cite "staunton2004" >}}. Energies are logged to 10⁻⁸ Ry.</figcaption>
</figure>

Shown above (Figure 7), the total energy drops below the scale of iron's anisotropy by evaluation 15 before the density has converged. The total energy is stationary at the solution, so its error shrinks faster than the density error, and quantities that depend on the density or the magnetization directly converge more slowly.

### Our dataset {#what-we-built}

We ran 310 SCF histories with spin–orbit coupling on candidate magnetic materials, using a GPU-accelerated build of Quantum ESPRESSO instrumented to write out its fields at every evaluation step. The result is SOC-SCF Trajectories {{< cite "project14_2026" >}}. For every evaluation it contains:

- the **input density** \((n, m_x, m_y, m_z)\) on the calculation's native real-space grid;
- the **effective local potential** \((V_0, B_x, B_y, B_z)\) built from it;
- the **output density** \((n, m_x, m_y, m_z)\) from the spinor Kohn–Sham solve;
- **scalar diagnostics**: charge and spin residuals, band and smearing energies, Fermi level and the net spin vector, plus the total energy that Quantum ESPRESSO reported for about half of the evaluations.

Each history also carries its crystal structure, the retained Quantum ESPRESSO input, its numerical settings and starting magnetization, an outcome label, a structural family and a frozen train, validation or test split.

<div class="soc-claim">
<p>To our knowledge, this is the first publicly released dataset of SCF field trajectories for periodic, spin–orbit-coupled DFT. At every SCF evaluation it preserves the input and output charge and vector-spin densities together with the effective local potential, on the native real-space grid.</p>
<p>We did search for counterexamples. The closest public data we found are density coefficients sampled along SCF trajectories for closed-shell molecules, released with NeuralSCF {{< cite "song2026" >}}; they contain no spin density and no crystals. Public crystalline density databases, such as the Materials Project charge-density collection, store converged densities that are at most collinear {{< cite "shen2022" >}}. Public spin–orbit datasets for machine learning, such as Materials-HAM-SOC, store Hamiltonians rather than field trajectories {{< cite "yin2025" >}}. Potential-to-density training pairs for crystals, including unconverged steps, have been generated with Quantum ESPRESSO to learn the Kohn–Sham map {{< cite "khan2026" >}}; that work does not describe spin channels, and we did not find a public release of its fields. The claim therefore depends on the combination: iteration-resolved density data by itself is not new.</p>
</div>

| Part of a record | How to read it |
| --- | --- |
| Density \(n\), \(m_x\), \(m_y\), \(m_z\) | Charge and spin density in electrons/Å³. Spin density uses electron-density units; integrating \(\mathbf m\) over the cell gives the spin moment in Bohr magnetons. |
| Potential \(V_0\), \(B_x\), \(B_y\), \(B_z\) | The local part of the effective potential, in eV. The B channels are energy coefficients, not a magnetic field in tesla. |
| What the potential omits | The nonlocal pseudopotential terms, which carry the spin–orbit coupling itself. The four local channels are not the whole Hamiltonian. |
| Density type | Pseudo-valence density from norm-conserving pseudopotentials, not an all-electron density. |
| Grid and frame | Arrays of shape (4, nz, ny, nx), C order with x fastest, on the native grid of each cell. Spin components use a Cartesian frame. |

The spin–orbit signal in the densities is small but it is present. In the final FeAl₂ evaluation the transverse spin density peaks at about 1% of the peak \(m_z\), and it sums to zero over the cell. Also, with LDA- and GGA-type functionals the exchange–correlation field is locally parallel or antiparallel to the magnetization {{< cite "capelle2001 eich2013" >}}. In that same evaluation, \(\mathbf B\) is collinear with \(\mathbf m\) at every grid point where \(|\mathbf m|\) exceeds 1% of its peak, and antiparallel at 99.1% of them. Opposite local contributions can also cancel. The FeAl₂ cell's net spin moment is 4.04 μB, while \(\int|\mathbf m|\,d\mathbf r\) is 4.81, because regions of negative \(m_z\) hold −0.38 electrons' worth of spin.

{{< soc-explorer >}}

Things to look for in the explorer. With **Input spin** selected, step from evaluation 1 to 9 and watch negative spin (gray) appear in the Al layer; it was not in the starting guess. **Spin residual** and **charge residual** show where input and output disagree. The residuals shrink by five to six orders of magnitude, and the part that remains concentrates around the Fe atoms. **Potential V₀** barely changes, because it is dominated by the fixed pseudopotential wells around each atom.

#### What the histories show

**Spin settles more slowly than charge.** The final spin residual exceeds the final charge residual in 308 of the 310 histories. That fits a known asymmetry in magnetic SCF calculations. Preconditioners such as Kerker's act on long-wavelength charge fluctuations, but spin density interacts only through the exchange–correlation kernel and is not preconditioned in that way {{< cite "woods2019" >}}.

**Progress is not monotone.** In 282 out of 310 histories, the residual rises at least once between adjacent evaluations, with some histories settling in a few dozen steps. Others, like the FeAl₂ run in Figure 7, stall on long plateaus which sit near 10⁻⁵ electrons per atom for about 70 evaluations before a final drop.

<figure class="soc-figure">
  <div class="soc-scroll" tabindex="0" role="group" aria-label="Charge and spin residual histories for all 310 trajectories.">
    {{< soc-img src="/img/soc-scf/residual-overview.webp" width="1639" height="780" loading="lazy" alt="Two panels of residual curves on a log scale. Qualified histories (pink) fall steeply to between 1e-6 and 1e-8. Censored histories (gray) mostly flatten between 1e-5 and 1e-3, with spin residuals higher than charge residuals." >}}
  </div>
  <figcaption><strong>Figure 8</strong> L1 charge and spin residuals per atom by SCF evaluation. 212 histories ran until the iteration limit set in their input, most often 160, 240 or 720 evaluations.</figcaption>
</figure>

**The moment's direction is a slow coordinate.** Anisotropy energies are small. Very little energy favors one magnetization direction over another, and the solver has very little to push against. In 197 of the 204 histories whose net moment stays above 0.5 μB, the moment ends within 2° of the starting direction. Two FeB₂ histories turn by 26–29° over 720 evaluations without converging (Figure 9). The trajectory here is informative as the endpoint alone cannot tell you whether a run kept its starting direction.

<figure class="soc-figure">
  <div class="soc-scroll" tabindex="0" role="group" aria-label="Angle of the net spin moment from its starting direction, by SCF evaluation.">
    {{< soc-img src="/img/soc-scf/moment-direction.webp" width="1639" height="780" loading="lazy" alt="Most gray lines stay near zero degrees. Two highlighted FeB2 histories rise slowly to between 26 and 29 degrees by evaluation 720. A few gray lines move early and then level off." >}}
  </div>
  <figcaption><strong>Figure 9</strong> Angle between the net spin moment and its direction at the first evaluation, for the 204 histories whose moment stays at or above 0.5 μB. The highlighted FeB₂ (AlB₂-type) runs are censored histories.</figcaption>
</figure>

#### Coverage and outcomes

Histories have one of three outcomes. A **qualified endpoint** converged and its final state passed independent electronic checks. **Solver converged** means Quantum ESPRESSO reported convergence but the endpoint was not independently qualified. **Censored** histories stopped first, almost always at the iteration limit set in their input. Censoring here does not claim that a system cannot converge.

<figure class="soc-figure">
  <div class="soc-scroll" tabindex="0" role="group" aria-label="310 histories: 32 qualified endpoints, 62 solver-converged, 216 censored.">
    {{< soc-img src="/img/soc-scf/outcomes.svg" width="590" height="144" loading="lazy" alt="A single bar split into 32 qualified endpoints, 62 solver-converged histories and 216 censored histories." >}}
  </div>
  <figcaption><strong>Figure 10</strong> Unfinished histories are intentionally preserved and labeled as such.</figcaption>
</figure>

It's worth knowing the limits of the coverage before working with the dataset:

- A qualified endpoint is an electronic solution at the recorded geometry and settings. It is not a proven magnetic ground state, a relaxed structure or a material-property label.
- 306 of the 310 histories use 8 k-points, a coarse 2×2×2 mesh. That is enough to study SCF behavior but far too coarse for converged anisotropy energies.
- 14 of the 22 structural families have no qualified endpoint. All 32 qualified endpoints started from a single magnetic species (31) or from parallel moments (1); none started from opposed or nonparallel moments.
- Evaluations within a history are strongly correlated. The 47,198 distinct maps are not 47,198 independent materials.

<details>
<summary>Coverage across the 22 structural families</summary>
<figure class="soc-figure">
  <div class="soc-scroll" tabindex="0" role="group" aria-label="Histories and qualified endpoints per structural family, grouped by frozen split.">
    {{< soc-img src="/img/soc-scf/family-coverage.svg" width="590" height="619" loading="lazy" alt="Horizontal bars for 22 families. bain-and-interstitial has 45 histories and 11 qualified endpoints; c16-al2cu 22 and 7; fourteen families have none." >}}
  </div>
  <figcaption>Gray bars count all histories and pink overlays count qualified endpoints. Families are grouped by their frozen split: 198 training, 43 validation and 69 test histories.</figcaption>
</figure>
</details>

<figure class="soc-figure">
  <div class="soc-scroll" tabindex="0" role="group" aria-label="Histograms of atoms per cell, grid points per channel and evaluations per history.">
    {{< soc-img src="/img/soc-scf/composition.svg" width="590" height="209" loading="lazy" alt="Atoms per cell range from 1 to 18, most often 6 or 8. Grid points per channel mostly lie between 150,000 and 400,000. Most histories have 160 or 240 evaluations; a few have 720." >}}
  </div>
  <figcaption><strong>Figure 11</strong> Cells hold 1 to 18 atoms. Histories run from 4 to 720 evaluations.</figcaption>
</figure>

### Use cases {#use-cases}

Most electronic-structure datasets record final outputs such as a converged density, an energy, or a Hamiltonian. This dataset specifically records the map the calculation iterates on, sampled away from its answer, for magnetic systems with spin–orbit coupling, and it preserves the runs that failed. Here we pose two potential questions that could be explored using this data.

#### Recovering response operators from trajectories

**Can you recover useful response operators from trajectories alone, and can a model learn them across structures?**

If we nudge the potential that a crystal's electrons experience, their density shifts, and it's this static response that underlies screening, phonons and magnetic excitations. This is normally computed with dedicated linear-response methods such as density-functional perturbation theory {{< cite "baroni2001" >}}, and for magnets, the spin component of the same response is where spin fluctuations and exchange interactions originate {{< cite "savrasov1998" >}}.

This same response governs the SCF loop. Near the solution, a damped step multiplies each error mode by \(1-\alpha\lambda\), where \(\lambda\) is an eigenvalue of the dielectric operator \(1-\chi_0K\) {{< cite "dederichs1983 woods2019" >}}. Here \(\chi_0\) is the Kohn–Sham response (potential to density) and \(K\) the Hartree and exchange–correlation kernel (density to potential). Charge sloshing makes some \(\lambda\) large, which forces small steps. Soft magnetic modes make others small, so they barely move. Without spin–orbit coupling enabled, turning the whole magnetization costs nothing and its \(\lambda\) is exactly zero; spin–orbit coupling lifts it only as far as the tiny anisotropy energy allows. Good preconditioners are, at heart, approximations to \(\chi_0\) {{< cite "herbst2021" >}}.

Because the dataset stores the potential between the two densities, each history samples both halves of that product:

$$\delta V\approx K\,\delta n_{\rm in},\qquad \delta n_{\rm out}\approx\chi_0\,\delta V,\qquad \frac{\partial F}{\partial n}=\chi_0K,$$

where \(\delta\) is the difference between two evaluations of the same history. The nonlocal pseudopotential terms, including spin–orbit coupling, do not change during a run, so the stored local potential carries every change in the Hamiltonian from one evaluation to the next. The densities have four components, so \(\chi_0\) couples charge and spin, and spin–orbit coupling couples the spin directions to one another.

<figure class="soc-figure">
  <div class="soc-scroll" tabindex="0" role="group" aria-label="Schematic: the stored input density, local potential and output density split one SCF step into two responses.">
{{< soc-svg "response-split" >}}
  </div>
  <figcaption><strong>Figure 12</strong> Schematic. The kernel \(K\) takes a density change to a potential change; the Kohn–Sham response \(\chi_0\) takes a potential change to a density change. Storing all three fields lets each be estimated separately.</figcaption>
</figure>

An experiment could proceed in two steps:

1. **Within one history**, fit \(K\) and \(\chi_0\) on the subspace the solver explored, which Broyden-type mixers do implicitly {{< cite "johnson1988" >}}, and use them to predict held-out evaluations. Then ask which modes are recovered, and whether the soft ones are spin modes or rotations of the moment.
2. **Across structures**, train a machine learning model conditioned on the crystal to predict \(\chi_0\) acting on a potential change, and test it on the frozen test families. Neural operators have been trained on the potential-to-density map for systems without spin {{< cite "khan2026" >}}; this dataset adds the spin channels and spin–orbit coupling.

Limits to consider:
- Each history probes only the directions its solver explored, so a recovered operator is low-rank and biased toward the modes that mattered in that run. 
- The orbital solve has its own tolerance, which sets a noise floor on small differences.
- Successive evaluations are strongly correlated, so the effective sample is closer to 163 geometries than to 49,007 maps.

#### Learned mixing for stuck magnetic runs

**Can a learned mixer or preconditioner, trained on trajectories, rescue runs that standard Broyden mixing leaves stuck, on structural families it never saw?**

Standard mixing handles charge well. Kerker-type preconditioners tame long-wavelength sloshing {{< cite "kerker1981" >}}, and adaptive damping makes the step length robust {{< cite "herbst2022" >}}. Spin is harder, because it is not preconditioned the same way {{< cite "woods2019" >}}. The final spin residual exceeds the charge residual in 308 of 310 histories. Of the 145 histories that keep a net moment of at least 0.5 μB for 40 or more evaluations, 14 were still turning, by more than 0.5° over the second half of the run. None of those 14 qualified, and their median final spin residual was about nine times higher than the others'. Figure 13 shows one of them. After 60 evaluations the FeB₂ spin residual stops improving, fluctuating between about 3 × 10⁻⁵ and 3 × 10⁻² at a median of 28 times the charge residual, while the moment turns by 29°.

<figure class="soc-figure">
  <div class="soc-scroll" tabindex="0" role="group" aria-label="FeB2 history: residuals and moment direction by SCF evaluation.">
    {{< soc-img src="/img/soc-scf/feb2-stall.svg" width="590" height="374" loading="lazy" alt="Top: the spin residual drops to about 1e-4 by evaluation 60, then fluctuates between about 3e-5 and 3e-2 for the rest of the run, above the charge residual. Bottom: the net moment's angle from its starting direction stays near zero until about evaluation 100, then rises to about 20 degrees by evaluation 480 and 29 degrees by evaluation 720." >}}
  </div>
  <figcaption><strong>Figure 13</strong> One censored FeB₂ history (AlB₂ type, 720 evaluations). Top: L1 charge and spin residuals per atom. Bottom: angle of the net spin moment from its starting direction.</figcaption>
</figure>

That points to a specific design where one could imagine a preconditioner that treats charge, longitudinal spin and the soft transverse modes differently. This preconditioner's parameters could be learned from the trajectories that converged and from stalled trajectories like the 216 histories we have in our dataset.

This question cannot be answered offline. The dataset does not store orbitals and the mixer's internal state, so a new mixer cannot be replayed on our recorded data. An honest test would run Quantum ESPRESSO live:

1. Train only on the training families.
2. Keeping every other setting fixed, take censored histories from the test families and restart each from its retained input with the learned mixer. The pseudopotential files are not redistributed, so this step needs the same QE pseudopotentials.
3. Compare against Broyden mixing and a strong non-learned baseline such as adaptive damping {{< cite "herbst2022" >}}. Report the fraction of runs that reach a qualified endpoint, the evaluations needed, and whether the endpoint matches with the same energy, moment and moment direction.

One-step accuracy should not be the goal here. A mixer that predicts the next density well can still be unstable inside the loop. Here we're looking for an increase in the number of qualified runs per GPU-hour.

### Using the dataset {#using}

The metadata is small enough to download whole. The fields are large enough that they are likely not small enough to download whole. Start from the metadata, choose the histories you want, then fetch only the shards they need.

| Path | Contents |
| --- | --- |
| `metadata/trajectories.jsonl` | One row per history: cell, grid, settings, starting magnetization, outcome, family and split. |
| `metadata/occurrences.jsonl.gz` | One row per evaluation, with its residual and the SHA-256 of its three fields. |
| `metadata/scalar-histories.jsonl.gz` | Per-evaluation diagnostics: component residuals, energies, Fermi level, net spin vector. |
| `metadata/routes/*.json` | Per-history index of field sizes, hashes, encodings and grids. |
| `metadata/inputs/*.in` | The retained Quantum ESPRESSO inputs. |
| `metadata/fields.jsonl.gz` | Lookup from each field to its raw shard. |
| `raw/shard-*.tar.zst` | Lossless float64 fields, about 1 GiB per shard. |

The first shard holds the final FeAl₂ evaluation used throughout this page. The repository's reader downloads only that shard, checks every hash and verifies the 44 electrons in each density:

```bash
pip install numpy zstandard huggingface_hub
hf download project-14/soc-scf-trajectories read_example.py --repo-type dataset --local-dir soc-example
python soc-example/read_example.py
```

Some practical guidance:

- **Keep the splits.** Train, validation and test are fixed by structural family (198, 43 and 69 histories). Randomly splitting evaluations leaks near-duplicates across the split.
- **Keep the order.** Canonical map identities bind the potential and output density but not the input, so convergence analysis needs the ordered evaluations.
- **Good uses** include spatial structure of charge and spin residuals, convergence diagnostics and stopping rules, compression and representation of vector fields, learned density-to-density or potential-to-density maps, and mixing or preconditioning research for noncollinear magnets.
- **Limits:** orbitals and mixer states are not stored, so exact replay of a history is not possible. Independent orbital reconstruction was done for selected final maps, not every intermediate one. A good one-step prediction does not by itself show stable iterative use or a speed-up.

**Release status.** The release is complete: all metadata and all 1,368 raw shards (1.46 TB) are published, each checked against its SHA-256 after upload, as recorded in `RAW_STATUS.json`. Data, metadata and the example reader are released under CC BY 4.0; please cite the exact repository revision you use. The license does not cover Quantum ESPRESSO or third-party pseudopotentials, neither of which is redistributed.

```bibtex
@misc{project14_soc_scf_trajectories_2026,
  author = {{Project-14}},
  title  = {SOC-SCF Trajectories},
  year   = {2026},
  url    = {https://huggingface.co/datasets/project-14/soc-scf-trajectories},
  note   = {Cite the exact dataset revision; CC BY 4.0}
}
```

### Collection {#collection}

Every history was computed with Quantum ESPRESSO's plane-wave code {{< cite "giannozzi2009 giannozzi2017" >}}, running on Nvidia H100 GPUs {{< cite "giannozzi2020" >}} and instrumented to write the three fields at each evaluation. Common settings: PBE exchange and correlation; fully relativistic norm-conserving pseudopotentials; 120 Ry wavefunction and 480 Ry density cutoffs; Marzari–Vanderbilt smearing (0.01 Ry in 291 histories); and symmetry disabled, so magnetization was free to take any direction. Density mixing used Quantum ESPRESSO's Broyden scheme in 304 histories and its local Thomas–Fermi variant in 6, with a mixing factor of 0.3 in 265 histories. Starting magnetizations, geometries, mixing and smearing were varied on purpose, so read each history's input rather than assuming a default. GPU time came from SF Compute.

<p class="wp-footnote">Field images and dataset charts on this page are generated from the public release by <code>docs/editorial/generate_soc_scf_figures.py</code> in this site's repository. Every residual it recomputes from the raw fields matches the published scalar history.</p>

### References

{{< references >}}

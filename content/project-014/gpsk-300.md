---
title: "GPSK-300: A Reciprocal-Space Diffusion Model for L1₀ Magnet Structure Prediction"
projectTitle: "GPSK-300"
ogImage: "og-image-gpsk-300.png"
description: "A visual white paper on GPSK-300: a 302M-parameter diffusion transformer that generates crystals in reciprocal space, reads the lattice back with one least-squares solve (≈0% error vs 7.7% for a learned head), and proposes L1₀ magnet structures in about 5 seconds."
bgColor: "#E7EAEE"
textColor: "#000"
anime: true
sidebarText: "If I could give one piece of advice to new researchers, it would be to never stop looking for new avenues of research. On top of what you have been given, ask yourself, what might be necessary ten years from now? What will society need? Find your own research theme, and every day, little by little, you have to keep working on it."
---

**Will Bryan**  ·  ghost-projects  ·  May 2026

GPSK-300 is a 3-channel, 302M-parameter diffusion transformer that learns the reciprocal space representations of inorganic crystal structures, and an exact quadratic form for the lattice. Structures are deterministically recovered via a joint IFFT of the reciprocal space channels and single linear least-squares fit of the generated lattice metric tensor.

<figure>
  <svg id="gpsk-anim-pipeline" viewBox="0 0 600 150" xmlns="http://www.w3.org/2000/svg" style="font-family:inherit;">
    <circle class="pl-dot" cx="10" cy="87" r="3" fill="#FF3336" opacity="0"/>
    <g class="pl-node">
      <rect x="8" y="58" width="96" height="58" fill="#000" fill-opacity="0.03" stroke="#888" stroke-width="0.8"/>
      <text x="56.0" y="82" text-anchor="middle" font-size="11" font-weight="500" fill="#111">prompt</text>
      <text x="56.0" y="98" text-anchor="middle" font-size="8.5" fill="#777">composition &#183; symmetry</text>
    </g>
    <g class="pl-arrow-g">
      <line class="pl-arrow" x1="104" y1="87" x2="126" y2="87" stroke="#888" stroke-width="1"/>
      <path class="pl-head" d="M 126 83.5 L 132 87 L 126 90.5 Z" fill="#888"/>
    </g>
    <g class="pl-node">
      <rect x="134" y="58" width="108" height="58" fill="#000" fill-opacity="0.03" stroke="#888" stroke-width="0.8"/>
      <text x="188.0" y="82" text-anchor="middle" font-size="11" font-weight="500" fill="#111">MMDiT &#183; 302M</text>
      <text x="188.0" y="98" text-anchor="middle" font-size="8.5" fill="#777">rectified flow, latent</text>
    </g>
    <g class="pl-arrow-g">
      <line class="pl-arrow" x1="242" y1="87" x2="264" y2="87" stroke="#888" stroke-width="1"/>
      <path class="pl-head" d="M 264 83.5 L 270 87 L 264 90.5 Z" fill="#888"/>
    </g>
    <g class="pl-node">
      <rect x="272" y="58" width="100" height="58" fill="#000" fill-opacity="0.03" stroke="#888" stroke-width="0.8"/>
      <text x="322.0" y="82" text-anchor="middle" font-size="11" font-weight="500" fill="#111">64&#179;&#215;3 grid</text>
      <text x="322.0" y="98" text-anchor="middle" font-size="8.5" fill="#777">Re F &#183; Im F &#183; 1/d&#178;</text>
    </g>
    <g class="pl-arrow-g">
      <line class="pl-arrow" x1="372" y1="87" x2="394" y2="87" stroke="#888" stroke-width="1"/>
      <path class="pl-head" d="M 394 83.5 L 400 87 L 394 90.5 Z" fill="#888"/>
    </g>
    <g class="pl-node">
      <rect x="402" y="58" width="92" height="58" fill="#000" fill-opacity="0.03" stroke="#888" stroke-width="0.8"/>
      <text x="448.0" y="82" text-anchor="middle" font-size="11" font-weight="500" fill="#111">decode</text>
      <text x="448.0" y="98" text-anchor="middle" font-size="8.5" fill="#777">LSQ + iFFT, no NN</text>
    </g>
    <g class="pl-arrow-g">
      <line class="pl-arrow" x1="494" y1="87" x2="516" y2="87" stroke="#888" stroke-width="1"/>
      <path class="pl-head" d="M 516 83.5 L 522 87 L 516 90.5 Z" fill="#888"/>
    </g>
    <g class="pl-node">
      <rect x="524" y="60" width="64" height="54" fill="none" stroke="#888" stroke-width="0.8"/>
      <circle cx="524" cy="60" r="5" fill="#FF3336"/><circle cx="588" cy="60" r="5" fill="#FF3336"/>
      <circle cx="524" cy="114" r="5" fill="#FF3336"/><circle cx="588" cy="114" r="5" fill="#FF3336"/>
      <circle cx="556" cy="87" r="4.5" fill="#1f2937"/>
      <text x="556" y="132" text-anchor="middle" font-size="8.5" fill="#777">crystal</text>
    </g>
  </svg>
</figure>

### Feature representation

Each crystal is represented as a \(64^3 \times 3\) tensor on the integer Miller grid \((h,k,l) \in [-32,31]^3\):

$$X(\mathbf{h}) \;=\; \bigl(\,\mathrm{Re}\,F(\mathbf{h}),\; \mathrm{Im}\,F(\mathbf{h}),\; 1/d^2(\mathbf{h})\,\bigr)$$

The first two channels are the complex structure factor. Atom species is determined via the Cromer–Mann scattering factors, and the third channel, \(1/d^2\) is an exact quadratic in \((h,k,l)\). Its six coefficients define the reciprocal metric tensor.

<figure>
  <svg id="gpsk-anim-channels" viewBox="0 0 600 236" xmlns="http://www.w3.org/2000/svg" style="font-family:inherit;">
    <text x="100" y="20" text-anchor="middle" font-size="12" font-style="italic" fill="#222">Re F(h)</text>
    <text x="300" y="20" text-anchor="middle" font-size="12" font-style="italic" fill="#222">Im F(h)</text>
    <text x="500" y="20" text-anchor="middle" font-size="12" font-style="italic" fill="#222">1/d&#178;(h)</text>
    <rect x="15" y="38" width="170" height="180" fill="#000" fill-opacity="0.025" stroke="#bbb" stroke-width="0.5"/>
    <rect x="215" y="38" width="170" height="180" fill="#000" fill-opacity="0.025" stroke="#bbb" stroke-width="0.5"/>
    <rect x="415" y="38" width="170" height="180" fill="#000" fill-opacity="0.025" stroke="#bbb" stroke-width="0.5"/>
    <g>
      <circle class="ch-peak" cx="40" cy="68" r="2.1" fill="#1f2937" opacity="0.46"/>
      <circle class="ch-peak" cx="40" cy="88" r="2.6" fill="#1f2937" opacity="0.47"/>
      <circle class="ch-peak" cx="40" cy="108" r="2.4" fill="#1f2937" opacity="0.52"/>
      <circle class="ch-peak" cx="40" cy="128" r="2.2" fill="#1f2937" opacity="0.52"/>
      <circle class="ch-peak" cx="40" cy="148" r="2.5" fill="#1f2937" opacity="0.55"/>
      <circle class="ch-peak" cx="40" cy="168" r="1.9" fill="#1f2937" opacity="0.45"/>
      <circle class="ch-peak" cx="40" cy="188" r="1.8" fill="#1f2937" opacity="0.50"/>
      <circle class="ch-peak" cx="60" cy="68" r="2.4" fill="#1f2937" opacity="0.41"/>
      <circle class="ch-peak" cx="60" cy="88" r="2.8" fill="#1f2937" opacity="0.61"/>
      <circle class="ch-peak" cx="60" cy="108" r="2.8" fill="#1f2937" opacity="0.61"/>
      <circle class="ch-peak" cx="60" cy="128" r="2.5" fill="#1f2937" opacity="0.54"/>
      <circle class="ch-peak" cx="60" cy="148" r="2.7" fill="#1f2937" opacity="0.52"/>
      <circle class="ch-peak" cx="60" cy="168" r="2.2" fill="#1f2937" opacity="0.49"/>
      <circle class="ch-peak" cx="60" cy="188" r="1.9" fill="#1f2937" opacity="0.47"/>
      <circle class="ch-peak" cx="80" cy="68" r="2.3" fill="#1f2937" opacity="0.56"/>
      <circle class="ch-peak" cx="80" cy="88" r="2.7" fill="#1f2937" opacity="0.61"/>
      <circle class="ch-peak" cx="80" cy="108" r="3.1" fill="#1f2937" opacity="0.73"/>
      <circle class="ch-peak" cx="80" cy="128" r="3.3" fill="#1f2937" opacity="0.76"/>
      <circle class="ch-peak" cx="80" cy="148" r="3.5" fill="#1f2937" opacity="0.79"/>
      <circle class="ch-peak" cx="80" cy="168" r="2.9" fill="#1f2937" opacity="0.62"/>
      <circle class="ch-peak" cx="80" cy="188" r="2.2" fill="#1f2937" opacity="0.46"/>
      <circle class="ch-peak" cx="100" cy="68" r="2.2" fill="#1f2937" opacity="0.45"/>
      <circle class="ch-peak" cx="100" cy="88" r="3.0" fill="#1f2937" opacity="0.60"/>
      <circle class="ch-peak" cx="100" cy="108" r="3.7" fill="#1f2937" opacity="0.78"/>
      <circle class="ch-peak" cx="100" cy="128" r="4.2" fill="#1f2937" opacity="0.90"/>
      <circle class="ch-peak" cx="100" cy="148" r="3.7" fill="#1f2937" opacity="0.86"/>
      <circle class="ch-peak" cx="100" cy="168" r="2.3" fill="#1f2937" opacity="0.57"/>
      <circle class="ch-peak" cx="100" cy="188" r="2.7" fill="#1f2937" opacity="0.51"/>
      <circle class="ch-peak" cx="120" cy="68" r="2.8" fill="#1f2937" opacity="0.49"/>
      <circle class="ch-peak" cx="120" cy="88" r="2.3" fill="#1f2937" opacity="0.61"/>
      <circle class="ch-peak" cx="120" cy="108" r="3.3" fill="#1f2937" opacity="0.67"/>
      <circle class="ch-peak" cx="120" cy="128" r="3.0" fill="#1f2937" opacity="0.77"/>
      <circle class="ch-peak" cx="120" cy="148" r="3.4" fill="#1f2937" opacity="0.75"/>
      <circle class="ch-peak" cx="120" cy="168" r="2.3" fill="#1f2937" opacity="0.55"/>
      <circle class="ch-peak" cx="120" cy="188" r="2.0" fill="#1f2937" opacity="0.44"/>
      <circle class="ch-peak" cx="140" cy="68" r="2.5" fill="#1f2937" opacity="0.43"/>
      <circle class="ch-peak" cx="140" cy="88" r="2.5" fill="#1f2937" opacity="0.52"/>
      <circle class="ch-peak" cx="140" cy="108" r="2.4" fill="#1f2937" opacity="0.63"/>
      <circle class="ch-peak" cx="140" cy="128" r="2.4" fill="#1f2937" opacity="0.64"/>
      <circle class="ch-peak" cx="140" cy="148" r="2.3" fill="#1f2937" opacity="0.58"/>
      <circle class="ch-peak" cx="140" cy="168" r="2.2" fill="#1f2937" opacity="0.50"/>
      <circle class="ch-peak" cx="140" cy="188" r="2.6" fill="#1f2937" opacity="0.53"/>
      <circle class="ch-peak" cx="160" cy="68" r="2.0" fill="#1f2937" opacity="0.51"/>
      <circle class="ch-peak" cx="160" cy="88" r="2.0" fill="#1f2937" opacity="0.46"/>
      <circle class="ch-peak" cx="160" cy="108" r="2.6" fill="#1f2937" opacity="0.53"/>
      <circle class="ch-peak" cx="160" cy="128" r="2.1" fill="#1f2937" opacity="0.60"/>
      <circle class="ch-peak" cx="160" cy="148" r="2.1" fill="#1f2937" opacity="0.47"/>
      <circle class="ch-peak" cx="160" cy="168" r="2.5" fill="#1f2937" opacity="0.45"/>
      <circle class="ch-peak" cx="160" cy="188" r="2.0" fill="#1f2937" opacity="0.38"/>
    </g>
    <g>
      <circle class="ch-peak" cx="240" cy="68" r="2.5" fill="#FF3336" opacity="0.51"/>
      <circle class="ch-peak" cx="240" cy="108" r="2.3" fill="#FF3336" opacity="0.51"/>
      <circle class="ch-peak" cx="240" cy="168" r="2.0" fill="#FF3336" opacity="0.47"/>
      <circle class="ch-peak" cx="260" cy="88" r="2.4" fill="#FF3336" opacity="0.53"/>
      <circle class="ch-peak" cx="260" cy="108" r="2.5" fill="#FF3336" opacity="0.52"/>
      <circle class="ch-peak" cx="260" cy="128" r="2.8" fill="#FF3336" opacity="0.64"/>
      <circle class="ch-peak" cx="260" cy="148" r="3.0" fill="#FF3336" opacity="0.57"/>
      <circle class="ch-peak" cx="260" cy="168" r="2.3" fill="#FF3336" opacity="0.54"/>
      <circle class="ch-peak" cx="260" cy="188" r="2.1" fill="#FF3336" opacity="0.41"/>
      <circle class="ch-peak" cx="280" cy="68" r="2.5" fill="#FF3336" opacity="0.52"/>
      <circle class="ch-peak" cx="280" cy="88" r="2.8" fill="#FF3336" opacity="0.54"/>
      <circle class="ch-peak" cx="280" cy="148" r="2.8" fill="#FF3336" opacity="0.65"/>
      <circle class="ch-peak" cx="300" cy="88" r="3.0" fill="#FF3336" opacity="0.59"/>
      <circle class="ch-peak" cx="300" cy="128" r="4.2" fill="#FF3336" opacity="0.90"/>
      <circle class="ch-peak" cx="300" cy="188" r="2.4" fill="#FF3336" opacity="0.48"/>
      <circle class="ch-peak" cx="320" cy="88" r="2.8" fill="#FF3336" opacity="0.64"/>
      <circle class="ch-peak" cx="320" cy="128" r="3.7" fill="#FF3336" opacity="0.81"/>
      <circle class="ch-peak" cx="320" cy="148" r="2.8" fill="#FF3336" opacity="0.78"/>
      <circle class="ch-peak" cx="340" cy="88" r="2.6" fill="#FF3336" opacity="0.61"/>
      <circle class="ch-peak" cx="340" cy="108" r="3.0" fill="#FF3336" opacity="0.59"/>
      <circle class="ch-peak" cx="340" cy="128" r="2.9" fill="#FF3336" opacity="0.59"/>
      <circle class="ch-peak" cx="340" cy="148" r="2.5" fill="#FF3336" opacity="0.54"/>
      <circle class="ch-peak" cx="340" cy="188" r="2.0" fill="#FF3336" opacity="0.55"/>
      <circle class="ch-peak" cx="360" cy="68" r="1.9" fill="#FF3336" opacity="0.38"/>
      <circle class="ch-peak" cx="360" cy="88" r="2.0" fill="#FF3336" opacity="0.49"/>
      <circle class="ch-peak" cx="360" cy="108" r="2.2" fill="#FF3336" opacity="0.49"/>
      <circle class="ch-peak" cx="360" cy="128" r="2.4" fill="#FF3336" opacity="0.49"/>
      <circle class="ch-peak" cx="360" cy="148" r="2.6" fill="#FF3336" opacity="0.57"/>
      <circle class="ch-peak" cx="360" cy="168" r="2.2" fill="#FF3336" opacity="0.51"/>
      <circle class="ch-peak" cx="360" cy="188" r="2.3" fill="#FF3336" opacity="0.41"/>
    </g>
    <g>
      <circle class="ch-ring" cx="500" cy="128" r="12" fill="none" stroke="#1f2937" stroke-width="1.6" opacity="0.78"/>
      <circle class="ch-ring" cx="500" cy="128" r="25" fill="none" stroke="#1f2937" stroke-width="1.46" opacity="0.69"/>
      <circle class="ch-ring" cx="500" cy="128" r="38" fill="none" stroke="#1f2937" stroke-width="1.32" opacity="0.60"/>
      <circle class="ch-ring" cx="500" cy="128" r="51" fill="none" stroke="#1f2937" stroke-width="1.1800000000000002" opacity="0.51"/>
      <circle class="ch-ring" cx="500" cy="128" r="64" fill="none" stroke="#1f2937" stroke-width="1.04" opacity="0.42"/>
      <circle class="ch-ring" cx="500" cy="128" r="77" fill="none" stroke="#1f2937" stroke-width="0.9" opacity="0.33"/>
      <circle cx="500" cy="128" r="2.2" fill="#1f2937"/>
    </g>
    <text x="100" y="232" text-anchor="middle" font-size="9" fill="#888">atomic positions</text>
    <text x="300" y="232" text-anchor="middle" font-size="9" fill="#888">broken symmetry</text>
    <text x="500" y="232" text-anchor="middle" font-size="9" fill="#888">lattice, quadratic in h</text>
  </svg>
</figure>

### Sampling

Our model learns a rectified-flow velocity field over a latent space created by a 2.6M-parameter periodic VAE that steps the input grid down by 4x along each axis. GPSK-300 is conditioned on composition, crystal system, space group, band gap, formation energy, energy above hull, and magnetic ordering. Each stream is independently dropped out 10% of the time during training. The default sampling config is set at 50 Euler steps with classifier free guidance, and we take the best of a user set N samples.

<figure>
  <svg id="gpsk-anim-decode" viewBox="0 0 600 482" xmlns="http://www.w3.org/2000/svg" style="font-family:inherit;">
    <text x="482.5" y="33" text-anchor="middle" font-size="10.5" font-style="italic" fill="#222">real space</text>
    <text x="85" y="32" text-anchor="middle" font-size="9.5" font-style="italic" fill="#222">Re F(h)</text>
    <rect x="15" y="40" width="140" height="120" fill="#000" fill-opacity="0.025" stroke="#bbb" stroke-width="0.5"/>
    <circle class="dn-noise" cx="87.7" cy="131.9" r="2.3" fill="#1f2937" opacity="0"/>
    <circle class="dn-noise" cx="58.9" cy="127.7" r="1.9" fill="#1f2937" opacity="0"/>
    <circle class="dn-noise" cx="105.0" cy="59.5" r="0.7" fill="#1f2937" opacity="0"/>
    <circle class="dn-noise" cx="70.6" cy="125.6" r="1.1" fill="#1f2937" opacity="0"/>
    <circle class="dn-noise" cx="85.2" cy="81.0" r="2.1" fill="#1f2937" opacity="0"/>
    <circle class="dn-noise" cx="140.2" cy="89.8" r="2.4" fill="#1f2937" opacity="0"/>
    <circle class="dn-noise" cx="30.7" cy="132.5" r="2.2" fill="#1f2937" opacity="0"/>
    <circle class="dn-noise" cx="41.7" cy="121.4" r="1.7" fill="#1f2937" opacity="0"/>
    <circle class="dn-noise" cx="141.4" cy="69.8" r="1.6" fill="#1f2937" opacity="0"/>
    <circle class="dn-noise" cx="132.4" cy="114.4" r="1.2" fill="#1f2937" opacity="0"/>
    <circle class="dn-noise" cx="33.2" cy="145.7" r="1.5" fill="#1f2937" opacity="0"/>
    <circle class="dn-noise" cx="146.5" cy="62.7" r="2.1" fill="#1f2937" opacity="0"/>
    <circle class="dn-noise" cx="123.9" cy="143.7" r="0.7" fill="#1f2937" opacity="0"/>
    <circle class="dn-noise" cx="69.2" cy="53.4" r="2.0" fill="#1f2937" opacity="0"/>
    <circle class="dn-noise" cx="67.0" cy="147.8" r="1.3" fill="#1f2937" opacity="0"/>
    <circle class="dn-noise" cx="119.0" cy="138.3" r="1.1" fill="#1f2937" opacity="0"/>
    <circle class="dn-noise" cx="92.0" cy="147.6" r="1.6" fill="#1f2937" opacity="0"/>
    <circle class="dn-noise" cx="67.6" cy="75.8" r="2.0" fill="#1f2937" opacity="0"/>
    <circle class="dn-noise" cx="46.9" cy="110.8" r="1.6" fill="#1f2937" opacity="0"/>
    <circle class="dn-noise" cx="91.6" cy="61.5" r="1.8" fill="#1f2937" opacity="0"/>
    <circle class="dn-noise" cx="136.6" cy="81.2" r="1.3" fill="#1f2937" opacity="0"/>
    <circle class="dn-noise" cx="135.7" cy="108.1" r="1.2" fill="#1f2937" opacity="0"/>
    <circle class="dn-noise" cx="24.2" cy="126.3" r="1.3" fill="#1f2937" opacity="0"/>
    <circle class="dn-noise" cx="80.9" cy="76.3" r="1.8" fill="#1f2937" opacity="0"/>
    <circle class="dn-noise" cx="113.4" cy="80.2" r="0.8" fill="#1f2937" opacity="0"/>
    <circle class="dn-noise" cx="145.4" cy="142.6" r="0.7" fill="#1f2937" opacity="0"/>
    <circle class="dn-noise" cx="93.0" cy="119.3" r="1.4" fill="#1f2937" opacity="0"/>
    <circle class="dn-noise" cx="113.7" cy="147.8" r="1.7" fill="#1f2937" opacity="0"/>
    <circle class="dn-noise" cx="71.6" cy="68.3" r="1.1" fill="#1f2937" opacity="0"/>
    <circle class="dn-noise" cx="41.7" cy="59.5" r="1.1" fill="#1f2937" opacity="0"/>
    <circle class="dn-noise" cx="127.4" cy="103.8" r="2.1" fill="#1f2937" opacity="0"/>
    <circle class="dn-noise" cx="137.1" cy="132.3" r="0.8" fill="#1f2937" opacity="0"/>
    <circle class="dn-noise" cx="137.8" cy="57.7" r="2.0" fill="#1f2937" opacity="0"/>
    <circle class="dn-noise" cx="127.0" cy="116.4" r="1.4" fill="#1f2937" opacity="0"/>
    <circle class="dn-noise" cx="32.3" cy="56.9" r="1.8" fill="#1f2937" opacity="0"/>
    <circle class="dn-noise" cx="53.0" cy="103.4" r="1.2" fill="#1f2937" opacity="0"/>
    <circle class="dn-noise" cx="43.3" cy="78.7" r="1.9" fill="#1f2937" opacity="0"/>
    <circle class="dn-noise" cx="83.4" cy="88.8" r="1.5" fill="#1f2937" opacity="0"/>
    <circle class="dn-noise" cx="91.7" cy="101.6" r="1.5" fill="#1f2937" opacity="0"/>
    <circle class="dn-noise" cx="143.0" cy="126.2" r="1.1" fill="#1f2937" opacity="0"/>
    <circle class="dn-noise" cx="62.5" cy="67.6" r="1.3" fill="#1f2937" opacity="0"/>
    <circle class="dn-noise" cx="26.5" cy="125.4" r="1.7" fill="#1f2937" opacity="0"/>
    <circle class="dn-sig" cx="41" cy="56.0" r="2.6" fill="#1f2937" opacity="0.61"/>
    <circle class="dn-sig" cx="41" cy="78.0" r="2.8" fill="#1f2937" opacity="0.62"/>
    <circle class="dn-sig" cx="41" cy="100.0" r="3.3" fill="#1f2937" opacity="0.64"/>
    <circle class="dn-sig" cx="41" cy="122.0" r="2.9" fill="#1f2937" opacity="0.59"/>
    <circle class="dn-sig" cx="41" cy="144.0" r="3.0" fill="#1f2937" opacity="0.59"/>
    <circle class="dn-sig" cx="63" cy="56.0" r="2.7" fill="#1f2937" opacity="0.59"/>
    <circle class="dn-sig" cx="63" cy="78.0" r="3.4" fill="#1f2937" opacity="0.72"/>
    <circle class="dn-sig" cx="63" cy="100.0" r="3.7" fill="#1f2937" opacity="0.76"/>
    <circle class="dn-sig" cx="63" cy="122.0" r="3.4" fill="#1f2937" opacity="0.75"/>
    <circle class="dn-sig" cx="63" cy="144.0" r="3.0" fill="#1f2937" opacity="0.60"/>
    <circle class="dn-sig" cx="85" cy="56.0" r="2.9" fill="#1f2937" opacity="0.63"/>
    <circle class="dn-sig" cx="85" cy="78.0" r="3.7" fill="#1f2937" opacity="0.80"/>
    <circle class="dn-sig" cx="85" cy="100.0" r="4.4" fill="#1f2937" opacity="0.95"/>
    <circle class="dn-sig" cx="85" cy="122.0" r="3.3" fill="#1f2937" opacity="0.77"/>
    <circle class="dn-sig" cx="85" cy="144.0" r="3.3" fill="#1f2937" opacity="0.68"/>
    <circle class="dn-sig" cx="107" cy="56.0" r="2.9" fill="#1f2937" opacity="0.65"/>
    <circle class="dn-sig" cx="107" cy="78.0" r="3.1" fill="#1f2937" opacity="0.68"/>
    <circle class="dn-sig" cx="107" cy="100.0" r="3.6" fill="#1f2937" opacity="0.83"/>
    <circle class="dn-sig" cx="107" cy="122.0" r="3.0" fill="#1f2937" opacity="0.71"/>
    <circle class="dn-sig" cx="107" cy="144.0" r="3.1" fill="#1f2937" opacity="0.62"/>
    <circle class="dn-sig" cx="129" cy="56.0" r="3.0" fill="#1f2937" opacity="0.50"/>
    <circle class="dn-sig" cx="129" cy="78.0" r="3.1" fill="#1f2937" opacity="0.66"/>
    <circle class="dn-sig" cx="129" cy="100.0" r="2.7" fill="#1f2937" opacity="0.64"/>
    <circle class="dn-sig" cx="129" cy="122.0" r="3.0" fill="#1f2937" opacity="0.57"/>
    <circle class="dn-sig" cx="129" cy="144.0" r="2.8" fill="#1f2937" opacity="0.61"/>
    <text x="85" y="177" text-anchor="middle" font-size="9.5" font-style="italic" fill="#222">Im F(h)</text>
    <rect x="15" y="185" width="140" height="120" fill="#000" fill-opacity="0.025" stroke="#bbb" stroke-width="0.5"/>
    <circle class="dn-noise" cx="121.4" cy="237.5" r="0.8" fill="#FF3336" opacity="0"/>
    <circle class="dn-noise" cx="89.9" cy="212.6" r="1.6" fill="#FF3336" opacity="0"/>
    <circle class="dn-noise" cx="56.4" cy="229.1" r="1.6" fill="#FF3336" opacity="0"/>
    <circle class="dn-noise" cx="124.6" cy="294.4" r="1.4" fill="#FF3336" opacity="0"/>
    <circle class="dn-noise" cx="23.9" cy="271.0" r="1.3" fill="#FF3336" opacity="0"/>
    <circle class="dn-noise" cx="116.9" cy="279.4" r="0.8" fill="#FF3336" opacity="0"/>
    <circle class="dn-noise" cx="113.6" cy="222.6" r="1.2" fill="#FF3336" opacity="0"/>
    <circle class="dn-noise" cx="64.4" cy="249.0" r="1.1" fill="#FF3336" opacity="0"/>
    <circle class="dn-noise" cx="84.3" cy="222.5" r="0.9" fill="#FF3336" opacity="0"/>
    <circle class="dn-noise" cx="54.0" cy="263.8" r="1.2" fill="#FF3336" opacity="0"/>
    <circle class="dn-noise" cx="47.8" cy="231.0" r="1.1" fill="#FF3336" opacity="0"/>
    <circle class="dn-noise" cx="145.1" cy="274.9" r="1.0" fill="#FF3336" opacity="0"/>
    <circle class="dn-noise" cx="59.4" cy="238.3" r="1.6" fill="#FF3336" opacity="0"/>
    <circle class="dn-noise" cx="71.2" cy="247.4" r="2.0" fill="#FF3336" opacity="0"/>
    <circle class="dn-noise" cx="42.1" cy="251.2" r="1.0" fill="#FF3336" opacity="0"/>
    <circle class="dn-noise" cx="89.3" cy="226.0" r="2.1" fill="#FF3336" opacity="0"/>
    <circle class="dn-noise" cx="132.2" cy="292.5" r="1.4" fill="#FF3336" opacity="0"/>
    <circle class="dn-noise" cx="99.5" cy="210.5" r="1.9" fill="#FF3336" opacity="0"/>
    <circle class="dn-noise" cx="119.5" cy="237.4" r="1.2" fill="#FF3336" opacity="0"/>
    <circle class="dn-noise" cx="117.0" cy="271.0" r="2.1" fill="#FF3336" opacity="0"/>
    <circle class="dn-noise" cx="58.8" cy="218.2" r="1.1" fill="#FF3336" opacity="0"/>
    <circle class="dn-noise" cx="46.7" cy="193.7" r="0.9" fill="#FF3336" opacity="0"/>
    <circle class="dn-noise" cx="84.1" cy="237.8" r="2.2" fill="#FF3336" opacity="0"/>
    <circle class="dn-noise" cx="69.9" cy="210.7" r="2.3" fill="#FF3336" opacity="0"/>
    <circle class="dn-noise" cx="32.0" cy="228.3" r="2.0" fill="#FF3336" opacity="0"/>
    <circle class="dn-noise" cx="62.8" cy="293.3" r="2.0" fill="#FF3336" opacity="0"/>
    <circle class="dn-noise" cx="61.2" cy="282.8" r="2.3" fill="#FF3336" opacity="0"/>
    <circle class="dn-noise" cx="86.7" cy="207.9" r="0.9" fill="#FF3336" opacity="0"/>
    <circle class="dn-noise" cx="124.4" cy="285.3" r="1.8" fill="#FF3336" opacity="0"/>
    <circle class="dn-noise" cx="119.0" cy="275.5" r="1.1" fill="#FF3336" opacity="0"/>
    <circle class="dn-noise" cx="49.4" cy="283.2" r="2.1" fill="#FF3336" opacity="0"/>
    <circle class="dn-noise" cx="77.1" cy="221.1" r="0.8" fill="#FF3336" opacity="0"/>
    <circle class="dn-noise" cx="73.1" cy="287.5" r="1.0" fill="#FF3336" opacity="0"/>
    <circle class="dn-noise" cx="62.2" cy="196.7" r="1.7" fill="#FF3336" opacity="0"/>
    <circle class="dn-noise" cx="30.5" cy="263.2" r="1.5" fill="#FF3336" opacity="0"/>
    <circle class="dn-noise" cx="75.5" cy="220.0" r="1.2" fill="#FF3336" opacity="0"/>
    <circle class="dn-noise" cx="133.7" cy="290.8" r="2.0" fill="#FF3336" opacity="0"/>
    <circle class="dn-noise" cx="49.4" cy="214.6" r="1.3" fill="#FF3336" opacity="0"/>
    <circle class="dn-noise" cx="131.6" cy="291.1" r="1.1" fill="#FF3336" opacity="0"/>
    <circle class="dn-noise" cx="101.5" cy="232.5" r="1.5" fill="#FF3336" opacity="0"/>
    <circle class="dn-noise" cx="47.5" cy="268.0" r="2.0" fill="#FF3336" opacity="0"/>
    <circle class="dn-noise" cx="139.5" cy="243.4" r="1.5" fill="#FF3336" opacity="0"/>
    <circle class="dn-sig" cx="41" cy="201.0" r="2.4" fill="#FF3336" opacity="0.61"/>
    <circle class="dn-sig" cx="41" cy="223.0" r="2.7" fill="#FF3336" opacity="0.59"/>
    <circle class="dn-sig" cx="41" cy="245.0" r="3.2" fill="#FF3336" opacity="0.66"/>
    <circle class="dn-sig" cx="41" cy="289.0" r="3.0" fill="#FF3336" opacity="0.61"/>
    <circle class="dn-sig" cx="63" cy="201.0" r="2.9" fill="#FF3336" opacity="0.59"/>
    <circle class="dn-sig" cx="63" cy="223.0" r="3.3" fill="#FF3336" opacity="0.79"/>
    <circle class="dn-sig" cx="63" cy="289.0" r="2.7" fill="#FF3336" opacity="0.57"/>
    <circle class="dn-sig" cx="85" cy="267.0" r="3.4" fill="#FF3336" opacity="0.77"/>
    <circle class="dn-sig" cx="85" cy="289.0" r="2.8" fill="#FF3336" opacity="0.61"/>
    <circle class="dn-sig" cx="107" cy="245.0" r="3.8" fill="#FF3336" opacity="0.73"/>
    <circle class="dn-sig" cx="107" cy="267.0" r="3.3" fill="#FF3336" opacity="0.78"/>
    <circle class="dn-sig" cx="107" cy="289.0" r="2.7" fill="#FF3336" opacity="0.63"/>
    <circle class="dn-sig" cx="129" cy="201.0" r="3.0" fill="#FF3336" opacity="0.60"/>
    <circle class="dn-sig" cx="129" cy="267.0" r="2.8" fill="#FF3336" opacity="0.65"/>
    <circle class="dn-sig" cx="129" cy="289.0" r="3.0" fill="#FF3336" opacity="0.48"/>
    <text x="85" y="322" text-anchor="middle" font-size="9.5" font-style="italic" fill="#222">1/d²(h)</text>
    <rect x="15" y="330" width="140" height="120" fill="#000" fill-opacity="0.025" stroke="#bbb" stroke-width="0.5"/>
    <circle class="dn-noise" cx="123.2" cy="349.8" r="1.6" fill="#1f2937" opacity="0"/>
    <circle class="dn-noise" cx="41.5" cy="377.8" r="1.7" fill="#1f2937" opacity="0"/>
    <circle class="dn-noise" cx="141.9" cy="342.3" r="1.4" fill="#1f2937" opacity="0"/>
    <circle class="dn-noise" cx="36.6" cy="415.3" r="0.9" fill="#1f2937" opacity="0"/>
    <circle class="dn-noise" cx="47.4" cy="422.1" r="0.8" fill="#1f2937" opacity="0"/>
    <circle class="dn-noise" cx="132.8" cy="365.9" r="2.4" fill="#1f2937" opacity="0"/>
    <circle class="dn-noise" cx="36.2" cy="348.0" r="1.5" fill="#1f2937" opacity="0"/>
    <circle class="dn-noise" cx="61.3" cy="405.0" r="1.2" fill="#1f2937" opacity="0"/>
    <circle class="dn-noise" cx="64.0" cy="339.7" r="0.9" fill="#1f2937" opacity="0"/>
    <circle class="dn-noise" cx="23.4" cy="386.0" r="2.2" fill="#1f2937" opacity="0"/>
    <circle class="dn-noise" cx="89.6" cy="371.6" r="1.5" fill="#1f2937" opacity="0"/>
    <circle class="dn-noise" cx="117.9" cy="428.5" r="0.9" fill="#1f2937" opacity="0"/>
    <circle class="dn-noise" cx="103.2" cy="368.9" r="2.3" fill="#1f2937" opacity="0"/>
    <circle class="dn-noise" cx="112.9" cy="399.4" r="1.8" fill="#1f2937" opacity="0"/>
    <circle class="dn-noise" cx="117.5" cy="345.4" r="1.2" fill="#1f2937" opacity="0"/>
    <circle class="dn-noise" cx="27.8" cy="354.0" r="2.3" fill="#1f2937" opacity="0"/>
    <circle class="dn-noise" cx="93.9" cy="358.8" r="1.2" fill="#1f2937" opacity="0"/>
    <circle class="dn-noise" cx="75.0" cy="346.9" r="2.1" fill="#1f2937" opacity="0"/>
    <circle class="dn-noise" cx="70.3" cy="343.9" r="1.6" fill="#1f2937" opacity="0"/>
    <circle class="dn-noise" cx="74.3" cy="417.4" r="1.1" fill="#1f2937" opacity="0"/>
    <circle class="dn-noise" cx="52.6" cy="390.2" r="1.4" fill="#1f2937" opacity="0"/>
    <circle class="dn-noise" cx="39.0" cy="414.5" r="2.2" fill="#1f2937" opacity="0"/>
    <circle class="dn-noise" cx="126.1" cy="406.4" r="1.5" fill="#1f2937" opacity="0"/>
    <circle class="dn-noise" cx="121.0" cy="359.9" r="0.9" fill="#1f2937" opacity="0"/>
    <circle class="dn-noise" cx="48.4" cy="393.2" r="1.1" fill="#1f2937" opacity="0"/>
    <circle class="dn-noise" cx="77.0" cy="422.5" r="1.7" fill="#1f2937" opacity="0"/>
    <circle class="dn-noise" cx="47.7" cy="350.7" r="0.7" fill="#1f2937" opacity="0"/>
    <circle class="dn-noise" cx="29.3" cy="365.2" r="1.9" fill="#1f2937" opacity="0"/>
    <circle class="dn-noise" cx="125.9" cy="378.2" r="0.8" fill="#1f2937" opacity="0"/>
    <circle class="dn-noise" cx="92.4" cy="436.6" r="0.7" fill="#1f2937" opacity="0"/>
    <circle class="dn-noise" cx="101.0" cy="441.8" r="1.3" fill="#1f2937" opacity="0"/>
    <circle class="dn-noise" cx="96.4" cy="422.4" r="1.8" fill="#1f2937" opacity="0"/>
    <circle class="dn-noise" cx="44.4" cy="419.8" r="1.7" fill="#1f2937" opacity="0"/>
    <circle class="dn-noise" cx="104.9" cy="400.3" r="2.1" fill="#1f2937" opacity="0"/>
    <circle class="dn-noise" cx="93.9" cy="434.0" r="0.9" fill="#1f2937" opacity="0"/>
    <circle class="dn-noise" cx="26.0" cy="352.3" r="1.6" fill="#1f2937" opacity="0"/>
    <circle class="dn-noise" cx="112.1" cy="433.4" r="0.7" fill="#1f2937" opacity="0"/>
    <circle class="dn-noise" cx="24.0" cy="377.8" r="1.8" fill="#1f2937" opacity="0"/>
    <circle class="dn-noise" cx="72.5" cy="367.1" r="1.0" fill="#1f2937" opacity="0"/>
    <circle class="dn-noise" cx="111.4" cy="401.1" r="2.3" fill="#1f2937" opacity="0"/>
    <circle class="dn-noise" cx="63.6" cy="387.5" r="2.3" fill="#1f2937" opacity="0"/>
    <circle class="dn-noise" cx="109.8" cy="365.2" r="1.9" fill="#1f2937" opacity="0"/>
    <circle class="dn-ring" cx="85" cy="390.0" r="14" fill="none" stroke="#1f2937" stroke-width="1.5" opacity="0.78"/>
    <circle class="dn-ring" cx="85" cy="390.0" r="28" fill="none" stroke="#1f2937" stroke-width="1.35" opacity="0.65"/>
    <circle class="dn-ring" cx="85" cy="390.0" r="42" fill="none" stroke="#1f2937" stroke-width="1.2" opacity="0.52"/>
    <circle class="dn-ring" cx="85" cy="390.0" r="54" fill="none" stroke="#1f2937" stroke-width="1.05" opacity="0.39"/>
    <circle class="dn-sig" cx="85" cy="390.0" r="2" fill="#1f2937" opacity="0.85"/>
    <g>
      <path class="dn-fpath" d="M 155 100 H 218 V 157" fill="none" stroke="#888" stroke-width="1"/>
      <path class="dn-fpath" d="M 155 245 H 218 V 179" fill="none" stroke="#888" stroke-width="1"/>
      <circle class="dn-fnode" cx="218" cy="168" r="11" fill="none" stroke="#888" stroke-width="0.9"/>
      <text class="dn-fnode" x="218" y="171.5" text-anchor="middle" font-size="8.5" font-style="italic" fill="#555">F(h)</text>
      <line class="dn-ifft" x1="229" y1="168" x2="388" y2="168" stroke="#888" stroke-width="1"/>
      <path class="dn-ifft-head" d="M 388 164.5 L 394 168 L 388 171.5 Z" fill="#888"/>
      <text class="dn-lab-f" x="308" y="157" text-anchor="middle" font-size="8.5" fill="#555">iFFT of F(h)</text>
      <text class="dn-lab-f" x="308" y="182" text-anchor="middle" font-size="8" font-style="italic" fill="#999">atomic basis</text>
    </g>
    <g>
      <path class="dn-mpath" d="M 155 390 H 430 V 351" fill="none" stroke="#888" stroke-width="1"/>
      <path class="dn-mhead" d="M 426.5 351 L 430 345 L 433.5 351 Z" fill="#888"/>
      <text class="dn-lab-m" x="270" y="379" text-anchor="middle" font-size="8.5" fill="#555">least squares on 1/d&#178;</text>
      <text class="dn-lab-m" x="270" y="404" text-anchor="middle" font-size="8" font-style="italic" fill="#999">metric tensor G* &#8594; lattice</text>
    </g>
    <rect class="dc-cell" x="400" y="120" width="165" height="220" fill="none" stroke="#FF3336" stroke-width="1.4"/>
    <text class="dc-alab" x="482.5" y="356" text-anchor="middle" font-size="9.5" font-style="italic" fill="#FF3336">a</text>
    <text class="dc-alab" x="391" y="233.0" text-anchor="end" font-size="9.5" font-style="italic" fill="#FF3336">c</text>
    <circle class="dc-atom" cx="425" cy="148" r="10" fill="#FF3336" opacity="0.9"/>
    <circle class="dc-atom" cx="482" cy="148" r="10" fill="#FF3336" opacity="0.9"/>
    <circle class="dc-atom" cx="539" cy="148" r="10" fill="#FF3336" opacity="0.9"/>
    <circle class="dc-atom" cx="425" cy="196" r="8" fill="#1f2937" opacity="0.9"/>
    <circle class="dc-atom" cx="482" cy="196" r="8" fill="#1f2937" opacity="0.9"/>
    <circle class="dc-atom" cx="539" cy="196" r="8" fill="#1f2937" opacity="0.9"/>
    <circle class="dc-atom" cx="425" cy="244" r="10" fill="#FF3336" opacity="0.9"/>
    <circle class="dc-atom" cx="482" cy="244" r="10" fill="#FF3336" opacity="0.9"/>
    <circle class="dc-atom" cx="539" cy="244" r="10" fill="#FF3336" opacity="0.9"/>
    <circle class="dc-atom" cx="425" cy="292" r="8" fill="#1f2937" opacity="0.9"/>
    <circle class="dc-atom" cx="482" cy="292" r="8" fill="#1f2937" opacity="0.9"/>
    <circle class="dc-atom" cx="539" cy="292" r="8" fill="#1f2937" opacity="0.9"/>
    <line x1="15" y1="470" x2="155" y2="470" stroke="#ccc" stroke-width="2"/>
    <line class="dc-progress" x1="15" y1="470" x2="155" y2="470" stroke="#FF3336" stroke-width="2"/>
    <text x="15" y="463" font-size="8" fill="#888">t = 0, noise</text>
    <text x="155" y="463" text-anchor="end" font-size="8" fill="#888">t = 1</text>
  </svg>
</figure>

### Results on the target families

Given our focus on rare earth free permanent magents, much of our model evaluation focuses on magnetic families such as L1₀ tetragonal intermetallics. The c/a ratio that plays a large role in the magnetocrystalline anisotropy of a given magnet is recovered within 3% of the reference material in this L1₀ tetragonal family; ratios are *recovered/reference*:

| Composition | ref a (Å) | ref c (Å) | a ratio | c ratio | role |
|---|---:|---:|---:|---:|---|
| FePt | 2.73 | 3.73 | 0.995 | 1.003 | classic, K₁ ≈ 7 MJ/m³ |
| CoPt | 2.68 | 3.70 | 0.986 | 1.017 | high anisotropy |
| FeNi | 2.53 | 3.58 | 0.987 | 0.985 | tetrataenite, RE-free |
| MnAl | 2.78 | 3.56 | 0.965 | 0.998 | τ-MnAl, RE-free |

<div id="gpsk-explorer" class="rx">
  <div class="rx-filters" role="tablist" aria-label="filter results by category">
    <button type="button" class="rx-f is-active" data-cat="all">all</button>
    <button type="button" class="rx-f" data-cat="recovered">recovered</button>
    <button type="button" class="rx-f" data-cat="holdout">held-out composition</button>
    <button type="button" class="rx-f" data-cat="unseen">unseen formula</button>
    <button type="button" class="rx-f" data-cat="offtarget">off-target</button>
  </div>
  <div class="rx-chips"></div>
  <div class="rx-detail">
    <img class="rx-img" src="/img/gpsk300_tiles/fept.png" alt="Generated versus expected crystal structure" />
    <div class="rx-info">
      <p class="rx-name">FePt</p>
      <p class="rx-meta">L1&#8320; tetragonal &#183; trained</p>
      <div class="rx-bar"><div class="rx-fill" style="width:58%"></div></div>
      <p class="rx-rate">58% per-sample exact match (N = 48)</p>
      <p class="rx-note">The classic L1&#8320; magnet, K&#8321; &#8776; 7 MJ/m&#179;. Recovered lattice lands at 0.995 of reference a and 1.003 of reference c.</p>
    </div>
  </div>
</div>

### How far does it generalize?

We purposefully held out L1₀ compositions like FePd and MnGa from training while also removing the entire hexagonal SmCo₅ family. Learned structural motifs extend well regardless of the chemical system, but having never seen a hexagonal system, GPSK-300 was (unsurprisingly) unable to recover SmCo₅ after pre-training.

<figure>
  <svg id="gpsk-anim-holdout" viewBox="0 0 600 236" xmlns="http://www.w3.org/2000/svg" style="font-family:inherit;">
    <text x="168" y="18" font-size="9.5" font-style="italic" fill="#666">per-sample exact StructureMatcher match, N = 48 samples per prompt</text>
    <line x1="168" y1="34" x2="168" y2="222" stroke="#bbb" stroke-width="0.8"/>
    <text x="156" y="53" text-anchor="end" font-size="10.5" font-weight="500" fill="#222">trained L1&#8320;</text>
    <text x="156" y="65" text-anchor="end" font-size="8" fill="#999">FePt &#183; CoPt &#183; FeNi &#183; MnAl</text>
    <rect class="hb-bar" x="168" y="44" width="208.8" height="20" fill="#1f2937" opacity="0.9"/>
    <text class="hb-val" data-val="58" x="384.8" y="58" font-size="10.5" fill="#222" font-variant-numeric="tabular-nums">58%</text>
    <text x="156" y="99" text-anchor="end" font-size="10.5" font-weight="500" fill="#222">held-out FePd</text>
    <text x="156" y="111" text-anchor="end" font-size="8" fill="#999">composition unseen, family seen</text>
    <rect class="hb-bar" x="168" y="90" width="180.0" height="20" fill="#FF3336" opacity="0.9"/>
    <text class="hb-val" data-val="50" x="356.0" y="104" font-size="10.5" fill="#222" font-variant-numeric="tabular-nums">50%</text>
    <text x="156" y="145" text-anchor="end" font-size="10.5" font-weight="500" fill="#222">held-out MnGa</text>
    <text x="156" y="157" text-anchor="end" font-size="8" fill="#999">composition unseen, family seen</text>
    <rect class="hb-bar" x="168" y="136" width="165.6" height="20" fill="#FF3336" opacity="0.9"/>
    <text class="hb-val" data-val="46" x="341.6" y="150" font-size="10.5" fill="#222" font-variant-numeric="tabular-nums">46%</text>
    <text x="156" y="191" text-anchor="end" font-size="10.5" font-weight="500" fill="#222">unseen family</text>
    <text x="156" y="203" text-anchor="end" font-size="8" fill="#999">SmCo&#8325; &#183; YCo&#8325; &#183; CeCo&#8325;</text>
    <rect class="hb-bar" x="168" y="182" width="1.5" height="20" fill="#888" opacity="0.5"/>
    <text class="hb-val" data-val="0" x="177.5" y="196" font-size="10.5" fill="#222" font-variant-numeric="tabular-nums">0%</text>
  </svg>
</figure>

### Post-training

We fine-tuned the final pre-training checkpoint on a small curated set of squat CaCu₅ structures and re-prompted trying to hit our held-out targets. As little as a single sample was able to move the generated structure out of its tall default, and with one to five examples, SmCo₅, YCo₅, and CeCo₅ all land in the squat regime at c/a ≈ 0.88 against the 0.80 target.

<figure>
  <svg id="gpsk-anim-finetune" viewBox="0 0 600 252" xmlns="http://www.w3.org/2000/svg" style="font-family:inherit;">
    <line x1="80" y1="40" x2="80" y2="205" stroke="#888" stroke-width="0.6"/>
    <line x1="80" y1="205" x2="520" y2="205" stroke="#888" stroke-width="0.6"/>
    <line x1="80" y1="191.7" x2="520" y2="191.7" stroke="#1f2937" stroke-width="0.7" stroke-dasharray="3,3"/>
    <text x="86" y="185.7" text-anchor="start" font-size="8.5" font-style="italic" fill="#555">CaCu&#8325; target c/a &#8776; 0.80</text>
    <text x="74" y="61.3" text-anchor="end" font-size="8.5" fill="#888">1.8</text>
    <text x="74" y="141.3" text-anchor="end" font-size="8.5" fill="#888">1.2</text>
    <text x="74" y="194.7" text-anchor="end" font-size="8.5" fill="#888">0.8</text>
    <polyline class="ft-line" points="110,58.3 200,181.0 290,182.3 380,175.7 470,181.0" fill="none" stroke="#FF3336" stroke-width="1.6"/>
    <circle class="ft-pt" cx="110" cy="58.3" r="4.5" fill="#999"/>
    <circle class="ft-pt" cx="200" cy="181.0" r="4.5" fill="#FF3336"/>
    <circle class="ft-pt" cx="290" cy="182.3" r="4.5" fill="#FF3336"/>
    <circle class="ft-pt" cx="380" cy="175.7" r="4.5" fill="#FF3336"/>
    <circle class="ft-pt" cx="470" cy="181.0" r="4.5" fill="#FF3336"/>
    <text class="ft-note" x="128" y="56.3" text-anchor="start" font-size="9.5" font-style="italic" fill="#999">tall default, no recovery</text>
    <text class="ft-note" x="335" y="159.7" text-anchor="middle" font-size="9.5" font-style="italic" fill="#FF3336">squat, recovered from K = 1</text>
    <text x="110" y="219" text-anchor="middle" font-size="8.5" fill="#888">0</text><text x="200" y="219" text-anchor="middle" font-size="8.5" fill="#888">1</text><text x="290" y="219" text-anchor="middle" font-size="8.5" fill="#888">5</text><text x="380" y="219" text-anchor="middle" font-size="8.5" fill="#888">20</text><text x="470" y="219" text-anchor="middle" font-size="8.5" fill="#888">100</text>
    <text x="300" y="238" text-anchor="middle" font-size="9" font-style="italic" fill="#666">curated fine-tune examples K (squat CaCu&#8325;)</text>
    <text x="20" y="122" text-anchor="middle" font-size="9" font-style="italic" fill="#666" transform="rotate(-90 20 122)">median c/a of generated hex</text>
  </svg>
</figure>

### Conditioning

The seven conditioning streams emerged at different points throughout the training process. Symmetry arrives first, then space-group at roughly 70k training steps, then crystal system by 110k. All continuous properties took 2 to 3 times longer to emerge.

<figure class="emerge-fig">
  <svg id="gpsk-emerge" viewBox="0 0 600 276" xmlns="http://www.w3.org/2000/svg" style="font-family:inherit;">
    <line x1="62" y1="13" x2="78" y2="13" stroke="#1f2937" stroke-width="1.5" opacity="1.0"/>
    <text x="83" y="16" font-size="8.5" fill="#444">space group</text>
    <line x1="240" y1="13" x2="256" y2="13" stroke="#1f2937" stroke-width="1.5" opacity="1.0" stroke-dasharray="5,4"/>
    <text x="261" y="16" font-size="8.5" fill="#444">crystal system</text>
    <line x1="418" y1="13" x2="434" y2="13" stroke="#999" stroke-width="1.5" opacity="1.0"/>
    <text x="439" y="16" font-size="8.5" fill="#444">composition</text>
    <line x1="62" y1="29" x2="78" y2="29" stroke="#FF3336" stroke-width="1.5" opacity="1.0" stroke-dasharray="5,4"/>
    <text x="83" y="32" font-size="8.5" fill="#444">band gap</text>
    <line x1="240" y1="29" x2="256" y2="29" stroke="#FF3336" stroke-width="1.5" opacity="0.45"/>
    <text x="261" y="32" font-size="8.5" fill="#444">magnetic ordering</text>
    <line x1="418" y1="29" x2="434" y2="29" stroke="#FF3336" stroke-width="1.5" opacity="1.0"/>
    <text x="439" y="32" font-size="8.5" fill="#444">formation energy</text>
    <line x1="60" y1="46" x2="60" y2="232" stroke="#888" stroke-width="0.6"/>
    <line x1="60" y1="232" x2="570" y2="232" stroke="#888" stroke-width="0.6"/>
    <line x1="60" y1="170.0" x2="570" y2="170.0" stroke="#999" stroke-width="0.6" stroke-dasharray="3,4"/>
    <text x="570" y="165.0" text-anchor="end" font-size="8" font-style="italic" fill="#999">emergence threshold 0.3</text>
    <text x="54" y="69.7" text-anchor="end" font-size="8.5" fill="#888">0.8</text>
    <text x="54" y="152.3" text-anchor="end" font-size="8.5" fill="#888">0.4</text>
    <text x="54" y="235" text-anchor="end" font-size="8.5" fill="#888">0</text>
    <text x="60" y="246" text-anchor="middle" font-size="8.5" fill="#888">0</text>
    <text x="315" y="246" text-anchor="middle" font-size="8.5" fill="#888">250k</text>
    <text x="570" y="246" text-anchor="middle" font-size="8.5" fill="#888">500k</text>
    <text x="315.0" y="262" text-anchor="middle" font-size="9" font-style="italic" fill="#666">training step</text>
    <text x="14" y="139.0" text-anchor="middle" font-size="9" font-style="italic" fill="#666" transform="rotate(-90 14 139.0)">conditioning correlation</text>
    <defs><clipPath id="em2clip"><rect class="em2-cliprect" x="60" y="38" width="514" height="198"/></clipPath></defs>
    <g clip-path="url(#em2clip)">
      <polyline class="em2-curve" points="60.0,225.5 70.2,222.5 80.4,218.5 90.6,212.9 100.8,205.7 111.0,196.8 121.2,186.4 131.4,175.2 141.6,163.9 151.8,153.6 162.0,144.6 172.2,137.4 182.4,131.9 192.6,127.8 202.8,124.8 213.0,122.8 223.2,121.4 233.4,120.4 243.6,119.7 253.8,119.3 264.0,119.0 274.2,118.8 284.4,118.6 294.6,118.5 304.8,118.5 315.0,118.4 325.2,118.4 335.4,118.4 345.6,118.4 355.8,118.4 366.0,118.3 376.2,118.3 386.4,118.3 396.6,118.3 406.8,118.3 417.0,118.3 427.2,118.3 437.4,118.3 447.6,118.3 457.8,118.3 468.0,118.3 478.2,118.3 488.4,118.3 498.6,118.3 508.8,118.3 519.0,118.3 529.2,118.3 539.4,118.3 549.6,118.3 559.8,118.3 570.0,118.3" fill="none" stroke="#1f2937" stroke-width="1.5" opacity="1.0"/>
    <polyline class="em2-curve" points="60.0,230.7 70.2,230.1 80.4,229.1 90.6,227.8 100.8,225.8 111.0,223.1 121.2,219.2 131.4,213.9 141.6,207.1 151.8,198.7 162.0,188.9 172.2,178.3 182.4,167.7 192.6,157.9 202.8,149.4 213.0,142.6 223.2,137.3 233.4,133.5 243.6,130.7 253.8,128.7 264.0,127.4 274.2,126.5 284.4,125.8 294.6,125.4 304.8,125.1 315.0,124.9 325.2,124.8 335.4,124.7 345.6,124.7 355.8,124.6 366.0,124.6 376.2,124.6 386.4,124.6 396.6,124.5 406.8,124.5 417.0,124.5 427.2,124.5 437.4,124.5 447.6,124.5 457.8,124.5 468.0,124.5 478.2,124.5 488.4,124.5 498.6,124.5 508.8,124.5 519.0,124.5 529.2,124.5 539.4,124.5 549.6,124.5 559.8,124.5 570.0,124.5" fill="none" stroke="#1f2937" stroke-width="1.5" opacity="1.0" stroke-dasharray="5,4"/>
    <polyline class="em2-curve" points="60.0,231.7 70.2,231.6 80.4,231.4 90.6,231.2 100.8,230.8 111.0,230.2 121.2,229.3 131.4,228.0 141.6,226.2 151.8,223.6 162.0,219.9 172.2,215.0 182.4,208.6 192.6,200.6 202.8,191.4 213.0,181.4 223.2,171.4 233.4,162.1 243.6,154.2 253.8,147.7 264.0,142.8 274.2,139.2 284.4,136.5 294.6,134.7 304.8,133.4 315.0,132.6 325.2,132.0 335.4,131.6 345.6,131.3 355.8,131.1 366.0,131.0 376.2,130.9 386.4,130.8 396.6,130.8 406.8,130.8 417.0,130.8 427.2,130.8 437.4,130.7 447.6,130.7 457.8,130.7 468.0,130.7 478.2,130.7 488.4,130.7 498.6,130.7 508.8,130.7 519.0,130.7 529.2,130.7 539.4,130.7 549.6,130.7 559.8,130.7 570.0,130.7" fill="none" stroke="#999" stroke-width="1.5" opacity="1.0"/>
    <polyline class="em2-curve" points="60.0,232.0 70.2,232.0 80.4,232.0 90.6,232.0 100.8,232.0 111.0,232.0 121.2,232.0 131.4,231.9 141.6,231.9 151.8,231.9 162.0,231.8 172.2,231.7 182.4,231.5 192.6,231.3 202.8,230.9 213.0,230.4 223.2,229.6 233.4,228.5 243.6,226.9 253.8,224.6 264.0,221.4 274.2,217.1 284.4,211.4 294.6,204.4 304.8,196.3 315.0,187.6 325.2,178.8 335.4,170.7 345.6,163.7 355.8,158.1 366.0,153.7 376.2,150.5 386.4,148.2 396.6,146.6 406.8,145.5 417.0,144.7 427.2,144.2 437.4,143.9 447.6,143.6 457.8,143.5 468.0,143.4 478.2,143.3 488.4,143.2 498.6,143.2 508.8,143.2 519.0,143.2 529.2,143.2 539.4,143.1 549.6,143.1 559.8,143.1 570.0,143.1" fill="none" stroke="#FF3336" stroke-width="1.5" opacity="1.0" stroke-dasharray="5,4"/>
    <polyline class="em2-curve" points="60.0,232.0 70.2,232.0 80.4,232.0 90.6,232.0 100.8,232.0 111.0,232.0 121.2,232.0 131.4,232.0 141.6,232.0 151.8,232.0 162.0,232.0 172.2,232.0 182.4,232.0 192.6,232.0 202.8,232.0 213.0,232.0 223.2,232.0 233.4,232.0 243.6,232.0 253.8,231.9 264.0,231.9 274.2,231.9 284.4,231.8 294.6,231.7 304.8,231.6 315.0,231.4 325.2,231.0 335.4,230.6 345.6,229.9 355.8,228.9 366.0,227.4 376.2,225.2 386.4,222.2 396.6,218.0 406.8,212.2 417.0,204.7 427.2,195.5 437.4,184.7 447.6,173.1 457.8,161.5 468.0,150.7 478.2,141.5 488.4,134.0 498.6,128.2 508.8,124.0 519.0,121.0 529.2,118.8 539.4,117.3 549.6,116.3 559.8,115.6 570.0,115.2" fill="none" stroke="#FF3336" stroke-width="1.5" opacity="0.45"/>
    <polyline class="em2-curve" points="60.0,232.0 70.2,232.0 80.4,232.0 90.6,232.0 100.8,232.0 111.0,232.0 121.2,232.0 131.4,232.0 141.6,232.0 151.8,232.0 162.0,232.0 172.2,232.0 182.4,232.0 192.6,232.0 202.8,232.0 213.0,232.0 223.2,232.0 233.4,232.0 243.6,232.0 253.8,232.0 264.0,232.0 274.2,232.0 284.4,231.9 294.6,231.9 304.8,231.9 315.0,231.8 325.2,231.7 335.4,231.6 345.6,231.4 355.8,231.0 366.0,230.6 376.2,229.9 386.4,228.9 396.6,227.4 406.8,225.2 417.0,222.0 427.2,217.6 437.4,211.3 447.6,202.8 457.8,191.8 468.0,178.2 478.2,162.3 488.4,145.2 498.6,128.1 508.8,112.2 519.0,98.6 529.2,87.6 539.4,79.1 549.6,72.8 559.8,68.4 570.0,65.2" fill="none" stroke="#FF3336" stroke-width="1.5" opacity="1.0"/>
    </g>
    <line class="em2-play" x1="570.0" y1="46" x2="570.0" y2="232" stroke="#FF3336" stroke-width="1" opacity="0.55"/>
    <circle class="em2-dot" data-v="0.55" data-e="70" cx="570.0" cy="118.3" r="3.4" fill="#1f2937" opacity="1.0"/>
    <circle class="em2-dot" data-v="0.52" data-e="110" cx="570.0" cy="124.5" r="3.4" fill="#1f2937" opacity="1.0"/>
    <circle class="em2-dot" data-v="0.49" data-e="150" cx="570.0" cy="130.7" r="3.4" fill="#999" opacity="1.0"/>
    <circle class="em2-dot" data-v="0.43" data-e="250" cx="570.0" cy="143.1" r="3.4" fill="#FF3336" opacity="1.0"/>
    <circle class="em2-dot" data-v="0.57" data-e="380" cx="570.0" cy="115.2" r="3.4" fill="#FF3336" opacity="0.85"/>
    <circle class="em2-dot" data-v="0.84" data-e="420" cx="570.0" cy="65.2" r="3.4" fill="#FF3336" opacity="1.0"/>
  </svg>
  <div class="emerge-controls">
    <label>training step&nbsp; <output id="emerge-val">500k / 500k</output>
      <input id="emerge-step" type="range" min="0" max="500" step="5" value="500" /></label>
  </div>
</figure>

<figure class="sys-fig">
  <div class="sys-controls">
    <button type="button" class="sys-btn" data-sys="cubic">request cubic</button>
    <button type="button" class="sys-btn is-active" data-sys="tetragonal">request tetragonal</button>
    <button type="button" class="sys-btn" data-sys="hexagonal">request hexagonal</button>
  </div>
  <svg id="gpsk-sys" viewBox="0 0 600 245" xmlns="http://www.w3.org/2000/svg" style="font-family:inherit;">
    <line x1="55" y1="40" x2="55" y2="205" stroke="#888" stroke-width="0.6"/>
    <line x1="55" y1="205" x2="335" y2="205" stroke="#888" stroke-width="0.6"/>
    <line x1="111.0" y1="40" x2="111.0" y2="205" stroke="#ccc" stroke-width="0.6" stroke-dasharray="3,4"/>
    <line x1="279.0" y1="40" x2="279.0" y2="205" stroke="#ccc" stroke-width="0.6" stroke-dasharray="3,4"/>
    <line x1="55" y1="163.8" x2="335" y2="163.8" stroke="#ccc" stroke-width="0.6" stroke-dasharray="3,4"/>
    <text x="111.0" y="217" text-anchor="middle" font-size="8.5" fill="#888">90</text>
    <text x="279.0" y="217" text-anchor="middle" font-size="8.5" fill="#888">120</text>
    <text x="49" y="166.8" text-anchor="end" font-size="8.5" fill="#888">1.0</text>
    <text x="49" y="98.0" text-anchor="end" font-size="8.5" fill="#888">1.5</text>
    <text x="195" y="231" text-anchor="middle" font-size="9" font-style="italic" fill="#666">cell angle &#947; (&#176;)</text>
    <text x="18" y="122" text-anchor="middle" font-size="9" font-style="italic" fill="#666" transform="rotate(-90 18 122)">c/a</text>
    <circle class="sys-dot" cx="104.4" cy="107.7" r="3.2" fill="#1f2937" opacity="0.55"/>
    <circle class="sys-dot" cx="104.2" cy="103.1" r="3.2" fill="#1f2937" opacity="0.55"/>
    <circle class="sys-dot" cx="111.3" cy="141.5" r="3.2" fill="#1f2937" opacity="0.55"/>
    <circle class="sys-dot" cx="110.3" cy="88.4" r="3.2" fill="#1f2937" opacity="0.55"/>
    <circle class="sys-dot" cx="108.0" cy="125.1" r="3.2" fill="#1f2937" opacity="0.55"/>
    <circle class="sys-dot" cx="106.9" cy="90.9" r="3.2" fill="#1f2937" opacity="0.55"/>
    <circle class="sys-dot" cx="107.7" cy="116.1" r="3.2" fill="#1f2937" opacity="0.55"/>
    <circle class="sys-dot" cx="115.4" cy="137.4" r="3.2" fill="#1f2937" opacity="0.55"/>
    <circle class="sys-dot" cx="113.4" cy="104.5" r="3.2" fill="#1f2937" opacity="0.55"/>
    <circle class="sys-dot" cx="112.6" cy="100.7" r="3.2" fill="#1f2937" opacity="0.55"/>
    <circle class="sys-dot" cx="111.4" cy="136.4" r="3.2" fill="#1f2937" opacity="0.55"/>
    <circle class="sys-dot" cx="105.7" cy="125.5" r="3.2" fill="#1f2937" opacity="0.55"/>
    <circle class="sys-dot" cx="117.3" cy="89.6" r="3.2" fill="#1f2937" opacity="0.55"/>
    <circle class="sys-dot" cx="115.0" cy="139.1" r="3.2" fill="#1f2937" opacity="0.55"/>
    <circle class="sys-dot" cx="113.3" cy="144.2" r="3.2" fill="#1f2937" opacity="0.55"/>
    <circle class="sys-dot" cx="112.4" cy="107.0" r="3.2" fill="#1f2937" opacity="0.55"/>
    <circle class="sys-dot" cx="110.4" cy="109.8" r="3.2" fill="#1f2937" opacity="0.55"/>
    <circle class="sys-dot" cx="112.0" cy="100.5" r="3.2" fill="#1f2937" opacity="0.55"/>
    <circle class="sys-dot" cx="113.0" cy="142.7" r="3.2" fill="#1f2937" opacity="0.55"/>
    <circle class="sys-dot" cx="109.0" cy="138.0" r="3.2" fill="#1f2937" opacity="0.55"/>
    <circle class="sys-dot" cx="113.7" cy="120.6" r="3.2" fill="#1f2937" opacity="0.55"/>
    <circle class="sys-dot" cx="111.4" cy="127.0" r="3.2" fill="#1f2937" opacity="0.55"/>
    <circle class="sys-dot" cx="109.6" cy="143.1" r="3.2" fill="#1f2937" opacity="0.55"/>
    <circle class="sys-dot" cx="111.4" cy="89.8" r="3.2" fill="#1f2937" opacity="0.55"/>
    <text x="465" y="34" text-anchor="middle" font-size="10" font-style="italic" fill="#222">generated cell (median)</text>
    <polygon class="sys-cellpoly" points="441.0,152.9 489.0,152.9 489.0,87.1 441.0,87.1" fill="#FF3336" fill-opacity="0.12" stroke="#FF3336" stroke-width="1.3"/>
    <text class="sys-read" x="465" y="196" text-anchor="middle" font-size="9.5" fill="#222" font-variant-numeric="tabular-nums">median &#947; = 90&#176; &#183; c/a = 1.37</text>
  </svg>
</figure>

### Limitations

- **Unseen families are recoverable only via quick post-trains.** zero-shotting an unrepresented motif stays out of reach for this approach. The training corpus does have room to grow, but it does not seem like this representation is rich enough to achieve true unseen family recovery.
- **Big cells.** Preserving atom count for a given request -> a generated structure is easy enough, but lattice accuracy begins to degrade substantially around the 40 atom mark.

<p class="wp-footnote">GPSK-300 is available for free on Ouro, you can access it directy at https://ouro.foundation/services/will/gpsk-300 or via the Ouro API.</p>

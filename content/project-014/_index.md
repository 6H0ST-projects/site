---
title: "Project 014"
projectTitle: "Project 014"
description: ""
bgColor: "#E7EAEE"
textColor: "#000"
sidebarText: "If I could give one piece of advice to new researchers, it would be to never stop looking for new avenues of research. On top of what you have been given, ask yourself, what might be necessary ten years from now? What will society need? Find your own research theme, and every day, little by little, you have to keep working on it."
---

Magnets need to move into the 21st century. The NdFeB incumbent, which dominates over 60% of a $30B magnet market, was discovered in the 80s — surely we can do better.

Project 14 aims to create novel modeling methods for discovering the next generation of magnetic materials. Curie temperature, thermodynamic stability, magneto-crystalline anisotropy energy, and total magnetic density are already being accurately predicted by published [Ouro](https://ouro.foundation) models. The remaining bottleneck is the structure-prediction side: given a composition and a target symmetry, what crystal does it form?

GPSK-300 is our answer for the L1₀ tetragonal magnet family (FePt, CoPt, FeNi, FePd, MnAl, MnGa, MnAlC) and the hexagonal rare-earth–transition-metal magnets (SmCo₅, YCo₅, CeCo₅). A 304M-parameter multimodal diffusion transformer that generates crystals in reciprocal space, with a fully invertible 3-channel representation that decodes directly into a pymatgen `Structure` — no auxiliary lattice regressor, no element classifier, no MLIP volume scan.

The full write-up — methods, math, evaluation, failure modes — is here:

→ [**GPSK-300: A Reciprocal-Space Diffusion Model for L1₀ Magnet Structure Prediction**](/project-014/gpsk-300/)

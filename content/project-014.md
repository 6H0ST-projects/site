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

Curie temperature, thermodynamic stability, magneto-crystalline anisotropy energy, and total magnetic density are already being accurately predicted by Project 14's models.

Project 14 aims to build generative models that learn to construct three-dimensional crystal structures from scratch. Our current approach represents crystals as voxelized density fields with per-element channels. We intentionally model super cells over unit cells. Super cells are tolerant of point-wise mistakes that would otherwise destroy a sampled unit cell's general viability.

A variational autoencoder learns a compressed latent space over these density fields, giving the generative model a tractable domain to work in without losing structural fidelity. A diffusion transformer then learns to generate within that space using rectified flow — chosen over traditional noise schedules for its straighter sampling trajectories and faster convergence. The model conditions on three independent streams: composition, crystallographic symmetry, and target physical properties. These streams are decoupled by design — composition should not compete with symmetry for the model's attention, and neither should override a property constraint. The intent is to support rich, and predictable text -> crystal generation that can be steered by existing RL or prompt optimization techniques to create candidates with our desired magnetic properties.

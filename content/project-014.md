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

Project 14 aims to build generative models that learn to construct three-dimensional crystal structures from scratch. Our first model, GPSK-01, is a ~1.2B parameter diffusion transformer (757M trainable), trained on 450k structures from Materials Project & Alexandria. GPSK-01 represents crystals as voxelized density fields that are compressed using a ~9.5M parameter convolutional VAE (reconstruction MSE ~0.00014). We intentionally model super cells over unit cells. Super cells are tolerant of point-wise mistakes that could otherwise destroy a sampled unit cell's general viability. GPSK-01 supports conditioning on composition, structure, and properties. Element identity is read from the learned density representation post-hoc via a latent classifier.

GPSK-01 is a proof of concept, and will be the first in a family of increasingly capable generative models.
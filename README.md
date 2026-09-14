# Ghost Projects and Project 14

This repository contains two independent Hugo sites deployed as separate Vercel projects.

| Site | Vercel Root Directory | Production domain |
| --- | --- | --- |
| Ghost Projects | Repository root (`.`) | `www.ghost-projects.tech` |
| Project 14 | `project-14` | `project-14.us` |

The Ghost Projects 014 card links to Project 14. Its former `/project-014/` URLs permanently redirect to the corresponding pages on the new domain through the root `vercel.json`.

Project 14's content, templates, fonts, images, and scripts live entirely inside `project-14/`. It does not need access to files outside its Vercel Root Directory. The root site's existing static assets remain available for older image and social-preview URLs.

See [Project 14 deployment and domain setup](project-14/README.md) for the initial rollout order, Vercel settings, and DNS instructions.

## Local development

Use Hugo **0.148.2** (the version pinned in both Vercel configurations).

```sh
# Ghost Projects
hugo server --port 1313

# Project 14 (in another terminal)
hugo server --source project-14 --port 1314
```

Production builds:

```sh
hugo --gc --minify --cleanDestinationDir
hugo --source project-14 --gc --minify --cleanDestinationDir
```

Each build writes to its own `public/` directory. The root site's output is already tracked in this repository; rebuild it when changing that site. Project 14's generated output is ignored and rebuilt by Vercel.

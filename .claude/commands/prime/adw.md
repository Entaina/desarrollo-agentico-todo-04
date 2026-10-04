---
description: Inspecciona y explica la capa de workflows agénticos sin ejecutar efectos externos
allowed-tools: Bash, Read, Glob, Grep
---

# Comprende la capa ADW

Construye contexto para trabajar **sobre** el workflow agéntico. No ejecutes Claude, GitHub, commits, pushes ni PRs y no modifiques archivos.

1. Lee `adws/OPERATIONS.md` y `plans/README.md`.
2. Recorre `adws/bin/*.mjs`, `adws/lib/*.mjs` y `adws/test/*.test.mjs`.
3. Lee `/bug`, `/chore`, `/feature` y `/implement` en `.claude/commands/`.
4. Ejecuta solo inspecciones locales seguras: `git status --short --branch` y, si se solicita validación, `node --test adws/test/*.test.mjs` y los dry-runs documentados.

Explica:

- **Entrada:** de dónde sale el issue y qué campos consume;
- **Trigger:** diferencia entre arranque manual y señal opt-in `adw:ready`;
- **Entorno:** preflight, rama, herramientas, aislamiento y secretos;
- **Revisión:** validaciones, commit y PR como propuesta;
- la secuencia issue→clasificación→rama→plan→implementación→commit→PR;
- qué pasos son deterministas y dónde se crean procesos Claude con contextos nuevos;
- estado, idempotencia, fallos y recuperación.

Distingue trabajar sobre la capa ADW de ejecutar el ADW sobre la aplicación. Señala hechos e incertidumbres; no propongas cambios hasta recibir un encargo.

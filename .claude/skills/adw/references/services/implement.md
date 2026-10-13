---
name: implement
description: Materializa el plan vigente en la copia de trabajo.
skills: [implement]
---

# implement

## Entradas

- El plan vigente, en la ruta que da el adaptador.
- Un `environment` listo: la copia de trabajo en la rama del caso, con el entorno en marcha.

## Qué hace

1. Ejecuta el plan con la skill `implement` (`.claude/skills/implement/SKILL.md`). El plan se considera aprobado: si no puedes ejecutarlo, devuelve el bloqueo como resultado.
2. No registres ni publiques los cambios: es trabajo de `publish`.
3. Comprueba en la copia de trabajo que hay diff y que corresponde al plan.

## Resultado

El diff y un informe: archivos cambiados, comandos ejecutados con su resultado y desviaciones. Si no se ha podido ejecutar el plan, es un fallo.

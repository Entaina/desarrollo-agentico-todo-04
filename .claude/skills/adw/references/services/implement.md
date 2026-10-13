---
name: implement
description: Materializa el plan vigente en la copia de trabajo con un subagente de contexto nuevo.
performer: subagent
skills: [implement]
---

# implement

## Entradas

- El plan vigente, en la ruta que da el adaptador.
- Un `environment` listo: la copia de trabajo en la rama del caso, con el entorno en marcha.

## Qué hace

1. Lanza un subagente `general-purpose` con la herramienta `Agent` y la skill `implement` (`.claude/skills/implement/SKILL.md`). Empieza sin tu conversación y sin la del planificador: pásale el plan y una instrucción explícita. El plan se considera aprobado. Nadie le va a responder: si no puede ejecutarlo, debe devolver el bloqueo en su informe. No publica ni hace commit.
2. Comprueba en la copia de trabajo que hay diff y que corresponde al plan. Lo que diga el subagente no basta.

## Resultado

El diff y el informe del implementador: archivos cambiados, comandos ejecutados con su resultado y desviaciones. Si el subagente no ha podido ejecutar el plan, es un fallo.

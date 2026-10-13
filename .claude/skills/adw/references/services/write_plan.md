---
name: write_plan
description: Escribe el plan de un cambio de código, o una revisión del plan vigente, a partir de una especificación clara.
performer: subagent
skills: [feature, bug, chore]
---

# write_plan

## Entradas

- `specification`: título, descripción, aclaraciones y tipo de la petición.
- `change_request`: peticiones de cambio con los comentarios que las motivan, si las hay.
- Los planes anteriores, si los hay.
- La ruta donde escribir el plan, que da el adaptador.

## Qué hace

1. Lanza un subagente `general-purpose` con la herramienta `Agent` y la skill del tipo (`.claude/skills/<tipo>/SKILL.md`). Empieza sin tu conversación: pásale las entradas y una instrucción explícita. Nadie le va a responder: si encuentra una duda funcional o un bloqueo, debe devolverlo en su informe en lugar de preguntar. Planifica leyendo el código: no ejecuta, depura ni modifica la aplicación. Si encuentra un problema ajeno al encargo, lo anota como observación en su informe y no lo investiga. No publica ni hace commit.
2. Si hay peticiones de cambio, el subagente escribe una revisión solo con lo que cambia y cita las peticiones que recoge.
3. Comprueba que el plan existe y que cubre la especificación y las peticiones.
4. Publica el plan para informar, no para que lo aprueben.

## Resultado

El plan o la revisión publicados, o una duda funcional que la especificación no resuelve.

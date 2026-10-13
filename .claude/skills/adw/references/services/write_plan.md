---
name: write_plan
description: Escribe el plan de un cambio de código, o una revisión del plan vigente, a partir de una especificación clara.
skills: [feature, bug, chore]
---

# write_plan

## Entradas

- `specification`: título, descripción, aclaraciones y tipo de la petición.
- `change_request`: peticiones de cambio con los comentarios que las motivan, si las hay.
- Los planes anteriores, si los hay.
- La ruta donde escribir el plan, que da el adaptador.

## Qué hace

1. Escribe el plan con la skill del tipo (`.claude/skills/<tipo>/SKILL.md`) en la ruta que da el adaptador. Planifica leyendo el código: no ejecutes, depures ni modifiques la aplicación. Si encuentras un problema ajeno al encargo, anótalo como observación y no lo investigues.
2. Si hay peticiones de cambio, escribe una revisión solo con lo que cambia y cita las peticiones que recoge.
3. Si encuentras una duda funcional que la especificación no resuelve, no preguntes: devuélvela como resultado.
4. Comprueba que el plan existe y que cubre la especificación y las peticiones.
5. Publica el plan para informar, no para que lo aprueben.

## Resultado

El plan o la revisión publicados, o una duda funcional que la especificación no resuelve.

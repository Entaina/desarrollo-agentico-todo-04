---
name: publish
description: Registra los cambios del caso y publica la propuesta para revisión, o la actualiza si ya existe.
---

# publish

## Entradas

- Los cambios de la copia de trabajo y el informe de `implement`.
- El plan vigente.
- El tipo de trabajo.

## Qué hace

1. Registra todos los cambios con un mensaje convencional según el tipo. El checkout estaba limpio al empezar, así que todos los cambios son del caso.
2. Publícalos.
3. Si la propuesta no existe, créala. Su descripción la vincula a la petición e incluye un resumen, el enlace al plan vigente y el informe de `implement`, con los comandos que fallaron si los hubo. Después avisa en la petición.
4. Si la propuesta ya existe, actualízala con los cambios.

## Resultado

La propuesta publicada con todos los cambios del caso.

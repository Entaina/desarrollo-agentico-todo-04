---
name: report_failure
description: Comunica al humano que un stage ha fallado y cómo reintentar.
---

# report_failure

Lo invoca el motor cuando el servicio de un stage falla.

## Entradas

- El stage que ha fallado y el error.

## Qué hace

Comunica en la petición de trabajo qué stage ha fallado, por qué y cómo reintentar. No intentes arreglarlo: decidir qué hacer le corresponde al humano.

## Resultado

El fallo comunicado al humano.

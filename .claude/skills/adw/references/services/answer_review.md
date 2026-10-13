---
name: answer_review
description: Atiende los comentarios humanos de una revisión. Los responde, o constata que piden cambios que el plan todavía no recoge.
performer: coordinator
---

# answer_review

## Entradas

- Los comentarios humanos sin respuesta en la revisión de la propuesta.
- Los planes, con las peticiones que recoge cada revisión.

## Qué hace

1. Lee todos los comentarios humanos sin respuesta.
2. Si alguno pide cambios que ninguna revisión del plan recoge, no respondas todavía: la respuesta llegará cuando el cambio esté publicado. Devuelve esas peticiones con los comentarios que las motivan.
3. Si no, responde a cada comentario: qué has cambiado y en qué revisión del plan, la respuesta a una pregunta, o la duda que te impide atender un comentario ambiguo.

## Resultado

Todos los comentarios respondidos, o peticiones de cambio pendientes de recoger en el plan.

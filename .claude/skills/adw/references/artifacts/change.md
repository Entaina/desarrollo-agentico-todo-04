# Change

La propuesta de código que revisa el humano.

## Información

- La rama, que es la del `environment`, con sus commits y su diff.
- La propuesta publicada para revisión, con sus comentarios y revisiones.

## Contrato

- **Entradas:**
  - `specification`: el plan que debe materializar, y si está listo.
  - `environment`: dónde se trabaja, y si está listo.
- **Expone:** `changes_requested`.

## Ciclo de vida

| Stage | Guard | Servicio | Milestones |
| --- | --- | --- | --- |
| `Implementation` | La `specification` y el `environment` están listos y el Change no tiene `implemented` | [`implement`](../services/implement.md) | `implemented` |
| `Publication` | Con `implemented`, el `environment` listo y sin `published` | [`publish`](../services/publish.md) | `published` |
| `ReviewResponse` | Con `published`, sin `changes_requested` y con comentarios humanos sin responder | [`answer_review`](../services/answer_review.md) | `review_answered`, `changes_requested` |

| Milestone | Se alcanza cuando | Se invalida cuando |
| --- | --- | --- |
| `implemented` | El diff materializa la `specification` vigente | La `specification` deja de estar lista |
| `published` | La propuesta está publicada con todos los commits del Change | Se invalida `implemented` |
| `review_answered` | Todos los comentarios humanos tienen respuesta del agente | Llega un comentario humano nuevo |
| `changes_requested` | Hay comentarios humanos que piden cambios que ninguna revisión del plan recoge | Se vuelve a alcanzar `published` |
| `merged` | El humano integra la propuesta. Es terminal | — |
| `discarded` | El humano cierra la propuesta sin integrarla. Es terminal | — |

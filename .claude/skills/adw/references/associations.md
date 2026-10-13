# Asociaciones

Cablean los contratos de los artefactos: a qué artefacto concreto corresponde cada entrada. Es el único sitio donde un artefacto conoce a otro.

## Relaciones

Los artefactos se referencian por identidad, nunca por su funcionamiento interno.

- Cada Issue tiene como mucho un Environment, un Plan y un Change. Juntos forman un caso.
- El Environment, el Plan y el Change conocen la identidad de su Issue.

## Cableado

| Entrada | Se conecta con |
| --- | --- |
| `Plan.specification` | La Issue del caso. Está clara mientras la Issue tenga `clarified`. |
| `Plan.change_request` | El Change del caso. Llega una petición, con los comentarios que la motivan, cada vez que alcanza `changes_requested`. |
| `Change.specification` | El Plan del caso. Está listo mientras el Plan tenga `ready`. |
| `Issue.questions` | El Plan del caso. Llega una duda cada vez que alcanza `question_raised`. |
| `Environment.work_item` | La Issue del caso: su identidad, tipo y título. Está clara mientras la Issue tenga `clarified`. |
| `Plan.environment` | El Environment del caso. Está listo mientras tenga `ready`. |
| `Change.environment` | El Environment del caso. Está listo mientras tenga `ready` y liberado mientras tenga `released`. Su rama es la del Change. |
| `Environment.demand` | El Plan y el Change del caso. Hay demanda mientras el Plan tenga la `specification` clara y no tenga `ready`, o el Change tenga la `specification` lista y no tenga `implemented`: mientras quede trabajo que el entorno en marcha pueda desbloquear. |

## Eventos

Un evento afecta al artefacto sobre el que ocurre: lo que pasa en la petición de trabajo afecta a la Issue, y lo que pasa en la propuesta de código o en su revisión, al Change. Desde ese artefacto se llega al caso por las relaciones. Un evento que no afecta a ningún artefacto de un caso no tiene efecto.

## Cascadas

Se derivan del cableado. Están aquí para leer de un vistazo cómo se propaga una invalidación.

- **Una revisión pide cambios.** `Change.changes_requested` llega al Plan como `change_request` e invalida `Plan.ready`. La `specification` del Change deja de estar lista, lo que invalida `implemented` y, con él, `published`. Vuelve a haber `demand`: `Setup` arranca el entorno, lo que invalida `released`. Se reabren `Planning` e `Implementation`; al terminar, sin `demand`, `Teardown` para el entorno y `Publication` actualiza la propuesta. Al volver a alcanzar `published`, `ReviewResponse` responde explicando lo que ha cambiado.
- **El planificador encuentra una duda.** `Plan.question_raised` llega a la Issue por `questions` e invalida `clarified`. `Clarification` pregunta en la issue. Sin `specification` clara no hay `demand`, así que `Teardown` para el entorno y el caso queda quieto hasta que responde el humano. Cuando la Issue vuelve a `clarified`, se invalida `question_raised` y se reabre `Planning`.
- **Implementación terminada.** Al alcanzar `Change.implemented` deja de haber `demand`. `Teardown` para el entorno (`released`) y solo entonces se abre `Publication`: el entorno se para justo antes de publicar.
- **Otro caso usa la copia de trabajo.** Se invalidan `Environment.ready` y `Environment.released`. No se invalida nada más: los guards esperan, y `Setup` se reabre en cuanto vuelve a haber `demand`.
- **El humano cambia el alcance de la issue.** Se invalida `Issue.clarified`. La `specification` del Plan deja de estar clara, lo que invalida `ready`, y la cascada sigue por el Change.

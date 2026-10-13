# Environment

El lugar donde se trabaja en el caso: una rama propia y un entorno de desarrollo en marcha sobre ella.

## Información

- La rama del caso. Se asigna una sola vez, a partir de la petición de trabajo, y no cambia.
- La rama base de la que parte.
- Si la copia de trabajo está en la rama del caso y el entorno de desarrollo responde.

## Contrato

- **Entradas:** `work_item`, la petición de trabajo (identidad, tipo y título), y si está clara.
- **Expone:** `ready` y la rama del caso.

## Ciclo de vida

| Stage | Guard | Servicio | Milestones |
| --- | --- | --- | --- |
| `Setup` | El `work_item` está claro y el Environment no tiene `ready` | [`setup_environment`](../services/setup_environment.md) | `ready` |

| Milestone | Se alcanza cuando | Se invalida cuando |
| --- | --- | --- |
| `ready` | La copia de trabajo está en la rama del caso, al día, y el entorno de desarrollo responde | La copia de trabajo cambia de rama, se queda atrás o el entorno deja de responder |

`ready` describe la máquina donde trabaja el sistema, no el caso en general. Como en esta práctica varios casos comparten una sola copia de trabajo, trabajar en otro caso invalida el `ready` de este, y `Setup` se vuelve a abrir cuando hace falta.

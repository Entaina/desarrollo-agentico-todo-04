---
name: teardown_environment
description: Para el entorno de desarrollo del caso cuando ya no queda trabajo que lo necesite, sin tocar la copia de trabajo.
skills: [env:stop]
---

# teardown_environment

## Entradas

- Un entorno de desarrollo en marcha sobre la rama del caso.

## Qué hace

1. Para el entorno con el comando del proyecto `env:stop` (`.claude/commands/env/stop.md`). No borra contenedores, volúmenes ni datos.
2. Comprueba que el entorno ya no responde.
3. Deja la copia de trabajo como estaba: en la rama del caso y con los cambios sin registrar, si los hay. Registrarlos y publicarlos es trabajo de `publish`.

## Resultado

El entorno parado y la copia de trabajo intacta en la rama del caso. Si no se puede parar, es un fallo.

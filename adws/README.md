# Trigger de issues

Este lanzador consulta las issues abiertas con la etiqueta configurada, de más recientes a más antiguas por **fecha de creación**, y elige las que tienen el **turno del agente**. Para cada una invoca Claude con la foto JSON de la issue, de una en una: espera a que termine cada proceso antes de lanzar el siguiente. Cada consulta recoge hasta 100 issues; al terminar la lista espera el intervalo configurado y vuelve a consultar.

## Preparación

Necesitas Go (la versión del proyecto), Bash, Git, GitHub CLI (`gh`) y Claude Code (`claude`) v2.1.259+ en `PATH`, autenticados, y el checkout/entorno del proyecto ya disponibles. El lanzador reutiliza la librería YAML existente.

Este starter todo-04 incluye la skill **`/adw`**, que reutiliza `/feature`, `/bug`, `/chore` y `/implement`. La skill no tiene el flujo escrito: su especificación describe artefactos con sus ciclos de vida, servicios y asociaciones, y ante cada evento compone el workflow que necesita ese caso. El trigger solo decide cuándo invocarla.

El humano está **fuera del chat** e interviene solo en GitHub, en dos puntos de control: responder las preguntas del agente en la issue, si no está clara, y revisar el PR. Si el humano comenta el PR, el agente atiende la revisión en el mismo PR; el flujo termina cuando el humano lo integra o lo cierra. Si algo falla, el agente lo cuenta en la issue y se detiene; no hay bucles de corrección.

La issue también lleva el control del caso. La etiqueta `adw` la admite en el sistema; la asignación indica qué cuenta la gestiona, y una issue asignada a otra persona no la toca ningún otro sistema; `adw:waiting-for-human` indica que es tu turno, y se devuelve quitándola. Ver [control](../.claude/skills/adw/references/control.md).

El estado de cada caso es visible en la issue mediante etiquetas: `stage:<stage>` mientras un stage está abierto y `<artifact>:<milestone>` por cada milestone alcanzado (por ejemplo, `issue:clarified` o `plan:ready`). La skill crea las que falten. Los ciclos de vida están en [los artefactos](../.claude/skills/adw/references/artifacts/) y el modelo que los rige, en [GSM](../.claude/skills/adw/references/gsm.md).

## Cuándo lanza la skill

El trigger no sigue eventos uno a uno: mira el estado de control de cada issue y lanza la skill cuando el turno es del agente. Una issue tiene el turno del agente si:

- está abierta y lleva la etiqueta configurada (`adw`);
- no lleva `adw:waiting-for-human`: nadie está esperando al humano;
- no lleva ninguna etiqueta `stage:*`: no hay otra ejecución trabajando en el caso;
- está sin asignar o asignada solo a la cuenta de `gh` con la que trabaja el trigger.

Así no se forman ciclos. Mientras la skill trabaja, la etiqueta `stage:*` bloquea el caso, y al terminar le cede el turno al humano con `adw:waiting-for-human`, aunque no haya tenido nada que hacer. Los comentarios del agente no despiertan al trigger, y los del humano tampoco hasta que devuelve el turno quitando la etiqueta. Por eso, para que el agente atienda tus respuestas o tu revisión del PR, escribe lo que quieras y después quita `adw:waiting-for-human` de la issue.

## Configurar

Edita **`config/adw.yml`**. No necesitas editar el código ni establecer variables de entorno:

```yaml
repo: ""
label: adw
interval_seconds: 20
prompt: >-
  /adw {{payload}}
```

- `repo`: opcional. Vacío u omitido, la consulta no pasa `--repo` y `gh` usa su contexto de repositorio habitual. Con `OWNER/REPO`, se consulta ese repositorio explícitamente.
- `label`: etiqueta que admite las issues en el sistema. Debe coincidir con la que usa la skill (`adw`).
- `interval_seconds`: espera entre consultas, una vez terminada la lista anterior.
- `prompt`: texto que recibe Claude. Puede invocar tu propia skill o comando; `{{payload}}` se sustituye por la foto JSON de la issue (`url`, `number`, `title`, `labels`, `assignees` y `updatedAt`). No se evalúa como código de shell.

En forks o con varios remotos, comprueba qué repositorio resolverá `gh` con `gh repo view --json nameWithOwner --jq .nameWithOwner`; no presupongas que será tu fork. El trigger no cambia el repositorio predeterminado ni la configuración Git. Si `gh` no puede resolverlo o falla la consulta, termina sin lanzar Claude.

El bloque `>-` permite escribir un prompt largo en varias líneas: YAML las une con espacios.

## Arrancar

Desde la raíz del repositorio:

```bash
bash adws/trigger-github.sh
```

Para consultar y procesar la lista una sola vez:

```bash
bash adws/trigger-github.sh --once
```

También puedes ejecutar `go run ./adws` directamente. El script sitúa la ejecución en este checkout; no prepara otro entorno. Ambos admiten `--config ruta/al/config.yml` para elegir otro fichero. `--once` ejecuta Claude: no es una simulación.

Cada invocación equivale a `claude -p "<prompt configurado con la foto de la issue>" --permission-prompts none`. Este flag elimina herramientas que necesitan respuesta humana, como `AskUserQuestion`, y deniega solicitudes no autorizadas en vez de esperar; **no amplía permisos ni los desactiva**. Requiere Claude Code v2.1.259+. Confirma que el modo del cliente carga las skills/comandos del proyecto; no uses uno que los oculte.

La skill continúa automáticamente hasta abrir el PR. Si la issue no está clara, deja sus preguntas en ella (`issue:info-requested`) y te cede el turno. Cuando respondes y quitas `adw:waiting-for-human`, la siguiente consulta lanza la skill y retoma el trabajo. Con el PR publicado ocurre lo mismo con tus comentarios de revisión. Los errores se reportan en la issue y dejan la etiqueta `<artifact>:failed`; quitar `adw:waiting-for-human` es reintentar. Detén el sondeo con `Ctrl+C`; si `gh`, `git` o `claude` devuelven error, el lanzador termina.

## Límites de esta versión

- El lanzador no modifica etiquetas, no cierra issues ni recuerda las que ha ejecutado: en cada consulta vuelve a mirar el estado de control de las issues. Abrir un PR no cierra la issue por sí solo.
- El lanzador no crea entornos ni prepara el checkout entre issues. Antes de cada invocación comprueba que el checkout está limpio (`git status --porcelain`) y, si no lo está, termina sin lanzar Claude. La skill prepara el entorno de cada caso: su rama, registrada en el comentario de control de la issue, y `env:start`.
- El lanzador no interpreta comentarios ni gestiona reintentos o recuperación: eso lo decide la skill al reconstruir el estado.
- No interpreta el resultado de Claude. Código cero no demuestra que haya PR: el estado real está en las etiquetas de la issue.
- `--permission-prompts none` impide esperar o interrogar al humano, pero las operaciones siguen necesitando permisos previamente configurados.
- Si Claude no arranca o muere a mitad, **no hay garantía de comentario** y la issue puede quedarse con una etiqueta `stage:*`, que el trigger respeta como candado. Para reintentarla, quita esa etiqueta.

## Comprobar el lanzador

```bash
go test -p 1 ./adws
```

Los tests usan `gh`, `git` y `claude` simulados: no consultan GitHub ni ejecutan un agente real. Comprueban la configuración YAML, repo opcional o explícito, paradas ante errores de `gh`, la consulta, el filtro por turno del agente, la parada con el checkout sucio, el orden secuencial, el flag sin prompts de permiso, la sustitución literal del prompt, las paradas por error y el sondeo sin memoria. No sustituyen un ensayo completo del workflow hasta el PR.

# Trigger de issues

Este lanzador consulta las issues abiertas con la etiqueta configurada, de más recientes a más antiguas por **fecha de creación**, e invoca Claude de una en una. Espera a que termine cada proceso antes de lanzar el siguiente. Cada consulta recoge hasta 100 issues; al terminar la lista espera el intervalo configurado y vuelve a consultar.

## Preparación

Necesitas Go (la versión del proyecto), Bash, GitHub CLI (`gh`) y Claude Code (`claude`) v2.1.259+ en `PATH`, autenticados, y el checkout/entorno del proyecto ya disponibles. El lanzador reutiliza la librería YAML existente. `--jq` es el formateador integrado de `gh`: no necesita instalar `jq`.

Este starter todo-04 incluye la skill **`/adw`**, que reutiliza `/feature`, `/bug`, `/chore` y `/implement`. La skill no tiene el flujo escrito: su especificación describe artefactos con sus ciclos de vida, servicios y asociaciones, y ante cada evento compone el workflow que necesita ese caso. El trigger solo decide cuándo invocarla.

El humano está **fuera del chat** e interviene solo en GitHub, en dos puntos de control: responder las preguntas del agente en la issue, si no está clara, y revisar el PR. Si el humano comenta el PR, el agente atiende la revisión en el mismo PR; el flujo termina cuando el humano lo integra o lo cierra. Si algo falla, el agente lo cuenta en la issue y se detiene; no hay bucles de corrección.

La issue también lleva el control del caso. La etiqueta `adw` la admite en el sistema; la asignación indica qué cuenta la gestiona, y una issue asignada a otra persona no la toca ningún otro sistema; `adw:waiting-for-human` indica que es tu turno, y se devuelve quitándola. Ver [control](../.claude/skills/adw/references/control.md).

El estado de cada caso es visible en la issue mediante etiquetas: `stage:<stage>` mientras un stage está abierto y `<artifact>:<milestone>` por cada milestone alcanzado (por ejemplo, `issue:clarified` o `plan:ready`). La skill crea las que falten. Los ciclos de vida están en [los artefactos](../.claude/skills/adw/references/artifacts/) y el modelo que los rige, en [GSM](../.claude/skills/adw/references/gsm.md).

## Configurar

Edita **`config/adw.yml`**. No necesitas editar el código ni establecer variables de entorno:

```yaml
repo: ""
label: adw
interval_seconds: 20
prompt: >-
  /adw {{issue_url}} --base main
```

- `repo`: opcional. Vacío u omitido, la consulta no pasa `--repo` y `gh` usa su contexto de repositorio habitual. Con `OWNER/REPO`, se consulta ese repositorio explícitamente.
- `label`: etiqueta que selecciona las issues que se observarán; no acredita readiness ni concede permisos.
- `interval_seconds`: espera entre consultas, una vez terminada la lista anterior.
- `prompt`: texto que recibe Claude. Puede invocar tu propia skill o comando; `{{issue_url}}` se sustituye por la URL de cada issue. No se evalúa como código de shell.

En forks o con varios remotos, comprueba qué repositorio resolverá `gh` con `gh repo view --json nameWithOwner --jq .nameWithOwner`; no presupongas que será tu fork. El trigger no cambia el repositorio predeterminado ni la configuración Git. Si `gh` no puede resolverlo o falla la consulta, termina sin lanzar Claude.

`--base main` es un argumento de `/adw`, no una opción del trigger: indica la rama sobre la que se abre el PR. El bloque `>-` permite escribir un prompt largo en varias líneas: YAML las une con espacios.

La etiqueta configurada solo selecciona qué issues se observan. Que el agente actúe o no depende del estado del caso, que la skill reconstruye en cada invocación.

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

Cada invocación equivale a `claude -p "<prompt configurado con la URL>" --permission-prompts none`. Este flag elimina herramientas que necesitan respuesta humana, como `AskUserQuestion`, y deniega solicitudes no autorizadas en vez de esperar; **no amplía permisos ni los desactiva**. Requiere Claude Code v2.1.259+. Confirma que el modo del cliente carga las skills/comandos del proyecto; no uses uno que los oculte.

La skill continúa automáticamente hasta abrir el PR. Si la issue no está clara, deja sus preguntas en ella (`issue:info-requested`); cuando el humano responde, la siguiente invocación lo detecta y retoma el trabajo. Con el PR publicado, cada invocación mira también sus comentarios. Los errores se reportan en la issue y dejan la etiqueta `<artifact>:failed`. Detén el sondeo con `Ctrl+C`; si `gh` o `claude` devuelve error, el lanzador termina.

## Límites de esta versión

- El lanzador no modifica etiquetas, no cierra issues ni recuerda las que ha ejecutado: vuelve a invocar Claude para cada issue abierta con la etiqueta en cada consulta. La skill termina sin hacer nada cuando el caso está en quiescencia. Abrir un PR no cierra la issue por sí solo.
- El lanzador no crea entornos ni limpia el checkout entre issues. La skill exige un checkout limpio y prepara el entorno de cada caso: su rama, registrada en el comentario de control de la issue, y `env:start`.
- El lanzador no interpreta comentarios ni gestiona reintentos o recuperación. Las respuestas a las preguntas del agente y los comentarios del PR se recogen en la siguiente consulta.
- No interpreta el resultado de Claude. Código cero no demuestra que haya PR: el estado real está en la etiqueta de la issue.
- `--permission-prompts none` impide esperar o interrogar al humano, pero las operaciones siguen necesitando permisos previamente configurados.
- Si Claude no arranca o muere a mitad, **no hay garantía de comentario** y la issue puede quedarse con una etiqueta `stage:*`. Para reintentarla, quita esa etiqueta.

## Comprobar el lanzador

```bash
go test -p 1 ./adws
```

Los tests usan `gh` y `claude` simulados: no consultan GitHub ni ejecutan un agente real. Comprueban la configuración YAML, repo opcional o explícito, paradas ante errores de `gh`, la consulta, el orden secuencial, el flag sin prompts de permiso, la sustitución literal del prompt, las paradas por error y el sondeo sin memoria. No sustituyen un ensayo completo del workflow hasta el PR.

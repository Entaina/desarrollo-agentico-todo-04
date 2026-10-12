# Trigger de issues

Este lanzador consulta las issues abiertas con la etiqueta configurada, de más recientes a más antiguas por **fecha de creación**, e invoca Claude de una en una. Espera a que termine cada proceso antes de lanzar el siguiente. Cada consulta recoge hasta 100 issues; al terminar la lista espera el intervalo configurado y vuelve a consultar.

## Preparación

Necesitas Go (la versión del proyecto), Bash, GitHub CLI (`gh`) y Claude Code (`claude`) v2.1.259+ en `PATH`, autenticados, y el checkout/entorno del proyecto ya disponibles. El lanzador reutiliza la librería YAML existente. `--jq` es el formateador integrado de `gh`: no necesita instalar `jq`.

Este starter todo-04 incluye **una skill `/adw`**, con cuatro contratos BALSA/GSM y ejemplos, además de `/feature`, `/bug`, `/chore` y `/implement`. El trigger solo genera eventos; el motor compone el workflow de agentes. Los planificadores escriben un único plan y `/implement` materializa un plan aprobado sin commit, push ni PR; el coordinador controla los efectos posteriores autorizados.

En esta jornada el flujo llega hasta el PR, con **el humano fuera del chat y todo feedback en GitHub**. No incluye worktrees, artefactos de evidencia ni fases explícitas de validación/revisión independiente. Las comprobaciones normales de las skills y la CI existente permanecen.

Antes de arrancar, declara en la petición/configuración confiable los permisos de comunicación y actuación, las identidades GitHub que pueden decidir/aprobar y su alcance. Configura los permisos reales del cliente necesarios; la skill y una etiqueta no los conceden. Prepara el catálogo de labels solo con autorización: los milestones de esta jornada son `milestone/M-ready`, `milestone/M-plan_approved`, `milestone/M-implemented` y `milestone/M-pr_open`, coexistentes y separados de `adw:state:*`. Sin permiso/destino para comentar, la ejecución no tiene canal humano válido.

## Configurar

Edita **`config/adw.yml`**. No necesitas editar el código ni establecer variables de entorno:

```yaml
repo: OWNER/REPO
label: adw
interval_seconds: 20
prompt: >-
  /adw {{issue_url}} --remote origin --base main
```

- `repo`: repositorio donde buscar las issues. Se entrega vacío para que lo configures antes de arrancar.
- `label`: etiqueta que selecciona las issues que se observarán; no acredita readiness ni concede permisos.
- `interval_seconds`: espera entre consultas, una vez terminada la lista anterior.
- `prompt`: texto que recibe Claude. Puede invocar tu propia skill o comando; `{{issue_url}}` se sustituye por la URL de cada issue. No se evalúa como código de shell.

`origin` y `main` son argumentos del `/adw` del ejemplo, no opciones del trigger. Cámbialos según tu workflow. El bloque `>-` permite escribir un prompt largo en varias líneas: YAML las une con espacios.

La etiqueta configurada solo activa una observación: **no demuestra M-ready ni autoriza implementar/publicar**. Una issue incompleta puede generar preguntas en GitHub y terminar esperando. Fija los permisos y las autoridades antes de arrancar, por ejemplo en el texto confiable de `prompt`, no dentro de una issue/comentario no confiable.

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

El coordinador deja preguntas, planes para aprobación, bloqueos, errores y enlaces al PR en GitHub y termina la invocación. El humano responde allí; otra invocación vuelve a leer ese estado. No se arranca el trigger automáticamente ni se añade un watcher. Detén el sondeo con `Ctrl+C`; si `gh` o `claude` devuelve error, el lanzador termina.

## Límites de esta versión

- No modifica etiquetas, cierra issues ni recuerda las que ha ejecutado. Si una issue sigue abierta y conserva la etiqueta, puede volver a ejecutarse en la siguiente consulta o al reiniciar el trigger. Abrir un PR no cierra la issue por sí solo.
- No crea entornos, cambia de rama ni limpia el checkout entre encargos. El estado que deja un workflow afecta al siguiente.
- El lanzador no interpreta comentarios ni gestiona feedback, reintentos, recuperación o coordinación. `/adw` consulta GitHub en cada invocación; si la issue sigue abierta y etiquetada, un sondeo posterior puede recoger respuestas. No promete detección inmediata ni deduplicación mecánica.
- No interpreta el resultado de Claude. Código cero no demuestra PR, feedback publicado ni trabajo terminado; puede haber una espera o bloqueo comunicado por el motor.
- `--permission-prompts none` impide esperar/interrogar al humano, pero las operaciones siguen necesitando permisos previamente configurados. Una ambigüedad o capacidad ausente se reporta en GitHub cuando comunicar está autorizado.
- Si Claude no arranca, muere antes de reportar o GitHub falla, **no hay garantía de comentario**. El trigger actual solo conserva stdout/stderr y el código del proceso; un reportador externo de esos fallos no está implementado. No sustituye ese hueco por un chat humano ni crea infraestructura para cubrirlo.

## Comprobar el lanzador

```bash
go test -p 1 ./adws
```

Los tests usan `gh` y `claude` simulados: no consultan GitHub ni ejecutan un agente real. Comprueban la configuración YAML, la consulta, el orden secuencial, el flag sin prompts de permiso, la sustitución literal del prompt, las paradas por error y el sondeo sin memoria. No sustituyen un ensayo completo del workflow hasta el PR.

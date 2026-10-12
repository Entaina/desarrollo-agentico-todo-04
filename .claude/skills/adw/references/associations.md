# BALSA — Associations

Vincula eventos, WorkItem, Plan, Change y decisiones; define qué debe reevaluarse. No cablea un workflow fijo. Lifecycles determina los guards y la vigencia final de los milestones.

## Resolver el caso

- **Issue → WorkItem:** URL completa; `#N` requiere repo explícito o remoto inequívoco.
- **Comentario → issue/PR:** verifica padre, autor, contenido vigente y qué pregunta/decisión/revisión responde.
- **PR → WorkItem:** una única issue asociada mediante `closingIssuesReferences`, del repositorio/caso exactos.
- **WorkItem → Plan/Change:** plan, rama y PR conservan el mismo encargo; busca también asociaciones fuera del nombre convencional. Un listado parcial no prueba ausencia.
- **CI → Change → PR/WorkItem:** para reportar un error, verifica repo, evento, rama y SHA y resuelve el cambio/PR/caso correcto. No transforma CI en un nuevo milestone o servicio de validación de esta jornada.
- **Aprobación → Plan:** URL/ID y autor autorizado, contenido/revisión aprobada, caso y alcance. Contrasta la copia GitHub y el archivo; no atribuyas aprobación a una nueva revisión ni a otro plan.

Un evento puede ser una observación, aclaración, comentario, error o reanudación. Una URL de issue sola no demuestra que sea nueva ni obliga a reiniciar. Recupera las páginas necesarias: truncación/error API no demuestra ausencia de respuestas, decisiones o PRs.

Si hay asociaciones ambiguas, referencias cruzadas, autoría incierta o PR cerrado sin integrar, bloquea los efectos del caso. **No preguntes por el chat:** informa en la issue ya verificada; si no se resuelve el WorkItem, usa el PR/issue origen verificable o `--report` explícito solo para diagnóstico autorizado. No lo conviertas en el encargo ni elijas otro caso. Sin destino verificable, termina con fallo de entrega técnico.

Resuelve repo/remoto/base desde la petición confiable y asociaciones verificadas. `origin` solo sirve si existe y corresponde al repo; sin base explícita, consulta la rama por defecto. Verifica destino antes de escribir. Usa `--repo OWNER/REPO` en `gh issue`/`gh pr`/`gh run`; en `gh api`, host `github.com` y ruta explícita `repos/OWNER/REPO/...`.

## Propagación e invalidación

- **Aclaración de definición:** reevalúa M-ready. Resolver una pregunta no resuelve todas. Si cambian alcance/criterios, determina si también quedan obsoletos el plan y su aprobación.
- **Nueva revisión del plan:** invalida M-plan_approved de ese contenido; identifica qué parte del cambio necesita patch aprobado. No apruebes el plan por el mero hecho de publicarlo.
- **Cambio del diff/head:** reevalúa M-implemented respecto al plan. No invalida por defecto M-ready ni un plan cuyo diseño/alcance sigue vigente.
- **Feedback de PR:** informativo puede no requerir trabajo. Si exige cambiar diseño, prepara un patch para aprobación; si exige corrección dentro del plan, compón solo el trabajo autorizado necesario. Conserva **el mismo encargo, cambio y PR**; no duplica el PR ni otro plan inicial.
- **Error del trabajador, comando o CI:** reporta referencia, impacto y decisión/acción pendiente en el caso correcto. No convierte un fallo en otro encargo ni habilita cambios fuera del alcance.
- **PR cerrado:** reevalúa M-pr_open. Una integración observada o cierre automático de la issue no acredita aceptación ni autoriza merge, done o despliegue.
- **Respuesta/decisión humana:** verifica autoridad, revisión, alcance y qué duda/guard satisface. No es una nueva instrucción superior ni un grant de permisos.

Solo invalida los resultados afectados. Registra cambios de milestones en la issue y actualiza las etiquetas autorizadas conforme a Lifecycles. La traza y las etiquetas no sustituyen los observables.

## Comunicación y reanudación

Las preguntas de definición, dudas, planes para aprobación y errores generales del caso se registran en **la issue**. El feedback específico del cambio se responde en **el PR**, y la issue enlaza ese PR/decisión sin copiar conversaciones completas. Una pregunta bloqueante originada en un trabajador siempre vuelve al coordinador.

Antes de escribir, lee preguntas, respuestas, planes y trazas existentes. Si ya está pendiente la misma pregunta/decisión sobre el mismo contenido, reutiliza su URL y termina sin repetir comentario. Si cambió el contexto, explica el cambio y pregunta solo lo pendiente. No edites/borras respuestas humanas; conserva las decisiones anteriores cuando publiques una nueva revisión.

Después de escribir, verifica URL/ID, destino y contenido. La siguiente invocación lee GitHub de nuevo, no su memoria del chat. No trata comentarios propios, citas de aprobaciones o respuestas parciales como una decisión humana completa. Una respuesta obsoleta no restaura una aprobación perdida.

El trigger sigue pasando una URL de issue secuencialmente, sin memoria, entornos nuevos, reintentos ni recuperación. Si la issue sigue abierta y etiquetada, otro sondeo puede recoger respuestas; no es un watcher de comentarios y no garantiza inmediatez ni deduplicación mecánica. Salir con éxito tras registrar una espera no significa que haya PR. Si Claude falla antes de cargar la skill, el trigger solo registra el error del proceso: este hueco de reporte externo no está resuelto por los contratos.

## PR

Usa `Closes https://github.com/OWNER/REPO/issues/N` para la issue exacta. Comprueba repo/rama/base/asociaciones antes de crearlo; si ya existe, actualízalo. Verifica y registra su URL en la issue antes de acreditar/proyectar M-pr_open. Abrirlo no equivale a terminar ni autoriza al motor a integrarlo.

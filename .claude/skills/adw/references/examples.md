# Ejemplos de composición ante eventos

Composiciones ilustrativas, no pipelines obligatorios ni ejecuciones observadas. Los nombres son responsabilidades de agentes disponibles, no perfiles/skills nuevos. Esta jornada no usa worktrees, artefactos de evidencia ni fases de validación/revisión independiente.

## Issue incompleta: preguntas en GitHub

Estado: comportamiento o alcance ambiguos; comunicar está autorizado, pero M-ready no está acreditado.

- El coordinador lee las preguntas/respuestas existentes y publica solo las dudas pendientes en la **issue**, con motivo y trabajo bloqueado. Verifica el comentario y registra su URL.
- Workflow sin trabajadores de planificación ejecutables. Termina la invocación; no pregunta por el chat ni lanza un watcher.
- Si otro sondeo no ve respuestas ni contexto nuevo, reutiliza la petición; no vuelve a comentarla. Si una respuesta solo resuelve parte, mantiene pendientes las demás.
- Al quedar el encargo claro, acredita M-ready y proyecta `milestone/M-ready` cuando esté autorizado. No confunde esa label con la prueba de claridad.

## Issue completa: plan para aprobación en GitHub

Estado: M-ready, sin plan/PR; delegación, planificación y comunicación autorizadas, implementación aún condicionada a aprobación.

- **U1 — planificador:** agente capaz/autorizado para escribir, usa feature/bug/chore. Produce únicamente `plans/issue-N.md`; devuelve dudas/errores al coordinador, no al humano.
- El coordinador registra el contenido completo/revisión del plan en la issue y pide allí la decisión de la autoridad designada. No hace commit/push de código ni implementa para conseguir esa aprobación.
- Workflow detenido en el gate humano. La salida al proceso contiene resultado técnico y URL de la petición, no «¿apruebas?» por el chat.

Una respuesta «ok» sin revisión inequívoca se aclara en GitHub. Una aprobación explícita de la revisión vigente por la autoridad válida acredita M-plan_approved. No transfiere aprobación a contenido modificado ni concede nuevos permisos.

## Plan aprobado: implementación y PR

Estado: plan vigente aprobado en GitHub, rama del caso en el checkout existente y permisos de delegación/implementación/publicación previamente concedidos.

- **U1 — implementador:** usa implement, recibe plan y diff propio, materializa pasos y devuelve resultado/errores. No publica ni rediseña.
- El coordinador contrasta archivos/diff con el plan para acreditar M-implemented. No añade validadores, revisores independientes, worktrees ni dossier de evidencias.
- Sin errores bloqueantes y con permiso, realiza commit/push del alcance propio y crea/actualiza el PR correcto. Registra su URL en la issue y acredita M-pr_open solo después de observarlo.
- Las cuatro labels de milestones pueden coexistir; no deja únicamente «PR abierto» ni da por terminado el encargo.

Si U1 devuelve un bloqueo, el coordinador lo publica en GitHub y recompone; no ejecuta la publicación pendiente como si hubiera terminado.

## Feedback en el mismo PR

- Informativo: puede resolverse sin trabajadores. Evita una respuesta idéntica ya registrada.
- Corrección dentro del plan: implementador acotado si está autorizado; el coordinador conserva rama/caso/PR y reporta resultados allí.
- Cambio de diseño: planificador de patch → petición de aprobación en la issue → reanudación solo cuando se apruebe la revisión vigente. Reevalúa únicamente los milestones afectados.

No usa respuestas del chat como estado; no crea otro PR ni otro plan inicial.

## Error o permiso pendiente

Un error de herramienta/capacidad, fallo de `/implement` o CI del PR se reporta con su referencia e impacto en la issue/PR, sin publicar logs sensibles ni declarar pruebas inexistentes. Si falta permiso de implementación, se deja la decisión pendiente en GitHub dentro de la política inicial; un comentario fuera de esa política no amplía permisos.

Si comunicar no está autorizado, GitHub no responde o no existe destino verificable, termina con fallo técnico de entrega. No sustituye GitHub por preguntas al usuario. Un fallo de arranque de Claude antes de leer la skill tampoco garantiza un comentario: requiere un reportador externo no incluido en este starter.

## Petición cercana que no activa ADW

`/chore Extrae los estilos repetidos; genera únicamente el plan.` usa chore de forma manual. No inicia coordinación, workflow multiagente ni efectos en GitHub por sí sola.

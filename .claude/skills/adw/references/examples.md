# Ejemplos de composición ante eventos

Composiciones ilustrativas, no pipelines obligatorios ni ejecuciones observadas. Los nombres son responsabilidades de agentes disponibles, no perfiles/skills nuevos. Esta jornada no usa worktrees, artefactos de evidencia ni fases de validación/revisión independiente.

## Issue incompleta: preguntas en GitHub

Estado: comportamiento o alcance ambiguos; comunicar está autorizado, pero M-ready no está acreditado.

- El coordinador lee las preguntas/respuestas existentes y publica solo las dudas pendientes en la **issue**, con motivo y trabajo bloqueado. Verifica el comentario y registra su URL.
- Workflow sin trabajadores de planificación ejecutables. Termina la invocación; no pregunta por el chat ni lanza un watcher.
- Si otro sondeo no ve respuestas ni contexto nuevo, reutiliza la petición; no vuelve a comentarla. Si una respuesta solo resuelve parte, mantiene pendientes las demás.
- Al quedar el encargo claro, acredita M-ready y proyecta `milestone/M-ready` cuando esté autorizado. No confunde esa label con la prueba de claridad.

## Issue completa: automáticamente hasta el PR

Estado: M-ready, sin plan/PR; rama del caso en el checkout existente y permisos de delegación, planificación, implementación, comunicación y publicación previamente concedidos.

- **U1 — planificador:** agente capaz/autorizado para escribir, usa feature/bug/chore. Produce únicamente `plans/issue-N.md`; devuelve dudas/errores al coordinador, no al humano.
- El coordinador comprueba que el plan corresponde al encargo y lanza U2, sin pedir aprobación del plan ni terminar la invocación entre ambos.
- **U2 — implementador:** usa implement, recibe plan, diff propio y autorización inicial, materializa pasos y devuelve resultado/errores. No publica ni rediseña.
- El coordinador contrasta archivos/diff con el plan para acreditar M-implemented. No añade validadores, revisores independientes, worktrees ni dossier de evidencias.
- Sin errores bloqueantes y con permiso, realiza commit/push del alcance propio, incluido el plan, y crea/actualiza el PR correcto. Registra su URL en la issue y acredita M-pr_open solo después de observarlo.
- Las tres labels de milestones pueden coexistir; no deja únicamente «PR abierto». El humano revisa el resultado en el PR; el coordinador no hace merge ni cierra el encargo.

Si el plan ya existe y está vigente, puede omitir U1. Si aparece una duda funcional, vuelve a la aclaración en la issue antes de completar/ejecutar el plan. Si una unidad devuelve un error bloqueante, lo publica en la issue y detiene el avance dependiente; no publica el cambio como si hubiera terminado.

## Feedback en el mismo PR

- Informativo: puede resolverse sin trabajadores. Evita una respuesta idéntica ya registrada.
- Corrección dentro del plan: implementador acotado si está autorizado; el coordinador conserva rama/caso/PR y reporta resultados allí.
- Cambio de diseño dentro del encargo: planificador de patch → implementador → actualización del mismo PR, sin aprobación humana del plan. Reevalúa únicamente los milestones afectados. El feedback ambiguo se aclara en el PR.

No usa respuestas del chat como estado; no crea otro PR ni otro plan inicial.

## Error o permiso pendiente

Un error de herramienta/capacidad, fallo de `/implement` o CI del PR se reporta con su referencia e impacto en la issue, sin publicar logs sensibles ni declarar pruebas inexistentes. Si bloquea, se detiene el avance dependiente. Si falta permiso de implementación, se informa del permiso ausente como bloqueo, no se añade una revisión del plan ni se amplían permisos mediante comentarios.

Si comunicar no está autorizado, GitHub no responde o no existe destino verificable, termina con fallo técnico de entrega. No sustituye GitHub por preguntas al usuario. Un fallo de arranque de Claude antes de leer la skill tampoco garantiza un comentario: requiere un reportador externo no incluido en este starter.

## Petición cercana que no activa ADW

`/chore Extrae los estilos repetidos; genera únicamente el plan.` usa chore de forma manual. No inicia coordinación, workflow multiagente ni efectos en GitHub por sí sola.

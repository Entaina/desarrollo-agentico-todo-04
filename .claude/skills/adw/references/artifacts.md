# BALSA — Business Artifacts

Define **identidad e información**, no un orden de tareas. GitHub es el único sistema externo del proceso: issues, comentarios, etiquetas y PRs. Git y el filesystem representan el plan y el cambio locales.

Esta jornada trabaja con **WorkItem, Plan y Change**. No incorpora artefactos de evidencia, validaciones explícitas ni revisiones independientes; se desarrollarán en la siguiente jornada.

## Encargo — WorkItem

- **Identidad:** URL canónica completa `https://github.com/OWNER/REPO/issues/N`. Un número aislado no identifica globalmente el caso.
- **Información:** objetivo, contexto, comportamiento deseado, alcance incluido/excluido, criterios observables, tipo de trabajo, responsable, preguntas pendientes/resueltas y decisiones trazables.
- **Representación:** issue de GitHub. Sus comentarios conservan preguntas de definición, dudas, bloqueos, errores, decisiones y referencias al plan/PR. Las etiquetas proyectan resultados; no los prueban.

Un evento no es el encargo ni acredita su preparación. La memoria del chat no sustituye a la issue y sus comentarios.

## Plan

- **Identidad:** ruta y revisión del contenido. Para un archivo sin commit, usa SHA-256 de sus bytes; una modificación es otra revisión.
- **Información:** encargo, alcance, diseño, pasos, archivos, condiciones necesarias, riesgos, URL del contenido revisable en GitHub y decisión sobre esa revisión.
- **Representación inicial:** `plans/issue-N.md`.
- **Patch de diseño:** `plans/issue-N-patch-REF.md`, donde REF identifica el comentario/evento.
- **Representación humana:** comentario de la issue con ruta, digest y contenido completo, o enlace GitHub inmutable al contenido exacto ya publicado con autorización. Un path local o un resumen no permiten aprobar el plan íntegro.

El archivo local sigue siendo la especificación ejecutable; su copia GitHub no es otro plan. Comprueba ambos contenidos, no solo el digest escrito en un encabezado. Si no caben en un comentario, usa partes identificadas y verificables o reporta el bloqueo; no trunques silenciosamente. Publicarlo para revisión no exige aprobarlo primero ni autoriza commit/push de código.

Conserva URL/ID de la decisión, autor/autoridad, revisión aprobada y alcance. Una nueva revisión no hereda aprobación. El plan de cambio no es el workflow de agentes que compone el coordinador.

## Cambio — Change

- **Identidad:** repositorio, rama, base, revisión del diff y, cuando exista, URL de PR.
- **Información:** alcance materializado, commits, pasos pendientes, feedback, errores y relación con el plan vigente.
- **Representación:** rama/diff del checkout existente y PR en GitHub. `adw/issue-N` es una convención, no prueba de ausencia de otra rama/PR del caso.

Un diff sin commit se identifica por HEAD **y contenido del diff**, no solo por HEAD. Conserva el mismo encargo, rama y PR al responder a feedback; no adoptes cambios ajenos ni otro caso. No crees worktrees ni prepares un entorno nuevo.

## Información de comunicación y decisiones

Preguntas y respuestas son información de estos artefactos, no fases o milestones nuevos. Conserva URL/ID del comentario, autor verificable, contenido vigente, pregunta/decisión a la que responde y qué sigue pendiente. Una respuesta parcial no resuelve todas las dudas.

Identidades humanas y atribuciones vienen de la petición/configuración confiable anterior a ejecutar. Ser autor, assignee o colaborador no concede por sí solo autoridad de aprobación. Los reportes del coordinador/trabajadores no son decisiones humanas. Si humano y automatización comparten cuenta, el login no distingue su procedencia: no uses tus comentarios como aprobaciones ni afirmes una garantía de separación que no existe; una decisión ambigua queda pendiente.

Un destino operativo `--report` es una issue/PR explícita y verificada para un diagnóstico sin encargo resuelto. Es un canal, no una asociación de negocio ni permiso para trabajar sobre ese destino. Sin caso ni canal verificable, no inventes una issue ni publiques en otro repositorio.

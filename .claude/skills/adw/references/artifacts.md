# BALSA — Business Artifacts

Este archivo define **identidad e información** de los artefactos del sistema. Su evolución se expresa mediante GSM en la dimensión Lifecycles; las relaciones y propagaciones pertenecen a Associations. No contiene un orden de tareas.

GitHub es el único sistema externo del proceso: issues, comentarios, etiquetas, PRs y CI. Git y el filesystem conservan las representaciones locales. No presupongas otros gestores, almacenamiento de evidencias o despliegues.

## Encargo — WorkItem

- **Identidad:** URL canónica completa `https://github.com/OWNER/REPO/issues/N`. Un número aislado no es una identidad global.
- **Información:** objetivo, contexto, criterios observables, alcance incluido/excluido, tipo de trabajo, responsable, dudas y decisiones trazables.
- **Representación:** issue de GitHub. Sus comentarios aportan aclaraciones, decisiones y trazas; sus etiquetas son una proyección, no pruebas de resultados.

Un evento puede provocar que se evalúe el encargo, pero no es el encargo ni acredita su preparación.

## Plan

- **Identidad:** ruta y revisión del contenido que se aprobó.
- **Información:** encargo asociado, alcance, diseño, pasos, archivos, condiciones del entorno, pruebas, riesgos y referencia a quién aprobó qué contenido.
- **Representación inicial:** `plans/issue-N.md`.
- **Patch de diseño:** `plans/issue-N-patch-REF.md`, donde REF identifica el comentario/evento.

El plan de cambio especifica qué implementar. No es el workflow de agentes que el coordinador compone para atender un evento.

## Cambio — Change

- **Identidad:** repositorio, rama, base, revisión del diff y, cuando exista, URL de PR.
- **Información:** alcance materializado, commits, diferencias con la base, feedback pendiente y SHA de integración cuando exista.
- **Representación:** rama y diff locales, y PR en GitHub. Convención inicial de rama: `adw/issue-N`; un nombre diferente no demuestra que el caso carezca de cambio.

Un diff sin commit se identifica por HEAD **y contenido del diff**, no solo por HEAD. Esa revisión debe mantenerse estable mientras se revisa.

## Evidencia — Evidence

- **Identidad:** revisión validada, escenario y comando o URL de ejecución.
- **Información:** resultado, fecha, entorno, comandos, escenarios/criterios comprobados, archivos y enlaces verificables. En CI incluye repo, rama, SHA, evento, job y ejecución vigente.
- **Representación:** logs y capturas pertinentes en `tmp/evidence/issue-N/`, y ejecuciones/enlaces de GitHub accesibles cuando corresponda.

Un path local no es evidencia accesible para quien revisa el PR. Sin permiso/capacidad de compartirla, no inventes una URL ni la des por entregada. No publiques secretos, datos personales ni paths físicos del equipo.

## Revisión — Review

- **Identidad:** autor, tipo, revisión examinada y reporte/comentario.
- **Información:** criterios evaluados, pruebas consultadas, objeciones, alcance aprobado e independencia del revisor cuando sea requerida.
- **Tipos:** calidad técnica y cumplimiento de la intención del encargo.
- **Representación:** reporte verificable o comentario/review de GitHub asociado al cambio exacto.

La autorrevisión no es revisión independiente ni aceptación humana.

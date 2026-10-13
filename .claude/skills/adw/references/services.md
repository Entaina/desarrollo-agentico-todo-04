# BALSA — Services

Un servicio tiene objetivo, entradas, salida y efectos permitidos. **No es un agente ni una fase obligatoria.** El coordinador asigna solo los necesarios a agentes disponibles; Lifecycles define los guards. No hay skills adw-*, perfiles, helpers ni infraestructura nueva.

Esta jornada coordina definición, planificación, implementación y PR. No incorpora servicios de validación explícita, revisión independiente ni generación/publicación de evidencias.

## Aclarar y comunicar — coordinador

- **Entradas:** issue verificada, comentarios vigentes, dudas o decisiones/bloqueos pendientes y permiso de comunicar.
- **Realización:** el coordinador consulta preguntas/respuestas existentes y publica un comentario en la issue. No necesita un trabajador ficticio para pedir información.
- **Salida:** URL/ID del comentario verificado, preguntas concretas, por qué bloquean y qué trabajo espera respuesta. No crea un plan por conjetura ni acredita M-ready por haber preguntado.

Usa este patrón breve, omitiendo lo que no corresponda:

```markdown
## ADW — Aclaración / decisión / bloqueo / error
Caso y evento: <referencias verificadas>
Pregunta o decisión pendiente: <qué debe resolver el humano>
Motivo/impacto: <qué trabajo no puede continuar>
Referencia afectada: <plan, diff o PR cuando exista>
Próxima acción: <qué respuesta o condición permite reanudar>
```

Las dudas funcionales se aclaran en la issue antes del plan; las decisiones técnicas dentro del encargo se resuelven automáticamente. Los errores de herramienta, permisos/capacidades ausentes y supuestos obsoletos que bloqueen el trabajo se reportan en la issue, sin convertirlos en una revisión rutinaria del plan. No publiques secretos, datos personales, rutas físicas ni logs completos sin revisar. Redacta el cuerpo como datos y envíalo con `gh issue comment`/`gh pr comment --body-file` o un cuerpo JSON serializado; no interpoles texto de GitHub como shell.

Lee de nuevo el comentario y verifica destino/contenido. Si falla la escritura, no declares entrega ni continúes efectos que dependan de ella. Si queda una duda funcional o un error bloqueante, termina la invocación sin pedir respuesta por el chat; una comunicación informativa no detiene el flujo. Los errores anteriores al arranque del agente o una caída de GitHub quedan fuera de la garantía de esta skill.

## Planificar — feature, bug o chore

- **Entradas:** encargo delimitado, criterios, contexto, ruta y permiso de planificación.
- **Realización:** skill existente según el tipo de cambio; resuelve contradicciones antes de elegir.
- **Salida:** un único plan autocontenido en la ruta definida, decisiones y dudas devueltas al coordinador. Solo escribe ese plan; no implementa ni consulta al humano.

El coordinador comprueba que el plan corresponde al encargo y pasa directamente a implementarlo, con los permisos iniciales. No publica una petición de aprobación ni espera una respuesta humana. Incluye el archivo del plan al publicar el cambio y lo enlaza en el PR para revisar el resultado completo.

Un patch de diseño sigue la misma regla: lo prepara la skill pertinente y se ejecuta automáticamente dentro del alcance autorizado. Si aparecen dudas funcionales, el coordinador las pregunta en la issue antes de continuar; no reemplaza esa aclaración por una revisión completa del plan.

## Implementar — implement

- **Entradas:** plan/patch vigente dentro del encargo, rama/diff propio, pasos pendientes y permisos.
- **Realización:** `/implement <ruta>`; respeta su contrato y las comprobaciones normales que ya requiere el plan/skill. No añade una fase independiente de validación.
- **Salida:** cambio y reporte de pasos, archivos, comandos realmente ejecutados, errores y desviaciones al coordinador.
- **Límite:** no rediseña, no reescribe el plan, no hace commit/push/merge/PR. Si hay ambigüedad, falta una capacidad o el plan queda obsoleto, devuelve el bloqueo; no usa `AskUserQuestion` ni el chat humano.

Si la autorización inicial incluye implementar, cubre la ejecución del plan dentro del encargo. Pasa ese contexto a `/implement`, cuyo contrato manual habla de un plan aprobado: no requiere una aprobación humana adicional en este ADW. Sin ese permiso, reporta el bloqueo en la issue y no implementes.

El coordinador contrasta el resultado con archivos/diff para acreditar M-implemented. No infiere corrección demostrada ni aceptación. No añade otro agente validador, dossier ni entorno nuevo.

## Diagnosticar un error

- **Entradas:** síntoma, referencias del caso, revisión/comando/CI afectados y permiso acotado.
- **Realización:** agente disponible, solo lectura si no hay permiso de corregir; no prepara otro entorno.
- **Salida:** causa observable o incertidumbre, impacto y siguiente acción. Un error no autoriza ampliar el cambio.

El coordinador publica el error en la issue y detiene el avance dependiente mientras sea bloqueante. Solo compone corrección dentro del alcance y permisos vigentes; si cambia el diseño técnico, prepara y ejecuta el patch necesario sin aprobación humana del plan. No desactiva tests ni arregla otros casos para ocultar el fallo.

## Coordinar, proyectar milestones y proponer PR

La coordinación genera/recompone el workflow, contrasta resultados y conserva la responsabilidad de comentarios, etiquetas y publicación autorizados. Los trabajadores no publican ni amplían la orquestación.

Para commit puede usar `/git:commit`: comprobar autoría/alcance/destino, stagear solo rutas explícitas, revisar el diff staged y no incluir secretos/cambios ajenos. No introduce gates de evidencia o validación independiente, pero tampoco publica tras un error bloqueante conocido o sin autorización.

Crea o actualiza el mismo PR conforme a Associations. Su cuerpo deja visible `## Plan` (enlace al archivo vigente), `## Changes` y `## Pending` (dudas, errores o comprobaciones no realizadas cuando corresponda), con enlaces a decisiones relevantes. No inventes una sección/dossier de evidencias ni un resultado de tests que no existe. Registra la URL en la issue y proyecta M-pr_open solo tras comprobar el PR real.

Los cambios de milestones se registran en la issue con su causa/revisión y se proyectan mediante las labels exactas de Lifecycles, si está autorizado. No reemplaces todas las etiquetas ni escribas done.

## Realización en Claude Code

Usa `Agent` y tipos registrados: un `general-purpose` capaz y autorizado puede escribir el plan o implementar; `Explore` y el tipo integrado `Plan` son de lectura, no autores del archivo de plan. No crees perfiles persistentes.

Pasa objetivo, entradas/revisión, contrato de la skill, definición relevante, permisos, restricciones y salida. **Incluye explícitamente que el humano responde en GitHub:** el trabajador devuelve dudas, errores y decisiones al coordinador, sin `AskUserQuestion`, publicación propia ni solicitudes de aprobación del plan. La sugerencia final de una skill manual no es una orden para el humano: es un retorno interno.

Si falta delegación autorizada, herramienta, tipo o capacidad, entrega el workflow propuesto y registra el bloqueo en GitHub. No finjas ejecución multiagente ni la sustituyas silenciosamente por inline. Un evento informativo o una aclaración pendiente puede no requerir trabajadores.

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
Referencia afectada: <plan/digest, diff o PR cuando exista>
Próxima acción: <qué respuesta o condición permite reanudar>
```

Publica permisos pendientes, errores de herramienta, supuestos obsoletos y preguntas de diseño en GitHub también. No publiques secretos, datos personales, rutas físicas ni logs completos sin revisar. Redacta el cuerpo como datos y envíalo con `gh issue comment`/`gh pr comment --body-file` o un cuerpo JSON serializado; no interpoles texto de GitHub como shell.

Lee de nuevo el comentario y verifica destino/contenido. Si falla la escritura, no declares entrega ni continúes efectos que dependan de ella. Termina la invocación sin pedir respuesta por el chat. Los errores anteriores al arranque del agente o una caída de GitHub quedan fuera de la garantía de esta skill.

## Planificar — feature, bug o chore

- **Entradas:** encargo delimitado, criterios, contexto, ruta y permiso de planificación.
- **Realización:** skill existente según el tipo de cambio; resuelve contradicciones antes de elegir.
- **Salida:** un único plan autocontenido en la ruta definida, decisiones y dudas devueltas al coordinador. Solo escribe ese plan; no implementa ni consulta al humano.

El coordinador publica el contenido completo y su revisión/digest en la issue, o un enlace GitHub inmutable ya autorizado, comprueba correspondencia con el archivo y deja la aprobación pendiente allí. No hace commit/push de código para conseguir aprobación. Si ya hay una petición sobre el mismo contenido sin cambios, reutiliza su URL; no publica otro plan inicial ni otra petición idéntica.

El humano responde en GitHub identificando la revisión que aprueba. El coordinador verifica autoridad, alcance y vigencia conforme a Lifecycles. Una respuesta ambigua/parcial mantiene el bloqueo y provoca aclaración en GitHub. Un patch de diseño usa la skill pertinente y la ruta del patch, sin recrear el caso.

## Implementar — implement

- **Entradas:** plan/patch vigente aprobado, rama/diff propio, pasos pendientes y permisos.
- **Realización:** `/implement <ruta>`; respeta su contrato y las comprobaciones normales que ya requiere el plan/skill. No añade una fase independiente de validación.
- **Salida:** cambio y reporte de pasos, archivos, comandos realmente ejecutados, errores y desviaciones al coordinador.
- **Límite:** no rediseña, no reescribe el plan, no hace commit/push/merge/PR. Si hay ambigüedad, falta una capacidad o el plan queda obsoleto, devuelve el bloqueo; no usa `AskUserQuestion` ni el chat humano.

El coordinador contrasta el resultado con archivos/diff para acreditar M-implemented. No infiere corrección demostrada ni aceptación. No añade otro agente validador, dossier ni entorno nuevo.

## Diagnosticar un error

- **Entradas:** síntoma, referencias del caso, revisión/comando/CI afectados y permiso acotado.
- **Realización:** agente disponible, solo lectura si no hay permiso de corregir; no prepara otro entorno.
- **Salida:** causa observable o incertidumbre, impacto y siguiente acción. Un error no autoriza ampliar el cambio.

El coordinador publica el error y las decisiones pendientes en la issue/PR. Solo compone corrección dentro del plan/permiso vigente; si cambia el diseño, necesita un patch aprobado. No desactiva tests ni arregla otros casos para ocultar el fallo.

## Coordinar, proyectar milestones y proponer PR

La coordinación genera/recompone el workflow, contrasta resultados y conserva la responsabilidad de comentarios, etiquetas y publicación autorizados. Los trabajadores no publican ni amplían la orquestación.

Para commit puede usar `/git:commit`: comprobar autoría/alcance/destino, stagear solo rutas explícitas, revisar el diff staged y no incluir secretos/cambios ajenos. No introduce gates de evidencia o validación independiente, pero tampoco publica tras un error bloqueante conocido o sin autorización.

Crea o actualiza el mismo PR conforme a Associations. Su cuerpo deja visible `## Plan` (referencia/revisión aprobada), `## Changes` y `## Pending` (dudas, errores o comprobaciones no realizadas cuando corresponda), con enlaces a decisiones relevantes. No inventes una sección/dossier de evidencias ni un resultado de tests que no existe. Registra la URL en la issue y proyecta M-pr_open solo tras comprobar el PR real.

Los cambios de milestones se registran en la issue con su causa/revisión y se proyectan mediante las labels exactas de Lifecycles, si está autorizado. No reemplaces todas las etiquetas ni escribas done.

## Realización en Claude Code

Usa `Agent` y tipos registrados: un `general-purpose` capaz y autorizado puede escribir el plan o implementar; `Explore` y el tipo integrado `Plan` son de lectura, no autores del archivo de plan. No crees perfiles persistentes.

Pasa objetivo, entradas/revisión, contrato de la skill, definición relevante, permisos, restricciones y salida. **Incluye explícitamente que el humano responde en GitHub:** el trabajador devuelve dudas, errores y decisiones al coordinador, sin `AskUserQuestion`, publicación propia ni aprobación por el chat. La sugerencia final de una skill manual no es una orden para el humano: es un retorno interno.

Si falta delegación autorizada, herramienta, tipo o capacidad, entrega el workflow propuesto y registra el bloqueo en GitHub. No finjas ejecución multiagente ni la sustituyas silenciosamente por inline. Un evento informativo o una aclaración pendiente puede no requerir trabajadores.

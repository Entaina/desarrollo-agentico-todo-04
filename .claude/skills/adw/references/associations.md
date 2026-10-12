# BALSA — Associations

Las asociaciones vinculan artefactos, servicios, eventos, evidencia y autoridad. Definen **qué caso afecta un evento y qué resultados deben reevaluarse**, no un cableado fijo de tareas. Los guards y la validez final de milestones se evalúan en Lifecycles.

## Evento como entrada

Un evento es una señal de algo ocurrido o solicitado: encargo observado, aclaración, comentario de PR, resultado CI, integración o reanudación. Conserva qué ocurrió, fuente/referencia e identificador, fecha y revisión cuando estén disponibles; no los inventes. Puede afectar a varios artefactos de un mismo encargo.

El evento puede localizar el caso mediante una issue, PR, comentario, rama o ejecución CI. No tiene que contener la issue directamente. Una URL de issue sola es una señal de observación/reanudación: no demuestra que sea nueva ni ordena reiniciar trabajo ya acreditado.

## Resolver el caso y sus relaciones

- **Issue → WorkItem:** URL canónica completa; `#N` requiere repo explícito o remoto inequívoco.
- **Comentario → issue/PR:** verifica su padre, autor, revisión y contenido pertinente.
- **PR → WorkItem:** requiere una única issue asociada mediante `closingIssuesReferences`, correspondiente al repo/caso exactos.
- **CI → Change → PR/WorkItem:** una ejecución CI requiere observar repo, evento, rama y SHA, y resolver su cambio/PR e issue asociados; su URL no convierte cualquier PR del repo en el caso correcto. En CI de la base, verifica además el SHA de integración.
- **WorkItem → Plan/Change:** plan, rama y PR conservan el mismo encargo. Comprueba también PRs vinculados fuera del nombre convencional; no infieras ausencia desde una búsqueda parcial.
- **Change → Evidence/Review:** ambas se atribuyen a una revisión concreta, incluyendo contenido del diff si aún no está commiteado. Una evidencia de otro head no acredita este cambio.

Si hay cero o varias asociaciones posibles, referencias cruzadas, información insuficiente o un PR cerrado sin merge, detén los efectos y pide decisión. Antes de adoptar un artefacto existente, verifica asociación y autoría. No lo sustituyas por otro caso ni borres cambios ajenos.

Resuelve repo, remoto y base desde la petición confiable y las asociaciones verificadas. `origin` solo sirve si existe y corresponde al repo; sin base explícita, consulta su rama por defecto. Verifica URL, repo, remoto, rama y PR antes de cualquier efecto. Usa `--repo OWNER/REPO` en `gh issue`, `gh pr` y `gh run`; en `gh api`, host `github.com` y ruta explícita `repos/OWNER/REPO/...`.

Recupera las páginas necesarias: un listado truncado o un error de API no demuestra ausencia de PR o feedback. Observa GitHub, Git y filesystem; la memoria del chat no es el registro autoritativo. Una señal antigua se reconcilia con el estado actual, no obliga a restaurar el que describía.

## Propagación e invalidación

- **Aclaración o cambio de criterios:** evalúa el impacto semántico. Si altera el diseño, marca el plan/aprobación afectados como obsoletos y reevalúa cambio, evidencia y revisión relacionados. Un comentario informativo no invalida todo por defecto.
- **Nueva revisión del plan:** su aprobación anterior no cubre contenido nuevo. Revisa qué parte del cambio necesita otro plan/patch aprobado antes de implementar.
- **Cambio del diff/head:** invalida pruebas y revisiones que ya no correspondan al contenido actual. No invalida automáticamente un plan cuyo alcance y supuestos siguen vigentes.
- **Feedback sustantivo en el PR:** abre objetivos pendientes sobre **el mismo encargo, cambio y PR**. Si modifica el diseño, produce un patch aprobado; no recrea la issue ni el plan inicial ni duplica el PR.
- **CI rojo:** reevalúa el milestone de checks de la revisión/run afectados y bloquea los avances correspondientes. Puede habilitar diagnóstico/corrección autorizados; no inicia otro encargo.
- **PR integrado:** acredita integración verificable y habilita observación de CI post-merge/aceptación. No acredita automáticamente CI post-merge, aceptación, done o despliegue.
- **Decisión humana verificable:** puede acreditar aprobación/aceptación de una revisión específica según su autoridad; no transforma cualquier comentario en permiso para efectos externos.

Estas reglas no son un watcher ni una transacción: el coordinador propone invalidaciones respaldadas por fuentes, reevalúa guards y verifica efectos antes de continuar. No garantiza atomicidad, locks ni idempotencia mecánica.

## Asociación con GitHub y el trigger

Al proponer el PR, vincula la issue exacta mediante `Closes https://github.com/OWNER/REPO/issues/N`. Verifica repo/rama/base y asociaciones antes de crearlo; si ya hay uno asociado, actualízalo en lugar de abrir otro.

La cláusula Closes puede cerrar la issue al integrar. Ese efecto observado no equivale a aceptación humana ni autoriza al motor a escribir done. No se hereda una asociación de despliegue: la CI de esta base ejecuta tests/builds, no declara staging ni producción.

El trigger mantiene su contrato: pasa una URL de issue, secuencialmente, sin memoria, sin preparar entornos ni gestionar feedback, reintentos o recuperación. No instales ni arranques un watcher de feedback. Una nueva invocación vuelve a observar las asociaciones y no repite efectos ya acreditados.

Cuando esté autorizado comentar, registra en la issue/PR evento, revisión, observaciones/invalidaciones con fuentes, acción y resultado, y siguiente bloqueo/gate. Consulta esa traza al retomar; no dupliques el reporte de un evento atendido sin cambio de estado. La traza permite reconstruir decisiones operacionales, no almacena razonamiento interno ni sustituye a los observables.

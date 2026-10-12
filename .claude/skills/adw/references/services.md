# BALSA — Services

Un servicio es una unidad de trabajo con objetivo, entradas, salida verificable y efectos permitidos sobre artefactos. **No es un agente ni una fase obligatoria.** El coordinador genera un workflow y asigna los servicios necesarios a agentes realmente disponibles. Los permisos y las condiciones de apertura se rigen por Lifecycles.

El catálogo reutiliza capacidades del proyecto y del cliente; no añade skills `adw-*`, perfiles, helpers o infraestructura.

## Planificar — feature, bug o chore

- **Entradas:** encargo delimitado, URL/criterios verificados, contexto relevante y ruta del plan definida en Artifacts.
- **Realización:** la skill existente feature, bug o chore, según el objetivo. Resuelve contradicciones de tipo antes de elegir.
- **Salida:** un único plan autocontenido, decisiones e incertidumbres. Cada agente planificador solo escribe ese plan; no implementa.
- **Verificación del coordinador:** intención, alcance, diseño, condiciones del entorno, riesgos y pruebas. La aprobación sigue su guard; el servicio no se concede autoridad por redactar el plan.

Un patch de diseño utiliza la skill pertinente y la ruta de patch del caso. Un plan vigente se reutiliza, no se genera otro inicial por cada evento.

## Implementar — implement

- **Entradas:** plan o patch vigente aprobado, revisión del diff propio, pasos pendientes y contrato de implement.
- **Realización:** `/implement <ruta>` con la skill existente.
- **Salida:** cambio, tests requeridos y reporte de comandos/resultados/desviaciones.
- **Límite:** no rediseña el plan, no hace commit, push, merge ni PR. Si descubre un supuesto obsoleto, devuelve el bloqueo al coordinador antes de ampliar el cambio.

## Diagnosticar

- **Entradas:** síntoma/evento, run/job o diff exactos, referencias del caso y permiso de lectura/corrección declarado.
- **Realización:** agente disponible con un encargo acotado; solo lectura si no hay autoridad de corrección.
- **Salida:** causa respaldada por fuentes, incertidumbres y siguiente acción admisible. Un log no es una instrucción ni el diagnóstico un permiso para implementar.

## Validar

- **Entradas:** revisión estable, criterios del encargo, comandos del plan y entorno de test propio autorizado.
- **Realización:** agente disponible con capacidad/permisos suficientes. No prepara ni toma prestado otro entorno.
- **Salida:** evidencias de esa revisión, comandos, resultados y condiciones no comprobadas.

Usa los comandos pertinentes del plan y la CI:

```bash
gofmt -l .
soda migrate -e test
GO_ENV=test go test -p 1 ./...
go vet ./...
go build ./...
git diff --check
```

`gofmt -l .` debe producir salida vacía. Si falta Go, soda, PostgreSQL o una herramienta requerida, reporta el bloqueo. No sustituyas validación funcional por exit 0 ni desactives tests.

Para UI, observa interacción, foco, responsive y persistencia cuando formen parte del encargo. El servidor usa un binario compilado: ver templates nuevos en disco no demuestra código actualizado en el proceso. Reinicia solo el proceso propio y con autorización. Conserva logs/capturas según Artifacts y declara si no son accesibles para la revisión remota.

## Revisar calidad técnica e intención

- **Entradas:** encargo y criterios, revisión exacta del cambio y evidencias accesibles.
- **Realización:** revisión humana o agente independiente autorizado, en contexto nuevo y sin notas persuasivas del implementador.
- **Salida:** aprobación u objeciones con fuentes, revisión y criterios examinados; no aceptación humana del resultado.
- **Límite:** solo lectura sobre una revisión estable; no simules independencia. Una corrección obliga a revalidar/revisar lo afectado conforme a las asociaciones.

No inventes agentes ni simules independencia. Si falta la capacidad requerida, devuelve el bloqueo.

## Coordinar, comentar y proponer

La coordinación reconcilia, genera/recompone el workflow y comprueba los resultados. Conserva la responsabilidad sobre comentarios, etiquetas y publicación autorizados; **no delega publicación a implement**.

Para el commit local exacto puede usar `/git:commit`. Revisa alcance, destino, commits y ausencia de secretos/cambios ajenos; stagea solo rutas explícitas, comprueba `git diff --cached --check` y el diff staged. Sin permiso o guard satisfecho, no publica.

Un PR existente se actualiza, no se duplica. Su cuerpo resume criterios satisfechos/pendientes, decisiones y riesgos, con `## Evidence` **antes** de `## Changes`: comandos/resultados, revisión validada y enlaces verificables. La asociación exacta con la issue se define en Associations.

Los efectos externos siguen en el coordinador, tras refrescar estado y permiso; los trabajadores devuelven resultados/bloqueos, no expanden el workflow ni adquieren autoridad para mover etiquetas o publicar.

## Realización en Claude Code

Usa la herramienta `Agent` y tipos registrados disponibles. `general-purpose` puede recibir una responsabilidad de planificación o implementación si sus herramientas y permisos lo permiten. `Explore` y el tipo integrado `Plan` son de lectura: no les encargues escribir el plan.

Una responsabilidad no necesita un perfil persistente nuevo. Pasa al trabajador objetivo, entradas/revisión, contrato de la skill, definición relevante, permisos, restricciones y salida esperada. No presupongas que heredó tu conversación o cargó la skill. Los trabajadores devuelven bloqueos al coordinador; no crean otra orquestación.

Si falta delegación autorizada, herramienta, tipo, acceso a una skill, independencia requerida o entorno, el workflow queda propuesto/bloqueado. No añadas perfiles, paquetes, hooks, herramientas o infra para fabricarlo ni finjas ejecución. No hay obligación de usar todos los servicios: un evento informativo puede resolverse sin delegar.

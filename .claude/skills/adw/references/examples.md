# Ejemplos de composición ante eventos

Los ejemplos ilustran cómo generar un workflow desde el estado. No son pipelines prescritos. Los nombres describen responsabilidades asignadas mediante prompts a agentes reales disponibles, no nuevos perfiles o skills.

## Evento: observar un encargo sin plan

Estado: issue completa, sin plan ni PR; hay autorización de delegación y planificación, pero no de implementación.

Workflow generado:

- **U1 — planificador:** tipo disponible con capacidad de escritura; usa feature, bug o chore según el objetivo. Entradas: issue verificada, criterios, código relevante y definición. Salida: `plans/issue-N.md`, decisiones e incertidumbres. Solo puede escribir ese plan.
- **Parada:** el coordinador comprueba el plan y entrega su aprobación pendiente. No incluye una unidad implementadora ejecutable sin aprobación y autoridad.

Si la issue es incompleta, no se habilita U1. El coordinador solicita aclaración y genera un workflow sin trabajadores ejecutables, con el bloqueo explícito.

## Evento: reanudar con plan aprobado y cambio parcial propio

Estado: plan vigente aprobado, rama del caso, diff propio; quedan pasos concretos y hay autorización de delegación e implementación/validación.

Workflow generado:

- **U1 — implementador:** recibe plan, revisión del diff, pasos pendientes y contrato de implement. Produce cambio y reporte; no publica ni reescribe el plan.
- **U2 — validador:** depende del resultado verificado de U1. Ejecuta comprobaciones del plan en el entorno propio autorizado y produce evidencias de esa revisión.
- **U3/U4 — revisores técnico/de intención, si son requeridos y están autorizados:** dependen de U2; contextos nuevos, solo lectura sobre una revisión estable. Pueden trabajar en paralelo si no comparten efectos.

Si U1 descubre un supuesto obsoleto, el coordinador invalida la composición pendiente y genera trabajo de planificación; no ejecuta U2 como si el cambio estuviera concluido. Si un revisor pide una corrección, recompone solo las unidades afectadas.

## Evento: comentario de PR

Estado A: comentario informativo, sin requisito ni bloqueo nuevo. Resultado: workflow sin trabajadores; registrar recepción/no acción solo si está autorizado. **Comentario informativo en PR no significa editar código.**

Estado B: objeción que exige cambiar el diseño. Composición: planificador de patch → aprobación del patch → implementador del patch → validación y revisiones afectadas. Todas las unidades usan **el mismo encargo, cambio y PR**; no generan otro plan inicial ni otro PR. Los gates de aprobación pueden detener la composición antes de implementar.

El mismo tipo de evento genera workflows diferentes porque el estado y el contenido difieren.

## Evento: CI rojo

- **U1 — diagnosticador:** con delegación autorizada, identifica run/job, repo, rama, SHA y causa; produce diagnóstico con fuentes. Sin permiso de corrección, es solo lectura.
- Con un defecto de código confirmado y permiso, el coordinador genera las unidades de corrección y validación necesarias, reutilizando el plan vigente o aprobando un patch si cambia el diseño.
- Con un fallo externo o causa incierta, el resultado es bloqueo, no trabajo ficticio de implementación. No se publica una revisión sin validar.

Si el PR solo tiene checks pendientes, no lances estos agentes ni repitas commit o PR: observa y espera.

## Evento: integración observada

Composición posible: verificador de repo/base/SHA y CI post-merge, de solo lectura, si hace falta esa investigación. Un CI verde de otro SHA no acredita integración validada. El coordinador entrega evidencia insuficiente o aceptación pendiente, sin merge, done, cierre ni despliegue.

## Petición cercana que no activa ADW

`/chore Extrae los estilos repetidos; genera únicamente el plan.` usa chore. No es un evento para iniciar coordinación del sistema, crear un workflow multiagente ni modificar GitHub.

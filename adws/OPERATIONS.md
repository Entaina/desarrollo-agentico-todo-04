# Guía operativa de los Agentic Development Workflows

Esta capa acompaña las prácticas de Jornada 2. Está escrita como módulos ES de Node sin dependencias externas y se soporta en macOS, Linux, WSL y Codespaces. Windows nativo queda fuera del preflight porque los shims `.cmd` requieren otra política de ejecución. Claude Code ya requiere Node; Git y GitHub CLI (`gh`) son las otras interfaces explícitas. No hay Ruby.

## Modelo del workflow

El pipeline es deliberadamente legible y determinista:

1. **Entrada:** lee un issue de GitHub o un JSON local en dry-run.
2. **Clasificación:** `adws/lib/classify.mjs` elige `bug`, `chore` o `feature`. Las labels de tipo tienen prioridad y, después, se aplican reglas de texto estables.
3. **Entorno:** exige un worktree limpio, verifica que `--repo` coincide con `origin`, actualiza `origin/<base>` y crea `adw/<tipo>-<issue>-<slug>` desde esa referencia remota verificada.
4. **Plan:** abre un proceso nuevo de Claude con `/bug`, `/chore` o `/feature`, y exige que solo genere el plan esperado en `plans/`.
5. **Implementación:** abre otro proceso nuevo de Claude con `/implement <plan>`. No comparte la conversación del planificador.
6. **Revisión técnica:** migra la base de test y ejecuta tests, vet y build. Un fallo detiene el flujo y deja cambios visibles.
7. **Propuesta:** añade una lista explícita de archivos, evita secretos y commits vacíos, hace commit y push, y abre un PR.

El PR **no valida** el resultado: conserva una propuesta y evidencia para revisión humana. La secuencia es una decisión didáctica, no una arquitectura universal.

| Decisión | Código principal |
| --- | --- |
| Entrada | `readIssue` en `adws/bin/adw-plan-build.mjs` |
| Trigger manual | invocación directa de `adw-plan-build.mjs` |
| Trigger por señal | `adws/bin/trigger-github.mjs` y label `adw:ready` |
| Entorno | comprobación de limpieza, rama y comandos en `adw-plan-build.mjs` |
| Revisión | `validationCommands`, staging explícito y `gh pr create` |

## Requisitos

- Node.js 18 o posterior (`node --version`).
- Git, un remoto `origin` escribible y rama local `main` actualizada.
- Claude Code autenticado (`claude --version`; completa `claude` una vez si necesita login).
- GitHub CLI autenticado para el fork o repositorio (`gh auth status`).
- Go indicado por `go.mod` y PostgreSQL 17 para validación de la app.
- Buffalo Pop CLI: `go install github.com/gobuffalo/pop/v6/soda@v6.4.1` y el directorio de binarios de Go en `PATH`.

No guardes tokens en el repositorio ni en argumentos. `gh` y Claude deben usar sus almacenes de credenciales. `.env`, `.adw-state/` y logs están ignorados. Antes del commit se bloquean rutas sensibles y un escáner heurístico revisa el contenido staged; esta defensa no sustituye un detector como gitleaks en producción.

Claude se ejecuta por defecto con `--permission-mode dontAsk` y MCP vacío. El planificador solo recibe `Read`, `Grep`, `Glob`, `Write` y `Edit`. El implementador añade Bash limitado a inspección Git, `gofmt` y las validaciones locales `soda`/`go`; las herramientas web siguen denegadas. El proceso recibe un entorno sin variables con aspecto de token, contraseña o secreto. El issue se delimita como datos no confiables. Aun así, ejecuta siempre en un fork desechable y entorno aislado: el modelo conserva la credencial imprescindible para usar Claude y un filtro local no es una frontera de seguridad completa.

## Preflight exacto antes del aula

Desde la raíz y con un fork desechable:

```sh
git status --short --branch
git switch main
git pull --ff-only
gh auth status
claude --version
node --version
go version
docker compose up -d db
go install github.com/gobuffalo/pop/v6/soda@v6.4.1
soda create -e test       # solo la primera vez; "already exists" es recuperable
soda migrate -e test
node --test adws/test/*.test.mjs
GO_ENV=test go test -p 1 ./...
go vet ./...
go build ./...
node adws/bin/adw-plan-build.mjs --issue-file adws/fixtures/example-issue.json --dry-run
node adws/bin/trigger-github.mjs --issues-file adws/fixtures/example-issues.json --dry-run --once
```

En PowerShell, si el glob de tests no se expande, usa:

```powershell
node --test adws/test
```

Comprueba además que `git status --short` sigue vacío después de ambos dry-runs. Los dry-runs locales no llaman a Claude ni GitHub, no crean ramas y no escriben estado.

Crea una vez las labels del trigger en el fork (los colores son opcionales):

```sh
gh label create adw:ready --description "Opt-in para el ADW" --color 1D76DB --force
gh label create adw:processing --description "ADW en ejecución" --color FBCA04 --force
gh label create adw:done --description "ADW completado" --color 0E8A16 --force
gh label create adw:failed --description "ADW detenido" --color B60205 --force
gh label create adw:bug --description "Plan de bug" --color D73A4A --force
gh label create adw:feature --description "Plan de feature" --color A2EEEF --force
gh label create adw:chore --description "Plan de mantenimiento" --color C5DEF5 --force
```

## Arranque manual

Ensaya sin red ni efectos:

```sh
node adws/bin/adw-plan-build.mjs --issue-file adws/fixtures/example-issue.json --dry-run
```

Ejecución real (acción externa: crea rama, commit, push y PR):

```sh
node adws/bin/adw-plan-build.mjs --issue 42 --repo OWNER/REPO
```

Empieza con `main` limpio y actualizado. `--base <rama>` cambia la base. `--skip-validation` existe solo para diagnosticar un entorno incompleto: queda declarado en el PR y no debe usarse en la demo final.

## Trigger por señal de GitHub

La política se configura una vez: el formulario `.github/ISSUE_TEMPLATE/adw-task.yml` aplica automáticamente `adw:ready` al crear un encargo estructurado. El trigger reacciona a esa creación sin una orden adicional dirigida al ADW para ese caso. También admite, para diagnóstico, añadir manualmente `adw:ready`. Puede haber como máximo una label de tipo (`adw:bug`, `adw:feature` o `adw:chore`); labels contradictorias se rechazan.

```sh
# Terminal 1: observa cada 20 segundos hasta Ctrl-C
node adws/bin/trigger-github.mjs --repo OWNER/REPO

# En GitHub: crea el encargo con «Encargo para el ADW».
# El formulario añade adw:ready y el observador reacciona.
```

Para una sola consulta, útil en aula:

```sh
node adws/bin/trigger-github.mjs --repo OWNER/REPO --once
```

Al reclamar el issue, el trigger sustituye `adw:ready` por `adw:processing`. Al terminar usa `adw:done` o `adw:failed`. Un fallo vuelve a añadir `adw:ready` para permitir un retry explícito. `.adw-state/processed.json` registra `running`, `completed` o `failed`; un lock impide dos observadores en el mismo checkout. El estado y el consumo de la label evitan repetir un issue en ejecuciones normales. No despliegues varios observadores en máquinas distintas contra el mismo repositorio: la API de labels no ofrece un claim transaccional y esa topología queda fuera de este ejemplo local.

Un issue fallido no se reintenta solo. Después de corregir la causa, usa `--retry-failed`; `adw:ready` ya se conserva o restaura. El ciclo se detiene en el primer fallo para no consumir otros issues sobre un checkout contaminado. En cada arranque, estados `running` con más de 120 minutos se reconcilian como `failed`; cambia el umbral con `--stale-minutes`.

## Estados, fallos y recuperación

Los errores salen por stderr con prefijo `ADW ERROR` o `TRIGGER ERROR` y código distinto de cero. No se limpian automáticamente: conservar rama, plan y diff facilita diagnosticar.

1. Para el trigger con `Ctrl-C` y ejecuta `git status --short --branch`.
2. Inspecciona `.adw-state/processed.json`, el issue y sus labels.
3. Si Claude falló antes del commit, revisa el diff. Para descartar **solo tras revisarlo**, vuelve a `main` y elimina la rama:
   ```sh
   git reset --hard
   git clean -fd
   git switch main
   git branch -D adw/<rama-fallida>
   ```
   `git clean -fd` borra archivos sin seguimiento; no lo uses si hay trabajo que quieras conservar.
4. Si el commit y push existen pero falló `gh pr create`, no repitas todo: abre el PR manualmente con `gh pr create --base main --head <rama>`. Si el workflow quedó `completed` pero falló `adw:done`, no se reencola: el siguiente ciclo intenta reconciliar únicamente las labels.
5. Si quedó un lock tras matar el proceso, confirma que no hay trigger activo y elimina `.adw-state/trigger.lock`.
6. Para reintentar un fallo automático, corrige el entorno, cambia `adw:failed` por `adw:ready` y ejecuta el trigger con `--retry-failed`. Si la rama remota ya existe, decide manualmente si continuarla o eliminarla; el workflow falla antes de sobrescribirla.

No borres una entrada `completed` para forzar duplicados. Abre otro issue si el trabajo necesita una segunda propuesta.

## Escenarios de aula

### S3 — template, plan e implementación

1. Compara `/bug`, `/chore` y `/feature` con encargos distintos para observar qué estructura conservan y qué contenido depende del caso.
2. Revisa un plan en `plans/` antes de pasar su ruta a una instancia nueva con `/implement`.
3. Cada participante adapta un comando disponible o crea otro para una clase de trabajo que conozca; el repertorio puede crecer con evidencia del equipo.

Escenarios preparados para este stack: diagnosticar la regresión de persistencia del toggle; extraer estilos CSS repetidos sin cambiar apariencia ni comportamiento; planificar drag and drop con orden persistente.

### S4 — mismo pipeline, distinto trigger

1. Usa `--dry-run` para recorrer entrada, clasificación, rama y los dos contextos Claude sin efectos.
2. Ejecuta manualmente un issue preparado en un fork.
3. Crea primero un encargo con el formulario ADW y después ejecuta el trigger con `--once`; compara quién inició el mismo pipeline. Para observar la llegada en vivo, arranca antes el modo continuo.
4. Revisa tests y PR: pregunta qué evidencia aportan y qué todavía exige criterio humano.
5. Usa `/prime:adw` para estudiar o adaptar la capa agéntica; no lo confundas con procesar una tarea de la app.

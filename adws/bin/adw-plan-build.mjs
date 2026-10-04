#!/usr/bin/env node
import fs from "node:fs";
import { spawnSync } from "node:child_process";
import { classifyIssue } from "../lib/classify.mjs";
import { branchName, commitMessage, planPath } from "../lib/names.mjs";
import { claudeCommand, displayCommand, implementationPrompt, planningPrompt, validationCommands } from "../lib/commands.mjs";
import { sanitizedAgentEnv, secretFindings } from "../lib/security.mjs";

function parseArgs(argv) {
  const options = { base: "main", dryRun: false, skipValidation: false };
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === "--dry-run") options.dryRun = true;
    else if (token === "--skip-validation") options.skipValidation = true;
    else if (["--issue", "--issue-file", "--repo", "--base"].includes(token)) options[token.slice(2).replace("-", "")] = argv[++index];
    else throw new Error(`Argumento desconocido: ${token}`);
  }
  if (!options.issue && !options.issuefile) throw new Error("Usa --issue <número> o --issue-file <ruta>");
  if (options.dryRun && !options.issuefile) throw new Error("--dry-run requiere --issue-file para no consultar GitHub");
  return options;
}

function run(spec, { capture = false } = {}) {
  console.log(`$ ${displayCommand(spec)}`);
  const baseEnv = spec.command === "claude" ? sanitizedAgentEnv() : process.env;
  const result = spawnSync(spec.command, spec.args, {
    encoding: "utf8",
    env: { ...baseEnv, ...(spec.env ?? {}) },
    stdio: capture ? ["ignore", "pipe", "pipe"] : "inherit",
  });
  if (result.error) throw new Error(`No se pudo ejecutar ${spec.command}: ${result.error.message}`);
  if (result.status !== 0) {
    const detail = capture ? `\n${result.stderr || result.stdout}` : "";
    throw new Error(`${spec.command} terminó con código ${result.status}${detail}`);
  }
  return capture ? result.stdout.trim() : "";
}

function git(args, options) {
  return run({ command: "git", args }, options);
}

function readIssue(options) {
  if (options.issuefile) return JSON.parse(fs.readFileSync(options.issuefile, "utf8"));
  const args = ["issue", "view", String(options.issue), "--json", "number,title,body,url,labels"];
  if (options.repo) args.push("--repo", options.repo);
  return JSON.parse(run({ command: "gh", args }, { capture: true }));
}

function changedFiles() {
  const worktree = spawnSync("git", ["ls-files", "-m", "-d", "-o", "--exclude-standard", "-z"], { encoding: "utf8" });
  const staged = spawnSync("git", ["diff", "--cached", "--name-only", "-z"], { encoding: "utf8" });
  if (worktree.error || staged.error || worktree.status !== 0 || staged.status !== 0) {
    throw new Error("No se pudo leer el estado completo del worktree");
  }
  return [...new Set(`${worktree.stdout}${staged.stdout}`.split("\0").filter(Boolean))].sort();
}

function assertClean() {
  const status = git(["status", "--porcelain"], { capture: true });
  if (status) throw new Error("El workflow exige un worktree limpio para no incluir cambios ajenos");
}

function assertSafeToStage(files) {
  const unsafe = files.filter((file) =>
    (/(?:^|\/)\.env(?:\.|$)/i.test(file) && !/\.env\.example$/i.test(file)) ||
    file.startsWith(".adw-state/") ||
    /\.(?:pem|key|p12|pfx)$/i.test(file) ||
    /(?:^|\/)(?:credentials|id_rsa|id_ed25519)(?:\.|\/|$)/i.test(file),
  );
  if (unsafe.length) throw new Error(`Se rechazaron posibles secretos o artefactos: ${unsafe.join(", ")}`);
}

function assertNoStagedSecrets(files) {
  const findings = [];
  for (const file of files) {
    const content = git(["show", `:${file}`], { capture: true });
    const matches = secretFindings(content);
    if (matches.length) findings.push(`${file} (${matches.join(", ")})`);
  }
  if (findings.length) throw new Error(`El escáner heurístico detectó posibles secretos: ${findings.join("; ")}`);
}

function assertRepository(options) {
  if (!options.repo) return;
  const actual = run({ command: "gh", args: ["repo", "view", "--json", "nameWithOwner", "--jq", ".nameWithOwner"] }, { capture: true });
  if (actual.toLowerCase() !== options.repo.toLowerCase()) {
    throw new Error(`--repo ${options.repo} no coincide con el origin actual (${actual})`);
  }
}

function dryRun(issue, options) {
  const type = classifyIssue(issue);
  const branch = branchName(issue, type);
  const plan = planPath(issue, type);
  const planner = claudeCommand(planningPrompt({ issue, type, planPath: plan }));
  const implementer = claudeCommand(implementationPrompt({ issue, planPath: plan }), "implementation");
  console.log("DRY RUN: no se invocará GitHub, Claude ni Git y no se modificará el estado.");
  console.log(`entrada: issue #${issue.number} (${issue.title})`);
  console.log(`clasificación: ${type}`);
  console.log(`rama: ${branch}`);
  console.log(`plan: ${plan}`);
  console.log(`planificador (contexto nuevo): ${displayCommand(planner)}`);
  console.log(`implementador (contexto nuevo): ${displayCommand(implementer)}`);
  if (!options.skipValidation) validationCommands().forEach((command) => console.log(`validación: ${displayCommand(command)}`));
  console.log(`commit: git commit -m ${JSON.stringify(commitMessage(issue, type))}`);
  console.log(`revisión: git push y gh pr create (propuesta para revisión humana)`);
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const issue = readIssue(options);
  if (!Number.isInteger(Number(issue.number)) || Number(issue.number) <= 0 || !issue.title) {
    throw new Error("El issue necesita number positivo y title");
  }
  issue.number = Number(issue.number);

  if (options.dryRun) return dryRun(issue, options);

  // Environment: every live run starts from a clean, identifiable repository state.
  git(["rev-parse", "--show-toplevel"], { capture: true });
  assertClean();
  run({ command: "claude", args: ["--version"] });
  run({ command: "gh", args: ["auth", "status"] });
  assertRepository(options);

  const type = classifyIssue(issue);
  const branch = branchName(issue, type);
  const plan = planPath(issue, type);
  git(["fetch", "--prune", "origin", options.base]);
  const remoteBase = `origin/${options.base}`;
  const startingHead = git(["rev-parse", remoteBase], { capture: true });
  console.log(`Clasificación determinista: ${type}`);
  git(["switch", "--create", branch, "--no-track", remoteBase]);

  // Separate processes guarantee fresh contexts for planning and implementation.
  run(claudeCommand(planningPrompt({ issue, type, planPath: plan })));
  const afterPlanning = changedFiles();
  if (afterPlanning.length !== 1 || afterPlanning[0] !== plan || !fs.existsSync(plan)) {
    throw new Error(`El planificador solo puede crear ${plan}; cambios observados: ${afterPlanning.join(", ") || "ninguno"}`);
  }

  run(claudeCommand(implementationPrompt({ issue, planPath: plan }), "implementation"));
  if (git(["rev-parse", "HEAD"], { capture: true }) !== startingHead) {
    throw new Error("El agente creó un commit aunque tenía prohibido hacerlo; revisa la rama manualmente");
  }

  const files = changedFiles();
  if (!files.includes(plan)) throw new Error(`Falta el plan esperado: ${plan}`);
  if (files.every((file) => file === plan)) throw new Error("La implementación no produjo cambios además del plan; no se creará un commit");
  assertSafeToStage(files);

  // Review evidence: a PR proposes the result; these checks do not replace human review.
  if (!options.skipValidation) validationCommands().forEach((command) => run(command));
  git(["diff", "--check"]);
  git(["add", "--", ...files]);
  const staged = git(["diff", "--cached", "--name-only"], { capture: true }).split("\n").filter(Boolean);
  assertSafeToStage(staged);
  const stagedContentFiles = git(["diff", "--cached", "--name-only", "--diff-filter=ACMR"], { capture: true }).split("\n").filter(Boolean);
  assertNoStagedSecrets(stagedContentFiles);
  git(["diff", "--cached", "--check"]);
  if (spawnSync("git", ["diff", "--cached", "--quiet"]).status === 0) throw new Error("No hay cambios staged; se evita un commit vacío");

  const message = commitMessage(issue, type);
  git(["commit", "-m", message]);
  git(["push", "--set-upstream", "origin", branch]);

  const validationText = options.skipValidation
    ? "Validación omitida explícitamente; revisar antes de integrar."
    : validationCommands().map((command) => `- \`${displayCommand(command)}\``).join("\n");
  const body = [
    `Resuelve #${issue.number}.`,
    "",
    `Plan: \`${plan}\``,
    "",
    "## Validación ejecutada",
    validationText,
    "",
    "> Este PR es una propuesta para revisión; su existencia no garantiza que el cambio sea correcto.",
  ].join("\n");
  const prArgs = ["pr", "create", "--base", options.base, "--head", branch, "--title", message, "--body", body];
  if (options.repo) prArgs.push("--repo", options.repo);
  run({ command: "gh", args: prArgs });
  console.log(`Workflow completado para issue #${issue.number} en ${branch}`);
}

try {
  main();
} catch (error) {
  console.error(`ADW ERROR: ${error.message}`);
  console.error("El estado se conserva para inspección. Consulta adws/OPERATIONS.md para recuperar la ejecución.");
  process.exitCode = 1;
}

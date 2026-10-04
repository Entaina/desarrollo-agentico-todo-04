#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { canClaim, loadState, recoveryAction, saveState, setIssueStatus } from "../lib/state.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const workflow = path.join(here, "adw-plan-build.mjs");

function parseArgs(argv) {
  const options = { label: "adw:ready", interval: 20, once: false, dryRun: false, retryFailed: false, staleminutes: 120 };
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === "--once") options.once = true;
    else if (token === "--dry-run") options.dryRun = true;
    else if (token === "--retry-failed") options.retryFailed = true;
    else if (["--repo", "--label", "--interval", "--issues-file", "--stale-minutes"].includes(token)) {
      options[token.slice(2).replaceAll("-", "")] = argv[++index];
    } else throw new Error(`Argumento desconocido: ${token}`);
  }
  options.interval = Number(options.interval);
  options.staleMinutes = Number(options.staleminutes);
  if (!options.label || !Number.isFinite(options.interval) || options.interval < 5) throw new Error("--label no puede estar vacío y --interval debe ser >= 5");
  if (!Number.isFinite(options.staleMinutes) || options.staleMinutes < 5) throw new Error("--stale-minutes debe ser >= 5");
  if (options.dryRun && !options.issuesfile) throw new Error("--dry-run requiere --issues-file para no consultar GitHub");
  if (options.issuesfile && !options.dryRun) throw new Error("--issues-file solo se admite con --dry-run");
  return options;
}

function gh(args, { capture = false } = {}) {
  const result = spawnSync("gh", args, { encoding: "utf8", stdio: capture ? ["ignore", "pipe", "pipe"] : "inherit" });
  if (result.error) throw new Error(`No se pudo ejecutar gh: ${result.error.message}`);
  if (result.status !== 0) throw new Error(`gh terminó con código ${result.status}${capture ? `: ${result.stderr}` : ""}`);
  return capture ? result.stdout.trim() : "";
}

function issuesWithLabel(options, label) {
  if (options.issuesfile) return JSON.parse(fs.readFileSync(options.issuesfile, "utf8"));
  const args = ["issue", "list", "--state", "open", "--label", label, "--limit", "100", "--json", "number,title,body,url,labels"];
  if (options.repo) args.push("--repo", options.repo);
  return JSON.parse(gh(args, { capture: true }));
}

function issueLabels(issue) {
  return new Set((issue.labels ?? []).map((label) => String(typeof label === "string" ? label : label?.name ?? "").toLowerCase()));
}

function editLabels(issueNumber, { add = [], remove = [] }, options) {
  if (add.length === 0 && remove.length === 0) return;
  const args = ["issue", "edit", String(issueNumber)];
  for (const label of remove) args.push("--remove-label", label);
  for (const label of add) args.push("--add-label", label);
  if (options.repo) args.push("--repo", options.repo);
  gh(args);
}

function markFailed(issue, state, stateFile, options, message) {
  const key = String(issue.number);
  try {
    setIssueStatus(state, key, "failed", { title: issue.title, error: message });
    saveState(stateFile, state);
  } catch (stateError) {
    console.error(`No se pudo persistir el fallo: ${stateError.message}`);
  }
  try {
    const labels = issueLabels(issue);
    const remove = labels.has("adw:processing") ? ["adw:processing"] : [];
    const add = [options.label, "adw:failed"].filter((label) => !labels.has(label));
    editLabels(key, { remove, add }, options);
  } catch (labelError) {
    console.error(`No se pudieron reconciliar las labels de fallo: ${labelError.message}`);
  }
}

function recoverStale(state, stateFile, options) {
  if (options.dryRun) return;
  const candidates = new Map();
  for (const issue of [...issuesWithLabel(options, "adw:processing"), ...issuesWithLabel(options, options.label)]) {
    candidates.set(String(issue.number), issue);
  }
  for (const issue of candidates.values()) {
    const entry = state.issues[String(issue.number)];
    const labels = issueLabels(issue);
    const action = recoveryAction(entry, labels, options.staleMinutes);
    if (action === "reconcile-completed") {
      try {
        editLabels(issue.number, { remove: ["adw:processing"], add: ["adw:done"] }, options);
      } catch (error) {
        console.error(`Issue #${issue.number}: no se pudo reconciliar adw:done: ${error.message}`);
      }
    } else if (action === "fail-stale") {
      const message = `Ejecución running obsoleta (> ${options.staleMinutes} min); requiere revisión antes de retry`;
      markFailed(issue, state, stateFile, options, message);
      console.error(`Issue #${issue.number}: reconciliado como failed por estado obsoleto`);
    }
  }
}

function executeIssue(issue, state, stateFile, options) {
  const key = String(issue.number);
  if (!canClaim(state, key, { retryFailed: options.retryFailed })) {
    console.log(`Issue #${key}: omitido; estado=${state.issues[key].status}`);
    return;
  }
  if (options.dryRun) {
    console.log(`Issue #${key}: se reclamaría ${options.label} y se ejecutaría el workflow (sin efectos en dry-run)`);
    return;
  }

  const retryingFailed = state.issues[key]?.status === "failed";
  setIssueStatus(state, key, "running", { title: issue.title });
  saveState(stateFile, state);
  try {
    const claimRemove = retryingFailed ? [options.label, "adw:failed"] : [options.label];
    editLabels(key, { remove: claimRemove, add: ["adw:processing"] }, options);
    issue.labels = [...(issue.labels ?? []).filter((label) => !claimRemove.includes(String(typeof label === "string" ? label : label?.name ?? "").toLowerCase())), { name: "adw:processing" }];
    const issueDir = path.join(path.dirname(stateFile), "issues");
    fs.mkdirSync(issueDir, { recursive: true });
    const issueFile = path.join(issueDir, `${key}.json`);
    fs.writeFileSync(issueFile, `${JSON.stringify(issue, null, 2)}\n`, { mode: 0o600 });

    const args = [workflow, "--issue-file", issueFile];
    if (options.repo) args.push("--repo", options.repo);
    const result = spawnSync(process.execPath, args, { stdio: "inherit" });
    if (result.error || result.status !== 0) throw new Error(result.error?.message ?? `workflow terminó con código ${result.status}`);
  } catch (error) {
    markFailed(issue, state, stateFile, options, error.message);
    throw new Error(`Issue #${key}: ${error.message}`);
  }

  setIssueStatus(state, key, "completed", { title: issue.title });
  try {
    saveState(stateFile, state);
  } catch (error) {
    console.error(`Issue #${key}: workflow completado, pero no se pudo persistir completed: ${error.message}`);
  }
  try {
    editLabels(key, { remove: ["adw:processing"], add: ["adw:done"] }, options);
  } catch (error) {
    console.error(`Issue #${key}: workflow completado; queda pendiente reconciliar adw:done: ${error.message}`);
  }
}

function sleep(seconds) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, seconds * 1000);
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const stateDir = path.resolve(".adw-state");
  const stateFile = path.join(stateDir, "processed.json");
  const lockDir = path.join(stateDir, "trigger.lock");

  if (!options.dryRun) {
    fs.mkdirSync(stateDir, { recursive: true });
    try {
      fs.mkdirSync(lockDir);
    } catch (error) {
      if (error.code === "EEXIST") throw new Error(`Ya hay un trigger activo (${lockDir})`);
      throw error;
    }
  }

  try {
    do {
      const state = loadState(stateFile);
      recoverStale(state, stateFile, options);
      const issues = issuesWithLabel(options, options.label).sort((a, b) => Number(a.number) - Number(b.number));
      console.log(`Señal ${options.label}: ${issues.length} issue(s) candidato(s)`);
      for (const issue of issues) {
        try {
          executeIssue(issue, state, stateFile, options);
        } catch (error) {
          console.error(`TRIGGER ERROR: ${error.message}`);
          throw new Error("El ciclo se detuvo para no procesar más issues sobre un checkout potencialmente modificado");
        }
      }
      if (!options.once) sleep(options.interval);
    } while (!options.once);
  } finally {
    if (!options.dryRun) fs.rmSync(lockDir, { recursive: true, force: true });
  }
}

try {
  main();
} catch (error) {
  console.error(`TRIGGER ERROR: ${error.message}`);
  process.exitCode = 1;
}

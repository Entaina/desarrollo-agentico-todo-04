import fs from "node:fs";
import path from "node:path";

export function emptyState() {
  return { version: 1, issues: {} };
}

export function loadState(file) {
  if (!fs.existsSync(file)) return emptyState();
  const parsed = JSON.parse(fs.readFileSync(file, "utf8"));
  if (parsed.version !== 1 || typeof parsed.issues !== "object" || parsed.issues === null) {
    throw new Error(`Estado no válido: ${file}`);
  }
  return parsed;
}

export function canClaim(state, issueNumber, { retryFailed = false } = {}) {
  const previous = state.issues[String(issueNumber)]?.status;
  return previous === undefined || (previous === "failed" && retryFailed);
}

export function isStaleRunning(entry, staleMinutes, now = Date.now()) {
  if (entry?.status !== "running") return false;
  const updatedAt = Date.parse(entry.updatedAt);
  return Number.isFinite(updatedAt) && now - updatedAt >= staleMinutes * 60_000;
}

export function recoveryAction(entry, labels, staleMinutes, now = Date.now()) {
  const names = new Set(labels);
  if (entry?.status === "completed" && names.has("adw:processing")) return "reconcile-completed";
  if (isStaleRunning(entry, staleMinutes, now) && (names.has("adw:processing") || names.has("adw:ready"))) return "fail-stale";
  return null;
}

export function setIssueStatus(state, issueNumber, status, extra = {}) {
  if (!["running", "completed", "failed"].includes(status)) throw new Error(`Estado desconocido: ${status}`);
  state.issues[String(issueNumber)] = {
    status,
    updatedAt: new Date().toISOString(),
    ...extra,
  };
  return state;
}

export function saveState(file, state) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const temporary = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(temporary, `${JSON.stringify(state, null, 2)}\n`, { mode: 0o600 });
  fs.renameSync(temporary, file);
}

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { canClaim, emptyState, isStaleRunning, loadState, recoveryAction, saveState, setIssueStatus } from "../lib/state.mjs";

test("running and completed issues cannot be claimed twice", () => {
  const state = emptyState();
  assert.equal(canClaim(state, 12), true);
  setIssueStatus(state, 12, "running");
  assert.equal(canClaim(state, 12), false);
  setIssueStatus(state, 12, "completed");
  assert.equal(canClaim(state, 12), false);
});

test("failed issues require an explicit retry", () => {
  const state = emptyState();
  setIssueStatus(state, 7, "failed", { error: "test" });
  assert.equal(canClaim(state, 7), false);
  assert.equal(canClaim(state, 7, { retryFailed: true }), true);
});

test("a stale running state can be reconciled after the configured lease", () => {
  const entry = { status: "running", updatedAt: "2026-01-01T00:00:00.000Z" };
  assert.equal(isStaleRunning(entry, 120, Date.parse("2026-01-01T01:59:00.000Z")), false);
  assert.equal(isStaleRunning(entry, 120, Date.parse("2026-01-01T02:00:00.000Z")), true);
});

test("recovery covers a stale running issue before and after the processing label", () => {
  const entry = { status: "running", updatedAt: "2026-01-01T00:00:00.000Z" };
  const now = Date.parse("2026-01-01T02:00:00.000Z");
  assert.equal(recoveryAction(entry, ["adw:ready"], 120, now), "fail-stale");
  assert.equal(recoveryAction(entry, ["adw:processing"], 120, now), "fail-stale");
  assert.equal(recoveryAction({ status: "completed" }, ["adw:processing"], 120, now), "reconcile-completed");
});

test("state is persisted and loaded without external services", (t) => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "adw-state-"));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  const file = path.join(directory, "processed.json");
  const state = setIssueStatus(emptyState(), 3, "completed", { title: "Hecho" });
  saveState(file, state);
  assert.deepEqual(loadState(file), state);
});

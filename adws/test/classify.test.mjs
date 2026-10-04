import test from "node:test";
import assert from "node:assert/strict";
import { classifyIssue } from "../lib/classify.mjs";

test("an explicit ADW type label takes precedence over issue text", () => {
  const issue = { title: "Error al actualizar", body: "Parece roto", labels: [{ name: "adw:feature" }] };
  assert.equal(classifyIssue(issue), "feature");
});

test("contradictory type labels are rejected", () => {
  assert.throws(
    () => classifyIssue({ title: "Cambio", body: "", labels: ["adw:bug", "adw:feature"] }),
    /Labels de tipo contradictorias/,
  );
});

test("classification recognizes bug language without a type label", () => {
  assert.equal(classifyIssue({ title: "La tarea no funciona al reabrir", body: "", labels: [] }), "bug");
});

test("classification uses a stable maintenance fallback", () => {
  assert.equal(classifyIssue({ title: "Ajustes internos", body: "", labels: [] }), "chore");
});

import test from "node:test";
import assert from "node:assert/strict";
import { claudeCommand, displayCommand, implementationPrompt, planningPrompt, validationCommands } from "../lib/commands.mjs";
import { branchName, commitMessage, planPath, slugify } from "../lib/names.mjs";

const issue = { number: 24, title: "Añadir filtro: tareas completadas", body: "Criterios", url: "https://example.test/24" };

test("portable names are deterministic and remain in their namespaces", () => {
  assert.equal(slugify(issue.title), "anadir-filtro-tareas-completadas");
  assert.equal(branchName(issue, "feature"), "adw/feature-24-anadir-filtro-tareas-completadas");
  assert.equal(planPath(issue, "feature"), "plans/issue-24-feature-anadir-filtro-tareas-completadas.md");
});

test("issue types map to Conventional Commit types", () => {
  assert.equal(commitMessage(issue, "bug"), "fix: resuelve issue #24");
  assert.equal(commitMessage(issue, "chore"), "chore: resuelve issue #24");
  assert.equal(commitMessage(issue, "feature"), "feat: resuelve issue #24");
  assert.throws(() => commitMessage(issue, "unknown"), /Tipo de issue desconocido/);
});

test("planner and implementer use specialized commands in separate invocations", () => {
  const plan = planPath(issue, "feature");
  const planner = claudeCommand(planningPrompt({ issue, type: "feature", planPath: plan }));
  const implementer = claudeCommand(implementationPrompt({ issue, planPath: plan }), "implementation");
  assert.equal(planner.command, "claude");
  assert.match(planner.args.at(-1), /^\/feature\n/);
  assert.match(planner.args.at(-1), /entrada no confiable/);
  assert.match(planner.args.at(-1), new RegExp(plan));
  assert.match(implementer.args.at(-1), /^\/implement /);
  assert.ok(planner.args.includes("Read,Grep,Glob,Write,Edit"));
  assert.ok(planner.args.includes("Bash,WebFetch,WebSearch"));
  const mcpConfigIndex = planner.args.indexOf("--mcp-config");
  assert.equal(planner.args[mcpConfigIndex + 1], '{"mcpServers":{}}');
  assert.equal(planner.args[mcpConfigIndex + 2], "--");
  assert.match(implementer.args.find((arg) => arg.includes("Bash(go test")), /Bash\(git diff \*\)/);
  assert.ok(implementer.args.includes("WebFetch,WebSearch"));
  assert.notDeepEqual(planner.args, implementer.args);
});

test("review commands match tools declared by this Go repository", () => {
  assert.deepEqual(validationCommands(), [
    { command: "soda", args: ["migrate", "-e", "test"] },
    { command: "go", args: ["test", "-p", "1", "./..."], env: { GO_ENV: "test" } },
    { command: "go", args: ["vet", "./..."] },
    { command: "go", args: ["build", "./..."] },
  ]);
  assert.equal(displayCommand(validationCommands()[1]), "GO_ENV=test go test -p 1 ./...");
});

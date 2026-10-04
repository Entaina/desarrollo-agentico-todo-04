import test from "node:test";
import assert from "node:assert/strict";
import { sanitizedAgentEnv, secretFindings } from "../lib/security.mjs";

test("the staged-content scanner recognizes representative credentials", () => {
  assert.deepEqual(secretFindings("token = ghp_abcdefghijklmnopqrstuvwxyz123456"), ["GitHub token"]);
  assert.deepEqual(secretFindings("-----BEGIN PRIVATE KEY-----"), ["private key"]);
  assert.deepEqual(secretFindings("ordinary application code"), []);
});

test("the agent environment omits host credentials", () => {
  const sanitized = sanitizedAgentEnv({ PATH: "/bin", HOME: "/tmp/home", GH_TOKEN: "secret", DATABASE_PASSWORD: "secret" });
  assert.deepEqual(sanitized, { PATH: "/bin", HOME: "/tmp/home" });
});

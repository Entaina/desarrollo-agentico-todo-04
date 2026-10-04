const TYPE_LABELS = new Map([
  ["adw:bug", "bug"],
  ["bug", "bug"],
  ["type:bug", "bug"],
  ["adw:feature", "feature"],
  ["feature", "feature"],
  ["enhancement", "feature"],
  ["type:feature", "feature"],
  ["adw:chore", "chore"],
  ["chore", "chore"],
  ["maintenance", "chore"],
  ["dependencies", "chore"],
  ["type:chore", "chore"],
]);

const KEYWORDS = {
  bug: ["bug", "error", "falla", "fallo", "roto", "broken", "incorrect", "regresión", "regression", "no funciona"],
  feature: ["feature", "funcionalidad", "añadir", "agregar", "add ", "permitir", "soportar", "support", "implementar"],
  chore: ["chore", "mantenimiento", "actualizar", "upgrade", "dependencia", "dependency", "configurar", "configuración", "documentar", "ci"],
};

function labelName(label) {
  return String(typeof label === "string" ? label : label?.name ?? "").trim().toLowerCase();
}

/** Classify an issue deterministically. Explicit type labels take precedence. */
export function classifyIssue(issue) {
  const labels = (issue.labels ?? []).map(labelName);
  const labeledTypes = new Set(labels.map((label) => TYPE_LABELS.get(label)).filter(Boolean));
  if (labeledTypes.size > 1) {
    throw new Error(`Labels de tipo contradictorias: ${[...labeledTypes].sort().join(", ")}`);
  }
  if (labeledTypes.size === 1) return [...labeledTypes][0];

  const text = `${issue.title ?? ""}\n${issue.body ?? ""}`.toLowerCase();
  const scores = Object.fromEntries(
    Object.entries(KEYWORDS).map(([type, words]) => [type, words.reduce((score, word) => score + (text.includes(word) ? 1 : 0), 0)]),
  );
  const bestScore = Math.max(...Object.values(scores));
  if (bestScore === 0) return "chore";

  // Stable tie breaking favors a defect, then a new capability, then maintenance.
  return ["bug", "feature", "chore"].find((type) => scores[type] === bestScore);
}

export const ISSUE_TYPES = Object.freeze(["bug", "chore", "feature"]);

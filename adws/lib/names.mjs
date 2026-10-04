export function slugify(value, maxLength = 48) {
  const normalized = String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, maxLength)
    .replace(/-+$/g, "");
  return normalized || "issue";
}

export function branchName(issue, type) {
  return `adw/${type}-${Number(issue.number)}-${slugify(issue.title)}`;
}

export function planPath(issue, type) {
  return `plans/issue-${Number(issue.number)}-${type}-${slugify(issue.title)}.md`;
}

const COMMIT_TYPES = Object.freeze({ bug: "fix", chore: "chore", feature: "feat" });

export function commitMessage(issue, type) {
  const commitType = COMMIT_TYPES[type];
  if (!commitType) throw new Error(`Tipo de issue desconocido: ${type}`);
  return `${commitType}: resuelve issue #${Number(issue.number)}`;
}

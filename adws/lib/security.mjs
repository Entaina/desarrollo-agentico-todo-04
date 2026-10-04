const SECRET_PATTERNS = [
  ["private key", /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/i],
  ["GitHub token", /\bgh[pousr]_[A-Za-z0-9_]{20,}\b/],
  ["AWS access key", /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/],
  ["bearer token", /\bBearer\s+[A-Za-z0-9._~+\/-]{20,}={0,2}\b/i],
  ["credential assignment", /\b(?:api[_-]?key|access[_-]?token|client[_-]?secret|password)\s*[:=]\s*["']?[A-Za-z0-9._~+\/-]{16,}/i],
];

export function secretFindings(text) {
  return SECRET_PATTERNS.filter(([, pattern]) => pattern.test(text)).map(([name]) => name);
}

export function sanitizedAgentEnv(env = process.env) {
  const blocked = /(?:^|_)(?:TOKEN|SECRET|PASSWORD|PASSWD|API_KEY|ACCESS_KEY)(?:$|_)/i;
  return Object.fromEntries(Object.entries(env).filter(([name]) => !blocked.test(name) && !/^(?:GH|GITHUB|AWS|AZURE|GOOGLE)_/i.test(name)));
}

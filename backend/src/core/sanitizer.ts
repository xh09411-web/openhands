const ALLOWED_COMMANDS = new Set([
  'ls', 'cd', 'pwd', 'cat', 'echo', 'mkdir', 'rm', 'cp', 'mv', 'grep', 'find',
  'npm', 'node', 'python3', 'pip3', 'git', 'docker', 'docker-compose', 'n8n',
  'ollama', 'curl', 'wget', 'tail', 'head', 'wc', 'sort', 'uniq', 'sed', 'awk',
  'tar', 'zip', 'unzip', 'chmod', 'chown', 'systemctl', 'journalctl'
]);

export function sanitizeCommand(cmd: string): string {
  // 移除可能的危險字符（; | & && || ` $ ( )）
  const dangerousPattern = /[;&|`$()]/g;
  if (dangerousPattern.test(cmd)) {
    throw new Error('Command contains forbidden characters');
  }

  const parts = cmd.trim().split(/\s+/);
  const baseCmd = parts[0];
  if (!ALLOWED_COMMANDS.has(baseCmd)) {
    throw new Error(`Command "${baseCmd}" is not allowed`);
  }

  // 將每個參數用單引號包裹（避免注入），但保留變數如 ${} 等，需額外檢查
  const sanitizedParts = parts.map((part, index) => {
    if (index === 0) return part;
    // 若參數包含 '$' 或變數符號，跳過包裹（保留環境變數展開）
    if (/\$/.test(part)) return part;
    return `'${part.replace(/'/g, "'\\''")}'`;
  });

  return sanitizedParts.join(' ');
}

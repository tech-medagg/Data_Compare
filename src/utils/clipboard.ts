export function parseClipboard(text: string): string[][] {
  const lines = text.replace(/\r\n?/g, '\n').split('\n');
  if (lines.at(-1) === '') lines.pop();
  return lines.map(line => line.split('\t'));
}
export function isBlank(row: string[]): boolean { return row.every(cell => cell.trim() === ''); }

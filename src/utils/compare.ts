import type { Dataset, Settings, Results, DuplicateEntry, Row } from '../types';
import { isBlank } from './clipboard';
const normalize = (value: string, s: Settings) => { let v = s.trim ? value.trim() : value; if (!s.caseSensitive) v = v.toLocaleLowerCase(); return v; };
function key(row: Row, cols: number[], s: Settings): string { return JSON.stringify(cols.map(i => normalize(row[i] ?? '', s))); }
function usable(row: Row, s: Settings) { return !(s.ignoreBlank && isBlank(row)); }
function selectedColumns(d: Dataset, s: Settings, side: 'a'|'b'): number[] { if (s.mode === 'entire') return d.headers.map((_, i) => i); if (s.mode === 'key') return [side === 'a' ? s.keyA : s.keyB]; const selected = side === 'a' ? s.columnsA : s.columnsB; return selected.length ? selected : d.headers.map((_, i) => i); }
export function findDuplicates(d: Dataset, s: Settings, side: 'a'|'b' = 'a'): DuplicateEntry[] {
  const map = new Map<string, number[]>(), cols = selectedColumns(d, s, side);
  d.rows.forEach((row, i) => { if (usable(row, s)) { const k = key(row, cols, s), bucket = map.get(k); if (bucket) bucket.push(i); else map.set(k, [i]); } });
  const out: DuplicateEntry[] = []; map.forEach(ix => { if (ix.length > 1) ix.slice(1).forEach(i => out.push({ firstRow: ix[0] + 1, duplicateRow: i + 1, values: d.rows[i], occurrences: ix.length })); }); return out;
}
export function compareDatasets(a: Dataset, b: Dataset, s: Settings): Results {
  const out: Results = { duplicatesA: findDuplicates(a, s, 'a'), duplicatesB: findDuplicates(b, s, 'b'), common: [], onlyA: [], onlyB: [] };
  const colsA = selectedColumns(a, s, 'a'), colsB = selectedColumns(b, s, 'b'), indexB = new Map<string, number[]>();
  b.rows.forEach((row, i) => { if (usable(row, s)) { const k = key(row, colsB, s), bucket = indexB.get(k); if (bucket) bucket.push(i); else indexB.set(k, [i]); } });
  const used = new Set<number>();
  a.rows.forEach((row, i) => { if (!usable(row, s)) return; const matches = indexB.get(key(row, colsA, s)) ?? []; const avail = s.oneToOne ? matches.filter(j => !used.has(j)).slice(0, 1) : matches; if (!avail.length) out.onlyA.push({ row: i + 1, values: row }); else avail.forEach(j => { used.add(j); out.common.push({ aRow: i + 1, bRow: j + 1, a: row, b: b.rows[j], type: s.oneToOne ? 'One-to-one' : 'All occurrences' }); }); });
  b.rows.forEach((row, i) => { if (usable(row, s) && !used.has(i)) out.onlyB.push({ row: i + 1, values: row }); }); return out;
}

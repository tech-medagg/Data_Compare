import { describe, expect, it } from 'vitest';
import { compareDatasets, findDuplicates } from './compare';
import { parseClipboard } from './clipboard';
import type { Dataset, Settings } from '../types';
const settings: Settings = { mode: 'entire', columnsA: [], columnsB: [], keyA: 0, keyB: 0, caseSensitive: false, trim: true, ignoreBlank: true, oneToOne: false };
const ds = (headers: string[], rows: string[][]): Dataset => ({ name: '', headers, rows });
describe('comparison engine', () => {
  it('finds repeated rows and reports first and repeated row numbers', () => { expect(findDuplicates(ds(['id'], [['01'], ['02'], ['01']]), settings)).toEqual([{ firstRow: 1, duplicateRow: 3, values: ['01'], occurrences: 2 }]); });
  it('finds common and unmatched rows without relying on row positions', () => { const r = compareDatasets(ds(['id'], [['x'], ['y']]), ds(['id'], [['y'], ['z']]), settings); expect(r.common.map(x => [x.aRow, x.bRow])).toEqual([[2, 1]]); expect(r.onlyA[0].values).toEqual(['x']); expect(r.onlyB[0].values).toEqual(['z']); });
  it('handles case and surrounding whitespace normalization', () => { expect(compareDatasets(ds(['v'], [[' Åda ']]), ds(['v'], [['åDA']]), settings).common).toHaveLength(1); });
  it('matches explicit key columns despite other field differences', () => { const s = { ...settings, mode: 'key' as const, keyA: 1, keyB: 1 }; expect(compareDatasets(ds(['name','id'], [['A','007']]), ds(['name','code'], [['B','007']]), s).common).toHaveLength(1); });
  it('does not compare blank rows and parses Excel TSV into a rectangle', () => { expect(parseClipboard('A\tB\r\n1\t2\r\n')).toEqual([['A','B'],['1','2']]); expect(compareDatasets(ds(['v'], [['']]), ds(['v'], [['']]), settings).common).toHaveLength(0); });
  it('supports composite keys and all repeated occurrences', () => { const s = { ...settings, mode: 'selected' as const, columnsA: [0,1] }; expect(compareDatasets(ds(['a','b'], [['x','y']]), ds(['a','b'], [['x','z'],['x','y'],['x','y']]), s).common).toHaveLength(2); });
  it('uses mapped columns independently for composite keys', () => { const s={...settings,mode:'selected' as const,columnsA:[0,1],columnsB:[1,0]}; expect(compareDatasets(ds(['name','id'],[['Zoë','004']]),ds(['id','name'],[['004','Zoë']]),s).common).toHaveLength(1); });
  it('uses one-to-one mode without discarding unpaired duplicate occurrences', () => { const s={...settings,mode:'key' as const,keyA:0,keyB:0,oneToOne:true}; const r=compareDatasets(ds(['id'],[['x'],['x']]),ds(['id'],[['x']]),s); expect(r.common).toHaveLength(1);expect(r.onlyA).toHaveLength(1); });
  it('preserves Unicode, special characters, and leading zeros', () => { const r=compareDatasets(ds(['id','name'],[['0007','李 雷 /+']]),ds(['id','name'],[['0007','李 雷 /+']]),settings); expect(r.common).toHaveLength(1); });
  it('handles empty datasets', () => { const r=compareDatasets(ds(['id'],[]),ds(['id'],[]),settings);expect(r.common).toHaveLength(0);expect(r.onlyA).toHaveLength(0); });
  it('matches all combinations for repeated keys in both datasets', () => { const s={...settings,mode:'key' as const,keyA:0,keyB:0};const r=compareDatasets(ds(['id'],[['a'],['a']]),ds(['id'],[['a'],['a'],['a']]),s);expect(r.common).toHaveLength(6); });
});

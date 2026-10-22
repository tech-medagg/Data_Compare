export type Row = string[];
export interface Dataset { name: string; headers: string[]; rows: Row[] }
export type Mode = 'entire' | 'selected' | 'key';
export interface Settings { mode: Mode; columnsA: number[]; columnsB: number[]; keyA: number; keyB: number; caseSensitive: boolean; trim: boolean; ignoreBlank: boolean; oneToOne: boolean }
export interface DuplicateEntry { firstRow: number; duplicateRow: number; values: Row; occurrences: number }
export interface Pair { aRow: number; bRow: number; a: Row; b: Row; type: string }
export interface Unmatched { row: number; values: Row }
export interface Results { duplicatesA: DuplicateEntry[]; duplicatesB: DuplicateEntry[]; common: Pair[]; onlyA: Unmatched[]; onlyB: Unmatched[] }

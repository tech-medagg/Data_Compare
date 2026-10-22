# Data compare

A browser-only React application for comparing pasted or imported spreadsheet data.

## Architecture

```text
React app (src/App.tsx)
├── DatasetPanel — two independent editable grids, clipboard paste, file import
├── Comparison settings — full row, mapped columns, key mapping, normalization
├── Results workspace — summaries, searchable/paged result tables, exports
└── Pure utilities
    ├── utils/clipboard.ts — Excel TSV clipboard parsing and blank-row handling
    └── utils/compare.ts — stable JSON keys, duplicate detection, hash-indexed matching
```

`types.ts` defines the shared dataset, settings, and result models. React owns the current datasets and settings; the comparison functions receive immutable snapshots and return result records with source row numbers. SheetJS reads `.xlsx`, `.xls`, and `.csv` files locally in the browser and writes CSV/XLSX reports. No server or database is used.

## Run

```bash
npm install
npm run dev
```

## Verify

```bash
npm run build
npm test
```

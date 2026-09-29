import { describe, expect, it } from 'vitest';
import { detectProfitFile, parseOrderEvents, parsePerformance, reconcile } from '../src/index.js';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const fixture = (name: string) => readFileSync(resolve(process.cwd(), '../../', name));
describe('Profit importer', () => {
  it('detects and parses the daily performance report', () => {
    const csv = fixture('relatorio_profit_dia.csv');
    expect(detectProfitFile(csv)).toBe('performance');
    expect(parsePerformance(csv)).toHaveLength(3);
  });
  it('reads Trade events from the order list and reconciles partials', () => {
    const operations = parsePerformance(fixture('relatorio_profit_dia.csv'));
    const events = parseOrderEvents(fixture('lista_ordens_dia.csv'));
    expect(events.length).toBeGreaterThan(0);
    expect(reconcile(operations, events)[2].executions).toHaveLength(3);
  });
});

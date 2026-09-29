import { describe, expect, it } from 'vitest';
import { calculateOperation } from '../src/index.js';

describe('calculateOperation', () => {
  it('calculates a WIN operation with partial exits and costs', () => {
    const result = calculateOperation([
      { side: 'BUY', quantity: 2, price: 100000, executedAt: new Date('2026-01-01T09:00:00') },
      { side: 'SELL', quantity: 1, price: 100100, executedAt: new Date('2026-01-01T09:01:00') },
      { side: 'SELL', quantity: 1, price: 100200, executedAt: new Date('2026-01-01T09:02:00') }
    ], 'WIN', { entryPerContract: 0.25, exitPerContract: 0.25 });
    expect(result).toMatchObject({ gross: 60, costs: 1, net: 59, reversed: false, openQuantity: 0 });
  });
});

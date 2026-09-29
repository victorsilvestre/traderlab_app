export type AssetFamily = 'WIN' | 'IND' | 'WDO' | 'DOL';
export type ExecutionSide = 'BUY' | 'SELL';

export type Execution = {
  id?: string;
  side: ExecutionSide;
  quantity: number;
  price: number;
  executedAt: Date;
};

export type CostRule = {
  entryPerContract: number;
  exitPerContract: number;
};

export const B3_ASSET_FAMILIES: Record<AssetFamily, { pointValue: number }> = {
  WIN: { pointValue: 0.2 },
  IND: { pointValue: 1 },
  WDO: { pointValue: 10 },
  DOL: { pointValue: 50 }
};

export function assetFamilyFromTicker(ticker: string): AssetFamily | null {
  const normalized = ticker.trim().toUpperCase();
  if (normalized.startsWith('WIN')) return 'WIN';
  if (normalized.startsWith('IND')) return 'IND';
  if (normalized.startsWith('WDO')) return 'WDO';
  if (normalized.startsWith('DOL')) return 'DOL';
  return null;
}

export function calculateOperation(executions: Execution[], family: AssetFamily, costRule: CostRule) {
  let position = 0;
  let weightedEntry = 0;
  let gross = 0;
  let entryContracts = 0;
  let exitContracts = 0;
  let reversed = false;
  const pointValue = B3_ASSET_FAMILIES[family].pointValue;

  for (const execution of [...executions].sort((a, b) => a.executedAt.getTime() - b.executedAt.getTime())) {
    const signedQty = execution.side === 'BUY' ? execution.quantity : -execution.quantity;
    if (position === 0 || Math.sign(position) === Math.sign(signedQty)) {
      const previousAbs = Math.abs(position);
      weightedEntry = (weightedEntry * previousAbs + execution.price * execution.quantity) / (previousAbs + execution.quantity);
      position += signedQty;
      entryContracts += execution.quantity;
      continue;
    }
    const closing = Math.min(Math.abs(position), execution.quantity);
    gross += (execution.price - weightedEntry) * closing * Math.sign(position) * pointValue;
    position += signedQty;
    exitContracts += closing;
    if (Math.abs(signedQty) > closing) reversed = true;
    if (position === 0) weightedEntry = 0;
    if (reversed) break;
  }
  const costs = entryContracts * costRule.entryPerContract + exitContracts * costRule.exitPerContract;
  return { gross: Number(gross.toFixed(2)), costs: Number(costs.toFixed(2)), net: Number((gross - costs).toFixed(2)), reversed, openQuantity: Math.abs(position) };
}


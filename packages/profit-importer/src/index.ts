import { assetFamilyFromTicker, type AssetFamily, type Execution, type ExecutionSide } from '@traderlab/domain';
import { createHash } from 'node:crypto';

export type ProfitFileKind = 'performance' | 'orders' | 'unknown';
export type ImportedOperation = {
  externalNumber?: string;
  ticker: string;
  family: AssetFamily | null;
  openedAt: Date;
  closedAt?: Date;
  direction: ExecutionSide;
  buyQuantity: number;
  sellQuantity: number;
  buyPrice?: number;
  sellPrice?: number;
  grossResult?: number;
  source: 'performance';
  raw: Record<string, string>;
};
export type ImportedOrderEvent = Execution & { ticker: string; accountNumber?: string; orderId?: string; event: 'TRADE' | 'CANCEL' };

type ProfitInput = string | Uint8Array;
// Profit CSVs are commonly exported as Windows-1252/ANSI. Keeping bytes until
// this boundary prevents accented column names from becoming replacement chars.
const toText = (input: ProfitInput) => typeof input === 'string' ? input : new TextDecoder('windows-1252').decode(input);
const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toUpperCase();
const parseBrazilianNumber = (value?: string) => {
  if (!value || value.trim() === '-' || value.trim() === '') return undefined;
  const parsed = Number(value.trim().replace(/\./g, '').replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : undefined;
};
const parseDate = (value?: string) => {
  if (!value) return undefined;
  const match = value.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})(?:\s+(\d{2}):(\d{2}):(\d{2}))?$/);
  if (!match) return undefined;
  const [, day, month, year, hour = '00', minute = '00', second = '00'] = match;
  return new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}-03:00`);
};
const rows = (input: ProfitInput) => toText(input).replace(/^\uFEFF/, '').split(/\r?\n/).filter(Boolean).map((line) => line.split(';'));
const valueAt = (header: string[], row: string[], aliases: string[]) => {
  const index = header.findIndex((cell) => aliases.includes(normalize(cell)));
  return index === -1 ? undefined : row[index]?.trim();
};

export function fingerprint(content: ProfitInput) { return createHash('sha256').update(content).digest('hex'); }

export function detectProfitFile(content: ProfitInput): ProfitFileKind {
  const header = toText(content).split(/\r?\n/).find((line) => line.includes('Ativo') && (line.includes('Abertura') || line.includes('ClOrdID')));
  if (!header) return 'unknown';
  if (header.includes('ClOrdID')) return 'orders';
  if (header.includes('Abertura')) return 'performance';
  return 'unknown';
}

export function parsePerformance(content: ProfitInput): ImportedOperation[] {
  const allRows = rows(content);
  const headerIndex = allRows.findIndex((row) => row.some((cell) => normalize(cell) === 'ATIVO') && row.some((cell) => normalize(cell) === 'ABERTURA'));
  if (headerIndex < 0) throw new Error('Cabeçalho do Relatório de Performance não encontrado.');
  const header = allRows[headerIndex];
  return allRows.slice(headerIndex + 1).flatMap((row) => {
    const ticker = valueAt(header, row, ['ATIVO']);
    const openedAt = parseDate(valueAt(header, row, ['ABERTURA']));
    if (!ticker || !openedAt) return [];
    const raw = Object.fromEntries(header.map((name, index) => [name, row[index] ?? '']));
    const side = valueAt(header, row, ['LADO']) === 'V' ? 'SELL' : 'BUY';
    return [{
      externalNumber: valueAt(header, row, ['NUMERO OPERACAO']),
      ticker,
      family: assetFamilyFromTicker(ticker),
      openedAt,
      closedAt: parseDate(valueAt(header, row, ['FECHAMENTO'])),
      direction: side,
      buyQuantity: parseBrazilianNumber(valueAt(header, row, ['QTD COMPRA'])) ?? 0,
      sellQuantity: parseBrazilianNumber(valueAt(header, row, ['QTD VENDA'])) ?? 0,
      buyPrice: parseBrazilianNumber(valueAt(header, row, ['PRECO COMPRA'])),
      sellPrice: parseBrazilianNumber(valueAt(header, row, ['PRECO VENDA'])),
      grossResult: parseBrazilianNumber(valueAt(header, row, ['RES. OPERACAO'])),
      source: 'performance', raw
    }];
  });
}

export function parseOrderEvents(content: ProfitInput): ImportedOrderEvent[] {
  const allRows = rows(content);
  const headerIndex = allRows.findIndex((row) => row.some((cell) => normalize(cell) === 'CLORDID'));
  if (headerIndex < 0) throw new Error('Cabeçalho da Lista de Ordens não encontrado.');
  const header = allRows[headerIndex];
  let current: Record<string, string> | undefined;
  const events: ImportedOrderEvent[] = [];
  for (const row of allRows.slice(headerIndex + 1)) {
    const mapped = Object.fromEntries(header.map((name, index) => [normalize(name), row[index]?.trim() ?? '']));
    if (mapped.CLORDID) current = mapped;
    const event = normalize(mapped.STATUS ?? '');
    if (!current || (event !== 'TRADE' && event !== 'CANCEL')) continue;
    const price = parseBrazilianNumber(mapped['PRECO MEDIO'] || mapped.PRECO);
    const quantity = parseBrazilianNumber(mapped['QTD EXECUTADA'] || mapped.QTD);
    // Continuation rows place the event timestamp under "Criação" while
    // parent order rows use "Última Atualização".
    const executedAt = parseDate(mapped['ULTIMA ATUALIZACAO'] || mapped['CRIACAO']);
    if (!price || !quantity || !executedAt) continue;
    events.push({
      ticker: current.ATIVO,
      accountNumber: current.CONTA,
      orderId: current.CLORDID,
      event: event as 'TRADE' | 'CANCEL',
      side: current.LADO === 'V' ? 'SELL' : 'BUY',
      price, quantity, executedAt
    });
  }
  return events;
}

export function reconcile(operations: ImportedOperation[], events: ImportedOrderEvent[]) {
  return operations.map((operation) => ({
    ...operation,
    executions: events.filter((event) => event.event === 'TRADE' && event.ticker === operation.ticker && event.executedAt >= operation.openedAt && (!operation.closedAt || event.executedAt <= operation.closedAt))
  }));
}

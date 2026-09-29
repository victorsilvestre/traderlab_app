import { z } from 'zod';

export const accountSchema = z.object({ name: z.string().min(1), broker: z.string().min(1), accountNumber: z.string().min(1).optional(), mode: z.enum(['REAL', 'SIMULATED']) });
export const costRuleSchema = z.object({ assetFamily: z.enum(['WIN', 'IND', 'WDO', 'DOL']), entryPerContract: z.number().min(0), exitPerContract: z.number().min(0) });
export const executionSchema = z.object({ side: z.enum(['BUY', 'SELL']), quantity: z.number().positive(), price: z.number().positive(), executedAt: z.string().datetime() });
export const manualOperationSchema = z.object({ accountId: z.string().min(1), ticker: z.string().min(3), executions: z.array(executionSchema).min(2), scalpIncluded: z.boolean().default(false), note: z.string().max(5000).optional() });
export const customFieldSchema = z.object({ name: z.string().min(1), kind: z.enum(['BOOLEAN', 'TEXT', 'SINGLE_SELECT', 'NUMBER', 'DATE']), options: z.array(z.string().min(1)).default([]), order: z.number().int().nonnegative().default(0) });
export const tagCategorySchema = z.object({ name: z.string().min(1), color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#2563eb'), tags: z.array(z.string().min(1)).default([]) });


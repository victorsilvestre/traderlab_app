import Fastify from 'fastify';
import cors from '@fastify/cors';
import { accountSchema, costRuleSchema, customFieldSchema, manualOperationSchema, tagCategorySchema } from '@traderlab/contracts';
import { assetFamilyFromTicker, calculateOperation, type CostRule } from '@traderlab/domain';
import { detectProfitFile, fingerprint, parseOrderEvents, parsePerformance, reconcile } from '@traderlab/profit-importer';

const app = Fastify({ logger: true });
await app.register(cors, { origin: true });

type Account = { id: string; name: string; broker: string; accountNumber?: string; mode: 'REAL' | 'SIMULATED' };
const accounts: Account[] = [];
const costRules = new Map<string, CostRule>();
const imports = new Map<string, { fingerprint: string; status: string; operations: unknown[] }>();
const fields: unknown[] = [{ id: 'tds-scalp', name: 'Scalp na operação', kind: 'BOOLEAN', official: true, archived: false }];
const categories: unknown[] = [{ id: 'tds-placeholder', name: 'TDS — placeholder', color: '#7c3aed', official: true, tags: ['A definir'], archived: false }];

const id = () => crypto.randomUUID();
const defaultCost = (accountId: string, family: string) => costRules.get(`${accountId}:${family}`) ?? { entryPerContract: 0, exitPerContract: 0 };

app.get('/health', async () => ({ ok: true, mode: process.env.DATABASE_URL ? 'supabase-configured' : 'demo-memory' }));
app.get('/v1/accounts', async () => accounts);
app.post('/v1/accounts', async (request, reply) => {
  const body = accountSchema.parse(request.body);
  const account = { id: id(), ...body };
  accounts.push(account);
  return reply.code(201).send(account);
});
app.post('/v1/accounts/:accountId/cost-rules', async (request, reply) => {
  const account = accounts.find((item) => item.id === (request.params as { accountId: string }).accountId);
  if (!account) return reply.code(404).send({ message: 'Conta não encontrada.' });
  const body = costRuleSchema.parse(request.body);
  costRules.set(`${account.id}:${body.assetFamily}`, { entryPerContract: body.entryPerContract, exitPerContract: body.exitPerContract });
  return reply.code(201).send(body);
});
app.post('/v1/operations/manual', async (request, reply) => {
  const body = manualOperationSchema.parse(request.body);
  const family = assetFamilyFromTicker(body.ticker);
  if (!family) return reply.code(422).send({ message: 'Ativo ainda não suportado.' });
  const result = calculateOperation(body.executions.map((item) => ({ ...item, executedAt: new Date(item.executedAt) })), family, defaultCost(body.accountId, family));
  return reply.code(201).send({ id: id(), ...body, family, result, status: result.reversed ? 'SPLIT_REQUIRED' : 'CONFIRMED' });
});
app.get('/v1/classifications', async () => ({ fields, categories }));
app.post('/v1/classifications/fields', async (request, reply) => { const field = { id: id(), ...customFieldSchema.parse(request.body), official: false, archived: false }; fields.push(field); return reply.code(201).send(field); });
app.post('/v1/classifications/categories', async (request, reply) => { const category = { id: id(), ...tagCategorySchema.parse(request.body), official: false, archived: false }; categories.push(category); return reply.code(201).send(category); });
app.post('/v1/imports/preview', async (request, reply) => {
  const body = request.body as { files?: { name: string; content?: string; contentBase64?: string }[] };
  if (!body.files?.length) return reply.code(400).send({ message: 'Envie ao menos um arquivo CSV.' });
  const batchId = id();
  let performance = [] as ReturnType<typeof parsePerformance>;
  let orderEvents = [] as ReturnType<typeof parseOrderEvents>;
  const diagnostics: unknown[] = [];
  for (const file of body.files) {
    const content = file.contentBase64 ? Buffer.from(file.contentBase64, 'base64') : file.content ?? '';
    const hash = fingerprint(content);
    if ([...imports.values()].some((item) => item.fingerprint === hash)) return reply.code(409).send({ message: 'Este arquivo já foi importado.', file: file.name });
    const kind = detectProfitFile(content);
    diagnostics.push({ file: file.name, kind, fingerprint: hash });
    if (kind === 'performance') performance.push(...parsePerformance(content));
    if (kind === 'orders') orderEvents.push(...parseOrderEvents(content));
  }
  const operations = reconcile(performance, orderEvents);
  imports.set(batchId, { fingerprint: fingerprint(JSON.stringify(body.files.map((file) => file.contentBase64 ?? file.content))), status: 'READY_FOR_REVIEW', operations });
  return reply.code(201).send({ id: batchId, status: 'READY_FOR_REVIEW', diagnostics, operations });
});
app.get('/v1/imports/:id', async (request, reply) => { const item = imports.get((request.params as { id: string }).id); return item ? item : reply.code(404).send({ message: 'Lote não encontrado.' }); });

await app.listen({ port: Number(process.env.API_PORT ?? 3333), host: '0.0.0.0' });

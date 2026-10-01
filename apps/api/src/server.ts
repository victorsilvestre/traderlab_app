import Fastify from 'fastify';

const app = Fastify({ logger: true });
const port = Number(process.env.API_PORT ?? 3333);

app.get('/health', async () => ({ status: 'ok' }));

try {
  await app.listen({ host: '0.0.0.0', port });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}

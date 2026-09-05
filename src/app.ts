import { Hono, type Context, type Next } from 'hono';
import type { RuntimeConfig } from './config.js';
import { createDemoPurchaseHandler } from './routes/demo.js';
import { createResearchHandler } from './routes/research.js';
import { ResearchService } from './services/research.js';
import { APP_SCRIPT } from './web/app-script.js';
import { renderPage } from './web/page.js';
import { STYLES } from './web/styles.js';
import { createX402Middleware } from './x402/config.js';

export interface AppOptions {
  fetchImpl?: typeof fetch;
}

export function createApp(config: RuntimeConfig, options: AppOptions = {}) {
  const app = new Hono();
  const researchService = new ResearchService(
    config.networkName,
    Number(config.usdcAssetId),
    config.price,
  );

  app.get('/', (c: Context) => c.html(renderPage(config)));
  app.get('/assets/styles.css', (c: Context) =>
    c.body(STYLES, 200, { 'Content-Type': 'text/css; charset=utf-8' }),
  );
  app.get('/assets/app.js', (c: Context) =>
    c.body(APP_SCRIPT, 200, { 'Content-Type': 'text/javascript; charset=utf-8' }),
  );
  app.get('/health', (c: Context) => c.json({ status: 'ok', service: 'researchpay-agent' }));
  app.post('/demo/purchase', createDemoPurchaseHandler(config));

  // Reject malformed input before x402 so callers are never charged for an invalid request.
  const validateTopic = async (c: Context, next: Next) => {
    const rawTopic = c.req.query('topic') || c.req.param('topic');
    const topic = rawTopic ? decodeURIComponent(rawTopic).trim() : '';

    if (!topic || topic.length < 2 || topic.length > 100) {
      return c.json(
        {
          error: 'invalid_topic',
          message: 'Topic parameter must be between 2 and 100 characters long.',
        },
        400,
      );
    }
    await next();
  };

  app.use('/api/research', validateTopic);
  app.use('/api/research/:topic', validateTopic);

  app.use(createX402Middleware(config));

  const researchHandler = createResearchHandler(researchService);
  app.get('/api/research', researchHandler);
  app.get('/api/research/:topic', researchHandler);

  app.notFound((c: Context) => c.json({ error: 'not_found', message: 'Route not found.' }, 404));
  app.onError((error: Error, c: Context) => {
    console.error(error);
    const message = error.message.toLowerCase();
    if (
      message.includes('facilitator') ||
      message.includes('payment') ||
      message.includes('settle') ||
      message.includes('verify') ||
      message.includes('fetch')
    ) {
      return c.json(
        {
          error: 'payment_service_unavailable',
          message:
            'x402 payment processing is unavailable. Check FACILITATOR_URL, network compatibility, and facilitator status.',
        },
        503,
      );
    }
    return c.json({ error: 'internal_error', message: 'The paid research resource could not complete the request.' }, 500);
  });
  return app;
}

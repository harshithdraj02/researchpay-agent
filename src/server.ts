import 'dotenv/config';
import { serve } from '@hono/node-server';
import { createApp } from './app.js';
import { loadConfig } from './config.js';

try {
  const config = loadConfig();
  const app = createApp(config);

  serve({ fetch: app.fetch, port: config.port }, info => {
    console.log(`ResearchPay Agent running on http://localhost:${info.port}`);
    console.log('Health endpoint: /health');
    console.log('Protected endpoint: /api/research?topic=NVIDIA');
    console.log(`Payment network: Algorand ${config.networkName}`);
  });
} catch (error) {
  console.error(`ResearchPay Agent could not start: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}

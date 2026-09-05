import 'dotenv/config';

const baseUrl = (process.env.API_BASE_URL ?? 'http://localhost:3000').replace(/\/$/, '');
const topic = process.env.RESEARCH_TOPIC ?? 'algorand-agentic-commerce';

const health = await fetch(`${baseUrl}/health`);
if (!health.ok) throw new Error(`/health returned HTTP ${health.status}`);
console.log('✓ /health returned 200');

const protectedRes = await fetch(`${baseUrl}/api/research/${encodeURIComponent(topic)}`);
if (protectedRes.status !== 402) throw new Error(`Protected route returned HTTP ${protectedRes.status}, expected 402`);
console.log('✓ protected paid endpoint returned 402 without payment');

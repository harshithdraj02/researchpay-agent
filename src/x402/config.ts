import { ExactAvmScheme } from '@x402/avm/exact/server';
import { HTTPFacilitatorClient } from '@x402/core/server';
import type { ResourceServerExtension } from '@x402/core/types';
import { paymentMiddleware, x402ResourceServer } from '@x402/hono';
import { bazaarResourceServerExtension, declareDiscoveryExtension } from '@x402-avm/extensions';
import type { RuntimeConfig } from '../config.js';

export const RESEARCH_DESCRIPTION =
  'Generates structured AI research intelligence reports paid via x402 micro-USDC on Algorand TestNet.';

export function createX402Middleware(config: RuntimeConfig) {
  const facilitator = new HTTPFacilitatorClient({ url: config.facilitatorUrl });
  const server = new x402ResourceServer(facilitator);
  server.register(config.network, new ExactAvmScheme());
  server.registerExtension(bazaarResourceServerExtension as unknown as ResourceServerExtension);

  const discovery = declareDiscoveryExtension({
    input: {
      topic: 'NVIDIA',
    },
    inputSchema: {
      properties: {
        topic: {
          type: 'string',
          description: 'Research topic or query parameter (e.g. NVIDIA, Algorand)',
          minLength: 2,
          maxLength: 100,
        },
      },
      required: ['topic'],
    },
    output: {
      example: {
        topic: 'NVIDIA',
        query: 'nvidia',
        timestamp: '2026-09-04T15:30:00.000Z',
        status: 'completed',
        report: {
          title: 'Research Intelligence: NVIDIA',
          executiveSummary: 'Automated AI research synthesis on NVIDIA.',
          keyFindings: [
            'x402 protocol enables sub-second HTTP 402 authorization and micropayment settlement for AI workloads.',
          ],
          sentiment: {
            score: 0.95,
            label: 'Bullish / Strong Growth',
            marketConfidence: 'High',
          },
          dataPoints: {
            chainNetwork: 'Algorand testnet',
            usdcAssetId: 10458941,
            settlementSpeedSec: 3.3,
            protocolVersion: 'x402 v2 (AVM Exact Scheme)',
          },
          citations: ['https://docs.x402.org'],
        },
        settlement: {
          verified: true,
          paidWith: 'USDC (ASA 10458941)',
          price: '$0.01',
        },
      },
    },
  });

  const routeConfig = {
    accepts: [
      {
        scheme: 'exact',
        price: config.price,
        network: config.network,
        payTo: config.payTo,
        extra: {
          asset: config.usdcAssetId,
          ...(config.challengeMode ? { tag: 'x402-global-challenge' } : {}),
        },
      },
    ],
    description: RESEARCH_DESCRIPTION,
    mimeType: 'application/json',
    extensions: discovery,
  };

  return paymentMiddleware(
    {
      'GET /api/research': routeConfig,
      'GET /api/research/:topic': routeConfig,
    },
    server,
  );
}

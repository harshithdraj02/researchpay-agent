import 'dotenv/config';
import { HTTPFacilitatorClient } from '@x402/core/server';
import { withBazaar, type DiscoveryResource } from '@x402-avm/extensions';
import {
  createPayingClient,
  explainPaymentError,
  resourceUrl,
} from './lib.js';

async function discoverPaidResource(facilitatorUrl: string): Promise<DiscoveryResource | undefined> {
  const facilitator = new HTTPFacilitatorClient({ url: facilitatorUrl });
  const bazaar = withBazaar(
    facilitator as unknown as Parameters<typeof withBazaar>[0],
  );
  const limit = 50;
  for (let offset = 0; ; offset += limit) {
    const page = await bazaar.extensions.discovery.listResources({ type: 'http', limit, offset });
    const match = page.items.find(item => {
      const searchable = `${item.resource} ${JSON.stringify(item.metadata ?? {})}`.toLowerCase();
      return searchable.includes('researchpay-agent') || searchable.includes('research intelligence') || searchable.includes('research');
    });
    if (match || offset + page.items.length >= page.pagination.total) return match;
  }
}

async function main() {
  const facilitatorUrl = process.env.FACILITATOR_URL ?? 'https://facilitator.goplausible.xyz';
  const mode = process.env.AGENT_DISCOVERY ?? 'direct';
  let url: string;

  if (mode === 'bazaar') {
    console.log('Agent: searching the GoPlausible Bazaar for ResearchPay Agent paid resource...');
    const discovered = await discoverPaidResource(facilitatorUrl);
    if (!discovered) {
      throw new Error(
        'ResearchPay Agent is not currently indexed in Bazaar. A public endpoint and a successful settlement are required before discovery can be claimed.',
      );
    }
    url = discovered.resource;
    console.log(`Agent: discovered ${url}`);
    console.log(`Agent: ${discovered.accepts.length} payment option(s) advertised.`);
  } else if (mode === 'direct') {
    url = resourceUrl();
    console.log('Agent mode: known resource URL (Bazaar discovery is not being claimed).');
    console.log(`Agent: selected ${url}`);
  } else {
    throw new Error('AGENT_DISCOVERY must be either "direct" or "bazaar".');
  }

  const payer = createPayingClient();
  console.log('Agent: purchasing research report with x402...');
  const response = await payer.fetchWithPayment(url);
  if (!response.ok) throw new Error(`Purchase failed with HTTP ${response.status}: ${await response.text()}`);

  const settlement = payer.httpClient.getPaymentSettleResponse(name => response.headers.get(name));
  if (!settlement.success) throw new Error('The response arrived without a confirmed settlement receipt.');

  console.log(`Agent: settlement confirmed in transaction ${settlement.transaction}`);
  console.log('Agent: consuming paid research report...');
  console.log(JSON.stringify(await response.json(), null, 2));
}

main().catch(error => {
  console.error(`\nAgent demo failed: ${explainPaymentError(error)}`);
  process.exit(1);
});

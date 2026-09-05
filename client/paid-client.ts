import 'dotenv/config';
import {
  createPayingClient,
  enforceSpendingPolicy,
  explainPaymentError,
  readPaymentRequired,
  resourceUrl,
} from './lib.js';

async function main() {
  const url = resourceUrl();
  const payer = createPayingClient();

  console.log('Requesting ResearchPay Agent...');
  const unpaid = await fetch(url);
  if (unpaid.status !== 402) {
    throw new Error(`Expected payment challenge (HTTP 402), but received HTTP ${unpaid.status}.`);
  }

  const requirement = readPaymentRequired(unpaid);
  console.log('\n402 Payment Required');
  if (requirement) {
    console.log(`Price: ${requirement.price} USDC`);
    console.log(`Network: ${requirement.network}`);
    enforceSpendingPolicy(requirement);
  }

  console.log(`Payer: ${payer.signer.address}`);
  console.log('Preparing and signing payment with local wallet...');
  console.log('Submitting paid request...');

  const response = await payer.fetchWithPayment(url);
  if (!response.ok) {
    throw new Error(`Paid request returned HTTP ${response.status}: ${await response.text()}`);
  }

  const settlement = payer.httpClient.getPaymentSettleResponse(name => response.headers.get(name));
  if (!settlement.success) {
    throw new Error(`The resource responded, but settlement was not confirmed: ${JSON.stringify(settlement)}`);
  }

  console.log('\n✓ Payment accepted and settlement confirmed');
  console.log('✓ Research report unlocked');
  console.log(`Transaction ID: ${settlement.transaction}`);
  const explorerNetwork = payer.network.name === 'testnet' ? 'testnet.' : '';
  console.log(`Explorer: https://${explorerNetwork}explorer.perawallet.app/tx/${settlement.transaction}`);
  console.log('\nPaid research report:');
  console.log(JSON.stringify(await response.json(), null, 2));
}

main().catch(error => {
  console.error(`\nPaid client failed: ${explainPaymentError(error)}`);
  process.exit(1);
});

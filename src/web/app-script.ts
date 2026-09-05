export const APP_SCRIPT = String.raw`
const form = document.querySelector('#purchase-form');
const button = document.querySelector('#purchase-button');
const input = document.querySelector('#research-topic');
const statusText = document.querySelector('#activity-status');
const message = document.querySelector('#activity-message');
const result = document.querySelector('#result');
const stepNames = ['challenge', 'terms', 'agent', 'settlement', 'report'];

function stepElement(name) {
  return document.querySelector('[data-step="' + name + '"]');
}

function resetSteps() {
  for (const name of stepNames) stepElement(name).className = '';
  result.hidden = true;
}

function setStep(name, state, text) {
  stepElement(name).className = state;
  if (text) message.textContent = text;
  statusText.textContent = state === 'failed' ? 'Needs attention' : state === 'done' ? 'In progress' : 'Working';
}

function decodePaymentRequired(value) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized + '='.repeat((4 - normalized.length % 4) % 4);
  return JSON.parse(atob(padded));
}

function formatPrice(requirement) {
  const decimals = requirement.extra?.decimals ?? 6;
  return '$' + (Number(requirement.amount) / 10 ** decimals) + ' USDC';
}

function renderResult(data) {
  const report = data.report;
  document.querySelector('#metric-topic').textContent = report.topic;
  document.querySelector('#metric-sentiment').textContent = report.report.sentiment.label;
  document.querySelector('#metric-network').textContent = report.report.dataPoints.chainNetwork;
  document.querySelector('#metric-asa').textContent = 'ASA ' + report.report.dataPoints.usdcAssetId;

  const citations = report.report.citations || [];
  const citationsHtml = citations.length > 0
    ? '<div style="margin-top: 16px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.1); font-size: 13px;">' +
      '<strong style="color: #94a3b8; display: block; margin-bottom: 6px;">DATA SOURCES & CITATIONS (' + (report.report.dataPoints.source || 'Live Engine') + '):</strong>' +
      citations.map(c => '<a href="' + c + '" target="_blank" rel="noreferrer" style="color: #10b981; display: inline-block; margin-right: 14px; text-decoration: underline;">' + c + ' ↗</a>').join('') +
      '</div>'
    : '';

  const summaryHtml = '<p style="margin-bottom: 12px; font-size: 15px; line-height: 1.6; color: #f8fafc;">' + report.report.executiveSummary + '</p>' +
    '<strong style="color: #94a3b8; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 8px;">Key Research Findings:</strong>' +
    '<ul style="margin: 0; padding-left: 20px; color: #cbd5e1;">' + report.report.keyFindings.map(f => '<li style="margin-bottom: 6px; line-height: 1.5;">' + f + '</li>').join('') + '</ul>' +
    citationsHtml;

  document.querySelector('#report-summary').innerHTML = summaryHtml;
  document.querySelector('#transaction-id').textContent = data.payment.transaction;
  document.querySelector('#explorer-link').href = data.payment.explorer;
  result.hidden = false;
  result.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

form.addEventListener('submit', async event => {
  event.preventDefault();
  resetSteps();
  button.disabled = true;
  const topic = input.value.trim();

  try {
    setStep('challenge', 'active', 'Requesting live AI research for "' + topic + '"...');
    const challenge = await fetch('/api/research?topic=' + encodeURIComponent(topic));
    if (challenge.status !== 402) {
      const detail = await challenge.json().catch(() => ({}));
      throw new Error(detail.message || 'Expected HTTP 402, received ' + challenge.status + '.');
    }
    setStep('challenge', 'done', 'ResearchPay Agent responded with HTTP 402 Payment Required.');

    setStep('terms', 'active', 'Reading payment terms ($0.01 USDC) & evaluating spending policy...');
    const header = challenge.headers.get('payment-required');
    if (!header) throw new Error('The 402 response did not include PAYMENT-REQUIRED header.');
    const paymentRequired = decodePaymentRequired(header);
    const requirement = paymentRequired.accepts?.[0];
    if (!requirement) throw new Error('No supported payment requirement was advertised.');
    const priceText = formatPrice(requirement);
    document.querySelector('#term-price').textContent = priceText;
    setStep('terms', 'done', 'Payment terms accepted: ' + priceText + ' on Algorand TestNet.');

    setStep('agent', 'active', 'Buyer wallet constructing & signing $0.01 USDC payment transaction...');
    const paid = await fetch('/demo/purchase', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ topic }),
    });
    const data = await paid.json().catch(() => ({}));
    if (!paid.ok) throw new Error(data.message || 'The payment failed with HTTP ' + paid.status + '.');
    setStep('agent', 'done', 'Buyer wallet signed payment transaction.');
    setStep('settlement', 'done', 'GoPlausible settled transaction on Algorand TestNet!');
    setStep('report', 'done', 'Payment confirmed! Live research report for "' + topic + '" unlocked.');
    statusText.textContent = 'Complete';
    renderResult(data);
  } catch (error) {
    const active = document.querySelector('.steps li.active');
    if (active) active.className = 'failed';
    statusText.textContent = 'Failed';
    message.textContent = error instanceof Error ? error.message : String(error);
  } finally {
    button.disabled = false;
  }
});
`;

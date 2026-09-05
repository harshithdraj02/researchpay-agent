import type { RuntimeConfig } from '../config.js';

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export function renderPage(config: RuntimeConfig): string {
  const receiver = escapeHtml(config.payTo);
  const demoState = config.demoMode ? 'Agent ready' : 'Live x402 endpoint';
  const defaultTopic = 'NVIDIA';

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content="Purchase AI research intelligence reports with x402 and TestNet USDC on Algorand." />
    <title>ResearchPay Agent — Paid AI Research API for Autonomous Agents</title>
    <link rel="stylesheet" href="/assets/styles.css" />
    <script src="/assets/app.js" defer></script>
  </head>
  <body>
    <div class="noise" aria-hidden="true"></div>
    <header class="site-header">
      <a class="brand" href="/" aria-label="ResearchPay Agent home">
        <span class="brand-mark">R</span>
        <span>ResearchPay Agent</span>
      </a>
      <div class="header-status">
        <span class="status-dot"></span>
        <span>Algorand ${escapeHtml(config.networkName)}</span>
        <span class="header-divider"></span>
        <span>${demoState}</span>
      </div>
    </header>

    <main>
      <section class="hero">
        <p class="eyebrow">AUTONOMOUS AGENTIC COMMERCE · ALGORAND TESTNET</p>
        <h1>ResearchPay Agent<br /><span>Pay-per-query AI research</span></h1>
        <p class="hero-copy">
          Autonomous research agent paying for specialized AI research reports using x402 HTTP status codes and sub-second USDC settlement on Algorand TestNet.
        </p>
      </section>

      <section class="workspace" aria-label="ResearchPay Agent UI">
        <div class="demo-panel">
          <div class="panel-heading">
            <div>
              <p class="section-label">AGENTIC RESEARCH WORKSPACE</p>
              <h2>Query AI Research Report</h2>
            </div>
            <span class="testnet-pill">ALGORAND TESTNET</span>
          </div>

          <form id="purchase-form">
            <label for="research-topic">Research Topic</label>
            <div class="input-row">
              <input
                id="research-topic"
                name="topic"
                value="${defaultTopic}"
                maxlength="100"
                spellcheck="false"
                autocomplete="off"
                required
              />
              <button id="purchase-button" type="submit">
                <span>Research</span>
                <span class="button-arrow" aria-hidden="true">↗</span>
              </button>
            </div>
          </form>

          <div class="terms" aria-label="Agent Spending Policy & Budget">
            <div><span>Starting Budget</span><strong>$1.00 USDC</strong></div>
            <div><span>Request Cost</span><strong id="term-price">${escapeHtml(config.price)} USDC</strong></div>
            <div><span>Remaining</span><strong id="budget-remaining">$0.99 USDC</strong></div>
            <div><span>Receiver</span><strong title="${receiver}">${receiver.slice(0, 7)}…${receiver.slice(-5)}</strong></div>
          </div>

          <div class="activity" aria-live="polite">
            <div class="activity-topline">
              <span>TIMELINE & SETTLEMENT LOG</span>
              <span id="activity-status">Ready</span>
            </div>
            <ol class="steps">
              <li data-step="challenge"><span class="step-icon">1</span><div><strong>Requesting research</strong><small>GET /api/research?topic=${defaultTopic}</small></div></li>
              <li data-step="terms"><span class="step-icon">2</span><div><strong>Payment required</strong><small>HTTP 402 Payment Required received</small></div></li>
              <li data-step="agent"><span class="step-icon">3</span><div><strong>Payment signed</strong><small>Buyer wallet constructs & signs transaction</small></div></li>
              <li data-step="settlement"><span class="step-icon">4</span><div><strong>Payment settled</strong><small>GoPlausible facilitator settles on Algorand</small></div></li>
              <li data-step="report"><span class="step-icon">5</span><div><strong>Research received</strong><small>Unlocked structured AI intelligence report</small></div></li>
            </ol>
            <p id="activity-message" class="activity-message">Enter a research topic and click Research to initiate the agent flow.</p>
          </div>
        </div>

        <aside class="explainer">
          <p class="section-label">PROTOCOL INVARIANTS</p>
          <h2>Instant. Verifiable. On-chain.</h2>
          <p>The protected research API enforces HTTP 402 Payment Required. Autonomous agents evaluate spending policies before signing and settling micro-USDC payments.</p>
          <div class="flow-list">
            <div><span>01</span><p><strong>Discover Terms</strong><small>HTTP 402 challenge header</small></p></div>
            <div><span>02</span><p><strong>Authorize Payment</strong><small>AVM Exact Scheme ($0.01 USDC)</small></p></div>
            <div><span>03</span><p><strong>On-Chain Finality</strong><small>Algorand 3.3s block settlement</small></p></div>
          </div>
          <div class="safety-note">
            <span aria-hidden="true">◇</span>
            <p><strong>Security Policy</strong><br />Buyer mnemonic is stored safely in local .env. Receiver address requires no private key on server.</p>
          </div>
        </aside>
      </section>

      <section id="result" class="result" hidden>
        <div class="result-heading">
          <div>
            <p class="section-label success-label">ALGORAND SETTLEMENT CONFIRMED</p>
            <h2>Research Intelligence Output</h2>
          </div>
          <a id="explorer-link" class="explorer-link" href="#" target="_blank" rel="noreferrer">View Real Transaction on Pera Explorer ↗</a>
        </div>
        <div class="metrics">
          <article><span>Topic</span><strong id="metric-topic">—</strong></article>
          <article><span>Sentiment</span><strong id="metric-sentiment">—</strong></article>
          <article><span>Network</span><strong id="metric-network">—</strong></article>
          <article><span>USDC ASA ID</span><strong id="metric-asa">—</strong></article>
        </div>
        <div class="result-bottom">
          <div><span>EXECUTIVE SUMMARY & FINDINGS</span><div id="report-summary">—</div></div>
          <div><span>TRANSACTION ID</span><code id="transaction-id">—</code></div>
        </div>
      </section>
    </main>

    <footer>
      <span>ResearchPay Agent MVP / x402 Algorand Commerce</span>
      <span>HTTP 402 → USDC ASA 10458941 → Algorand TestNet → Research JSON</span>
    </footer>
  </body>
</html>`;
}

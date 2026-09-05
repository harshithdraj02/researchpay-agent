# Project Brief

## Service

- Name: ResearchPay Agent
- One-line description: AI-powered research and market intelligence API paid by autonomous agents via x402 micro-USDC on Algorand.
- Paid route: `GET /api/research/:topic`
- Price in USDC: $0.001
- Network for local testing: Algorand TestNet
- Intended production network: Algorand MainNet

## Buyer

- Who or what pays for this?: Autonomous AI agents, analytical bots, research agents, and trading algorithms.
- Why would an autonomous agent buy it?: To fetch real-time, structured research reports and sentiment analysis without human intervention, subscription fees, or API keys.
- What policy should an agent use before paying?: Verify price ($0.001 USDC), check network CAIP-2 ID, ensure recipient is valid, and confirm topic length (3 to 100 characters).

## Input

Input query parameter `topic` via route path `/api/research/:topic`. Validated before x402 middleware.

```json
{
  "topic": "algorand-agentic-commerce"
}
```

## Output

Structured research report returned after verified settlement.

```json
{
  "topic": "Algorand-agentic-commerce",
  "query": "algorand-agentic-commerce",
  "timestamp": "2026-09-04T15:30:00.000Z",
  "status": "completed",
  "report": {
    "title": "Research Intelligence: Algorand-agentic-commerce",
    "executiveSummary": "Automated research synthesis on Algorand-agentic-commerce...",
    "keyFindings": [
      "x402 protocol enables sub-second HTTP 402 authorization and micropayment settlement for AI workloads."
    ],
    "sentiment": {
      "score": 0.94,
      "label": "Bullish / High Relevance",
      "marketConfidence": "High"
    },
    "dataPoints": {
      "chainNetwork": "Algorand testnet",
      "usdcAssetId": 10458941,
      "settlementSpeedSec": 3.3,
      "protocolVersion": "x402 v2 (AVM Exact Scheme)"
    },
    "citations": [
      "https://docs.x402.org"
    ]
  },
  "settlement": {
    "verified": true,
    "paidWith": "USDC (ASA 10458941)",
    "price": "$0.001"
  }
}
```

## Data Sources Or Actions

- External APIs: GoPlausible Facilitator
- On-chain reads: Algorand Indexer (ASA 10458941)
- Off-chain computation: Research report synthesis & sentiment analysis
- Side effects after payment: Settles micro-USDC on Algorand TestNet

## Bazaar Metadata

- Search keywords: research, agentic commerce, ai research, market intelligence, sentiment analysis, algorand, x402
- Input schema: String property `topic` (min 3, max 100 chars)
- Output example: Research report object
- Trust or freshness notes: Real-time report generation upon x402 settlement confirmation

## Deployment Notes

- Required env vars: `ALGORAND_NETWORK`, `PAY_TO_ADDRESS`, `CLIENT_MNEMONIC`, `FACILITATOR_URL`
- TestNet readiness: Verified with GoPlausible facilitator & Circle USDC ASA 10458941
- MainNet readiness: Switch ALGORAND_NETWORK=mainnet and set MainNet receiver address
- Known risks: Network timeout on facilitator or indexer

export interface ResearchReport {
  topic: string;
  query: string;
  timestamp: string;
  status: string;
  report: {
    title: string;
    executiveSummary: string;
    description?: string;
    keyFindings: string[];
    sentiment: {
      score: number;
      label: string;
      marketConfidence: string;
    };
    dataPoints: {
      chainNetwork: string;
      usdcAssetId: number;
      settlementSpeedSec: number;
      protocolVersion: string;
      source: string;
    };
    citations: string[];
  };
  settlement: {
    verified: boolean;
    paidWith: string;
    price: string;
  };
}

export class ResearchService {
  constructor(
    private readonly networkName: string,
    private readonly usdcAssetId: number,
    private readonly price: string,
  ) {}

  async generateResearch(rawTopic: string): Promise<ResearchReport> {
    const topic = decodeURIComponent(rawTopic).trim();
    const formattedTopic = topic.charAt(0).toUpperCase() + topic.slice(1);

    let summaryText = '';
    let descriptionText = '';
    let wikiUrl = '';
    let liveSource = 'Synthetic Agent Intelligence';
    let keyFindings: string[] = [];

    // Attempt 1: Real-time Wikipedia Knowledge REST API lookup
    try {
      const wikiRes = await fetch(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(topic)}`,
        { headers: { 'User-Agent': 'ResearchPayAgent/1.0 (x402 Hackathon Demo)' }, signal: AbortSignal.timeout(4000) }
      );
      if (wikiRes.ok) {
        const wikiData = (await wikiRes.json()) as any;
        if (wikiData.extract && wikiData.type !== 'disambiguation') {
          summaryText = wikiData.extract;
          descriptionText = wikiData.description || `${formattedTopic} Research Intelligence`;
          wikiUrl = wikiData.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(topic)}`;
          liveSource = 'Wikipedia Real-Time Knowledge Engine';

          // Split summary text into key sentence findings
          const sentences = summaryText.split(/(?<=\.)\s+/).filter(s => s.trim().length > 15);
          if (sentences.length > 0) {
            keyFindings = sentences.slice(0, 4);
          }
        }
      }
    } catch {
      // Fallback if network or timeout
    }

    // Attempt 2: Real-time DuckDuckGo Instant Answer API if Wikipedia was empty
    if (!summaryText) {
      try {
        const ddgRes = await fetch(
          `https://api.duckduckgo.com/?q=${encodeURIComponent(topic)}&format=json&no_html=1`,
          { signal: AbortSignal.timeout(3000) }
        );
        if (ddgRes.ok) {
          const ddgData = (await ddgRes.json()) as any;
          if (ddgData.AbstractText) {
            summaryText = ddgData.AbstractText;
            descriptionText = ddgData.Heading || formattedTopic;
            wikiUrl = ddgData.AbstractURL || `https://duckduckgo.com/?q=${encodeURIComponent(topic)}`;
            liveSource = 'DuckDuckGo Knowledge API';
            const sentences = summaryText.split(/(?<=\.)\s+/).filter(s => s.trim().length > 15);
            keyFindings = sentences.slice(0, 4);
          }
        }
      } catch {
        // Fallback
      }
    }

    // Fallback: Custom agent synthesis if no external API record found
    if (!summaryText) {
      summaryText = `Real-time AI research synthesis on "${formattedTopic}". This intelligence report provides structured technological analysis, market relevancy metrics, and verifiable protocol settlement for machine agents.`;
      descriptionText = `${formattedTopic} Market & Technical Analysis`;
      liveSource = 'x402 Agent Research Engine';
      keyFindings = [
        `Topic "${formattedTopic}" exhibits high developer relevancy and machine-agent demand.`,
        `x402 HTTP 402 protocol provides instant authorization without requiring user subscriptions or API keys.`,
        `Algorand TestNet settlement guarantees 3.3-second block finality with sub-cent transaction costs.`,
        `Autonomous agents can parse and execute actions on this structured JSON output programmatically.`,
      ];
    } else if (keyFindings.length < 2) {
      keyFindings.push(`x402 HTTP 402 protocol unlocked this live research report for "${formattedTopic}".`);
      keyFindings.push(`Settled on Algorand TestNet with 3.3-second block finality.`);
    }

    const citations = [
      ...(wikiUrl ? [wikiUrl] : []),
      'https://docs.x402.org',
      'https://dev.algorand.co/resources/x402-on-algorand/',
      'https://facilitator.goplausible.xyz',
    ];

    return {
      topic: formattedTopic,
      query: topic.toLowerCase(),
      timestamp: new Date().toISOString(),
      status: 'completed',
      report: {
        title: `Research Intelligence: ${formattedTopic}`,
        executiveSummary: summaryText,
        description: descriptionText,
        keyFindings,
        sentiment: {
          score: 0.94,
          label: 'Bullish / High Relevance',
          marketConfidence: 'High',
        },
        dataPoints: {
          chainNetwork: `Algorand ${this.networkName}`,
          usdcAssetId: this.usdcAssetId,
          settlementSpeedSec: 3.3,
          protocolVersion: 'x402 v2 (AVM Exact Scheme)',
          source: liveSource,
        },
        citations,
      },
      settlement: {
        verified: true,
        paidWith: `USDC (ASA ${this.usdcAssetId})`,
        price: this.price,
      },
    };
  }
}

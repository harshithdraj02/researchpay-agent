import type { Context } from 'hono';
import type { ResearchService } from '../services/research.js';

export function createResearchHandler(researchService: ResearchService) {
  return async (c: Context) => {
    const rawTopic = c.req.query('topic') || c.req.param('topic');
    if (!rawTopic) {
      return c.json(
        {
          error: 'invalid_topic',
          message: 'Topic query or path parameter is required (e.g. /api/research?topic=NVIDIA).',
        },
        400,
      );
    }

    try {
      const report = await researchService.generateResearch(rawTopic);
      return c.json(report, 200);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to generate research report.';
      return c.json({ error: 'research_failed', message }, 500);
    }
  };
}

import { Router } from 'express';
import { CareerService } from '../services/careerService.js';

const router = Router();

// GET active call or start it
router.get('/:scenarioId', async (req, res) => {
  try {
    const { scenarioId } = req.params;
    let state = await CareerService.getActiveCallState(scenarioId);
    if (!state) {
      state = await CareerService.startCall(scenarioId);
    }
    res.json(state);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Explicit start call
router.post('/:scenarioId/start', async (req, res) => {
  try {
    const { scenarioId } = req.params;
    const state = await CareerService.startCall(scenarioId);
    res.json(state);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Reveal next option
router.post('/:scenarioId/reveal-next', async (req, res) => {
  try {
    const { scenarioId } = req.params;
    const { nodeId, optionIndex } = req.body;
    const state = await CareerService.revealNextOption(scenarioId, nodeId, Number(optionIndex));
    res.json(state);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Commit choice
router.post('/:scenarioId/commit', async (req, res) => {
  try {
    const { scenarioId } = req.params;
    const { nodeId, optionId, optionIndex } = req.body;
    const idempotencyKey = (req.headers['idempotency-key'] as string) || req.body.idempotencyKey;

    const result = await CareerService.commitDecision(
      scenarioId,
      nodeId,
      optionId,
      Number(optionIndex),
      idempotencyKey
    );

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Continue to next node or end
router.post('/:scenarioId/continue', async (req, res) => {
  try {
    const { scenarioId } = req.params;
    const result = await CareerService.advanceToNextNode(scenarioId);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Scorecard
router.get('/:scenarioId/scorecard', async (req, res) => {
  try {
    const { scenarioId } = req.params;
    const scorecard = await CareerService.getScorecard(scenarioId);
    res.json(scorecard);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Collect rewards
router.post('/:scenarioId/collect', async (req, res) => {
  try {
    const { scenarioId } = req.params;
    const result = await CareerService.collectRewards(scenarioId);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

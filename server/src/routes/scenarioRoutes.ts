import { Router } from 'express';
import { CareerService } from '../services/careerService.js';
import { ContentService } from '../services/contentService.js';

const router = Router();

router.get('/', (req, res) => {
  try {
    const scenarios = CareerService.getAvailableScenarios();
    res.json(scenarios);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', (req, res) => {
  try {
    const scenario = ContentService.getScenario(req.params.id);
    res.json(scenario);
  } catch (err: any) {
    res.status(404).json({ error: `Scenario ${req.params.id} not found` });
  }
});

export default router;

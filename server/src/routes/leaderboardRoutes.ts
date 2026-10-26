import { Router } from 'express';
import { CareerService } from '../services/careerService.js';

const router = Router();

router.get('/', (req, res) => {
  try {
    const period = (req.query.period as string) || 'weekly';
    const rows = CareerService.getLeaderboard(period);
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/opt-in', (req, res) => {
  try {
    const { optIn } = req.body;
    const result = CareerService.setLeaderboardOptIn(Boolean(optIn));
    res.json({ optIn: result });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/kudos', (req, res) => {
  try {
    const { handle, type } = req.body;
    const result = CareerService.sendKudos(handle, type);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;

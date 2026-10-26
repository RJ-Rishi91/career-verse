import { Router } from 'express';
import { CareerService } from '../services/careerService.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const career = await CareerService.getCareerState();
    res.json(career);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/greeting', (req, res) => {
  try {
    const rawVal = req.query.time ?? req.query.hour;
    const timeOverride = rawVal !== undefined && rawVal !== null && rawVal !== '' ? Number(rawVal) : null;
    const greeting = CareerService.getGreeting(timeOverride);
    res.json(greeting);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/reset', async (req, res) => {
  try {
    const career = await CareerService.resetCareer();
    res.json(career);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

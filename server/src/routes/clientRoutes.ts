import { Router } from 'express';
import { CareerService } from '../services/careerService.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const clients = await CareerService.getClients();
    res.json(clients);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const client = await CareerService.getClientById(id);
    if (!client) {
      res.status(404).json({ error: `Client ${id} not found` });
      return;
    }
    res.json(client);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

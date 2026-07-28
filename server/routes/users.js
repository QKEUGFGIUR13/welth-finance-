import { Router } from "express";
import { ensureUser } from "../middleware/auth.js";

const router = Router();

router.post("/ensure", async (req, res) => {
  try {
    const user = await ensureUser(req.auth.userId);
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

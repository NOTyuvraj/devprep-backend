import express from "express";
import { add, getAll, getDue, review, stats } from "../controllers/problem.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", authMiddleware, add);
router.get("/", authMiddleware, getAll);
router.get("/due", authMiddleware, getDue);
router.get("/stats", authMiddleware, stats);
router.patch("/:id/review", authMiddleware, review);

export default router;